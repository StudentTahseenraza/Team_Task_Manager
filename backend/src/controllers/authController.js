import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Add this function to create default admin if none exists
export const initializeDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@taskmanager.com' });
    if (!adminExists) {
      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@taskmanager.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✅ Default admin created:', admin.email);
    }
    
    // Also create a test member user
    const memberExists = await User.findOne({ email: 'member@taskmanager.com' });
    if (!memberExists) {
      const member = await User.create({
        name: 'Team Member',
        email: 'member@taskmanager.com',
        password: 'member123',
        role: 'member'
      });
      console.log('✅ Default member created:', member.email);
    }
  } catch (error) {
    console.error('Error creating default users:', error);
  }
};

export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    const user = await User.create({
      name,
      email,
      password,
      role: 'member'
    });
    
    const token = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('projects', 'name description');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    // Only admin can access this
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const users = await User.find({}, 'name email role');
    res.json({
      success: true,
      users
    });
  } catch (error) {
    next(error);
  }
};