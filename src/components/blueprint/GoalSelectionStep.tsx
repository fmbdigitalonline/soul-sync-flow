
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface GoalSelectionStepProps {
  onComplete: (preferences: {
    primary_goal: string;
    support_style: number;
    time_horizon: string;
  }) => void;
  onBack?: () => void;
}

export function GoalSelectionStep({ onComplete, onBack }: GoalSelectionStepProps) {
  const { t } = useLanguage();
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [supportStyle, setSupportStyle] = useState([3]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const goals = [
    { id: 'exploring', label: t('goals.exploring') },
    { id: 'personal_growth', label: t('goals.personalGrowth') },
    { id: 'career_success', label: t('goals.careerSuccess') },
    { id: 'relationships', label: t('goals.relationships') },
    { id: 'health_wellness', label: t('goals.healthWellness') },
    { id: 'creativity', label: t('goals.creativity') },
    { id: 'spiritual_development', label: t('goals.spiritualDevelopment') }
  ];

  const handleSubmit = async () => {
    if (!primaryGoal || isSubmitting) {
      return;
    }

    console.log('GoalSelectionStep: Starting submission with preferences:', {
      primary_goal: primaryGoal,
      support_style: supportStyle[0],
      time_horizon: 'flexible' // Default since we removed time selection
    });

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onComplete({
        primary_goal: primaryGoal,
        support_style: supportStyle[0],
        time_horizon: 'flexible' // Default value
      });
      
      console.log('GoalSelectionStep: Submission completed successfully');
    } catch (error) {
      console.error('GoalSelectionStep: Error during submission:', error);
      
      setIsSubmitting(false);
      const errorMessage = error instanceof Error ? error.message : t('goals.errorSaving');
      setSubmitError(errorMessage);
    }
  };

  const handleRetry = () => {
    setSubmitError(null);
    handleSubmit();
  };

  const isValid = primaryGoal && !isSubmitting;

  // Get selected goal label for display
  const selectedGoalLabel = goals.find(goal => goal.id === primaryGoal)?.label;

  // Get support style description
  const getSupportStyleDescription = (level: number) => {
    const descriptions = {
      1: t('goals.guidance1'),
      2: t('goals.guidance2'),
      3: t('goals.guidance3'),
      4: t('goals.guidance4'),
      5: t('goals.guidance5')
    };
    return descriptions[level as keyof typeof descriptions] || '';
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Back Button */}
      {onBack && (
        <div className="p-4 border-b border-border">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('back')}
          </Button>
        </div>
      )}

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        <div className="space-y-6 max-w-md mx-auto">
          <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border space-y-6">
            {/* Primary Goal Selection */}
            <div className="space-y-4">
              <Label className="text-base font-cormorant font-medium text-center block">
                {t('goals.primaryFocus')}
              </Label>
              <RadioGroup value={primaryGoal} onValueChange={setPrimaryGoal} disabled={isSubmitting}>
                <div className="space-y-3">
                  {goals.map((goal) => (
                    <div key={goal.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value={goal.id} id={goal.id} className="mt-1 flex-shrink-0" />
                      <Label 
                        htmlFor={goal.id} 
                        className="text-sm font-inter cursor-pointer leading-relaxed flex-1"
                      >
                        {goal.label}
                      </Label>
                      {primaryGoal === goal.id && (
                        <CheckCircle2 className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Support Style */}
            <div className="space-y-4">
              <Label className="text-base font-cormorant font-medium text-center block">
                {t('goals.guidanceLevel')}
              </Label>
              <div className="space-y-3">
                <div className="text-center">
                  <span className="text-lg font-cormorant font-medium text-primary">
                    {supportStyle[0]}/5
                  </span>
                </div>
                <Slider
                  value={supportStyle}
                  onValueChange={setSupportStyle}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                  disabled={isSubmitting}
                />
                <div className="flex justify-between text-xs font-inter text-muted-foreground px-1">
                  <span>{t('goals.lightTouch')}</span>
                  <span>{t('goals.structuredGuidance')}</span>
                </div>
                {supportStyle[0] && (
                  <p className="text-xs font-inter text-muted-foreground text-center px-2">
                    {getSupportStyleDescription(supportStyle[0])}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Selection Summary */}
          {primaryGoal && (
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-cormorant font-medium text-primary">{t('goals.yourSelections')}</h4>
              <div className="text-xs font-inter space-y-1">
                <p><span className="text-muted-foreground">{t('goals.focus')}</span> {selectedGoalLabel}</p>
                <p><span className="text-muted-foreground">{t('goals.guidanceLevelLabel')}</span> {supportStyle[0]}/5</p>
              </div>
            </div>
          )}

          {/* Submit Button - Now positioned right after the summary */}
          <Button 
            onClick={handleSubmit}
            disabled={!isValid}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 py-3 text-base font-cormorant font-medium"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                {t('goals.saving')}
              </div>
            ) : (
              t('goals.completeSetup')
            )}
          </Button>

          {/* Error Message */}
          {submitError && (
            <div className="bg-destructive/10 border border-destructive/50 rounded-xl p-4 space-y-3">
              <div className="text-destructive text-sm font-inter">
                <strong>{t('error')}:</strong> {submitError}
              </div>
              <Button 
                onClick={handleRetry}
                variant="outline"
                className="w-full border-destructive/50 text-destructive hover:bg-destructive/10 font-cormorant"
              >
                {t('goals.tryAgain')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
