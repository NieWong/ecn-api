import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { AuthUser } from "../types/auth";
import { AppError } from "../utils/errors";

export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers["authorization"];
  if (!header || !header.startsWith("Bearer ")) {
    return next();
  }

  const token = header.slice("Bearer ".length).trim();
  try {
    const payload = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload;
    if (!payload.sub || !payload.email || !payload.role) {
      return next();
    }

    req.user = {
      id: String(payload.sub),
      email: String(payload.email),
      role: payload.role as AuthUser["role"],
    };
    return next();
  } catch {
    return next();
  }
};

export const requireAuth: RequestHandler = (req, _res, next) => {
  if (!req.user) {
    return next(new AppError("Unauthorized", 401));
  }
  return next();
};

export const requireRole = (role: AuthUser["role"]): RequestHandler => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }
    if (req.user.role !== role) {
      return next(new AppError("Forbidden", 403));
    }
    return next();
  };
};
