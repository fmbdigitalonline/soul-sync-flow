
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, Sparkles } from 'lucide-react';

interface PersonalityTestStepperProps {
  onComplete: (testResults: any) => void;
  onSkip: () => void;
}

export const PersonalityTestStepper: React.FC<PersonalityTestStepperProps> = ({
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [testResults, setTestResults] = useState<any>({});

  const steps = [
    { title: 'MBTI Assessment', description: 'Discover your personality type' },
    { title: 'Human Design', description: 'Explore your energy strategy' },
    { title: 'Astrology Basics', description: 'Connect with celestial influences' }
  ];

  const handleStepComplete = (stepData: any) => {
    const updatedResults = { ...testResults, ...stepData };
    setTestResults(updatedResults);

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete(updatedResults);
    }
  };

  const handleQuickComplete = () => {
    // Provide sample data for quick testing
    const sampleResults = {
      mbti: 'ENFP',
      humanDesign: {
        gates: [1, 15, 31, 43],
        type: 'Generator'
      },
      astrology: {
        sunSign: 'Leo',
        moonSign: 'Gemini',
        ascendant: 'Libra'
      },
      numerology: {
        lifePath: 7
      }
    };
    onComplete(sampleResults);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <Sparkles className="h-8 w-8 text-soul-purple" />
        </div>
        <CardTitle className="text-2xl">Personality Assessment</CardTitle>
        <p className="text-muted-foreground">
          Complete these quick assessments to create your personalized blueprint
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <Progress value={((currentStep + 1) / steps.length) * 100} />
        </div>

        {/* Current Step */}
        <div className="bg-gradient-to-r from-soul-purple/10 to-soul-teal/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">{steps[currentStep].title}</h3>
          <p className="text-muted-foreground mb-4">{steps[currentStep].description}</p>
          
          {/* Mock assessment content */}
          <div className="space-y-3">
            <p className="text-sm">
              This is a simplified version. In a full implementation, this would contain
              actual personality assessment questions.
            </p>
            <Button 
              onClick={() => handleStepComplete({ [steps[currentStep].title.toLowerCase()]: 'sample-data' })}
              className="w-full"
            >
              Complete {steps[currentStep].title}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onSkip}
            className="flex-1"
          >
            Skip Assessment
          </Button>
          <Button 
            onClick={handleQuickComplete}
            className="flex-1"
          >
            Quick Demo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
