import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IntelligentSoulOrb } from '@/components/ui/intelligent-soul-orb';
import { SpeechBubble } from '@/components/ui/speech-bubble';
import { useHacsIntelligence } from '@/hooks/use-hacs-intelligence';
import { useHACSMicroLearning } from '@/hooks/use-hacs-micro-learning';
import { useHACSInsights } from '@/hooks/use-hacs-insights';
import { useAutonomousOrchestration } from '@/hooks/use-autonomous-orchestration';
import { usePersonalityEngine } from '@/hooks/use-personality-engine';
import { useHermeticReportStatus } from '@/hooks/use-hermetic-report-status';
import { VoiceTokenGenerator } from '@/services/voice-token-generator';
import { HACSMicroLearning } from './HACSMicroLearning';
import { HACSChatOverlay } from './HACSChatOverlay';
import { HACSInsightDisplay } from './HACSInsightDisplay';
import { cn } from '@/lib/utils';
import { useStewardIntroductionEnhanced } from '@/hooks/use-steward-introduction-enhanced';
import { useStewardIntroductionDatabase } from '@/hooks/use-steward-introduction-database';
import { HACSLoadingDiagnostics } from './HACSLoadingDiagnostics';
import { useGlobalChatState } from '@/hooks/use-global-chat-state';
import { useStreamingSyncState } from '@/hooks/use-streaming-sync-state';
import { useUser360 } from '@/hooks/use-user-360';
import { useBlueprintData } from '@/hooks/use-blueprint-data';
import { useUserProfile } from '@/hooks/use-user-profile';
// Phase 3: Advanced Intelligence Integration
import { useConversationRecovery } from '@/hooks/use-conversation-recovery';
import { useTieredMemory } from '@/hooks/use-tiered-memory';
import { usePIEEnhancedCoach } from '@/hooks/use-pie-enhanced-coach';

interface FloatingHACSProps {
  className?: string;
}

export const FloatingHACSOrb: React.FC<FloatingHACSProps> = ({ className }) => {
  const [showBubble, setShowBubble] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showMicroLearning, setShowMicroLearning] = useState(false);
  const [orbStage, setOrbStage] = useState<"welcome" | "collecting" | "generating" | "complete">("welcome");
  const [activeModule, setActiveModule] = useState<string | undefined>();
  const [moduleActivity, setModuleActivity] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [hermeticProgress, setHermeticProgress] = useState(40); // Start at 40% (blueprint completed)
  
  // Global chat loading state and streaming sync
  const { subscribe } = useGlobalChatState();
  const { subscribe: subscribeStreaming } = useStreamingSyncState();
  const [chatLoading, setChatLoading] = useState(false);
  const [streamingTiming, setStreamingTiming] = useState(75);
  
  const { intelligence, loading, refreshIntelligence } = useHacsIntelligence();
  const { hasReport: hasHermeticReport, loading: hermeticLoading, refreshStatus: refreshHermeticStatus } = useHermeticReportStatus();
  const {
    currentQuestion,
    isGenerating,
    generateMicroQuestion,
    clearCurrentQuestion,
    triggerMicroLearning
  } = useHACSMicroLearning();
  const {
    currentInsight,
    isGenerating: isGeneratingInsight,
    acknowledgeInsight,
    dismissInsight,
    triggerInsightCheck
  } = useHACSInsights();
  
  // NEW: Add autonomous orchestration
  const { triggerIntelligentIntervention, generatePersonalizedInsight } = useAutonomousOrchestration();
  const { generateOraclePrompt, getOptimalTimingPreferences } = usePersonalityEngine();
  
  // Phase 3: Enhanced introduction system with database integration
  const {
    introductionState,
    isGeneratingReport,
    startIntroduction,
    continueIntroduction,
    completeIntroductionWithReport,
    shouldStartIntroduction,
    databaseValidation
  } = useStewardIntroductionEnhanced();

  // Phase 2: Database-driven Steward Introduction validation
  const stewardDatabase = useStewardIntroductionDatabase();
  
  // Phase 1: Comprehensive data integration (addresses 60% missing data)
  const { 
    profile: user360Profile, 
    loading: user360Loading, 
    completenessScore,
    dataAvailability 
  } = useUser360();
  
  const { 
    blueprintData, 
    loading: blueprintLoading, 
    getPersonalityTraits,
    getDisplayName,
    getBlueprintCompletionPercentage 
  } = useBlueprintData();
  
  const { 
    profile: userProfile, 
    statistics: userStatistics, 
    goals: userGoals,
    loading: userProfileLoading 
  } = useUserProfile();

  // Phase 3: Advanced Intelligence Integration (60% → 80%+ database coverage)
  const conversationRecovery = useConversationRecovery();
  const tieredMemory = useTieredMemory(userProfile?.id || '', 'hacs-orb-session');
  const pieEnhancedCoach = usePIEEnhancedCoach('guide');

  console.log('FloatingHACSOrb render:', { 
    loading, 
    intelligence, 
    currentQuestion, 
    currentInsight, 
    isGenerating, 
    isGeneratingInsight,
    // Phase 3: Updated logging with database validation
    databaseShouldShow: databaseValidation.shouldShow,
    databaseLoading: databaseValidation.loading,
    databaseError: databaseValidation.error,
    introductionActive: introductionState.isActive
  });

  const intelligenceLevel = intelligence?.intelligence_level || 0;

  // Phase 3: Enhanced system readiness check 
  const isSystemReady = !loading && !databaseValidation.loading && !hermeticLoading && !!intelligence;

  // Subscribe to global chat loading state and streaming timing
  useEffect(() => {
    const unsubscribe = subscribe(setChatLoading);
    return unsubscribe;
  }, [subscribe]);

  useEffect(() => {
    const unsubscribeStreaming = subscribeStreaming(setStreamingTiming);
    return unsubscribeStreaming;
  }, [subscribeStreaming]);

  // Update orb stage based on authentic HACS state + hermetic generation
  useEffect(() => {
    if (isGenerating || isGeneratingInsight || isGeneratingReport) {
      setOrbStage("generating");
    } else if (currentQuestion) {
      setOrbStage("collecting");
    } else if (currentInsight) {
      setOrbStage("complete");
    } else if (intelligenceLevel > 70) {
      setOrbStage("complete");
    } else if (intelligenceLevel > 0) {
      setOrbStage("welcome");
    } else {
      setOrbStage("welcome");
    }
  }, [isGenerating, isGeneratingInsight, isGeneratingReport, currentQuestion, currentInsight, intelligenceLevel]);

  // Monitor hermetic report generation progress and completion status
  useEffect(() => {
    if (isGeneratingReport) {
      // Simulate progress from 40% to 100% during hermetic generation
      const progressInterval = setInterval(() => {
        setHermeticProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return Math.min(prev + 2, 100); // Increment by 2% every interval
        });
      }, 1000); // Update every second

      return () => clearInterval(progressInterval);
    } else if (hasHermeticReport) {
      // Show completed state (100%) when report exists
      setHermeticProgress(100);
    } else {
      // Reset to baseline when not generating and no report
      setHermeticProgress(40);
    }
  }, [isGeneratingReport, hasHermeticReport]);

  // Show speech bubble for questions or insights
  useEffect(() => {
    if (currentQuestion) {
      setShowBubble(true);
      // Auto-dismiss bubble after 15 seconds for questions
      const timer = setTimeout(() => {
        setShowBubble(false);
        clearCurrentQuestion();
      }, 15000);
      return () => clearTimeout(timer);
    } else if (currentInsight && !currentInsight.acknowledged) {
      // Insights show in their own display component, no bubble needed
      setShowBubble(false);
    } else {
      setShowBubble(false);
    }
  }, [currentQuestion, currentInsight, clearCurrentQuestion]);

  // Phase 3 Complete: Final database-driven Steward Introduction logic
  useEffect(() => {
    // Wait for all systems to be ready including database validation
    if (!isSystemReady) {
      console.log('🚀 PHASE 3: System not ready for introduction check', {
        loading,
        databaseLoading: databaseValidation.loading,
        intelligence: !!intelligence
      });
      return;
    }

    // Use the enhanced introduction hook's validation (Principle #6: Integrate)
    const shouldStart = shouldStartIntroduction();
    
    console.log('🚀 PHASE 3: Final introduction validation:', {
      shouldStart,
      introductionActive: introductionState.isActive,
      databaseShouldShow: databaseValidation.shouldShow,
      databaseDiagnostic: databaseValidation.diagnostic?.diagnosis,
      databaseError: databaseValidation.error
    });

    // Start introduction based on enhanced validation (Principle #7: Transparent)
    if (shouldStart && !introductionState.isActive) {
      console.log('🎯 PHASE 3: Starting Steward Introduction (Final Integration)');
      startIntroduction();
    } else if (!shouldStart) {
      console.log('✅ PHASE 3: Steward Introduction not needed:', {
        reason: databaseValidation.diagnostic?.diagnosis || 'Unknown',
        completed: databaseValidation.diagnostic?.introductionCompleted
      });
    }
  }, [
    isSystemReady, 
    shouldStartIntroduction,
    introductionState.isActive,
    databaseValidation.error,
    startIntroduction
  ]);

  // 🔒 INSIGHTS PAUSED - Feature flag for automatic insight generation
  const AUTO_INSIGHTS_ENABLED = false; // Set to true to re-enable automatic insights
  
  // Phase 3: Enhanced autonomous triggers with advanced intelligence integration
  useEffect(() => {
    // Gate autonomous behaviors during introduction OR during background report generation
    if (introductionState.isActive || isGeneratingReport) {
      return;
    }

    // 🔒 INSIGHTS PAUSED - Only show learning, no automatic insights
    if (AUTO_INSIGHTS_ENABLED) {
      const activityTimer = setTimeout(() => {
        if (!currentQuestion && !currentInsight && !loading && !isGenerating && !isGeneratingInsight) {
          // Trigger thinking state before generating content
          setIsThinking(true);
          setActiveModule('NIK');
          setModuleActivity(true);
          
          setTimeout(async () => {
            // Phase 3: Build comprehensive intelligence context with proper data handling
            try {
              // Load conversation recoveries (returns void from the hook, so use availableRecoveries)
              await conversationRecovery.loadAvailableRecoveries();
              const conversationContext = conversationRecovery.availableRecoveries || [];
              
              const memoryMetrics = tieredMemory.metrics || { hotHits: 0, warmHits: 0, coldHits: 0, avgLatency: {} };
              const pieInsights = pieEnhancedCoach.pieInsights || [];
              
              // Balanced choice between learning and insight generation
              const shouldGenerateInsight = Math.random() < 0.6; // 60% chance for insight
              
              if (shouldGenerateInsight) {
                // Phase 3: Generate context-aware insights with advanced intelligence
                const advancedContext = {
                  blueprint: blueprintData,
                  communicationStyle: blueprintData?.personality?.userConfidence || 'professional',
                  preferredTone: getPersonalityTraits().includes('Intuitive') ? 'mystic' : 'analytical',
                  timingPattern: userStatistics?.most_productive_day || 'morning',
                  mbtiType: blueprintData?.personality?.likelyType,
                  goals: userGoals,
                  completenessScore,
                  moduleScores: intelligence?.module_scores,
                  // Phase 3: Advanced intelligence context
                  conversationHistory: conversationContext.slice(0, 3), // Last 3 conversations
                  memoryMetrics: {
                    hotHits: memoryMetrics.hotHits || 0,
                    warmHits: memoryMetrics.warmHits || 0,
                    coldHits: memoryMetrics.coldHits || 0,
                    avgLatency: memoryMetrics.avgLatency || {}
                  },
                  pieInsights: pieInsights.filter((insight: any) => insight.priority === 'high').slice(0, 2),
                  personalityEngine: {
                    oraclePromptAvailable: !!generateOraclePrompt,
                    timingPreferences: getOptimalTimingPreferences()
                  }
                };
                
                console.log('🔮 Phase 3: Advanced autonomous insight generation:', {
                  mbtiType: advancedContext.mbtiType,
                  conversationHistory: advancedContext.conversationHistory.length,
                  memoryHits: advancedContext.memoryMetrics.hotHits,
                  pieInsightsCount: advancedContext.pieInsights.length
                });
                
                await triggerInsightCheck('periodic_activity', { 
                  source: 'autonomous_trigger',
                  advancedContext 
                });
                await refreshIntelligence();
              } else {
                // Phase 3: Generate context-aware micro-learning with advanced intelligence
                const comprehensiveContext = {
                  personality: {
                    traits: getPersonalityTraits(),
                    mbtiType: blueprintData?.personality?.likelyType || 'Unknown',
                    communicationStyle: blueprintData?.personality?.userConfidence || 'neutral',
                    blueprint: blueprintData
                  },
                  goals: userGoals,
                  statistics: userStatistics,
                  profile: userProfile,
                  user360: {
                    completenessScore,
                    dataAvailability,
                    profile: user360Profile
                  },
                  moduleScores: intelligence?.module_scores,
                  intelligenceLevel: intelligence?.intelligence_level,
                  // Phase 3: Advanced context integration
                  conversationMemory: {
                    recentConversations: conversationContext.slice(0, 2),
                    totalConversations: conversationContext.length
                  },
                  tieredMemory: {
                    hotHits: memoryMetrics.hotHits || 0,
                    warmHits: memoryMetrics.warmHits || 0,
                    avgLatency: memoryMetrics.avgLatency || {},
                    isLoaded: tieredMemory.isInitialized || false
                  },
                  pieIntelligence: {
                    insights: pieInsights.slice(0, 3),
                    enabled: pieEnhancedCoach.pieEnabled || false,
                    initialized: pieEnhancedCoach.pieInitialized || false
                  }
                };
                
                console.log('🎯 Phase 3: Advanced autonomous micro-learning:', {
                  personalityTraits: comprehensiveContext.personality.traits,
                  mbtiType: comprehensiveContext.personality.mbtiType,
                  conversationMemorySize: comprehensiveContext.conversationMemory.totalConversations,
                  tieredMemoryHits: comprehensiveContext.tieredMemory.hotHits,
                  pieInsightsCount: comprehensiveContext.pieIntelligence.insights.length,
                  intelligenceLevel: comprehensiveContext.intelligenceLevel
                });
                
                await triggerMicroLearning(JSON.stringify(comprehensiveContext));
                await refreshIntelligence();
              }
            } catch (error) {
              console.error('🚨 Phase 3: Error in advanced intelligence integration:', error);
              // Fallback to basic context on error
              const basicContext = {
                personality: {
                  traits: getPersonalityTraits(),
                  mbtiType: blueprintData?.personality?.likelyType || 'Unknown'
                },
                goals: userGoals,
                statistics: userStatistics,
                intelligenceLevel: intelligence?.intelligence_level
              };
              await triggerMicroLearning(JSON.stringify(basicContext));
              await refreshIntelligence();
            }
            
            setIsThinking(false);
            setModuleActivity(false);
          }, 1500);
        }
      }, 2000); // Every 2 seconds check for triggers
      return () => clearTimeout(activityTimer);
    } else {
      // 🔒 INSIGHTS PAUSED - Log when automatic triggers would have fired
      const debugTimer = setTimeout(() => {
        if (!currentQuestion && !currentInsight && !loading && !isGenerating && !isGeneratingInsight) {
          console.log('🔇 [INSIGHTS PAUSED] Would have triggered automatic insight/learning here');
        }
      }, 2000);
      return () => clearTimeout(debugTimer);
    }
  }, [
    introductionState.isActive, 
    isGeneratingReport, 
    currentQuestion, 
    currentInsight, 
    loading, 
    isGenerating, 
    isGeneratingInsight, 
    triggerMicroLearning, 
    triggerInsightCheck, 
    AUTO_INSIGHTS_ENABLED,
    // Phase 3: Advanced dependencies
    conversationRecovery,
    tieredMemory,
    pieEnhancedCoach
  ]);

  // 🔒 INSIGHTS PAUSED - Periodic analytics check (every 60 seconds when active)
  useEffect(() => {
    if (AUTO_INSIGHTS_ENABLED && intelligence && intelligence.interaction_count > 0) {
      const analyticsTimer = setInterval(async () => {
        if (!currentInsight && !isGeneratingInsight) {
          console.log('🔍 Triggering periodic analytics insight check with personality context...');
          
          // Phase 2: Enhanced analytics with personality context
          const personalityContext = {
            blueprint: blueprintData,
            communicationStyle: blueprintData?.personality?.userConfidence || 'professional',
            preferredTone: getPersonalityTraits().includes('Intuitive') ? 'mystic' : 'analytical',
            timingPattern: userStatistics?.most_productive_day || 'morning',
            mbtiType: blueprintData?.personality?.likelyType,
            goals: userGoals,
            completenessScore,
            moduleScores: intelligence?.module_scores
          };
          
          await triggerInsightCheck('intelligence_check', { 
            trigger: 'periodic_analytics',
            personalityContext,
            intelligence_level: intelligence.intelligence_level 
          });
        }
      }, 60000); // Every 60 seconds
      
      return () => clearInterval(analyticsTimer);
    } else if (!AUTO_INSIGHTS_ENABLED && intelligence && intelligence.interaction_count > 0) {
      // 🔒 INSIGHTS PAUSED - Log when analytics would have been triggered
      const debugTimer = setInterval(() => {
        if (!currentInsight && !isGeneratingInsight) {
          console.log('🔇 [INSIGHTS PAUSED] Would have triggered periodic analytics insight check here');
        }
      }, 60000);
      return () => clearTimeout(debugTimer);
    }
  }, [intelligence, currentInsight, isGeneratingInsight, triggerInsightCheck, AUTO_INSIGHTS_ENABLED]);

  // Module activity based on current question or insight
  useEffect(() => {
    if (currentQuestion) {
      setActiveModule(currentQuestion.module);
      setModuleActivity(true);
      
      const clearTimer = setTimeout(() => {
        setModuleActivity(false);
        setActiveModule(undefined);
      }, 3000);
      
      return () => clearTimeout(clearTimer);
    } else if (currentInsight) {
      setActiveModule(currentInsight.module);
      setModuleActivity(true);
      
      const clearTimer = setTimeout(() => {
        setModuleActivity(false);
        setActiveModule(undefined);
      }, 3000);
      
      return () => clearTimeout(clearTimer);
    }
  }, [currentQuestion, currentInsight]);

  const handleOrbClick = () => {
    if (currentQuestion) {
      setShowMicroLearning(true);
      setShowBubble(false);
    } else {
      setShowChat(true);
    }
  };

  const handleBubbleClick = () => {
    if (currentQuestion) {
      setShowMicroLearning(true);
      setShowBubble(false);
    }
  };

  const handleCloseChat = () => {
    setShowChat(false);
  };

  const handleCloseMicroLearning = () => {
    setShowMicroLearning(false);
    setShowBubble(false);
    clearCurrentQuestion();
  };

  const handleLearningComplete = async (growth: number) => {
    // CRITICAL: Refresh intelligence data to show updated levels in real-time
    console.log('🎯 Learning completed, refreshing intelligence for visual update...');
    await refreshIntelligence();
    // Refresh hermetic report status in case report was generated during learning
    refreshHermeticStatus();
    
    // Show module activity based on growth
    if (growth > 0) {
      setModuleActivity(true);
      setTimeout(() => setModuleActivity(false), 2000);
    }
  };

  console.log('FloatingHACSOrb state:', { 
    loading, 
    intelligence, 
    currentQuestion, 
    currentInsight, 
    showBubble, 
    showChat, 
    showMicroLearning,
    isSystemReady,
    // Phase 3: Updated state logging
    databaseValidation: databaseValidation.shouldShow
  });
  
  // Phase 3: Show loading state when system isn't ready
  if (!isSystemReady) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="flex flex-col items-end gap-2">
          {/* Show database errors if any */}
          {databaseValidation.error && (
            <div className="max-w-sm">
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="text-xs text-destructive">
                  Database Error: {databaseValidation.error}
                </div>
              </div>
            </div>
          )}
          
          {/* Loading orb */}
          <div className="p-4 bg-card/95 backdrop-blur border border-border rounded-lg shadow-lg">
            <div className="flex items-center gap-3">
              <IntelligentSoulOrb
                size="sm"
                stage="welcome"
                speaking={false}
                intelligenceLevel={0}
                showProgressRing={false}
                className="animate-pulse"
              />
              <div className="text-sm">
                <div className="font-medium text-card-foreground font-cormorant">
                  {loading ? 'HACS Loading...' : 'System Initializing...'}
                </div>
                <div className="text-muted-foreground font-inter text-xs">
                  {databaseValidation.loading ? 'Validating blueprint...' : 'Preparing intelligence...'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Fixed positioning container */}
      <div className={cn(
        "fixed top-32 right-4 z-50 pointer-events-none",
        className
      )}>
        <div className="relative pointer-events-auto">
          {/* Speech Bubble */}
          <AnimatePresence>
            {showBubble && currentQuestion && (
              <div 
                className="mb-3 cursor-pointer hover:scale-105 transition-transform"
                onClick={handleBubbleClick}
              >
                <SpeechBubble
                  position="top"
                  isVisible={true}
                >
                <div className="text-sm">
                  <div className="font-medium text-primary mb-1">
                    {currentQuestion.module} Learning
                  </div>
                  <div>{currentQuestion.text}</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Click to answer • Quick learning session
                  </div>
                </div>
                </SpeechBubble>
              </div>
            )}
          </AnimatePresence>

          {/* Floating Orb */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer"
            animate={chatLoading ? {
              scale: [1, 1.05, 1],
              opacity: [0.9, 1, 0.9]
            } : {
              scale: 1,
              opacity: 1
            }}
            transition={chatLoading ? {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            } : {
              duration: 0.3,
              ease: "easeOut"
            }}
          >
            <IntelligentSoulOrb
              size="sm"
              stage={orbStage}
              speaking={isGenerating || isGeneratingInsight || isGeneratingReport}
              intelligenceLevel={intelligenceLevel}
              showProgressRing={intelligenceLevel > 0}
              showIntelligenceTooltip={false}
              isThinking={isThinking || chatLoading}
              activeModule={activeModule}
              moduleActivity={moduleActivity || isGeneratingInsight || isGeneratingReport}
              hermeticProgress={hermeticProgress}
              showHermeticProgress={isGeneratingReport || hasHermeticReport}
              onClick={handleOrbClick}
              className="shadow-lg hover:shadow-xl transition-shadow"
            />
          </motion.div>

          {/* Pulse indicator for new questions or insights */}
          {(currentQuestion || (currentInsight && !currentInsight.acknowledged)) && (
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </div>
      </div>

      {/* Background Report Generation Indicator */}
      {isGeneratingReport && (
        <div className="fixed bottom-4 right-4 z-40 bg-card/95 backdrop-blur border border-border rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <IntelligentSoulOrb
              size="sm"
              stage="generating"
              speaking={true}
              intelligenceLevel={intelligenceLevel}
              showProgressRing={true}
              className="animate-pulse"
              hermeticProgress={hermeticProgress}
              showHermeticProgress={isGeneratingReport || hasHermeticReport}
            />
            <div className="text-sm">
              <div className="font-medium text-card-foreground">Soul Alchemist Activating...</div>
              <div className="text-muted-foreground">
                Deep synthesis in progress ({hermeticProgress}%)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insight Display */}
      {currentInsight && !currentInsight.acknowledged && (
        <HACSInsightDisplay
          insight={currentInsight}
          onAcknowledge={() => acknowledgeInsight(currentInsight.id)}
          onDismiss={dismissInsight}
          position="bottom-right"
        />
      )}

      {/* Micro Learning Modal */}
      <HACSMicroLearning
        isOpen={showMicroLearning}
        onClose={handleCloseMicroLearning}
        question={currentQuestion || undefined}
        intelligenceLevel={intelligenceLevel}
        onLearningComplete={handleLearningComplete}
      />

      {/* Chat Overlay */}
      <HACSChatOverlay
        isOpen={showChat}
        onClose={handleCloseChat}
        currentMessage={null}
        intelligenceLevel={intelligenceLevel}
      />

      {/* Steward Introduction Modal */}
      {introductionState.isActive && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card/95 backdrop-blur border border-border rounded-lg shadow-2xl max-w-md w-full mx-4"
          >
            <div className="p-6 text-center">
              {/* Soul Alchemist Orb - Speaking State */}
              <div className="flex justify-center mb-6">
                <IntelligentSoulOrb
                  stage="collecting"
                  speaking={true}
                  pulse={true}
                  size="lg"
                  intelligenceLevel={40}
                  showProgressRing={true}
                  className="animate-pulse"
                />
              </div>
              
              <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2 text-card-foreground">Soul Alchemist</h1>
                <p className="text-sm text-muted-foreground mb-4">Holistic Adaptive Cognitive System</p>
                
                {/* Current step content */}
                {introductionState.steps && introductionState.steps[introductionState.currentStep] && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-3 text-card-foreground">
                      {introductionState.steps[introductionState.currentStep].title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed text-left bg-muted/20 p-4 rounded-lg border-l-4 border-primary">
                      "{introductionState.steps[introductionState.currentStep].message}"
                    </p>
                  </div>
                )}

                <p className="text-sm text-muted-foreground mb-2">
                  Your Soul Alchemist is ready to guide your transformation.
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Blueprint Understanding: 40%</span>
                </div>
              </div>

              {/* Continue button */}
              {introductionState.steps && 
               introductionState.steps[introductionState.currentStep] && 
               introductionState.steps[introductionState.currentStep].showContinue && (
                <button
                  onClick={async () => {
                    // Handle final step - trigger report generation and close modal immediately
                    if (introductionState.currentStep === introductionState.steps.length - 1) {
                      await completeIntroductionWithReport();
                    } else {
                      continueIntroduction();
                    }
                  }}
                  className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors font-medium"
                >
                  {introductionState.currentStep === introductionState.steps.length - 1 
                    ? 'Activate Steward' 
                    : 'Continue'
                  }
                </button>
              )}

              {/* Step indicator */}
              {introductionState.steps && introductionState.steps.length > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  {introductionState.steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === introductionState.currentStep 
                          ? 'bg-primary' 
                          : index < introductionState.currentStep 
                            ? 'bg-primary/50' 
                            : 'bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};
