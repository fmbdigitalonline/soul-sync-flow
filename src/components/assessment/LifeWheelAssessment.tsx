import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, Target, TrendingUp, Lightbulb } from 'lucide-react';
import { LifeDomain } from '@/types/growth-program';
import { lifeOrchestratorService } from '@/services/life-orchestrator-service';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface DomainAssessment {
  domain: LifeDomain;
  current_score: number;
  desired_score: number;
  importance_rating: number;
  notes?: string;
}

interface LifeWheelAssessmentProps {
  onComplete: (assessments: DomainAssessment[]) => void;
  onCancel?: () => void;
  initialAssessments?: DomainAssessment[];
}

const DOMAIN_CONFIG = {
  wellbeing: { 
    label: 'Overall Wellbeing', 
    description: 'Your general life satisfaction, happiness, and sense of fulfillment',
    icon: '🌟'
  },
  energy: { 
    label: 'Energy & Vitality', 
    description: 'Physical energy, mental clarity, and overall vitality',
    icon: '⚡'
  },
  career: { 
    label: 'Career & Work', 
    description: 'Professional growth, job satisfaction, and career progress',
    icon: '💼'
  },
  relationships: { 
    label: 'Relationships', 
    description: 'Personal relationships, social connections, and family bonds',
    icon: '❤️'
  },
  finances: { 
    label: 'Financial Health', 
    description: 'Financial security, money management, and economic wellbeing',
    icon: '💰'
  },
  health: { 
    label: 'Physical Health', 
    description: 'Physical fitness, nutrition, and overall health',
    icon: '🏃'
  },
  personal_growth: { 
    label: 'Personal Growth', 
    description: 'Learning, self-development, and personal evolution',
    icon: '🌱'
  }
} as const;

export function LifeWheelAssessment({ onComplete, onCancel, initialAssessments }: LifeWheelAssessmentProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [assessments, setAssessments] = useState<DomainAssessment[]>(() => {
    if (initialAssessments) return initialAssessments;
    
    return lifeOrchestratorService.getSuggestedDomains().map(domain => ({
      domain,
      current_score: 5,
      desired_score: 8,
      importance_rating: 5,
      notes: ''
    }));
  });

  const totalSteps = assessments.length;
  const currentAssessment = assessments[currentStep];
  const domainConfig = DOMAIN_CONFIG[currentAssessment?.domain as keyof typeof DOMAIN_CONFIG];

  const updateCurrentAssessment = useCallback((updates: Partial<DomainAssessment>) => {
    setAssessments(prev => prev.map((assessment, index) => 
      index === currentStep ? { ...assessment, ...updates } : assessment
    ));
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save your life wheel assessment.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Save all assessments
      for (const assessment of assessments) {
        await lifeOrchestratorService.updateDomainAssessment(
          user.id,
          assessment.domain,
          assessment.current_score,
          assessment.desired_score,
          assessment.importance_rating,
          assessment.notes
        );
      }

      toast({
        title: "Life Wheel Complete! 🎯",
        description: "Your assessment has been saved. Let's create your personalized growth plan."
      });

      onComplete(assessments);
    } catch (error) {
      console.error('Failed to save assessments:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving your assessment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const calculateGap = (current: number, desired: number) => desired - current;
  const getGapColor = (gap: number) => {
    if (gap <= 1) return 'text-green-600';
    if (gap <= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const progress = ((currentStep + 1) / totalSteps) * 100;

  if (!currentAssessment || !domainConfig) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Step {currentStep + 1} of {totalSteps}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Main Assessment Card */}
      <Card className="border-2">
        <CardHeader className="text-center space-y-2">
          <div className="text-4xl">{domainConfig.icon}</div>
          <CardTitle className="text-2xl">{domainConfig.label}</CardTitle>
          <p className="text-muted-foreground">{domainConfig.description}</p>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Current Score */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                Current Satisfaction Level
              </label>
              <Badge variant="outline" className="text-lg font-bold">
                {currentAssessment.current_score}/10
              </Badge>
            </div>
            <Slider
              value={[currentAssessment.current_score]}
              onValueChange={([value]) => updateCurrentAssessment({ current_score: value })}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Very Unsatisfied</span>
              <span>Completely Satisfied</span>
            </div>
          </div>

          {/* Desired Score */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-medium flex items-center gap-2">
                <Target className="w-4 h-4 text-green-500" />
                Desired Level
              </label>
              <Badge variant="outline" className="text-lg font-bold">
                {currentAssessment.desired_score}/10
              </Badge>
            </div>
            <Slider
              value={[currentAssessment.desired_score]}
              onValueChange={([value]) => updateCurrentAssessment({ desired_score: value })}
              max={10}
              min={currentAssessment.current_score} // Can't desire less than current
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Maintain Current</span>
              <span>Dramatic Improvement</span>
            </div>
          </div>

          {/* Gap Indicator */}
          {calculateGap(currentAssessment.current_score, currentAssessment.desired_score) > 0 && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span className="font-medium">Growth Gap: </span>
                <span className={`font-bold ${getGapColor(calculateGap(currentAssessment.current_score, currentAssessment.desired_score))}`}>
                  +{calculateGap(currentAssessment.current_score, currentAssessment.desired_score)} points
                </span>
              </div>
            </div>
          )}

          {/* Importance Rating */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-medium">
                How important is improving this area?
              </label>
              <Badge variant="secondary">
                {currentAssessment.importance_rating}/10
              </Badge>
            </div>
            <Slider
              value={[currentAssessment.importance_rating]}
              onValueChange={([value]) => updateCurrentAssessment({ importance_rating: value })}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Not Important</span>
              <span>Extremely Important</span>
            </div>
          </div>

          {/* Optional Notes */}
          <div className="space-y-2">
            <label className="font-medium text-sm">
              Additional thoughts? (Optional)
            </label>
            <Textarea
              placeholder="Any specific goals, challenges, or context about this area..."
              value={currentAssessment.notes || ''}
              onChange={(e) => updateCurrentAssessment({ notes: e.target.value })}
              className="min-h-16"
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 0 ? onCancel : handlePrevious}
          disabled={!onCancel && currentStep === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {currentStep === 0 ? 'Cancel' : 'Previous'}
        </Button>

        {currentStep === totalSteps - 1 ? (
          <Button onClick={handleComplete} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
            Complete Assessment
            <Target className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Next Domain
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}