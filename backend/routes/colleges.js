import { Router } from 'express';
import { getColleges, registerCollege, registerStudent, getCollegeAdmin } from '../controllers/collegeController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

/**
 * @route   GET /api/colleges
 * @desc    Get all colleges (for student registration dropdown)
 * @access  Public
 */
router.get('/', getColleges);

/**
 * @route   GET /api/colleges/:id/admin
 * @desc    Get admin details for a college
 * @access  Private
 */
router.get('/:id/admin', protect, getCollegeAdmin);

/**
 * @route   POST /api/colleges/register
 * @desc    Register a new college with an admin account
 * @access  Public
 * @body    { name, code, address, adminName, adminEmail, adminPassword, department }
 */
router.post('/register', registerCollege);

export default router;
