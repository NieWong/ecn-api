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
  register: async (data: { email: string; password: string; name?: string }) => {
    const existing = await userRepo.findByEmail(data.email);
    if (existing) {
      throw new AppError("Email already in use", 409);
    }

    const hashed = await bcrypt.hash(data.password, 10);
    const user = await userRepo.create({
      email: data.email,
      name: data.name ?? null,
      password: hashed,
    });

    const token = createToken({ id: user.id, email: user.email, role: user.role });
    return { user, token };
  },
  login: async (data: { email: string; password: string }) => {
    const user = await userRepo.findByEmail(data.email);
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = createToken({ id: user.id, email: user.email, role: user.role });
    return { user, token };
  },
};
