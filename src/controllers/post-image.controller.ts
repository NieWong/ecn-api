import type { RequestHandler } from "express";
import { postImageService } from "../services/post-image.service";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../validation/middleware";
import { addPostImageSchema, removePostImageSchema } from "../validation/schemas/post-image.schema";

export const addPostImage: RequestHandler[] = [
  requireAuth,
  validateBody(addPostImageSchema),
  async (req, res, next) => {
    try {
      const postImage = await postImageService.add({
        postId: String(req.params.postId),
        fileId: req.body.fileId,
        sort: req.body.sort,
        actor: req.user!,
      });
      res.status(201).json(postImage);
    } catch (error) {
      next(error);
    }
  },
];

export const removePostImage: RequestHandler[] = [
  requireAuth,
  validateBody(removePostImageSchema),
  async (req, res, next) => {
    try {
      await postImageService.remove({
        postId: String(req.params.postId),
        fileId: req.body.fileId,
        actor: req.user!,
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
];
