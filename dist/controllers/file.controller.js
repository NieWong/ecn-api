"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.uploadFile = exports.downloadFile = exports.getFile = exports.listFiles = void 0;
const prisma_1 = require("../db/prisma");
const file_service_1 = require("../services/file.service");
const auth_1 = require("../middleware/auth");
const errors_1 = require("../utils/errors");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const env_1 = require("../config/env");
const listFiles = async (req, res, next) => {
    try {
        if (!req.user) {
            const files = await prisma_1.prisma.file.findMany({
                where: { visibility: "PUBLIC" },
                orderBy: { createdAt: "desc" },
            });
            return res.status(200).json(files);
        }
        const files = await prisma_1.prisma.file.findMany({
            where: {
                OR: [{ visibility: "PUBLIC" }, { ownerId: req.user.id }],
            },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json(files);
    }
    catch (error) {
        next(error);
    }
};
exports.listFiles = listFiles;
const getFile = async (req, res, next) => {
    try {
        const file = await file_service_1.fileService.getAccessibleById(String(req.params.id), req.user);
        res.status(200).json(file);
    }
    catch (error) {
        next(error);
    }
};
exports.getFile = getFile;
const downloadFile = async (req, res, next) => {
    try {
        const file = await file_service_1.fileService.getAccessibleById(String(req.params.id), req.user);
        const filePath = path_1.default.join(env_1.env.uploadDir, file.storageKey);
        const fileExists = await fs_1.default.promises
            .access(filePath, fs_1.default.constants.R_OK)
            .then(() => true)
            .catch(() => false);
        if (!fileExists) {
            throw new errors_1.AppError("File not found", 404);
        }
        res.setHeader("Content-Type", file.mimeType || "application/octet-stream");
        res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(file.originalName)}`);
        res.setHeader("Content-Length", String(file.size));
        return res.sendFile(filePath);
    }
    catch (error) {
        next(error);
    }
};
exports.downloadFile = downloadFile;
exports.uploadFile = [
    auth_1.requireAuth,
    async (req, res, next) => {
        try {
            if (!req.file) {
                throw new errors_1.AppError("No file uploaded", 400);
            }
            const file = await file_service_1.fileService.createFromUpload({
                upload: Promise.resolve({
                    filename: req.file.originalname,
                    mimetype: req.file.mimetype,
                    encoding: req.file.encoding,
                    createReadStream: () => {
                        const { Readable } = require("stream");
                        return Readable.from(req.file.buffer);
                    },
                }),
                ownerId: req.user.id,
                visibility: req.body.visibility ?? "PRIVATE",
                kind: req.body.kind ?? "OTHER",
            });
            res.status(201).json(file);
        }
        catch (error) {
            next(error);
        }
    },
];
exports.deleteFile = [
    auth_1.requireAuth,
    async (req, res, next) => {
        try {
            await file_service_1.fileService.delete(String(req.params.id), req.user);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    },
];
