import { Router } from "express";

import {
  createChannel,
  getChannels,
  getChannelById,
  getChannelByName,
  updateChannel,
  deleteChannel,
} from "../controllers/channelController";

import { protect } from "../middleware/authMiddleware";

const router = Router();

router.use(protect);

router.post("/", createChannel);

router.get("/", getChannels);

// Must be before /:channelId to avoid "by-name" being treated as an ID
router.get("/by-name/:name", getChannelByName);

router.get("/:channelId", getChannelById);

router.patch("/:channelId", updateChannel);

router.delete("/:channelId", deleteChannel);

export default router;