// src/controllers/vendor.controller.ts
import { Request, Response } from "express";
import { VendorService } from "../../services/vendor-service";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  CreateBankAccountDto,
  CreateVendorDto,
  CreateWalletDto,
  UpdateVendorDto,
} from "../../types";

export class VendorController {
  private vendorService: VendorService;

  constructor() {
    this.vendorService = new VendorService();
  }

  /**
   * Create a new vendor
   */
  async createVendor(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const vendorData: CreateVendorDto = req.body;

      // Validate required fields
      if (
        !vendorData.name ||
        !vendorData.email ||
        !vendorData.country ||
        !vendorData.currency
      ) {
        res
          .status(400)
          .json({ error: "Name, email, country and currency are required" });
        return;
      }

      const vendor = await this.vendorService.createVendor(userId, vendorData);
      res.status(201).json(vendor);
    } catch (error) {
      console.error("Vendor creation error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to create vendor" });
      }
    }
  }

  /**
   * Get all vendors for a user
   */
  async getVendors(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const vendors = await this.vendorService.getVendors(userId);
      res.status(200).json(vendors);
    } catch (error) {
      console.error("Get vendors error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to get vendors" });
      }
    }
  }

  /**
   * Get a vendor by ID
   */
  async getVendor(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const vendorId = req.params.id;

      if (!vendorId) {
        res.status(400).json({ error: "Vendor ID is required" });
        return;
      }

      const vendor = await this.vendorService.getVendor(userId, vendorId);

      if (!vendor) {
        res.status(404).json({ error: "Vendor not found" });
        return;
      }

      res.status(200).json(vendor);
    } catch (error) {
      console.error("Get vendor error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to get vendor" });
      }
    }
  }

  /**
   * Update a vendor
   */
  async updateVendor(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const vendorId = req.params.id;

      if (!vendorId) {
        res.status(400).json({ error: "Vendor ID is required" });
        return;
      }

      const vendorData: UpdateVendorDto = req.body;
      const vendor = await this.vendorService.updateVendor(
        userId,
        vendorId,
        vendorData
      );

      res.status(200).json(vendor);
    } catch (error) {
      console.error("Update vendor error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to update vendor" });
      }
    }
  }

  /**
   * Delete a vendor
   */
  async deleteVendor(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const vendorId = req.params.id;

      if (!vendorId) {
        res.status(400).json({ error: "Vendor ID is required" });
        return;
      }

      await this.vendorService.deleteVendor(userId, vendorId);
      res.status(204).send();
    } catch (error) {
      console.error("Delete vendor error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to delete vendor" });
      }
    }
  }

  /**
   * Add a bank account to a vendor
   */
  async addBankAccount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const vendorId = req.params.id;

      if (!vendorId) {
        res.status(400).json({ error: "Vendor ID is required" });
        return;
      }

      const bankData: CreateBankAccountDto = req.body;

      // Validate required fields
      if (
        !bankData.bankName ||
        !bankData.accountNumber ||
        !bankData.accountName ||
        !bankData.currency
      ) {
        res.status(400).json({
          error:
            "Bank name, account number, account name and currency are required",
        });
        return;
      }

      const bankAccount = await this.vendorService.addBankAccount(
        userId,
        vendorId,
        bankData
      );
      res.status(201).json(bankAccount);
    } catch (error) {
      console.error("Add bank account error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to add bank account" });
      }
    }
  }

  /**
   * Get bank accounts for a vendor
   */
  async getBankAccounts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const vendorId = req.params.id;

      if (!vendorId) {
        res.status(400).json({ error: "Vendor ID is required" });
        return;
      }

      const bankAccounts = await this.vendorService.getBankAccounts(
        userId,
        vendorId
      );
      res.status(200).json(bankAccounts);
    } catch (error) {
      console.error("Get bank accounts error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to get bank accounts" });
      }
    }
  }

  /**
   * Add a crypto wallet to a vendor
   */
  async addCryptoWallet(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const vendorId = req.params.id;

      if (!vendorId) {
        res.status(400).json({ error: "Vendor ID is required" });
        return;
      }

      const walletData: CreateWalletDto = req.body;

      // Validate required fields
      if (!walletData.address || !walletData.network || !walletData.type) {
        res
          .status(400)
          .json({ error: "Wallet address, network and type are required" });
        return;
      }

      const wallet = await this.vendorService.addCryptoWallet(
        userId,
        vendorId,
        walletData
      );
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
   * Get crypto wallets for a vendor
   */
  async getCryptoWallets(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const vendorId = req.params.id;

      if (!vendorId) {
        res.status(400).json({ error: "Vendor ID is required" });
        return;
      }

      const wallets = await this.vendorService.getCryptoWallets(
        userId,
        vendorId
      );
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
   * Get vendors that accept crypto
   */
  async getVendorsAcceptingCrypto(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const vendors = await this.vendorService.getVendorsAcceptingCrypto(
        userId
      );
      res.status(200).json(vendors);
    } catch (error) {
      console.error("Get vendors accepting crypto error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res
          .status(500)
          .json({ error: "Failed to get vendors accepting crypto" });
      }
    }
  }

  /**
   * Get payment history for a vendor
   */
  async getVendorPaymentHistory(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const vendorId = req.params.id;

      if (!vendorId) {
        res.status(400).json({ error: "Vendor ID is required" });
        return;
      }

      const payments = await this.vendorService.getVendorPaymentHistory(
        userId,
        vendorId
      );
      res.status(200).json(payments);
    } catch (error) {
      console.error("Get vendor payment history error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to get vendor payment history" });
      }
    }
  }
}
