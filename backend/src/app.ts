import express from "express";
import dotenv from "dotenv";

import cors from "cors";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import vendorRoutes from "./routes/vendor.rotues";
import paymentRoutes from "./routes/payment.routes";
import { errorMiddleware } from "./api/middlewares/error.middleware";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    version: "1.0.0",
    timestamp: new Date(),
  });
});

app.use(errorMiddleware);

export default app;
