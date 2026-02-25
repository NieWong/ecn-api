"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParams = exports.validateBody = void 0;
const errors_1 = require("./errors");
const validateBody = (schema) => {
    return (req, _res, next) => {
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) {
            return next(new errors_1.AppError("Validation failed", 400, parsed.error.flatten()));
        }
        req.body = parsed.data;
        return next();
    };
};
exports.validateBody = validateBody;
const validateParams = (schema) => {
    return (req, _res, next) => {
        const parsed = schema.safeParse(req.params);
        if (!parsed.success) {
            return next(new errors_1.AppError("Validation failed", 400, parsed.error.flatten()));
        }
        req.params = parsed.data;
        return next();
    };
};
exports.validateParams = validateParams;
