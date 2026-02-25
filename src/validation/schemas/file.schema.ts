import { z } from "zod";

export const fileKindSchema = z.enum(["IMAGE", "DOCUMENT", "OTHER"]);
export const visibilitySchema = z.enum(["PUBLIC", "PRIVATE"]);

export const uploadFileSchema = z.object({
  visibility: visibilitySchema.optional(),
  kind: fileKindSchema.optional(),
});

export type UploadFileInput = z.infer<typeof uploadFileSchema>;
