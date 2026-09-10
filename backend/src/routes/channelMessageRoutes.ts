import { Router } from "express";

import {
  sendChannelMessage,
  getChannelMessages,
  editChannelMessage,
  deleteChannelMessage,
} from "../controllers/channelMessageController";

import { protect } from "../middleware/authMiddleware";

const router = Router();

router.use(protect);

router.post("/:channelId/messages", sendChannelMessage);

router.get("/:channelId/messages", getChannelMessages);

router.patch(
  "/:channelId/messages/:messageId",
  editChannelMessage
);

router.delete(
  "/:channelId/messages/:messageId",
  deleteChannelMessage
);

export default router;