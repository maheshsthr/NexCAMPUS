import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

/**
 * @route   GET /api/dashboard
 * @desc    Get dashboard stats, recent notices, upcoming events
 * @access  Private
 * @return  { stats, recentNotices, upcomingEvents }
 */
router.get('/', protect, getDashboard);

export default router;
