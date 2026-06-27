import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import authRoutes from './routes/auth.js';
import noticeRoutes from './routes/notices.js';
import eventRoutes from './routes/events.js';
import complaintRoutes from './routes/complaints.js';
import lostFoundRoutes from './routes/lostfound.js';
import galleryRoutes from './routes/gallery.js';
import collegeRoutes from './routes/colleges.js';
import aiRoutes from './routes/ai.js';
import dashboardRoutes from './routes/dashboard.js';
import studyMaterialRoutes from './routes/studyMaterial.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Campus360 API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/lostfound', lostFoundRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/study', studyMaterialRoutes);

app.use(errorHandler);

connectDB().then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection failed:', err.message);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
