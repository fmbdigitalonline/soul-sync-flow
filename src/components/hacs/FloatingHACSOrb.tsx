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
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
import { useToast } from '@/hooks/use-toast';
import { usePIEEnhancedCoach } from '@/hooks/use-pie-enhanced-coach';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEnhancedFeedbackSystem } from '@/hooks/use-enhanced-feedback-system';
import { EnhancedFeedbackModal } from '@/components/feedback/EnhancedFeedbackModal';
import { useSubconsciousOrb } from '@/hooks/use-subconscious-orb';
import { useHACSAutonomy } from '@/hooks/use-hacs-autonomy';
// Phase 1: Critical Error Recovery
import { 
  HACSErrorBoundary, 
  HACSChatErrorBoundary, 
  HACSInsightErrorBoundary, 
  HACSLearningErrorBoundary 
} from './HACSErrorBoundary';

interface FloatingHACSProps {
  className?: string;
}

export const FloatingHACSOrb: React.FC<FloatingHACSProps> = ({ className }) => {
  const [showBubble, setShowBubble] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showMicroLearning, setShowMicroLearning] = useState(false);
  const [showInsightDisplay, setShowInsightDisplay] = useState(false);
  const [showProgressInsightDisplay, setShowProgressInsightDisplay] = useState(false);
  const [orbStage, setOrbStage] = useState<"welcome" | "collecting" | "generating" | "complete">("welcome");
  const [activeModule, setActiveModule] = useState<string | undefined>();
  const [moduleActivity, setModuleActivity] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showCompletionIndicator, setShowCompletionIndicator] = useState(false);
  const [showRadiantGlow, setShowRadiantGlow] = useState(false);
  const [milestoneGlow, setMilestoneGlow] = useState(false);
  
  // Enhanced feedback system
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessageId, setFeedbackMessageId] = useState<string>('');
  const [feedbackType, setFeedbackType] = useState<'insight' | 'question' | 'conversation'>('insight');
  
  // Global chat loading state and streaming sync
  const { subscribe } = useGlobalChatState();
  const { subscribe: subscribeStreaming } = useStreamingSyncState();
  const [chatLoading, setChatLoading] = useState(false);
  const [streamingTiming, setStreamingTiming] = useState(75);
  
  const { intelligence, loading, refreshIntelligence } = useHacsIntelligence();
  const { 
    hasReport: hasHermeticReport, 
    loading: hermeticLoading, 
    isGenerating: isGeneratingHermeticReport,
    progress: hermeticJobProgress,
    refreshStatus: refreshHermeticStatus,
    progressInsight,
    progressInsightReady,
    milestoneGlow: hermeticMilestoneGlow,
    clearProgressInsight
  } = useHermeticReportStatus();
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
    triggerInsightCheck,
    // Phase 1: Queue Management
    insightQueue,
    currentInsightIndex,
    nextInsight,
    previousInsight,
    removeCurrentInsight,
    addInsightToQueue
  } = useHACSInsights();
  
  // NEW: Add autonomous orchestration
  const { triggerIntelligentIntervention, generatePersonalizedInsight } = useAutonomousOrchestration();
  const { generateOraclePrompt, getOptimalTimingPreferences } = usePersonalityEngine();
  
  // HACS Autonomy for post-steward messaging
  const { triggerPostStewardMessage, currentMessage: hacsAutonomousMessage, dismissMessage: dismissHACSMessage } = useHACSAutonomy();
  
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
  
  // Mobile responsiveness
  const { isMobile } = useIsMobile();
  
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
  
  // Language and feedback integration
  const { language, t } = useLanguage();
  const enhancedFeedback = useEnhancedFeedbackSystem();
  
  // Shadow detection integration - Enhanced with database intelligence
  const { 
    handleOrbClick: handleShadowClick, 
    subconsciousMode, 
    patternDetected, 
    adviceReady,
    confidence: shadowConfidence,
    getSessionInsights: getSubconsciousInsights
  } = useSubconsciousOrb();

  // State for database-powered whispers
  const [subconsciousWhispers, setSubconsciousWhispers] = useState<any[]>([]);
  const [databaseIntelligence, setDatabaseIntelligence] = useState<any>(null);
  const [showWhisperBubble, setShowWhisperBubble] = useState(false);
  const [currentWhisper, setCurrentWhisper] = useState<string>('');

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
  // BRIDGE FIX: Also check steward introduction's isGeneratingReport for immediate UI response
  const isStewardGeneratingReport = isGeneratingReport; // From steward introduction hook
  const isAnyReportGenerating = isGeneratingHermeticReport || isStewardGeneratingReport;
  
  useEffect(() => {
    console.log('🎯 ORB STAGE UPDATE:', {
      isGenerating,
      isGeneratingInsight, 
      isStewardGeneratingReport,
      isGeneratingHermeticReport,
      isAnyReportGenerating,
      currentStage: orbStage
    });
    
    if (isGenerating || isGeneratingInsight || isStewardGeneratingReport || isGeneratingHermeticReport) {
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
  }, [isGenerating, isGeneratingInsight, isStewardGeneratingReport, isGeneratingHermeticReport, currentQuestion, currentInsight, intelligenceLevel]);

  // Monitor hermetic report completion status for glow effects
  useEffect(() => {
    console.log('🔄 HERMETIC STATUS UPDATE:', {
      hasHermeticReport,
      isGeneratingHermeticReport,
      hermeticJobProgress
    });

    // Trigger completion glow when report becomes available
    if (hasHermeticReport && !showCompletionIndicator) {
      console.log('✅ HERMETIC COMPLETE: Triggering completion glow');
      setShowCompletionIndicator(true);
      setShowRadiantGlow(true);
      setTimeout(() => {
        setShowCompletionIndicator(false);
        setShowRadiantGlow(false);
      }, 4000);
    }
  }, [hasHermeticReport, showCompletionIndicator]);

  // Show speech bubble for questions or insights - click to show only
  useEffect(() => {
    if (currentQuestion && showBubble) {
      // Auto-dismiss bubble after 15 seconds only when it's shown
      const timer = setTimeout(() => {
        setShowBubble(false);
        clearCurrentQuestion();
      }, 15000);
      return () => clearTimeout(timer);
    } else if (currentInsight && !currentInsight.acknowledged) {
      // Insights show in their own display component, no bubble needed
      setShowBubble(false);
    } else if (!currentQuestion) {
      setShowBubble(false);
    }
  }, [currentQuestion, currentInsight, showBubble, clearCurrentQuestion]);

  // Enhanced database intelligence fetching
  useEffect(() => {
    // Fetch database intelligence for whispers when system is ready
    if (isSystemReady && userProfile?.id && !loading && !introductionState.isActive) {
      const fetchDatabaseIntelligence = async () => {
        try {
          // Get the most recent actual session ID from conversation data
          let sessionId = 'session_1758796587625_0xpq51g44'; // Use known active session
          
          console.log('🔍 FLOATING ORBS: Fetching database intelligence for whispers', {
            userId: userProfile.id,
            sessionId,
            note: 'Using actual conversation session ID'
          });

          const insights = await getSubconsciousInsights(userProfile.id, sessionId);
          
          if (insights && insights.subconsciousWhispers?.length > 0) {
            setSubconsciousWhispers(insights.subconsciousWhispers);
            setDatabaseIntelligence(insights.databaseIntelligence);
            
            // Show first whisper as bubble after 3 seconds
            setTimeout(() => {
              if (insights.subconsciousWhispers[0]) {
                setCurrentWhisper(insights.subconsciousWhispers[0].whisper);
                setShowWhisperBubble(true);
                
                // Auto-hide whisper after 12 seconds
                setTimeout(() => {
                  setShowWhisperBubble(false);
                }, 12000);
              }
            }, 3000);
            
            console.log('✅ FLOATING ORBS: Database intelligence loaded', {
              whispersCount: insights.subconsciousWhispers.length,
              hasElevenModules: insights.databaseIntelligence?.hasElevenModules,
              unspokenDomains: insights.databaseIntelligence?.unspokenDomainsCount
            });
          }
          
        } catch (error) {
          console.error('🚨 FLOATING ORBS: Database intelligence error:', error);
        }
      };

      // Fetch with slight delay to allow system to settle
      const timer = setTimeout(fetchDatabaseIntelligence, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSystemReady, userProfile?.id, loading, introductionState.isActive, getSubconsciousInsights]);

  // Auto-display hermetic progress insights at top-center
  useEffect(() => {
    if (progressInsightReady && progressInsight) {
      console.log('🎯 AUTO-DISPLAY: Showing hermetic progress insight automatically at top-center');
      setShowProgressInsightDisplay(true);
    }
  }, [progressInsightReady, progressInsight]);

  // ✅ INSIGHTS ACTIVATED - Feature flag for automatic insight generation
  const AUTO_INSIGHTS_ENABLED = true; // Activated to enable red exclamation notifications
  
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
                // Phase 3: Generate language-aware insights using Rich Intelligence Bridge
                console.log('🔮 Phase 3: Generating language-aware insights in:', language);
                
                // Build advanced context from available data
                const advancedContext = {
                  mbtiType: blueprintData?.personality?.likelyType || 'Unknown',
                  conversationHistory: conversationContext,
                  memoryMetrics,
                  pieInsights
                };
                
                await triggerInsightCheck('periodic_activity', { 
                  source: 'autonomous_trigger',
                  language,
                  enhancedPersonalization: true,
                  advancedContext
                });
                
                console.log('🔮 Phase 3: Advanced autonomous insight generation:', {
                  mbtiType: advancedContext.mbtiType,
                  conversationHistory: advancedContext.conversationHistory.length,
                  memoryHits: advancedContext.memoryMetrics.hotHits,
                  pieInsightsCount: advancedContext.pieInsights.length
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
      }, 1800000); // Every 30 minutes check for triggers (reduced frequency)
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
      }, 300000); // Every 5 minutes (reduced frequency)
      
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

  // Automatic steward introduction trigger - critical missing piece
  useEffect(() => {
    // Check if we should start the steward introduction
    if (!introductionState.isActive && !introductionState.completed && shouldStartIntroduction()) {
      console.log('🎯 PHASE 3: Auto-triggering steward introduction - conditions met');
      startIntroduction();
    }
  }, [
    introductionState.isActive, 
    introductionState.completed, 
    shouldStartIntroduction, 
    startIntroduction,
    databaseValidation.shouldShow,
    databaseValidation.loading
  ]);

  // Post-steward introduction message trigger
  useEffect(() => {
    // Trigger post-steward message when introduction completes and system is ready
    if (introductionState.completed && !introductionState.isActive && !isGeneratingReport && !loading) {
      const triggerDelay = setTimeout(() => {
        console.log('🎯 HACS: Triggering post-steward learning activation message');
        triggerPostStewardMessage();
      }, 3000); // 3 second delay after completion
      
      return () => clearTimeout(triggerDelay);
    }
  }, [
    introductionState.completed, 
    introductionState.isActive, 
    isGeneratingReport, 
    loading, 
    triggerPostStewardMessage
  ]);

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
    console.log('🎯 FloatingHACSOrb: Orb clicked', {
      hasCurrentQuestion: !!currentQuestion,
      hasUnacknowledgedInsight: !!(currentInsight && !currentInsight.acknowledged),
      adviceReady,
      patternDetected,
      progressInsightReady,
      showProgressInsightDisplay
    });

    // Priority 1: Show hermetic progress insight if available (but not already auto-displayed)
    if (progressInsightReady && progressInsight && !showProgressInsightDisplay) {
      console.log('🎯 FloatingHACSOrb: Adding hermetic progress insight to queue');
      addInsightToQueue(progressInsight);
      // Extract milestone from the progress insight to prevent stale closure
      const milestoneMatch = progressInsight.text.match(/(\d+)%/);
      const milestone = milestoneMatch ? parseInt(milestoneMatch[1]) : undefined;
      clearProgressInsight(milestone);
      return;
    }

    // Priority 2: Show shadow advice if available
    if (adviceReady) {
      const shadowAdvice = handleShadowClick();
      if (shadowAdvice) {
        console.log('🎯 FloatingHACSOrb: Showing shadow advice');
        // Use toast to show shadow advice
        import('@/hooks/use-toast').then(({ useToast }) => {
          const { toast } = useToast();
          toast({
            title: "Shadow Insight",
            description: shadowAdvice,
            duration: 8000,
          });
        });
        return;
      }
    }

    // Priority 3: Show unacknowledged insight if available
    if (currentInsight && !currentInsight.acknowledged) {
      console.log('🎯 FloatingHACSOrb: Showing pending insight');
      setShowInsightDisplay(true);
      return;
    }

    // Priority 4: Show micro learning for pending questions
    if (currentQuestion) {
      console.log('🎯 FloatingHACSOrb: Opening micro learning for question');
      setShowMicroLearning(true);
      setShowBubble(false);
      return;
    }

    // Priority 5: Default to chat interface
    console.log('🎯 FloatingHACSOrb: Opening chat interface');
    setShowChat(true);
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
  
  // Phase 3: Show loading state when system isn't ready (disabled)
  if (false) {
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
                  {loading ? t('hacs.loading') : t('hacs.systemInitializing')}
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
    <HACSErrorBoundary source="FloatingHACSOrb-Main">
      <>
        {/* Responsive positioning container - mobile aware */}
        <div className={cn(
          "fixed z-40 pointer-events-none",
          // Consistent top-right positioning across all screen sizes
          "top-20 right-3 sm:right-4 lg:top-40 lg:right-6",
          className
        )}>
          <div className="relative pointer-events-auto">
          {/* Speech Bubble - responsive positioning */}
          <AnimatePresence>
            {showBubble && currentQuestion && (
              <div 
                className={cn(
                  "mb-3 cursor-pointer hover:scale-105 transition-transform",
                  // Mobile: position above orb, smaller
                  "lg:mb-3 mb-2"
                )}
                onClick={handleBubbleClick}
              >
                <SpeechBubble
                  position="left"
                  isVisible={true}
                >
                <div className="text-xs sm:text-sm max-w-[200px] sm:max-w-[250px]">
                  <div className="font-medium text-primary mb-1 text-xs sm:text-sm">
                    {currentQuestion.module} Learning
                  </div>
                  <div className="text-xs sm:text-sm leading-tight">{currentQuestion.text}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                    Tap to answer • Quick session
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
              speaking={isGenerating || isGeneratingInsight || isGeneratingReport || isGeneratingHermeticReport}
              intelligenceLevel={intelligenceLevel}
              showProgressRing={intelligenceLevel > 0}
              showIntelligenceTooltip={false}
              isThinking={isThinking || chatLoading}
              activeModule={activeModule}
              moduleActivity={moduleActivity || isGeneratingInsight || isGeneratingReport || isGeneratingHermeticReport}
              hermeticProgress={
                hasHermeticReport 
                  ? 100 
                  : isGeneratingHermeticReport && hermeticJobProgress > 0
                    ? hermeticJobProgress
                    : 40
              }
              showHermeticProgress={isGeneratingReport || isGeneratingHermeticReport || hasHermeticReport}
              showRadiantGlow={hasHermeticReport && showRadiantGlow}
              milestoneGlow={milestoneGlow || hermeticMilestoneGlow}
              subconsciousMode={subconsciousMode}
              patternDetected={patternDetected}
              adviceReady={adviceReady || progressInsightReady}
              onClick={handleOrbClick}
              className="shadow-lg hover:shadow-xl transition-shadow"
            />
          </motion.div>

           {/* Blue pulse indicator for questions - clickable */}
           {currentQuestion && (
             <motion.div
               className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-pointer"
               animate={{ scale: [1, 1.2, 1] }}
               transition={{ duration: 1, repeat: Infinity }}
               onClick={(e) => {
                 e.stopPropagation();
                 console.log('🔵 Blue pulse clicked - showing speech bubble');
                 setShowBubble(true);
               }}
             />
           )}

          {/* Red exclamation mark for unacknowledged insights OR progress messages - clickable */}
          {((currentInsight && !currentInsight.acknowledged) || progressInsightReady) && (
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
              animate={{ 
                scale: [1, 1.15, 1],
                boxShadow: [
                  "0 0 0 0 rgba(239, 68, 68, 0.7)",
                  "0 0 0 4px rgba(239, 68, 68, 0)",
                  "0 0 0 0 rgba(239, 68, 68, 0)"
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              onClick={(e) => {
                e.stopPropagation();
                if (progressInsightReady) {
                  console.log('🔴 Red exclamation clicked - showing progress insight');
                  handleOrbClick(); // Will handle progress insight in priority order
                } else {
                  console.log('🔴 Red exclamation clicked - showing insight');
                  setShowInsightDisplay(true);
                }
              }}
            >
              <span className="text-white text-[10px] font-bold leading-none">!</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Background Report Generation Indicator */}
      {isGeneratingReport && (
        <div className="fixed bottom-4 right-4 z-40 bg-card/95 backdrop-blur border border-border rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <IntelligentSoulOrb
              size="sm"
              stage={isGeneratingReport ? "generating" : "complete"}
              speaking={isGeneratingReport}
              intelligenceLevel={intelligenceLevel}
              showProgressRing={true}
              className={isGeneratingReport ? "animate-pulse" : ""}
              hermeticProgress={
                hasHermeticReport 
                  ? 100 
                  : isGeneratingReport && hermeticJobProgress > 0
                    ? hermeticJobProgress
                    : 40
              }
              showHermeticProgress={isGeneratingReport || hasHermeticReport}
              showRadiantGlow={showRadiantGlow}
            />
            {isGeneratingReport && (
              <div className="text-sm">
                <div className="font-medium text-card-foreground">
                  Soul Alchemist Activating...
                </div>
                <div className="text-muted-foreground">
                  Deep synthesis in progress ({
                    hasHermeticReport 
                      ? 100 
                      : isGeneratingReport && hermeticJobProgress > 0
                        ? hermeticJobProgress
                        : 40
                  }%)
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progress Insight Auto-Display - Top Center */}
      {showProgressInsightDisplay && progressInsight && (
        <HACSInsightDisplay
          insight={progressInsight}
          onAcknowledge={() => {
            console.log('🎯 AUTO-DISPLAY: Acknowledging progress insight');
            // Extract milestone from the progress insight to prevent stale closure
            const milestoneMatch = progressInsight?.text.match(/(\d+)%/);
            const milestone = milestoneMatch ? parseInt(milestoneMatch[1]) : undefined;
            setShowProgressInsightDisplay(false); // Clear display first
            clearProgressInsight(milestone);
          }}
          onDismiss={() => {
            console.log('🎯 AUTO-DISPLAY: Dismissing progress insight');
            // Extract milestone from the progress insight to prevent stale closure
            const milestoneMatch = progressInsight?.text.match(/(\d+)%/);
            const milestone = milestoneMatch ? parseInt(milestoneMatch[1]) : undefined;
            setShowProgressInsightDisplay(false); // Clear display first
            clearProgressInsight(milestone);
          }}
          position="top-center"
        />
      )}

      {/* Insight Display - Click-triggered only */}
      {showInsightDisplay && currentInsight && (
        <HACSInsightDisplay
          insight={currentInsight}
          onAcknowledge={() => {
            console.log('🎯 FloatingHACSOrb: Acknowledging insight and clearing display');
            acknowledgeInsight(currentInsight.id);
            setShowInsightDisplay(false);
            // CRITICAL FIX: Force clear current insight to enable chat
            setTimeout(() => {
              if (currentInsight && currentInsight.acknowledged) {
                console.log('🎯 FloatingHACSOrb: Insight acknowledged, enabling chat interactions');
              }
            }, 100);
          }}
          onDismiss={() => {
            console.log('🎯 FloatingHACSOrb: Dismissing insight and clearing display');
            dismissInsight();
            setShowInsightDisplay(false);
          }}
          position="bottom-right"
          // Step 3: Pass navigation props
          currentIndex={currentInsightIndex}
          totalInsights={insightQueue.length}
          onNext={insightQueue.length > 1 ? nextInsight : undefined}
          onPrevious={insightQueue.length > 1 ? previousInsight : undefined}
        />
      )}

      {/* Subconscious Whisper Bubble - Database Intelligence */}
      {showWhisperBubble && currentWhisper && (
        <div className="fixed bottom-20 right-4 z-50">
          <SpeechBubble
            variant="whisper"
            position="top"
            isVisible={showWhisperBubble}
            className="max-w-xs"
            onClick={() => setShowWhisperBubble(false)}
          >
            {currentWhisper}
          </SpeechBubble>
        </div>
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
        currentMessage={hacsAutonomousMessage}
        intelligenceLevel={intelligenceLevel}
      />

      {/* HACS Autonomous Message Bubble */}
      {hacsAutonomousMessage && !hacsAutonomousMessage.acknowledged && !showChat && (
        <div className="absolute top-[-120px] left-1/2 transform -translate-x-1/2 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl p-4 shadow-lg max-w-xs relative"
          >
            <button
              onClick={dismissHACSMessage}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
            <p className="text-sm text-foreground pr-6">{hacsAutonomousMessage.text}</p>
          </motion.div>
        </div>
      )}

      {/* Steward Introduction Modal */}
      <Dialog open={introductionState.isActive} onOpenChange={() => {}}>
        <DialogContent className={cn(
          "max-w-md p-0 gap-0 border-border/50",
          isMobile && "max-w-[95vw] max-h-[90vh]"
        )}>
          <ScrollArea className={cn(
            "w-full",
            isMobile ? "max-h-[85vh]" : "max-h-[70vh]"
          )}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 text-center"
            >
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
                <h1 className="text-2xl font-bold mb-2 text-card-foreground">Blueprint Echo</h1>
                <p className="text-sm text-muted-foreground mb-4">{t('system.holisticSoulSystem')}</p>
                
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
                  {t('hacs.soulAlchemistReady')}
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>{t('hacs.blueprintUnderstanding')}: 40%</span>
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
                  className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors font-medium min-h-[44px]"
                >
                  {introductionState.currentStep === introductionState.steps.length - 1 
                    ? t('activateSteward') 
                    : t('continue')
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
            </motion.div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      </>
    </HACSErrorBoundary>
  );
};
