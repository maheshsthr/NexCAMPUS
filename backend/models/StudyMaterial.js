import mongoose from 'mongoose';

const studyMaterialSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Title is required'], trim: true },
  type: { type: String, enum: ['notes', 'syllabus'], required: [true, 'Type is required'] },
  subject: { type: String, default: '', trim: true },
  semester: { type: String, default: '', trim: true },
  file_url: { type: String, required: [true, 'File URL is required'] },
  uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  college_id: { type: String, default: '', trim: true },
  downloads: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('StudyMaterial', studyMaterialSchema);
