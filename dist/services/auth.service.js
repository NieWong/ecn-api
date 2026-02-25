"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const user_repo_1 = require("../repositories/user.repo");
const errors_1 = require("../utils/errors");
const createToken = (user) => {
    return jsonwebtoken_1.default.sign({ email: user.email, role: user.role }, env_1.env.jwtSecret, {
        subject: user.id,
        expiresIn: env_1.env.jwtExpiresIn,
    });
};
exports.authService = {
    register: async (data) => {
        const existing = await user_repo_1.userRepo.findByEmail(data.email);
        if (existing) {
            throw new errors_1.AppError("Email already in use", 409);
        }
        const hashed = await bcrypt_1.default.hash(data.password, 10);
        const user = await user_repo_1.userRepo.create({
            email: data.email,
            name: data.name ?? null,
            password: hashed,
        });
        const token = createToken({ id: user.id, email: user.email, role: user.role });
        return { user, token };
    },
    login: async (data) => {
        const user = await user_repo_1.userRepo.findByEmail(data.email);
        if (!user) {
            throw new errors_1.AppError("Invalid credentials", 401);
        }
        const valid = await bcrypt_1.default.compare(data.password, user.password);
        if (!valid) {
            throw new errors_1.AppError("Invalid credentials", 401);
        }
        const token = createToken({ id: user.id, email: user.email, role: user.role });
        return { user, token };
    },
};
