"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const user_repo_1 = require("../repositories/user.repo");
const notification_service_1 = require("./notification.service");
const errors_1 = require("../utils/errors");
exports.userService = {
    // Admin: List all users or filter by approval status
    list: async (actor, filters) => {
        if (actor.role !== "ADMIN") {
            throw new errors_1.AppError("Forbidden", 403);
        }
        return user_repo_1.userRepo.list(filters);
    },
    // Admin: Get pending registrations
    listPendingRegistrations: async (actor) => {
        if (actor.role !== "ADMIN") {
            throw new errors_1.AppError("Forbidden", 403);
        }
        return user_repo_1.userRepo.list({ isActive: false });
    },
    // Admin: Approve user registration
    approveUser: async (userId, actor) => {
        if (actor.role !== "ADMIN") {
            throw new errors_1.AppError("Forbidden", 403);
        }
        const user = await user_repo_1.userRepo.findById(userId);
        if (!user) {
            throw new errors_1.AppError("User not found", 404);
        }
        if (user.isActive) {
            throw new errors_1.AppError("User already approved", 400);
        }
        const updatedUser = await user_repo_1.userRepo.update(userId, { isActive: true });
        // Notify user about approval
        await notification_service_1.notificationService.notifyUserApproved(userId);
        return updatedUser;
    },
    // Admin: Deactivate user
    deactivateUser: async (userId, actor) => {
        if (actor.role !== "ADMIN") {
            throw new errors_1.AppError("Forbidden", 403);
        }
        return user_repo_1.userRepo.update(userId, { isActive: false });
    },
    // Admin: Update user's membership level
    updateMembershipLevel: async (userId, membershipLevel, actor) => {
        if (actor.role !== "ADMIN") {
            throw new errors_1.AppError("Forbidden", 403);
        }
        const validLevels = ["REGULAR_USER", "MEMBER", "HONORARY_MEMBER", "BOARD_MEMBER", "ADMIN_MEMBER"];
        if (!validLevels.includes(membershipLevel)) {
            throw new errors_1.AppError("Invalid membership level", 400);
        }
        const user = await user_repo_1.userRepo.findById(userId);
        if (!user) {
            throw new errors_1.AppError("User not found", 404);
        }
        const oldLevel = user.membershipLevel;
        // Update both membershipLevel and role if becoming admin
        const updateData = { membershipLevel };
        if (membershipLevel === "ADMIN_MEMBER") {
            updateData.role = "ADMIN";
        }
        else if (oldLevel === "ADMIN_MEMBER" && membershipLevel !== "ADMIN_MEMBER") {
            // Demoting from admin-member
            updateData.role = "USER";
        }
        const updatedUser = await user_repo_1.userRepo.update(userId, updateData);
        // Notify user about membership change
        if (oldLevel !== membershipLevel) {
            await notification_service_1.notificationService.notifyMembershipChanged(userId, oldLevel, membershipLevel);
        }
        return updatedUser;
    },
    // Admin: Update user's role
    updateRole: async (userId, role, actor) => {
        if (actor.role !== "ADMIN") {
            throw new errors_1.AppError("Forbidden", 403);
        }
        const validRoles = ["ADMIN", "USER"];
        if (!validRoles.includes(role)) {
            throw new errors_1.AppError("Invalid role", 400);
        }
        const user = await user_repo_1.userRepo.findById(userId);
        if (!user) {
            throw new errors_1.AppError("User not found", 404);
        }
        const normalizedRole = role;
        return user_repo_1.userRepo.update(userId, { role: normalizedRole });
    },
    // User: Get their own profile
    getProfile: async (userId, actor) => {
        if (actor.id !== userId && actor.role !== "ADMIN") {
            throw new errors_1.AppError("Forbidden", 403);
        }
        const user = await user_repo_1.userRepo.findById(userId);
        if (!user) {
            throw new errors_1.AppError("User not found", 404);
        }
        return user;
    },
    // User: Update their own profile
    updateProfile: async (userId, data, actor) => {
        if (actor.id !== userId && actor.role !== "ADMIN") {
            throw new errors_1.AppError("Forbidden", 403);
        }
        const user = await user_repo_1.userRepo.findById(userId);
        if (!user) {
            throw new errors_1.AppError("User not found", 404);
        }
        return user_repo_1.userRepo.update(userId, data);
    },
    getPublicProfile: async (userId) => {
        const user = await user_repo_1.userRepo.findById(userId);
        if (!user) {
            throw new errors_1.AppError("User not found", 404);
        }
        return {
            id: user.id,
            name: user.name,
            role: user.role,
            membershipLevel: user.membershipLevel,
            aboutMe: user.aboutMe,
            facebook: user.facebook,
            twitter: user.twitter,
            linkedin: user.linkedin,
            website: user.website,
            profilePicture: user.profilePicture,
            profilePicturePath: user.profilePicturePath,
            cvFile: user.cvFile,
            cvFilePath: user.cvFilePath,
        };
    },
    // Public: List all active users' public profiles
    listPublicProfiles: async () => {
        const users = await user_repo_1.userRepo.list({ isActive: true });
        return users.map((user) => ({
            id: user.id,
            name: user.name,
            role: user.role,
            membershipLevel: user.membershipLevel,
            aboutMe: user.aboutMe,
            facebook: user.facebook,
            twitter: user.twitter,
            linkedin: user.linkedin,
            website: user.website,
            profilePicture: user.profilePicture,
            profilePicturePath: user.profilePicturePath,
            cvFile: user.cvFile,
            cvFilePath: user.cvFilePath,
        }));
    },
};
