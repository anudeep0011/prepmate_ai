import express from 'express';
import { authUser, registerUser, googleLogin } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', authUser);
router.post('/signup', registerUser);
router.post('/google', googleLogin);

export default router;
