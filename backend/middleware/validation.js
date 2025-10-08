import { body, validationResult } from 'express-validator';

// Helper function to check validation results
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  
  next();
};

// User registration validation
export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  
  handleValidationErrors
];

// User login validation
export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Check-in validation
export const validateCheckIn = [
  // Demographics validation
  body('demographics.age')
    .isIn(['16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27'])
    .withMessage('Please provide a valid age'),
  
  body('demographics.gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Please provide a valid gender'),
  
  body('demographics.academicStatus')
    .isIn(['Undergraduate', 'PostGraduate', 'other'])
    .withMessage('Please provide a valid academic status'),

  // Life circumstances validation
  body('lifeCircumstances.stressLevel')
    .isIn(['Low', 'Moderate', 'High'])
    .withMessage('Please provide a valid stress level'),
  
  body('lifeCircumstances.academicPerformance')
    .isIn(['Excellent', 'Good', 'Average', 'Poor'])
    .withMessage('Please provide a valid academic performance rating'),
  
  body('lifeCircumstances.healthCondition')
    .isIn(['Normal', 'Fair', 'Abnormal'])
    .withMessage('Please provide a valid health condition'),
  
  body('lifeCircumstances.relationshipStatus')
    .isIn(['single', 'In a relationship', 'Breakup', 'Complicated', 'Other'])
    .withMessage('Please provide a valid relationship status'),
  
  body('lifeCircumstances.familyProblems')
    .isIn(['None', 'Parental conflict', 'Financial', 'Other'])
    .withMessage('Please provide a valid family problems status'),

  // Mental health validation
  body('mentalHealth.depressionLevel')
    .isIn(['never', 'Sometimes', 'often', 'Always'])
    .withMessage('Please provide a valid depression level'),
  
  body('mentalHealth.anxietyLevel')
    .isIn(['Never', 'Sometimes', 'Often', 'Always'])
    .withMessage('Please provide a valid anxiety level'),
  
  body('mentalHealth.socialSupport')
    .isIn(['Family', 'Friends', 'loneliness', 'None', 'Other'])
    .withMessage('Please provide a valid social support option'),

  // Risk assessment validation
  body('riskAssessment.selfHarmBehaviors')
    .isIn(['yes', 'no'])
    .withMessage('Please provide a valid self-harm behavior response'),
  
  body('riskAssessment.suicidalThoughts')
    .isIn(['never', 'Sometimes', 'Often', 'Always'])
    .withMessage('Please provide a valid suicidal thoughts response'),
  
  body('riskAssessment.mentalHealthHelp')
    .isIn(['yes', 'No'])
    .withMessage('Please provide a valid mental health help response'),

  // AI-related validation
  body('aiRelated.aiComfortLevel')
    .isIn(['1', '2', '3', '4', '5'])
    .withMessage('Please provide a valid AI comfort level'),
  
  body('aiRelated.aiConcerns')
    .isArray()
    .withMessage('AI concerns must be an array')
    .custom((value) => {
      const validConcerns = ['Privacy', 'Data Misuse', 'No concerns', 'Not sure'];
      const isValid = value.every(concern => validConcerns.includes(concern));
      if (!isValid) {
        throw new Error('Please provide valid AI concerns');
      }
      return true;
    }),
  
  body('aiRelated.aiTrustLevel')
    .isIn(['1', '2', '3', '4', '5'])
    .withMessage('Please provide a valid AI trust level'),

  handleValidationErrors
];

// Profile update validation
export const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('profile.age')
    .optional()
    .isInt({ min: 13, max: 120 })
    .withMessage('Age must be between 13 and 120'),
  
  body('profile.gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer-not-to-say'])
    .withMessage('Please provide a valid gender'),
  
  body('profile.phoneNumber')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  
  handleValidationErrors
];

// Password change validation
export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('confirmNewPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('New passwords do not match');
      }
      return true;
    }),
  
  handleValidationErrors
];