import { Router } from "express";
import {
  createConversation,
  getConversations,
  getConversationById,
  markConversationAsRead,
} from "../controllers/conversationController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.use(protect);

router.post("/", createConversation);
router.get("/", getConversations);
router.get("/:id", getConversationById);
router.post("/:id/read", markConversationAsRead);

export default router;