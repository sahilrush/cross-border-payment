"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const payment_service_1 = require("../../services/payment.service");
const ai_advisor_service_1 = require("../../services/ai-advisor.service");
class PaymentController {
    constructor() {
        this.paymentService = new payment_service_1.PaymentService();
        this.aiAdvisorService = new ai_advisor_service_1.AIAdvisorService();
    }
    /**
     * Create a new payment
     */
    createPayment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                if (!userId) {
                    res.status(401).json({ error: "Unauthorized" });
                    return;
                }
                const paymentData = req.body;
                // Validate required fields
                if (!paymentData.vendorId ||
                    !paymentData.amount ||
                    !paymentData.currency) {
                    res
                        .status(400)
                        .json({ error: "Vendor ID, amount and currency are required" });
                    return;
                }
                // Create payment
                const result = yield this.paymentService.createPayment(userId, paymentData);
                res.status(201).json(result);
            }
            catch (error) {
                console.error("Payment creation error:", error);
                if (error instanceof Error) {
                    res.status(400).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: "Failed to create payment" });
                }
            }
        });
    }
    /**
     * Get payment recommendations using AI advisor
     */
    getPaymentRecommendation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const recommendation = yield this.aiAdvisorService.analyzePayment(userId, vendorId, parseFloat(amount), currency);
                res.status(200).json(recommendation);
            }
            catch (error) {
                console.error("Payment recommendation error:", error);
                if (error instanceof Error) {
                    res.status(400).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: "Failed to get payment recommendation" });
                }
            }
        });
    }
    /**
     * Get payment history for user
     */
    getPaymentHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                if (!userId) {
                    res.status(401).json({ error: "Unauthorized" });
                    return;
                }
                const transactions = yield this.paymentService.getTransactions(userId);
                res.status(200).json(transactions);
            }
            catch (error) {
                console.error("Payment history error:", error);
                if (error instanceof Error) {
                    res.status(400).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: "Failed to get payment history" });
                }
            }
        });
    }
    /**
     * Get a single payment by ID
     */
    getPayment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const transaction = yield this.paymentService.getTransaction(userId, transactionId);
                if (!transaction) {
                    res.status(404).json({ error: "Transaction not found" });
                    return;
                }
                res.status(200).json(transaction);
            }
            catch (error) {
                console.error("Get payment error:", error);
                if (error instanceof Error) {
                    res.status(400).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: "Failed to get payment" });
                }
            }
        });
    }
    /**
     * Get payment statistics
     */
    getPaymentStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                if (!userId) {
                    res.status(401).json({ error: "Unauthorized" });
                    return;
                }
                const stats = yield this.paymentService.getPaymentStats(userId);
                res.status(200).json(stats);
            }
            catch (error) {
                console.error("Payment stats error:", error);
                if (error instanceof Error) {
                    res.status(400).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: "Failed to get payment statistics" });
                }
            }
        });
    }
}
exports.PaymentController = PaymentController;
