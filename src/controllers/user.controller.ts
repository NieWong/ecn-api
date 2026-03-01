import type { RequestHandler } from "express";
import { userService } from "../services/user.service";
import { requireAuth, requireRole } from "../middleware/auth";
import { validateBody } from "../validation/middleware";
import { updateProfileSchema } from "../validation/schemas/user.schema";

export const listUsers: RequestHandler[] = [
  requireAuth,
  requireRole("ADMIN"),
  async (req: any, res: any, next: any) => {
    try {
      const isActive = req.query.isActive === 'true' ? true : 
                      req.query.isActive === 'false' ? false : undefined;
      const users = await userService.list(req.user, { isActive });
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  },
];

export const listPendingRegistrations: RequestHandler[] = [
  requireAuth,
  requireRole("ADMIN"),
  async (req: any, res: any, next: any) => {
    try {
      const users = await userService.listPendingRegistrations(req.user);
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  },
];

export const approveUser: RequestHandler[] = [
  requireAuth,
  requireRole("ADMIN"),
  async (req: any, res: any, next: any) => {
    try {
      const user = await userService.approveUser(req.params.id, req.user);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },
];

export const deactivateUser: RequestHandler[] = [
  requireAuth,
  requireRole("ADMIN"),
  async (req: any, res: any, next: any) => {
    try {
      const user = await userService.deactivateUser(req.params.id, req.user);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },
];

export const getProfile: RequestHandler[] = [
  requireAuth,
  async (req: any, res: any, next: any) => {
    try {
      const userId = req.params.id || req.user.id;
      const user = await userService.getProfile(userId, req.user);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },
];

export const updateProfile: RequestHandler[] = [
  requireAuth,
  validateBody(updateProfileSchema),
  async (req: any, res: any, next: any) => {
    try {
      const userId = req.params.id || req.user.id;
      const user = await userService.updateProfile(userId, req.body, req.user);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },
];

export const getPublicProfile: RequestHandler = async (req: any, res: any, next: any) => {
  try {
    const user = await userService.getPublicProfile(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const listPublicProfiles: RequestHandler = async (req: any, res: any, next: any) => {
  try {
    const users = await userService.listPublicProfiles();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};
