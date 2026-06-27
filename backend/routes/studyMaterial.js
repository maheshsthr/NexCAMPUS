import { Router } from 'express';
import { getStudyMaterials, uploadMaterial, deleteMaterial, incrementDownload } from '../controllers/studyMaterialController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadFile } from '../middleware/upload.js';

const router = Router();

router.get('/', protect, getStudyMaterials);

router.post('/', protect, authorize('Admin'), uploadFile.single('file'), uploadMaterial);

router.delete('/:id', protect, authorize('Admin'), deleteMaterial);

router.put('/:id/download', protect, incrementDownload);

export default router;
