import type { ErrorRequestHandler } from "express";
import { AppError } from "../utils/errors";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      details: err.details ?? null,
    });
  }

  return res.status(500).json({
    message: "Internal server error",
  });
};
