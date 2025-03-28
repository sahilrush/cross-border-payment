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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const vendor_rotues_1 = __importDefault(require("./routes/vendor.rotues"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const error_middleware_1 = require("./api/middlewares/error.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/auth", auth_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/vendors", vendor_rotues_1.default);
app.use("/api/payments", payment_routes_1.default);
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        version: "1.0.0",
        timestamp: new Date(),
    });
});
app.use(error_middleware_1.errorMiddleware);
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield db_1.default.$connect();
            console.log("✅ Connected to database successfully");
            app.listen(PORT, () => {
                console.log(`✅ Server running at http://localhost:${PORT}`);
                console.log(`Health check available at http://localhost:${PORT}/health`);
            });
        }
        catch (error) {
            console.error("❌ Failed to start server:", error);
            yield db_1.default.$disconnect();
            process.exit(1);
        }
    });
}
process.on("SIGINT", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("🛑 SIGINT received. Shutting down gracefully...");
    yield db_1.default.$disconnect();
    process.exit(0);
}));
process.on("SIGTERM", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("🛑 SIGTERM received. Shutting down gracefully...");
    yield db_1.default.$disconnect();
    process.exit(0);
}));
startServer();
