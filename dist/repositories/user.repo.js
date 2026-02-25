"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepo = void 0;
const prisma_1 = require("../db/prisma");
exports.userRepo = {
    findByEmail: (email) => {
        return prisma_1.prisma.user.findUnique({ where: { email } });
    },
    findById: (id) => {
        return prisma_1.prisma.user.findUnique({ where: { id } });
    },
    list: () => {
        return prisma_1.prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    },
    create: (data) => {
        return prisma_1.prisma.user.create({ data });
    },
};
