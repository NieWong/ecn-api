"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectPost = exports.approvePost = exports.listPendingApproval = exports.clearPostCover = exports.setPostCover = exports.deletePost = exports.updatePost = exports.createPost = exports.getPost = exports.listPosts = void 0;
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
        console.log('listPosts controller - Starting...');
        console.log('listPosts controller - Query params:', req.query);
        console.log('listPosts controller - User:', req.user ? { id: req.user.id, role: req.user.role } : 'Not authenticated');
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
            // Public published feed must always be approved (including when admin is logged in)
            if (query.visibility === "PUBLIC" && query.status === "PUBLISHED") {
                filters.push({ isApproved: true });
            }
            // Access control
            if (!req.user) {
                // Non-authenticated users: only see public approved posts
                filters.push({ visibility: "PUBLIC", isApproved: true });
            }
            else if (req.user.role !== "ADMIN") {
                // Authenticated non-admin: see public approved posts OR their own posts (approved or pending)
                filters.push({
                    OR: [
                        { visibility: "PUBLIC", isApproved: true },
                        { authorId: req.user.id },
                    ],
                });
            }
            // Admins see everything (no approval filter needed)
            console.log('listPosts controller - Filters:', JSON.stringify(filters, null, 2));
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
            console.log('listPosts controller - OrderBy:', orderBy);
            console.log('listPosts controller - About to query database...');
            // Parse numeric parameters (they come as strings from query)
            const take = query.take ? parseInt(query.take, 10) : undefined;
            const skip = query.skip ? parseInt(query.skip, 10) : undefined;
            const posts = await prisma_1.prisma.post.findMany({
                where: filters.length ? { AND: filters } : undefined,
                include: {
                    author: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            profilePicture: true,
                        },
                    },
                    coverFile: true,
                    categories: {
                        include: {
                            category: true,
                        },
                    },
                },
                orderBy,
                skip,
                take,
            });
            console.log(`listPosts controller - Found ${posts.length} posts`);
            // Transform categories to match frontend expectation
            const transformedPosts = posts.map(post => ({
                ...post,
                categories: post.categories.map(pc => pc.category),
            }));
            console.log('listPosts controller - Sending response');
            res.status(200).json(transformedPosts);
        }
        catch (error) {
            console.error('listPosts controller - Error occurred:', error);
            next(error);
        }
    },
];
const getPost = async (req, res, next) => {
    try {
        const identifier = String(req.params.id);
        // Check if it's a UUID or a slug
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
        const post = await prisma_1.prisma.post.findFirst({
            where: isUuid ? { id: identifier } : { slug: identifier },
            include: {
                author: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        profilePicture: true,
                        aboutMe: true,
                    },
                },
                coverFile: true,
                categories: {
                    include: {
                        category: true,
                    },
                },
            },
        });
        if (!post) {
            throw new errors_1.AppError("Post not found", 404);
        }
        // Transform categories to match frontend expectation
        const transformedPost = {
            ...post,
            categories: post.categories.map(pc => pc.category),
        };
        // Access control
        if (post.visibility === "PUBLIC") {
            return res.status(200).json(transformedPost);
        }
        if (!req.user) {
            throw new errors_1.AppError("Forbidden", 403);
        }
        if (req.user.role !== "ADMIN" && post.authorId !== req.user.id) {
            throw new errors_1.AppError("Forbidden", 403);
        }
        res.status(200).json(transformedPost);
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
// Admin: List posts pending approval
exports.listPendingApproval = [
    auth_1.requireAuth,
    async (req, res, next) => {
        try {
            const posts = await post_service_1.postService.listPendingApproval(req.user);
            // Transform categories to match frontend expectation
            const transformedPosts = posts.map((post) => ({
                ...post,
                categories: post.categories.map((pc) => pc.category),
            }));
            res.status(200).json(transformedPosts);
        }
        catch (error) {
            next(error);
        }
    },
];
// Admin: Approve a post
exports.approvePost = [
    auth_1.requireAuth,
    async (req, res, next) => {
        try {
            const post = await post_service_1.postService.approve(String(req.params.id), req.user);
            res.status(200).json(post);
        }
        catch (error) {
            next(error);
        }
    },
];
// Admin: Reject a post
exports.rejectPost = [
    auth_1.requireAuth,
    async (req, res, next) => {
        try {
            const { reason } = req.body;
            if (!reason || typeof reason !== 'string') {
                throw new errors_1.AppError("Reason is required", 400);
            }
            const post = await post_service_1.postService.reject(String(req.params.id), reason, req.user);
            res.status(200).json(post);
        }
        catch (error) {
            next(error);
        }
    },
];
