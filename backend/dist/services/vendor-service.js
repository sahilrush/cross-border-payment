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
exports.VendorService = void 0;
const db_1 = __importDefault(require("../config/db"));
class VendorService {
    createVendor(userId, vendorData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if a vendor with this email already exists for this user
            const existingVendor = yield db_1.default.vendor.findFirst({
                where: {
                    userId,
                    email: vendorData.email,
                },
            });
            if (existingVendor) {
                throw new Error("A vendor with this email already exists");
            }
            // Create vendor
            return db_1.default.vendor.create({
                data: Object.assign(Object.assign({}, vendorData), { userId }),
            });
        });
    }
    /**
     * Get all vendors for a user
     */
    getVendors(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.default.vendor.findMany({
                where: { userId },
                orderBy: { name: "asc" },
            });
        });
    }
    /**
     * Get a vendor by ID
     */
    getVendor(userId, vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.default.vendor.findFirst({
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
        });
    }
    /**
     * Update a vendor
     */
    updateVendor(userId, vendorId, vendorData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if vendor exists and belongs to user
            const vendor = yield db_1.default.vendor.findFirst({
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
                const existingVendor = yield db_1.default.vendor.findFirst({
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
            return db_1.default.vendor.update({
                where: { id: vendorId },
                data: vendorData,
            });
        });
    }
    /**
     * Delete a vendor
     */
    deleteVendor(userId, vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if vendor exists and belongs to user
            const vendor = yield db_1.default.vendor.findFirst({
                where: {
                    id: vendorId,
                    userId,
                },
            });
            if (!vendor) {
                throw new Error("Vendor not found");
            }
            // Delete vendor
            yield db_1.default.vendor.delete({
                where: { id: vendorId },
            });
        });
    }
    /**
     * Add a bank account to a vendor
     */
    addBankAccount(userId, vendorId, bankData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if vendor exists and belongs to user
            const vendor = yield db_1.default.vendor.findFirst({
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
                yield db_1.default.bankAccount.updateMany({
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
            return db_1.default.bankAccount.create({
                data: Object.assign(Object.assign({}, bankData), { vendorId }),
            });
        });
    }
    /**
     * Get bank accounts for a vendor
     */
    getBankAccounts(userId, vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if vendor exists and belongs to user
            const vendor = yield db_1.default.vendor.findFirst({
                where: {
                    id: vendorId,
                    userId,
                },
            });
            if (!vendor) {
                throw new Error("Vendor not found");
            }
            // Get bank accounts
            return db_1.default.bankAccount.findMany({
                where: { vendorId },
            });
        });
    }
    /**
     * Add a crypto wallet to a vendor
     */
    addCryptoWallet(userId, vendorId, walletData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if vendor exists and belongs to user
            const vendor = yield db_1.default.vendor.findFirst({
                where: {
                    id: vendorId,
                    userId,
                },
            });
            if (!vendor) {
                throw new Error("Vendor not found");
            }
            // Check if wallet with this address already exists
            const existingWallet = yield db_1.default.cryptoWallet.findFirst({
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
                yield db_1.default.cryptoWallet.updateMany({
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
                yield db_1.default.vendor.update({
                    where: { id: vendorId },
                    data: { acceptsCrypto: true },
                });
            }
            // Create wallet
            return db_1.default.cryptoWallet.create({
                data: Object.assign(Object.assign({}, walletData), { vendorId }),
            });
        });
    }
    /**
     * Get crypto wallets for a vendor
     */
    getCryptoWallets(userId, vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if vendor exists and belongs to user
            const vendor = yield db_1.default.vendor.findFirst({
                where: {
                    id: vendorId,
                    userId,
                },
            });
            if (!vendor) {
                throw new Error("Vendor not found");
            }
            // Get wallets
            return db_1.default.cryptoWallet.findMany({
                where: { vendorId },
            });
        });
    }
    /**
     * Get vendors that accept crypto
     */
    getVendorsAcceptingCrypto(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.default.vendor.findMany({
                where: {
                    userId,
                    acceptsCrypto: true,
                },
                include: {
                    wallets: true,
                },
            });
        });
    }
    /**
     * Get a vendor's payment history
     */
    getVendorPaymentHistory(userId, vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if vendor exists and belongs to user
            const vendor = yield db_1.default.vendor.findFirst({
                where: {
                    id: vendorId,
                    userId,
                },
            });
            if (!vendor) {
                throw new Error("Vendor not found");
            }
            // Get payments
            return db_1.default.transaction.findMany({
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
        });
    }
}
exports.VendorService = VendorService;
