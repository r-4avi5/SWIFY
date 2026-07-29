import express from "express";
import { authenticateUser } from "../middleware/auth.middleware.js";
import {getNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationAsRead,
    deleteNotification} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/",authenticateUser,getNotifications);
router.get("/unread-count",authenticateUser,getUnreadNotificationCount);
router.patch("/:id/read",authenticateUser,markNotificationAsRead);
router.patch("/read-all",authenticateUser,markAllNotificationAsRead);
router.delete("/:id",authenticateUser,deleteNotification);

export default router;