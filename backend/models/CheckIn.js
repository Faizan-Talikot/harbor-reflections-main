import mongoose from 'mongoose';

const CheckInSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false  // Allow anonymous check-ins
  },
  
  // Demographics (Step 1)
  demographics: {
    age: {
      type: String,
      required: [true, 'Age is required'],
      enum: ['16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27']
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['male', 'female', 'other']
    },
    academicStatus: {
      type: String,
      required: [true, 'Academic status is required'],
      enum: ['Undergraduate', 'PostGraduate', 'other']
    }
  },

  // Life Circumstances (Step 2)
  lifeCircumstances: {
    stressLevel: {
      type: String,
      required: [true, 'Stress level is required'],
      enum: ['Low', 'Moderate', 'High']
    },
    academicPerformance: {
      type: String,
      required: [true, 'Academic performance is required'],
      enum: ['Excellent', 'Good', 'Average', 'Poor']
    },
    healthCondition: {
      type: String,
      required: [true, 'Health condition is required'],
      enum: ['Normal', 'Fair', 'Abnormal']
    },
    relationshipStatus: {
      type: String,
      required: [true, 'Relationship status is required'],
      enum: ['single', 'In a relationship', 'Breakup', 'Complicated', 'Other']
    },
    familyProblems: {
      type: String,
      required: [true, 'Family problems status is required'],
      enum: ['None', 'Parental conflict', 'Financial', 'Other']
    }
  },

  // Mental Health Status (Step 3)
  mentalHealth: {
    depressionLevel: {
      type: String,
      required: [true, 'Depression level is required'],
      enum: ['never', 'Sometimes', 'often', 'Always']
    },
    anxietyLevel: {
      type: String,
      required: [true, 'Anxiety level is required'],
      enum: ['Never', 'Sometimes', 'Often', 'Always']
    },
    socialSupport: {
      type: String,
      required: [true, 'Social support is required'],
      enum: ['Family', 'Friends', 'loneliness', 'None', 'Other']
    }
  },

  // Critical Mental Health Questions (Step 4)
  riskAssessment: {
    selfHarmBehaviors: {
      type: String,
      required: [true, 'Self-harm behavior status is required'],
      enum: ['yes', 'no']
    },
    suicidalThoughts: {
      type: String,
      required: [true, 'Suicidal thoughts status is required'],
      enum: ['never', 'Sometimes', 'Often', 'Always']
    },
    mentalHealthHelp: {
      type: String,
      required: [true, 'Mental health help status is required'],
      enum: ['yes', 'No']
    }
  },

  // AI-related Questions (Step 5)
  aiRelated: {
    aiComfortLevel: {
      type: String,
      required: [true, 'AI comfort level is required'],
      enum: ['1', '2', '3', '4', '5']
    },
    aiConcerns: [{
      type: String,
      enum: ['Privacy', 'Data Misuse', 'No concerns', 'Not sure']
    }],
    aiTrustLevel: {
      type: String,
      required: [true, 'AI trust level is required'],
      enum: ['1', '2', '3', '4', '5']
    }
  },

  // Assessment Results
  assessment: {
    riskLevel: {
      type: String,
      enum: ['Low Risk', 'Moderate Risk', 'At Risk (Thoughts)', 'High Risk', 'Crisis'],
      default: 'Low Risk'  // Default value, will be recalculated by pre-validate middleware
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    recommendations: [{
      type: {
        type: String,
        enum: ['immediate_help', 'professional_support', 'self_care', 'resources']
      },
      message: String,
      priority: {
        type: String,
        enum: ['urgent', 'high', 'medium', 'low'],
        default: 'medium'
      }
    }]
  },

  // Metadata
  completedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  sessionId: {
    type: String
  },
  
  // Follow-up tracking
  followUp: {
    reminderSent: { type: Boolean, default: false },
    reminderDate: Date,
    contacted: { type: Boolean, default: false },
    contactDate: Date,
    notes: String
  }
});

// Indexes for better query performance
CheckInSchema.index({ user: 1, completedAt: -1 });
CheckInSchema.index({ 'assessment.riskLevel': 1 });
CheckInSchema.index({ completedAt: -1 });

// Pre-save middleware to calculate assessment
CheckInSchema.pre('validate', function(next) {
  try {
    console.log('Pre-validate: Calculating assessment for check-in');
    const calculatedAssessment = calculateAssessment(this);
    this.assessment = calculatedAssessment;
    console.log('Assessment calculated:', calculatedAssessment);
    next();
  } catch (error) {
    console.error('Error calculating assessment:', error);
    next(error);
  }
});

// Static method to get user's check-in history
CheckInSchema.statics.getUserHistory = async function(userId, limit = 10) {
  return await this.find({ user: userId })
    .sort({ completedAt: -1 })
    .limit(limit)
    .select('assessment completedAt');
};

// Static method to get analytics data
CheckInSchema.statics.getAnalytics = async function(startDate, endDate) {
  const pipeline = [
    {
      $match: {
        completedAt: {
          $gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          $lte: endDate || new Date()
        }
      }
    },
    {
      $group: {
        _id: '$assessment.riskLevel',
        count: { $sum: 1 },
        averageScore: { $avg: '$assessment.score' }
      }
    }
  ];

  return await this.aggregate(pipeline);
};

// Function to calculate assessment based on responses
function calculateAssessment(checkIn) {
  let score = 0;
  let riskLevel = 'Low Risk';
  let recommendations = [];

  // Risk factors scoring
  const riskFactors = {
    // Depression scoring
    depressionLevel: {
      'never': 0,
      'Sometimes': 25,
      'often': 50,
      'Always': 75
    },
    // Anxiety scoring
    anxietyLevel: {
      'Never': 0,
      'Sometimes': 20,
      'Often': 40,
      'Always': 60
    },
    // Suicidal thoughts (highest weight)
    suicidalThoughts: {
      'never': 0,
      'Sometimes': 60,
      'Often': 80,
      'Always': 100
    },
    // Self-harm behaviors
    selfHarmBehaviors: {
      'no': 0,
      'yes': 40
    },
    // Stress level
    stressLevel: {
      'Low': 0,
      'Moderate': 15,
      'High': 30
    }
  };

  // Calculate base score
  score += riskFactors.depressionLevel[checkIn.mentalHealth.depressionLevel] || 0;
  score += riskFactors.anxietyLevel[checkIn.mentalHealth.anxietyLevel] || 0;
  score += riskFactors.suicidalThoughts[checkIn.riskAssessment.suicidalThoughts] || 0;
  score += riskFactors.selfHarmBehaviors[checkIn.riskAssessment.selfHarmBehaviors] || 0;
  score += riskFactors.stressLevel[checkIn.lifeCircumstances.stressLevel] || 0;

  // Protective factors (reduce risk)
  if (checkIn.mentalHealth.socialSupport === 'Family' || checkIn.mentalHealth.socialSupport === 'Friends') {
    score -= 10;
  }
  if (checkIn.riskAssessment.mentalHealthHelp === 'yes') {
    score -= 15;
  }
  if (checkIn.lifeCircumstances.academicPerformance === 'Excellent' || checkIn.lifeCircumstances.academicPerformance === 'Good') {
    score -= 5;
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  // Determine risk level and recommendations
  if (score >= 80 || checkIn.riskAssessment.suicidalThoughts === 'Always') {
    riskLevel = 'Crisis';
    recommendations = [
      {
        type: 'immediate_help',
        message: 'Please contact emergency services (911) or go to your nearest emergency room immediately.',
        priority: 'urgent'
      },
      {
        type: 'professional_support',
        message: 'Contact the 988 Suicide & Crisis Lifeline: 988',
        priority: 'urgent'
      }
    ];
  } else if (score >= 60 || checkIn.riskAssessment.suicidalThoughts === 'Often') {
    riskLevel = 'High Risk';
    recommendations = [
      {
        type: 'immediate_help',
        message: 'Consider contacting a mental health professional today.',
        priority: 'high'
      },
      {
        type: 'professional_support',
        message: 'Call 988 Lifeline: 988 for immediate support',
        priority: 'high'
      }
    ];
  } else if (score >= 40 || checkIn.riskAssessment.suicidalThoughts === 'Sometimes') {
    riskLevel = 'At Risk (Thoughts)';
    recommendations = [
      {
        type: 'professional_support',
        message: 'We recommend speaking with a mental health professional.',
        priority: 'high'
      },
      {
        type: 'resources',
        message: 'Explore our resource library for coping strategies.',
        priority: 'medium'
      }
    ];
  } else if (score >= 20) {
    riskLevel = 'Moderate Risk';
    recommendations = [
      {
        type: 'self_care',
        message: 'Focus on self-care activities and stress management.',
        priority: 'medium'
      },
      {
        type: 'resources',
        message: 'Consider exploring our wellness resources.',
        priority: 'medium'
      }
    ];
  } else {
    riskLevel = 'Low Risk';
    recommendations = [
      {
        type: 'self_care',
        message: 'Continue your positive mental health practices.',
        priority: 'low'
      }
    ];
  }

  return {
    riskLevel,
    score,
    recommendations
  };
}

export default mongoose.model('CheckIn', CheckInSchema);