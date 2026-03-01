import { Router } from "express";
import * as fileController from "../controllers/file.controller";

const router = Router();

router.get("/", fileController.listFiles);
router.get("/:id", fileController.getFile);
// router.post("/", ...fileController.uploadFile);
router.delete("/:id", ...(fileController.deleteFile as any));

export default router;
