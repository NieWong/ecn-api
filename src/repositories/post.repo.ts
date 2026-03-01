import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";

export const postRepo = {
  list: (args?: {
    where?: Record<string, unknown>;
    orderBy?: Record<string, "asc" | "desc">;
    skip?: number;
    take?: number;
  }) => {
    return prisma.post.findMany({
      where: args?.where,
      orderBy: args?.orderBy ?? { createdAt: "desc" },
      skip: args?.skip,
      take: args?.take,
      include: { author: true, categories: { include: { category: true } } },
    });
  },
  findById: (id: string) => {
    return prisma.post.findUnique({
      where: { id },
      include: { author: true, categories: { include: { category: true } } },
    });
  },
  findBySlug: (slug: string) => {
    return prisma.post.findUnique({ where: { slug } });
  },
  create: (data: {
    title: string;
    slug: string;
    summary?: string | null;
    contentJson: Prisma.InputJsonValue;
    contentHtml?: string | null;
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    visibility?: "PUBLIC" | "PRIVATE";
    authorId: string;
    categoryIds?: string[];
    coverImagePath?: string | null;
  }) => {
    return prisma.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        summary: data.summary ?? null,
        contentJson: data.contentJson,
        contentHtml: data.contentHtml ?? null,
        status: data.status ?? "DRAFT",
        visibility: data.visibility ?? "PUBLIC",
        authorId: data.authorId,
        coverImagePath: data.coverImagePath ?? null,
        categories: data.categoryIds
          ? {
              createMany: {
                data: data.categoryIds.map((categoryId) => ({ categoryId })),
              },
            }
          : undefined,
      },
      include: { author: true, categories: { include: { category: true } } },
    });
  },
  update: (id: string, data: {
    title?: string;
    slug?: string;
    summary?: string | null;
    contentJson?: Prisma.InputJsonValue;
    contentHtml?: string | null;
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    visibility?: "PUBLIC" | "PRIVATE";
    coverFileId?: string | null;
    coverImagePath?: string | null;
  }) => {
    const updateData: Prisma.PostUpdateInput = {
      title: data.title,
      slug: data.slug,
      summary: data.summary ?? undefined,
      contentJson: data.contentJson,
      contentHtml: data.contentHtml ?? undefined,
      status: data.status,
      visibility: data.visibility,
      coverImagePath: data.coverImagePath ?? undefined,
    };

    if (data.coverFileId !== undefined) {
      updateData.coverFile = data.coverFileId
        ? { connect: { id: data.coverFileId } }
        : { disconnect: true };
    }

    return prisma.post.update({
      where: { id },
      data: updateData,
      include: { author: true, categories: { include: { category: true } } },
    });
  },
  delete: (id: string) => {
    return prisma.post.delete({ where: { id } });
  },
};
