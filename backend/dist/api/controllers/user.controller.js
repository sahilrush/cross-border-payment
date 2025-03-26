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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("../../config/db"));
class UserController {
    /**
     * Get the current user's profile
     */
    getProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                if (!userId) {
                    res.status(401).json({ error: "Unauthorized" });
                    return;
                }
                const user = yield db_1.default.user.findUnique({
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
                const { passwordHash } = user, userWithoutPassword = __rest(user, ["passwordHash"]);
                res.status(200).json(userWithoutPassword);
            }
            catch (error) {
                console.error("Get profile error:", error);
                if (error instanceof Error) {
                    res.status(400).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: "Failed to get user profile" });
                }
            }
        });
    }
    /**
     * Update the current user's profile
     */
    updateProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                if (!userId) {
                    res.status(401).json({ error: "Unauthorized" });
                    return;
                }
                const { name, country, currency, acceptsCrypto } = req.body;
                // Update user data
                const updatedUser = yield db_1.default.user.update({
                    where: { id: userId },
                    data: {
                        name: name !== undefined ? name : undefined,
                        country: country !== undefined ? country : undefined,
                        currency: currency !== undefined ? currency : undefined,
                        acceptsCrypto: acceptsCrypto !== undefined ? acceptsCrypto : undefined,
                    },
                    include: {
                        wallets: true,
                        paymentMethods: true,
                    },
                });
                // Don't return the password hash
                const { passwordHash } = updatedUser, userWithoutPassword = __rest(updatedUser, ["passwordHash"]);
                res.status(200).json(userWithoutPassword);
            }
            catch (error) {
                console.error("Update profile error:", error);
                if (error instanceof Error) {
                    res.status(400).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: "Failed to update user profile" });
                }
            }
        });
    }
    /**
     * Change the user's password
     */
    changePassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const user = yield db_1.default.user.findUnique({
                    where: { id: userId },
                });
                if (!user) {
                    res.status(404).json({ error: "User not found" });
                    return;
                }
                // Verify current password
                const isPasswordValid = yield bcrypt_1.default.compare(currentPassword, user.passwordHash);
                if (!isPasswordValid) {
                    res.status(401).json({ error: "Current password is incorrect" });
                    return;
                }
                // Hash and save new password
                const newPasswordHash = yield bcrypt_1.default.hash(newPassword, 10);
                yield db_1.default.user.update({
                    where: { id: userId },
                    data: { passwordHash: newPasswordHash },
                });
                res.status(200).json({ message: "Password updated successfully" });
            }
            catch (error) {
                console.error("Change password error:", error);
                if (error instanceof Error) {
                    res.status(400).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: "Failed to change password" });
                }
            }
        });
    }
    /**
     * Add a crypto wallet to the user
     */
    addCryptoWallet(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const existingWallet = yield db_1.default.cryptoWallet.findFirst({
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
                    yield db_1.default.cryptoWallet.updateMany({
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
                    yield db_1.default.user.update({
                        where: { id: userId },
                        data: { acceptsCrypto: true },
                    });
                }
                // Create wallet
                const wallet = yield db_1.default.cryptoWallet.create({
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
     * Get user's crypto wallets
     */
    getCryptoWallets(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                if (!userId) {
                    res.status(401).json({ error: "Unauthorized" });
                    return;
                }
                const wallets = yield db_1.default.cryptoWallet.findMany({
                    where: { userId },
                });
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
     * Get user's payment methods
     */
    getPaymentMethods(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                if (!userId) {
                    res.status(401).json({ error: "Unauthorized" });
                    return;
                }
                const paymentMethods = yield db_1.default.paymentMethod.findMany({
                    where: { userId },
                });
                res.status(200).json(paymentMethods);
            }
            catch (error) {
                console.error("Get payment methods error:", error);
                if (error instanceof Error) {
                    res.status(400).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: "Failed to get payment methods" });
                }
            }
        });
    }
    /**
     * Get user's dashboard summary
     */
    getDashboardSummary(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                if (!userId) {
                    res.status(401).json({ error: "Unauthorized" });
                    return;
                }
                // Get total vendors
                const totalVendors = yield db_1.default.vendor.count({
                    where: { userId },
                });
                // Get vendors accepting crypto
                const vendorsAcceptingCrypto = yield db_1.default.vendor.count({
                    where: {
                        userId,
                        acceptsCrypto: true,
                    },
                });
                // Get total transactions
                const totalTransactions = yield db_1.default.transaction.count({
                    where: { senderId: userId },
                });
                // Get transaction stats
                const transactionStats = yield db_1.default.transaction.groupBy({
                    by: ["type"],
                    where: { senderId: userId },
                    _count: true,
                    _sum: { amount: true },
                });
                // Get total savings
                const totalSavings = yield db_1.default.fXOptimization.aggregate({
                    where: {
                        transaction: { senderId: userId },
                    },
                    _sum: { savingsAmount: true },
                });
                // Get recent transactions
                const recentTransactions = yield db_1.default.transaction.findMany({
                    where: { senderId: userId },
                    take: 5,
                    orderBy: { createdAt: "desc" },
                    include: { recipient: true, paymentMethod: true },
                });
                res.status(200).json({
                    vendors: {
                        total: totalVendors,
                        acceptingCrypto: vendorsAcceptingCrypto,
                        percentage: totalVendors > 0
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
            }
            catch (error) {
                console.error("Dashboard summary error:", error);
                if (error instanceof Error) {
                    res.status(400).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: "Failed to get dashboard summary" });
                }
            }
        });
    }
}
exports.UserController = UserController;
