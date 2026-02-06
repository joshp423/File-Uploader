/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Folder" ALTER COLUMN "parentFolder" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name";
