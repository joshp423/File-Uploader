require("dotenv").config();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const { body, validationResult, matchedData } = require("express-validator");

async function homepageGet(req, res) {
    res.render("index", {user: req.user});
}

async function logInPageGet(req, res) {
    if (req.user) {
        res.redirect("/");
    }
    res.render("login", {user: req.user});
}

module.exports = {
    homepageGet,
    logInPageGet
}