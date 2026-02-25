import { z } from "zod";
import { AppError } from "./errors";
import type { RequestHandler } from "express";

export const validateBody = (schema: z.ZodTypeAny): RequestHandler => {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError("Validation failed", 400, parsed.error.flatten()));
    }
    req.body = parsed.data;
    return next();
  };
};

export const validateParams = (schema: z.ZodTypeAny): RequestHandler => {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.params);
    if (!parsed.success) {
      return next(new AppError("Validation failed", 400, parsed.error.flatten()));
    }
    req.params = parsed.data as any;
    return next();
  };
};
