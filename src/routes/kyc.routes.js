import express from "express";
import { authenticateUser } from "../middleware/auth.middleware.js";
import {submitKYC} from "../controllers/kyc.controller.js"

const router = express.Router();

router.post(
    "/submit",authenticateUser,submitKYC
);

export default router;