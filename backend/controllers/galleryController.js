import Gallery from '../models/Gallery.js';
import { uploadToCloudinary } from '../middleware/upload.js';

const apiBase = process.env.RAILWAY_PUBLIC_DOMAIN
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
  : '';

function fullUrl(url) {
  if (!url || url.startsWith('http')) return url;
  return `${apiBase}${url}`;
}

export const getGallery = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const college_id = req.user.college_id || req.query.college_id;
    const query = {};

    if (college_id) query.college_id = college_id;

    const total = await Gallery.countDocuments(query);
    const images = await Gallery.find(query)
      .populate('uploaded_by', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      images: images.map(img => ({
        ...img.toObject(),
        image_url: fullUrl(img.image_url),
      })),
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    const { title, event_name, college_id } = req.body;
    const uploaded = await uploadToCloudinary(req.file, 'campus360/gallery');

    const gallery = await Gallery.create({
      image_url: uploaded.url,
      title: title || '',
      event_name: event_name || '',
      uploaded_by: req.user._id,
      college_id: college_id || req.user.college_id || '',
    });

    res.status(201).json({ image: gallery });
  } catch (error) {
    next(error);
  }
};

export const deleteImage = async (req, res, next) => {
  try {
    const image = await Gallery.findByIdAndDelete(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    next(error);
  }
};
