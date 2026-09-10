import { Router } from "express";
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
} from "../controllers/workspaceController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.use(protect);

router.post("/", createWorkspace);
router.get("/", getWorkspaces);
router.get("/:id", getWorkspaceById);

export default router;