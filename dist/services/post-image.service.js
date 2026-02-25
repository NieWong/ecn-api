"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postImageService = void 0;
const file_repo_1 = require("../repositories/file.repo");
const post_image_repo_1 = require("../repositories/post-image.repo");
const post_repo_1 = require("../repositories/post.repo");
const errors_1 = require("../utils/errors");
const assertPostAccess = (post, actor) => {
    if (actor.role === "ADMIN") {
        return;
    }
    if (post.authorId !== actor.id) {
        throw new errors_1.AppError("Forbidden", 403);
    }
};
exports.postImageService = {
    add: async (params) => {
        const post = await post_repo_1.postRepo.findById(params.postId);
        if (!post) {
            throw new errors_1.AppError("Post not found", 404);
        }
        assertPostAccess(post, params.actor);
        const file = await file_repo_1.fileRepo.findById(params.fileId);
        if (!file) {
            throw new errors_1.AppError("File not found", 404);
        }
        if (params.actor.role !== "ADMIN" && file.ownerId !== params.actor.id) {
            throw new errors_1.AppError("Forbidden", 403);
        }
        return post_image_repo_1.postImageRepo.upsert({
            postId: params.postId,
            fileId: params.fileId,
            sort: params.sort,
        });
    },
    remove: async (params) => {
        const post = await post_repo_1.postRepo.findById(params.postId);
        if (!post) {
            throw new errors_1.AppError("Post not found", 404);
        }
        assertPostAccess(post, params.actor);
        await post_image_repo_1.postImageRepo.delete({ postId: params.postId, fileId: params.fileId });
        return true;
    },
};
