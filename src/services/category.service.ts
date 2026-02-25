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
  remove: (id: string) => categoryRepo.delete(id),
};
