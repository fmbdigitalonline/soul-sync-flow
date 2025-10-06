
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
    <div className="h-screen flex flex-col bg-soul-black overflow-hidden">
      {/* Back Button */}
      {onBack && (
        <div className="p-4 border-b border-white/10">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('back')}
          </Button>
        </div>
      )}

      {/* Scrollable Content Area */}
      <div 
        className="flex-1 overflow-y-auto overscroll-contain touch-pan-y px-4 pt-4 pb-24 min-h-0"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="space-y-6 max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 space-y-6">
            {/* Primary Goal Selection */}
            <div className="space-y-4">
              <Label className="text-base font-medium text-center block">
                {t('goals.primaryFocus')}
              </Label>
              <RadioGroup value={primaryGoal} onValueChange={setPrimaryGoal} disabled={isSubmitting}>
                <div className="space-y-3">
                  {goals.map((goal) => (
                    <div key={goal.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <RadioGroupItem value={goal.id} id={goal.id} className="mt-1 flex-shrink-0" />
                      <Label 
                        htmlFor={goal.id} 
                        className="text-sm cursor-pointer leading-relaxed flex-1"
                      >
                        {goal.label}
                      </Label>
                      {primaryGoal === goal.id && (
                        <CheckCircle2 className="w-4 h-4 text-soul-purple mt-1 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Support Style */}
            <div className="space-y-4">
              <Label className="text-base font-medium text-center block">
                {t('goals.guidanceLevel')}
              </Label>
              <div className="space-y-3">
                <div className="text-center">
                  <span className="text-lg font-medium text-soul-purple">
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
                <div className="flex justify-between text-xs text-white/60 px-1">
                  <span>{t('goals.lightTouch')}</span>
                  <span>{t('goals.structuredGuidance')}</span>
                </div>
                {supportStyle[0] && (
                  <p className="text-xs text-white/80 text-center px-2">
                    {getSupportStyleDescription(supportStyle[0])}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Selection Summary */}
          {primaryGoal && (
            <div className="bg-white/5 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-medium text-soul-purple">{t('goals.yourSelections')}</h4>
              <div className="text-xs space-y-1">
                <p><span className="text-white/60">{t('goals.focus')}</span> {selectedGoalLabel}</p>
                <p><span className="text-white/60">{t('goals.guidanceLevelLabel')}</span> {supportStyle[0]}/5</p>
              </div>
            </div>
          )}

          {/* Submit Button - Now positioned right after the summary */}
          <Button 
            onClick={handleSubmit}
            disabled={!isValid}
            className="w-full bg-soul-purple hover:bg-soul-purple/90 disabled:opacity-50 py-3 text-base font-medium"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t('goals.saving')}
              </div>
            ) : (
              t('goals.completeSetup')
            )}
          </Button>

          {/* Error Message */}
          {submitError && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4 space-y-3">
              <div className="text-red-300 text-sm">
                <strong>{t('error')}:</strong> {submitError}
              </div>
              <Button 
                onClick={handleRetry}
                variant="outline"
                className="w-full border-red-500/50 text-red-300 hover:bg-red-900/30"
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
