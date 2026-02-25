import { Router } from "express";
import * as userController from "../controllers/user.controller";

const router = Router();

router.get("/", ...(userController.listUsers as any));

export default router;
