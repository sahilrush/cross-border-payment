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
exports.VendorController = void 0;
const vendor_service_1 = require("../../services/vendor-service");
class VendorController {
    constructor() {
        this.vendorService = new vendor_service_1.VendorService();
    }
    /**
     * Create a new vendor
     */
    createVendor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                if (!userId) {
                    res.status(401).json({ error: "Unauthorized" });
                    return;
                }
                const vendorData = req.body;
                // Validate required fields
                if (!vendorData.name ||
                    !vendorData.email ||
                    !vendorData.country ||
                    !vendorData.currency) {
                    res
                        .status(400)
                        .json({ error: "Name, email, country and currency are required" });
                    return;
                }
                const vendor = yield this.vendorService.createVendor(userId, vendorData);
                res.status(201).json(vendor);
            }
            catch (error) {
                console.error("Vendor creation error:", error);
                if (error instanceof Error) {
                    res.status(400).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: "Failed to create vendor" });
                }
            }
        });
    }
    /**
     * Get all vendors for a user
     */
    getVendors(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                if (!userId) {
                    res.status(401).json({ error: "Unauthorized" });
                    return;
                }
                const vendors = yield this.vendorService.getVendors(userId);
                res.status(200).json(vendors);
            }
            catch (error) {
                console.error("Get vendors error:", error);
                if (error instanceof Error) {
                    res.status(400).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: "Failed to get vendors" });
                }
            }
        });
    }
    /**
     * Get a vendor by ID
     */
    getVendor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const vendor = yield this.vendorService.getVendor(userId, vendorId);
                if (!vendor) {
                    res.status(404).json({ error: "Vendor not found" });
                    return;
                }
                res.status(200).json(vendor);
            }
            catch (error) {
                console.error("Get vendor error:", error);
                if (error instanceof Error) {
                    res.status(400).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: "Failed to get vendor" });
                }
            }
        });
    }
    /**
     * Update a vendor
     */
    updateVendor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const vendorData = req.body;
                const vendor = yield this.vendorService.updateVendor(userId, vendorId, vendorData);
                res.status(200).json(vendor);
            }
            catch (error) {
                console.error("Update vendor error:", error);
                if (error instanceof Error) {
                    res.status(400).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: "Failed to update vendor" });
                }
            }
        });
    }
    /**
     * Delete a vendor
     */
    deleteVendor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                yield this.vendorService.deleteVendor(userId, vendorId);
                res.status(204).send();
            }
            catch (error) {
                console.error("Delete vendor error:", error);
                if (error instanceof Error) {
                    res.status(400).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: "Failed to delete vendor" });
                }
            }
        });
    }
    /**
     * Add a bank account to a vendor
     */
    addBankAccount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const bankData = req.body;
                // Validate required fields
                if (!bankData.bankName ||
                    !bankData.accountNumber ||
                    !bankData.accountName ||
                    !bankData.currency) {
                    res.status(400).json({
                        error: "Bank name, account number, account name and currency are required",
                    });
                    return;
                }
                const bankAccount = yield this.vendorService.addBankAccount(userId, vendorId, bankData);
                res.status(201).json(bankAccount);
            }
            catch (error) {
                console.error("Add bank account error:", error);
                if (error instanceof Error) {
                    res.status(400).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: "Failed to add bank account" });
                }
            }
        });
    }
    /**
     * Get bank accounts for a vendor
     */
    getBankAccounts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const bankAccounts = yield this.vendorService.getBankAccounts(userId, vendorId);
                res.status(200).json(bankAccounts);
            }
            catch (error) {
                console.error("Get bank accounts error:", error);
                if (error instanceof Error) {
                    res.status(400).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: "Failed to get bank accounts" });
                }
            }
        });
    }
    /**
     * Add a crypto wallet to a vendor
     */
    addCryptoWallet(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const walletData = req.body;
                // Validate required fields
                if (!walletData.address || !walletData.network || !walletData.type) {
                    res
                        .status(400)
                        .json({ error: "Wallet address, network and type are required" });
                    return;
                }
                const wallet = yield this.vendorService.addCryptoWallet(userId, vendorId, walletData);
                res.status(201).json(wallet);
            }
            catch (error) {
                console.error("Add crypto wallet error:", error);
                if (error instanceof Error) {
                    res.status(400).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: "Failed to add crypto wallet" });
                }
            }
        });
    }
    /**
     * Get crypto wallets for a vendor
     */
    getCryptoWallets(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const wallets = yield this.vendorService.getCryptoWallets(userId, vendorId);
                res.status(200).json(wallets);
            }
            catch (error) {
                console.error("Get crypto wallets error:", error);
                if (error instanceof Error) {
                    res.status(400).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: "Failed to get crypto wallets" });
                }
            }
        });
    }
    /**
     * Get vendors that accept crypto
     */
    getVendorsAcceptingCrypto(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                if (!userId) {
                    res.status(401).json({ error: "Unauthorized" });
                    return;
                }
                const vendors = yield this.vendorService.getVendorsAcceptingCrypto(userId);
                res.status(200).json(vendors);
            }
            catch (error) {
                console.error("Get vendors accepting crypto error:", error);
                if (error instanceof Error) {
                    res.status(400).json({ error: error.message });
                }
                else {
                    res
                        .status(500)
                        .json({ error: "Failed to get vendors accepting crypto" });
                }
            }
        });
    }
    /**
     * Get payment history for a vendor
     */
    getVendorPaymentHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const payments = yield this.vendorService.getVendorPaymentHistory(userId, vendorId);
                res.status(200).json(payments);
            }
            catch (error) {
                console.error("Get vendor payment history error:", error);
                if (error instanceof Error) {
                    res.status(400).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: "Failed to get vendor payment history" });
                }
            }
        });
    }
}
exports.VendorController = VendorController;
