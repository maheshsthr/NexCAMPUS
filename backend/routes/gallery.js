import { Router } from 'express';
import { getGallery, uploadImage, deleteImage } from '../controllers/galleryController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

/**
 * @route   GET /api/gallery
 * @desc    Get all gallery images
 * @access  Private
 * @query   { page, limit }
 */
router.get('/', protect, getGallery);

/**
 * @route   POST /api/gallery
 * @desc    Upload a gallery image (Admin only)
 * @access  Private/Admin
 * @body    { title, event_name, college_id } + image file
 */
router.post('/', protect, authorize('Admin'), upload.single('image'), uploadImage);

/**
 * @route   DELETE /api/gallery/:id
 * @desc    Delete a gallery image (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('Admin'), deleteImage);

export default router;
