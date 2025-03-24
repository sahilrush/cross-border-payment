import { Vendor, BankAccount, CryptoWallet } from "@prisma/client";
import {
  CreateVendorDto,
  UpdateVendorDto,
  CreateBankAccountDto,
  CreateWalletDto,
} from "../types";
import prisma from "../config/db";

export class VendorService {
  /**
   * Create a new vendor
   */
  async createVendor(
    userId: string,
    vendorData: CreateVendorDto
  ): Promise<Vendor> {
    // Check if a vendor with this email already exists for this user
    const existingVendor = await prisma.vendor.findFirst({
      where: {
        userId,
        email: vendorData.email,
      },
    });

    if (existingVendor) {
      throw new Error("A vendor with this email already exists");
    }

    // Create vendor
    return prisma.vendor.create({
      data: {
        ...vendorData,
        userId,
      },
    });
  }

  /**
   * Get all vendors for a user
   */
  async getVendors(userId: string): Promise<Vendor[]> {
    return prisma.vendor.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Get a vendor by ID
   */
  async getVendor(userId: string, vendorId: string): Promise<Vendor | null> {
    return prisma.vendor.findFirst({
      where: {
        id: vendorId,
        userId,
      },
      include: {
        bankAccounts: true,
        wallets: true,
        receivedPayments: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  /**
   * Update a vendor
   */
  async updateVendor(
    userId: string,
    vendorId: string,
    vendorData: UpdateVendorDto
  ): Promise<Vendor> {
    // Check if vendor exists and belongs to user
    const vendor = await prisma.vendor.findFirst({
      where: {
        id: vendorId,
        userId,
      },
    });

    if (!vendor) {
      throw new Error("Vendor not found");
    }

    // If email is being updated, check for duplicates
    if (vendorData.email && vendorData.email !== vendor.email) {
      const existingVendor = await prisma.vendor.findFirst({
        where: {
          userId,
          email: vendorData.email,
          id: { not: vendorId },
        },
      });

      if (existingVendor) {
        throw new Error("A vendor with this email already exists");
      }
    }

    // Update vendor
    return prisma.vendor.update({
      where: { id: vendorId },
      data: vendorData,
    });
  }

  /**
   * Delete a vendor
   */
  async deleteVendor(userId: string, vendorId: string): Promise<void> {
    // Check if vendor exists and belongs to user
    const vendor = await prisma.vendor.findFirst({
      where: {
        id: vendorId,
        userId,
      },
    });

    if (!vendor) {
      throw new Error("Vendor not found");
    }

    // Delete vendor
    await prisma.vendor.delete({
      where: { id: vendorId },
    });
  }

  /**
   * Add a bank account to a vendor
   */
  async addBankAccount(
    userId: string,
    vendorId: string,
    bankData: CreateBankAccountDto
  ): Promise<BankAccount> {
    // Check if vendor exists and belongs to user
    const vendor = await prisma.vendor.findFirst({
      where: {
        id: vendorId,
        userId,
      },
    });

    if (!vendor) {
      throw new Error("Vendor not found");
    }

    // If this account is being set as default, unset other defaults
    if (bankData.isDefault) {
      await prisma.bankAccount.updateMany({
        where: {
          vendorId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Create bank account
    return prisma.bankAccount.create({
      data: {
        ...bankData,
        vendorId,
      },
    });
  }

  /**
   * Get bank accounts for a vendor
   */
  async getBankAccounts(
    userId: string,
    vendorId: string
  ): Promise<BankAccount[]> {
    // Check if vendor exists and belongs to user
    const vendor = await prisma.vendor.findFirst({
      where: {
        id: vendorId,
        userId,
      },
    });

    if (!vendor) {
      throw new Error("Vendor not found");
    }

    // Get bank accounts
    return prisma.bankAccount.findMany({
      where: { vendorId },
    });
  }

  /**
   * Add a crypto wallet to a vendor
   */
  async addCryptoWallet(
    userId: string,
    vendorId: string,
    walletData: CreateWalletDto
  ): Promise<CryptoWallet> {
    // Check if vendor exists and belongs to user
    const vendor = await prisma.vendor.findFirst({
      where: {
        id: vendorId,
        userId,
      },
    });

    if (!vendor) {
      throw new Error("Vendor not found");
    }

    // Check if wallet with this address already exists
    const existingWallet = await prisma.cryptoWallet.findFirst({
      where: {
        address: walletData.address,
        network: walletData.network,
      },
    });

    if (existingWallet) {
      throw new Error("A wallet with this address already exists");
    }

    // If this wallet is being set as default, unset other defaults
    if (walletData.isDefault) {
      await prisma.cryptoWallet.updateMany({
        where: {
          vendorId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Update vendor to accept crypto
    if (!vendor.acceptsCrypto) {
      await prisma.vendor.update({
        where: { id: vendorId },
        data: { acceptsCrypto: true },
      });
    }

    // Create wallet
    return prisma.cryptoWallet.create({
      data: {
        ...walletData,
        vendorId,
      },
    });
  }

  /**
   * Get crypto wallets for a vendor
   */
  async getCryptoWallets(
    userId: string,
    vendorId: string
  ): Promise<CryptoWallet[]> {
    // Check if vendor exists and belongs to user
    const vendor = await prisma.vendor.findFirst({
      where: {
        id: vendorId,
        userId,
      },
    });

    if (!vendor) {
      throw new Error("Vendor not found");
    }

    // Get wallets
    return prisma.cryptoWallet.findMany({
      where: { vendorId },
    });
  }

  /**
   * Get vendors that accept crypto
   */
  async getVendorsAcceptingCrypto(userId: string): Promise<Vendor[]> {
    return prisma.vendor.findMany({
      where: {
        userId,
        acceptsCrypto: true,
      },
      include: {
        wallets: true,
      },
    });
  }

  /**
   * Get a vendor's payment history
   */
  async getVendorPaymentHistory(
    userId: string,
    vendorId: string
  ): Promise<any[]> {
    // Check if vendor exists and belongs to user
    const vendor = await prisma.vendor.findFirst({
      where: {
        id: vendorId,
        userId,
      },
    });

    if (!vendor) {
      throw new Error("Vendor not found");
    }

    // Get payments
    return prisma.transaction.findMany({
      where: {
        recipientId: vendorId,
        senderId: userId,
      },
      include: {
        paymentMethod: true,
        fxOptimization: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
