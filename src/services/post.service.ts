import { Prisma } from "@prisma/client";
import { categoryRepo } from "../repositories/category.repo";
import { fileRepo } from "../repositories/file.repo";
import { postRepo } from "../repositories/post.repo";
import { userRepo } from "../repositories/user.repo";
import { notificationService } from "./notification.service";
import type { AuthUser } from "../types/auth";
import { AppError } from "../utils/errors";
import { normalizeCategoryIdsByContentType, type ContentType } from "../utils/contentType";
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
  
  // List posts pending approval (admin only)
  listPendingApproval: async (actor: AuthUser) => {
    if (actor.role !== "ADMIN") {
      throw new AppError("Forbidden", 403);
    }
    return postRepo.findPendingApproval();
  },
  
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
    contentType?: ContentType;
    coverImagePath?: string | null;
  }) => {
    const generatedFromTitle = toSlug(data.title);
    const requestedSlug = data.slug ? toSlug(data.slug) : "";
    const slug = requestedSlug || generatedFromTitle || `post-${Date.now()}`;
    const existing = await postRepo.findBySlug(slug);
    if (existing) {
      throw new AppError("Slug already exists", 409);
    }
    
    const uniqueCategoryIds = Array.from(new Set(data.categoryIds ?? []));
    const categoryRows = uniqueCategoryIds.length
      ? await categoryRepo.findByIds(uniqueCategoryIds)
      : [];

    if (categoryRows.length !== uniqueCategoryIds.length) {
      throw new AppError("One or more categories are invalid", 400);
    }

    const normalizedCategoryIds = normalizeCategoryIdsByContentType(
      uniqueCategoryIds,
      categoryRows,
      data.contentType
    );

    const post = await postRepo.create({
      title: data.title,
      slug,
      summary: data.summary,
      contentJson: data.contentJson,
      contentHtml: data.contentHtml,
      status: data.status,
      visibility: data.visibility,
      authorId: data.authorId,
      categoryIds: normalizedCategoryIds,
      coverImagePath: data.coverImagePath,
    });

    if (post.status === "PUBLISHED") {
      await notificationService.notifyArticleSubmitted(post.id, post.title, data.authorId);

      const admins = await userRepo.list({ role: "ADMIN" });
      const adminIds = admins.map((admin) => admin.id);
      const author = await userRepo.findById(data.authorId);
      await notificationService.notifyAdminsNewSubmission(
        post.id,
        post.title,
        author?.name || "A user",
        adminIds
      );
    }
    
    return post;
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
    coverImagePath?: string | null;
    adminComment?: string | null;
    categoryIds?: string[];
    contentType?: ContentType;
    isApproved?: boolean;
    approvedAt?: Date | null;
    approvedById?: string | null;
    },
    actor: AuthUser
  ) => {
    const post = await postRepo.findById(id);
    if (!post) {
      throw new AppError("Post not found", 404);
    }
    assertPostAccess(post, actor);

    if (actor.role !== "ADMIN" && data.adminComment !== undefined) {
      throw new AppError("Forbidden", 403);
    }

    if (data.slug !== undefined) {
      const normalizedSlug = toSlug(data.slug);
      data.slug = normalizedSlug || toSlug(data.title ?? post.title) || post.slug || `post-${post.id}`;
      const existing = await postRepo.findBySlug(data.slug);
      if (existing && existing.id !== id) {
        throw new AppError("Slug already exists", 409);
      }
    }
    
    const uniqueCategoryIds = data.categoryIds
      ? Array.from(new Set(data.categoryIds))
      : undefined;

    let normalizedCategoryIds = uniqueCategoryIds;
    if (uniqueCategoryIds) {
      const categoryRows = uniqueCategoryIds.length
        ? await categoryRepo.findByIds(uniqueCategoryIds)
        : [];

      if (categoryRows.length !== uniqueCategoryIds.length) {
        throw new AppError("One or more categories are invalid", 400);
      }

      normalizedCategoryIds = normalizeCategoryIdsByContentType(
        uniqueCategoryIds,
        categoryRows,
        data.contentType
      );
    }

    const nextStatus = data.status ?? post.status;
    const shouldSubmitForReview = actor.role !== "ADMIN" && nextStatus === "PUBLISHED";

    if (shouldSubmitForReview) {
      data.isApproved = false;
      data.approvedAt = null;
      data.approvedById = null;
    }

    // If admin is adding a comment, notify the author
    if (actor.role === "ADMIN" && data.adminComment && data.adminComment !== post.adminComment) {
      await notificationService.notifyArticleCommented(
        post.id,
        post.title,
        post.authorId,
        data.adminComment
      );
    }

    const updatedPost = await postRepo.update(id, data, normalizedCategoryIds);

    if (
      shouldSubmitForReview &&
      (post.status !== "PUBLISHED" || post.isApproved)
    ) {
      await notificationService.notifyArticleSubmitted(post.id, updatedPost.title, post.authorId);

      const admins = await userRepo.list({ role: "ADMIN" });
      const adminIds = admins.map((admin) => admin.id);
      const author = await userRepo.findById(post.authorId);
      await notificationService.notifyAdminsNewSubmission(
        post.id,
        updatedPost.title,
        author?.name || "A user",
        adminIds
      );
    }

    return updatedPost;
  },
  
  // Approve a post (admin only)
  approve: async (id: string, actor: AuthUser) => {
    if (actor.role !== "ADMIN") {
      throw new AppError("Forbidden", 403);
    }
    
    const post = await postRepo.findById(id);
    if (!post) {
      throw new AppError("Post not found", 404);
    }
    
    if (post.isApproved) {
      throw new AppError("Post is already approved", 400);
    }
    
    const approvedPost = await postRepo.approve(id, actor.id);
    
    // Notify author
    await notificationService.notifyArticleApproved(post.id, post.title, post.authorId);
    
    return approvedPost;
  },
  
  // Reject a post (admin only)
  reject: async (id: string, reason: string, actor: AuthUser) => {
    if (actor.role !== "ADMIN") {
      throw new AppError("Forbidden", 403);
    }
    
    const post = await postRepo.findById(id);
    if (!post) {
      throw new AppError("Post not found", 404);
    }
    
    const rejectedPost = await postRepo.reject(id, reason);
    
    // Notify author
    await notificationService.notifyArticleRejected(post.id, post.title, post.authorId, reason);
    
    return rejectedPost;
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
