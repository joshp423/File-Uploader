/*
  Warnings:

  - A unique constraint covering the columns `[userid,parentFolder,name]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Folder_userid_parentFolder_name_key" ON "Folder"("userid", "parentFolder", "name");
