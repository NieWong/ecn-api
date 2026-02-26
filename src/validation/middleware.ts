import type { RequestHandler } from "express";
import { z } from "zod";
import { AppError } from "../utils/errors";

export const validateBody = <T extends z.ZodTypeAny>(
  schema: T
): RequestHandler => {
  return (req, _res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((e) => `${e.path.join(".")}: ${e.message}`);
        return next(new AppError(messages.join(", "), 400));
      }
      next(error);
    }
  };
};

export const validateQuery = <T extends z.ZodTypeAny>(
  schema: T
): RequestHandler => {
  return (req, _res, next) => {
    try {
      // Don't try to reassign req.query (it's read-only)
      // Just validate and let the controller use the original query
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((e) => `${e.path.join(".")}: ${e.message}`);
        return next(new AppError(messages.join(", "), 400));
      }
      next(error);
    }
  };
};
