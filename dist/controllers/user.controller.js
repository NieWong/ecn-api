"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = void 0;
const prisma_1 = require("../db/prisma");
const auth_1 = require("../middleware/auth");
exports.listUsers = [
    (0, auth_1.requireRole)("ADMIN"),
    async (_req, res, next) => {
        try {
            const users = await prisma_1.prisma.user.findMany({
                orderBy: { createdAt: "desc" },
            });
            res.status(200).json(users);
        }
        catch (error) {
            next(error);
        }
    },
];
