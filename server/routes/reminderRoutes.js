import { Router } from "express";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";
import ReminderController from "../controllers/reminderController.js";

const router = Router();

// Admin-only endpoint to trigger reminder run (for cron or manual)
router.get("/run", auth, role("admin"), ReminderController.run);

export default router;

