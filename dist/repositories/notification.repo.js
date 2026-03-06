"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRepo = void 0;
const prisma_1 = require("../db/prisma");
exports.notificationRepo = {
    findById: (id) => {
        return prisma_1.prisma.notification.findUnique({
            where: { id },
        });
    },
    findByUserId: (userId, options) => {
        return prisma_1.prisma.notification.findMany({
            where: {
                userId,
                ...(options?.unreadOnly ? { isRead: false } : {}),
            },
            orderBy: { createdAt: "desc" },
            take: options?.take,
            skip: options?.skip,
        });
    },
    countUnread: (userId) => {
        return prisma_1.prisma.notification.count({
            where: {
                userId,
                isRead: false,
            },
        });
    },
    create: (data) => {
        return prisma_1.prisma.notification.create({
            data: {
                type: data.type,
                title: data.title,
                message: data.message,
                userId: data.userId,
                postId: data.postId,
                metadata: data.metadata,
            },
        });
    },
    markAsRead: (id) => {
        return prisma_1.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
    },
    markAllAsRead: (userId) => {
        return prisma_1.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    },
    delete: (id) => {
        return prisma_1.prisma.notification.delete({
            where: { id },
        });
    },
    deleteAllForUser: (userId) => {
        return prisma_1.prisma.notification.deleteMany({
            where: { userId },
        });
    },
};
