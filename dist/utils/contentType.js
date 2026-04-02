"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeCategoryIdsByContentType = exports.isNewsCategorySlug = exports.CONTENT_TYPES = void 0;
const errors_1 = require("./errors");
exports.CONTENT_TYPES = ["CONTENT", "NEWS"];
const NEWS_CATEGORY_SLUGS = new Set(["ecn-news", "news"]);
const isNewsCategorySlug = (slug) => NEWS_CATEGORY_SLUGS.has(slug.toLowerCase());
exports.isNewsCategorySlug = isNewsCategorySlug;
const normalizeCategoryIdsByContentType = (selectedCategoryIds, categories, contentType) => {
    const incoming = Array.from(new Set(selectedCategoryIds ?? []));
    if (incoming.length === 0 || categories.length === 0) {
        if (contentType === "NEWS") {
            const newsCategory = categories.find((category) => (0, exports.isNewsCategorySlug)(category.slug));
            if (!newsCategory) {
                throw new errors_1.AppError("NEWS category not configured", 400);
            }
            return [newsCategory.id];
        }
        return incoming;
    }
    const newsCategoryIds = new Set(categories.filter((category) => (0, exports.isNewsCategorySlug)(category.slug)).map((category) => category.id));
    const withoutNewsCategory = incoming.filter((categoryId) => !newsCategoryIds.has(categoryId));
    if (contentType === "NEWS") {
        const newsCategory = categories.find((category) => (0, exports.isNewsCategorySlug)(category.slug));
        if (!newsCategory) {
            throw new errors_1.AppError("NEWS category not configured", 400);
        }
        return Array.from(new Set([...withoutNewsCategory, newsCategory.id]));
    }
    if (contentType === "CONTENT") {
        return withoutNewsCategory;
    }
    return incoming;
};
exports.normalizeCategoryIdsByContentType = normalizeCategoryIdsByContentType;
