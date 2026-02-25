import { prisma } from "../db/prisma";

export const userRepo = {
  findByEmail: (email: string) => {
    return prisma.user.findUnique({ where: { email } });
  },
  findById: (id: string) => {
    return prisma.user.findUnique({ where: { id } });
  },
  list: () => {
    return prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  },
  create: (data: { email: string; name?: string | null; password: string }) => {
    return prisma.user.create({ data });
  },
};
