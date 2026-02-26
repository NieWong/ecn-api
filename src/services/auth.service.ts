import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { userRepo } from "../repositories/user.repo";
import { AppError } from "../utils/errors";

const createToken = (user: { id: string; email: string; role: string }) => {
  return jwt.sign(
    { email: user.email, role: user.role },
    env.jwtSecret,
    {
      subject: user.id,
      expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
    }
  );
};

export const authService = {
  // User registers without password - awaits admin approval
  register: async (data: { email: string; name?: string }) => {
    const existing = await userRepo.findByEmail(data.email);
    if (existing) {
      throw new AppError("Email already in use", 409);
    }

    const user = await userRepo.create({
      email: data.email,
      name: data.name ?? null,
      password: null,
    });

    return { 
      user, 
      message: "Registration request submitted. Please wait for admin approval." 
    };
  },

  // After admin approval, user sets their password
  setPassword: async (data: { email: string; password: string }) => {
    const user = await userRepo.findByEmail(data.email);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!user.isActive) {
      throw new AppError("Account not approved yet", 403);
    }

    if (user.password) {
      throw new AppError("Password already set. Please use login.", 400);
    }

    const hashed = await bcrypt.hash(data.password, 10);
    const updatedUser = await userRepo.update(user.id, { password: hashed });

    const token = createToken({ id: updatedUser.id, email: updatedUser.email, role: updatedUser.role });
    return { user: updatedUser, token };
  },

  login: async (data: { email: string; password: string }) => {
    const user = await userRepo.findByEmail(data.email);
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    if (!user.isActive) {
      throw new AppError("Account not approved or deactivated", 403);
    }

    if (!user.password) {
      throw new AppError("Please set your password first", 400);
    }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = createToken({ id: user.id, email: user.email, role: user.role });
    return { user, token };
  },
};
