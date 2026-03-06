"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserRole = exports.updateMembershipLevel = exports.listPublicProfiles = exports.getPublicProfile = exports.updateProfile = exports.getProfile = exports.deleteUser = exports.deactivateUser = exports.approveUser = exports.listPendingRegistrations = exports.listUsers = void 0;
const user_service_1 = require("../services/user.service");
const auth_1 = require("../middleware/auth");
const middleware_1 = require("../validation/middleware");
const user_schema_1 = require("../validation/schemas/user.schema");
exports.listUsers = [
    auth_1.requireAuth,
    (0, auth_1.requireRole)("ADMIN"),
    async (req, res, next) => {
        try {
            const isActive = req.query.isActive === 'true' ? true :
                req.query.isActive === 'false' ? false : undefined;
            const users = await user_service_1.userService.list(req.user, { isActive });
            res.status(200).json(users);
        }
        catch (error) {
            next(error);
        }
    },
];
exports.listPendingRegistrations = [
    auth_1.requireAuth,
    (0, auth_1.requireRole)("ADMIN"),
    async (req, res, next) => {
        try {
            const users = await user_service_1.userService.listPendingRegistrations(req.user);
            res.status(200).json(users);
        }
        catch (error) {
            next(error);
        }
    },
];
exports.approveUser = [
    auth_1.requireAuth,
    (0, auth_1.requireRole)("ADMIN"),
    async (req, res, next) => {
        try {
            const user = await user_service_1.userService.approveUser(req.params.id, req.user);
            res.status(200).json(user);
        }
        catch (error) {
            next(error);
        }
    },
];
exports.deactivateUser = [
    auth_1.requireAuth,
    (0, auth_1.requireRole)("ADMIN"),
    async (req, res, next) => {
        try {
            const user = await user_service_1.userService.deactivateUser(req.params.id, req.user);
            res.status(200).json(user);
        }
        catch (error) {
            next(error);
        }
    },
];
exports.deleteUser = [
    auth_1.requireAuth,
    (0, auth_1.requireRole)("ADMIN"),
    async (req, res, next) => {
        try {
            await user_service_1.userService.deleteUser(req.params.id, req.user);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    },
];
exports.getProfile = [
    auth_1.requireAuth,
    async (req, res, next) => {
        try {
            const userId = req.params.id || req.user.id;
            const user = await user_service_1.userService.getProfile(userId, req.user);
            res.status(200).json(user);
        }
        catch (error) {
            next(error);
        }
    },
];
exports.updateProfile = [
    auth_1.requireAuth,
    (0, middleware_1.validateBody)(user_schema_1.updateProfileSchema),
    async (req, res, next) => {
        try {
            const userId = req.params.id || req.user.id;
            const user = await user_service_1.userService.updateProfile(userId, req.body, req.user);
            res.status(200).json(user);
        }
        catch (error) {
            next(error);
        }
    },
];
const getPublicProfile = async (req, res, next) => {
    try {
        const user = await user_service_1.userService.getPublicProfile(req.params.id);
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
};
exports.getPublicProfile = getPublicProfile;
const listPublicProfiles = async (req, res, next) => {
    try {
        const users = await user_service_1.userService.listPublicProfiles();
        res.status(200).json(users);
    }
    catch (error) {
        next(error);
    }
};
exports.listPublicProfiles = listPublicProfiles;
// Admin: Update user's membership level
exports.updateMembershipLevel = [
    auth_1.requireAuth,
    (0, auth_1.requireRole)("ADMIN"),
    async (req, res, next) => {
        try {
            const { membershipLevel } = req.body;
            if (!membershipLevel) {
                return res.status(400).json({ error: "membershipLevel is required" });
            }
            const user = await user_service_1.userService.updateMembershipLevel(req.params.id, membershipLevel, req.user);
            res.status(200).json(user);
        }
        catch (error) {
            next(error);
        }
    },
];
// Admin: Update user's role
exports.updateUserRole = [
    auth_1.requireAuth,
    (0, auth_1.requireRole)("ADMIN"),
    async (req, res, next) => {
        try {
            const { role } = req.body;
            if (!role) {
                return res.status(400).json({ error: "role is required" });
            }
            const user = await user_service_1.userService.updateRole(req.params.id, role, req.user);
            res.status(200).json(user);
        }
        catch (error) {
            next(error);
        }
    },
];
