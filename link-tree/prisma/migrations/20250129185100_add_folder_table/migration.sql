-- AlterTable
ALTER TABLE "links" ADD COLUMN     "folderId" INTEGER;

-- CreateTable
CREATE TABLE "folders" (
    "id" SERIAL NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "parentId" INTEGER,

    CONSTRAINT "folders_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "links" ADD CONSTRAINT "links_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
