import { z } from "zod";

export const postStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const visibilitySchema = z.enum(["PUBLIC", "PRIVATE"]);
export const postSortSchema = z.enum([
  "CREATED_AT_DESC",
  "CREATED_AT_ASC",
  "PUBLISHED_AT_DESC",
  "PUBLISHED_AT_ASC",
]);

export const createPostSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  summary: z.string().optional(),
  contentJson: z.record(z.string(), z.unknown()),
  contentHtml: z.string().optional(),
  status: postStatusSchema.optional(),
  visibility: visibilitySchema.optional(),
  categoryIds: z.array(z.string()).optional(),
});

export const updatePostSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().optional(),
  summary: z.string().optional().nullable(),
  contentJson: z.record(z.string(), z.unknown()).optional(),
  contentHtml: z.string().optional().nullable(),
  status: postStatusSchema.optional(),
  visibility: visibilitySchema.optional(),
});

export const listPostsQuerySchema = z.object({
  skip: z.coerce.number().int().nonnegative().optional(),
  take: z.coerce.number().int().positive().max(100).optional(),
  status: postStatusSchema.optional(),
  visibility: visibilitySchema.optional(),
  authorId: z.string().optional(),
  categoryId: z.string().optional(),
  search: z.string().optional(),
  sort: postSortSchema.optional(),
});

export const setPostCoverSchema = z.object({
  fileId: z.string(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;
export type SetPostCoverInput = z.infer<typeof setPostCoverSchema>;
