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
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../config/db"));
class AuthService {
    register(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield db_1.default.user.findUnique({
                where: { email: userData.email },
            });
            if (existingUser) {
                throw new Error("User with this email already exists");
            }
            const passwordHash = yield bcrypt_1.default.hash(userData.password, 10);
            // Create user
            const user = yield db_1.default.user.create({
                data: {
                    name: userData.name,
                    email: userData.email,
                    passwordHash,
                    country: userData.country,
                    currency: userData.currency,
                },
            });
            const token = this.generateToken(user.id);
            return {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    country: user.country,
                    currency: user.currency,
                    acceptsCrypto: user.acceptsCrypto,
                },
                token,
            };
        });
    }
    login(loginData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Find user
            const user = yield db_1.default.user.findUnique({
                where: { email: loginData.email },
            });
            if (!user) {
                throw new Error("Invalid credentials");
            }
            // Verify password
            const isPasswordValid = yield bcrypt_1.default.compare(loginData.password, user.passwordHash);
            if (!isPasswordValid) {
                throw new Error("Invalid credentials");
            }
            const token = this.generateToken(user.id);
            return {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    country: user.country,
                    currency: user.currency,
                    acceptsCrypto: user.acceptsCrypto,
                },
                token,
            };
        });
    }
    generateToken(userId) {
        return jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET || "nafjan");
    }
}
exports.AuthService = AuthService;
