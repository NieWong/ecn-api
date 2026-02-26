import { Router } from "express";
import * as userController from "../controllers/user.controller";

const router = Router();

// Admin routes
router.get("/", ...(userController.listUsers as any));
router.get("/pending", ...(userController.listPendingRegistrations as any));
router.post("/:id/approve", ...(userController.approveUser as any));
router.post("/:id/deactivate", ...(userController.deactivateUser as any));

// User profile routes
router.get("/profile/:id", ...(userController.getProfile as any));
router.patch("/profile/:id", ...(userController.updateProfile as any));
router.patch("/profile", ...(userController.updateProfile as any)); // Update own profile

// Public profile route (no auth required)
router.get("/public/:id", userController.getPublicProfile);

export default router;
