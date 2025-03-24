import axios, { AxiosInstance } from "axios";
import {
  PaymanExchangeRates,
  PaymanPayment,
  PaymanRecipientStatus,
} from "../types";
import { response } from "express";

interface PaymentData {
  amount: number;
  currency: string;
  recipientEmail: string;
  paymentMethod: string;
  description?: string;
}

export class PaymenApiService {
  private apiKey: string;
  private baseUrl: string;
  private client: AxiosInstance;

  constructor() {
    this.apiKey = process.env.PAYMAN_API_KEY || "";
    this.baseUrl = process.env.PAYMAN_BASE_URL || "https://api.payman.com/v1";
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error(
          "Payman API Error",
          error.response?.data || error.message
        );
        throw new Error(
          error.response?.data?.message || "Error communicating with Payman API"
        );
      }
    );
  }

  //check if a recipient is registered with paymen and accepts crypto
  async checkRecipientStatus(email: string): Promise<PaymanRecipientStatus> {
    try {
      const res = await this.client.get<PaymanRecipientStatus>(
        `/recipients/check?email=${email}`
      );
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.code === "ECONNREFUSED") {
        console.warn("Payman API unavailable, returning mock data");
        return {
          email,
          registered: false,
          acceptsCrypto: false,
        };
      }
      throw error;
    }
  }

  async getExchangeRates(
    fromCurrency: string,
    toCurrency: string
  ): Promise<PaymanExchangeRates> {
    try {
      const res = await this.client.get<PaymanExchangeRates>(
        `/exchange-rates?from=${fromCurrency}&to=${toCurrency}`
      );
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.code === "ECONNREFUSED") {
        console.warn("Payman API unavailable, returning mock data");
        return {
          fromCurrency,
          toCurrency,
          rates: {
            SWIFT: 1.0,
            USDC: 1.0,
          },
          fees: {
            SWIFT: fromCurrency === "USD" ? 10 : 20,
            USDC: 0,
          },
        };
      }
      throw error;
    }
  }

  //creating a new payment
  async createPayment(paymentData: PaymentData): Promise<PaymanPayment> {
    try {
      const res = await this.client.post<PaymanPayment>(
        "/payments",
        paymentData
      );
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.code === "ECONNREFUSED") {
        console.warn("Payman API unavailable, returning mock data");

        const mockPayment: PaymanPayment = {
          id: "mock-" + Date.now(),
          amount: paymentData.amount,
          currency: paymentData.currency,
          recipientEmail: paymentData.recipientEmail,
          paymentMethod: paymentData.paymentMethod,
          status: "processing",
          exchangeRate: paymentData.paymentMethod === "USDC" ? 1.01 : 1.05,
          fee:
            paymentData.paymentMethod === "USDC"
              ? Math.max(5, paymentData.amount * 0.01)
              : Math.max(25, paymentData.amount * 0.05),
          savings:
            paymentData.paymentMethod === "USDC"
              ? {
                  amount: Math.max(20, paymentData.amount * 0.04),
                  percentage: 4,
                }
              : undefined,
          createdAt: new Date().toISOString(),
          paymentLink: "https://payman.com/pay/mock-" + Date.now(),
        };

        return mockPayment;
      }
      throw error;
    }
  }

  //invite a recipant to join payman

  async inviteRecipient(recipientData: {
    email: string;
    name: string;
    message?: string;
  }): Promise<{ success: boolean; inviteId: string }> {
    try {
      const response = await this.client.post(
        "/recipients/invite",
        recipientData
      );
      return response.data;
    } catch (error) {
      // If service is unavailable, return mock success
      if (axios.isAxiosError(error) && error.code === "ECONNREFUSED") {
        console.warn("Payman API unavailable, returning mock data");
        return {
          success: true,
          inviteId: "mock-invite-" + Date.now(),
        };
      }
      throw error;
    }
  }

  //get payment status

  async getPaymentStatus(paymentId: string): Promise<PaymanPayment> {
    try {
      const res = await this.client.get<PaymanPayment>(
        `/payments/${paymentId}`
      );
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.code === "ENCONNREFUSED") {
        console.warn("Payman API unavailable, returning mock data");

        const statuses = ["processing", "completed", "failed"];
        const randomStatus =
          statuses[Math.floor(Math.random() * statuses.length)];

        return {
          id: paymentId,
          amount: 100, // Mock amount
          currency: "USD",
          recipientEmail: "recipient@example.com",
          paymentMethod: "USDC",
          status: randomStatus,
          exchangeRate: 1.01,
          fee: 5,
          createdAt: new Date().toISOString(),
          completedAt:
            randomStatus === "completed" ? new Date().toISOString() : undefined,
        };
      }
      throw error;
    }
  }
}
