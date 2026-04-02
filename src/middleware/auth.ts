import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { AuthUser } from "../types/auth";
import { AppError } from "../utils/errors";
import { prisma } from "../db/prisma";

export const authenticate: RequestHandler = async (req, _res, next) => {
  const header = req.headers["authorization"];
  if (!header || !header.startsWith("Bearer ")) {
    return next();
  }

  const token = header.slice("Bearer ".length).trim();
  try {
    const payload = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload;
    if (!payload.sub) {
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { id: String(payload.sub) },
      select: {
        id: true,
        email: true,
        role: true,
        membershipLevel: true,
        isAccountant: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return next();
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as AuthUser["role"],
      membershipLevel: user.membershipLevel as AuthUser["membershipLevel"],
      isAccountant: user.isAccountant,
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
