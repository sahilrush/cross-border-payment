import { PaymentType, TransactionStatus, VendorStatus } from "@prisma/client";

// Auth types
export interface RegisterUserDto {
  name: string;
  email: string;
  password: string;
  country: string;
  currency: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    country: string;
    currency: string;
    acceptsCrypto: boolean;
  };
  token: string;
}

// Vendor types
export interface CreateVendorDto {
  name: string;
  email: string;
  country: string;
  currency: string;
  contactName?: string;
  contactPhone?: string;
  website?: string;
  acceptsCrypto?: boolean;
  paymentTerms?: string;
  notes?: string;
}

export interface UpdateVendorDto {
  name?: string;
  email?: string;
  country?: string;
  currency?: string;
  contactName?: string;
  contactPhone?: string;
  website?: string;
  acceptsCrypto?: boolean;
  paymentTerms?: string;
  notes?: string;
  status?: VendorStatus;
}

// Bank account types
export interface CreateBankAccountDto {
  bankName: string;
  accountNumber: string;
  accountName: string;
  swiftCode?: string;
  routingNumber?: string;
  iban?: string;
  currency: string;
  isDefault?: boolean;
}

// Crypto wallet types
export interface CreateWalletDto {
  address: string;
  network: string;
  type: string;
  label?: string;
  isDefault?: boolean;
}

// Payment types
export interface CreatePaymentDto {
  vendorId: string;
  amount: number;
  currency: string;
  paymentMethod?: PaymentType;
  description?: string;
  invoiceNumber?: string;
}

export interface PaymentResponse {
  transaction: {
    id: string;
    amount: number;
    currency: string;
    status: TransactionStatus;
    type: PaymentType;
    createdAt: Date;
  };
  paymanPaymentId: string;
  status: string;
  paymentLink?: string;
}

// AI Recommendation types
export interface PaymentOption {
  method: PaymentType;
  type: string;
  estimatedFee: number;
  estimatedTime: string;
  exchangeRate?: number;
  totalCost: number;
}

export interface AIRecommendation {
  recipient: {
    acceptsCrypto: boolean;
    needsPaymanAccount: boolean;
  };
  options: PaymentOption[];
  bestOption: PaymentOption;
  potentialSavings: {
    amount: number;
    percentage: number;
  };
  aiRecommendation: string;
}

// Payman API response types
export interface PaymanRecipientStatus {
  email: string;
  registered: boolean;
  acceptsCrypto: boolean;
  wallets?: {
    type: string;
    address: string;
  }[];
}

export interface PaymanExchangeRates {
  fromCurrency: string;
  toCurrency: string;
  rates: {
    SWIFT: number;
    USDC: number;
    ACH?: number;
    WIRE?: number;
    SEPA?: number;
  };
  fees: {
    SWIFT: number;
    USDC: number;
    ACH?: number;
    WIRE?: number;
    SEPA?: number;
  };
}

export interface PaymanPayment {
  id: string;
  amount: number;
  currency: string;
  recipientEmail: string;
  paymentMethod: string;
  status: string;
  exchangeRate: number;
  fee: number;
  savings?: {
    amount: number;
    percentage: number;
  };
  createdAt: string;
  completedAt?: string;
  paymentLink?: string;
}
