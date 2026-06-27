import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  image_url: {
    type: String,
    required: [true, 'Image URL is required'],
  },
  title: {
    type: String,
    default: '',
    trim: true,
  },
  event_name: {
    type: String,
    default: '',
    trim: true,
  },
  uploaded_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  college_id: {
    type: String,
    default: '',
    trim: true,
  },
}, { timestamps: true });

export default mongoose.model('Gallery', gallerySchema);
