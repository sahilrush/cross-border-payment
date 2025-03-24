import prisma from "../config/db";

interface VendorData {
  name: string;
  email: string;
  country: string;
  currency: string;
  contactName?: string;
  contactPhone?: string;
  website?: string;
  acceptsCrypto?: boolean;
  paymentTerms?: string;
}

interface BankData {
  bankName: string;
  accountNumber: string;
  accountName: string;
  swiftCode?: string;
  routingNumber?: string;
  iban?: string;
  currency: string;
}

interface WalletData {
  address: string;
  network: string;
  type: string;
  label?: string;
}

export class VendorService {
  async createVendor(userId: string, vendorData: VendorData) {
    return prisma.vendor.create({
      data: {
        ...vendorData,
        user: { connect: { id: userId } },
      },
    });
  }
  async getVendor(userId: string) {
    return prisma.vendor.findMany({
      where: { userId },
      include: {
        bankAccounts: true,
        wallets: true,
      },
    });
  }

  async addBankAccount(vendorId: string, bankData: BankData) {
    return prisma.bankAccount.create({
      data: {
        ...bankData,
        vendor: { connect: { id: vendorId } },
      },
    });
  }

  async addCryptoWallet(vendorId: string, walletData: WalletData) {
    await prisma.vendor.update({
      where: { id: vendorId },
      data: { acceptsCrypto: true },
    });
    return prisma.cryptoWallet.create({
      data: {
        ...walletData,
        vendor: { connect: { id: vendorId } },
      },
    });
  }
}
