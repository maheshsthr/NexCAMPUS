import mongoose from 'mongoose';

const collegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'College name is required'],
    trim: true,
  },
  code: {
    type: String,
    required: [true, 'College code is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  address: {
    type: String,
    default: '',
    trim: true,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

export default mongoose.model('College', collegeSchema);
