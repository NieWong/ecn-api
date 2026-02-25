import type { RequestHandler } from "express";
import { prisma } from "../db/prisma";
import { requireRole } from "../middleware/auth";
import { AppError } from "../utils/errors";

export const listUsers: RequestHandler = [
  requireRole("ADMIN"),
  async (_req: any, res: any, next: any) => {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
      });
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  },
] as any;
