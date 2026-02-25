"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSlug = void 0;
const toSlug = (value) => {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s-]+/g, "-")
        .replace(/^-+|-+$/g, "");
};
exports.toSlug = toSlug;
