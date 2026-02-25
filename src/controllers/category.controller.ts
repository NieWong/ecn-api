import type { RequestHandler } from "express";
import { prisma } from "../db/prisma";
import { categoryService } from "../services/category.service";
import { requireAuth, requireRole } from "../middleware/auth";
import { validateBody } from "../validation/middleware";
import { createCategorySchema } from "../validation/schemas/category.schema";
import { AppError } from "../utils/errors";

export const listCategories: RequestHandler = async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

export const getCategory: RequestHandler = async (req, res, next) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: String(req.params.id) },
    });
    if (!category) {
      throw new AppError("Category not found", 404);
    }
    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
};

export const createCategory: RequestHandler[] = [
  requireRole("ADMIN"),
  validateBody(createCategorySchema),
  async (req, res, next) => {
    try {
      const category = await categoryService.create(req.body);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  },
];

export const deleteCategory: RequestHandler = [
  requireRole("ADMIN"),
  async (req: any, res: any, next: any) => {
    try {
      await categoryService.remove(String(req.params.id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
] as any;
