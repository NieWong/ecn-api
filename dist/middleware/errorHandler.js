"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof errors_1.AppError) {
        return res.status(err.statusCode).json({
            message: err.message,
            details: err.details ?? null,
        });
    }
    return res.status(500).json({
        message: "Internal server error",
    });
};
exports.errorHandler = errorHandler;
