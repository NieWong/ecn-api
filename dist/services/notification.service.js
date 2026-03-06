"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const client_1 = require("@prisma/client");
const notification_repo_1 = require("../repositories/notification.repo");
const errors_1 = require("../utils/errors");
exports.notificationService = {
    list: async (actor, options) => {
        return notification_repo_1.notificationRepo.findByUserId(actor.id, options);
    },
    // Get unread count for the authenticated user
    getUnreadCount: async (actor) => {
        return notification_repo_1.notificationRepo.countUnread(actor.id);
    },
    // Mark a notification as read
    markAsRead: async (id, actor) => {
        const notification = await notification_repo_1.notificationRepo.findById(id);
        if (!notification) {
            throw new errors_1.AppError("Notification not found", 404);
        }
        if (notification.userId !== actor.id) {
            throw new errors_1.AppError("Forbidden", 403);
        }
        return notification_repo_1.notificationRepo.markAsRead(id);
    },
    // Mark all notifications as read
    markAllAsRead: async (actor) => {
        return notification_repo_1.notificationRepo.markAllAsRead(actor.id);
    },
    // Delete a notification
    delete: async (id, actor) => {
        const notification = await notification_repo_1.notificationRepo.findById(id);
        if (!notification) {
            throw new errors_1.AppError("Notification not found", 404);
        }
        if (notification.userId !== actor.id && actor.role !== "ADMIN") {
            throw new errors_1.AppError("Forbidden", 403);
        }
        return notification_repo_1.notificationRepo.delete(id);
    },
    // Delete all notifications for the user
    deleteAll: async (actor) => {
        return notification_repo_1.notificationRepo.deleteAllForUser(actor.id);
    },
    // === Notification Creation Helpers ===
    // Notify user when their article is submitted for review
    notifyArticleSubmitted: async (postId, postTitle, authorId) => {
        return notification_repo_1.notificationRepo.create({
            type: client_1.NotificationType.ARTICLE_SUBMITTED,
            title: "Article Submitted for Review",
            message: `Your article "${postTitle}" has been submitted for admin review.`,
            userId: authorId,
            postId,
        });
    },
    // Notify admin about new article submission (send to all admins)
    notifyAdminsNewSubmission: async (postId, postTitle, authorName, adminIds) => {
        const notifications = adminIds.map(adminId => notification_repo_1.notificationRepo.create({
            type: client_1.NotificationType.ARTICLE_SUBMITTED,
            title: "New Article Submission",
            message: `${authorName || "A user"} submitted "${postTitle}" for review.`,
            userId: adminId,
            postId,
        }));
        return Promise.all(notifications);
    },
    // Notify user when their article is approved
    notifyArticleApproved: async (postId, postTitle, authorId) => {
        return notification_repo_1.notificationRepo.create({
            type: client_1.NotificationType.ARTICLE_APPROVED,
            title: "Article Approved",
            message: `Your article "${postTitle}" has been approved and is now published!`,
            userId: authorId,
            postId,
        });
    },
    // Notify user when their article is rejected
    notifyArticleRejected: async (postId, postTitle, authorId, reason) => {
        return notification_repo_1.notificationRepo.create({
            type: client_1.NotificationType.ARTICLE_REJECTED,
            title: "Article Needs Revision",
            message: `Your article "${postTitle}" needs revision.${reason ? ` Reason: ${reason}` : ""}`,
            userId: authorId,
            postId,
            metadata: reason ? { reason } : undefined,
        });
    },
    // Notify user when admin comments on their article
    notifyArticleCommented: async (postId, postTitle, authorId, comment) => {
        return notification_repo_1.notificationRepo.create({
            type: client_1.NotificationType.ARTICLE_COMMENTED,
            title: "Admin Feedback",
            message: `Admin left feedback on "${postTitle}": ${comment.substring(0, 100)}${comment.length > 100 ? "..." : ""}`,
            userId: authorId,
            postId,
            metadata: { comment },
        });
    },
    // Notify user when their membership level changes
    notifyMembershipChanged: async (userId, oldLevel, newLevel) => {
        const levelNames = {
            REGULAR_USER: "Regular User",
            MEMBER: "Member",
            HONORARY_MEMBER: "Honorary Member",
            BOARD_MEMBER: "Board Member",
            ADMIN_MEMBER: "Admin",
        };
        return notification_repo_1.notificationRepo.create({
            type: client_1.NotificationType.MEMBERSHIP_CHANGED,
            title: "Membership Level Updated",
            message: `Your membership level has been changed from ${levelNames[oldLevel] || oldLevel} to ${levelNames[newLevel] || newLevel}.`,
            userId,
            metadata: { oldLevel, newLevel },
        });
    },
    // Notify user when their registration is approved
    notifyUserApproved: async (userId) => {
        return notification_repo_1.notificationRepo.create({
            type: client_1.NotificationType.USER_APPROVED,
            title: "Registration Approved",
            message: "Your registration has been approved! You can now access all features.",
            userId,
        });
    },
    // Send system notification
    notifySystem: async (userId, title, message, metadata) => {
        return notification_repo_1.notificationRepo.create({
            type: client_1.NotificationType.SYSTEM,
            title,
            message,
            userId,
            metadata,
        });
    },
};
