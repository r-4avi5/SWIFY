import express from "express";
import { authenticateUser } from "../middleware/auth.middleware.js";
import {submitKYC,getKycStatus} from "../controllers/kyc.controller.js"

const router = express.Router();

router.post(
    "/submit",authenticateUser,submitKYC
);
router.get(
    "/status",authenticateUser,getKycStatus
);
export default router;