"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.createCategory = exports.getCategory = exports.listCategories = void 0;
const prisma_1 = require("../db/prisma");
const category_service_1 = require("../services/category.service");
const auth_1 = require("../middleware/auth");
const middleware_1 = require("../validation/middleware");
const category_schema_1 = require("../validation/schemas/category.schema");
const errors_1 = require("../utils/errors");
const listCategories = async (_req, res, next) => {
    try {
        const categories = await prisma_1.prisma.category.findMany({
            orderBy: { name: "asc" },
        });
        res.status(200).json(categories);
    }
    catch (error) {
        next(error);
    }
};
exports.listCategories = listCategories;
const getCategory = async (req, res, next) => {
    try {
        const category = await prisma_1.prisma.category.findUnique({
            where: { id: String(req.params.id) },
        });
        if (!category) {
            throw new errors_1.AppError("Category not found", 404);
        }
        res.status(200).json(category);
    }
    catch (error) {
        next(error);
    }
};
exports.getCategory = getCategory;
exports.createCategory = [
    (0, auth_1.requireRole)("ADMIN"),
    (0, middleware_1.validateBody)(category_schema_1.createCategorySchema),
    async (req, res, next) => {
        try {
            const category = await category_service_1.categoryService.create(req.body);
            res.status(201).json(category);
        }
        catch (error) {
            next(error);
        }
    },
];
exports.deleteCategory = [
    (0, auth_1.requireRole)("ADMIN"),
    async (req, res, next) => {
        try {
            await category_service_1.categoryService.remove(String(req.params.id));
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    },
];
