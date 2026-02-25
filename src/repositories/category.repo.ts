import { prisma } from "../db/prisma";

export const categoryRepo = {
  list: () => {
    return prisma.category.findMany({ orderBy: { name: "asc" } });
  },
  findById: (id: string) => {
    return prisma.category.findUnique({ where: { id } });
  },
  findBySlug: (slug: string) => {
    return prisma.category.findUnique({ where: { slug } });
  },
  create: (data: { name: string; slug: string }) => {
    return prisma.category.create({ data });
  },
  delete: (id: string) => {
    return prisma.category.delete({ where: { id } });
  },
};
