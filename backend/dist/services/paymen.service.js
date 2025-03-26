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
exports.PaymenApiService = void 0;
const axios_1 = __importDefault(require("axios"));
class PaymenApiService {
    constructor() {
        this.apiKey = process.env.PAYMAN_API_KEY || "";
        this.baseUrl = process.env.PAYMAN_BASE_URL || "https://api.payman.com/v1";
        this.client = axios_1.default.create({
            baseURL: this.baseUrl,
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                "Content-Type": "application/json",
            },
        });
        // Response interceptor for error handling
        this.client.interceptors.response.use((response) => response, (error) => {
            var _a, _b, _c;
            console.error("Payman API Error", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            throw new Error(((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) || "Error communicating with Payman API");
        });
    }
    //check if a recipient is registered with paymen and accepts crypto
    checkRecipientStatus(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield this.client.get(`/recipients/check?email=${email}`);
                return res.data;
            }
            catch (error) {
                if (axios_1.default.isAxiosError(error) && error.code === "ECONNREFUSED") {
                    console.warn("Payman API unavailable, returning mock data");
                    return {
                        email,
                        registered: false,
                        acceptsCrypto: false,
                    };
                }
                throw error;
            }
        });
    }
    getExchangeRates(fromCurrency, toCurrency) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield this.client.get(`/exchange-rates?from=${fromCurrency}&to=${toCurrency}`);
                return res.data;
            }
            catch (error) {
                if (axios_1.default.isAxiosError(error) && error.code === "ECONNREFUSED") {
                    console.warn("Payman API unavailable, returning mock data");
                    return {
                        fromCurrency,
                        toCurrency,
                        rates: {
                            SWIFT: 1.0,
                            USDC: 1.0,
                        },
                        fees: {
                            SWIFT: fromCurrency === "USD" ? 10 : 20,
                            USDC: 0,
                        },
                    };
                }
                throw error;
            }
        });
    }
    //creating a new payment
    createPayment(paymentData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield this.client.post("/payments", paymentData);
                return res.data;
            }
            catch (error) {
                if (axios_1.default.isAxiosError(error) && error.code === "ECONNREFUSED") {
                    console.warn("Payman API unavailable, returning mock data");
                    const mockPayment = {
                        id: "mock-" + Date.now(),
                        amount: paymentData.amount,
                        currency: paymentData.currency,
                        recipientEmail: paymentData.recipientEmail,
                        paymentMethod: paymentData.paymentMethod,
                        status: "processing",
                        exchangeRate: paymentData.paymentMethod === "USDC" ? 1.01 : 1.05,
                        fee: paymentData.paymentMethod === "USDC"
                            ? Math.max(5, paymentData.amount * 0.01)
                            : Math.max(25, paymentData.amount * 0.05),
                        savings: paymentData.paymentMethod === "USDC"
                            ? {
                                amount: Math.max(20, paymentData.amount * 0.04),
                                percentage: 4,
                            }
                            : undefined,
                        createdAt: new Date().toISOString(),
                        paymentLink: "https://payman.com/pay/mock-" + Date.now(),
                    };
                    return mockPayment;
                }
                throw error;
            }
        });
    }
    //invite a recipant to join payman
    inviteRecipient(recipientData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.post("/recipients/invite", recipientData);
                return response.data;
            }
            catch (error) {
                // If service is unavailable, return mock success
                if (axios_1.default.isAxiosError(error) && error.code === "ECONNREFUSED") {
                    console.warn("Payman API unavailable, returning mock data");
                    return {
                        success: true,
                        inviteId: "mock-invite-" + Date.now(),
                    };
                }
                throw error;
            }
        });
    }
    //get payment status
    getPaymentStatus(paymentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield this.client.get(`/payments/${paymentId}`);
                return res.data;
            }
            catch (error) {
                if (axios_1.default.isAxiosError(error) && error.code === "ENCONNREFUSED") {
                    console.warn("Payman API unavailable, returning mock data");
                    const statuses = ["processing", "completed", "failed"];
                    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
                    return {
                        id: paymentId,
                        amount: 100, // Mock amount
                        currency: "USD",
                        recipientEmail: "recipient@example.com",
                        paymentMethod: "USDC",
                        status: randomStatus,
                        exchangeRate: 1.01,
                        fee: 5,
                        createdAt: new Date().toISOString(),
                        completedAt: randomStatus === "completed" ? new Date().toISOString() : undefined,
                    };
                }
                throw error;
            }
        });
    }
}
exports.PaymenApiService = PaymenApiService;
