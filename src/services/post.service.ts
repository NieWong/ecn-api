import { Prisma } from "@prisma/client";
import { fileRepo } from "../repositories/file.repo";
import { postRepo } from "../repositories/post.repo";
import type { AuthUser } from "../types/auth";
import { AppError } from "../utils/errors";
import { toSlug } from "../utils/slug";

const assertPostAccess = (post: { authorId: string }, actor: AuthUser) => {
  if (actor.role === "ADMIN") {
    return;
  }
  if (post.authorId !== actor.id) {
    throw new AppError("Forbidden", 403);
  }
};

export const postService = {
  list: () => postRepo.list(),
  getById: async (id: string) => {
    const post = await postRepo.findById(id);
    if (!post) {
      throw new AppError("Post not found", 404);
    }
    return post;
  },
  create: async (data: {
    title: string;
    slug?: string;
    summary?: string | null;
    contentJson: Prisma.InputJsonValue;
    contentHtml?: string | null;
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    visibility?: "PUBLIC" | "PRIVATE";
    authorId: string;
    categoryIds?: string[];
  }) => {
    const slug = data.slug ? toSlug(data.slug) : toSlug(data.title);
    const existing = await postRepo.findBySlug(slug);
    if (existing) {
      throw new AppError("Slug already exists", 409);
    }
    return postRepo.create({ ...data, slug });
  },
  update: async (
    id: string,
    data: {
    title?: string;
    slug?: string;
    summary?: string | null;
      contentJson?: Prisma.InputJsonValue;
    contentHtml?: string | null;
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    visibility?: "PUBLIC" | "PRIVATE";
    },
    actor: AuthUser
  ) => {
    const post = await postRepo.findById(id);
    if (!post) {
      throw new AppError("Post not found", 404);
    }
    assertPostAccess(post, actor);

    if (data.slug) {
      data.slug = toSlug(data.slug);
      const existing = await postRepo.findBySlug(data.slug);
      if (existing && existing.id !== id) {
        throw new AppError("Slug already exists", 409);
      }
    }
    return postRepo.update(id, data);
  },
  remove: async (id: string, actor: AuthUser) => {
    const post = await postRepo.findById(id);
    if (!post) {
      throw new AppError("Post not found", 404);
    }
    assertPostAccess(post, actor);
    return postRepo.delete(id);
  },
  setCover: async (id: string, fileId: string | null, actor: AuthUser) => {
    const post = await postRepo.findById(id);
    if (!post) {
      throw new AppError("Post not found", 404);
    }
    assertPostAccess(post, actor);
    if (fileId) {
      const file = await fileRepo.findById(fileId);
      if (!file) {
        throw new AppError("File not found", 404);
      }
      if (actor.role !== "ADMIN" && file.ownerId !== actor.id) {
        throw new AppError("Forbidden", 403);
      }
    }
    return postRepo.update(id, { coverFileId: fileId ?? null });
  },
};
