import express from 'express';
import { protect } from '../middleware/auth.js';
import { validateRegister, validateLogin, validatePasswordChange } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/error.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', validateRegister, asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    lastLogin: new Date()
  });

  // Generate JWT token
  const token = user.getSignedJwtToken();

  // Remove password from response
  user.password = undefined;

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        profile: user.profile
      }
    }
  });
}));

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', validateLogin, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user and include password in selection
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account has been deactivated. Please contact support.'
    });
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate JWT token
  const token = user.getSignedJwtToken();

  // Remove password from response
  user.password = undefined;

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
        profile: user.profile,
        preferences: user.preferences
      }
    }
  });
}));

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        preferences: user.preferences,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        emailVerified: user.emailVerified
      }
    }
  });
}));

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, asyncHandler(async (req, res) => {
  const fieldsToUpdate = {};
  
  // Only update allowed fields
  const allowedFields = ['name', 'profile.age', 'profile.gender', 'profile.phoneNumber', 'preferences'];
  
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      if (key.startsWith('profile.')) {
        if (!fieldsToUpdate.profile) fieldsToUpdate.profile = {};
        const profileField = key.split('.')[1];
        fieldsToUpdate.profile[profileField] = req.body[key];
      } else {
        fieldsToUpdate[key] = req.body[key];
      }
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        preferences: user.preferences
      }
    }
  });
}));

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
router.put('/password', protect, validatePasswordChange, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isMatch = await user.matchPassword(req.body.currentPassword);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  user.password = req.body.newPassword;
  await user.save();

  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
    token
  });
}));

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
    data: {}
  });
}));

// @desc    Delete user account
// @route   DELETE /api/auth/account
// @access  Private
router.delete('/account', protect, asyncHandler(async (req, res) => {
  // Soft delete - deactivate account instead of hard delete for data retention
  await User.findByIdAndUpdate(req.user.id, { 
    isActive: false,
    updatedAt: new Date()
  });

  res.status(200).json({
    success: true,
    message: 'Account deactivated successfully'
  });
}));

// @desc    Get user statistics (admin only)
// @route   GET /api/auth/stats
// @access  Private/Admin
router.get('/stats', protect, asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  const stats = await User.getUserStats();

  res.status(200).json({
    success: true,
    data: { stats }
  });
}));

export default router;