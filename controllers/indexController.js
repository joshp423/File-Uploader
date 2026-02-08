import bcrypt from "bcryptjs";
import { body, validationResult, matchedData } from "express-validator";
import prisma from "../lib/prisma.js";
import passport from "passport";
import {Strategy as LocalStrategy} from "passport-local";

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

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
            email: username,
        },
    })

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
    console.log(req.session.passport.user)
    if (req.session.passport.user) {
        const userHomeFolder = await prisma.folder.findFirst({
            where: {
                parentFolder: null,
                userid: req.session.passport.user
            }
        })
        console.log(userHomeFolder)
        res.render("index", {user: req.session.passport.user, userHomeFolder});
        return;
    }
    res.render("index", {user: req.session.passport.user});
}

export async function logInPageGet(req, res) {
    if (req.session.passport.user) {
        res.redirect("/");
    }
    res.render("login", {
        user: req.session.passport.user,
        error: req.flash("error"),
    });
}

export const logInPagePost = passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/log-in",
    failureFlash: "Invalid username or password",
})

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
        console.log(prisma, prisma.user)
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await prisma.user.create({
                data: {
                    email: username,
                    password: hashedPassword
                },
            });
            await prisma.folder.create({
                data: {
                    name: `Home`,
                    userid: user.id
                },
            })
            res.redirect("/");
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
];

export async function viewFolderGet ( req, res ) {
    console.log(Number(req.params.folderId))
    const selectedFolder = await prisma.folder.findUnique({
        where: {
            id: Number(req.params.folderId)
        }
    })
    const folderChildren = await prisma.folder.findMany({
        where: {
            parentFolder: selectedFolder.id
        }
    })
    if (!req.session.passport.user) {
        res.redirect("/");
        return;
    }
    res.render("folderView", {
        user: req.session.passport.user,
        selectedFolder,
        folderChildren
    });
}
