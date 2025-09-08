import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const { isUltraNarrow } = useIsMobile();
  const [currentStep, setCurrentStep] = useState(1);
  const [guideIntroComplete, setGuideIntroComplete] = useState(false);
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
    { key: "stuck_career", label: t('funnel.painPoint.options.stuck_career') },
    { key: "relationship_struggles", label: t('funnel.painPoint.options.relationship_struggles') },
    { key: "overwhelmed", label: t('funnel.painPoint.options.overwhelmed') },
    { key: "lost_purpose", label: t('funnel.painPoint.options.lost_purpose') },
    { key: "financial_stress", label: t('funnel.painPoint.options.financial_stress') },
    { key: "health_energy", label: t('funnel.painPoint.options.health_energy') }
  ];

  const lifeDomains = [
    { key: "career", label: t('funnel.lifeSatisfaction.domains.career') },
    { key: "relationships", label: t('funnel.lifeSatisfaction.domains.relationships') },
    { key: "health", label: t('funnel.lifeSatisfaction.domains.health') },
    { key: "finances", label: t('funnel.lifeSatisfaction.domains.finances') },
    { key: "personal_growth", label: t('funnel.lifeSatisfaction.domains.personal_growth') },
    { key: "fun", label: t('funnel.lifeSatisfaction.domains.fun') },
    { key: "spirituality", label: t('funnel.lifeSatisfaction.domains.spirituality') }
  ];

  const changeStyleOptions = [
    { key: "understand_why", label: t('funnel.changeStyle.options.understand_why') },
    { key: "tell_me_what", label: t('funnel.changeStyle.options.tell_me_what') },
    { key: "explore_gradually", label: t('funnel.changeStyle.options.explore_gradually') },
    { key: "deep_transformation", label: t('funnel.changeStyle.options.deep_transformation') }
  ];

  const previousAttemptOptions = [
    { key: "therapy", label: t('funnel.previousAttempts.options.therapy') },
    { key: "self_help", label: t('funnel.previousAttempts.options.self_help') },
    { key: "apps", label: t('funnel.previousAttempts.options.apps') },
    { key: "courses", label: t('funnel.previousAttempts.options.courses') },
    { key: "coaching", label: t('funnel.previousAttempts.options.coaching') },
    { key: "nothing", label: t('funnel.previousAttempts.options.nothing') }
  ];

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      setGuideIntroComplete(false); // Reset for next step
    } else {
      onComplete(funnelData);
    }
  }, [currentStep, totalSteps, funnelData, onComplete]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setGuideIntroComplete(false); // Reset for previous step
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
              <h2 className="text-2xl sm:text-3xl font-bold font-cormorant px-2">{t('funnel.painPoint.title')}</h2>
              <p className="text-muted-foreground text-sm sm:text-base px-4">{t('funnel.painPoint.subtitle')}</p>
            </div>
            <div className="grid gap-2 sm:gap-3">
              {painPointOptions.map((option) => (
                <Button
                  key={option.key}
                  variant={funnelData.painPoint === option.key ? "default" : "outline"}
                  className="h-auto p-3 sm:p-4 text-left justify-start text-sm sm:text-base touch-manipulation"
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
              <h2 className="text-2xl sm:text-3xl font-bold font-cormorant px-2">{t('funnel.lifeSatisfaction.title')}</h2>
              <p className="text-muted-foreground text-sm sm:text-base px-4">{t('funnel.lifeSatisfaction.subtitle')}</p>
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
                  <div className={cn(
                    "pb-2",
                    isUltraNarrow 
                      ? "grid grid-cols-5 gap-0.5" 
                      : "flex gap-1 overflow-x-auto scrollbar-hide scroll-smooth"
                  )}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                      <Button
                        key={value}
                        variant={funnelData.lifeSatisfaction[domain.key] === value ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "text-sm touch-manipulation",
                          isUltraNarrow 
                            ? "h-8 w-full p-0 text-xs" 
                            : "h-10 w-10 p-0 flex-shrink-0"
                        )}
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
              <h2 className="text-2xl sm:text-3xl font-bold font-cormorant px-2">{t('funnel.changeStyle.title')}</h2>
              <p className="text-muted-foreground text-sm sm:text-base px-4">{t('funnel.changeStyle.subtitle')}</p>
            </div>
            <div className="grid gap-2 sm:gap-3">
              {changeStyleOptions.map((option) => (
                <Button
                  key={option.key}
                  variant={funnelData.changeStyle === option.key ? "default" : "outline"}
                  className="h-auto p-3 sm:p-4 text-left justify-start text-sm sm:text-base touch-manipulation"
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
              <h2 className="text-2xl sm:text-3xl font-bold font-cormorant px-2">{t('funnel.previousAttempts.title')}</h2>
              <p className="text-muted-foreground text-sm sm:text-base px-4">{t('funnel.previousAttempts.subtitle')}</p>
            </div>
            <div className="grid gap-2 sm:gap-3">
              {previousAttemptOptions.map((option) => (
                <Button
                  key={option.key}
                  variant={funnelData.previousAttempts.includes(option.key) ? "default" : "outline"}
                  className="h-auto p-3 sm:p-4 text-left justify-start text-sm sm:text-base touch-manipulation"
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
              <h2 className="text-2xl sm:text-3xl font-bold font-cormorant px-2">{t('funnel.vision.title')}</h2>
              <p className="text-muted-foreground text-sm sm:text-base px-4">{t('funnel.vision.subtitle')}</p>
            </div>
            <Textarea
              placeholder={t('funnel.vision.placeholder')}
              value={funnelData.vision}
              onChange={(e) => updateFunnelData({ vision: e.target.value })}
              className="min-h-32 text-base"
            />
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                {t('funnel.vision.personalizedRoadmap')}
              </p>
              <div className="flex items-center justify-center gap-2 text-primary">
                <Sparkles className="h-5 w-5" />
                <span className="font-medium">{t('funnel.vision.reportAwaits')}</span>
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
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 flex items-center justify-center p-3 sm:p-4 relative">
      <div className="w-full max-w-2xl mx-auto">
        <Card className="w-full">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-2 px-2 py-1 h-auto">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{t('funnel.back')}</span>
              </Button>
              <span className="text-xs sm:text-sm text-muted-foreground">
                {currentStep} {t('common.of')} {totalSteps}
              </span>
            </div>
            <Progress value={progress} className="w-full h-2" />
          </CardHeader>
          <CardContent className={cn(
            "space-y-4 sm:space-y-6",
            isUltraNarrow ? "px-3" : "px-4 sm:px-6"
          )}>
            <div className={cn(
              "transition-all duration-500 ease-in-out",
              guideIntroComplete ? "opacity-100 pointer-events-auto" : "opacity-30 pointer-events-none"
            )}>
              {renderStep()}
              <div className="flex justify-center pt-4 sm:pt-6">
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid() || !guideIntroComplete}
                  size="lg"
                  className="min-w-32 h-12 text-base touch-manipulation"
                >
                  {currentStep === totalSteps ? t('funnel.getReport') : t('funnel.continue')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
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
        onIntroComplete={() => setGuideIntroComplete(true)}
        guideIntroComplete={guideIntroComplete}
      />
    </div>
  );
};