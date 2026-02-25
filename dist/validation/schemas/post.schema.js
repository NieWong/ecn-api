"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPostCoverSchema = exports.listPostsQuerySchema = exports.updatePostSchema = exports.createPostSchema = exports.postSortSchema = exports.visibilitySchema = exports.postStatusSchema = void 0;
const zod_1 = require("zod");
exports.postStatusSchema = zod_1.z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
exports.visibilitySchema = zod_1.z.enum(["PUBLIC", "PRIVATE"]);
exports.postSortSchema = zod_1.z.enum([
    "CREATED_AT_DESC",
    "CREATED_AT_ASC",
    "PUBLISHED_AT_DESC",
    "PUBLISHED_AT_ASC",
]);
exports.createPostSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    slug: zod_1.z.string().optional(),
    summary: zod_1.z.string().optional(),
    contentJson: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()),
    contentHtml: zod_1.z.string().optional(),
    status: exports.postStatusSchema.optional(),
    visibility: exports.visibilitySchema.optional(),
    categoryIds: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.updatePostSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    slug: zod_1.z.string().optional(),
    summary: zod_1.z.string().optional().nullable(),
    contentJson: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
    contentHtml: zod_1.z.string().optional().nullable(),
    status: exports.postStatusSchema.optional(),
    visibility: exports.visibilitySchema.optional(),
});
exports.listPostsQuerySchema = zod_1.z.object({
    skip: zod_1.z.coerce.number().int().nonnegative().optional(),
    take: zod_1.z.coerce.number().int().positive().max(100).optional(),
    status: exports.postStatusSchema.optional(),
    visibility: exports.visibilitySchema.optional(),
    authorId: zod_1.z.string().optional(),
    categoryId: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    sort: exports.postSortSchema.optional(),
});
exports.setPostCoverSchema = zod_1.z.object({
    fileId: zod_1.z.string(),
});
