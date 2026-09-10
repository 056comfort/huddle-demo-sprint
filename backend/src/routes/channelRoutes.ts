import { Router } from "express";

import {
  createChannel,
  getChannels,
  getChannelById,
  updateChannel,
  deleteChannel,
} from "../controllers/channelController";

import { protect } from "../middleware/authMiddleware";

const router = Router();

router.use(protect);

router.post("/", createChannel);

router.get("/", getChannels);

router.get("/:channelId", getChannelById);

router.patch("/:channelId", updateChannel);

router.delete("/:channelId", deleteChannel);

export default router;