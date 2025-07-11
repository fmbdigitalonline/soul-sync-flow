import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MessageCircle, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { SpiritualGuideInterface } from '@/components/growth/SpiritualGuideInterface';
import { useEnhancedAICoach } from '@/hooks/use-enhanced-ai-coach';
import { useBlueprintData } from '@/hooks/use-blueprint-data';
import { LifeDomain, LifeWheelAssessment } from '@/types/growth-program';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

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
      console.log('Starting real conversational assessment processing...');
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Combine all conversation data
      const fullConversation = conversationData.join('\n\n') + '\n\n' + 
        messages.slice(-10).map(m => m.content).join('\n');
      
      console.log('Conversation data prepared, calling assessment API...');

      // Call the real assessment edge function
      const { data: assessmentResult, error } = await supabase.functions.invoke('conversational-assessment', {
        body: {
          conversationData: fullConversation,
          userId: user.id,
          sessionId: crypto.randomUUID(),
          blueprintData: blueprintData
        },
      });

      if (error) {
        console.error('Assessment API error:', error);
        throw error;
      }

      if (!assessmentResult?.success) {
        console.error('Assessment processing failed:', assessmentResult);
        throw new Error('Assessment processing failed');
      }

      console.log('Assessment completed successfully:', assessmentResult.assessments.length, 'domains');

      // Show success message
      toast({
        title: "Assessment Complete! ✨",
        description: `Analyzed your conversation and created personalized insights for ${assessmentResult.assessments.length} life domains.`,
      });

      // Pass the real assessment data to completion handler
      onComplete(assessmentResult.assessments);
      
    } catch (error) {
      console.error('Error processing conversational assessment:', error);
      
      // Show error message
      toast({
        title: "Assessment Processing Error",
        description: "We'll use a basic assessment for now. Your conversation data is still valuable!",
        variant: "destructive"
      });

      // Fallback: Create basic assessment from conversation keywords
      const fallbackAssessments = createFallbackAssessments(conversationData.join(' ') + ' ' + messages.map(m => m.content).join(' '));
      onComplete(fallbackAssessments);
      
    } finally {
      setIsProcessing(false);
    }
  };

  // Fallback assessment creation for offline/error scenarios
  const createFallbackAssessments = (conversationText: string): LifeWheelAssessment[] => {
    const domains: LifeDomain[] = ['wellbeing', 'energy', 'career', 'relationships', 'finances', 'health', 'personal_growth'];
    const lowerText = conversationText.toLowerCase();
    const currentTime = new Date().toISOString();
    
    return domains.map(domain => {
      // Simple sentiment analysis for domain scoring
      let currentScore = 6; // Default middle score
      let desiredScore = 8;  // Default improvement target
      let importanceRating = 7; // Default importance
      
      // Look for domain-specific keywords and sentiment
      const domainKeywords = {
        wellbeing: ['happy', 'peace', 'balance', 'satisfaction', 'fulfillment'],
        energy: ['energy', 'motivation', 'vitality', 'tired', 'exhausted'],
        career: ['work', 'job', 'career', 'professional', 'employment'],
        relationships: ['family', 'friends', 'relationship', 'social', 'love'],
        finances: ['money', 'financial', 'income', 'budget', 'savings'],
        health: ['health', 'fitness', 'exercise', 'wellness', 'medical'],
        personal_growth: ['growth', 'learning', 'development', 'goals', 'improvement']
      };

      const keywords = domainKeywords[domain as keyof typeof domainKeywords] || [];
      const positiveWords = ['good', 'great', 'excellent', 'satisfied', 'strong', 'positive'];
      const negativeWords = ['poor', 'bad', 'struggling', 'difficult', 'challenging', 'stressed'];
      
      // Adjust scores based on keyword presence and sentiment
      keywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
          importanceRating = Math.min(10, importanceRating + 1);
          
          // Check surrounding context for sentiment
          const keywordIndex = lowerText.indexOf(keyword);
          const contextWindow = lowerText.substring(Math.max(0, keywordIndex - 50), keywordIndex + 50);
          
          if (positiveWords.some(word => contextWindow.includes(word))) {
            currentScore = Math.min(9, currentScore + 1);
          } else if (negativeWords.some(word => contextWindow.includes(word))) {
            currentScore = Math.max(2, currentScore - 2);
            desiredScore = Math.min(10, desiredScore + 1); // Higher desire for improvement
          }
        }
      });

      return {
        id: crypto.randomUUID(),
        user_id: 'fallback-user', // Will be replaced by parent component
        domain,
        current_score: currentScore,
        desired_score: desiredScore,
        importance_rating: importanceRating,
        gap_size: desiredScore - currentScore,
        assessment_version: 1,
        notes: `Assessment based on conversation analysis. Areas mentioned: ${keywords.filter(k => lowerText.includes(k)).join(', ') || 'general discussion'}.`,
        created_at: currentTime,
        updated_at: currentTime
      } as LifeWheelAssessment;
    });
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
              <SpiritualGuideInterface
                messages={messages}
                isLoading={isLoading}
                onSendMessage={(message) => sendMessage(message, true, message, "life-assessment")}
                userDisplayName={getUserDisplayName()}
                coreTraits={getCoreTraits()}
              />
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