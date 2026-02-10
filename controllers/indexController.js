import bcrypt from "bcryptjs";
import { body, validationResult, matchedData } from "express-validator";
import prisma from "../lib/prisma.js";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import multer from 'multer';
import cloudinary from "../lib/cloudinary.js";

const emailErr = "must be a valid email address";
const emailLengthErr = "must be between 1 and 50 characters";
const lengthErrShort = "must be between 1 and 25 characters";
const passwordAlphaNumericErr = "must contain at least a letter and a number";

const validateSignUp = [
  body("username")
    .trim()
    .isEmail()
    .withMessage(`Email: ${emailErr}`)
    .isLength({ min: 1, max: 50 })
    .withMessage(`Email: ${emailLengthErr}`),
  body("password")
    .trim()
    .isLength({ min: 1, max: 25 })
    .withMessage(`Password: ${lengthErrShort}`)
    .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/) //regular expression for contains a letter and a number
    .withMessage(`Password: ${passwordAlphaNumericErr}`),
];

const lengthErr = "must be between 1 and 25 characters";

const validateCreateorEditFolder = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 25 })
    .withMessage(`Message Title: ${lengthErr}`),
];

const upload = multer({ dest: 'uploads/' });


passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: username,
        },
      });

      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        // passwords do not match!
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: username,
      },
    });

    done(null, user);
  } catch (err) {
    done(err);
  }
});

export async function homepageGet(req, res) {
  if (req.session.passport) {
    const userHomeFolder = await prisma.folder.findFirst({
      where: {
        parentFolder: null,
        userid: req.session.passport.user,
      },
    });
    console.log(userHomeFolder);
    res.render("index", { user: req.session.passport.user, userHomeFolder });
    return;
  }
  else {
    res.render("index", { user: null} );
  }
  
}

export async function logInPageGet(req, res) {
  if (req.session.passport) {
    res.redirect("/");
  }
  else {
    res.render("login", {
      user: null,
      error: req.flash("error"),
    });
  }
}

export const logInPagePost = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/log-in",
  failureFlash: "Invalid username or password",
});

export async function signUpPageGet(req, res) {
  if (req.user) {
    res.redirect("/");
  }
  res.render("signUp");
}

export const signUpFormPost = [
  ...validateSignUp,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("signUp", {
        title: "Sign Up",
        user: req.session.passport.user,
        errors: errors.array(),
      });
    }
    const { username, password } = matchedData(req);
    console.log(prisma, prisma.user);
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email: username,
          password: hashedPassword,
        },
      });
      await prisma.folder.create({
        data: {
          name: `Home`,
          userid: user.id,
        },
      });
      res.redirect("/");
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
];

export async function viewFolderGet(req, res) {
  const selectedFolder = await prisma.folder.findUnique({
    where: {
      id: Number(req.params.folderId),
    },
  });

  if (
    !req.session.passport.user ||
    req.session.passport.user !== selectedFolder.userid
  ) {
    res.redirect("/");
    return;
  }

  const folderChildren = await prisma.folder.findMany({
    where: {
      parentFolder: selectedFolder.id,
    },
  });

  const fileChildren = await prisma.file.findMany({
    where: {
      folderId: selectedFolder.id,
    }
  })

  console.log(folderChildren, fileChildren);
  res.render("folderView", {
    user: req.session.passport.user,
    selectedFolder,
    folderChildren,
    fileChildren
  });
}

export async function createFolderGet(req, res) {
  if (!req.session.passport.user) {
    res.redirect("/");
    return;
  }
  const selectedFolder = await prisma.folder.findUnique({
    where: {
      id: Number(req.params.folderId),
    },
  });
  res.render("folders/createFolder", {
    user: req.session.passport.user,
    selectedFolder,
  });
}

export const createFolderPost = [
  ...validateCreateorEditFolder,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("folders/createFolder", {
        title: "Create Folder",
        user: req.session.passport.user,
        errors: errors.array(),
      });
    }
    const selectedFolder = await prisma.folder.findUnique({
      where: {
        id: Number(req.params.folderId),
      },
    });

    const { name } = matchedData(req);
    try {
      await prisma.folder.create({
        data: {
          name,
          parentFolder: selectedFolder.id,
          userid: req.session.passport.user,
        },
      });
      res.redirect("/view-files/user/:userId/folder/:folderId");
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
];

export async function editFolderGet(req, res) {
  const selectedFolder = await prisma.folder.findUnique({
    where: {
      id: Number(req.params.folderId),
    },
  });
  if (
    !req.session.passport.user ||
    !selectedFolder.parentFolder ||
    req.session.passport.user !== selectedFolder.userid
  ) {
    res.redirect("/");
    return;
  }
  res.render("folders/editFolder", {
    user: req.session.passport.user,
    selectedFolder,
  });
}

export const editFolderPost = [
  ...validateCreateorEditFolder,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("folders/editFolder", {
        title: "Edit Folder",
        user: req.session.passport.user,
        errors: errors.array(),
      });
    }
    const selectedFolder = await prisma.folder.findUnique({
      where: {
        id: Number(req.params.folderId),
      },
    });

    const { name } = matchedData(req);
    try {
      await prisma.folder.update({
        where: {
          id: selectedFolder.id,
        },
        data: {
          name,
        },
      });
      res.redirect("/view-files/user/:userId/folder/:folderId");
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
];

export async function deleteFolderGet(req, res) {
  const selectedFolder = await prisma.folder.findUnique({
    where: {
      id: Number(req.params.folderId),
    },
  });
  if (
    !req.session.passport.user ||
    !selectedFolder.parentFolder ||
    req.session.passport.user !== selectedFolder.userid
  ) {
    res.redirect("/");
    return;
  }
  try {
    await prisma.folder.delete({
      where: {
        id: selectedFolder.id,
      },
    });
    res.redirect(
      `/view-files/user/:userId/folder/${selectedFolder.parentFolder}`,
    );
  } catch (error) {
    console.error(error);
    next(error);
  }
}

export async function uploadFileGet(req, res) {
  const selectedFolder = await prisma.folder.findUnique({
      where: {
        id: Number(req.params.folderId),
      },
  });
  if (
    !req.session.passport.user ||
    req.session.passport.user !== selectedFolder.userid
  ) {
    res.redirect("/");
    return;
  }
  res.render("files/uploadFile", {user: req.session.passport.user,
    selectedFolder})
}

export const uploadFilePost = [
  upload.single('uploaded_file'), async (req, res) => {
    console.log(req.file, req.params.folderId)
    try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path)
        console.log(uploadResult);
        await prisma.file.create({
          data: {
            folderId: Number(req.params.folderId),
            url: uploadResult.secure_url,
            name: uploadResult.original_filename,
            size: uploadResult.bytes,
            uploadTime: new Date()
          },
        })
    } catch (error) {
        console.log(error)
    }
    res.redirect('/')
  }
]