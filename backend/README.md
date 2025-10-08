# Harbor Reflections Backend API

A comprehensive backend API for the Harbor Reflections mental health platform, built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication**: Secure registration, login, and JWT-based authentication
- **Mental Health Assessments**: Complete check-in system with risk assessment
- **Data Security**: Encrypted passwords, rate limiting, and input validation
- **Risk Analysis**: Intelligent scoring system with automatic risk level detection
- **User Management**: Profile management, preferences, and account controls
- **Analytics**: Admin dashboard with usage statistics and risk analytics
- **CORS Support**: Configured for frontend integration
- **Error Handling**: Comprehensive error handling and logging

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB installation)

## 🛠️ Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   - The `.env` file is already configured with your MongoDB connection string
   - **IMPORTANT**: Change the `JWT_SECRET` in production to a secure random string

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   Or for production:
   ```bash
   npm start
   ```

## 🌐 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | User login | Public |
| GET | `/me` | Get current user | Private |
| PUT | `/profile` | Update user profile | Private |
| PUT | `/password` | Change password | Private |
| POST | `/logout` | User logout | Private |
| DELETE | `/account` | Deactivate account | Private |
| GET | `/stats` | User statistics | Admin |

### Check-in Routes (`/api/checkins`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/` | Submit assessment | Public/Private |
| GET | `/history` | Get user's check-in history | Private |
| GET | `/latest` | Get latest check-in | Private |
| GET | `/progress` | Get mental health trends | Private |
| GET | `/:id` | Get specific check-in | Private |
| DELETE | `/:id` | Delete check-in | Private |
| GET | `/analytics/summary` | Analytics dashboard | Admin |

### General Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | API welcome message | Public |
| GET | `/api/health` | Health check | Public |

## 📊 Data Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (encrypted),
  role: String (user/admin),
  profile: {
    age: Number,
    gender: String,
    phoneNumber: String
  },
  preferences: {
    notifications: Object,
    privacy: Object
  },
  lastLogin: Date,
  isActive: Boolean,
  emailVerified: Boolean
}
```

### CheckIn Model
```javascript
{
  user: ObjectId (optional - allows anonymous),
  demographics: {
    age: String,
    gender: String,
    academicStatus: String
  },
  lifeCircumstances: {
    stressLevel: String,
    academicPerformance: String,
    healthCondition: String,
    relationshipStatus: String,
    familyProblems: String
  },
  mentalHealth: {
    depressionLevel: String,
    anxietyLevel: String,
    socialSupport: String
  },
  riskAssessment: {
    selfHarmBehaviors: String,
    suicidalThoughts: String,
    mentalHealthHelp: String
  },
  aiRelated: {
    aiComfortLevel: String,
    aiConcerns: [String],
    aiTrustLevel: String
  },
  assessment: {
    riskLevel: String,
    score: Number,
    recommendations: [Object]
  },
  completedAt: Date
}
```

## 🔒 Security Features

- **Password Encryption**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **Input Validation**: express-validator for all inputs
- **CORS Protection**: Configured allowed origins
- **Helmet Security**: Security headers
- **IP Tracking**: For security monitoring

## 🎯 Risk Assessment Algorithm

The system automatically calculates risk levels based on user responses:

- **Crisis** (80+ score): Immediate intervention needed
- **High Risk** (60-79 score): Professional help recommended
- **At Risk (Thoughts)** (40-59 score): Support recommended
- **Moderate Risk** (20-39 score): Self-care focus
- **Low Risk** (0-19 score): Maintain positive practices

## 📈 Usage Examples

### User Registration
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

### Submit Check-in
```bash
POST /api/checkins
Authorization: Bearer <token>
Content-Type: application/json

{
  "demographics": {
    "age": "20",
    "gender": "male",
    "academicStatus": "Undergraduate"
  },
  "lifeCircumstances": {
    "stressLevel": "Moderate",
    "academicPerformance": "Good",
    "healthCondition": "Normal",
    "relationshipStatus": "single",
    "familyProblems": "None"
  },
  // ... other sections
}
```

## 🔧 Configuration

### Environment Variables
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://faizan:1234@cluster0.e4p86uw.mongodb.net/Harbor-reflection
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:8080
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🚨 Important Notes

1. **Production Deployment**: 
   - Change `JWT_SECRET` to a secure random string
   - Set `NODE_ENV=production`
   - Update `CORS_ORIGIN` to your frontend URL
   - Enable MongoDB IP whitelist

2. **High-Risk Assessments**: 
   - Automatically logged for immediate attention
   - Consider implementing email/SMS alerts for crisis levels

3. **Data Privacy**: 
   - Check-ins can be submitted anonymously
   - User data is encrypted and secured
   - GDPR-compliant account deletion (soft delete)

## 📝 Development

- **Development**: `npm run dev` (uses nodemon for auto-restart)
- **Production**: `npm start`
- **Logs**: Check console output for detailed logging

## 🤝 Integration with Frontend

Update your frontend to point to the backend API:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

For authentication, include JWT token in requests:
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

## 📞 Support

For technical support or questions about the API, check the health endpoint: `GET /api/health`