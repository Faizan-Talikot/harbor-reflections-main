# Harbor Reflections ML Integration

This document describes how to run the complete Harbor Reflections application with ML-powered risk assessment.

## Architecture Overview

```
Frontend (React/TypeScript) → Backend (Express/Node.js) → ML Service (FastAPI/Python)
     ↓                              ↓                           ↓
  CheckIn Form              Stores Data & Calls ML         Risk Prediction
     ↓                              ↓                           ↓
  Displays Results          Returns Combined Response     ML Model Analysis
```

## Setup Instructions

### 1. ML Backend (FastAPI Service)

```bash
# Navigate to ml-backend directory
cd ml-backend

# Install Python dependencies
pip install -r requirements.txt

# Start the ML service
python main.py
```

The ML service will run on `http://localhost:8000`

**Test the ML API:**
```bash
# Run the test script
python test_api.py

# Or test manually:
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d @test_data.json
```

### 2. Main Backend (Express/Node.js)

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not done already)
npm install

# Ensure .env file has MongoDB connection
echo "MONGODB_URI=mongodb+srv://faizan:1234@cluster0.e4p86uw.mongodb.net/Harbor-reflection" > .env
echo "JWT_SECRET=your-super-secret-jwt-key-here" >> .env

# Start the backend server
npm start
```

The main backend will run on `http://localhost:5000`

### 3. Frontend (React/Vite)

```bash
# Navigate to project root
cd ..

# Install dependencies (if not done already)
npm install

# Start the frontend development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### ML Service (Port 8000)

- `GET /health` - Health check
- `POST /predict` - Risk prediction
- `GET /model-info` - Model information

### Main Backend (Port 5000)

- `POST /api/checkins` - Submit assessment (now includes ML prediction)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

## Data Flow

1. **User submits CheckIn form** → Frontend collects data
2. **Frontend sends to backend** → Express API at `/api/checkins`
3. **Backend transforms data** → Converts to ML API format
4. **Backend calls ML service** → FastAPI `/predict` endpoint
5. **ML service returns prediction** → Risk assessment + recommendations
6. **Backend stores + responds** → Saves to MongoDB + returns combined result
7. **Frontend displays results** → Shows both traditional and ML assessments

## ML Model Features

The model analyzes 17 features:
- Demographics (age, gender, academic status)
- Life circumstances (stress, performance, health, relationships, family)
- Mental health indicators (depression, anxiety, social support)
- Risk factors (self-harm, suicidal thoughts, help-seeking)
- AI interaction preferences

**Output:**
- Binary prediction (0=Low Risk, 1=High Risk)
- Confidence score (0-1)
- Personalized recommendations
- Urgent care flag for crisis situations

## Testing the Complete Flow

1. **Start all services** (ML service, backend, frontend)
2. **Open browser** to `http://localhost:5173`
3. **Navigate to CheckIn** page
4. **Fill out the 5-step form**
5. **Submit and view results** - you should see:
   - ML risk assessment with confidence score
   - Personalized recommendations based on your inputs
   - Traditional clinical assessment
   - Crisis resources (if high risk detected)

## Troubleshooting

**ML Service Issues:**
- Ensure Python dependencies are installed: `pip install -r requirements.txt`
- Check if model files exist: `suicide_risk_model.pkl` and `model_columns.pkl`
- Verify service is running: `curl http://localhost:8000/health`

**Backend Issues:**
- Check MongoDB connection string in `.env`
- Ensure axios is installed: `npm install axios`
- Verify ML service is reachable from backend

**Frontend Issues:**
- Clear browser cache and reload
- Check browser console for errors
- Ensure all services are running on correct ports

## Production Deployment Notes

For production deployment:

1. **Environment Variables:**
   ```bash
   ML_API_URL=https://your-ml-api.com
   MONGODB_URI=your-production-mongodb-connection
   ```

2. **Security:**
   - Add authentication to ML API
   - Use HTTPS for all services
   - Implement rate limiting

3. **Monitoring:**
   - Set up logging for ML predictions
   - Monitor high-risk assessments
   - Track model performance metrics

## Model Information

- **Type:** RandomForestClassifier (scikit-learn)
- **Features:** 17 engineered features from form data
- **Output:** Binary classification with probability scores
- **Training:** Optimized for mental health risk assessment

The model includes comprehensive data preprocessing to handle categorical variables and ensure compatibility with the form data structure.