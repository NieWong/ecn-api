import { userRepo } from "../repositories/user.repo";
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

    return userRepo.update(userId, { isActive: true });
  },

  // Admin: Deactivate user
  deactivateUser: async (userId: string, actor: AuthUser) => {
    if (actor.role !== "ADMIN") {
      throw new AppError("Forbidden", 403);
    }
    
    return userRepo.update(userId, { isActive: false });
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
