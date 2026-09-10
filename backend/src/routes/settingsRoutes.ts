import { Router } from "express";
import {
  getSettings,
  updateSettings,
} from "../controllers/settingsController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.use(protect);

router.get("/", getSettings);
router.patch("/", updateSettings);

export default router;