"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllNotifications = exports.deleteNotification = exports.markAllAsRead = exports.markAsRead = exports.getUnreadCount = exports.listNotifications = void 0;
const notification_service_1 = require("../services/notification.service");
const auth_1 = require("../middleware/auth");
exports.listNotifications = [
    auth_1.requireAuth,
    async (req, res, next) => {
        try {
            const unreadOnly = req.query.unreadOnly === "true";
            const take = req.query.take ? parseInt(req.query.take, 10) : 50;
            const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
            const notifications = await notification_service_1.notificationService.list(req.user, {
                unreadOnly,
                take,
                skip,
            });
            res.status(200).json(notifications);
        }
        catch (error) {
            next(error);
        }
    },
];
exports.getUnreadCount = [
    auth_1.requireAuth,
    async (req, res, next) => {
        try {
            const count = await notification_service_1.notificationService.getUnreadCount(req.user);
            res.status(200).json({ count });
        }
        catch (error) {
            next(error);
        }
    },
];
exports.markAsRead = [
    auth_1.requireAuth,
    async (req, res, next) => {
        try {
            const notification = await notification_service_1.notificationService.markAsRead(req.params.id, req.user);
            res.status(200).json(notification);
        }
        catch (error) {
            next(error);
        }
    },
];
exports.markAllAsRead = [
    auth_1.requireAuth,
    async (req, res, next) => {
        try {
            await notification_service_1.notificationService.markAllAsRead(req.user);
            res.status(200).json({ success: true });
        }
        catch (error) {
            next(error);
        }
    },
];
exports.deleteNotification = [
    auth_1.requireAuth,
    async (req, res, next) => {
        try {
            await notification_service_1.notificationService.delete(req.params.id, req.user);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    },
];
exports.deleteAllNotifications = [
    auth_1.requireAuth,
    async (req, res, next) => {
        try {
            await notification_service_1.notificationService.deleteAll(req.user);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    },
];
