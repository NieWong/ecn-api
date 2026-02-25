import { fileRepo } from "../repositories/file.repo";
import { postImageRepo } from "../repositories/post-image.repo";
import { postRepo } from "../repositories/post.repo";
import type { AuthUser } from "../types/auth";
import { AppError } from "../utils/errors";

const assertPostAccess = (post: { authorId: string }, actor: AuthUser) => {
  if (actor.role === "ADMIN") {
    return;
  }
  if (post.authorId !== actor.id) {
    throw new AppError("Forbidden", 403);
  }
};

export const postImageService = {
  add: async (params: {
    postId: string;
    fileId: string;
    sort?: number;
    actor: AuthUser;
  }) => {
    const post = await postRepo.findById(params.postId);
    if (!post) {
      throw new AppError("Post not found", 404);
    }
    assertPostAccess(post, params.actor);

    const file = await fileRepo.findById(params.fileId);
    if (!file) {
      throw new AppError("File not found", 404);
    }
    if (params.actor.role !== "ADMIN" && file.ownerId !== params.actor.id) {
      throw new AppError("Forbidden", 403);
    }

    return postImageRepo.upsert({
      postId: params.postId,
      fileId: params.fileId,
      sort: params.sort,
    });
  },
  remove: async (params: { postId: string; fileId: string; actor: AuthUser }) => {
    const post = await postRepo.findById(params.postId);
    if (!post) {
      throw new AppError("Post not found", 404);
    }
    assertPostAccess(post, params.actor);

    await postImageRepo.delete({ postId: params.postId, fileId: params.fileId });
    return true;
  },
};
