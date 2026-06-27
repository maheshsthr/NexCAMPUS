import { Router } from 'express';
import { login, getMe, updateProfile } from '../controllers/authController.js';
import { registerStudent } from '../controllers/collegeController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new student (selects college from dropdown)
 * @access  Public
 * @body    { name, email, password, college_id, course, semester, department }
 * @return  { token, user }
 */
router.post('/register', registerStudent);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 * @body    { email, password }
 * @return  { token, user }
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 * @return  { user }
 */
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);

export default router;
