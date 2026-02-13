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
indexRouter.get(
  "/edit-folder/user/:userId/folder/:folderId",
  indexController.editFolderGet,
);
indexRouter.post(
  "/edit-folder/user/:userId/folder/:folderId",
  indexController.editFolderPost,
);
indexRouter.get(
  "/delete-folder/user/:userId/folder/:folderId",
  indexController.deleteFolderGet,
);
indexRouter.get(
  "/upload-file/user/:userId/folder/:folderId",
  indexController.uploadFileGet,
);
indexRouter.post(
  "/upload-file/user/:userId/folder/:folderId",
  indexController.uploadFilePost,
);
indexRouter.get(
  "/file-details/user/:userId/folder/:folderId/file/:fileId",
  indexController.fileDetailsGet,
);
indexRouter.get(
  "/edit-file/user/:userId/folder/:folderId/file/:fileId",
  indexController.editFileGet,
);
indexRouter.post(
  "/edit-file/user/:userId/folder/:folderId/file/:fileId",
  indexController.editFilePost,
);
indexRouter.get(
  "/delete-file/user/:userId/folder/:folderId/file/:fileId",
  indexController.deleteFileGet,
);

indexRouter.get ("/log-out", indexController.logOutGet)

module.exports = indexRouter;
