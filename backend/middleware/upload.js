import { cloudinary } from '../config/cloudinary.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const cloudinaryConfigured = () => {
  return !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name'
    && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'your_api_key'
    && process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_API_SECRET !== 'your_api_secret');
};

const upload = multer({
  storage: cloudinaryConfigured() ? multer.memoryStorage() : diskStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, jpeg, png, gif, webp) are allowed'), false);
    }
  },
});

const uploadFile = multer({
  storage: cloudinaryConfigured() ? multer.memoryStorage() : diskStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, PPT, PPTX, and TXT files are allowed'), false);
    }
  },
});

const uploadToCloudinary = async (file, folder = 'campus360') => {
  if (cloudinaryConfigured()) {
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;
    const isRaw = !file.mimetype.startsWith('image/');
    const result = await cloudinary.uploader.upload(dataURI, {
      folder,
      resource_type: isRaw ? 'raw' : 'image',
      ...(isRaw ? {} : { transformation: [{ width: 1000, height: 1000, crop: 'limit', quality: 'auto' }] }),
    });
    return { url: result.secure_url, public_id: result.public_id };
  }
  const url = `/uploads/${file.filename}`;
  return { url, public_id: file.filename };
};

export { upload, uploadFile, uploadToCloudinary };
