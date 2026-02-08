import express from "express";
import auth from "../middlewares/auth.js";
import {
  listNotifications,
  getUnreadCount,
  markNotificationRead,
  deleteNotification,
} from "../controllers/notificationsController.js";

const router = express.Router();

router.get("/", auth, listNotifications);
router.get("/unread-count", auth, getUnreadCount);
router.patch("/:id/read", auth, markNotificationRead);
router.delete("/:id", auth, deleteNotification);

export default router;
