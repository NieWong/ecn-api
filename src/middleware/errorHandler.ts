import type { ErrorRequestHandler } from "express";
import { AppError } from "../utils/errors";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Log all errors for debugging
  console.error('Error caught by errorHandler:');
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      details: err.details ?? null,
    });
  }

  // Log additional details for non-AppError errors
  console.error('Full error object:', err);
  
  return res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};
