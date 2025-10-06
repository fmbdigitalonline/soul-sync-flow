import React, { useState, useEffect } from "react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Clock, Target, BookOpen, Brain, Heart, Sparkles } from "lucide-react";
import { LifeArea } from "./LifeAreaSelector";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";
import { useAICoach } from "@/hooks/use-ai-coach";
import { useBlueprintData } from "@/hooks/use-blueprint-data";
import { extractAndParseJSON } from "@/utils/json-extraction";

interface JourneyStep {
  id: string;
  type: 'reflection' | 'integration' | 'somatic' | 'insight' | 'action' | 'pattern';
  title: string;
  content: string;
  depth: 'surface' | 'pattern' | 'integration';
  completed: boolean;
  userResponse?: string;
  aiGuidance?: string;
}

interface JourneyEngineProps {
  selectedArea: LifeArea;
  onBack: () => void;
}

export const JourneyEngine: React.FC<JourneyEngineProps> = ({ selectedArea, onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<JourneyStep[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [userResponse, setUserResponse] = useState("");
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);
  
  const { growthJourney, addReflectionEntry, addInsightEntry } = useJourneyTracking();
  const { sendMessage, isLoading, messages } = useAICoach();
  const { blueprintData } = useBlueprintData();

  useEffect(() => {
    generatePersonalizedJourney();
  }, [selectedArea]);

  const generatePersonalizedJourney = async () => {
    setIsGenerating(true);
    
    // Compile rich user context for AI personalization
    const userContext = {
      selectedArea: selectedArea.name,
      areaDescription: selectedArea.description,
      recentMoods: growthJourney?.mood_entries?.slice(-3) || [],
      focusAreas: growthJourney?.current_focus_area ? [growthJourney.current_focus_area] : [],
      recentReflections: growthJourney?.reflection_entries?.slice(-2) || [],
      insightPatterns: growthJourney?.insight_entries?.slice(-3) || [],
      blueprintSummary: blueprintData ? {
        cognitiveStyle: blueprintData.cognition_mbti?.type,
        energyType: blueprintData.energy_strategy_human_design?.type,
        authority: blueprintData.energy_strategy_human_design?.authority,
        lifeThemes: blueprintData.values_life_path?.life_themes,
        coreBeliefs: blueprintData.bashar_suite?.core_beliefs
      } : null
    };

    console.log('Generating AI-personalized journey for:', selectedArea.name, 'with context:', userContext);

    try {
      const prompt = `Create a deeply personalized 5-step psychological growth journey for my ${selectedArea.name} life area. Use my unique blueprint and patterns to create meaningful transformation:

MY CONTEXT:
- Life Area: ${selectedArea.name} (${selectedArea.description})
- Recent Moods: ${userContext.recentMoods.map(m => m.mood || 'Unknown').join(', ') || 'Not tracked'}
- Current Focus: ${userContext.focusAreas.join(', ') || 'Open exploration'}
- Cognitive Style: ${userContext.blueprintSummary?.cognitiveStyle || 'Unknown'}
- Energy Type: ${userContext.blueprintSummary?.energyType || 'Unknown'}
- Decision Authority: ${userContext.blueprintSummary?.authority || 'Unknown'}

CREATE EXACTLY 5 STEPS with progressive depth:

1. SURFACE REFLECTION: A powerful opening question that connects to my ${selectedArea.name} experience and current patterns
2. PATTERN RECOGNITION: Help me see deeper patterns and connections in this area, referencing my cognitive style
3. SOMATIC INTEGRATION: A body-based or experiential exercise aligned with my energy type and current state
4. INSIGHT SYNTHESIS: Guide me to synthesize understanding and connect to my core values/beliefs
5. INTEGRATION ACTION: One meaningful action that honors my decision authority and creates real change

Make each step personally relevant to my blueprint. Use my actual cognitive style (${userContext.blueprintSummary?.cognitiveStyle}) and energy type (${userContext.blueprintSummary?.energyType}) to tailor the approach.

Format as JSON with this structure:
{
  "steps": [
    {
      "type": "reflection|integration|somatic|insight|action",
      "depth": "surface|pattern|integration", 
      "title": "Step Title",
      "content": "Personalized content that speaks directly to my patterns and blueprint"
    }
  ]
}`;

      // Send the message and wait for response
      await sendMessage(prompt);
      
      // Get the latest AI response from messages
      const latestMessage = messages[messages.length - 1];
      const aiResponse = latestMessage?.sender === 'assistant' ? latestMessage.content : '';
      
      // Try to parse AI response as JSON using robust extraction
      let aiSteps;
      try {
        if (aiResponse) {
          const result = extractAndParseJSON(aiResponse, 'Journey Engine Steps');
          if (result.success && result.data) {
            aiSteps = result.data.steps;
          }
        }
      } catch (parseError) {
        console.log('JSON parsing failed, creating structured steps from AI response');
      }

      // Create structured steps from AI response or fallback
      const generatedSteps: JourneyStep[] = aiSteps ? aiSteps.map((step: any, index: number) => ({
        id: `step_${index}`,
        type: step.type,
        title: step.title,
        content: step.content,
        depth: step.depth,
        completed: false
      })) : [
        {
          id: 'surface',
          type: 'reflection',
          title: 'Deep Exploration',
          content: `Reflecting on your ${selectedArea.name.toLowerCase()}: What patterns in this area of your life feel most alive or stuck right now? Consider your ${userContext.blueprintSummary?.cognitiveStyle || 'unique'} way of processing.`,
          depth: 'surface',
          completed: false
        },
        {
          id: 'pattern',
          type: 'integration',
          title: 'Pattern Recognition',
          content: `Looking deeper at your ${selectedArea.name.toLowerCase()} patterns: How do these patterns connect to your core beliefs and way of making decisions?`,
          depth: 'pattern', 
          completed: false
        },
        {
          id: 'somatic',
          type: 'somatic',
          title: 'Embodied Awareness',
          content: `Take 5 minutes to connect with your body's wisdom about ${selectedArea.name.toLowerCase()}. What does your ${userContext.blueprintSummary?.energyType || 'energy'} tell you?`,
          depth: 'pattern',
          completed: false
        },
        {
          id: 'insight',
          type: 'insight',
          title: 'Wisdom Integration',
          content: `Synthesize your insights: What new understanding emerges about your authentic path in ${selectedArea.name.toLowerCase()}?`,
          depth: 'integration',
          completed: false
        },
        {
          id: 'action',
          type: 'action',
          title: 'Aligned Action',
          content: `Choose one action that honors your ${userContext.blueprintSummary?.authority || 'inner guidance'} and creates meaningful change in ${selectedArea.name.toLowerCase()}.`,
          depth: 'integration',
          completed: false
        }
      ];

      setSteps(generatedSteps);
    } catch (error) {
      console.error('Error generating personalized journey:', error);
      // Enhanced fallback with some personalization
      setSteps([
        {
          id: 'reflection',
          type: 'reflection',
          title: 'Inner Landscape',
          content: `What does authentic growth in your ${selectedArea.name.toLowerCase()} look like right now?`,
          depth: 'surface',
          completed: false
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const processStepResponse = async (stepIndex: number, response: string) => {
    if (!response.trim()) return;
    
    setIsProcessingResponse(true);
    const step = steps[stepIndex];
    
    try {
      // Get AI guidance for the user's response
      const guidancePrompt = `The user is working on ${selectedArea.name} growth and just completed a ${step.type} step titled "${step.title}".

Their response: "${response}"

Provide brief, insightful guidance that:
1. Validates their sharing
2. Highlights key insights or patterns
3. Prepares them for deeper exploration
4. Stays under 100 words

Be warm, wise, and encouraging.`;

      await sendMessage(guidancePrompt);
      
      // Get the latest AI response from messages
      const latestMessage = messages[messages.length - 1];
      const aiGuidance = latestMessage?.sender === 'assistant' ? latestMessage.content : undefined;
      
      // Update step with response and guidance
      const updatedSteps = [...steps];
      updatedSteps[stepIndex] = {
        ...step,
        completed: true,
        userResponse: response,
        aiGuidance: aiGuidance
      };
      setSteps(updatedSteps);

      // Log the interaction
      if (step.type === 'reflection') {
        addReflectionEntry({ title: step.title, content: response, timestamp: new Date().toISOString() });
      } else if (step.type === 'insight') {
        addInsightEntry({ content: response, tags: [selectedArea.name, step.type], timestamp: new Date().toISOString() });
      }

      // Auto-advance after a moment
      setTimeout(() => {
        if (stepIndex < steps.length - 1) {
          setCurrentStep(stepIndex + 1);
        }
      }, 1500);

    } catch (error) {
      console.error('Error processing step response:', error);
      // Still mark as completed even if AI guidance fails
      const updatedSteps = [...steps];
      updatedSteps[stepIndex].completed = true;
      updatedSteps[stepIndex].userResponse = response;
      setSteps(updatedSteps);
    } finally {
      setIsProcessingResponse(false);
      setUserResponse("");
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'reflection': return Brain;
      case 'integration': return Sparkles;
      case 'somatic': return Heart;
      case 'insight': return BookOpen;
      case 'action': return Target;
      case 'pattern': return Sparkles;
      default: return BookOpen;
    }
  };

  const getDepthColor = (depth: string) => {
    switch (depth) {
      case 'surface': return 'bg-soul-teal/10 text-soul-teal';
      case 'pattern': return 'bg-soul-purple/10 text-soul-purple';
      case 'integration': return 'bg-soul-gold/10 text-soul-gold';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (isGenerating) {
    return (
      <CosmicCard className="p-6 text-center">
        <div className="animate-spin h-8 w-8 border-2 border-soul-purple border-t-transparent rounded-full mx-auto mb-4"></div>
        <h3 className="text-lg font-medium mb-2">Creating Your Personalized Journey</h3>
        <p className="text-sm text-muted-foreground">
          Analyzing your blueprint and patterns to craft a meaningful {selectedArea.name.toLowerCase()} exploration...
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
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-medium">{currentStepData.title}</h3>
                <Badge className={`text-xs ${getDepthColor(currentStepData.depth)}`}>
                  {currentStepData.depth}
                </Badge>
              </div>
              
              <p className="text-muted-foreground mb-4">{currentStepData.content}</p>
              
              {!currentStepData.completed && (
                <div className="space-y-3">
                  <textarea
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                    placeholder="Share your reflection or response..."
                    className="w-full p-3 border rounded-lg min-h-[100px] resize-none"
                  />
                  <Button 
                    onClick={() => processStepResponse(currentStep, userResponse)}
                    disabled={!userResponse.trim() || isProcessingResponse}
                    className="bg-soul-purple hover:bg-soul-purple/90"
                  >
                    {isProcessingResponse ? 'Processing...' : 'Share & Continue'}
                  </Button>
                </div>
              )}
              
              {currentStepData.completed && currentStepData.aiGuidance && (
                <div className="mt-4 p-4 bg-soul-purple/5 rounded-lg border border-soul-purple/20">
                  <div className="flex items-center gap-2 text-soul-purple text-sm font-medium mb-2">
                    <Sparkles className="h-4 w-4" />
                    Guidance
                  </div>
                  <p className="text-sm text-muted-foreground">{currentStepData.aiGuidance}</p>
                </div>
              )}
              
              {currentStepData.completed && !currentStepData.aiGuidance && (
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
            You've completed your personalized {selectedArea.name.toLowerCase()} growth journey. 
            How do these insights feel in your body?
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={onBack}>
              Explore Another Area
            </Button>
            <Button className="bg-soul-purple hover:bg-soul-purple/90">
              Integrate & Reflect
            </Button>
          </div>
        </CosmicCard>
      )}
    </div>
  );
};
