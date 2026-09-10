import { Router } from "express";
import {
  getChannelSettings,
  updateChannelSettings,
} from "../controllers/channelSettingsController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.use(protect);

router.get("/:channelId/settings", getChannelSettings);
router.patch("/:channelId/settings", updateChannelSettings);

export default router;