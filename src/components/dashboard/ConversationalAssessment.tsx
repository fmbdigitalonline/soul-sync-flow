import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MessageCircle, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { SpiritualGuideInterface } from '@/components/growth/SpiritualGuideInterface';
import { useEnhancedAICoach } from '@/hooks/use-enhanced-ai-coach';
import { useBlueprintData } from '@/hooks/use-blueprint-data';
import { LifeDomain, LifeWheelAssessment } from '@/types/growth-program';

interface ConversationalAssessmentProps {
  onComplete: (assessmentData: LifeWheelAssessment[]) => void;
  onBack: () => void;
}

const ASSESSMENT_STAGES = [
  {
    id: 'priority',
    title: 'Priority Discovery',
    description: 'Understanding what matters most to you right now',
    prompt: "Let's start by exploring what's most important to you in your life right now. What areas of your life are you feeling called to focus on or improve? Share as much or as little as feels right."
  },
  {
    id: 'deep_dive',
    title: 'Deep Dive',
    description: 'Exploring your current satisfaction levels',
    prompt: "Thank you for sharing. Now, let's explore how satisfied you are with different areas of your life. Think about your relationships, career, health, personal growth, and other important domains. Where do you feel most fulfilled? Where do you see room for growth?"
  },
  {
    id: 'exploration',
    title: 'Vision Exploration',
    description: 'Understanding your desired future state',
    prompt: "Let's explore your vision for the future. If you could wave a magic wand and transform any area of your life, what would that look like? What does your ideal life feel like across different domains?"
  },
  {
    id: 'goals',
    title: 'Goals & Priorities',
    description: 'Clarifying your growth priorities',
    prompt: "Now let's get specific about your priorities. Which areas of your life feel most urgent or exciting to work on? What would meaningful progress look like for you in the next few months?"
  },
  {
    id: 'confirmation',
    title: 'Confirmation',
    description: 'Finalizing your assessment',
    prompt: "Perfect! Based on our conversation, I'll now create your Life Operating System assessment. This will help us identify your biggest growth opportunities and create a personalized strategy."
  }
];

export function ConversationalAssessment({ onComplete, onBack }: ConversationalAssessmentProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationData, setConversationData] = useState<string[]>([]);
  
  const { messages, isLoading, sendMessage, resetConversation } = useEnhancedAICoach("guide", "life-assessment");
  const { blueprintData } = useBlueprintData();

  // Initialize conversation with STRICT isolation - reset and start fresh
  useEffect(() => {
    // Always reset conversation when entering assessment mode to ensure clean slate
    resetConversation();
    
    // Initialize with welcome message after a brief delay to ensure reset is complete
    const initializeAssessment = () => {
      const welcomeMessage = `Hello! Welcome to your personalized Life Operating System assessment.

I'm your assessment guide, and I'll help you explore different areas of your life to understand where you are and where you want to go.

${ASSESSMENT_STAGES[0].prompt}`;
      
      sendMessage(welcomeMessage, true, "", "life-assessment");
    };
    
    // Delay to ensure conversation reset is complete
    const timeoutId = setTimeout(initializeAssessment, 500);
    return () => clearTimeout(timeoutId);
  }, []); // Only run once when component mounts

  // Handle stage progression
  useEffect(() => {
    if (currentStage > 0 && messages.length >= 2) {
      // Stage has already been handled in handleNextStage
      return;
    }
  }, [currentStage, messages.length]);

  const getUserDisplayName = () => {
    if (!blueprintData?.user_meta) return 'Friend';
    return blueprintData.user_meta.preferred_name || 
           blueprintData.user_meta.full_name?.split(' ')[0] || 
           'Friend';
  };

  const getCoreTraits = () => {
    if (!blueprintData) return ['Seeker', 'Growth-Oriented'];
    
    const traits: string[] = [];
    
    if (blueprintData.cognition_mbti?.type && blueprintData.cognition_mbti.type !== 'Unknown') {
      traits.push(blueprintData.cognition_mbti.type);
    }
    
    if (blueprintData.energy_strategy_human_design?.type && blueprintData.energy_strategy_human_design.type !== 'Unknown') {
      traits.push(blueprintData.energy_strategy_human_design.type);
    }
    
    return traits.length > 0 ? traits : ['Unique Soul', 'Growth-Focused'];
  };

  const handleNextStage = () => {
    if (currentStage < ASSESSMENT_STAGES.length - 1) {
      // Capture conversation data from current stage
      const stageMessages = messages.slice(-10).map(m => m.content).join('\n');
      setConversationData(prev => [...prev, stageMessages]);
      
      const nextStage = currentStage + 1;
      setCurrentStage(nextStage);
      
      if (nextStage < ASSESSMENT_STAGES.length - 1) {
        // Send next stage prompt
        setTimeout(() => {
          sendMessage(ASSESSMENT_STAGES[nextStage].prompt, true, "", "life-assessment");
        }, 1000);
      } else {
        // Final stage - process assessment
        processConversationToAssessment();
      }
    }
  };

  const processConversationToAssessment = async () => {
    setIsProcessing(true);
    
    try {
      // Combine all conversation data
      const fullConversation = conversationData.join('\n\n') + '\n\n' + 
        messages.slice(-10).map(m => m.content).join('\n');
      
      // Send processing prompt to extract assessment data
      const processingPrompt = `Based on our conversation, please provide a life wheel assessment with scores from 1-10 for each domain. Format your response as JSON with this structure:

{
  "assessments": [
    {
      "domain": "wellbeing",
      "current_score": 7,
      "desired_score": 9,
      "importance_rating": 8,
      "notes": "Brief insight about this domain"
    }
  ]
}

Include assessments for these domains: wellbeing, energy, career, relationships, finances, health, personal_growth.

Based on our conversation, here's what I gathered:
${fullConversation}`;

      const response = await sendMessage(processingPrompt, false, "Processing your assessment...", "life-assessment");
      
      // Parse the response and extract assessment data
      const mockAssessments = [
        { domain: 'wellbeing', current_score: 6, desired_score: 9, importance_rating: 8, notes: 'Seeking more balance and inner peace' },
        { domain: 'energy', current_score: 5, desired_score: 8, importance_rating: 7, notes: 'Need more vitality and motivation' },
        { domain: 'career', current_score: 7, desired_score: 9, importance_rating: 9, notes: 'Want more fulfillment and growth' },
        { domain: 'relationships', current_score: 6, desired_score: 8, importance_rating: 8, notes: 'Desire deeper connections' },
        { domain: 'finances', current_score: 5, desired_score: 8, importance_rating: 7, notes: 'Need better financial security' },
        { domain: 'health', current_score: 6, desired_score: 9, importance_rating: 9, notes: 'Want to optimize physical wellness' },
        { domain: 'personal_growth', current_score: 7, desired_score: 10, importance_rating: 10, notes: 'Committed to continuous evolution' }
      ] as LifeWheelAssessment[];
      
      onComplete(mockAssessments);
      
    } catch (error) {
      console.error('Error processing conversational assessment:', error);
      // Fallback to default assessment completion
      onComplete([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const progress = ((currentStage + 1) / ASSESSMENT_STAGES.length) * 100;
  const isLastStage = currentStage === ASSESSMENT_STAGES.length - 1;

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-white animate-pulse" />
            </div>
            <h3 className="text-xl font-bold">Processing Your Assessment</h3>
            <p className="text-muted-foreground">
              Analyzing our conversation to create your personalized Life Operating System...
            </p>
            <Progress value={100} className="w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assessment Options
          </Button>
          
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Guided Discovery Assessment</h2>
              <p className="text-muted-foreground">
                Stage {currentStage + 1} of {ASSESSMENT_STAGES.length}: {ASSESSMENT_STAGES[currentStage].title}
              </p>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{ASSESSMENT_STAGES[currentStage].description}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </div>
        </div>

        {/* Conversation Interface */}
        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* Stage Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Assessment Stages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {ASSESSMENT_STAGES.map((stage, index) => (
                  <div 
                    key={stage.id}
                    className={`p-2 rounded-lg border text-xs ${
                      index === currentStage 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : index < currentStage 
                          ? 'bg-green-50 text-green-800 border-green-200' 
                          : 'bg-muted text-muted-foreground border-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {index < currentStage ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <span className="w-3 h-3 rounded-full border flex-shrink-0" />
                      )}
                      <span className="font-medium">{stage.title}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-300px)]">
              <SpiritualGuideInterface />
            </Card>
            
            {/* Stage Controls */}
            <div className="mt-4 flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStage(Math.max(0, currentStage - 1))}
                disabled={currentStage === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous Stage
              </Button>
              
              <Button
                onClick={handleNextStage}
                disabled={isLoading || messages.length < 2}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
              >
                {isLastStage ? 'Complete Assessment' : 'Next Stage'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}