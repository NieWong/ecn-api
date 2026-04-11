import type { RequestHandler } from "express";
import { prisma } from "../db/prisma";
import { fileService } from "../services/file.service";
import { requireAuth } from "../middleware/auth";
import { AppError } from "../utils/errors";
import fs from "fs";
import path from "path";
import { env } from "../config/env";

export const listFiles: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      const files = await prisma.file.findMany({
        where: { visibility: "PUBLIC" },
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json(files);
    }

    const files = await prisma.file.findMany({
      where: {
        OR: [{ visibility: "PUBLIC" }, { ownerId: req.user.id }],
      },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(files);
  } catch (error) {
    next(error);
  }
};

export const getFile: RequestHandler = async (req, res, next) => {
  try {
    const file = await fileService.getAccessibleById(String(req.params.id), req.user);

    res.status(200).json(file);
  } catch (error) {
    next(error);
  }
};

export const downloadFile: RequestHandler = async (req, res, next) => {
  try {
    const file = await fileService.getAccessibleById(String(req.params.id), req.user);

    const filePath = path.join(env.uploadDir, file.storageKey);
    const fileExists = await fs.promises
      .access(filePath, fs.constants.R_OK)
      .then(() => true)
      .catch(() => false);

    if (!fileExists) {
      throw new AppError("File not found", 404);
    }

    res.setHeader("Content-Type", file.mimeType || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(file.originalName)}`);
    res.setHeader("Content-Length", String(file.size));

    return res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};

export const uploadFile: RequestHandler = [
  requireAuth,
  async (req: any, res: any, next: any) => {
    try {
      if (!req.file) {
        throw new AppError("No file uploaded", 400);
      }

      const file = await fileService.createFromUpload({
        upload: Promise.resolve({
          filename: req.file.originalname,
          mimetype: req.file.mimetype,
          encoding: req.file.encoding,
          createReadStream: () => {
            const { Readable } = require("stream");
            return Readable.from(req.file!.buffer);
          },
        }),
        ownerId: req.user!.id,
        visibility: (req.body.visibility as "PUBLIC" | "PRIVATE") ?? "PRIVATE",
        kind: (req.body.kind as "IMAGE" | "DOCUMENT" | "OTHER") ?? "OTHER",
      });

      res.status(201).json(file);
    } catch (error) {
      next(error);
    }
  },
] as any;

export const deleteFile: RequestHandler = [
  requireAuth,
  async (req: any, res: any, next: any) => {
    try {
      await fileService.delete(String(req.params.id), req.user!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
] as any;
