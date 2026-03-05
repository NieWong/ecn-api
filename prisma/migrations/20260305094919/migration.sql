-- CreateEnum
CREATE TYPE "MembershipLevel" AS ENUM ('REGULAR_USER', 'MEMBER', 'HONORARY_MEMBER', 'BOARD_MEMBER', 'ADMIN_MEMBER');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ARTICLE_SUBMITTED', 'ARTICLE_APPROVED', 'ARTICLE_REJECTED', 'ARTICLE_COMMENTED', 'MEMBERSHIP_CHANGED', 'USER_APPROVED', 'SYSTEM');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "adminComment" TEXT,
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "membershipLevel" "MembershipLevel" NOT NULL DEFAULT 'REGULAR_USER';

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "postId" TEXT,
    "userId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Post_isApproved_idx" ON "Post"("isApproved");

-- CreateIndex
CREATE INDEX "User_membershipLevel_idx" ON "User"("membershipLevel");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
