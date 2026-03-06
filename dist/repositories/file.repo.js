"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileRepo = void 0;
const prisma_1 = require("../db/prisma");
exports.fileRepo = {
    findById: (id) => {
        return prisma_1.prisma.file.findUnique({ where: { id } });
    },
    list: (args) => {
        return prisma_1.prisma.file.findMany({
            where: args.where,
            orderBy: args.orderBy,
            skip: args.skip,
            take: args.take,
        });
    },
    create: (data) => {
        return prisma_1.prisma.file.create({ data });
    },
    delete: (id) => {
        return prisma_1.prisma.file.delete({ where: { id } });
    },
};
