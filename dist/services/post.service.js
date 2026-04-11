"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postService = void 0;
const category_repo_1 = require("../repositories/category.repo");
const file_repo_1 = require("../repositories/file.repo");
const post_repo_1 = require("../repositories/post.repo");
const user_repo_1 = require("../repositories/user.repo");
const notification_service_1 = require("./notification.service");
const errors_1 = require("../utils/errors");
const contentType_1 = require("../utils/contentType");
const slug_1 = require("../utils/slug");
const assertPostAccess = (post, actor) => {
    if (actor.role === "ADMIN") {
        return;
    }
    if (post.authorId !== actor.id) {
        throw new errors_1.AppError("Forbidden", 403);
    }
};
const canCreateMemberPost = (actor) => {
    return actor.role === "ADMIN" || actor.isAccountant || actor.membershipLevel !== "REGULAR_USER";
};
const assertCanCreatePost = (actor) => {
    if (!canCreateMemberPost(actor)) {
        throw new errors_1.AppError("Only members can create posts", 403);
    }
};
const validateAttachmentOwnership = async (attachmentFileIds, actor) => {
    if (!attachmentFileIds || attachmentFileIds.length === 0) {
        return [];
    }
    const uniqueFileIds = Array.from(new Set(attachmentFileIds));
    const files = await file_repo_1.fileRepo.list({ where: { id: { in: uniqueFileIds } } });
    if (files.length !== uniqueFileIds.length) {
        throw new errors_1.AppError("One or more attachment files are invalid", 400);
    }
    if (actor.role !== "ADMIN") {
        const hasForeignFile = files.some((file) => file.ownerId !== actor.id);
        if (hasForeignFile) {
            throw new errors_1.AppError("Forbidden", 403);
        }
    }
    return uniqueFileIds;
};
exports.postService = {
    list: () => post_repo_1.postRepo.list(),
    // List posts pending approval (admin only)
    listPendingApproval: async (actor) => {
        if (actor.role !== "ADMIN") {
            throw new errors_1.AppError("Forbidden", 403);
        }
        return post_repo_1.postRepo.findPendingApproval();
    },
    getById: async (id) => {
        const post = await post_repo_1.postRepo.findById(id);
        if (!post) {
            throw new errors_1.AppError("Post not found", 404);
        }
        return post;
    },
    create: async (data) => {
        assertCanCreatePost(data.actor);
        const generatedFromTitle = (0, slug_1.toSlug)(data.title);
        const requestedSlug = data.slug ? (0, slug_1.toSlug)(data.slug) : "";
        const slug = requestedSlug || generatedFromTitle || `post-${Date.now()}`;
        const existing = await post_repo_1.postRepo.findBySlug(slug);
        if (existing) {
            throw new errors_1.AppError("Slug already exists", 409);
        }
        const uniqueCategoryIds = Array.from(new Set(data.categoryIds ?? []));
        const categoryRows = uniqueCategoryIds.length
            ? await category_repo_1.categoryRepo.findByIds(uniqueCategoryIds)
            : [];
        if (categoryRows.length !== uniqueCategoryIds.length) {
            throw new errors_1.AppError("One or more categories are invalid", 400);
        }
        const normalizedCategoryIds = (0, contentType_1.normalizeCategoryIdsByContentType)(uniqueCategoryIds, categoryRows, data.contentType);
        const attachmentFileIds = await validateAttachmentOwnership(data.attachmentFileIds, data.actor);
        const post = await post_repo_1.postRepo.create({
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
            attachmentFileIds,
        });
        if (post.status === "PUBLISHED") {
            await notification_service_1.notificationService.notifyArticleSubmitted(post.id, post.title, data.authorId);
            const admins = await user_repo_1.userRepo.list({ role: "ADMIN" });
            const adminIds = admins.map((admin) => admin.id);
            const author = await user_repo_1.userRepo.findById(data.authorId);
            await notification_service_1.notificationService.notifyAdminsNewSubmission(post.id, post.title, author?.name || "A user", adminIds);
        }
        return post;
    },
    update: async (id, data, actor) => {
        const post = await post_repo_1.postRepo.findById(id);
        if (!post) {
            throw new errors_1.AppError("Post not found", 404);
        }
        assertPostAccess(post, actor);
        if (actor.role !== "ADMIN" && data.adminComment !== undefined) {
            throw new errors_1.AppError("Forbidden", 403);
        }
        if (data.slug !== undefined) {
            const normalizedSlug = (0, slug_1.toSlug)(data.slug);
            data.slug = normalizedSlug || (0, slug_1.toSlug)(data.title ?? post.title) || post.slug || `post-${post.id}`;
            const existing = await post_repo_1.postRepo.findBySlug(data.slug);
            if (existing && existing.id !== id) {
                throw new errors_1.AppError("Slug already exists", 409);
            }
        }
        const uniqueCategoryIds = data.categoryIds
            ? Array.from(new Set(data.categoryIds))
            : undefined;
        let normalizedCategoryIds = uniqueCategoryIds;
        if (uniqueCategoryIds) {
            const categoryRows = uniqueCategoryIds.length
                ? await category_repo_1.categoryRepo.findByIds(uniqueCategoryIds)
                : [];
            if (categoryRows.length !== uniqueCategoryIds.length) {
                throw new errors_1.AppError("One or more categories are invalid", 400);
            }
            normalizedCategoryIds = (0, contentType_1.normalizeCategoryIdsByContentType)(uniqueCategoryIds, categoryRows, data.contentType);
        }
        const attachmentFileIds = await validateAttachmentOwnership(data.attachmentFileIds, actor);
        const nextStatus = data.status ?? post.status;
        const shouldSubmitForReview = actor.role !== "ADMIN" && nextStatus === "PUBLISHED";
        if (shouldSubmitForReview) {
            data.isApproved = false;
            data.approvedAt = null;
            data.approvedById = null;
        }
        // If admin is adding a comment, notify the author
        if (actor.role === "ADMIN" && data.adminComment && data.adminComment !== post.adminComment) {
            await notification_service_1.notificationService.notifyArticleCommented(post.id, post.title, post.authorId, data.adminComment);
        }
        const updatedPost = await post_repo_1.postRepo.update(id, data, normalizedCategoryIds, data.attachmentFileIds === undefined ? undefined : attachmentFileIds);
        if (shouldSubmitForReview &&
            (post.status !== "PUBLISHED" || post.isApproved)) {
            await notification_service_1.notificationService.notifyArticleSubmitted(post.id, updatedPost.title, post.authorId);
            const admins = await user_repo_1.userRepo.list({ role: "ADMIN" });
            const adminIds = admins.map((admin) => admin.id);
            const author = await user_repo_1.userRepo.findById(post.authorId);
            await notification_service_1.notificationService.notifyAdminsNewSubmission(post.id, updatedPost.title, author?.name || "A user", adminIds);
        }
        return updatedPost;
    },
    // Approve a post (admin only)
    approve: async (id, actor) => {
        if (actor.role !== "ADMIN") {
            throw new errors_1.AppError("Forbidden", 403);
        }
        const post = await post_repo_1.postRepo.findById(id);
        if (!post) {
            throw new errors_1.AppError("Post not found", 404);
        }
        if (post.isApproved) {
            throw new errors_1.AppError("Post is already approved", 400);
        }
        const approvedPost = await post_repo_1.postRepo.approve(id, actor.id);
        // Notify author
        await notification_service_1.notificationService.notifyArticleApproved(post.id, post.title, post.authorId);
        return approvedPost;
    },
    // Reject a post (admin only)
    reject: async (id, reason, actor) => {
        if (actor.role !== "ADMIN") {
            throw new errors_1.AppError("Forbidden", 403);
        }
        const post = await post_repo_1.postRepo.findById(id);
        if (!post) {
            throw new errors_1.AppError("Post not found", 404);
        }
        const rejectedPost = await post_repo_1.postRepo.reject(id, reason);
        // Notify author
        await notification_service_1.notificationService.notifyArticleRejected(post.id, post.title, post.authorId, reason);
        return rejectedPost;
    },
    remove: async (id, actor) => {
        const post = await post_repo_1.postRepo.findById(id);
        if (!post) {
            throw new errors_1.AppError("Post not found", 404);
        }
        assertPostAccess(post, actor);
        return post_repo_1.postRepo.delete(id);
    },
    setCover: async (id, fileId, actor) => {
        const post = await post_repo_1.postRepo.findById(id);
        if (!post) {
            throw new errors_1.AppError("Post not found", 404);
        }
        assertPostAccess(post, actor);
        if (fileId) {
            const file = await file_repo_1.fileRepo.findById(fileId);
            if (!file) {
                throw new errors_1.AppError("File not found", 404);
            }
            if (actor.role !== "ADMIN" && file.ownerId !== actor.id) {
                throw new errors_1.AppError("Forbidden", 403);
            }
        }
        return post_repo_1.postRepo.update(id, { coverFileId: fileId ?? null });
    },
};
