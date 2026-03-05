import { NotificationType } from "@prisma/client";
import { notificationRepo } from "../repositories/notification.repo";
import type { AuthUser } from "../types/auth";
import { AppError } from "../utils/errors";

export const notificationService = {
  list: async (actor: AuthUser, options?: {
    unreadOnly?: boolean;
    take?: number;
    skip?: number;
  }) => {
    return notificationRepo.findByUserId(actor.id, options);
  },

  // Get unread count for the authenticated user
  getUnreadCount: async (actor: AuthUser) => {
    return notificationRepo.countUnread(actor.id);
  },

  // Mark a notification as read
  markAsRead: async (id: string, actor: AuthUser) => {
    const notification = await notificationRepo.findById(id);
    if (!notification) {
      throw new AppError("Notification not found", 404);
    }
    if (notification.userId !== actor.id) {
      throw new AppError("Forbidden", 403);
    }
    return notificationRepo.markAsRead(id);
  },

  // Mark all notifications as read
  markAllAsRead: async (actor: AuthUser) => {
    return notificationRepo.markAllAsRead(actor.id);
  },

  // Delete a notification
  delete: async (id: string, actor: AuthUser) => {
    const notification = await notificationRepo.findById(id);
    if (!notification) {
      throw new AppError("Notification not found", 404);
    }
    if (notification.userId !== actor.id && actor.role !== "ADMIN") {
      throw new AppError("Forbidden", 403);
    }
    return notificationRepo.delete(id);
  },

  // Delete all notifications for the user
  deleteAll: async (actor: AuthUser) => {
    return notificationRepo.deleteAllForUser(actor.id);
  },

  // === Notification Creation Helpers ===

  // Notify user when their article is submitted for review
  notifyArticleSubmitted: async (postId: string, postTitle: string, authorId: string) => {
    return notificationRepo.create({
      type: NotificationType.ARTICLE_SUBMITTED,
      title: "Article Submitted for Review",
      message: `Your article "${postTitle}" has been submitted for admin review.`,
      userId: authorId,
      postId,
    });
  },

  // Notify admin about new article submission (send to all admins)
  notifyAdminsNewSubmission: async (postId: string, postTitle: string, authorName: string, adminIds: string[]) => {
    const notifications = adminIds.map(adminId => 
      notificationRepo.create({
        type: NotificationType.ARTICLE_SUBMITTED,
        title: "New Article Submission",
        message: `${authorName || "A user"} submitted "${postTitle}" for review.`,
        userId: adminId,
        postId,
      })
    );
    return Promise.all(notifications);
  },

  // Notify user when their article is approved
  notifyArticleApproved: async (postId: string, postTitle: string, authorId: string) => {
    return notificationRepo.create({
      type: NotificationType.ARTICLE_APPROVED,
      title: "Article Approved",
      message: `Your article "${postTitle}" has been approved and is now published!`,
      userId: authorId,
      postId,
    });
  },

  // Notify user when their article is rejected
  notifyArticleRejected: async (postId: string, postTitle: string, authorId: string, reason?: string) => {
    return notificationRepo.create({
      type: NotificationType.ARTICLE_REJECTED,
      title: "Article Needs Revision",
      message: `Your article "${postTitle}" needs revision.${reason ? ` Reason: ${reason}` : ""}`,
      userId: authorId,
      postId,
      metadata: reason ? { reason } : undefined,
    });
  },

  // Notify user when admin comments on their article
  notifyArticleCommented: async (postId: string, postTitle: string, authorId: string, comment: string) => {
    return notificationRepo.create({
      type: NotificationType.ARTICLE_COMMENTED,
      title: "Admin Feedback",
      message: `Admin left feedback on "${postTitle}": ${comment.substring(0, 100)}${comment.length > 100 ? "..." : ""}`,
      userId: authorId,
      postId,
      metadata: { comment },
    });
  },

  // Notify user when their membership level changes
  notifyMembershipChanged: async (userId: string, oldLevel: string, newLevel: string) => {
    const levelNames: Record<string, string> = {
      REGULAR_USER: "Regular User",
      MEMBER: "Member",
      HONORARY_MEMBER: "Honorary Member",
      BOARD_MEMBER: "Board Member",
      ADMIN_MEMBER: "Admin",
    };
    
    return notificationRepo.create({
      type: NotificationType.MEMBERSHIP_CHANGED,
      title: "Membership Level Updated",
      message: `Your membership level has been changed from ${levelNames[oldLevel] || oldLevel} to ${levelNames[newLevel] || newLevel}.`,
      userId,
      metadata: { oldLevel, newLevel },
    });
  },

  // Notify user when their registration is approved
  notifyUserApproved: async (userId: string) => {
    return notificationRepo.create({
      type: NotificationType.USER_APPROVED,
      title: "Registration Approved",
      message: "Your registration has been approved! You can now access all features.",
      userId,
    });
  },

  // Send system notification
  notifySystem: async (userId: string, title: string, message: string, metadata?: Record<string, unknown>) => {
    return notificationRepo.create({
      type: NotificationType.SYSTEM,
      title,
      message,
      userId,
      metadata,
    });
  },
};
