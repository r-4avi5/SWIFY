import express from "express";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { createMpin,verifyMpin,changeMpin } from "../controllers/mpin.controller.js";

const router = express.Router();

router.post("/create",authenticateUser,createMpin);
router.post("/verify",authenticateUser,verifyMpin);
router.patch("/change",authenticateUser,changeMpin);

export default router;