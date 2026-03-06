"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    aboutMe: zod_1.z.string().optional(),
    facebook: zod_1.z.string().optional(),
    twitter: zod_1.z.string().optional(),
    linkedin: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    website: zod_1.z.string().url().optional().or(zod_1.z.literal("")),
    profilePictureId: zod_1.z.string().uuid().optional().nullable(),
    profilePicturePath: zod_1.z.string().optional().nullable(),
    cvFileId: zod_1.z.string().uuid().optional().nullable(),
    cvFilePath: zod_1.z.string().optional().nullable(),
});
