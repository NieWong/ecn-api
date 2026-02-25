import { Router } from "express";
import * as postImageController from "../controllers/post-image.controller";

const router = Router();

router.post("/:postId/images", ...postImageController.addPostImage);
router.delete("/:postId/images", ...postImageController.removePostImage);

export default router;
