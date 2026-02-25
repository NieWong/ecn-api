"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRepo = void 0;
const prisma_1 = require("../db/prisma");
exports.postRepo = {
    list: (args) => {
        return prisma_1.prisma.post.findMany({
            where: args?.where,
            orderBy: args?.orderBy ?? { createdAt: "desc" },
            skip: args?.skip,
            take: args?.take,
            include: { author: true, categories: { include: { category: true } } },
        });
    },
    findById: (id) => {
        return prisma_1.prisma.post.findUnique({
            where: { id },
            include: { author: true, categories: { include: { category: true } } },
        });
    },
    findBySlug: (slug) => {
        return prisma_1.prisma.post.findUnique({ where: { slug } });
    },
    create: (data) => {
        return prisma_1.prisma.post.create({
            data: {
                title: data.title,
                slug: data.slug,
                summary: data.summary ?? null,
                contentJson: data.contentJson,
                contentHtml: data.contentHtml ?? null,
                status: data.status ?? "DRAFT",
                visibility: data.visibility ?? "PUBLIC",
                authorId: data.authorId,
                categories: data.categoryIds
                    ? {
                        createMany: {
                            data: data.categoryIds.map((categoryId) => ({ categoryId })),
                        },
                    }
                    : undefined,
            },
            include: { author: true, categories: { include: { category: true } } },
        });
    },
    update: (id, data) => {
        const updateData = {
            title: data.title,
            slug: data.slug,
            summary: data.summary ?? undefined,
            contentJson: data.contentJson,
            contentHtml: data.contentHtml ?? undefined,
            status: data.status,
            visibility: data.visibility,
        };
        if (data.coverFileId !== undefined) {
            updateData.coverFile = data.coverFileId
                ? { connect: { id: data.coverFileId } }
                : { disconnect: true };
        }
        return prisma_1.prisma.post.update({
            where: { id },
            data: updateData,
            include: { author: true, categories: { include: { category: true } } },
        });
    },
    delete: (id) => {
        return prisma_1.prisma.post.delete({ where: { id } });
    },
};
