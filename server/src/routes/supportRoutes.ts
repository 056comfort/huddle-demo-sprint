import { Router } from "express";

import {
  createSupportTicket,
  getSupportTickets,
  getSupportTicketById,
  updateSupportTicket,
  deleteSupportTicket,
} from "../controllers/supportController";

import { protect } from "../middleware/authMiddleware";

const router = Router();

router.use(protect);

router.post("/", createSupportTicket);

router.get("/", getSupportTickets);

router.get("/:id", getSupportTicketById);

router.patch("/:id", updateSupportTicket);

router.delete("/:id", deleteSupportTicket);

export default router;