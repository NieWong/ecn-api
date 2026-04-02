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
  update: (id: string, data: { name?: string; slug?: string }) => {
    return prisma.category.update({ where: { id }, data });
  },
  delete: (id: string) => {
    return prisma.category.delete({ where: { id } });
  },
  findByIds: (ids: string[]) => {
    return prisma.category.findMany({ where: { id: { in: ids } } });
  },
};
