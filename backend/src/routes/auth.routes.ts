import { Router } from "express";
import { AuthController } from "../api/controllers/auth.controller";
import { authMiddleware } from "../api/middlewares/auth.middleware";

const router = Router();
const authController = new AuthController();

router.post("/register", (req, res) => authController.register(req, res));

router.post("/login", (req, res) => authController.login(req, res));

router.get("/me", authMiddleware, (req, res) =>
  authController.getCurrentUser(req, res)
);

export default router;
