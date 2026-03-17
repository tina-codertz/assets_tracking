import { Router } from "express";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";
import AssetController from "../controllers/assetController.js";

const router = Router();

// Admin can manage assets, other roles can only view list
router.get("/", auth, AssetController.list);
router.post("/", auth, role("admin"), AssetController.create);
router.put("/:id", auth, role("admin"), AssetController.update);
router.delete("/:id", auth, role("admin"), AssetController.remove);

export default router;

