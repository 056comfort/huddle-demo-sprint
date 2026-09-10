import { Router } from "express";
import {
  getUsers,
  getUserById,
} from "../controllers/userController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.get("/", protect, getUsers);
router.get("/:id", protect, getUserById);

export default router;