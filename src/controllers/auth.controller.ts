import type { RequestHandler } from "express";
import { authService } from "../services/auth.service";
import { loginSchema, registerSchema } from "../validation/schemas/auth.schema";
import { validateBody } from "../validation/middleware";

export const register: RequestHandler[] = [
  validateBody(registerSchema),
  async (req, res, next) => {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
];

export const login: RequestHandler[] = [
  validateBody(loginSchema),
  async (req, res, next) => {
    try {
      const result = await authService.login(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
];

export const me: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(200).json(null);
    }
    const { prisma } = await import("../db/prisma");
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
