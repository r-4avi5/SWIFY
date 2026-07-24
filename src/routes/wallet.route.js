import express from "express";
import {authenticateUser} from "../middleware/auth.middleware.js";
import {getWallet} from "../controllers/wallet.controller.js";

const router = express.Router();

router.get("/", authenticateUser, getWallet);

export default router;