
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

    try {
      await onComplete({
        primary_goal: primaryGoal,
        support_style: supportStyle[0],
        time_horizon: timeHorizon
      });
    } catch (error) {
      console.error('GoalSelectionStep: Error during submission:', error);
      setIsSubmitting(false);
    }
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

      <Button 
        onClick={handleSubmit}
        disabled={!isValid}
        className="w-full bg-soul-purple hover:bg-soul-purple/90"
      >
        {isSubmitting ? "Saving..." : "Complete Setup"}
      </Button>
    </div>
  );
}
