import { Router } from "express";
import * as notificationController from "../controllers/notification.controller";

const router = Router();

router.get("/", ...notificationController.listNotifications);
router.get("/unread-count", ...notificationController.getUnreadCount);
router.post("/mark-all-read", ...notificationController.markAllAsRead);
router.post("/:id/read", ...notificationController.markAsRead);
router.delete("/:id", ...notificationController.deleteNotification);
router.delete("/", ...notificationController.deleteAllNotifications);

export default router;
