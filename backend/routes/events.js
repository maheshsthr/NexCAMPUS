import { Router } from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

/**
 * @route   GET /api/events
 * @desc    Get all events (with search, category filter, pagination)
 * @access  Private
 * @query   { search, category, page, limit }
 */
router.get('/', protect, getEvents);

/**
 * @route   GET /api/events/:id
 * @desc    Get event by ID
 * @access  Private
 */
router.get('/:id', protect, getEventById);

/**
 * @route   POST /api/events
 * @desc    Create an event (Admin only)
 * @access  Private/Admin
 * @body    { title, description, date, venue, time, category, college_id }
 */
router.post('/', protect, authorize('Admin'), createEvent);

/**
 * @route   PUT /api/events/:id
 * @desc    Update an event (Admin only)
 * @access  Private/Admin
 */
router.put('/:id', protect, authorize('Admin'), updateEvent);

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete an event (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('Admin'), deleteEvent);

export default router;
