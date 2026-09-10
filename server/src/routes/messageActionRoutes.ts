import { Router } from "express";
import {
  editMessage,
  deleteMessage,
} from "../controllers/messageController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.use(protect);

router.patch("/:messageId", editMessage);
router.delete("/:messageId", deleteMessage);

export default router;