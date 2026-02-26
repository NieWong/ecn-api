import { Router } from "express";
import * as authController from "../controllers/auth.controller";

const router = Router();

router.post("/register", ...authController.register);
router.post("/set-password", ...authController.setPassword);
router.post("/login", ...authController.login);
router.get("/me", authController.me);

export default router;
