import { categoryRepo } from "../repositories/category.repo";
import { AppError } from "../utils/errors";
import { toSlug } from "../utils/slug";

export const categoryService = {
  list: () => categoryRepo.list(),
  getById: async (id: string) => {
    const category = await categoryRepo.findById(id);
    if (!category) {
      throw new AppError("Category not found", 404);
    }
    return category;
  },
  create: async (data: { name: string; slug?: string }) => {
    const slug = data.slug ? toSlug(data.slug) : toSlug(data.name);
    const existing = await categoryRepo.findBySlug(slug);
    if (existing) {
      throw new AppError("Slug already exists", 409);
    }
    return categoryRepo.create({ name: data.name, slug });
  },
  update: async (id: string, data: { name?: string; slug?: string }) => {
    const current = await categoryRepo.findById(id);
    if (!current) {
      throw new AppError("Category not found", 404);
    }

    const nextName = data.name?.trim() || current.name;
    const normalizedSlugInput = data.slug !== undefined ? toSlug(data.slug) : undefined;
    const nextSlug = normalizedSlugInput ?? current.slug;

    if (!nextSlug) {
      throw new AppError("Slug is required", 400);
    }

    const existing = await categoryRepo.findBySlug(nextSlug);
    if (existing && existing.id !== id) {
      throw new AppError("Slug already exists", 409);
    }

    return categoryRepo.update(id, {
      name: nextName,
      slug: nextSlug,
    });
  },
  remove: (id: string) => categoryRepo.delete(id),
};
