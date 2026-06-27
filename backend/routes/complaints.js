import { Router } from 'express';
import {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaintStatus,
  deleteComplaint,
} from '../controllers/complaintController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

/**
 * @route   GET /api/complaints
 * @desc    Get complaints (Students see own, Admin sees all)
 * @access  Private
 * @query   { search, status, page, limit }
 */
router.get('/', protect, getComplaints);

/**
 * @route   GET /api/complaints/:id
 * @desc    Get complaint by ID
 * @access  Private
 */
router.get('/:id', protect, getComplaintById);

/**
 * @route   POST /api/complaints
 * @desc    Create a complaint
 * @access  Private
 * @body    { title, description, category, college_id }
 */
router.post('/', protect, createComplaint);

/**
 * @route   PUT /api/complaints/:id/status
 * @desc    Update complaint status (Admin only)
 * @access  Private/Admin
 * @body    { status: "pending" | "in-progress" | "resolved" }
 */
router.put('/:id/status', protect, authorize('Admin'), updateComplaintStatus);

/**
 * @route   DELETE /api/complaints/:id
 * @desc    Delete a complaint (Owner or Admin)
 * @access  Private
 */
router.delete('/:id', protect, deleteComplaint);

export default router;
