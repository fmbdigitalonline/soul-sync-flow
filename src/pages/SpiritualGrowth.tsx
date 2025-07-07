import React, { useRef, useEffect, useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Moon, BookOpen, Calendar, MessageCircle, Compass, TrendingUp, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedAICoach } from "@/hooks/use-enhanced-ai-coach";
import { supabase } from "@/integrations/supabase/client";
import { GuideInterface } from "@/components/coach/GuideInterface";
import { MoodTracker } from "@/components/coach/MoodTracker";
import { ReflectionPrompts } from "@/components/coach/ReflectionPrompts";
import { InsightJournal } from "@/components/coach/InsightJournal";
import { WeeklyInsights } from "@/components/coach/WeeklyInsights";
import { GrowthProgramInterface } from "@/components/growth/GrowthProgramInterface";
import { GrowthCoachWelcome } from "@/components/growth/GrowthCoachWelcome";
import { ImmediateGrowthInterface } from "@/components/growth/ImmediateGrowthInterface";
import { growthProgramOrchestrator, OrchestrationResult } from "@/services/growth-program-orchestrator";
import { useLanguage } from "@/contexts/LanguageContext";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";
import { ProgramWeek } from "@/types/growth-program";
import { GrowthProgramOnboardingModal } from "@/components/growth/onboarding/GrowthProgramOnboardingModal";
import { useBlueprintData } from "@/hooks/use-blueprint-data";

type ActiveView = 'welcome' | 'immediate_chat' | 'growth_program' | 'coach_chat' | 'tools' | 'mood' | 'reflection' | 'insight' | 'weekly' | null;

const SpiritualGrowth = () => {
  const { messages, isLoading, sendMessage, resetConversation } = useEnhancedAICoach("guide");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<ActiveView>('welcome');
  const [selectedWeek, setSelectedWeek] = useState<ProgramWeek | null>(null);
  const [isInGuidedFlow, setIsInGuidedFlow] = useState(false);
  const [orchestrationResult, setOrchestrationResult] = useState<OrchestrationResult | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { blueprintData } = useBlueprintData();
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  
  const { growthJourney, addMoodEntry, addReflectionEntry, addInsightEntry } = useJourneyTracking();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const authenticated = !!data.session;
      setIsAuthenticated(authenticated);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const authenticated = !!session;
      setIsAuthenticated(authenticated);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Initialize orchestration when user clicks spiritual growth
  const handleStartSpiritualGrowth = async () => {
    if (!isAuthenticated) return;
    
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) return;

      console.log('🚀 Starting immediate spiritual growth interface...');
      
      // Get orchestration result immediately
      const result = await growthProgramOrchestrator.initializeForDomain(
        data.session.user.id,
        'spiritual-growth',
        blueprintData || undefined
      );
      
      setOrchestrationResult(result);
      setActiveView('immediate_chat');
      
      console.log('✨ Ready for immediate chat with basic context');
      
    } catch (error) {
      console.error('Error initializing spiritual growth:', error);
      toast({
        title: "Connection Issue",
        description: "Having trouble connecting. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleImmediateChatMessage = (message: string) => {
    // Send message through existing coach system
    sendMessage(message);
  };

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <CosmicCard className="w-full max-w-md text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("spiritualGrowth.title")}</h1>
              <p className="text-gray-600">{t("spiritualGrowth.description")}</p>
            </div>
            <Button 
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              onClick={() => window.location.href = '/auth'}
            >
              {t("spiritualGrowth.getStarted")}
            </Button>
          </CosmicCard>
        </div>
      </MainLayout>
    );
  }

  // Show immediate chat interface
  if (activeView === 'immediate_chat' && orchestrationResult) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
          <div className="container mx-auto py-6 px-4 max-w-4xl">
            
            {/* Header with back button */}
            <div className="flex items-center justify-between mb-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveView('welcome')}
                className="flex items-center gap-2 text-gray-600 hover:text-purple-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Options
              </Button>
              <div className="text-center">
                <h1 className="text-xl font-bold text-gray-800">Spiritual Growth</h1>
                <p className="text-sm text-gray-500">Connected & Ready</p>
              </div>
              <div className="w-20" />
            </div>

            {/* Chat Interface Container */}
            <CosmicCard className="w-full">
              {messages.length === 0 ? (
                <ImmediateGrowthInterface
                  basicContext={orchestrationResult.basicContext}
                  enhancedContextPromise={orchestrationResult.enhancedContextPromise}
                  onSendMessage={handleImmediateChatMessage}
                  domain="spiritual-growth"
                />
              ) : (
                <GuideInterface
                  messages={messages}
                  isLoading={isLoading}
                  onSendMessage={sendMessage}
                  messagesEndRef={messagesEndRef}
                />
              )}
            </CosmicCard>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (activeView === 'growth_program') {
    return (
      <MainLayout>
        <div className="flex flex-col h-[calc(100vh-5rem)] w-full p-4">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setActiveView('welcome')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Growth Coach
            </Button>
            
            <CosmicCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold capitalize">
                      Growth Program
                    </h2>
                    <p className="text-muted-foreground mt-2">Follow a structured path for spiritual growth</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Key Activities This Week</h3>
                    <div className="space-y-2">
                      <div>
                        <span>Activity 1</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Tools Available</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span>Tool 1</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CosmicCard>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (activeView === 'coach_chat') {
    return (
      <MainLayout>
        <div className="flex flex-col h-[calc(100vh-5rem)] w-full p-4">
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveView('welcome')}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Growth Coach
            </Button>
          </div>

          <CosmicCard className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium flex items-center">
                <Heart className="h-4 w-4 mr-2 text-soul-purple" />
                Growth Coach - Step by Step Guidance
              </h3>
            </div>
            
            <div className="flex-1">
              <GuideInterface
                messages={messages}
                isLoading={isLoading}
                onSendMessage={sendMessage}
                messagesEndRef={messagesEndRef}
              />
            </div>
          </CosmicCard>
        </div>
      </MainLayout>
    );
  }

  if (activeView === 'tools') {
    return (
      <MainLayout>
        <div className="flex flex-col h-[calc(100vh-5rem)] w-full p-4">
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveView('welcome')}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Growth Coach
            </Button>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center gradient-text mb-6">Growth Tools</h2>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => setActiveView('mood')}
                className="h-20 flex-col gap-2"
              >
                <Heart className="h-6 w-6" />
                Mood Tracker
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveView('reflection')}
                className="h-20 flex-col gap-2"
              >
                <Sparkles className="h-6 w-6" />
                Reflection
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveView('insight')}
                className="h-20 flex-col gap-2"
              >
                <BookOpen className="h-6 w-6" />
                Insights
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveView('weekly')}
                className="h-20 flex-col gap-2"
              >
                <Calendar className="h-6 w-6" />
                Weekly Review
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (activeView === 'mood') {
    return (
      <MainLayout>
        <div className="flex flex-col h-[calc(100vh-5rem)] w-full p-4">
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveView('tools')}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tools
            </Button>
          </div>
          <MoodTracker onMoodSave={addMoodEntry} />
        </div>
      </MainLayout>
    );
  }
  
  if (activeView === 'reflection') {
    return (
      <MainLayout>
        <div className="flex flex-col h-[calc(100vh-5rem)] w-full p-4">
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveView('tools')}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tools
            </Button>
          </div>
          <ReflectionPrompts onReflectionSave={addReflectionEntry} />
        </div>
      </MainLayout>
    );
  }
  
  if (activeView === 'insight') {
    return (
      <MainLayout>
        <div className="flex flex-col h-[calc(100vh-5rem)] w-full p-4">
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveView('tools')}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tools
            </Button>
          </div>
          <InsightJournal onInsightSave={addInsightEntry} />
        </div>
      </MainLayout>
    );
  }
  
  if (activeView === 'weekly') {
    return (
      <MainLayout>
        <div className="flex flex-col h-[calc(100vh-5rem)] w-full p-4">
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveView('tools')}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tools
            </Button>
          </div>
          <WeeklyInsights />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto py-8 px-4 max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              {t("spiritualGrowth.title")}
            </h1>
            <p className="text-gray-600 text-lg">
              {t("spiritualGrowth.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Immediate Chat Option */}
            <CosmicCard className="group hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1" onClick={handleStartSpiritualGrowth}>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Heart-Centered Guidance</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Start an immediate conversation with your personalized spiritual guide. Ready in seconds, enhanced as we connect.
                  </p>
                </div>
                <div className="text-xs text-purple-600 font-medium bg-purple-50 px-3 py-1 rounded-full">
                  ✨ Instant Connection
                </div>
              </div>
            </CosmicCard>

            {/* Growth Program Option */}
            <CosmicCard className="group hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1" onClick={() => setActiveView('growth_program')}>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Structured Program</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Follow a comprehensive 12-week journey designed for deep spiritual transformation and growth.
                  </p>
                </div>
              </div>
            </CosmicCard>

            {/* Tools & Practices */}
            <CosmicCard className="group hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1" onClick={() => setActiveView('tools')}>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Compass className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Spiritual Tools</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Access mood tracking, reflection prompts, and insight journaling for daily spiritual practice.
                  </p>
                </div>
              </div>
            </CosmicCard>

          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SpiritualGrowth;
