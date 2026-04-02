"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRepo = void 0;
const prisma_1 = require("../db/prisma");
exports.categoryRepo = {
    list: () => {
        return prisma_1.prisma.category.findMany({ orderBy: { name: "asc" } });
    },
    findById: (id) => {
        return prisma_1.prisma.category.findUnique({ where: { id } });
    },
    findBySlug: (slug) => {
        return prisma_1.prisma.category.findUnique({ where: { slug } });
    },
    create: (data) => {
        return prisma_1.prisma.category.create({ data });
    },
    update: (id, data) => {
        return prisma_1.prisma.category.update({ where: { id }, data });
    },
    delete: (id) => {
        return prisma_1.prisma.category.delete({ where: { id } });
    },
    findByIds: (ids) => {
        return prisma_1.prisma.category.findMany({ where: { id: { in: ids } } });
    },
};
