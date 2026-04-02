"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryService = void 0;
const category_repo_1 = require("../repositories/category.repo");
const errors_1 = require("../utils/errors");
const slug_1 = require("../utils/slug");
exports.categoryService = {
    list: () => category_repo_1.categoryRepo.list(),
    getById: async (id) => {
        const category = await category_repo_1.categoryRepo.findById(id);
        if (!category) {
            throw new errors_1.AppError("Category not found", 404);
        }
        return category;
    },
    create: async (data) => {
        const slug = data.slug ? (0, slug_1.toSlug)(data.slug) : (0, slug_1.toSlug)(data.name);
        const existing = await category_repo_1.categoryRepo.findBySlug(slug);
        if (existing) {
            throw new errors_1.AppError("Slug already exists", 409);
        }
        return category_repo_1.categoryRepo.create({ name: data.name, slug });
    },
    update: async (id, data) => {
        const current = await category_repo_1.categoryRepo.findById(id);
        if (!current) {
            throw new errors_1.AppError("Category not found", 404);
        }
        const nextName = data.name?.trim() || current.name;
        const normalizedSlugInput = data.slug !== undefined ? (0, slug_1.toSlug)(data.slug) : undefined;
        const nextSlug = normalizedSlugInput ?? current.slug;
        if (!nextSlug) {
            throw new errors_1.AppError("Slug is required", 400);
        }
        const existing = await category_repo_1.categoryRepo.findBySlug(nextSlug);
        if (existing && existing.id !== id) {
            throw new errors_1.AppError("Slug already exists", 409);
        }
        return category_repo_1.categoryRepo.update(id, {
            name: nextName,
            slug: nextSlug,
        });
    },
    remove: (id) => category_repo_1.categoryRepo.delete(id),
};
