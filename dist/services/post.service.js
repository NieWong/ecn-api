"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postService = void 0;
const file_repo_1 = require("../repositories/file.repo");
const post_repo_1 = require("../repositories/post.repo");
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
        return post_repo_1.postRepo.create({ ...data, slug });
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
        return post_repo_1.postRepo.update(id, data);
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
