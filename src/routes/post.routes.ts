import { Router } from "express";
import * as postController from "../controllers/post.controller";

const router = Router();

router.get("/", ...postController.listPosts);
router.get("/pending-approval", ...postController.listPendingApproval);
router.get("/:id", postController.getPost);
router.post("/", ...postController.createPost);
router.patch("/:id", ...postController.updatePost);
router.delete("/:id", ...(postController.deletePost as any));
router.put("/:id/cover", ...postController.setPostCover);
router.delete("/:id/cover", ...(postController.clearPostCover as any));
router.post("/:id/approve", ...postController.approvePost);
router.post("/:id/reject", ...postController.rejectPost);

export default router;
