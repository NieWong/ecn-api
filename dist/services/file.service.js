"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileService = void 0;
const crypto_1 = require("crypto");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const promises_1 = require("stream/promises");
const env_1 = require("../config/env");
const file_repo_1 = require("../repositories/file.repo");
const errors_1 = require("../utils/errors");
const fileKind_1 = require("../utils/fileKind");
const ensureUploadDir = async () => {
    await fs_1.default.promises.mkdir(env_1.env.uploadDir, { recursive: true });
};
exports.fileService = {
    createFromUpload: async (params) => {
        const { createReadStream, filename, mimetype } = await params.upload;
        await ensureUploadDir();
        const ext = path_1.default.extname(filename) || "";
        const storageKey = `${(0, crypto_1.randomUUID)()}${ext}`;
        const filePath = path_1.default.join(env_1.env.uploadDir, storageKey);
        await (0, promises_1.pipeline)(createReadStream(), fs_1.default.createWriteStream(filePath));
        const stat = await fs_1.default.promises.stat(filePath);
        return file_repo_1.fileRepo.create({
            ownerId: params.ownerId,
            kind: params.kind ?? (0, fileKind_1.inferFileKind)(mimetype),
            visibility: params.visibility ?? "PUBLIC",
            originalName: filename,
            mimeType: mimetype,
            size: stat.size,
            storageKey,
            width: null,
            height: null,
        });
    },
    delete: async (id, actor) => {
        const file = await file_repo_1.fileRepo.findById(id);
        if (!file) {
            throw new errors_1.AppError("File not found", 404);
        }
        if (actor.role !== "ADMIN" && file.ownerId !== actor.id) {
            throw new errors_1.AppError("Forbidden", 403);
        }
        await file_repo_1.fileRepo.delete(id);
        const filePath = path_1.default.join(env_1.env.uploadDir, file.storageKey);
        await fs_1.default.promises.unlink(filePath).catch(() => undefined);
        return true;
    },
};
