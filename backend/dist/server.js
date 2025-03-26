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
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./config/db"));
const PORT = process.env.PORT || 3000;
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Connect to the database
            yield db_1.default.$connect();
            console.log("Connected to database successfully");
            // Start the server
            app_1.default.listen(PORT, () => {
                console.log(`✅ Server running at http://localhost:${PORT}`);
                console.log(`Health check available at http://localhost:${PORT}/health`);
            });
        }
        catch (error) {
            console.error("Failed to start server:", error);
            yield db_1.default.$disconnect();
            process.exit(1);
        }
    });
}
// Handle graceful shutdown
process.on("SIGINT", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("SIGINT received. Shutting down gracefully");
    yield db_1.default.$disconnect();
    process.exit(0);
}));
process.on("SIGTERM", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("SIGTERM received. Shutting down gracefully");
    yield db_1.default.$disconnect();
    process.exit(0);
}));
// Start the server
startServer();
