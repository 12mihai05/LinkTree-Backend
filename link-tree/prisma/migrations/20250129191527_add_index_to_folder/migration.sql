/*
  Warnings:

  - You are about to drop the column `name` on the `folders` table. All the data in the column will be lost.
  - Added the required column `title` to the `folders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "folders" DROP CONSTRAINT "folders_parentId_fkey";

-- DropForeignKey
ALTER TABLE "folders" DROP CONSTRAINT "folders_userId_fkey";

-- DropForeignKey
ALTER TABLE "links" DROP CONSTRAINT "links_folderId_fkey";

-- DropForeignKey
ALTER TABLE "links" DROP CONSTRAINT "links_userId_fkey";

-- AlterTable
ALTER TABLE "folders" DROP COLUMN "name",
ADD COLUMN     "position" INTEGER,
ADD COLUMN     "title" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "links" ADD CONSTRAINT "links_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "links" ADD CONSTRAINT "links_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
