import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import walletRoutes from "./routes/wallet.route.js";
import paymentIdentityRoutes from "./routes/paymentIdentity.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use("/health", healthRoutes);
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/payment-identity", paymentIdentityRoutes);
app.use("/api/transactions",transactionRoutes);


export default app;