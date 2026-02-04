require("dotenv").config();
const db = require("../../File-Uploader-real/script");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");