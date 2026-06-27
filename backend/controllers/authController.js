import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import College from '../models/College.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    let college_name = '';
    if (user.college_id) {
      const college = await College.findById(user.college_id);
      if (college) college_name = college.name;
    }

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college_id: user.college_id,
        college_name,
        course: user.course,
        semester: user.semester,
        department: user.department,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let college_name = '';
    if (user.college_id) {
      const college = await College.findById(user.college_id);
      if (college) college_name = college.name;
    }
    res.json({ user: { ...user.toObject(), college_name } });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'phone', 'department', 'course', 'semester', 'enrollment'];
    const updates = {};
    for (const field of allowed) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    let college_name = '';
    if (user.college_id) {
      const college = await College.findById(user.college_id);
      if (college) college_name = college.name;
    }
    res.json({ user: { ...user.toObject(), college_name } });
  } catch (error) {
    next(error);
  }
};
