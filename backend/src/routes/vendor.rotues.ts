import { Router } from "express";
import { authMiddleware } from "../api/middlewares/auth.middleware";
import { VendorController } from "../api/controllers/vendor.controller";

const router = Router();
const vendorController = new VendorController();

// Vendor CRUD operations
router.post("/", authMiddleware, (req, res) =>
  vendorController.createVendor(req, res)
);
router.get("/", authMiddleware, (req, res) =>
  vendorController.getVendors(req, res)
);
router.get("/crypto", authMiddleware, (req, res) =>
  vendorController.getVendorsAcceptingCrypto(req, res)
);
router.get("/:id", authMiddleware, (req, res) =>
  vendorController.getVendor(req, res)
);
router.put("/:id", authMiddleware, (req, res) =>
  vendorController.updateVendor(req, res)
);
router.delete("/:id", authMiddleware, (req, res) =>
  vendorController.deleteVendor(req, res)
);

// Bank account management
router.post("/:id/bank-accounts", authMiddleware, (req, res) =>
  vendorController.addBankAccount(req, res)
);
router.get("/:id/bank-accounts", authMiddleware, (req, res) =>
  vendorController.getBankAccounts(req, res)
);

// Crypto wallet management
router.post("/:id/wallets", authMiddleware, (req, res) =>
  vendorController.addCryptoWallet(req, res)
);
router.get("/:id/wallets", authMiddleware, (req, res) =>
  vendorController.getCryptoWallets(req, res)
);

// Payment history
router.get("/:id/payments", authMiddleware, (req, res) =>
  vendorController.getVendorPaymentHistory(req, res)
);

export default router;
