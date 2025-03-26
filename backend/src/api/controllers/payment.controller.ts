// src/controllers/payment.controller.ts
import { Request, Response } from "express";

import { AuthRequest } from "../middlewares/auth.middleware";
import { PaymentService } from "../../services/payment.service";
import { AIAdvisorService } from "../../services/ai-advisor.service";
import { CreatePaymentDto } from "../../types";

export class PaymentController {
  private paymentService: PaymentService;
  private aiAdvisorService: AIAdvisorService;

  constructor() {
    this.paymentService = new PaymentService();
    this.aiAdvisorService = new AIAdvisorService();
  }

  /**
   * Create a new payment
   */
  async createPayment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const paymentData: CreatePaymentDto = req.body;

      // Validate required fields
      if (
        !paymentData.vendorId ||
        !paymentData.amount ||
        !paymentData.currency
      ) {
        res
          .status(400)
          .json({ error: "Vendor ID, amount and currency are required" });
        return;
      }

      // Create payment
      const result = await this.paymentService.createPayment(
        userId,
        paymentData
      );
      res.status(201).json(result);
    } catch (error) {
      console.error("Payment creation error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to create payment" });
      }
    }
  }

  /**
   * Get payment recommendations using AI advisor
   */
  async getPaymentRecommendation(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { vendorId, amount, currency } = req.query;

      // Validate required query parameters
      if (!vendorId || !amount || !currency) {
        res
          .status(400)
          .json({ error: "Vendor ID, amount and currency are required" });
        return;
      }

      // Get recommendation
      const recommendation = await this.aiAdvisorService.analyzePayment(
        userId,
        vendorId as string,
        parseFloat(amount as string),
        currency as string
      );

      res.status(200).json(recommendation);
    } catch (error) {
      console.error("Payment recommendation error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to get payment recommendation" });
      }
    }
  }

  /**
   * Get payment history for user
   */
  async getPaymentHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const transactions = await this.paymentService.getTransactions(userId);
      res.status(200).json(transactions);
    } catch (error) {
      console.error("Payment history error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to get payment history" });
      }
    }
  }

  /**
   * Get a single payment by ID
   */
  async getPayment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const transactionId = req.params.id;

      if (!transactionId) {
        res.status(400).json({ error: "Transaction ID is required" });
        return;
      }

      const transaction = await this.paymentService.getTransaction(
        userId,
        transactionId
      );

      if (!transaction) {
        res.status(404).json({ error: "Transaction not found" });
        return;
      }

      res.status(200).json(transaction);
    } catch (error) {
      console.error("Get payment error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to get payment" });
      }
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const stats = await this.paymentService.getPaymentStats(userId);
      res.status(200).json(stats);
    } catch (error) {
      console.error("Payment stats error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to get payment statistics" });
      }
    }
  }
}
