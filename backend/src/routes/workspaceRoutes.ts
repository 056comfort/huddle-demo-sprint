import { Router } from "express";
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  getWorkspaceMembers,
  inviteWorkspaceMember,
  acceptWorkspaceInvite,
  removeWorkspaceMember,
  getAvailableWorkspaces,
  joinWorkspace,
} from "../controllers/workspaceController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.use(protect);

// Workspace invitations — keep before /:id
router.post("/invites/:token/accept", acceptWorkspaceInvite);

// Workspace
router.post("/", createWorkspace);
router.get("/", getWorkspaces);
router.get("/available", getAvailableWorkspaces);
router.post("/:id/join", joinWorkspace);
router.get("/:id", getWorkspaceById);

// Members
router.get("/:id/members", getWorkspaceMembers);
router.post("/:id/invites", inviteWorkspaceMember);
router.delete("/:id/members/:userId", removeWorkspaceMember);

export default router;