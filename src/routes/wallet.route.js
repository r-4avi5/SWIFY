import express from "express";
import {authenticateUser} from "../middleware/auth.middleware.js";
import {getWallet,getWalletBalance} from "../controllers/wallet.controller.js";

const router = express.Router();

router.get("/", authenticateUser, getWallet);
router.get("/balance",authenticateUser,getWalletBalance);

export default router;