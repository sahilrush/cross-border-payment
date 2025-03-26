import { Router } from "express";
import { authMiddleware } from "../api/middlewares/auth.middleware";
import { PaymentController } from "../api/controllers/payment.controller";

const router = Router();
const paymentController = new PaymentController();

// Create a new payment
router.post("/", authMiddleware, (req, res) =>
  paymentController.createPayment(req, res)
);

// Get payment history
router.get("/", authMiddleware, (req, res) =>
  paymentController.getPaymentHistory(req, res)
);

// Get payment statistics
router.get("/stats", authMiddleware, (req, res) =>
  paymentController.getPaymentStats(req, res)
);

// Get payment recommendations from AI
router.get("/recommend", authMiddleware, (req, res) =>
  paymentController.getPaymentRecommendation(req, res)
);

// Get specific payment by ID
router.get("/:id", authMiddleware, (req, res) =>
  paymentController.getPayment(req, res)
);

export default router;
