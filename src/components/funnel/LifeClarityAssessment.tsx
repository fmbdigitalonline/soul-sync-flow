import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { LifeClarityGuide } from "./LifeClarityGuide";

interface FunnelData {
  painPoint: string;
  lifeSatisfaction: Record<string, number>;
  changeStyle: string;
  previousAttempts: string[];
  vision: string;
}

interface LifeClarityAssessmentProps {
  onComplete: (data: FunnelData) => void;
}

export const LifeClarityAssessment: React.FC<LifeClarityAssessmentProps> = ({ onComplete }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [funnelData, setFunnelData] = useState<FunnelData>({
    painPoint: "",
    lifeSatisfaction: {},
    changeStyle: "",
    previousAttempts: [],
    vision: ""
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const painPointOptions = [
    { key: "stuck_career", label: "Feeling stuck in my career path" },
    { key: "relationship_struggles", label: "Struggling with relationships" },
    { key: "overwhelmed", label: "Feeling overwhelmed by everything" },
    { key: "lost_purpose", label: "Lost my sense of purpose" },
    { key: "financial_stress", label: "Constant financial stress" },
    { key: "health_energy", label: "Health and energy issues" }
  ];

  const lifeDomains = [
    { key: "career", label: "Career & Work" },
    { key: "relationships", label: "Relationships" },
    { key: "health", label: "Physical Health" },
    { key: "finances", label: "Money & Finances" },
    { key: "personal_growth", label: "Personal Growth" },
    { key: "fun", label: "Fun & Recreation" },
    { key: "spirituality", label: "Spirituality & Purpose" }
  ];

  const changeStyleOptions = [
    { key: "understand_why", label: "I need to understand WHY first" },
    { key: "tell_me_what", label: "Just tell me what to do" },
    { key: "explore_gradually", label: "I want to explore gradually" },
    { key: "deep_transformation", label: "I'm ready for deep transformation" }
  ];

  const previousAttemptOptions = [
    { key: "therapy", label: "Therapy or counseling" },
    { key: "self_help", label: "Self-help books" },
    { key: "apps", label: "Apps and digital tools" },
    { key: "courses", label: "Online courses" },
    { key: "coaching", label: "Life coaching" },
    { key: "nothing", label: "This is my first attempt" }
  ];

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete(funnelData);
    }
  }, [currentStep, totalSteps, funnelData, onComplete]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigate("/");
    }
  }, [currentStep, navigate]);

  const updateFunnelData = useCallback((updates: Partial<FunnelData>) => {
    setFunnelData(prev => ({ ...prev, ...updates }));
  }, []);

  const handleSatisfactionChange = useCallback((domain: string, value: number) => {
    updateFunnelData({
      lifeSatisfaction: { ...funnelData.lifeSatisfaction, [domain]: value }
    });
  }, [funnelData.lifeSatisfaction, updateFunnelData]);

  const togglePreviousAttempt = useCallback((attempt: string) => {
    const current = funnelData.previousAttempts;
    const updated = current.includes(attempt)
      ? current.filter(a => a !== attempt)
      : [...current, attempt];
    updateFunnelData({ previousAttempts: updated });
  }, [funnelData.previousAttempts, updateFunnelData]);

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return !!funnelData.painPoint;
      case 2: return Object.keys(funnelData.lifeSatisfaction).length >= 3;
      case 3: return !!funnelData.changeStyle;
      case 4: return funnelData.previousAttempts.length > 0;
      case 5: return funnelData.vision.trim().length > 10;
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold font-cormorant">What's your biggest frustration right now?</h2>
              <p className="text-muted-foreground">Understanding your main challenge helps us personalize your experience</p>
            </div>
            <div className="grid gap-3">
              {painPointOptions.map((option) => (
                <Button
                  key={option.key}
                  variant={funnelData.painPoint === option.key ? "default" : "outline"}
                  className="h-auto p-4 text-left justify-start"
                  onClick={() => updateFunnelData({ painPoint: option.key })}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold font-cormorant">Life Satisfaction Quick Scan</h2>
              <p className="text-muted-foreground">Rate your current satisfaction in these key areas (1-10)</p>
            </div>
            <div className="space-y-4">
              {lifeDomains.map((domain) => (
                <div key={domain.key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="font-medium">{domain.label}</label>
                    <span className="text-sm text-muted-foreground">
                      {funnelData.lifeSatisfaction[domain.key] || 0}/10
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                      <Button
                        key={value}
                        variant={funnelData.lifeSatisfaction[domain.key] === value ? "default" : "outline"}
                        size="sm"
                        className="h-8 w-8 p-0 text-xs"
                        onClick={() => handleSatisfactionChange(domain.key, value)}
                      >
                        {value}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold font-cormorant">What's your approach to change?</h2>
              <p className="text-muted-foreground">Everyone transforms differently - what resonates with you?</p>
            </div>
            <div className="grid gap-3">
              {changeStyleOptions.map((option) => (
                <Button
                  key={option.key}
                  variant={funnelData.changeStyle === option.key ? "default" : "outline"}
                  className="h-auto p-4 text-left justify-start"
                  onClick={() => updateFunnelData({ changeStyle: option.key })}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold font-cormorant">What have you tried before?</h2>
              <p className="text-muted-foreground">Select all that apply - this helps us understand your journey</p>
            </div>
            <div className="grid gap-3">
              {previousAttemptOptions.map((option) => (
                <Button
                  key={option.key}
                  variant={funnelData.previousAttempts.includes(option.key) ? "default" : "outline"}
                  className="h-auto p-4 text-left justify-start"
                  onClick={() => togglePreviousAttempt(option.key)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold font-cormorant">Envision your transformation</h2>
              <p className="text-muted-foreground">If everything clicked into place, what would that look like?</p>
            </div>
            <Textarea
              placeholder="Describe your vision of an ideal life where everything is working..."
              value={funnelData.vision}
              onChange={(e) => updateFunnelData({ vision: e.target.value })}
              className="min-h-32"
            />
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                {t('funnel.personalizedRoadmap')}
              </p>
              <div className="flex items-center justify-center gap-2 text-primary">
                <Sparkles className="h-5 w-5" />
                <span className="font-medium">{t('funnel.reportAwaits')}</span>
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 flex items-center justify-center p-4 relative">
      <div className="w-full max-w-2xl">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('funnel.back')}
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentStep} of {totalSteps}
              </span>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>
          <CardContent className="space-y-6">
            {renderStep()}
            <div className="flex justify-center pt-6">
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                size="lg"
                className="min-w-32"
              >
                {currentStep === totalSteps ? "Get My Report" : "Continue"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Life Clarity Guide */}
      <LifeClarityGuide
        currentStep={currentStep}
        totalSteps={totalSteps}
        funnelData={funnelData}
        isStepValid={isStepValid()}
      />
    </div>
  );
};