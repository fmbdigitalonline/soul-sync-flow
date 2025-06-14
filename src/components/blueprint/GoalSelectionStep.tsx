
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { CheckCircle2 } from 'lucide-react';

interface GoalSelectionStepProps {
  onComplete: (preferences: {
    primary_goal: string;
    support_style: number;
    time_horizon: string;
  }) => void;
}

export function GoalSelectionStep({ onComplete }: GoalSelectionStepProps) {
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [supportStyle, setSupportStyle] = useState([3]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const goals = [
    { id: 'exploring', label: "I'm still exploring and figuring things out" },
    { id: 'personal_growth', label: 'Personal Growth & Self-Discovery' },
    { id: 'career_success', label: 'Career Success & Professional Development' },
    { id: 'relationships', label: 'Relationships & Communication' },
    { id: 'health_wellness', label: 'Health & Wellness' },
    { id: 'creativity', label: 'Creativity & Self-Expression' },
    { id: 'spiritual_development', label: 'Spiritual Development' }
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to save preferences';
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
      1: 'Minimal guidance - I prefer to explore independently',
      2: 'Light guidance - Occasional suggestions and insights',
      3: 'Balanced approach - Regular guidance with flexibility',
      4: 'Active guidance - Structured support and recommendations',
      5: 'Maximum guidance - Comprehensive coaching and direction'
    };
    return descriptions[level as keyof typeof descriptions] || '';
  };

  return (
    <div className="space-y-6 max-w-md mx-auto px-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 space-y-6">
        {/* Primary Goal Selection */}
        <div className="space-y-4">
          <Label className="text-base font-medium text-center block">
            What's your primary focus area?
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
            How much guidance do you prefer?
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
              <span>Light touch</span>
              <span>Structured guidance</span>
            </div>
            {supportStyle[0] && (
              <p className="text-xs text-white/80 text-center px-2">
                {getSupportStyleDescription(supportStyle[0])}
              </p>
            )}
          </div>
        </div>

        {/* Selection Summary */}
        {primaryGoal && (
          <div className="bg-white/5 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium text-soul-purple">Your Selections:</h4>
            <div className="text-xs space-y-1">
              <p><span className="text-white/60">Focus:</span> {selectedGoalLabel}</p>
              <p><span className="text-white/60">Guidance Level:</span> {supportStyle[0]}/5</p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {submitError && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4 space-y-3">
          <div className="text-red-300 text-sm">
            <strong>Error:</strong> {submitError}
          </div>
          <Button 
            onClick={handleRetry}
            variant="outline"
            className="w-full border-red-500/50 text-red-300 hover:bg-red-900/30"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Submit Button */}
      <Button 
        onClick={handleSubmit}
        disabled={!isValid}
        className="w-full bg-soul-purple hover:bg-soul-purple/90 disabled:opacity-50 py-3 text-base font-medium"
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Saving...
          </div>
        ) : (
          "Complete Setup"
        )}
      </Button>
    </div>
  );
}
