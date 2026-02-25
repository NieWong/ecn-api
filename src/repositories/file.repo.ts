import { prisma } from "../db/prisma";

export const fileRepo = {
  findById: (id: string) => {
    return prisma.file.findUnique({ where: { id } });
  },
  list: (args: {
    where?: Record<string, unknown>;
    orderBy?: Record<string, "asc" | "desc">;
    skip?: number;
    take?: number;
  }) => {
    return prisma.file.findMany({
      where: args.where,
      orderBy: args.orderBy,
      skip: args.skip,
      take: args.take,
    });
  },
  create: (data: {
    ownerId: string;
    kind: "IMAGE" | "DOCUMENT" | "OTHER";
    visibility: "PUBLIC" | "PRIVATE";
    originalName: string;
    mimeType: string;
    size: number;
    storageKey: string;
    width?: number | null;
    height?: number | null;
  }) => {
    return prisma.file.create({ data });
  },
  delete: (id: string) => {
    return prisma.file.delete({ where: { id } });
  },
};
