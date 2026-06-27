import College from '../models/College.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const getColleges = async (req, res, next) => {
  try {
    const colleges = await College.find().sort({ name: 1 });
    res.json({ colleges });
  } catch (error) {
    next(error);
  }
};

export const registerCollege = async (req, res, next) => {
  try {
    const { name, code, address, adminName, adminEmail, adminPassword, department } = req.body;

    if (!name || !code || !adminName || !adminEmail || !adminPassword) {
      return res.status(400).json({ message: 'College name, code, admin name, email, and password are required' });
    }

    const existingCode = await College.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return res.status(400).json({ message: 'College code already exists' });
    }

    const existingEmail = await User.findOne({ email: adminEmail });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const college = await College.create({
      name,
      code: code.toUpperCase(),
      address: address || '',
    });

    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'Admin',
      college_id: college._id.toString(),
      department: department || '',
    });

    college.created_by = admin._id;
    await college.save();

    const token = generateToken(admin._id);

    res.status(201).json({
      token,
      user: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        college_id: admin.college_id,
        college_name: college.name,
        department: admin.department,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCollegeAdmin = async (req, res, next) => {
  try {
    const admin = await User.findOne({ college_id: req.params.id, role: 'Admin' }).select('name email department');
    if (!admin) {
      return res.status(404).json({ message: 'No admin found for this college' });
    }
    res.json({ admin });
  } catch (error) {
    next(error);
  }
};

export const registerStudent = async (req, res, next) => {
  try {
    const { name, email, password, college_id, course, semester, department } = req.body;

    if (!college_id) {
      return res.status(400).json({ message: 'Please select a college' });
    }

    const college = await College.findById(college_id);
    if (!college) {
      return res.status(400).json({ message: 'Selected college not found' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'Student',
      college_id: college._id.toString(),
      course: course || '',
      semester: semester || '',
      department: department || '',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college_id: user.college_id,
        college_name: college.name,
        course: user.course,
        semester: user.semester,
        department: user.department,
      },
    });
  } catch (error) {
    next(error);
  }
};
