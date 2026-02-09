const { Router } = require("express");
const indexController = require("../controllers/indexController");
const indexRouter = Router();

indexRouter.get("/", indexController.homepageGet);
indexRouter.get("/log-in", indexController.logInPageGet);
indexRouter.get("/sign-up", indexController.signUpPageGet);
indexRouter.post("/sign-up", indexController.signUpFormPost);
indexRouter.post("/log-in", indexController.logInPagePost);
indexRouter.get(
  "/view-files/user/:userId/folder/:folderId",
  indexController.viewFolderGet,
);
indexRouter.get(
  "/create-folder/user/:userId/folder/:folderId",
  indexController.createFolderGet,
);
indexRouter.post(
  "/create-folder/user/:userId/folder/:folderId",
  indexController.createFolderPost,
);

module.exports = indexRouter;
