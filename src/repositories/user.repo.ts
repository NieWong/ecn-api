import { prisma } from "../db/prisma";

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
  list: (filters?: { isActive?: boolean; role?: string }) => {
    return prisma.user.findMany({ 
      where: filters,
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
    role: string;
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
      data,
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
