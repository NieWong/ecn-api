import { Router } from "express";
import * as categoryController from "../controllers/category.controller";

const router = Router();

router.get("/", categoryController.listCategories);
router.get("/:id", categoryController.getCategory);
router.post("/", ...categoryController.createCategory);
router.patch("/:id", ...categoryController.updateCategory);
router.delete("/:id", ...(categoryController.deleteCategory as any));

export default router;
