"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requireAuth = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
const prisma_1 = require("../db/prisma");
const authenticate = async (req, _res, next) => {
    const header = req.headers["authorization"];
    if (!header || !header.startsWith("Bearer ")) {
        return next();
    }
    const token = header.slice("Bearer ".length).trim();
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.jwtSecret);
        if (!payload.sub) {
            return next();
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: String(payload.sub) },
            select: {
                id: true,
                email: true,
                role: true,
                membershipLevel: true,
                isAccountant: true,
                isActive: true,
            },
        });
        if (!user || !user.isActive) {
            return next();
        }
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            membershipLevel: user.membershipLevel,
            isAccountant: user.isAccountant,
        };
        return next();
    }
    catch {
        return next();
    }
};
exports.authenticate = authenticate;
const requireAuth = (req, _res, next) => {
    if (!req.user) {
        return next(new errors_1.AppError("Unauthorized", 401));
    }
    return next();
};
exports.requireAuth = requireAuth;
const requireRole = (role) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new errors_1.AppError("Unauthorized", 401));
        }
        if (req.user.role !== role) {
            return next(new errors_1.AppError("Forbidden", 403));
        }
        return next();
    };
};
exports.requireRole = requireRole;
