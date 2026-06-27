import Event from '../models/Event.js';

export const getEvents = async (req, res, next) => {
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
        { venue: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('created_by', 'name')
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      events,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('created_by', 'name');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ event });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const { title, description, date, venue, time, category, college_id } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      venue,
      time: time || '',
      category: category || 'General',
      college_id: college_id || req.user.college_id || '',
      created_by: req.user._id,
    });

    res.status(201).json({ event });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ event });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};
