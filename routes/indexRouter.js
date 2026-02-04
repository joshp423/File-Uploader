const { Router } = require("express");
const indexController = require("../controllers/indexController");
const indexRouter = Router();

indexRouter.get("/", indexController.homepageGet);
indexRouter.get("/log-in", indexController.logInPageGet);
indexRouter.get("/sign-up", indexController.logInPageGet);




module.exports = indexRouter;