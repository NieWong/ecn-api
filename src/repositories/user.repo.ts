import { prisma } from "../db/prisma";
import type { MembershipLevel, Prisma, Role } from "@prisma/client";

export const userRepo = {
  findByEmail: (email: string) => {
    return prisma.user.findUnique({ 
      where: { email },
      include: {
        profilePicture: true,
        cvFile: true,
      }
    });
  },
  findById: (id: string) => {
    return prisma.user.findUnique({ 
      where: { id },
      include: {
        profilePicture: true,
        cvFile: true,
      }
    });
  },
  list: (filters?: { isActive?: boolean; role?: Role }) => {
    const where: Prisma.UserWhereInput | undefined = filters
      ? {
          isActive: filters.isActive,
          role: filters.role,
        }
      : undefined;

    return prisma.user.findMany({ 
      where,
      orderBy: { createdAt: "desc" },
      include: {
        profilePicture: true,
        cvFile: true,
      }
    });
  },
  create: (data: { email: string; name?: string | null; password: string | null }) => {
    return prisma.user.create({ data });
  },
  update: (id: string, data: Partial<{
    name: string | null;
    password: string | null;
    isActive: boolean;
    role: Role;
    membershipLevel: MembershipLevel;
    profilePictureId: string | null;
    profilePicturePath: string | null;
    cvFileId: string | null;
    cvFilePath: string | null;
    aboutMe: string | null;
    facebook: string | null;
    twitter: string | null;
    linkedin: string | null;
    phone: string | null;
    website: string | null;
  }>) => {
    return prisma.user.update({ 
      where: { id }, 
      data: data as any,
      include: {
        profilePicture: true,
        cvFile: true,
      }
    });
  },
  delete: (id: string) => {
    return prisma.user.delete({ where: { id } });
  },
};
