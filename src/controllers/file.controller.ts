import type { RequestHandler } from "express";
import { prisma } from "../db/prisma";
import { fileService } from "../services/file.service";
import { requireAuth } from "../middleware/auth";
import { AppError } from "../utils/errors";

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
    const file = await prisma.file.findUnique({
      where: { id: String(req.params.id) },
    });

    if (!file) {
      throw new AppError("File not found", 404);
    }

    // Access control
    if (file.visibility === "PUBLIC") {
      return res.status(200).json(file);
    }
    if (!req.user) {
      throw new AppError("Forbidden", 403);
    }
    if (file.ownerId !== req.user.id && req.user.role !== "ADMIN") {
      throw new AppError("Forbidden", 403);
    }

    res.status(200).json(file);
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
