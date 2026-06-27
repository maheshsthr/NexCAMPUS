import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  category: {
    type: String,
    default: 'General',
    trim: true,
  },
  department: {
    type: String,
    default: '',
    trim: true,
  },
  created_by: {
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

noticeSchema.index({ college_id: 1, createdAt: -1 });

export default mongoose.model('Notice', noticeSchema);
