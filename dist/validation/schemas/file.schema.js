"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileSchema = exports.visibilitySchema = exports.fileKindSchema = void 0;
const zod_1 = require("zod");
exports.fileKindSchema = zod_1.z.enum(["IMAGE", "DOCUMENT", "OTHER"]);
exports.visibilitySchema = zod_1.z.enum(["PUBLIC", "PRIVATE"]);
exports.uploadFileSchema = zod_1.z.object({
    visibility: exports.visibilitySchema.optional(),
    kind: exports.fileKindSchema.optional(),
});
