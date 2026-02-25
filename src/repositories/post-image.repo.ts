import { prisma } from "../db/prisma";

export const postImageRepo = {
  upsert: (data: { postId: string; fileId: string; sort?: number }) => {
    return prisma.postImage.upsert({
      where: { postId_fileId: { postId: data.postId, fileId: data.fileId } },
      update: { sort: data.sort ?? 0 },
      create: { postId: data.postId, fileId: data.fileId, sort: data.sort ?? 0 },
    });
  },
  delete: (data: { postId: string; fileId: string }) => {
    return prisma.postImage.delete({ where: { postId_fileId: data } });
  },
};
