import { prisma } from "../db/prisma";
import { NotificationType, Prisma } from "@prisma/client";

export const notificationRepo = {
  findById: (id: string) => {
    return prisma.notification.findUnique({
      where: { id },
    });
  },

  findByUserId: (userId: string, options?: { 
    unreadOnly?: boolean;
    take?: number;
    skip?: number;
  }) => {
    return prisma.notification.findMany({
      where: {
        userId,
        ...(options?.unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: options?.take,
      skip: options?.skip,
    });
  },

  countUnread: (userId: string) => {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  },

  create: (data: {
    type: NotificationType;
    title: string;
    message: string;
    userId: string;
    postId?: string | null;
    metadata?: Record<string, unknown>;
  }) => {
    return prisma.notification.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        userId: data.userId,
        postId: data.postId,
        metadata: data.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  },

  markAsRead: (id: string) => {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  },

  markAllAsRead: (userId: string) => {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },

  delete: (id: string) => {
    return prisma.notification.delete({
      where: { id },
    });
  },

  deleteAllForUser: (userId: string) => {
    return prisma.notification.deleteMany({
      where: { userId },
    });
  },
};
