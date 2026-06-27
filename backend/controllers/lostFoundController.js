import LostFound from '../models/LostFound.js';
import { uploadToCloudinary } from '../middleware/upload.js';

export const getItems = async (req, res, next) => {
  try {
    const { search, category, type, status, page = 1, limit = 20 } = req.query;
    const college_id = req.user.college_id || req.query.college_id;
    const query = {};

    if (college_id) query.college_id = college_id;
    if (type) query.type = type;
    if (status) query.status = status;
    if (category && category !== 'All') query.category = category;
    if (search) {
      query.$or = [
        { item_name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await LostFound.countDocuments(query);
    const items = await LostFound.find(query)
      .populate('reported_by', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      items,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const createItem = async (req, res, next) => {
  try {
    const { item_name, description, category, type, location, college_id } = req.body;

    let image_url = '';
    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file, 'campus360/lostfound');
      image_url = uploaded.url;
    }

    const item = await LostFound.create({
      item_name,
      description,
      category: category || 'Other',
      type,
      location,
      image_url,
      college_id: college_id || req.user.college_id || '',
      reported_by: req.user._id,
    });

    res.status(201).json({ item });
  } catch (error) {
    next(error);
  }
};

export const deleteItem = async (req, res, next) => {
  try {
    const item = await LostFound.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    if (req.user.role !== 'Admin' && item.reported_by.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }
    await LostFound.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateItemStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['open', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const item = await LostFound.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ item });
  } catch (error) {
    next(error);
  }
};
