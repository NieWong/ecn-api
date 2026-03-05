import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";

const postInclude = {
  author: true,
  categories: { include: { category: true } },
  approvedBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
};

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
      include: postInclude,
    });
  },
  findById: (id: string) => {
    return prisma.post.findUnique({
      where: { id },
      include: postInclude,
    });
  },
  findBySlug: (slug: string) => {
    return prisma.post.findUnique({ where: { slug } });
  },
  // Find posts pending approval
  findPendingApproval: () => {
    return prisma.post.findMany({
      where: {
        isApproved: false,
        status: {
          in: ["DRAFT", "PUBLISHED"],
        },
      },
      orderBy: { createdAt: "desc" },
      include: postInclude,
    });
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
        isApproved: false, // All new posts need approval
        categories: data.categoryIds
          ? {
              createMany: {
                data: data.categoryIds.map((categoryId) => ({ categoryId })),
              },
            }
          : undefined,
      },
      include: postInclude,
    });
  },
  update: async (id: string, data: {
    title?: string;
    slug?: string;
    summary?: string | null;
    contentJson?: Prisma.InputJsonValue;
    contentHtml?: string | null;
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    visibility?: "PUBLIC" | "PRIVATE";
    coverFileId?: string | null;
    coverImagePath?: string | null;
    isApproved?: boolean;
    approvedAt?: Date | null;
    approvedById?: string | null;
    adminComment?: string | null;
  }, categoryIds?: string[]) => {
    const updateData: Prisma.PostUpdateInput = {
      title: data.title,
      slug: data.slug,
      summary: data.summary ?? undefined,
      contentJson: data.contentJson,
      contentHtml: data.contentHtml ?? undefined,
      status: data.status,
      visibility: data.visibility,
      coverImagePath: data.coverImagePath ?? undefined,
      isApproved: data.isApproved,
      approvedAt: data.approvedAt,
      adminComment: data.adminComment,
    };

    if (data.coverFileId !== undefined) {
      updateData.coverFile = data.coverFileId
        ? { connect: { id: data.coverFileId } }
        : { disconnect: true };
    }

    if (data.approvedById !== undefined) {
      updateData.approvedBy = data.approvedById
        ? { connect: { id: data.approvedById } }
        : { disconnect: true };
    }

    // Handle category updates if provided
    if (categoryIds !== undefined) {
      // Delete existing category relations and create new ones
      await prisma.postCategory.deleteMany({ where: { postId: id } });
      if (categoryIds.length > 0) {
        await prisma.postCategory.createMany({
          data: categoryIds.map((categoryId) => ({ postId: id, categoryId })),
        });
      }
    }

    return prisma.post.update({
      where: { id },
      data: updateData,
      include: postInclude,
    });
  },
  // Approve a post
  approve: (id: string, approvedById: string) => {
    return prisma.post.update({
      where: { id },
      data: {
        isApproved: true,
        approvedAt: new Date(),
        approvedById,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
      include: postInclude,
    });
  },
  // Reject a post (reset to draft with comment)
  reject: (id: string, adminComment: string) => {
    return prisma.post.update({
      where: { id },
      data: {
        isApproved: false,
        adminComment,
        status: "DRAFT",
      },
      include: postInclude,
    });
  },
  delete: (id: string) => {
    return prisma.post.delete({ where: { id } });
  },
};
