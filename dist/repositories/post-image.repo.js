"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postImageRepo = void 0;
const prisma_1 = require("../db/prisma");
exports.postImageRepo = {
    upsert: (data) => {
        return prisma_1.prisma.postImage.upsert({
            where: { postId_fileId: { postId: data.postId, fileId: data.fileId } },
            update: { sort: data.sort ?? 0 },
            create: { postId: data.postId, fileId: data.fileId, sort: data.sort ?? 0 },
        });
    },
    delete: (data) => {
        return prisma_1.prisma.postImage.delete({ where: { postId_fileId: data } });
    },
};
