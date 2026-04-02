import { AppError } from "./errors";

export const CONTENT_TYPES = ["CONTENT", "NEWS"] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

const NEWS_CATEGORY_SLUGS = new Set(["ecn-news", "news"]);

export const isNewsCategorySlug = (slug: string) => NEWS_CATEGORY_SLUGS.has(slug.toLowerCase());

export const normalizeCategoryIdsByContentType = (
  selectedCategoryIds: string[] | undefined,
  categories: Array<{ id: string; slug: string }>,
  contentType?: ContentType
) => {
  const incoming = Array.from(new Set(selectedCategoryIds ?? []));

  if (incoming.length === 0 || categories.length === 0) {
    if (contentType === "NEWS") {
      const newsCategory = categories.find((category) => isNewsCategorySlug(category.slug));
      if (!newsCategory) {
        throw new AppError("NEWS category not configured", 400);
      }
      return [newsCategory.id];
    }
    return incoming;
  }

  const newsCategoryIds = new Set(
    categories.filter((category) => isNewsCategorySlug(category.slug)).map((category) => category.id)
  );

  const withoutNewsCategory = incoming.filter((categoryId) => !newsCategoryIds.has(categoryId));

  if (contentType === "NEWS") {
    const newsCategory = categories.find((category) => isNewsCategorySlug(category.slug));
    if (!newsCategory) {
      throw new AppError("NEWS category not configured", 400);
    }
    return Array.from(new Set([...withoutNewsCategory, newsCategory.id]));
  }

  if (contentType === "CONTENT") {
    return withoutNewsCategory;
  }

  return incoming;
};
