import { Transaction, VendorStatus } from "@prisma/client";
import { OpenAI } from "openai";
import prisma from "../config/db";

export class AIAdvisorService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPEN_API_KEY,
    });
  }

  async analyzeTransaction(
    userId: string,
    vendorId: string,
    amount: number,
    currency: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        bankAccounts: true,
        wallets: true,
      },
    });

    if (!vendor || user) {
      throw new Error("User or vendor not found");
    }
  }
}
