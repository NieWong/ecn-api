import { randomUUID } from "crypto";

interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => NodeJS.ReadableStream;
}
import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { env } from "../config/env";
import { fileRepo } from "../repositories/file.repo";
import type { AuthUser } from "../types/auth";
import { AppError } from "../utils/errors";
import { inferFileKind } from "../utils/fileKind";

const ensureUploadDir = async () => {
  await fs.promises.mkdir(env.uploadDir, { recursive: true });
};

export const fileService = {
  createFromUpload: async (params: {
    upload: Promise<FileUpload>;
    ownerId: string;
    visibility?: "PUBLIC" | "PRIVATE";
    kind?: "IMAGE" | "DOCUMENT" | "OTHER";
  }) => {
    const { createReadStream, filename, mimetype } = await params.upload;

    await ensureUploadDir();

    const ext = path.extname(filename) || "";
    const storageKey = `${randomUUID()}${ext}`;
    const filePath = path.join(env.uploadDir, storageKey);

    await pipeline(createReadStream(), fs.createWriteStream(filePath));

    const stat = await fs.promises.stat(filePath);

    return fileRepo.create({
      ownerId: params.ownerId,
      kind: params.kind ?? inferFileKind(mimetype),
      visibility: params.visibility ?? "PUBLIC",
      originalName: filename,
      mimeType: mimetype,
      size: stat.size,
      storageKey,
      width: null,
      height: null,
    });
  },
  delete: async (id: string, actor: AuthUser) => {
    const file = await fileRepo.findById(id);
    if (!file) {
      throw new AppError("File not found", 404);
    }
    if (actor.role !== "ADMIN" && file.ownerId !== actor.id) {
      throw new AppError("Forbidden", 403);
    }

    await fileRepo.delete(id);

    const filePath = path.join(env.uploadDir, file.storageKey);
    await fs.promises.unlink(filePath).catch(() => undefined);

    return true;
  },
};
