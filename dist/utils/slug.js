"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSlug = void 0;
const toSlug = (value) => {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^\p{L}\p{N}\s-]/gu, "")
        .replace(/[\s-]+/g, "-")
        .replace(/^-+|-+$/g, "");
};
exports.toSlug = toSlug;
