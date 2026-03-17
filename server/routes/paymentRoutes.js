import { Router } from "express";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";
import PaymentController from "../controllers/paymentController.js";

const router = Router();

router.post("/", auth, role("agent", "admin"), PaymentController.create);
router.get("/contract/:contractId", auth, PaymentController.listByContract);

export default router;

