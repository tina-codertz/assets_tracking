import { Router } from 'express';
import UserController from '../controllers/userController.js';
import auth from '../middleware/auth.js';
import role from '../middleware/role.js';

const router = Router();

// Protected route - admin only
router.get('/', auth, role('admin'), UserController.getAllUsers);

export default router;
