import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true,
  },
  time: {
    type: String,
    default: '',
    trim: true,
  },
  category: {
    type: String,
    default: 'General',
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

eventSchema.index({ college_id: 1, date: 1 });

export default mongoose.model('Event', eventSchema);
