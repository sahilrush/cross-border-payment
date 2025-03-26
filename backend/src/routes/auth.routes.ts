// src/routes/auth.routes.ts
import { Router } from "express";
import { AuthController } from "../api/controllers/auth.controller";
import { authMiddleware } from "../api/middlewares/auth.middleware";

const router = Router();
const authController = new AuthController();

// Register a new user
router.post("/register", (req, res) => authController.register(req, res));

// Login user
router.post("/login", (req, res) => authController.login(req, res));

// Get current user profile (requires authentication)
router.get("/me", authMiddleware, (req, res) =>
  authController.getCurrentUser(req, res)
);

export default router;
