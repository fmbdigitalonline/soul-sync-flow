import React, { useRef, useEffect, useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Moon, BookOpen, Calendar, MessageCircle, Compass, TrendingUp, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedAICoach } from "@/hooks/use-enhanced-ai-coach";
import { useOptimizedSpiritualCoach } from "@/hooks/use-optimized-spiritual-coach";
import { useUltraOptimizedSpiritualCoach } from "@/hooks/use-ultra-optimized-spiritual-coach";
import { supabase } from "@/integrations/supabase/client";
import { GuideInterface } from "@/components/coach/GuideInterface";
import { OptimizedSpiritualInterface } from "@/components/coach/OptimizedSpiritualInterface";
import { UltraOptimizedSpiritualInterface } from "@/components/coach/UltraOptimizedSpiritualInterface";
import { MoodTracker } from "@/components/coach/MoodTracker";
import { ReflectionPrompts } from "@/components/coach/ReflectionPrompts";
import { InsightJournal } from "@/components/coach/InsightJournal";
import { WeeklyInsights } from "@/components/coach/WeeklyInsights";
import { GrowthProgramInterface } from "@/components/growth/GrowthProgramInterface";
import { GrowthCoachWelcome } from "@/components/growth/GrowthCoachWelcome";
import { PerformanceMonitor } from "@/components/coach/PerformanceMonitor";
import { programAwareCoachService } from "@/services/program-aware-coach-service";
import { useLanguage } from "@/contexts/LanguageContext";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";
import { ProgramWeek } from "@/types/growth-program";
import { GrowthProgramOnboardingModal } from "@/components/growth/onboarding/GrowthProgramOnboardingModal";

type ActiveView = 'welcome' | 'growth_program' | 'coach_chat' | 'tools' | 'mood' | 'reflection' | 'insight' | 'weekly' | null;

const SpiritualGrowth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<ActiveView>('welcome');
  const [selectedWeek, setSelectedWeek] = useState<ProgramWeek | null>(null);
  const [isInGuidedFlow, setIsInGuidedFlow] = useState(false);
  const [optimizationMode, setOptimizationMode] = useState<'ultra' | 'standard' | 'original'>('ultra');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  
  // Conditional hook usage based on optimization mode
  const ultraHook = useUltraOptimizedSpiritualCoach();
  const standardHook = useOptimizedSpiritualCoach();
  const originalHook = useEnhancedAICoach("guide");
  
  // Select the appropriate hook based on mode
  const currentHook = optimizationMode === 'ultra' ? ultraHook : 
                     optimizationMode === 'standard' ? standardHook : 
                     originalHook;
  
  const { messages, isLoading, sendMessage, streamingContent, isStreaming } = currentHook;
  
  // Get the correct reset/clear function based on the hook
  const resetConversation = optimizationMode === 'original' 
    ? (originalHook as any).resetConversation 
    : (currentHook as any).clearConversation;
  
  const { growthJourney, addMoodEntry, addReflectionEntry, addInsightEntry } = useJourneyTracking();

  // Lightweight auth initialization - no heavy services unless original mode
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const authenticated = !!data.session;
      setIsAuthenticated(authenticated);
      
      // Only initialize heavy services for original mode
      if (authenticated && data.session.user && optimizationMode === 'original') {
        await programAwareCoachService.initializeForUser(data.session.user.id);
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const authenticated = !!session;
      setIsAuthenticated(authenticated);
      
      // Only initialize heavy services for original mode
      if (authenticated && session?.user && optimizationMode === 'original') {
        await programAwareCoachService.initializeForUser(session.user.id);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [optimizationMode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    if (typeof resetConversation === 'function') {
      resetConversation();
    }
  };

  const handleGoToTools = () => {
    setActiveView('tools');
  };

  const handleBackToWelcome = () => {
    setActiveView('welcome');
    setSelectedWeek(null);
  };

  // Simplified message handler - let each hook handle its own logic
  const handleProgramAwareMessage = async (message: string) => {
    if (!isAuthenticated) return;
    
    // For original mode, use program-aware logic
    if (optimizationMode === 'original') {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          const response = await programAwareCoachService.sendProgramAwareMessage(
            message,
            `session_${Date.now()}`,
            data.session.user.id
          );
          sendMessage(message);
        }
      } catch (error) {
        console.error('Error sending program-aware message:', error);
        sendMessage(message);
      }
    } else {
      // For ultra and standard modes, use direct hook logic
      sendMessage(message);
    }
  };

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
        {/* Performance Monitor - only show for ultra and standard modes */}
        {optimizationMode !== 'original' && (
          <PerformanceMonitor 
            isLoading={isLoading}
            isStreaming={isStreaming}
            messageCount={messages.length}
          />
        )}

        {/* Header with Back Button and Optimization Mode Toggle */}
        {activeView !== 'welcome' && (
          <div className="mb-4 flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={handleBackToWelcome}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Growth Coach
            </Button>
            
            {activeView === 'coach_chat' && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Performance Mode:</label>
                <div className="flex gap-1">
                  <Button
                    variant={optimizationMode === 'ultra' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOptimizationMode('ultra')}
                  >
                    Ultra
                  </Button>
                  <Button
                    variant={optimizationMode === 'standard' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOptimizationMode('standard')}
                  >
                    Standard
                  </Button>
                  <Button
                    variant={optimizationMode === 'original' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOptimizationMode('original')}
                  >
                    Original
                  </Button>
                </div>
              </div>
            )}
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

          {/* Coach Chat - Ultra-Optimized, Standard, or Original */}
          {activeView === 'coach_chat' && (
            <>
              {optimizationMode === 'ultra' ? (
                <UltraOptimizedSpiritualInterface />
              ) : optimizationMode === 'standard' ? (
                <OptimizedSpiritualInterface />
              ) : (
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
                      streamingContent={streamingContent}
                      isStreaming={isStreaming}
                    />
                  </div>
                </CosmicCard>
              )}
            </>
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
