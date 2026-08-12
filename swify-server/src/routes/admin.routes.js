import express from "express";
import { reviewKYC } from "../controllers/admin.controller.js";
import { authenticateUser, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.patch(
    "/kyc/:userId/review", authenticateUser, requireAdmin, reviewKYC
);

export default router;