import express from 'express';
import { protect, optionalAuth } from '../middleware/auth.js';
import { validateCheckIn } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/error.js';
import CheckIn from '../models/CheckIn.js';

const router = express.Router();

// @desc    Submit check-in assessment
// @route   POST /api/checkins
// @access  Private/Public (optionalAuth allows both logged-in users and anonymous)
router.post('/', optionalAuth, validateCheckIn, asyncHandler(async (req, res) => {
  const {
    demographics,
    lifeCircumstances,
    mentalHealth,
    riskAssessment,
    aiRelated
  } = req.body;

  // Create check-in data
  const checkInData = {
    demographics,
    lifeCircumstances,
    mentalHealth,
    riskAssessment,
    aiRelated,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    sessionId: req.sessionID || 'anonymous'
  };

  // If user is authenticated, add user ID
  if (req.user) {
    checkInData.user = req.user.id;
  }

  // Create check-in (assessment will be calculated automatically via pre-save middleware)
  const checkIn = await CheckIn.create(checkInData);

  // Get the populated check-in with assessment
  const populatedCheckIn = await CheckIn.findById(checkIn._id)
    .populate('user', 'name email')
    .select('assessment completedAt user');

  // If this is a high-risk assessment, log it for immediate attention
  if (checkIn.assessment.riskLevel === 'Crisis' || checkIn.assessment.riskLevel === 'High Risk') {
    console.warn(`HIGH RISK ASSESSMENT SUBMITTED:`, {
      checkInId: checkIn._id,
      userId: req.user?.id || 'anonymous',
      riskLevel: checkIn.assessment.riskLevel,
      score: checkIn.assessment.score,
      timestamp: checkIn.completedAt
    });
  }

  res.status(201).json({
    success: true,
    message: 'Check-in assessment completed successfully',
    data: {
      checkIn: {
        id: populatedCheckIn._id,
        assessment: populatedCheckIn.assessment,
        completedAt: populatedCheckIn.completedAt,
        user: populatedCheckIn.user || null
      }
    }
  });
}));

// @desc    Get user's check-in history
// @route   GET /api/checkins/history
// @access  Private
router.get('/history', protect, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Get user's check-ins with pagination
  const checkIns = await CheckIn.find({ user: req.user.id })
    .sort({ completedAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('assessment completedAt demographics.age lifeCircumstances.stressLevel');

  // Get total count for pagination
  const totalCheckIns = await CheckIn.countDocuments({ user: req.user.id });

  // Calculate pagination info
  const totalPages = Math.ceil(totalCheckIns / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  res.status(200).json({
    success: true,
    data: {
      checkIns,
      pagination: {
        currentPage: page,
        totalPages,
        totalResults: totalCheckIns,
        hasNextPage,
        hasPrevPage,
        limit
      }
    }
  });
}));

// @desc    Get specific check-in details
// @route   GET /api/checkins/:id
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const checkIn = await CheckIn.findOne({
    _id: req.params.id,
    user: req.user.id
  }).populate('user', 'name email');

  if (!checkIn) {
    return res.status(404).json({
      success: false,
      message: 'Check-in not found'
    });
  }

  res.status(200).json({
    success: true,
    data: { checkIn }
  });
}));

// @desc    Get user's latest check-in
// @route   GET /api/checkins/latest
// @access  Private
router.get('/latest', protect, asyncHandler(async (req, res) => {
  const checkIn = await CheckIn.findOne({ user: req.user.id })
    .sort({ completedAt: -1 })
    .select('assessment completedAt demographics lifeCircumstances mentalHealth');

  if (!checkIn) {
    return res.status(404).json({
      success: false,
      message: 'No check-ins found for this user'
    });
  }

  res.status(200).json({
    success: true,
    data: { checkIn }
  });
}));

// @desc    Get user's mental health progress/trends
// @route   GET /api/checkins/progress
// @access  Private
router.get('/progress', protect, asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days, 10) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const checkIns = await CheckIn.find({
    user: req.user.id,
    completedAt: { $gte: startDate }
  })
    .sort({ completedAt: 1 })
    .select('assessment.score assessment.riskLevel completedAt mentalHealth.depressionLevel mentalHealth.anxietyLevel lifeCircumstances.stressLevel');

  // Calculate trends and statistics
  const scores = checkIns.map(c => c.assessment.score);
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  
  const latestScore = scores[scores.length - 1] || 0;
  const previousScore = scores[scores.length - 2] || latestScore;
  const trend = latestScore - previousScore;

  // Risk level distribution
  const riskDistribution = checkIns.reduce((acc, checkIn) => {
    acc[checkIn.assessment.riskLevel] = (acc[checkIn.assessment.riskLevel] || 0) + 1;
    return acc;
  }, {});

  res.status(200).json({
    success: true,
    data: {
      checkIns,
      statistics: {
        totalCheckIns: checkIns.length,
        averageScore: Math.round(avgScore * 10) / 10,
        latestScore,
        trend: {
          direction: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
          change: Math.abs(trend)
        },
        riskDistribution,
        period: `${days} days`
      }
    }
  });
}));

// @desc    Delete check-in (user can delete their own)
// @route   DELETE /api/checkins/:id
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const checkIn = await CheckIn.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!checkIn) {
    return res.status(404).json({
      success: false,
      message: 'Check-in not found'
    });
  }

  await CheckIn.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Check-in deleted successfully'
  });
}));

// @desc    Get check-in analytics (admin only)
// @route   GET /api/checkins/analytics/summary
// @access  Private/Admin
router.get('/analytics/summary', protect, asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  const days = parseInt(req.query.days, 10) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get analytics data
  const analytics = await CheckIn.getAnalytics(startDate);
  
  // Get total check-ins count
  const totalCheckIns = await CheckIn.countDocuments({
    completedAt: { $gte: startDate }
  });

  // Get high-risk check-ins
  const highRiskCheckIns = await CheckIn.countDocuments({
    completedAt: { $gte: startDate },
    'assessment.riskLevel': { $in: ['High Risk', 'Crisis'] }
  });

  res.status(200).json({
    success: true,
    data: {
      analytics,
      summary: {
        totalCheckIns,
        highRiskCheckIns,
        highRiskPercentage: totalCheckIns > 0 ? Math.round((highRiskCheckIns / totalCheckIns) * 100) : 0,
        period: `${days} days`
      }
    }
  });
}));

export default router;