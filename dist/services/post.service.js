"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postService = void 0;
const file_repo_1 = require("../repositories/file.repo");
const post_repo_1 = require("../repositories/post.repo");
const user_repo_1 = require("../repositories/user.repo");
const notification_service_1 = require("./notification.service");
const errors_1 = require("../utils/errors");
const slug_1 = require("../utils/slug");
const assertPostAccess = (post, actor) => {
    if (actor.role === "ADMIN") {
        return;
    }
    if (post.authorId !== actor.id) {
        throw new errors_1.AppError("Forbidden", 403);
    }
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
        const slug = data.slug ? (0, slug_1.toSlug)(data.slug) : (0, slug_1.toSlug)(data.title);
        const existing = await post_repo_1.postRepo.findBySlug(slug);
        if (existing) {
            throw new errors_1.AppError("Slug already exists", 409);
        }
        const post = await post_repo_1.postRepo.create({ ...data, slug });
        // Notify author about submission
        await notification_service_1.notificationService.notifyArticleSubmitted(post.id, post.title, data.authorId);
        // Notify all admins about new submission
        const admins = await user_repo_1.userRepo.list({ role: "ADMIN" });
        const adminIds = admins.map(admin => admin.id);
        const author = await user_repo_1.userRepo.findById(data.authorId);
        await notification_service_1.notificationService.notifyAdminsNewSubmission(post.id, post.title, author?.name || "A user", adminIds);
        return post;
    },
    update: async (id, data, actor) => {
        const post = await post_repo_1.postRepo.findById(id);
        if (!post) {
            throw new errors_1.AppError("Post not found", 404);
        }
        assertPostAccess(post, actor);
        if (data.slug) {
            data.slug = (0, slug_1.toSlug)(data.slug);
            const existing = await post_repo_1.postRepo.findBySlug(data.slug);
            if (existing && existing.id !== id) {
                throw new errors_1.AppError("Slug already exists", 409);
            }
        }
        // If admin is adding a comment, notify the author
        if (actor.role === "ADMIN" && data.adminComment && data.adminComment !== post.adminComment) {
            await notification_service_1.notificationService.notifyArticleCommented(post.id, post.title, post.authorId, data.adminComment);
        }
        return post_repo_1.postRepo.update(id, data, data.categoryIds);
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
