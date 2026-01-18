import { Router } from 'express';
import AuthController from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password/:token', AuthController.resetPassword);
router.post('/login', AuthController.login);

// Protected routes
router.get('/profile', auth, AuthController.getProfile); 

export default router;
