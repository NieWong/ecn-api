import { userRepo } from "../repositories/user.repo";
import { notificationService } from "./notification.service";
import type { AuthUser } from "../types/auth";
import { AppError } from "../utils/errors";

export const userService = {
  // Admin: List all users or filter by approval status
  list: async (actor: AuthUser, filters?: { isActive?: boolean }) => {
    if (actor.role !== "ADMIN") {
      throw new AppError("Forbidden", 403);
    }
    return userRepo.list(filters);
  },

  // Admin: Get pending registrations
  listPendingRegistrations: async (actor: AuthUser) => {
    if (actor.role !== "ADMIN") {
      throw new AppError("Forbidden", 403);
    }
    return userRepo.list({ isActive: false });
  },

  // Admin: Approve user registration
  approveUser: async (userId: string, actor: AuthUser) => {
    if (actor.role !== "ADMIN") {
      throw new AppError("Forbidden", 403);
    }
    
    const user = await userRepo.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.isActive) {
      throw new AppError("User already approved", 400);
    }

    const updatedUser = await userRepo.update(userId, { isActive: true });
    
    // Notify user about approval
    await notificationService.notifyUserApproved(userId);
    
    return updatedUser;
  },

  // Admin: Deactivate user
  deactivateUser: async (userId: string, actor: AuthUser) => {
    if (actor.role !== "ADMIN") {
      throw new AppError("Forbidden", 403);
    }
    
    return userRepo.update(userId, { isActive: false });
  },
  
  // Admin: Update user's membership level
  updateMembershipLevel: async (userId: string, membershipLevel: string, actor: AuthUser) => {
    if (actor.role !== "ADMIN") {
      throw new AppError("Forbidden", 403);
    }
    
    const validLevels = ["REGULAR_USER", "MEMBER", "HONORARY_MEMBER", "BOARD_MEMBER", "ADMIN_MEMBER"];
    if (!validLevels.includes(membershipLevel)) {
      throw new AppError("Invalid membership level", 400);
    }
    
    const user = await userRepo.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    
    const oldLevel = user.membershipLevel;
    
    // Update both membershipLevel and role if becoming admin
    const updateData: any = { membershipLevel };
    if (membershipLevel === "ADMIN_MEMBER") {
      updateData.role = "ADMIN";
    } else if (oldLevel === "ADMIN_MEMBER" && membershipLevel !== "ADMIN_MEMBER") {
      // Demoting from admin-member
      updateData.role = "USER";
    }
    
    const updatedUser = await userRepo.update(userId, updateData);
    
    // Notify user about membership change
    if (oldLevel !== membershipLevel) {
      await notificationService.notifyMembershipChanged(userId, oldLevel, membershipLevel);
    }
    
    return updatedUser;
  },
  
  // Admin: Update user's role
  updateRole: async (userId: string, role: string, actor: AuthUser) => {
    if (actor.role !== "ADMIN") {
      throw new AppError("Forbidden", 403);
    }
    
    const validRoles = ["ADMIN", "USER"];
    if (!validRoles.includes(role)) {
      throw new AppError("Invalid role", 400);
    }
    
    const user = await userRepo.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const normalizedRole = role as "ADMIN" | "USER";

    return userRepo.update(userId, { role: normalizedRole });
  },

  // User: Get their own profile
  getProfile: async (userId: string, actor: AuthUser) => {
    if (actor.id !== userId && actor.role !== "ADMIN") {
      throw new AppError("Forbidden", 403);
    }
    
    const user = await userRepo.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    
    return user;
  },

  // User: Update their own profile
  updateProfile: async (userId: string, data: {
    name?: string;
    aboutMe?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    phone?: string;
    website?: string;
    profilePictureId?: string;
    profilePicturePath?: string | null;
    cvFileId?: string;
    cvFilePath?: string | null;
  }, actor: AuthUser) => {
    if (actor.id !== userId && actor.role !== "ADMIN") {
      throw new AppError("Forbidden", 403);
    }

    const user = await userRepo.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    return userRepo.update(userId, data);
  },

  getPublicProfile: async (userId: string) => {
    const user = await userRepo.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
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
    const users = await userRepo.list({ isActive: true });
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
