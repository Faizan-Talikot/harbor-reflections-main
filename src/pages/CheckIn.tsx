import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { API_ENDPOINTS } from "@/config/api";

type FormData = {
  age: string;
  gender: string;
  academicStatus: string;
  stressLevel: string;
  academicPerformance: string;
  healthCondition: string;
  relationshipStatus: string;
  familyProblems: string;
  depressionLevel: string;
  anxietyLevel: string;
  socialSupport: string;
  selfHarmBehaviors: string;
  suicidalThoughts: string;
  mentalHealthHelp: string;
  aiComfortLevel: string;
  aiConcerns: string[];
  aiTrustLevel: string;
};

type MLPrediction = {
  prediction: number;
  riskLevel: string;
  confidenceScore: number;
  recommendations: string[];
  urgentCareNeeded: boolean;
};

const CheckIn = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [mlPrediction, setMlPrediction] = useState<MLPrediction | null>(null);
  const [formData, setFormData] = useState<FormData>({
    age: "",
    gender: "",
    academicStatus: "",
    stressLevel: "",
    academicPerformance: "",
    healthCondition: "",
    relationshipStatus: "",
    familyProblems: "",
    depressionLevel: "",
    anxietyLevel: "",
    socialSupport: "",
    selfHarmBehaviors: "",
    suicidalThoughts: "",
    mentalHealthHelp: "",
    aiComfortLevel: "",
    aiConcerns: [],
    aiTrustLevel: "",
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const handleSelect = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleMultiSelect = (field: keyof FormData, value: string) => {
    if (field === 'aiConcerns') {
      const currentValues = formData.aiConcerns as string[];
      const isSelected = currentValues.includes(value);
      const newValues = isSelected
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      setFormData({ ...formData, [field]: newValues });
    }
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Prepare the data for backend submission
      const submitData = {
        demographics: {
          age: formData.age,
          gender: formData.gender,
          academicStatus: formData.academicStatus
        },
        lifeCircumstances: {
          stressLevel: formData.stressLevel,
          academicPerformance: formData.academicPerformance,
          healthCondition: formData.healthCondition,
          relationshipStatus: formData.relationshipStatus,
          familyProblems: formData.familyProblems
        },
        mentalHealth: {
          depressionLevel: formData.depressionLevel,
          anxietyLevel: formData.anxietyLevel,
          socialSupport: formData.socialSupport
        },
        riskAssessment: {
          selfHarmBehaviors: formData.selfHarmBehaviors,
          suicidalThoughts: formData.suicidalThoughts,
          mentalHealthHelp: formData.mentalHealthHelp
        },
        aiRelated: {
          aiComfortLevel: formData.aiComfortLevel,
          aiConcerns: formData.aiConcerns,
          aiTrustLevel: formData.aiTrustLevel
        }
      };

      // Submit to backend API
      const response = await fetch(API_ENDPOINTS.checkins.create, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization header if user is logged in
          // ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data.checkIn.assessment.riskLevel);
        // Store ML prediction results
        if (data.data.mlPrediction) {
          setMlPrediction(data.data.mlPrediction);
        }
      } else {
        // Handle error
        console.error('Assessment submission failed:', data.message);
        setResult("Error occurred. Please try again.");
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      setResult("Connection error. Please check your internet and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const SelectCard = ({ label, value, field }: { label: string; value: string; field: keyof FormData }) => (
    <Card
      onClick={() => handleSelect(field, value)}
      className={`p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${
        formData[field] === value
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border/50 hover:border-primary/50"
      }`}
    >
      <p className="text-center font-medium text-foreground">{label}</p>
    </Card>
  );

  const RadioCard = ({ label, value, field }: { label: string; value: string; field: keyof FormData }) => (
    <Card
      onClick={() => handleSelect(field, value)}
      className={`p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 flex items-center gap-3 ${
        formData[field] === value
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border/50 hover:border-primary/50"
      }`}
    >
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
        formData[field] === value ? "bg-primary border-primary" : "border-muted-foreground"
      }`}>
        {formData[field] === value && <div className="w-2 h-2 bg-white rounded-full" />}
      </div>
      <p className="font-medium text-foreground">{label}</p>
    </Card>
  );

  const CheckboxCard = ({ label, value, field }: { label: string; value: string; field: keyof FormData }) => {
    const isSelected = field === 'aiConcerns' && (formData.aiConcerns as string[]).includes(value);
    return (
      <Card
        onClick={() => handleMultiSelect(field, value)}
        className={`p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 flex items-center gap-3 ${
          isSelected
            ? "border-primary bg-primary/5 shadow-md"
            : "border-border/50 hover:border-primary/50"
        }`}
      >
        <div className={`w-4 h-4 border-2 ${
          isSelected ? "bg-primary border-primary" : "border-muted-foreground"
        }`} />
        <p className="font-medium text-foreground">{label}</p>
      </Card>
    );
  };

  const ScaleCard = ({ number, field, leftLabel, rightLabel }: { 
    number: number; 
    field: keyof FormData; 
    leftLabel: string; 
    rightLabel: string; 
  }) => (
    <div className="text-center">
      <div className="flex justify-between text-sm text-muted-foreground mb-2">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((num) => (
          <Card
            key={num}
            onClick={() => handleSelect(field, num.toString())}
            className={`w-12 h-12 cursor-pointer flex items-center justify-center transition-all hover:shadow-md ${
              formData[field] === num.toString()
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border/50 hover:border-primary/50"
            }`}
          >
            <span className="font-medium">{num}</span>
          </Card>
        ))}
      </div>
    </div>
  );

  if (result) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="p-8 md:p-12 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
                Thank You for Sharing
              </h2>
              <p className="text-lg text-muted-foreground">Here are your personalized insights</p>
            </div>

            {/* ML Risk Assessment Results */}
            {mlPrediction && (
              <div className="mb-8">
                <div className={`p-6 rounded-lg border-2 mb-6 ${
                  mlPrediction.urgentCareNeeded 
                    ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
                    : mlPrediction.prediction === 1
                    ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800'
                    : 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-heading font-bold text-foreground">Risk Assessment</h3>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{mlPrediction.riskLevel}</p>
                      <p className="text-sm text-muted-foreground">
                        Confidence: {(mlPrediction.confidenceScore * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  
                  {mlPrediction.urgentCareNeeded && (
                    <div className="mb-4 p-4 bg-red-100 dark:bg-red-950/40 rounded-lg">
                      <p className="font-semibold text-red-800 dark:text-red-200 mb-2">
                        🚨 Immediate Attention Recommended
                      </p>
                      <p className="text-red-700 dark:text-red-300 text-sm">
                        Please reach out to a mental health professional or crisis support immediately.
                      </p>
                    </div>
                  )}
                </div>

                {/* Personalized Recommendations */}
                <div className="bg-card rounded-lg p-6 border mb-6">
                  <h3 className="text-xl font-heading font-bold text-foreground mb-4">
                    Personalized Recommendations
                  </h3>
                  <div className="space-y-3">
                    {mlPrediction.recommendations.map((recommendation, index) => (
                      <div className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg">
                        <span className="text-accent font-semibold text-sm">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <p className="text-sm text-muted-foreground flex-1">
                          {recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Traditional Assessment Result */}
            <div className="p-6 rounded-lg bg-accent/20 border-2 border-accent mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-2">Clinical Assessment</h3>
              <p className="text-xl font-heading font-semibold text-foreground">{result}</p>
            </div>

            {/* Crisis Resources */}
            {mlPrediction?.urgentCareNeeded && (
              <div className="mb-8 p-6 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <h3 className="text-lg font-bold text-red-800 dark:text-red-200 mb-4">
                  Immediate Support Resources
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="font-semibold text-red-700 dark:text-red-300">Crisis Text Line</p>
                    <p className="text-red-600 dark:text-red-400">Text HOME to 741741</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-red-700 dark:text-red-300">National Suicide Prevention</p>
                    <p className="text-red-600 dark:text-red-400">Call 988</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="text-center space-y-4 mb-8">
              <h3 className="text-2xl font-heading font-bold text-foreground">Your Next Steps</h3>
              <p className="text-muted-foreground">
                Remember, this reflection is just a starting point. Professional support can make all the difference.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <Button 
                variant={mlPrediction?.urgentCareNeeded ? "default" : "outline"} 
                className="w-full" 
                asChild
              >
                <a href="/resources">Find a Helpline</a>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href="/resources">Talk to a Professional</a>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href="/compass">Read about Self-Care</a>
              </Button>
            </div>

            {/* New Assessment Button */}
            <div className="text-center">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setResult(null);
                  setMlPrediction(null);
                  setStep(1);
                  setFormData({
                    age: "",
                    gender: "",
                    academicStatus: "",
                    stressLevel: "",
                    academicPerformance: "",
                    healthCondition: "",
                    relationshipStatus: "",
                    familyProblems: "",
                    depressionLevel: "",
                    anxietyLevel: "",
                    socialSupport: "",
                    selfHarmBehaviors: "",
                    suicidalThoughts: "",
                    mentalHealthHelp: "",
                    aiComfortLevel: "",
                    aiConcerns: [],
                    aiTrustLevel: ""
                  });
                }}
              >
                Take Another Assessment
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Progress */}
        <div className="mb-8 animate-fade-in">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">Step {step} of {totalSteps}</span>
            <span className="text-sm font-medium text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="p-8 md:p-12 animate-fade-in-up">
          {/* Step 1: Basic Demographics */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
                  Let's start with some basics
                </h2>
                <p className="text-muted-foreground">This helps us understand you better</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Age <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {Array.from({ length: 12 }, (_, i) => (16 + i).toString()).map((age) => (
                    <SelectCard label={age} value={age} field="age" />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Gender <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 gap-3">
                  {["male", "female", "other"].map((gender) => (
                    <RadioCard label={gender} value={gender} field="gender" />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Academic Status <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 gap-3">
                  {["Undergraduate", "PostGraduate", "other"].map((status) => (
                    <RadioCard label={status} value={status} field="academicStatus" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Life Circumstances */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
                  Your current situation
                </h2>
                <p className="text-muted-foreground">Understanding your context helps</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">How would you describe your current stress level? <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 gap-3">
                  {["Low", "Moderate", "High"].map((level) => (
                    <RadioCard key={level} label={level} value={level} field="stressLevel" />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">How would you rate your academic/work performance recently? <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 gap-3">
                  {["Excellent", "Good", "Average", "Poor"].map((perf) => (
                    <RadioCard key={perf} label={perf} value={perf} field="academicPerformance" />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Do you have any ongoing health condition? <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 gap-3">
                  {["Normal", "Fair", "Abnormal"].map((health) => (
                    <RadioCard key={health} label={health} value={health} field="healthCondition" />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Current relationship status <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 gap-3">
                  {["single", "In a relationship", "Breakup", "Complicated", "Other"].map((status) => (
                    <RadioCard key={status} label={status} value={status} field="relationshipStatus" />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Have you experienced any family problems? <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 gap-3">
                  {["None", "Parental conflict", "Financial", "Other"].map((problem) => (
                    <RadioCard key={problem} label={problem} value={problem} field="familyProblems" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Mental Health Status */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
                  How you're feeling
                </h2>
                <p className="text-muted-foreground">Your feelings matter and are valid</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Depression Level <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 gap-3">
                  {["never", "Sometimes", "often", "Always"].map((dep) => (
                    <RadioCard key={dep} label={dep} value={dep} field="depressionLevel" />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Anxiety Level <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 gap-3">
                  {["Never", "Sometimes", "Often", "Always"].map((anx) => (
                    <RadioCard key={anx} label={anx} value={anx} field="anxietyLevel" />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Social support and Coping <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 gap-3">
                  {["Family", "Friends", "loneliness", "None", "Other"].map((support) => (
                    <RadioCard key={support} label={support} value={support} field="socialSupport" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Critical Mental Health Questions */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
                  Important questions
                </h2>
                <p className="text-muted-foreground">These questions help us understand your well-being</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Have you ever engaged in self-harm behaviors? <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 gap-3">
                  {["yes", "no"].map((harm) => (
                    <RadioCard key={harm} label={harm} value={harm} field="selfHarmBehaviors" />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Have you ever had thoughts about ending your own life? <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 gap-3">
                  {["never", "Sometimes", "Often", "Always"].map((thought) => (
                    <RadioCard key={thought} label={thought} value={thought} field="suicidalThoughts" />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Did you seek help for mental health (counselor, helpline, online support, etc.)? <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 gap-3">
                  {["yes", "No"].map((help) => (
                    <RadioCard key={help} label={help} value={help} field="mentalHealthHelp" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: AI-related Questions */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
                  About AI and mental health
                </h2>
                <p className="text-muted-foreground">Help us understand your comfort with AI-based support</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">How comfortable are you with sharing sensitive information with AI-based systems for mental health support? <span className="text-red-500">*</span></label>
                <ScaleCard number={5} field="aiComfortLevel" leftLabel="Very Comfortable" rightLabel="Not at all Comfortable" />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">What concerns would you have regarding sharing mental health data with AI (choose all that apply)? <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 gap-3">
                  {["Privacy", "Data Misuse", "No concerns", "Not sure"].map((concern) => (
                    <CheckboxCard key={concern} label={concern} value={concern} field="aiConcerns" />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Do you trust AI-based systems to assess mental health crisis accurately? <span className="text-red-500">*</span></label>
                <ScaleCard number={5} field="aiTrustLevel" leftLabel="Strongly trust" rightLabel="Do not trust at all" />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            {step < totalSteps ? (
              <Button onClick={handleNext} className="flex items-center gap-2">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isLoading} className="flex items-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "See My Reflection"
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CheckIn;
