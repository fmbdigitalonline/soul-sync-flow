import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IntelligentSoulOrb } from '@/components/ui/intelligent-soul-orb';
import { SpeechBubble } from '@/components/ui/speech-bubble';
import { useHacsIntelligence } from '@/hooks/use-hacs-intelligence';
import { supabase } from '@/integrations/supabase/client';
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
import { useTutorialFlow } from '@/hooks/use-tutorial-flow';
import { StewardActivationCompletionScreen } from '@/components/steward/StewardActivationCompletionScreen';
import { HACSLoadingDiagnostics } from './HACSLoadingDiagnostics';
import { useGlobalChatState } from '@/hooks/use-global-chat-state';
import { useStreamingSyncState } from '@/hooks/use-streaming-sync-state';
import { useUser360 } from '@/hooks/use-user-360';
import { useBlueprintData } from '@/hooks/use-blueprint-data';
import { useUserProfile } from '@/hooks/use-user-profile';
// Phase 3: Advanced Intelligence Integration
import { useConversationRecovery } from '@/hooks/use-conversation-recovery';
import { useTieredMemory } from '@/hooks/use-tiered-memory';
import { toast } from '@/hooks/use-toast';
import { usePIEEnhancedCoach } from '@/hooks/use-pie-enhanced-coach';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEnhancedFeedbackSystem } from '@/hooks/use-enhanced-feedback-system';
import { EnhancedFeedbackModal } from '@/components/feedback/EnhancedFeedbackModal';
import { useSubconsciousOrb } from '@/hooks/use-subconscious-orb';
// NEW: Multi-Dimensional XP Progression System
import { useXPProgression } from '@/hooks/use-xp-progression';
// NEW: Orb Presence Controller (Singularity Principle)
import { useOrbPresence } from '@/hooks/use-orb-presence';
import { Progress } from '@/components/ui/progress';
// Phase 1: Critical Error Recovery
import { 
  HACSErrorBoundary, 
  HACSChatErrorBoundary, 
  HACSInsightErrorBoundary, 
  HACSLearningErrorBoundary 
} from './HACSErrorBoundary';

interface FloatingHACSProps {
  className?: string;
  enablePointerFollow?: boolean;
}

export const FloatingHACSOrb: React.FC<FloatingHACSProps> = ({ className, enablePointerFollow = true }) => {
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
  const [dismissalCooldown, setDismissalCooldown] = useState(false);
  
  // Enhanced feedback system
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessageId, setFeedbackMessageId] = useState<string>('');
  const [feedbackType, setFeedbackType] = useState<'insight' | 'question' | 'conversation'>('insight');
  
  // Global chat loading state and streaming sync
  const { subscribe } = useGlobalChatState();
  const { subscribe: subscribeStreaming } = useStreamingSyncState();
  const [chatLoading, setChatLoading] = useState(false);
  const [streamingTiming, setStreamingTiming] = useState(75);
  
  // NEW: Orb Presence System (Singularity Principle)
  const { 
    mode: orbPresenceMode, 
    isCenterLoading,
    loadingMessage,
    loadingProgress,
    startLoading: startOrbLoading,
    completeLoading: completeOrbLoading,
    setChatOpen
  } = useOrbPresence();
  
  const { intelligence, loading, refreshIntelligence } = useHacsIntelligence();
  
  // NEW: XP Progression System
  const { progress: xpProgress, loading: xpLoading } = useXPProgression();
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
  const insightQueueRef = useRef(insightQueue);
  
  // NEW: Add autonomous orchestration
  const { triggerIntelligentIntervention, generatePersonalizedInsight } = useAutonomousOrchestration();
  const { generateOraclePrompt, getOptimalTimingPreferences } = usePersonalityEngine();
  
  // Phase 3: Enhanced introduction system with database integration
  const {
    introductionState,
    isGeneratingReport,
    showCompletionScreen,
    startIntroduction,
    continueIntroduction,
    completeIntroductionWithReport,
    closeCompletionScreen,
    shouldStartIntroduction,
    databaseValidation
  } = useStewardIntroductionEnhanced();

  // Phase 2: Database-driven Steward Introduction validation
  const stewardDatabase = useStewardIntroductionDatabase();
  
  // Tutorial flow for completion screen
  const { startTutorial } = useTutorialFlow();

  // Mobile responsiveness
  const { isMobile } = useIsMobile();

  // Floating orb cursor follow with idle return-to-home
  const [orbPosition, setOrbPosition] = useState({ x: 0, y: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const pointerMoveFrame = useRef<number | null>(null);
  const moveDelayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveringRef = useRef(false);
  const lastPointerPositionRef = useRef<{ x: number; y: number }>({
    x: typeof window !== 'undefined' ? window.innerWidth - 100 : 0,
    y: 160
  });
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const IDLE_TIMEOUT_MS = 2500; // Return to home after 2.5s idle
  
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
    getSessionInsights: getSubconsciousInsights,
    processMessage // PHASE 2 FIX: Extract processMessage to wire it up
  } = useSubconsciousOrb();

  // State for database-powered whispers
  const [subconsciousWhispers, setSubconsciousWhispers] = useState<any[]>([]);
  const [databaseIntelligence, setDatabaseIntelligence] = useState<any>(null);
  const [showWhisperBubble, setShowWhisperBubble] = useState(false);
  const [currentWhisper, setCurrentWhisper] = useState<string>('');
  const [lastProcessedMessageId, setLastProcessedMessageId] = useState<string | null>(null);
  const [activeConversationSessionId, setActiveConversationSessionId] = useState<string | null>(null);

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

  const shouldFollowPointer = enablePointerFollow && !isMobile;

  const queueFollowMove = useCallback((clientX: number, clientY: number) => {
    if (!shouldFollowPointer) return;

    if (pointerMoveFrame.current !== null) return;

    pointerMoveFrame.current = requestAnimationFrame(() => {
      pointerMoveFrame.current = null;

      const orbSize = 64;
      const offsetX = 320;  // 4x distance - butterfly trailing effect
      const offsetY = -120; // Keep orb above cursor arrow

      const clampedX = Math.min(
        Math.max(clientX + offsetX, orbSize),
        window.innerWidth - orbSize
      );
      const clampedY = Math.min(
        Math.max(clientY + offsetY, orbSize),
        window.innerHeight - orbSize
      );

      if (moveDelayTimeoutRef.current) {
        clearTimeout(moveDelayTimeoutRef.current);
      }

      moveDelayTimeoutRef.current = setTimeout(() => {
        if (isHoveringRef.current) return;
        setIsFollowing(true);
        setOrbPosition({ x: clampedX, y: clampedY });
      }, 1000);
    });
  }, [getHomePosition, queueFollowMove, shouldFollowPointer]);

  // Calculate home position (top-right corner)
  const getHomePosition = useCallback(() => ({
    x: window.innerWidth - 100,
    y: 160 // Matches lg:top-40
  }), []);

  const resumeFollowingFromHover = useCallback((clientX?: number, clientY?: number) => {
    if (!shouldFollowPointer) return;

    const fallback = getHomePosition();
    const x = clientX ?? lastPointerPositionRef.current.x ?? fallback.x;
    const y = clientY ?? lastPointerPositionRef.current.y ?? fallback.y;

    isHoveringRef.current = false;
    queueFollowMove(x, y);
  }, [getHomePosition, queueFollowMove, shouldFollowPointer]);

  useEffect(() => {
    if (!shouldFollowPointer) return;

    // Initialize at home position
    setOrbPosition(getHomePosition());
    setIsFollowing(false);

    const returnToHome = () => {
      setIsFollowing(false);
      setOrbPosition(getHomePosition());
    };

    const resetIdleTimeout = () => {
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      idleTimeoutRef.current = setTimeout(returnToHome, IDLE_TIMEOUT_MS);
    };

    const handlePointerMove = (event: PointerEvent) => {
      lastPointerPositionRef.current = { x: event.clientX, y: event.clientY };

      // Clear any pending idle timeout
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }

      if (isHoveringRef.current) return;

      queueFollowMove(event.clientX, event.clientY);

      // Set idle timeout to return home
      resetIdleTimeout();
    };

    // Touch event handler for mobile/tablet - only on finger slide
    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 0) return;

      const touch = event.touches[0];
      lastPointerPositionRef.current = { x: touch.clientX, y: touch.clientY };

      // Clear any pending idle timeout
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }

      if (pointerMoveFrame.current !== null) return;

      queueFollowMove(touch.clientX, touch.clientY);

      // Set idle timeout to return home
      resetIdleTimeout();
    };

    // Return home when touch ends
    const handleTouchEnd = () => {
      resetIdleTimeout();
    };

    const handleResize = () => {
      // Always snap back to home on resize to avoid weird off-screen states
      setOrbPosition(getHomePosition());
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);

      if (pointerMoveFrame.current !== null) {
        cancelAnimationFrame(pointerMoveFrame.current);
        pointerMoveFrame.current = null;
      }
      if (moveDelayTimeoutRef.current) {
        clearTimeout(moveDelayTimeoutRef.current);
        moveDelayTimeoutRef.current = null;
      }
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = null;
      }
    };
  }, [shouldFollowPointer]);

  useEffect(() => {
    insightQueueRef.current = insightQueue;
  }, [insightQueue]);

  // Use XP-based progress if available, otherwise fall back to legacy intelligence level
  const intelligenceLevel = intelligence?.intelligence_level || 0;
  const displayProgress = xpProgress?.percent ?? intelligenceLevel;

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
  
  // NEW: Wire hermetic generation to orb presence controller for center loading
  useEffect(() => {
    if (isGeneratingHermeticReport) {
      startOrbLoading('hermetic_generation', hermeticJobProgress || 0);
    } else {
      completeOrbLoading('hermetic_generation');
    }
  }, [isGeneratingHermeticReport, hermeticJobProgress, startOrbLoading, completeOrbLoading]);
  
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

  // PHASE 2 FIX: Wire processMessage to actually trigger on load and conversation changes
  // Subscribe to hacs_conversations for real-time processing
  useEffect(() => {
    if (!isSystemReady || !userProfile?.id) return;

    console.log('🔌 FLOATING ORBS: Wiring processMessage to conversation stream');

    const loadLatestSession = async () => {
      try {
        const { data: latestConversation, error } = await supabase
          .from('hacs_conversations')
          .select('session_id, conversation_data')
          .eq('user_id', userProfile.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('⚠️ FLOATING ORBS: Unable to load latest conversation session', error);
          return;
        }

        if (latestConversation?.session_id) {
          setActiveConversationSessionId(latestConversation.session_id);
          
          // PHASE 3 FIX: Process REAL user message content, not placeholder string
          const conversationData = latestConversation.conversation_data as any;
          // Handle both array and object formats from Supabase
          const messages = Array.isArray(conversationData)
            ? conversationData
            : conversationData?.messages || [];

          if (Array.isArray(messages) && messages.length > 0) {
            const userMessages = messages.filter((m: any) => m.role === 'user');
            const latestUserMsg = userMessages[userMessages.length - 1];
            if (latestUserMsg?.content) {
              console.log('🔄 FLOATING ORBS: Processing latest user message on load', {
                contentPreview: latestUserMsg.content.substring(0, 50)
              });
              await processMessage(latestUserMsg.content, latestUserMsg.id || `initial_${Date.now()}`);
            }
          }
        }
      } catch (sessionError) {
        console.error('⚠️ FLOATING ORBS: Session lookup failed', sessionError);
      }
    };

    loadLatestSession();

    // Subscribe to hacs_conversations for real-time updates
    const channel = supabase
      .channel('orb-conversation-listener')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hacs_conversations',
          filter: `user_id=eq.${userProfile.id}`
        },
        async (payload) => {
          console.log('📨 FLOATING ORBS: New conversation detected', payload);
          const newData = payload.new as any;

          if (newData?.session_id && newData.session_id !== activeConversationSessionId) {
            console.log('🆕 FLOATING ORBS: Updating active session from realtime payload');
            setActiveConversationSessionId(newData.session_id);
          }

          // Extract latest message content from conversation_data
          if (newData?.conversation_data) {
            // Handle both array and object formats from Supabase
            const messages = Array.isArray(newData.conversation_data)
              ? newData.conversation_data
              : newData.conversation_data?.messages || [];

            const userMessages = Array.isArray(messages)
              ? messages.filter((m: any) => m.role === 'user')
              : [];
            const latestMessage = userMessages[userMessages.length - 1];

            if (latestMessage?.content && latestMessage.id !== lastProcessedMessageId) {
              console.log('🔄 FLOATING ORBS: Processing new message via realtime');
              setLastProcessedMessageId(latestMessage.id);
              await processMessage(latestMessage.content, latestMessage.id || `msg_${Date.now()}`);

              const insightContext = {
                source: 'realtime_conversation',
                sessionId: newData.session_id,
                messageId: latestMessage.id || newData.id,
                role: latestMessage.role,
                module: latestMessage.module,
                timestamp: latestMessage.timestamp || newData.created_at,
                content: latestMessage.content
              };

              const realtimeInsight = await triggerInsightCheck('conversation_ended', insightContext);

              if (realtimeInsight && !insightQueueRef.current.some(insight => insight.id === realtimeInsight.id)) {
                addInsightToQueue(realtimeInsight);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 FLOATING ORBS: Unsubscribing from conversation listener');
      supabase.removeChannel(channel);
    };
  }, [
    isSystemReady,
    userProfile?.id,
    processMessage,
    lastProcessedMessageId,
    triggerInsightCheck,
    addInsightToQueue,
    activeConversationSessionId
  ]);

  // Enhanced database intelligence fetching
  useEffect(() => {
    // Fetch database intelligence for whispers when system is ready
    if (isSystemReady && userProfile?.id && !loading && !introductionState.isActive) {
      const fetchDatabaseIntelligence = async () => {
        try {
          // Get the most recent actual session ID from conversation data
          const sessionId = activeConversationSessionId;

          if (!sessionId) {
            console.log('🔍 FLOATING ORBS: No active conversation session found for whispers');
            setSubconsciousWhispers([]);
            setDatabaseIntelligence(null);
            return;
          }

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
  }, [
    isSystemReady,
    userProfile?.id,
    loading,
    introductionState.isActive,
    getSubconsciousInsights,
    activeConversationSessionId
  ]);

  // Auto-display hermetic progress insights at top-center - DISABLED (manual only)
  // useEffect(() => {
  //   if (progressInsightReady && progressInsight) {
  //     console.log('🎯 AUTO-DISPLAY: Showing hermetic progress insight automatically at top-center');
  //     setShowProgressInsightDisplay(true);
  //   }
  // }, [progressInsightReady, progressInsight]);
  // ✅ PHASE 1 FIX: Re-enabled automatic insight generation
  // Voice enabled - the system can now proactively communicate with users
  const AUTO_INSIGHTS_ENABLED = true; // Enabled for proactive insight delivery

  // REMOVED: Hermetic progress autonomous triggers (no more automatic spamming)

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

  // Periodic insight checking for conversation insights
  useEffect(() => {
    if (!isSystemReady || !userProfile?.id) return;
    
    console.log('💡 Setting up periodic insight checking...');
    
    // Check for insights every 30 seconds
    const checkInterval = setInterval(async () => {
      // Don't check if there's already a current insight or if we're generating
      if (currentInsight || isGenerating || isGeneratingInsight) {
        console.log('💡 Skipping insight check - already have insight or generating');
        return;
      }
      
      console.log('💡 Periodic insight check - triggering conversation_ended check');
      try {
        await triggerInsightCheck('conversation_ended', { 
          source: 'periodic_check',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('💡 Error in periodic insight check:', error);
      }
    }, 30000); // Check every 30 seconds
    
    return () => {
      console.log('💡 Cleaning up periodic insight checking');
      clearInterval(checkInterval);
    };
  }, [isSystemReady, userProfile?.id, currentInsight, isGenerating, isGeneratingInsight, triggerInsightCheck]);

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
        toast({
          title: "Shadow Insight",
          description: shadowAdvice,
          duration: 8000,
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

  // SINGULARITY PRINCIPLE: When in chat_avatar mode, don't render floating orb
  // The orb will morph into the chat UI as the responder avatar
  if (orbPresenceMode === 'chat_avatar') {
    console.log('🔮 FloatingHACSOrb: Singularity mode - orb morphed into chat avatar');
    return null;
  }

  // CENTER LOADING HUB: Orb moves to center with speech bubble during major operations
  if (isCenterLoading && loadingMessage) {
    return (
      <HACSErrorBoundary source="FloatingHACSOrb-CenterLoading">
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="pointer-events-auto"
          >
            <div className="relative">
              <IntelligentSoulOrb
                size="lg"
                stage="generating"
                speaking={true}
                xpProgress={displayProgress}
                intelligenceLevel={intelligenceLevel}
                showProgressRing={true}
                isThinking={true}
                moduleActivity={true}
                hermeticProgress={loadingProgress ?? 50}
                showHermeticProgress={!!loadingProgress}
                className="shadow-2xl"
              />
              
              {/* Speech bubble with loading message */}
              <SpeechBubble
                position="bottom"
                isVisible={true}
                className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-64"
              >
                <div className="text-center">
                  <div className="text-sm font-medium text-foreground mb-2">
                    {loadingMessage}
                  </div>
                  {loadingProgress !== undefined && loadingProgress > 0 && (
                    <Progress value={loadingProgress} className="h-2" />
                  )}
                </div>
              </SpeechBubble>
            </div>
          </motion.div>
        </div>
      </HACSErrorBoundary>
    );
  }

  const orbContent = (
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
        onMouseEnter={() => {
          isHoveringRef.current = true;
          setIsFollowing(false);
        }}
        onMouseLeave={(event) => {
          resumeFollowingFromHover(event.clientX, event.clientY);
        }}
        onClick={(event) => {
          resumeFollowingFromHover(event.clientX, event.clientY);
          handleOrbClick();
        }}
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
          xpProgress={displayProgress}
          intelligenceLevel={intelligenceLevel}
          showProgressRing={displayProgress > 0}
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
      {((currentInsight && !currentInsight.acknowledged) || progressInsightReady || adviceReady) && (
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
  );

  return (
    <HACSErrorBoundary source="FloatingHACSOrb-Main">
      <>
        {/* Responsive positioning container - mobile aware */}
        {shouldFollowPointer ? (
          <motion.div
            className={cn("fixed z-40 pointer-events-none", className)}
            style={{ top: 0, left: 0 }}
            animate={{ x: orbPosition.x, y: orbPosition.y }}
            transition={{
              type: "spring",
              stiffness: isFollowing ? 18 : 150,  // 80% slower when following
              damping: isFollowing ? 8 : 20,
              mass: isFollowing ? 3.5 : 0.8,      // Much heavier/lazier when following
              restDelta: 0.5
            }}
          >
            {orbContent}
          </motion.div>
        ) : (
          <div className={cn(
            "fixed z-40 pointer-events-none",
            // Consistent top-right positioning across all screen sizes
            "top-20 right-3 sm:right-4 lg:top-40 lg:right-6",
            className
          )}>
            {orbContent}
          </div>
        )}

        {/* Background Report Generation Indicator */}
        {isGeneratingReport && (
          <div className="fixed bottom-4 right-4 z-40 bg-card/95 backdrop-blur border border-border rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <IntelligentSoulOrb
                size="sm"
                stage={isGeneratingReport ? "generating" : "complete"}
                speaking={isGeneratingReport}
                xpProgress={displayProgress}
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
            // Add cooldown to prevent immediate reappearance
            setDismissalCooldown(true);
            setTimeout(() => {
              setDismissalCooldown(false);
            }, 5000); // 5 second cooldown
          }}
          position="below-orb-center"
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
        currentMessage={null}
        intelligenceLevel={intelligenceLevel}
      />

      {/* Steward Introduction Modal */}
      <Dialog open={introductionState.isActive} onOpenChange={() => {}}>
        <DialogContent 
          className={cn(
            "p-0 gap-0 border-border/50 flex flex-col",
            isMobile ? "max-w-[95vw]" : "max-w-md"
          )}
          style={{
            maxHeight: isMobile ? 'calc(85vh - env(safe-area-inset-bottom))' : '85vh'
          }}
        >
          <ScrollArea 
            className="flex-1 touch-pan-y overscroll-contain"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn("text-center pb-32", isMobile ? "p-4 pt-6" : "p-6")}
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

              {/* Step indicator */}
              {introductionState.steps && introductionState.steps.length > 1 && (
                <div className="flex justify-center mt-6 mb-4 space-x-2">
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

          {/* Continue button - Fixed at bottom */}
          {introductionState.steps && 
           introductionState.steps[introductionState.currentStep] && 
           introductionState.steps[introductionState.currentStep].showContinue && (
            <div className="shrink-0 bg-background border-t border-border/50 p-4">
              <button
                onClick={async () => {
                  // Handle final step - trigger report generation and immediately open HACSInsight display
                  if (introductionState.currentStep === introductionState.steps.length - 1) {
                    console.log('🎯 STEWARD ACTIVATION: Button clicked - triggering display immediately');
                    setShowInsightDisplay(true);
                    setDismissalCooldown(false); // Reset cooldown on activation
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
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* NEW: Steward Activation Completion Screen (Principle #8: Only Add) */}
      <StewardActivationCompletionScreen
        isOpen={showCompletionScreen}
        onClose={closeCompletionScreen}
        onStartTutorial={startTutorial}
      />
      </>
    </HACSErrorBoundary>
  );
};
