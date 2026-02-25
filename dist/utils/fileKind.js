"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inferFileKind = void 0;
const inferFileKind = (mimeType) => {
    if (mimeType.startsWith("image/")) {
        return "IMAGE";
    }
    if (mimeType === "application/pdf") {
        return "DOCUMENT";
    }
    return "OTHER";
};
exports.inferFileKind = inferFileKind;
