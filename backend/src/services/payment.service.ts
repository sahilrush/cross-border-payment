import prisma from "../config/db";
import { CreatePaymentDto } from "../types";
import { AIAdvisorService } from "./ai-advisor.service";
import { PaymenApiService } from "./paymen.service";

export class PaymentService {
  private paymanApi: PaymenApiService;
  private aiAdvisor: AIAdvisorService;

  constructor() {
    this.paymanApi = new PaymenApiService();
    this.aiAdvisor = new AIAdvisorService();
  }

  //create and process a new payment
  async createPayment(
    userId: string,
    paymentData: CreatePaymentDto
  ): Promise<PaymentResponse> {
    const vendor = await prisma.vendor.findFirst({
      where: { id: paymentData.vendorId, userId },
    });

    if (!vendor) {
      throw new Error("Vendor not found");
    }

    //get ai recommmendations if payment method is not specified
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
  }
}
