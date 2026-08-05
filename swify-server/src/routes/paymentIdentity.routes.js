import express from "express";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { resolvePaymentUser } from "../controllers/paymentIdentity.controller.js";

const router = express.Router();

router.post("/resolve", authenticateUser, resolvePaymentUser);

export default router;