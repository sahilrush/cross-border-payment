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
exports.AIAdvisorService = void 0;
const openai_1 = require("openai");
const db_1 = __importDefault(require("../config/db"));
const paymen_service_1 = require("./paymen.service");
class AIAdvisorService {
    constructor() {
        this.openai = new openai_1.OpenAI({
            apiKey: process.env.OPEN_API_KEY,
        });
        this.paymanApi = new paymen_service_1.PaymenApiService();
    }
    analyzePayment(userId, vendorId, amount, currency) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get vendor details
            const vendor = yield db_1.default.vendor.findFirst({
                where: {
                    id: vendorId,
                    userId, // Ensure the vendor belongs to this user
                },
                include: {
                    wallets: true,
                    bankAccounts: true,
                },
            });
            if (!vendor) {
                throw new Error(" vendor not found");
            }
            //checking with paymen api if the vendor is registered and accepts crypto
            const recipientStatus = yield this.paymanApi.checkRecipientStatus(vendor.email);
            //get exchange rates from the payman api
            const exchangeRates = yield this.paymanApi.getExchangeRates(currency, vendor.currency);
            //generate payment options
            const options = [];
            //tranditional bank transfer option - always avaiable
            options.push({
                method: "SWIFT",
                type: "BANK",
                estimatedFee: exchangeRates.fees.SWIFT,
                estimatedTime: "2-5 business days",
                exchangeRate: exchangeRates.rates.SWIFT,
                totalCost: amount * exchangeRates.rates.SWIFT + exchangeRates.fees.SWIFT,
            });
            //wire transfer if avaible
            if (exchangeRates.rates.WIRE && exchangeRates.fees.WIRE) {
                options.push({
                    method: "WIRE",
                    type: "BANK",
                    estimatedFee: exchangeRates.fees.WIRE,
                    estimatedTime: "1-3 buisness days",
                    exchangeRate: exchangeRates.rates.WIRE,
                    totalCost: amount * exchangeRates.rates.WIRE + exchangeRates.fees.WIRE,
                });
            }
            //USD option if vendor accepts crypto
            if (recipientStatus.acceptsCrypto || vendor.acceptsCrypto) {
                options.push({
                    method: "USDC",
                    type: "CRYPTO",
                    estimatedFee: exchangeRates.fees.USDC,
                    estimatedTime: "Instant",
                    exchangeRate: exchangeRates.rates.USDC,
                    totalCost: amount * exchangeRates.rates.USDC + exchangeRates.fees.USDC,
                });
            }
            //sort options by total cost(lowest first)
            options.sort((a, b) => a.totalCost - b.totalCost);
            //generate Ai recommendation
            const aiRecommendation = yield this.generateRecommendation(vendor, amount, currency, options, recipientStatus);
            const potentialSavings = yield this.calculateSaving(options);
            //record this ai interection for future training
            yield db_1.default.aIInteraction.create({
                data: {
                    userId,
                    query: JSON.stringify({
                        vendorId,
                        vendorName: vendor.name,
                        amount,
                        currency,
                    }),
                    response: JSON.stringify({
                        options,
                        bestOption: options[0],
                        potentialSavings,
                        recommendation: aiRecommendation,
                    }),
                },
            });
            return {
                recipient: {
                    acceptsCrypto: recipientStatus.acceptsCrypto || vendor.acceptsCrypto,
                    needsPaymanAccount: !recipientStatus.registered && options[0].method === "USDC",
                },
                options,
                bestOption: options[0],
                potentialSavings,
                aiRecommendation,
            };
        });
    }
    generateRecommendation(vendor, amount, currency, options, recipientStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const prompt = `
      I need a concise recommendation for a cross-border payment:


      Payment amount: ${amount} ${currency}
      Recipient: ${vendor.name} in ${vendor.country}
      Recipient currency: ${vendor.currency}
      Recipient accepts crypto: ${recipientStatus.acceptsCrypto || vendor.acceptsCrypto ? "Yes" : "No"}
      Recipient has Paymen account: ${recipientStatus.registered ? "Yes" : "No"}

        Payment options:
        ${options
                    .map((opt) => `- ${opt.method}: Fee ${opt.estimatedFee} ${currency}, Exchange rates ${opt.exchangeRate}, Settlement time ${opt.estimatedTime}, Total cost ${opt.totalCost.toFixed(2)} ${currency}`)
                    .join(`\n`)}



      Provide a brief, buisness-focused recommendation (under 100 words) that highlights :
        1. The most cost-effective method
        2. Time savings
        3. Any actions needed (like inviting the recipient to Payman)
        4. Quantified savings compared to the most expensive option

      `;
                const res = yield this.openai.chat.completions.create({
                    model: "gpt-4-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "You are a financial advisor specializing in international payments and FX optimization",
                        },
                        {
                            role: "user",
                            content: prompt,
                        },
                    ],
                    max_tokens: 150,
                    temperature: 0.7,
                });
                return (res.choices[0].message.content ||
                    `Recommend using ${options[0].method} for this payment to save ${(yield this.calculateSaving(options)).percentage.toFixed(1)}% compared to traditional methods.`);
            }
            catch (error) {
                console.error("Error generating AI recommendation:", error);
                // Fallback recommendation if AI fails
                return `Recommend using ${options[0].method} which is the most cost-effective option for this payment.`;
            }
        });
    }
    calculateSaving(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (options.length < 2) {
                return { amount: 0, percentage: 0 };
            }
            //sort by total cost (just to be sure )
            const sortedOptions = [...options].sort((a, b) => a.totalCost - b.totalCost);
            const cheapestOption = sortedOptions[0];
            const mostExpensiveOption = sortedOptions[sortedOptions.length - 1];
            const savingAmount = mostExpensiveOption.totalCost - cheapestOption.totalCost;
            const savingsPercentage = (savingAmount / mostExpensiveOption.totalCost) * 100;
            return {
                amount: savingAmount,
                percentage: savingsPercentage,
            };
        });
    }
}
exports.AIAdvisorService = AIAdvisorService;
