import { z } from "zod";

export const addPostImageSchema = z.object({
  fileId: z.string(),
  sort: z.number().int().optional(),
});

export const removePostImageSchema = z.object({
  fileId: z.string(),
});

export type AddPostImageInput = z.infer<typeof addPostImageSchema>;
export type RemovePostImageInput = z.infer<typeof removePostImageSchema>;
