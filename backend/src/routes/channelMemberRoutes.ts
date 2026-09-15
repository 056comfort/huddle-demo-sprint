import { Router } from "express";

import {
  joinChannel,
  leaveChannel,
  getChannelMembers,
  addChannelMember,
} from "../controllers/channelMemberController";

import { protect } from "../middleware/authMiddleware";

const router = Router();

router.use(protect);

router.post("/:channelId/members", joinChannel);

router.post("/:channelId/members/add", addChannelMember);

router.delete("/:channelId/members/me", leaveChannel);

router.get("/:channelId/members", getChannelMembers);

export default router;