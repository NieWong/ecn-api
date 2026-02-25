"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const notFound = (_req, res) => {
    res.status(404).json({ message: "Not found" });
};
exports.notFound = notFound;
