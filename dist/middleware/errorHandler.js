"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const errorHandler = (err, _req, res, _next) => {
    // Log all errors for debugging
    console.error('Error caught by errorHandler:');
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    if (err instanceof errors_1.AppError) {
        return res.status(err.statusCode).json({
            message: err.message,
            details: err.details ?? null,
        });
    }
    // Log additional details for non-AppError errors
    console.error('Full error object:', err);
    return res.status(500).json({
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
};
exports.errorHandler = errorHandler;
