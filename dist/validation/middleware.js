"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateBody = void 0;
const zod_1 = require("zod");
const errors_1 = require("../utils/errors");
const validateBody = (schema) => {
    return (req, _res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const messages = error.issues.map((e) => `${e.path.join(".")}: ${e.message}`);
                return next(new errors_1.AppError(messages.join(", "), 400));
            }
            next(error);
        }
    };
};
exports.validateBody = validateBody;
const validateQuery = (schema) => {
    return (req, _res, next) => {
        try {
            req.query = schema.parse(req.query);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const messages = error.issues.map((e) => `${e.path.join(".")}: ${e.message}`);
                return next(new errors_1.AppError(messages.join(", "), 400));
            }
            next(error);
        }
    };
};
exports.validateQuery = validateQuery;
