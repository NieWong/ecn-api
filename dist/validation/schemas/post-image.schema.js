"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePostImageSchema = exports.addPostImageSchema = void 0;
const zod_1 = require("zod");
exports.addPostImageSchema = zod_1.z.object({
    fileId: zod_1.z.string(),
    sort: zod_1.z.number().int().optional(),
});
exports.removePostImageSchema = zod_1.z.object({
    fileId: zod_1.z.string(),
});
