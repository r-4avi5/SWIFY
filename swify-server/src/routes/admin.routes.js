import express from "express";
import { reviewKYC, listPendingKYC, getKYCDetail } from "../controllers/admin.controller.js";
import { authenticateUser, requireAdmin } from "../middleware/auth.middleware.js";
 
const router = express.Router();
 
router.get(
    "/kyc/pending", authenticateUser, requireAdmin, listPendingKYC
);
 
router.get(
    "/kyc/:userId", authenticateUser, requireAdmin, getKYCDetail
);
 
router.patch(
    "/kyc/:userId/review", authenticateUser, requireAdmin, reviewKYC
);
 
export default router;