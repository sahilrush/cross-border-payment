// src/controllers/user.controller.ts
import { Request, Response } from "express";

import { AuthRequest } from "../middlewares/auth.middleware";
import bcrypt from "bcrypt";
import prisma from "../../config/db";

export class UserController {
  /**
   * Get the current user's profile
   */
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          wallets: true,
          paymentMethods: true,
        },
      });

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      // Don't return the password hash
      const { passwordHash, ...userWithoutPassword } = user;

      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Get profile error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to get user profile" });
      }
    }
  }

  /**
   * Update the current user's profile
   */
  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { name, country, currency, acceptsCrypto } = req.body;

      // Update user data
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name: name !== undefined ? name : undefined,
          country: country !== undefined ? country : undefined,
          currency: currency !== undefined ? currency : undefined,
          acceptsCrypto:
            acceptsCrypto !== undefined ? acceptsCrypto : undefined,
        },
        include: {
          wallets: true,
          paymentMethods: true,
        },
      });

      // Don't return the password hash
      const { passwordHash, ...userWithoutPassword } = updatedUser;

      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Update profile error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to update user profile" });
      }
    }
  }

  /**
   * Change the user's password
   */
  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res
          .status(400)
          .json({ error: "Current password and new password are required" });
        return;
      }

      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );

      if (!isPasswordValid) {
        res.status(401).json({ error: "Current password is incorrect" });
        return;
      }

      // Hash and save new password
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      });

      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to change password" });
      }
    }
  }

  /**
   * Add a crypto wallet to the user
   */
  async addCryptoWallet(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { address, network, type, label, isDefault } = req.body;

      if (!address || !network || !type) {
        res
          .status(400)
          .json({ error: "Wallet address, network and type are required" });
        return;
      }

      // Check if wallet with this address already exists
      const existingWallet = await prisma.cryptoWallet.findFirst({
        where: {
          address,
          network,
          userId,
        },
      });

      if (existingWallet) {
        res
          .status(400)
          .json({ error: "A wallet with this address already exists" });
        return;
      }

      // If this wallet is being set as default, unset other defaults
      if (isDefault) {
        await prisma.cryptoWallet.updateMany({
          where: {
            userId,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }

      // Update user to accept crypto
      if (!isDefault) {
        await prisma.user.update({
          where: { id: userId },
          data: { acceptsCrypto: true },
        });
      }

      // Create wallet
      const wallet = await prisma.cryptoWallet.create({
        data: {
          address,
          network,
          type,
          label,
          isDefault: isDefault || false,
          userId,
        },
      });

      res.status(201).json(wallet);
    } catch (error) {
      console.error("Add crypto wallet error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to add crypto wallet" });
      }
    }
  }

  /**
   * Get user's crypto wallets
   */
  async getCryptoWallets(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const wallets = await prisma.cryptoWallet.findMany({
        where: { userId },
      });

      res.status(200).json(wallets);
    } catch (error) {
      console.error("Get crypto wallets error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to get crypto wallets" });
      }
    }
  }

  /**
   * Get user's payment methods
   */
  async getPaymentMethods(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const paymentMethods = await prisma.paymentMethod.findMany({
        where: { userId },
      });

      res.status(200).json(paymentMethods);
    } catch (error) {
      console.error("Get payment methods error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to get payment methods" });
      }
    }
  }

  /**
   * Get user's dashboard summary
   */
  async getDashboardSummary(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      // Get total vendors
      const totalVendors = await prisma.vendor.count({
        where: { userId },
      });

      // Get vendors accepting crypto
      const vendorsAcceptingCrypto = await prisma.vendor.count({
        where: {
          userId,
          acceptsCrypto: true,
        },
      });

      // Get total transactions
      const totalTransactions = await prisma.transaction.count({
        where: { senderId: userId },
      });

      // Get transaction stats
      const transactionStats = await prisma.transaction.groupBy({
        by: ["type"],
        where: { senderId: userId },
        _count: true,
        _sum: { amount: true },
      });

      // Get total savings
      const totalSavings = await prisma.fXOptimization.aggregate({
        where: {
          transaction: { senderId: userId },
        },
        _sum: { savingsAmount: true },
      });

      // Get recent transactions
      const recentTransactions = await prisma.transaction.findMany({
        where: { senderId: userId },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { recipient: true, paymentMethod: true },
      });

      res.status(200).json({
        vendors: {
          total: totalVendors,
          acceptingCrypto: vendorsAcceptingCrypto,
          percentage:
            totalVendors > 0
              ? (vendorsAcceptingCrypto / totalVendors) * 100
              : 0,
        },
        transactions: {
          total: totalTransactions,
          byType: transactionStats,
        },
        savings: totalSavings._sum.savingsAmount || 0,
        recentTransactions,
      });
    } catch (error) {
      console.error("Dashboard summary error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to get dashboard summary" });
      }
    }
  }
}
