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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const client_1 = require("@prisma/client");
const ai_advisor_service_1 = require("./ai-advisor.service");
const paymen_service_1 = require("./paymen.service");
const db_1 = __importDefault(require("../config/db"));
class PaymentService {
    constructor() {
        this.paymanApi = new paymen_service_1.PaymenApiService();
        this.aiAdvisor = new ai_advisor_service_1.AIAdvisorService();
    }
    /**
     * Create and process a new payment
     */
    createPayment(userId, paymentData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get vendor information
            const vendor = yield db_1.default.vendor.findFirst({
                where: {
                    id: paymentData.vendorId,
                    userId, // Ensure this vendor belongs to the user
                },
            });
            if (!vendor) {
                throw new Error("Vendor not found");
            }
            // Get AI recommendation if payment method not specified
            let recommendedMethod = paymentData.paymentMethod;
            let aiRecommendationText = "";
            if (!recommendedMethod) {
                const aiRecommendation = yield this.aiAdvisor.analyzePayment(userId, paymentData.vendorId, paymentData.amount, paymentData.currency);
                recommendedMethod = aiRecommendation.bestOption.method;
                aiRecommendationText = aiRecommendation.aiRecommendation;
            }
            // Check if recipient needs to be invited to Payman
            const recipientStatus = yield this.paymanApi.checkRecipientStatus(vendor.email);
            if (recommendedMethod === client_1.PaymentType.USDC && !recipientStatus.registered) {
                // Invite vendor to create a Payman account
                yield this.paymanApi.inviteRecipient({
                    email: vendor.email,
                    name: vendor.name,
                    message: `${vendor.name}, you have a pending payment of ${paymentData.amount} ${paymentData.currency}. Create your Payman account to receive this payment instantly with reduced fees.`,
                });
            }
            // Create the payment in Payman
            const paymanPayment = yield this.paymanApi.createPayment({
                amount: paymentData.amount,
                currency: paymentData.currency,
                recipientEmail: vendor.email,
                paymentMethod: recommendedMethod,
                description: paymentData.description || `Payment to ${vendor.name}`,
            });
            // Get or create a payment method record
            const paymentMethod = yield this.getOrCreatePaymentMethod(userId, recommendedMethod);
            // Record the transaction in our database
            const transaction = yield db_1.default.transaction.create({
                data: {
                    senderId: userId,
                    recipientId: paymentData.vendorId,
                    amount: paymentData.amount,
                    currency: paymentData.currency,
                    status: this.mapPaymanStatus(paymanPayment.status),
                    type: recommendedMethod,
                    description: paymentData.description,
                    invoiceNumber: paymentData.invoiceNumber,
                    exchangeRate: paymanPayment.exchangeRate,
                    fee: paymanPayment.fee,
                    aiRecommendation: aiRecommendationText,
                    paymanPaymentId: paymanPayment.id,
                    paymentMethodId: paymentMethod.id,
                },
            });
            // Create FX optimization record if there are savings
            if (paymanPayment.savings) {
                yield db_1.default.fXOptimization.create({
                    data: {
                        transactionId: transaction.id,
                        optimalMethod: recommendedMethod,
                        predictedRate: paymanPayment.exchangeRate,
                        savingsAmount: paymanPayment.savings.amount,
                        savingsPercentage: paymanPayment.savings.percentage,
                        reasoning: aiRecommendationText ||
                            `${recommendedMethod} recommended by system`,
                    },
                });
            }
            return {
                transaction: {
                    id: transaction.id,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    status: transaction.status,
                    type: transaction.type,
                    createdAt: transaction.createdAt,
                },
                paymanPaymentId: paymanPayment.id,
                status: paymanPayment.status,
                paymentLink: paymanPayment.paymentLink,
            };
        });
    }
    /**
     * Get transactions for a user
     */
    getTransactions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.default.transaction.findMany({
                where: {
                    senderId: userId,
                },
                include: {
                    recipient: true,
                    paymentMethod: true,
                    fxOptimization: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        });
    }
    /**
     * Get a single transaction by ID
     */
    getTransaction(userId, transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield db_1.default.transaction.findFirst({
                where: {
                    id: transactionId,
                    senderId: userId,
                },
                include: {
                    recipient: true,
                    paymentMethod: true,
                    fxOptimization: true,
                },
            });
            if (!transaction) {
                return null;
            }
            // If the transaction is not in a final state, check with Payman for updates
            if (transaction.status !== client_1.TransactionStatus.COMPLETED &&
                transaction.status !== client_1.TransactionStatus.FAILED &&
                transaction.paymanPaymentId) {
                const paymanStatus = yield this.paymanApi.getPaymentStatus(transaction.paymanPaymentId);
                // Update transaction if status has changed
                if (this.mapPaymanStatus(paymanStatus.status) !== transaction.status) {
                    const updatedTransaction = yield db_1.default.transaction.update({
                        where: { id: transactionId },
                        data: {
                            status: this.mapPaymanStatus(paymanStatus.status),
                            completedAt: paymanStatus.status === "completed" ? new Date() : undefined,
                        },
                        include: {
                            recipient: true,
                            paymentMethod: true,
                            fxOptimization: true,
                        },
                    });
                    return updatedTransaction;
                }
            }
            return transaction;
        });
    }
    /**
     * Get payment statistics for a user
     */
    getPaymentStats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get total transactions
            const totalTransactions = yield db_1.default.transaction.count({
                where: { senderId: userId },
            });
            // Get total amount spent
            const totalSpent = yield db_1.default.transaction.aggregate({
                where: {
                    senderId: userId,
                    status: client_1.TransactionStatus.COMPLETED,
                },
                _sum: { amount: true },
            });
            // Get total savings
            const totalSavings = yield db_1.default.fXOptimization.aggregate({
                where: {
                    transaction: { senderId: userId },
                },
                _sum: { savingsAmount: true },
            });
            // Get transactions by payment method
            const paymentMethods = yield db_1.default.transaction.groupBy({
                by: ["type"],
                where: { senderId: userId },
                _count: true,
            });
            // Get recent transactions
            const recentTransactions = yield db_1.default.transaction.findMany({
                where: { senderId: userId },
                take: 5,
                orderBy: { createdAt: "desc" },
                include: { recipient: true },
            });
            return {
                totalTransactions,
                totalSpent: totalSpent._sum.amount || 0,
                totalSavings: totalSavings._sum.savingsAmount || 0,
                paymentMethods,
                recentTransactions,
            };
        });
    }
    /**
     * Helper method to map Payman status to our status
     */
    mapPaymanStatus(paymanStatus) {
        const statusMap = {
            processing: client_1.TransactionStatus.PROCESSING,
            completed: client_1.TransactionStatus.COMPLETED,
            failed: client_1.TransactionStatus.FAILED,
        };
        return statusMap[paymanStatus] || client_1.TransactionStatus.PENDING;
    }
    /**
     * Helper method to get or create a payment method
     */
    getOrCreatePaymentMethod(userId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            // Try to find existing payment method
            const existingMethod = yield db_1.default.paymentMethod.findFirst({
                where: {
                    userId,
                    type,
                },
            });
            if (existingMethod) {
                return existingMethod;
            }
            // Create new payment method
            const methodName = type === client_1.PaymentType.USDC
                ? "USDC Stablecoin"
                : type === client_1.PaymentType.SWIFT
                    ? "SWIFT Bank Transfer"
                    : `${type} Payment`;
            return db_1.default.paymentMethod.create({
                data: {
                    userId,
                    type,
                    name: methodName,
                    isDefault: false,
                },
            });
        });
    }
}
exports.PaymentService = PaymentService;
