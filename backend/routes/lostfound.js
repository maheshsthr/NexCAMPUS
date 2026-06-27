import { Router } from 'express';
import { getItems, createItem, updateItemStatus, deleteItem } from '../controllers/lostFoundController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

/**
 * @route   GET /api/lostfound
 * @desc    Get all lost/found items (with search, category, type filters)
 * @access  Private
 * @query   { search, category, type, status, page, limit }
 */
router.get('/', protect, getItems);

/**
 * @route   POST /api/lostfound
 * @desc    Report a lost or found item (with optional image upload)
 * @access  Private
 * @body    { item_name, description, category, type, location, college_id } + image file
 */
router.post('/', protect, upload.single('image'), createItem);

/**
 * @route   PUT /api/lostfound/:id/status
 * @desc    Update item status (open/resolved)
 * @access  Private
 * @body    { status }
 */
router.put('/:id/status', protect, updateItemStatus);

router.delete('/:id', protect, deleteItem);

export default router;
