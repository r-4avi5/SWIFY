import express, { Router } from "express";
import { authenticateUser } from "../middleware/auth.middleware.js";
import {getTransactionHistory} from "../controllers/transaction.controller.js"

const router = express.Router();

router.get(
    "/",authenticateUser,getTransactionHistory
);

router.get(
    "/:reference",authenticateUser,getTransactionByReference
);

export default User;