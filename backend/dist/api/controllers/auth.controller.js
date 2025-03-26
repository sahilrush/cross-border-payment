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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../../services/auth-service");
class AuthController {
    constructor() {
        this.authService = new auth_service_1.AuthService();
    }
    /**
     * Register a new user
     */
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userData = req.body;
                // Basic validation
                if (!userData.email || !userData.password || !userData.name) {
                    res
                        .status(400)
                        .json({ error: "Name, email and password are required" });
                    return;
                }
                const result = yield this.authService.register(userData);
                res.status(201).json(result);
            }
            catch (error) {
                console.error("Registration error:", error);
                if (error instanceof Error) {
                    res.status(400).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: "Failed to register user" });
                }
            }
        });
    }
    /**
     * Login user
     */
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const loginData = req.body;
                // Basic validation
                if (!loginData.email || !loginData.password) {
                    res.status(400).json({ error: "Email and password are required" });
                    return;
                }
                const result = yield this.authService.login(loginData);
                res.status(200).json(result);
            }
            catch (error) {
                console.error("Login error:", error);
                if (error instanceof Error) {
                    res.status(401).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: "Failed to authenticate user" });
                }
            }
        });
    }
    /**
     * Get the current user profile (requires auth)
     */
    getCurrentUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // User should be attached by auth middleware
                const user = req.user;
                if (!user) {
                    res.status(401).json({ error: "Unauthorized" });
                    return;
                }
                // Don't send the password hash
                const { passwordHash } = user, userWithoutPassword = __rest(user, ["passwordHash"]);
                res.status(200).json(userWithoutPassword);
            }
            catch (error) {
                console.error("Get current user error:", error);
                if (error instanceof Error) {
                    res.status(400).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: "Failed to get user profile" });
                }
            }
        });
    }
}
exports.AuthController = AuthController;
