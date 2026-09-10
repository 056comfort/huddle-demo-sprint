import { Router } from "express";
import {
  sendMessage,
  getMessages,
} from "../controllers/messageController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.use(protect);

router.post("/:id/messages", sendMessage);
router.get("/:id/messages", getMessages);

export default router;