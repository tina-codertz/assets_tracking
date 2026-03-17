import { Router } from "express";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";
import CustomerController from "../controllers/customerController.js";

const router = Router();

// Agents create customers, managers/admins can also view list
router.get("/", auth, CustomerController.list);
router.post("/", auth, role("agent", "admin", "manager"), CustomerController.create);

export default router;

