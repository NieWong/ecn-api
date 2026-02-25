import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import postRoutes from "./post.routes";
import categoryRoutes from "./category.routes";
import fileRoutes from "./file.routes";
import postImageRoutes from "./post-image.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/posts", postRoutes);
router.use("/categories", categoryRoutes);
router.use("/files", fileRoutes);
router.use("/posts", postImageRoutes); // /posts/:postId/images

export default router;
