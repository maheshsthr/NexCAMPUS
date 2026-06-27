import mongoose from 'mongoose';

const lostFoundSchema = new mongoose.Schema({
  item_name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  category: {
    type: String,
    default: 'Other',
    trim: true,
  },
  type: {
    type: String,
    enum: ['lost', 'found'],
    required: [true, 'Type is required'],
  },
  image_url: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['open', 'resolved'],
    default: 'open',
  },
  reported_by: {
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

lostFoundSchema.index({ college_id: 1, type: 1 });

export default mongoose.model('LostFound', lostFoundSchema);
