import Notice from '../models/Notice.js';

export const getNotices = async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;
    const college_id = req.user.college_id || req.query.college_id;
    const query = {};

    if (college_id) query.college_id = college_id;
    if (category && category !== 'All') query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Notice.countDocuments(query);
    const notices = await Notice.find(query)
      .populate('created_by', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      notices,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getNoticeById = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id).populate('created_by', 'name');
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    res.json({ notice });
  } catch (error) {
    next(error);
  }
};

export const createNotice = async (req, res, next) => {
  try {
    const { title, description, category, department, college_id } = req.body;

    const notice = await Notice.create({
      title,
      description,
      category: category || 'General',
      department: department || '',
      college_id: college_id || req.user.college_id || '',
      created_by: req.user._id,
    });

    res.status(201).json({ notice });
  } catch (error) {
    next(error);
  }
};

export const updateNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    res.json({ notice });
  } catch (error) {
    next(error);
  }
};

export const deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    next(error);
  }
};
