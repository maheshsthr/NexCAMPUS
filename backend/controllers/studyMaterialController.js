import StudyMaterial from '../models/StudyMaterial.js';
import { uploadToCloudinary } from '../middleware/upload.js';

export const getStudyMaterials = async (req, res, next) => {
  try {
    const { search, type, semester, page = 1, limit = 20 } = req.query;
    const query = {};

    if (req.user.college_id) query.college_id = req.user.college_id;

    if (type && type !== 'all') query.type = type;
    if (semester && semester !== 'All') query.semester = semester;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await StudyMaterial.countDocuments(query);
    const materials = await StudyMaterial.find(query)
      .populate('uploaded_by', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      materials,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const uploadMaterial = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const { title, type, subject, semester } = req.body;

    if (!title || !type) {
      return res.status(400).json({ message: 'Title and type are required' });
    }

    const uploaded = await uploadToCloudinary(req.file, 'campus360/study');

    const material = await StudyMaterial.create({
      title,
      type,
      subject: subject || '',
      semester: semester || '',
      file_url: uploaded.url,
      uploaded_by: req.user._id,
      college_id: req.user.college_id || '',
    });

    res.status(201).json({ material });
  } catch (error) {
    next(error);
  }
};

export const deleteMaterial = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    if (req.user.role !== 'Admin' && material.uploaded_by.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await StudyMaterial.findByIdAndDelete(req.params.id);
    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const incrementDownload = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }
    res.json({ material });
  } catch (error) {
    next(error);
  }
};
