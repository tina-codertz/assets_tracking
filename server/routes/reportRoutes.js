import { Router } from "express";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";
import ReportController from "../controllers/reportController.js";

const router = Router();

router.get("/admin/summary", auth, role("admin"), ReportController.adminSummary);
router.get("/weekly-returns", auth, role("admin", "manager"), ReportController.weeklyReturns);
router.get("/monthly-returns", auth, role("admin", "manager"), ReportController.monthlyReturns);
router.get("/defaulters", auth, role("admin", "manager"), ReportController.defaulters);
router.get("/pnl", auth, role("admin", "manager"), ReportController.pnl);

export default router;

