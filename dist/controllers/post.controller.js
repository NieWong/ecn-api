"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearPostCover = exports.setPostCover = exports.deletePost = exports.updatePost = exports.createPost = exports.getPost = exports.listPosts = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../db/prisma");
const post_service_1 = require("../services/post.service");
const auth_1 = require("../middleware/auth");
const middleware_1 = require("../validation/middleware");
const post_schema_1 = require("../validation/schemas/post.schema");
const errors_1 = require("../utils/errors");
exports.listPosts = [
    (0, middleware_1.validateQuery)(post_schema_1.listPostsQuerySchema),
    async (req, res, next) => {
        try {
            const query = req.query;
            const filters = [];
            if (query.status) {
                filters.push({ status: query.status });
            }
            if (query.visibility) {
                filters.push({ visibility: query.visibility });
            }
            if (query.authorId) {
                filters.push({ authorId: query.authorId });
            }
            if (query.categoryId) {
                filters.push({
                    categories: { some: { categoryId: query.categoryId } },
                });
            }
            if (query.search) {
                filters.push({
                    OR: [
                        { title: { contains: query.search, mode: "insensitive" } },
                        { summary: { contains: query.search, mode: "insensitive" } },
                    ],
                });
            }
            // Access control
            if (!req.user) {
                filters.push({ visibility: "PUBLIC" });
            }
            else if (req.user.role !== "ADMIN") {
                filters.push({
                    OR: [{ visibility: "PUBLIC" }, { authorId: req.user.id }],
                });
            }
            const orderBy = (() => {
                switch (query.sort) {
                    case "CREATED_AT_ASC":
                        return { createdAt: client_1.Prisma.SortOrder.asc };
                    case "PUBLISHED_AT_ASC":
                        return { publishedAt: client_1.Prisma.SortOrder.asc };
                    case "PUBLISHED_AT_DESC":
                        return { publishedAt: client_1.Prisma.SortOrder.desc };
                    default:
                        return { createdAt: client_1.Prisma.SortOrder.desc };
                }
            })();
            const posts = await prisma_1.prisma.post.findMany({
                where: filters.length ? { AND: filters } : undefined,
                orderBy,
                skip: query.skip ?? undefined,
                take: query.take ?? undefined,
            });
            res.status(200).json(posts);
        }
        catch (error) {
            next(error);
        }
    },
];
const getPost = async (req, res, next) => {
    try {
        const post = await prisma_1.prisma.post.findUnique({ where: { id: String(req.params.id) } });
        if (!post) {
            throw new errors_1.AppError("Post not found", 404);
        }
        // Access control
        if (post.visibility === "PUBLIC") {
            return res.status(200).json(post);
        }
        if (!req.user) {
            throw new errors_1.AppError("Forbidden", 403);
        }
        if (req.user.role !== "ADMIN" && post.authorId !== req.user.id) {
            throw new errors_1.AppError("Forbidden", 403);
        }
        res.status(200).json(post);
    }
    catch (error) {
        next(error);
    }
};
exports.getPost = getPost;
exports.createPost = [
    auth_1.requireAuth,
    (0, middleware_1.validateBody)(post_schema_1.createPostSchema),
    async (req, res, next) => {
        try {
            const post = await post_service_1.postService.create({
                ...req.body,
                authorId: req.user.id,
            });
            res.status(201).json(post);
        }
        catch (error) {
            next(error);
        }
    },
];
exports.updatePost = [
    auth_1.requireAuth,
    (0, middleware_1.validateBody)(post_schema_1.updatePostSchema),
    async (req, res, next) => {
        try {
            const post = await post_service_1.postService.update(String(req.params.id), req.body, req.user);
            res.status(200).json(post);
        }
        catch (error) {
            next(error);
        }
    },
];
exports.deletePost = [
    auth_1.requireAuth,
    async (req, res, next) => {
        try {
            await post_service_1.postService.remove(String(req.params.id), req.user);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    },
];
exports.setPostCover = [
    auth_1.requireAuth,
    (0, middleware_1.validateBody)(post_schema_1.setPostCoverSchema),
    async (req, res, next) => {
        try {
            const post = await post_service_1.postService.setCover(String(req.params.id), req.body.fileId, req.user);
            res.status(200).json(post);
        }
        catch (error) {
            next(error);
        }
    },
];
exports.clearPostCover = [
    auth_1.requireAuth,
    async (req, res, next) => {
        try {
            const post = await post_service_1.postService.setCover(String(req.params.id), null, req.user);
            res.status(200).json(post);
        }
        catch (error) {
            next(error);
        }
    },
];
