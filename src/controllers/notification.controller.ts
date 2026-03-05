import type { RequestHandler } from "express";
import { notificationService } from "../services/notification.service";
import { requireAuth } from "../middleware/auth";

export const listNotifications: RequestHandler[] = [
  requireAuth,
  async (req: any, res: any, next: any) => {
    try {
      const unreadOnly = req.query.unreadOnly === "true";
      const take = req.query.take ? parseInt(req.query.take, 10) : 50;
      const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
      
      const notifications = await notificationService.list(req.user, {
        unreadOnly,
        take,
        skip,
      });
      res.status(200).json(notifications);
    } catch (error) {
      next(error);
    }
  },
];

export const getUnreadCount: RequestHandler[] = [
  requireAuth,
  async (req: any, res: any, next: any) => {
    try {
      const count = await notificationService.getUnreadCount(req.user);
      res.status(200).json({ count });
    } catch (error) {
      next(error);
    }
  },
];

export const markAsRead: RequestHandler[] = [
  requireAuth,
  async (req: any, res: any, next: any) => {
    try {
      const notification = await notificationService.markAsRead(
        req.params.id,
        req.user
      );
      res.status(200).json(notification);
    } catch (error) {
      next(error);
    }
  },
];

export const markAllAsRead: RequestHandler[] = [
  requireAuth,
  async (req: any, res: any, next: any) => {
    try {
      await notificationService.markAllAsRead(req.user);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  },
];

export const deleteNotification: RequestHandler[] = [
  requireAuth,
  async (req: any, res: any, next: any) => {
    try {
      await notificationService.delete(req.params.id, req.user);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
];

export const deleteAllNotifications: RequestHandler[] = [
  requireAuth,
  async (req: any, res: any, next: any) => {
    try {
      await notificationService.deleteAll(req.user);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
];
