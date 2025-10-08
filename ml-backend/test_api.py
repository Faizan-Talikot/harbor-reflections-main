"""
Test script for Harbor Reflections ML API
This script tests the FastAPI ML service with sample data
"""
import requests
import json

# Sample test data matching the CheckIn form structure
test_data = {
    "age": "21-23",
    "gender": "Female",
    "academicStatus": "Undergraduate",
    "stressLevel": "High",
    "academicPerformance": "Average",
    "healthCondition": "Fair",
    "relationshipStatus": "Single",
    "familyProblems": "Sometimes",
    "depressionLevel": "More than half the days",
    "anxietyLevel": "Several days",
    "socialSupport": "Somewhat supportive",
    "selfHarmBehaviors": "Never",
    "suicidalThoughts": "Rarely",
    "mentalHealthHelp": "No, but interested",
    "aiComfortLevel": "Somewhat comfortable",
    "aiConcerns": ["Privacy and data security", "Accuracy of AI responses"],
    "aiTrustLevel": "Moderate"
}

def test_ml_api():
    """Test the ML API with sample data"""
    url = "http://localhost:8000/predict"
    
    try:
        print("Testing ML API...")
        print(f"URL: {url}")
        print(f"Test data: {json.dumps(test_data, indent=2)}")
        
        response = requests.post(url, json=test_data, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ SUCCESS! ML API Response:")
            print(f"Prediction: {result['prediction']}")
            print(f"Risk Level: {result['risk_level']}")
            print(f"Confidence: {result['confidence_score']:.3f}")
            print(f"Urgent Care Needed: {result['urgent_care_needed']}")
            print(f"\nRecommendations:")
            for i, rec in enumerate(result['recommendations'], 1):
                print(f"  {i}. {rec}")
                
        else:
            print(f"❌ ERROR: Status {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure the ML API is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_health_check():
    """Test the health check endpoint"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Health Check: {result}")
        else:
            print(f"❌ Health Check Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health Check Error: {e}")

if __name__ == "__main__":
    print("=" * 50)
    print("Harbor Reflections ML API Test")
    print("=" * 50)
    
    # Test health check first
    test_health_check()
    print()
    
    # Test prediction
    test_ml_api()