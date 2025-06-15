
import React, { useState, useEffect } from "react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Clock, Target, BookOpen } from "lucide-react";
import { LifeArea } from "./LifeAreaSelector";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";
import { useEnhancedAICoach } from "@/hooks/use-enhanced-ai-coach";

interface JourneyStep {
  id: string;
  type: 'prompt' | 'exercise' | 'action' | 'resource' | 'checkin';
  title: string;
  content: string;
  completed: boolean;
}

interface JourneyEngineProps {
  selectedArea: LifeArea;
  onBack: () => void;
}

export const JourneyEngine: React.FC<JourneyEngineProps> = ({ selectedArea, onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<JourneyStep[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const { growthJourney, addReflectionEntry, addInsightEntry } = useJourneyTracking();
  const { sendMessage, isLoading } = useEnhancedAICoach("guide");

  useEffect(() => {
    generatePersonalizedJourney();
  }, [selectedArea]);

  const generatePersonalizedJourney = async () => {
    setIsGenerating(true);
    
    // Get user context for personalization
    const userContext = {
      selectedArea: selectedArea.name,
      recentMoods: growthJourney?.mood_entries?.slice(-3) || [],
      focusAreas: growthJourney?.current_focus_areas || [],
      recentReflections: growthJourney?.reflection_entries?.slice(-2) || []
    };

    console.log('Generating journey for area:', selectedArea.name, 'with context:', userContext);

    try {
      const prompt = `Create a personalized micro-journey for ${selectedArea.name} area of life. Based on my growth patterns, create exactly 5 steps:

1. Deep-Dive Prompt: A reflective question about ${selectedArea.description}
2. Guided Exercise: A practical exercise (breathing, visualization, journaling) 
3. Micro-Challenge: One small real-world action I can take today
4. Resource Pick: A suggestion for further exploration (article topic, book, practice)
5. Check-in Reminder: How to follow up in 2-3 days

Make it personal, actionable, and aligned with inner growth. Format as a structured journey with clear steps.`;

      const response = await sendMessage(prompt);
      
      // For now, create a structured journey - in future this will be AI-generated
      const generatedSteps: JourneyStep[] = [
        {
          id: 'prompt',
          type: 'prompt',
          title: 'Deep Reflection',
          content: `Reflect on your ${selectedArea.name.toLowerCase()}: What would authentic growth look like in this area of your life?`,
          completed: false
        },
        {
          id: 'exercise',
          type: 'exercise', 
          title: 'Guided Practice',
          content: `Take 5 minutes to breathe deeply and visualize your ideal ${selectedArea.name.toLowerCase()} situation. What feelings arise?`,
          completed: false
        },
        {
          id: 'action',
          type: 'action',
          title: 'Micro-Action',
          content: `Choose one small action you can take today to honor your ${selectedArea.name.toLowerCase()} growth.`,
          completed: false
        },
        {
          id: 'resource',
          type: 'resource',
          title: 'Explore Further',
          content: `Consider exploring books, articles, or practices related to ${selectedArea.description.toLowerCase()}.`,
          completed: false
        },
        {
          id: 'checkin',
          type: 'checkin',
          title: 'Follow-up',
          content: `Set a reminder to reflect on your progress in this area in 2-3 days.`,
          completed: false
        }
      ];

      setSteps(generatedSteps);
    } catch (error) {
      console.error('Error generating journey:', error);
      // Fallback to basic steps if AI generation fails
      setSteps([
        {
          id: 'prompt',
          type: 'prompt',
          title: 'Deep Reflection',
          content: `What does growth in your ${selectedArea.name.toLowerCase()} mean to you right now?`,
          completed: false
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const completeStep = (stepIndex: number) => {
    const updatedSteps = [...steps];
    updatedSteps[stepIndex].completed = true;
    setSteps(updatedSteps);

    // Log the completion
    const step = steps[stepIndex];
    if (step.type === 'prompt') {
      addReflectionEntry(step.title, `Completed reflection on ${selectedArea.name}`);
    }

    // Auto-advance to next step
    if (stepIndex < steps.length - 1) {
      setTimeout(() => setCurrentStep(stepIndex + 1), 500);
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'prompt': return BookOpen;
      case 'exercise': return Target;
      case 'action': return CheckCircle2;
      case 'resource': return BookOpen;
      case 'checkin': return Clock;
      default: return BookOpen;
    }
  };

  if (isGenerating) {
    return (
      <CosmicCard className="p-6 text-center">
        <div className="animate-spin h-8 w-8 border-2 border-soul-purple border-t-transparent rounded-full mx-auto mb-4"></div>
        <h3 className="text-lg font-medium mb-2">Creating Your Journey</h3>
        <p className="text-sm text-muted-foreground">
          Personalizing your {selectedArea.name.toLowerCase()} growth experience...
        </p>
      </CosmicCard>
    );
  }

  const currentStepData = steps[currentStep];
  const Icon = currentStepData ? getStepIcon(currentStepData.type) : BookOpen;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Life Areas
        </Button>
        <Badge variant="outline" className="flex items-center gap-1">
          <selectedArea.icon className="h-3 w-3" />
          {selectedArea.name}
        </Badge>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Step {currentStep + 1} of {steps.length}</span>
        <span>{steps.filter(s => s.completed).length} completed</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-soul-purple h-2 rounded-full transition-all duration-500"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Current Step */}
      {currentStepData && (
        <CosmicCard className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 p-3 bg-soul-purple/10 rounded-lg">
              <Icon className="h-6 w-6 text-soul-purple" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium mb-2">{currentStepData.title}</h3>
              <p className="text-muted-foreground mb-4">{currentStepData.content}</p>
              
              {!currentStepData.completed && (
                <Button 
                  onClick={() => completeStep(currentStep)}
                  className="bg-soul-purple hover:bg-soul-purple/90"
                >
                  Complete Step
                </Button>
              )}
              
              {currentStepData.completed && (
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
              )}
            </div>
          </div>
        </CosmicCard>
      )}

      {/* Journey Complete */}
      {steps.length > 0 && steps.every(s => s.completed) && (
        <CosmicCard className="p-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Journey Complete!</h3>
          <p className="text-sm text-muted-foreground mb-4">
            You've completed your {selectedArea.name.toLowerCase()} growth journey. 
            How do you feel about this exploration?
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={onBack}>
              Explore Another Area
            </Button>
            <Button className="bg-soul-purple hover:bg-soul-purple/90">
              Reflect on Progress
            </Button>
          </div>
        </CosmicCard>
      )}
    </div>
  );
};
