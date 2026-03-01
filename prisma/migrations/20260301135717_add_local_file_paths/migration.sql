-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "coverImagePath" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cvFilePath" TEXT,
ADD COLUMN     "profilePicturePath" TEXT;
