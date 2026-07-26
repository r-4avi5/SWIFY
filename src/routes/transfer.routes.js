import express from "express";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { transferMoney, transferByQR } from "../controllers/transfer.controller.js";

const router = express.Router();

router.post("/",authenticateUser,transferMoney);
router.post("/qr",authenticateUser,transferByQR);
router.post("/scan",authenticateUser,scanQR);

export default router;