import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'tata_steel_compliance_improvement_system_secret_key_2026', {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/login
// @access  Public
export const authUser = async (req, res) => {
  const { userId, password } = req.body;

  try {
    // Validation
    if (!userId || !password) {
      return res.status(400).json({ message: 'Please enter userId/email and password' });
    }

    // Find User by userId or email
    const user = await User.findOne({
      $or: [
        { userId: userId },
        { email: userId.toLowerCase() }
      ]
    });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        userId: user.userId,
        name: user.name,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid User ID/Email or Password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, userId, password, phone, email, department } = req.body;

  try {
    // Validation
    if (!name || !userId || !password || !phone) {
      return res.status(400).json({ message: 'Name, User ID, Password, and Phone Number are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ userId });
    if (userExists) {
      return res.status(400).json({ message: `User ID "${userId}" is already registered.` });
    }

    // Create new user
    const user = await User.create({
      name,
      userId,
      password,
      phone,
      email: email || '',
      department: department || 'Operations',
      role: 'Industrial Operator',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        userId: user.userId,
        name: user.name,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
