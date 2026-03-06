"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepo = void 0;
const prisma_1 = require("../db/prisma");
exports.userRepo = {
    findByEmail: (email) => {
        return prisma_1.prisma.user.findUnique({
            where: { email },
            include: {
                profilePicture: true,
                cvFile: true,
            }
        });
    },
    findById: (id) => {
        return prisma_1.prisma.user.findUnique({
            where: { id },
            include: {
                profilePicture: true,
                cvFile: true,
            }
        });
    },
    list: (filters) => {
        const where = filters
            ? {
                isActive: filters.isActive,
                role: filters.role,
            }
            : undefined;
        return prisma_1.prisma.user.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: {
                profilePicture: true,
                cvFile: true,
            }
        });
    },
    create: (data) => {
        return prisma_1.prisma.user.create({ data });
    },
    update: (id, data) => {
        return prisma_1.prisma.user.update({
            where: { id },
            data: data,
            include: {
                profilePicture: true,
                cvFile: true,
            }
        });
    },
    countPostsByAuthor: (authorId) => {
        return prisma_1.prisma.post.count({ where: { authorId } });
    },
    delete: (id) => {
        return prisma_1.prisma.user.delete({ where: { id } });
    },
};
