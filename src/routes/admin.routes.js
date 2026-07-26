import express from "express";
import {approveKYC} from "../controllers/admin.controller.js";


const router = express.Router();

router.patch(
    "/kyc/:userId/review",reviewKYC
);

export default router;