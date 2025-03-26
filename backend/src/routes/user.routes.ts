// src/routes/user.routes.ts
import { Router } from "express";
import { authMiddleware } from "../api/middlewares/auth.middleware";
import { UserController } from "../api/controllers/user.controller";

const router = Router();
const userController = new UserController();

// Get user profile
router.get("/profile", authMiddleware, (req, res) =>
  userController.getProfile(req, res)
);

// Update user profile
router.put("/profile", authMiddleware, (req, res) =>
  userController.updateProfile(req, res)
);

// Change password
router.post("/change-password", authMiddleware, (req, res) =>
  userController.changePassword(req, res)
);

// Crypto wallets management
router.post("/wallets", authMiddleware, (req, res) =>
  userController.addCryptoWallet(req, res)
);
router.get("/wallets", authMiddleware, (req, res) =>
  userController.getCryptoWallets(req, res)
);

// Payment methods
router.get("/payment-methods", authMiddleware, (req, res) =>
  userController.getPaymentMethods(req, res)
);

// Dashboard data
router.get("/dashboard", authMiddleware, (req, res) =>
  userController.getDashboardSummary(req, res)
);

export default router;
