import { Router } from "express";

import {
  joinChannel,
  leaveChannel,
  getChannelMembers,
} from "../controllers/channelMemberController";

import { protect } from "../middleware/authMiddleware";

const router = Router();

router.use(protect);

router.post("/:channelId/members", joinChannel);

router.delete("/:channelId/members/me", leaveChannel);

router.get("/:channelId/members", getChannelMembers);

export default router;