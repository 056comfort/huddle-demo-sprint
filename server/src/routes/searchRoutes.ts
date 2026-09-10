import { Router } from "express";
import { search } from "../controllers/searchController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.use(protect);

router.get("/", search);

export default router;