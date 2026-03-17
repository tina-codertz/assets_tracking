import { Router } from "express";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";
import ContractController from "../controllers/contractController.js";

const router = Router();

// Agents create contracts, all roles can list with their own scope
router.get("/", auth, ContractController.list);
router.post("/", auth, role("agent"), ContractController.create);

export default router;

