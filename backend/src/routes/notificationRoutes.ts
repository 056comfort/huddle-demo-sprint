import { Router } from "express";

import {
  getNotifications,
  getChannelNotifications,
  updateChannelNotificationSettings,
} from "../controllers/notificationController";

import { protect } from "../middleware/authMiddleware";

const router = Router();

router.use(protect);

router.get("/", getNotifications);

export default router;