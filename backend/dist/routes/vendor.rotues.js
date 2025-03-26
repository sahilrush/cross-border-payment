"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../api/middlewares/auth.middleware");
const vendor_controller_1 = require("../api/controllers/vendor.controller");
const router = (0, express_1.Router)();
const vendorController = new vendor_controller_1.VendorController();
// Vendor CRUD operations
router.post("/", auth_middleware_1.authMiddleware, (req, res) => vendorController.createVendor(req, res));
router.get("/", auth_middleware_1.authMiddleware, (req, res) => vendorController.getVendors(req, res));
router.get("/crypto", auth_middleware_1.authMiddleware, (req, res) => vendorController.getVendorsAcceptingCrypto(req, res));
router.get("/:id", auth_middleware_1.authMiddleware, (req, res) => vendorController.getVendor(req, res));
router.put("/:id", auth_middleware_1.authMiddleware, (req, res) => vendorController.updateVendor(req, res));
router.delete("/:id", auth_middleware_1.authMiddleware, (req, res) => vendorController.deleteVendor(req, res));
// Bank account management
router.post("/:id/bank-accounts", auth_middleware_1.authMiddleware, (req, res) => vendorController.addBankAccount(req, res));
router.get("/:id/bank-accounts", auth_middleware_1.authMiddleware, (req, res) => vendorController.getBankAccounts(req, res));
// Crypto wallet management
router.post("/:id/wallets", auth_middleware_1.authMiddleware, (req, res) => vendorController.addCryptoWallet(req, res));
router.get("/:id/wallets", auth_middleware_1.authMiddleware, (req, res) => vendorController.getCryptoWallets(req, res));
// Payment history
router.get("/:id/payments", auth_middleware_1.authMiddleware, (req, res) => vendorController.getVendorPaymentHistory(req, res));
exports.default = router;
