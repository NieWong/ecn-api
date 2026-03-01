import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().optional(),
  aboutMe: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  profilePictureId: z.string().uuid().optional().nullable(),
  profilePicturePath: z.string().optional().nullable(),
  cvFileId: z.string().uuid().optional().nullable(),
  cvFilePath: z.string().optional().nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
