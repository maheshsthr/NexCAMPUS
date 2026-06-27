import { Router } from 'express';
import {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
} from '../controllers/noticeController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

/**
 * @route   GET /api/notices
 * @desc    Get all notices (with search, category filter, pagination)
 * @access  Private
 * @query   { search, category, page, limit }
 */
router.get('/', protect, getNotices);

/**
 * @route   GET /api/notices/:id
 * @desc    Get notice by ID
 * @access  Private
 */
router.get('/:id', protect, getNoticeById);

/**
 * @route   POST /api/notices
 * @desc    Create a notice (Admin only)
 * @access  Private/Admin
 * @body    { title, description, category, department, college_id }
 */
router.post('/', protect, authorize('Admin'), createNotice);

/**
 * @route   PUT /api/notices/:id
 * @desc    Update a notice (Admin only)
 * @access  Private/Admin
 */
router.put('/:id', protect, authorize('Admin'), updateNotice);

/**
 * @route   DELETE /api/notices/:id
 * @desc    Delete a notice (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('Admin'), deleteNotice);

export default router;
