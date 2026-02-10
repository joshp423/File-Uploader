/*
  Warnings:

  - A unique constraint covering the columns `[folderId,name]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "File_folderId_name_key" ON "File"("folderId", "name");
