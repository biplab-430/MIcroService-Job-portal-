import express from "express";
import { isAuth } from "../middleware/auth";
import { deleteNotification, getNotifications, getUnreadNotificationCount } from "../controller/not-con";





const router = express.Router();

// ======================================================
// GET ALL NOTIFICATIONS
// ======================================================

router.get(
  "/",
  isAuth,
  getNotifications
);

// ======================================================
// GET UNREAD NOTIFICATION COUNT
// ======================================================

router.get(
  "/count",
  isAuth,
  getUnreadNotificationCount
);

// ======================================================
// DELETE NOTIFICATION
// ======================================================

router.delete(
  "/:notificationId",
isAuth,
  deleteNotification
);

export default router;