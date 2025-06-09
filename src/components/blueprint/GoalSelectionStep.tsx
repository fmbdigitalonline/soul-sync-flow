
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';

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
  const [timeHorizon, setTimeHorizon] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const goals = [
    { id: 'personal_growth', label: 'Personal Growth & Self-Discovery' },
    { id: 'career_success', label: 'Career Success & Professional Development' },
    { id: 'relationships', label: 'Relationships & Communication' },
    { id: 'health_wellness', label: 'Health & Wellness' },
    { id: 'creativity', label: 'Creativity & Self-Expression' },
    { id: 'spiritual_development', label: 'Spiritual Development' }
  ];

  const timeHorizons = [
    { id: 'immediate', label: 'Next 1-3 months' },
    { id: 'short_term', label: 'Next 3-6 months' },
    { id: 'medium_term', label: 'Next 6-12 months' },
    { id: 'long_term', label: 'Next 1-3 years' }
  ];

  const handleSubmit = async () => {
    if (!primaryGoal || !timeHorizon || isSubmitting) {
      return;
    }

    console.log('GoalSelectionStep: Starting submission with preferences:', {
      primary_goal: primaryGoal,
      support_style: supportStyle[0],
      time_horizon: timeHorizon
    });

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onComplete({
        primary_goal: primaryGoal,
        support_style: supportStyle[0],
        time_horizon: timeHorizon
      });
      
      // If we get here, the submission was successful
      console.log('GoalSelectionStep: Submission completed successfully');
    } catch (error) {
      console.error('GoalSelectionStep: Error during submission:', error);
      
      // Reset the loading state and show error
      setIsSubmitting(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save preferences';
      setSubmitError(errorMessage);
    }
  };

  const handleRetry = () => {
    setSubmitError(null);
    handleSubmit();
  };

  const isValid = primaryGoal && timeHorizon && !isSubmitting;

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 space-y-6">
        {/* Primary Goal Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium">What's your primary focus area?</Label>
          <RadioGroup value={primaryGoal} onValueChange={setPrimaryGoal} disabled={isSubmitting}>
            {goals.map((goal) => (
              <div key={goal.id} className="flex items-center space-x-2">
                <RadioGroupItem value={goal.id} id={goal.id} />
                <Label htmlFor={goal.id} className="text-sm cursor-pointer">
                  {goal.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Support Style */}
        <div className="space-y-3">
          <Label className="text-base font-medium">
            How much guidance do you prefer? ({supportStyle[0]}/5)
          </Label>
          <div className="space-y-2">
            <Slider
              value={supportStyle}
              onValueChange={setSupportStyle}
              max={5}
              min={1}
              step={1}
              className="w-full"
              disabled={isSubmitting}
            />
            <div className="flex justify-between text-xs text-white/60">
              <span>Light touch</span>
              <span>Structured guidance</span>
            </div>
          </div>
        </div>

        {/* Time Horizon */}
        <div className="space-y-3">
          <Label className="text-base font-medium">What's your timeline?</Label>
          <RadioGroup value={timeHorizon} onValueChange={setTimeHorizon} disabled={isSubmitting}>
            {timeHorizons.map((horizon) => (
              <div key={horizon.id} className="flex items-center space-x-2">
                <RadioGroupItem value={horizon.id} id={horizon.id} />
                <Label htmlFor={horizon.id} className="text-sm cursor-pointer">
                  {horizon.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
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
        className="w-full bg-soul-purple hover:bg-soul-purple/90 disabled:opacity-50"
      >
        {isSubmitting ? "Saving..." : "Complete Setup"}
      </Button>
      
      {/* Development debugging info */}
      {import.meta.env.DEV && (
        <div className="text-xs text-gray-400 bg-gray-900/20 p-2 rounded">
          Debug: {JSON.stringify({ primaryGoal, supportStyle: supportStyle[0], timeHorizon, isSubmitting })}
        </div>
      )}
    </div>
  );
}
