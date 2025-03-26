"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../api/middlewares/auth.middleware");
const payment_controller_1 = require("../api/controllers/payment.controller");
const router = (0, express_1.Router)();
const paymentController = new payment_controller_1.PaymentController();
// Create a new payment
router.post("/", auth_middleware_1.authMiddleware, (req, res) => paymentController.createPayment(req, res));
// Get payment history
router.get("/", auth_middleware_1.authMiddleware, (req, res) => paymentController.getPaymentHistory(req, res));
// Get payment statistics
router.get("/stats", auth_middleware_1.authMiddleware, (req, res) => paymentController.getPaymentStats(req, res));
// Get payment recommendations from AI
router.get("/recommend", auth_middleware_1.authMiddleware, (req, res) => paymentController.getPaymentRecommendation(req, res));
// Get specific payment by ID
router.get("/:id", auth_middleware_1.authMiddleware, (req, res) => paymentController.getPayment(req, res));
exports.default = router;
