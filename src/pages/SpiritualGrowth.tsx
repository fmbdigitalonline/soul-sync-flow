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
import { programAwareCoachService } from "@/services/program-aware-coach-service";
import { useLanguage } from "@/contexts/LanguageContext";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";
import { ProgramWeek } from "@/types/growth-program";
import { GrowthProgramOnboardingModal } from "@/components/growth/onboarding/GrowthProgramOnboardingModal";

type ActiveView = 'welcome' | 'growth_program' | 'coach_chat' | 'tools' | 'mood' | 'reflection' | 'insight' | 'weekly' | null;

const SpiritualGrowth = () => {
  const { messages, isLoading, sendMessage, resetConversation } = useEnhancedAICoach("guide");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<ActiveView>('welcome');
  const [selectedWeek, setSelectedWeek] = useState<ProgramWeek | null>(null);
  const [isInGuidedFlow, setIsInGuidedFlow] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  
  const { growthJourney, addMoodEntry, addReflectionEntry, addInsightEntry } = useJourneyTracking();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const authenticated = !!data.session;
      setIsAuthenticated(authenticated);
      
      // Initialize program-aware coach if authenticated
      if (authenticated && data.session.user) {
        await programAwareCoachService.initializeForUser(data.session.user.id);
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const authenticated = !!session;
      setIsAuthenticated(authenticated);
      
      if (authenticated && session?.user) {
        await programAwareCoachService.initializeForUser(session.user.id);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Growth Coach Welcome handlers
  const handleStartProgram = async () => {
    setShowOnboardingModal(true);
  };

  const handleOnboardingComplete = () => {
    setShowOnboardingModal(false);
    setActiveView('growth_program');
  };

  const handleOnboardingClose = () => {
    setShowOnboardingModal(false);
  };

  const handleTalkToCoach = () => {
    setActiveView('coach_chat');
    setIsInGuidedFlow(false);
    resetConversation();
  };

  const handleGoToTools = () => {
    setActiveView('tools');
  };

  const handleBackToWelcome = () => {
    setActiveView('welcome');
    setSelectedWeek(null);
  };

  // Enhanced program-aware message sending
  const handleProgramAwareMessage = async (message: string) => {
    if (!isAuthenticated) return;
    
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        // Special handling for coach-initiated flow
        if (message === "_COACH_INITIATED_FLOW_") {
          // Don't show this internal message, just trigger the coach response
          const response = await programAwareCoachService.initializeBeliefDrilling(
            'relationships',
            data.session.user.id,
            `guided_session_${Date.now()}`
          );
          return; // The coach message will be handled by the hook
        }
        
        // Use program-aware coach for enhanced context
        const response = await programAwareCoachService.sendProgramAwareMessage(
          message,
          `session_${Date.now()}`,
          data.session.user.id
        );
        
        // The useEnhancedAICoach hook will handle the message display
        sendMessage(message);
      }
    } catch (error) {
      console.error('Error sending program-aware message:', error);
      // Fallback to regular message sending
      sendMessage(message);
    }
  };

  // Data collection handlers with journey tracking
  const handleMoodSave = (mood: string, energy: string) => {
    addMoodEntry(mood, energy);
  };

  const handleReflectionSave = (prompt: string, response: string) => {
    addReflectionEntry(prompt, response);
  };

  const handleInsightSave = (insight: string, tags: string[]) => {
    addInsightEntry(insight, tags);
  };

  const handleWeekSelect = (week: ProgramWeek) => {
    setSelectedWeek(week);
  };

  const handleBackToProgram = () => {
    setSelectedWeek(null);
  };

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="flex flex-col h-[calc(100vh-5rem)] w-full p-4 items-center justify-center">
          <CosmicCard className="p-6 text-center w-full">
            <Heart className="h-8 w-8 text-soul-purple mx-auto mb-4" />
            <h1 className="text-2xl font-bold font-display mb-2">
              <span className="gradient-text">{t('growth.title')}</span>
            </h1>
            <p className="mb-6">{t('coach.signInRequired')}</p>
            <Button 
              className="bg-soul-purple hover:bg-soul-purple/90 w-full"
              onClick={() => window.location.href = '/auth'}
            >
              {t('nav.signIn')}
            </Button>
          </CosmicCard>
        </div>
      </MainLayout>
    );
  }

  // Handle week selection view
  if (selectedWeek) {
    return (
      <MainLayout>
        <div className="flex flex-col h-[calc(100vh-5rem)] w-full p-4">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={handleBackToProgram}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Growth Program
            </Button>
            
            <CosmicCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold capitalize">
                      Week {selectedWeek.week_number}: {selectedWeek.theme.replace('_', ' ')}
                    </h2>
                    <p className="text-muted-foreground mt-2">{selectedWeek.focus_area}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Key Activities This Week</h3>
                    <div className="space-y-2">
                      {selectedWeek.key_activities.map((activity, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-soul-purple/5 rounded-lg">
                          <div className="w-2 h-2 bg-soul-purple rounded-full" />
                          <span>{activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Tools Available</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedWeek.tools_unlocked.map((tool) => (
                        <div key={tool} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <Compass className="h-4 w-4 text-soul-purple" />
                          <span className="text-sm">{tool}</span>
                        </div>
                      ))}
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

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-5rem)] w-full p-4">
        {/* Header with Back Button */}
        {activeView !== 'welcome' && (
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={handleBackToWelcome}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Growth Coach
            </Button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 w-full">
          {/* Growth Coach Welcome */}
          {activeView === 'welcome' && (
            <GrowthCoachWelcome
              onStartProgram={handleStartProgram}
              onTalkToCoach={handleTalkToCoach}
              onGoToTools={handleGoToTools}
            />
          )}

          {/* Growth Program */}
          {activeView === 'growth_program' && (
            <GrowthProgramInterface onWeekSelect={handleWeekSelect} />
          )}

          {/* Coach Chat - Step by Step or Guided Flow */}
          {activeView === 'coach_chat' && (
            <CosmicCard className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium flex items-center">
                  <Heart className="h-4 w-4 mr-2 text-soul-purple" />
                  {isInGuidedFlow ? 'Growth Coach - Guided Program Creation' : 'Growth Coach - Step by Step Guidance'}
                </h3>
              </div>
              
              <div className="flex-1">
                <GuideInterface
                  messages={messages}
                  isLoading={isLoading}
                  onSendMessage={handleProgramAwareMessage}
                  messagesEndRef={messagesEndRef}
                />
              </div>
            </CosmicCard>
          )}

          {/* Growth Tools Menu */}
          {activeView === 'tools' && (
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
          )}

          {/* Individual Tools */}
          {activeView === 'mood' && (
            <MoodTracker onMoodSave={handleMoodSave} />
          )}
          
          {activeView === 'reflection' && (
            <ReflectionPrompts onReflectionSave={handleReflectionSave} />
          )}
          
          {activeView === 'insight' && (
            <InsightJournal onInsightSave={handleInsightSave} />
          )}
          
          {activeView === 'weekly' && (
            <WeeklyInsights />
          )}
        </div>
      </div>

      {/* Growth Program Onboarding Modal */}
      <GrowthProgramOnboardingModal
        isOpen={showOnboardingModal}
        onClose={handleOnboardingClose}
        onComplete={handleOnboardingComplete}
      />
    </MainLayout>
  );
};

export default SpiritualGrowth;
