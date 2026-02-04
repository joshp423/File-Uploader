const bcrypt = require("bcryptjs");
const { body, validationResult, matchedData } = require("express-validator");
const prisma = require("../lib/prisma.js")

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


async function homepageGet(req, res) {
    res.render("index", {user: req.user});
}

async function logInPageGet(req, res) {
    if (req.user) {
        res.redirect("/");
    }
    res.render("login", {user: req.user});
}



async function signUpPageGet(req, res) {
    if (req.user) {
        res.redirect("/");
    }
    res.render("signUp");
}

const signUpFormPost = [
    ...validateSignUp,
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render("signUp", {
            title: "Sign Up",
            user: req.user,
            errors: errors.array(),
            });
        }
        const { username, password } = matchedData(req);
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
                    name: `${username}-Home`,
                    userid: user.id,
                },
            })
            res.redirect("/");
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
];

module.exports = {
    homepageGet,
    logInPageGet,
    signUpPageGet,
    signUpFormPost
}