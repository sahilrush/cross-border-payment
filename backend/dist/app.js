"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const vendor_rotues_1 = __importDefault(require("./routes/vendor.rotues"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const error_middleware_1 = require("./api/middlewares/error.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
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
exports.default = app;
