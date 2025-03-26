"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../api/middlewares/auth.middleware");
const user_controller_1 = require("../api/controllers/user.controller");
const router = (0, express_1.Router)();
const userController = new user_controller_1.UserController();
// Get user profile
router.get("/profile", auth_middleware_1.authMiddleware, (req, res) => userController.getProfile(req, res));
// Update user profile
router.put("/profile", auth_middleware_1.authMiddleware, (req, res) => userController.updateProfile(req, res));
// Change password
router.post("/change-password", auth_middleware_1.authMiddleware, (req, res) => userController.changePassword(req, res));
// Crypto wallets management
router.post("/wallets", auth_middleware_1.authMiddleware, (req, res) => userController.addCryptoWallet(req, res));
router.get("/wallets", auth_middleware_1.authMiddleware, (req, res) => userController.getCryptoWallets(req, res));
// Payment methods
router.get("/payment-methods", auth_middleware_1.authMiddleware, (req, res) => userController.getPaymentMethods(req, res));
// Dashboard data
router.get("/dashboard", auth_middleware_1.authMiddleware, (req, res) => userController.getDashboardSummary(req, res));
exports.default = router;
