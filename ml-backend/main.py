from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import joblib
import pandas as pd
import numpy as np
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Harbor Reflections ML API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model and columns
model = None
model_columns = None

class CheckInData(BaseModel):
    age: str
    gender: str
    academicStatus: str
    stressLevel: str
    academicPerformance: str
    healthCondition: str
    relationshipStatus: str
    familyProblems: str
    depressionLevel: str
    anxietyLevel: str
    socialSupport: str
    selfHarmBehaviors: str
    suicidalThoughts: str
    mentalHealthHelp: str
    aiComfortLevel: str
    aiConcerns: List[str]
    aiTrustLevel: str

class PredictionResponse(BaseModel):
    prediction: int
    risk_level: str
    confidence_score: float
    recommendations: List[str]
    urgent_care_needed: bool

def load_model():
    """Load the trained model and column information"""
    global model, model_columns
    
    try:
        # Load the model
        model_path = os.path.join(os.path.dirname(__file__), "suicide_risk_model.pkl")
        model = joblib.load(model_path)
        logger.info("Model loaded successfully")
        
        # Load the model columns
        columns_path = os.path.join(os.path.dirname(__file__), "model_columns.pkl")
        model_columns = joblib.load(columns_path)
        logger.info(f"Model columns loaded: {len(model_columns)} features")
        
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load model: {str(e)}")

def preprocess_data(data: CheckInData) -> pd.DataFrame:
    """
    Convert CheckIn form data to the format expected by the ML model
    This function performs the exact same preprocessing steps as during training
    """
    
    # Convert to dictionary first
    data_dict = data.dict()
    
    # Handle aiConcerns array - convert to individual boolean columns
    ai_concerns = data_dict.pop('aiConcerns', [])
    
    # Create base dataframe
    df = pd.DataFrame([data_dict])
    
    # Map categorical values to numerical if needed
    # Age mapping
    age_mapping = {
        "15-17": 0, "18-20": 1, "21-23": 2, "24-26": 3, "27-30": 4, "30+": 5
    }
    
    # Gender mapping  
    gender_mapping = {
        "Male": 0, "Female": 1, "Non-binary": 2, "Prefer not to say": 3
    }
    
    # Academic status mapping
    academic_status_mapping = {
        "High School": 0, "Undergraduate": 1, "Graduate": 2, "Working Professional": 3
    }
    
    # Stress level mapping
    stress_mapping = {
        "Very Low": 0, "Low": 1, "Moderate": 2, "High": 3, "Very High": 4
    }
    
    # Academic performance mapping
    performance_mapping = {
        "Excellent": 0, "Good": 1, "Average": 2, "Below Average": 3, "Poor": 4
    }
    
    # Health condition mapping
    health_mapping = {
        "Excellent": 0, "Good": 1, "Fair": 2, "Poor": 3
    }
    
    # Relationship status mapping
    relationship_mapping = {
        "Single": 0, "In a relationship": 1, "Married": 2, "Divorced": 3, "It's complicated": 4
    }
    
    # Family problems mapping
    family_mapping = {
        "Never": 0, "Rarely": 1, "Sometimes": 2, "Often": 3, "Always": 4
    }
    
    # Depression/Anxiety level mapping
    mental_health_mapping = {
        "Not at all": 0, "Several days": 1, "More than half the days": 2, 
        "Nearly every day": 3, "I don't know": 2
    }
    
    # Social support mapping
    support_mapping = {
        "Very supportive": 0, "Somewhat supportive": 1, "Neutral": 2, 
        "Not very supportive": 3, "No support": 4
    }
    
    # Self harm behaviors mapping
    harm_mapping = {
        "Never": 0, "Rarely": 1, "Sometimes": 2, "Often": 3, "Always": 4
    }
    
    # Suicidal thoughts mapping
    suicide_mapping = {
        "Never": 0, "Rarely": 1, "Sometimes": 2, "Often": 3, "Always": 4
    }
    
    # Mental health help mapping
    help_mapping = {
        "Yes, currently receiving": 0, "Yes, previously received": 1, 
        "No, but interested": 2, "No, not interested": 3
    }
    
    # AI comfort/trust mapping
    ai_mapping = {
        "Very comfortable": 0, "Somewhat comfortable": 1, "Neutral": 2,
        "Somewhat uncomfortable": 3, "Very uncomfortable": 4,
        "Very high": 0, "High": 1, "Moderate": 2, "Low": 3, "Very low": 4
    }
    
    # Apply mappings
    df['age'] = df['age'].map(age_mapping).fillna(df['age'])
    df['gender'] = df['gender'].map(gender_mapping).fillna(df['gender'])
    df['academicStatus'] = df['academicStatus'].map(academic_status_mapping).fillna(df['academicStatus'])
    df['stressLevel'] = df['stressLevel'].map(stress_mapping).fillna(df['stressLevel'])
    df['academicPerformance'] = df['academicPerformance'].map(performance_mapping).fillna(df['academicPerformance'])
    df['healthCondition'] = df['healthCondition'].map(health_mapping).fillna(df['healthCondition'])
    df['relationshipStatus'] = df['relationshipStatus'].map(relationship_mapping).fillna(df['relationshipStatus'])
    df['familyProblems'] = df['familyProblems'].map(family_mapping).fillna(df['familyProblems'])
    df['depressionLevel'] = df['depressionLevel'].map(mental_health_mapping).fillna(df['depressionLevel'])
    df['anxietyLevel'] = df['anxietyLevel'].map(mental_health_mapping).fillna(df['anxietyLevel'])
    df['socialSupport'] = df['socialSupport'].map(support_mapping).fillna(df['socialSupport'])
    df['selfHarmBehaviors'] = df['selfHarmBehaviors'].map(harm_mapping).fillna(df['selfHarmBehaviors'])
    df['suicidalThoughts'] = df['suicidalThoughts'].map(suicide_mapping).fillna(df['suicidalThoughts'])
    df['mentalHealthHelp'] = df['mentalHealthHelp'].map(help_mapping).fillna(df['mentalHealthHelp'])
    df['aiComfortLevel'] = df['aiComfortLevel'].map(ai_mapping).fillna(df['aiComfortLevel'])
    df['aiTrustLevel'] = df['aiTrustLevel'].map(ai_mapping).fillna(df['aiTrustLevel'])
    
    # Handle AI concerns as separate boolean columns
    possible_concerns = [
        "Privacy and data security",
        "Accuracy of AI responses", 
        "Lack of human empathy",
        "Potential bias in AI",
        "Over-reliance on technology",
        "Technical issues or glitches",
        "None of the above"
    ]
    
    for concern in possible_concerns:
        column_name = f"aiConcerns_{concern.replace(' ', '_').replace('-', '_').lower()}"
        df[column_name] = 1 if concern in ai_concerns else 0
    
    # Ensure all model columns are present
    for col in model_columns:
        if col not in df.columns:
            df[col] = 0
    
    # Select only the columns that the model expects, in the correct order
    df = df[model_columns]
    
    return df

def get_recommendations(prediction: int, confidence: float, data: CheckInData) -> tuple:
    """
    Generate personalized recommendations based on the prediction and input data
    """
    recommendations = []
    urgent_care = False
    
    if prediction == 1:  # High risk
        urgent_care = True
        recommendations.extend([
            "🚨 Immediate support is recommended. Please reach out to a mental health professional.",
            "📞 Consider contacting a crisis helpline: National Suicide Prevention Lifeline 988",
            "👥 Connect with trusted friends, family members, or counselors immediately",
            "🏥 If you're having thoughts of self-harm, please visit your nearest emergency room"
        ])
    
    # Additional recommendations based on specific responses
    if data.stressLevel in ["High", "Very High"]:
        recommendations.append("🧘 Try stress management techniques like deep breathing, meditation, or yoga")
    
    if data.socialSupport in ["Not very supportive", "No support"]:
        recommendations.append("🤝 Consider joining support groups or community activities to build connections")
    
    if data.academicPerformance in ["Below Average", "Poor"]:
        recommendations.append("📚 Reach out to academic advisors or tutoring services for educational support")
    
    if data.mentalHealthHelp == "No, not interested":
        recommendations.append("💭 Consider exploring different types of mental health resources that might feel more comfortable")
    
    if data.depressionLevel in ["More than half the days", "Nearly every day"]:
        recommendations.append("🌟 Daily mood tracking and regular check-ins with a counselor may be helpful")
    
    # Always include positive recommendations
    recommendations.extend([
        "🌱 Practice self-care activities that bring you joy and peace",
        "💪 Maintain regular physical activity and healthy sleep patterns",
        "📝 Consider journaling to process your thoughts and feelings"
    ])
    
    return recommendations, urgent_care

@app.on_event("startup")
async def startup_event():
    """Load the model when the server starts"""
    load_model()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "model_loaded": model is not None}

@app.post("/predict", response_model=PredictionResponse)
async def predict_risk(data: CheckInData):
    """
    Predict suicide risk based on CheckIn form data
    """
    try:
        if model is None or model_columns is None:
            raise HTTPException(status_code=500, detail="Model not loaded")
        
        # Preprocess the data
        df = preprocess_data(data)
        logger.info(f"Preprocessed data shape: {df.shape}")
        
        # Make prediction
        prediction = model.predict(df)[0]
        probabilities = model.predict_proba(df)[0]
        confidence_score = float(np.max(probabilities))
        
        # Determine risk level
        risk_levels = {0: "Low Risk", 1: "High Risk"}
        risk_level = risk_levels.get(prediction, "Unknown")
        
        # Generate recommendations
        recommendations, urgent_care = get_recommendations(prediction, confidence_score, data)
        
        logger.info(f"Prediction: {prediction}, Risk Level: {risk_level}, Confidence: {confidence_score:.3f}")
        
        return PredictionResponse(
            prediction=int(prediction),
            risk_level=risk_level,
            confidence_score=confidence_score,
            recommendations=recommendations,
            urgent_care_needed=urgent_care
        )
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/model-info")
async def get_model_info():
    """Get information about the loaded model"""
    if model is None or model_columns is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    return {
        "model_type": str(type(model).__name__),
        "n_features": len(model_columns),
        "feature_names": model_columns,
        "classes": getattr(model, 'classes_', None)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)