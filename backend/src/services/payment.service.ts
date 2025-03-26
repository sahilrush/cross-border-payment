import {
  PrismaClient,
  PaymentType,
  Transaction,
  TransactionStatus,
} from "@prisma/client";
import { AIAdvisorService } from "./ai-advisor.service";
import { CreatePaymentDto, PaymentResponse } from "../types";
import { PaymenApiService } from "./paymen.service";
import prisma from "../config/db";

export class PaymentService {
  private paymanApi: PaymenApiService;
  private aiAdvisor: AIAdvisorService;

  constructor() {
    this.paymanApi = new PaymenApiService();
    this.aiAdvisor = new AIAdvisorService();
  }

  /**
   * Create and process a new payment
   */
  async createPayment(
    userId: string,
    paymentData: CreatePaymentDto
  ): Promise<PaymentResponse> {
    // Get vendor information
    const vendor = await prisma.vendor.findFirst({
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
      const aiRecommendation = await this.aiAdvisor.analyzePayment(
        userId,
        paymentData.vendorId,
        paymentData.amount,
        paymentData.currency
      );

      recommendedMethod = aiRecommendation.bestOption.method;
      aiRecommendationText = aiRecommendation.aiRecommendation;
    }

    // Check if recipient needs to be invited to Payman
    const recipientStatus = await this.paymanApi.checkRecipientStatus(
      vendor.email
    );

    if (recommendedMethod === PaymentType.USDC && !recipientStatus.registered) {
      // Invite vendor to create a Payman account
      await this.paymanApi.inviteRecipient({
        email: vendor.email,
        name: vendor.name,
        message: `${vendor.name}, you have a pending payment of ${paymentData.amount} ${paymentData.currency}. Create your Payman account to receive this payment instantly with reduced fees.`,
      });
    }

    // Create the payment in Payman
    const paymanPayment = await this.paymanApi.createPayment({
      amount: paymentData.amount,
      currency: paymentData.currency,
      recipientEmail: vendor.email,
      paymentMethod: recommendedMethod as string,
      description: paymentData.description || `Payment to ${vendor.name}`,
    });

    // Get or create a payment method record
    const paymentMethod = await this.getOrCreatePaymentMethod(
      userId,
      recommendedMethod as PaymentType
    );

    // Record the transaction in our database
    const transaction = await prisma.transaction.create({
      data: {
        senderId: userId,
        recipientId: paymentData.vendorId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: this.mapPaymanStatus(paymanPayment.status),
        type: recommendedMethod as PaymentType,
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
      await prisma.fXOptimization.create({
        data: {
          transactionId: transaction.id,
          optimalMethod: recommendedMethod as PaymentType,
          predictedRate: paymanPayment.exchangeRate,
          savingsAmount: paymanPayment.savings.amount,
          savingsPercentage: paymanPayment.savings.percentage,
          reasoning:
            aiRecommendationText ||
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
  }

  /**
   * Get transactions for a user
   */
  async getTransactions(userId: string): Promise<Transaction[]> {
    return prisma.transaction.findMany({
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
  }

  /**
   * Get a single transaction by ID
   */
  async getTransaction(
    userId: string,
    transactionId: string
  ): Promise<Transaction | null> {
    const transaction = await prisma.transaction.findFirst({
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
    if (
      transaction.status !== TransactionStatus.COMPLETED &&
      transaction.status !== TransactionStatus.FAILED &&
      transaction.paymanPaymentId
    ) {
      const paymanStatus = await this.paymanApi.getPaymentStatus(
        transaction.paymanPaymentId
      );

      // Update transaction if status has changed
      if (this.mapPaymanStatus(paymanStatus.status) !== transaction.status) {
        const updatedTransaction = await prisma.transaction.update({
          where: { id: transactionId },
          data: {
            status: this.mapPaymanStatus(paymanStatus.status),
            completedAt:
              paymanStatus.status === "completed" ? new Date() : undefined,
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
  }

  /**
   * Get payment statistics for a user
   */
  async getPaymentStats(userId: string): Promise<any> {
    // Get total transactions
    const totalTransactions = await prisma.transaction.count({
      where: { senderId: userId },
    });

    // Get total amount spent
    const totalSpent = await prisma.transaction.aggregate({
      where: {
        senderId: userId,
        status: TransactionStatus.COMPLETED,
      },
      _sum: { amount: true },
    });

    // Get total savings
    const totalSavings = await prisma.fXOptimization.aggregate({
      where: {
        transaction: { senderId: userId },
      },
      _sum: { savingsAmount: true },
    });

    // Get transactions by payment method
    const paymentMethods = await prisma.transaction.groupBy({
      by: ["type"],
      where: { senderId: userId },
      _count: true,
    });

    // Get recent transactions
    const recentTransactions = await prisma.transaction.findMany({
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
  }

  /**
   * Helper method to map Payman status to our status
   */
  private mapPaymanStatus(paymanStatus: string): TransactionStatus {
    const statusMap: Record<string, TransactionStatus> = {
      processing: TransactionStatus.PROCESSING,
      completed: TransactionStatus.COMPLETED,
      failed: TransactionStatus.FAILED,
    };

    return statusMap[paymanStatus] || TransactionStatus.PENDING;
  }

  /**
   * Helper method to get or create a payment method
   */
  private async getOrCreatePaymentMethod(userId: string, type: PaymentType) {
    // Try to find existing payment method
    const existingMethod = await prisma.paymentMethod.findFirst({
      where: {
        userId,
        type,
      },
    });

    if (existingMethod) {
      return existingMethod;
    }

    // Create new payment method
    const methodName =
      type === PaymentType.USDC
        ? "USDC Stablecoin"
        : type === PaymentType.SWIFT
        ? "SWIFT Bank Transfer"
        : `${type} Payment`;

    return prisma.paymentMethod.create({
      data: {
        userId,
        type,
        name: methodName,
        isDefault: false,
      },
    });
  }
}
