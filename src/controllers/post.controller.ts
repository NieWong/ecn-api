import type { RequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";
import { postService } from "../services/post.service";
import { requireAuth } from "../middleware/auth";
import { validateBody, validateQuery } from "../validation/middleware";
import {
  createPostSchema,
  updatePostSchema,
  listPostsQuerySchema,
  setPostCoverSchema,
} from "../validation/schemas/post.schema";
import { AppError } from "../utils/errors";

export const listPosts: RequestHandler[] = [
  validateQuery(listPostsQuerySchema),
  async (req, res, next) => {
    try {
      const query = req.query as any;
      const filters: Record<string, unknown>[] = [];

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
      } else if (req.user.role !== "ADMIN") {
        filters.push({
          OR: [{ visibility: "PUBLIC" }, { authorId: req.user.id }],
        });
      }

      const orderBy: Prisma.PostOrderByWithRelationInput = (() => {
        switch (query.sort) {
          case "CREATED_AT_ASC":
            return { createdAt: Prisma.SortOrder.asc };
          case "PUBLISHED_AT_ASC":
            return { publishedAt: Prisma.SortOrder.asc };
          case "PUBLISHED_AT_DESC":
            return { publishedAt: Prisma.SortOrder.desc };
          default:
            return { createdAt: Prisma.SortOrder.desc };
        }
      })();

      const posts = await prisma.post.findMany({
        where: filters.length ? { AND: filters } : undefined,
        orderBy,
        skip: query.skip ?? undefined,
        take: query.take ?? undefined,
      });

      res.status(200).json(posts);
    } catch (error) {
      next(error);
    }
  },
];

export const getPost: RequestHandler = async (req, res, next) => {
  try {
    const post = await prisma.post.findUnique({ where: { id: String(req.params.id) } });
    if (!post) {
      throw new AppError("Post not found", 404);
    }

    // Access control
    if (post.visibility === "PUBLIC") {
      return res.status(200).json(post);
    }
    if (!req.user) {
      throw new AppError("Forbidden", 403);
    }
    if (req.user.role !== "ADMIN" && post.authorId !== req.user.id) {
      throw new AppError("Forbidden", 403);
    }

    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};

export const createPost: RequestHandler[] = [
  requireAuth,
  validateBody(createPostSchema),
  async (req, res, next) => {
    try {
      const post = await postService.create({
        ...req.body,
        authorId: req.user!.id,
      });
      res.status(201).json(post);
    } catch (error) {
      next(error);
    }
  },
];

export const updatePost: RequestHandler[] = [
  requireAuth,
  validateBody(updatePostSchema),
  async (req, res, next) => {
    try {
      const post = await postService.update(
        String(req.params.id),
        req.body,
        req.user!
      );
      res.status(200).json(post);
    } catch (error) {
      next(error);
    }
  },
];

export const deletePost: RequestHandler = [
  requireAuth,
  async (req: any, res: any, next: any) => {
    try {
      await postService.remove(String(req.params.id), req.user!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
] as any;

export const setPostCover: RequestHandler[] = [
  requireAuth,
  validateBody(setPostCoverSchema),
  async (req, res, next) => {
    try {
      const post = await postService.setCover(
        String(req.params.id),
        req.body.fileId,
        req.user!
      );
      res.status(200).json(post);
    } catch (error) {
      next(error);
    }
  },
];

export const clearPostCover: RequestHandler = [
  requireAuth,
  async (req: any, res: any, next: any) => {
    try {
      const post = await postService.setCover(String(req.params.id), null, req.user!);
      res.status(200).json(post);
    } catch (error) {
      next(error);
    }
  },
] as any;
