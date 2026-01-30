import express from "express";
import auth from "../middlewares/auth.js";
import {
  listNotifications,
  markNotificationRead,
} from "../controllers/notificationsController.js";

const router = express.Router();

router.get("/", auth, listNotifications);
router.patch("/:id/read", auth, markNotificationRead);

export default router;
