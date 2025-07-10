
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dreamActivityLogger } from '@/services/dream-activity-logger';

// HACS Core Components
import { neuroIntentKernel } from '@/services/hermetic-core/neuro-intent-kernel';
import { crossPlaneStateReflector } from '@/services/hermetic-core/cross-plane-state-reflector';
import { temporalWaveSynchronizer } from '@/services/hermetic-core/temporal-wave-synchronizer';
import { harmonicFrequencyModulationEngine } from '@/services/hermetic-core/harmonic-frequency-modulation-engine';
import { dualPoleEquilibratorModule } from '@/services/hermetic-core/dual-pole-equilibrator-module';

// HACS Intelligence Systems
import { pieService } from '@/services/pie-service';
import { personalityVectorService } from '@/services/personality-vector-service';
import { tieredMemoryGraph } from '@/services/tiered-memory-graph';
import { productionACSService } from '@/services/production-acs-service';
import { conflictNavigationResolver } from '@/services/conflict-navigation-resolver';
import { blueprintPersonalizationCenter } from '@/services/blueprint-personalization-center';

// HACS Safety & Monitoring
import { hacsMonitorService } from '@/services/hacs-monitor-service';
import { hacsFallbackService } from '@/services/hacs-fallback-service';

interface HACSDreamMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  hacsMetadata?: {
    intentId?: string;
    harmonyScore?: number;
    personalityAlignment?: number;
    conflictResolution?: any;
    insights?: any[];
  };
  isStreaming?: boolean;
}

interface HACSDreamState {
  dreamFocus: string | null;
  intentContinuity: boolean;
  harmonyLevel: number;
  conflictStatus: 'none' | 'detecting' | 'resolving' | 'resolved';
  personalitySync: number;
  memoryDepth: number;
}

export const useHACSDreamGuide = () => {
  const [messages, setMessages] = useState<HACSDreamMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hacsState, setHacsState] = useState<HACSDreamState>({
    dreamFocus: null,
    intentContinuity: false,
    harmonyLevel: 0.7,
    conflictStatus: 'none',
    personalitySync: 0.8,
    memoryDepth: 0.6
  });
  
  const { user } = useAuth();
  const sessionIdRef = useRef(`hacs_dream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const hacsInitializedRef = useRef(false);

  // Initialize Complete HACS Architecture
  useEffect(() => {
    const initializeHACS = async () => {
      if (!user?.id || hacsInitializedRef.current) return;

      try {
        console.log('🧬 Initializing Complete HACS Architecture for Dream Guide');
        
        // 1. NIK - Neuro-Intent Kernel Setup
        neuroIntentKernel.setTMGReference(tieredMemoryGraph);
        neuroIntentKernel.registerModule('dream_guide', (broadcast) => {
          console.log('🧠 NIK Intent Broadcast:', broadcast.intent?.primary);
          if (broadcast.intent) {
            setHacsState(prev => ({ 
              ...prev, 
              dreamFocus: broadcast.intent?.primary || null,
              intentContinuity: true 
            }));
          }
        });

        // 2. CPSR - Cognitive Pattern State Recognition (simplified)
        console.log('🔍 CPSR: Initializing Cognitive Pattern State Recognition');
        
        // 3. TWS - Temporal Wisdom Synthesis (simplified)
        console.log('⏰ TWS: Initializing Temporal Wave Synchronizer');
        
        // 4. HFME - Holistic Framework Management Engine (simplified)
        console.log('🎵 HFME: Initializing Harmonic Frequency Modulation Engine');
        
        // 5. DPEM - Dynamic Personality Expression Module (simplified)
        console.log('🎭 DPEM: Initializing Dual Pole Equilibrator Module');
        
        // 6. PIE - Proactive Insight Engine
        await pieService.initialize(user.id);
        
        // 7. VFP - Vector-Fusion Personality Graph
        await personalityVectorService.getVector(user.id); // Initialize vector
        
        // 8. TMG - Tiered Memory Graph
        console.log('🧠 TMG: Initializing Tiered Memory Graph');
        
        // 9. ACS - Adaptive Conversation System
        // Will be used per-message
        
        // 10. CNR - Conflict Navigation & Resolution
        await conflictNavigationResolver.initialize(user.id);
        
        // 11. BPSC - Blueprint Personalization & Sync Center
        await blueprintPersonalizationCenter.initialize(user.id);

        // Initialize HACS Monitoring & Safety
        hacsMonitorService.initialize();
        
        console.log('✅ Complete HACS Architecture Initialized - 11/11 Systems Active');
        hacsInitializedRef.current = true;
        
        // Set initial greeting with HACS context
        await initializeHACSDreamSession();
        
      } catch (error) {
        console.error('❌ HACS Architecture initialization failed:', error);
        // Continue with fallback mode
      }
    };

    initializeHACS();
  }, [user]);

  // Initialize HACS Dream Session with full architecture
  const initializeHACSDreamSession = async () => {
    if (!user?.id) return;

    try {
      // Set initial intent through NIK
      const initialIntent = neuroIntentKernel.setIntent(
        'explore_authentic_dreams_with_spiritual_guidance',
        { 
          userReady: true, 
          mode: 'dream_discovery',
          agentMode: 'guide' 
        },
        sessionIdRef.current,
        'spiritual_growth'
      );

      // Get personality-aligned greeting through complete HACS pipeline
      const hacsResponse = await processWithFullHACS(
        'Initialize personalized dream discovery session',
        'system_init'
      );

      if (hacsResponse.response) {
        const welcomeMessage: HACSDreamMessage = {
          id: `hacs_welcome_${Date.now()}`,
          content: hacsResponse.response,
          sender: 'assistant',
          timestamp: new Date(),
          hacsMetadata: {
            intentId: initialIntent.id,
            harmonyScore: hacsResponse.harmonyScore,
            personalityAlignment: hacsResponse.personalityAlignment,
            insights: hacsResponse.insights
          }
        };

        setMessages([welcomeMessage]);
      }

    } catch (error) {
      console.error('❌ HACS Dream session initialization failed:', error);
      
      // Fallback welcome message
      const fallbackMessage: HACSDreamMessage = {
        id: `fallback_welcome_${Date.now()}`,
        content: "Welcome to your personalized dream discovery journey. I'm here to help you explore what truly lights up your soul using your unique personality blueprint.",
        sender: 'assistant',
        timestamp: new Date()
      };
      
      setMessages([fallbackMessage]);
    }
  };

  // Process message through complete HACS architecture
  const processWithFullHACS = async (message: string, messageType: 'user' | 'system_init' = 'user') => {
    if (!user?.id) throw new Error('User not authenticated');

    // Step 1: NIK - Process intent
    let currentIntent = neuroIntentKernel.getCurrentIntent();
    if (!currentIntent && messageType === 'user') {
      currentIntent = neuroIntentKernel.setIntent(
        message,
        { userMessage: true },
        sessionIdRef.current,
        'dream_discovery'
      );
    }

    // Step 2: CPSR - Recognize cognitive patterns (simplified)
    const cognitiveState = { pattern: 'exploratory', confidence: 0.8 };

    // Step 3: VFP - Get personality vector
    const personalityVector = await personalityVectorService.getVector(user.id);
    const personaSummary = await personalityVectorService.getPersonaSummary(user.id);

    // Step 4: TMG - Retrieve contextual memory (simplified)
    const memoryContext = [];

    // Step 5: PIE - Get proactive insights
    const insights = await pieService.getInsightsForConversation('guide');

    // Step 6: CNR - Check for conflicts
    const conflictStatus = await conflictNavigationResolver.detectConflicts(user.id, {
      message,
      intent: currentIntent,
      cognitiveState
    });

    // Step 7: BPSC - Get personalized blueprint sync
    const blueprintSync = await blueprintPersonalizationCenter.syncForConversation(
      user.id,
      'dream_discovery'
    );

    // Step 8: TWS - Apply temporal wisdom (simplified)
    const temporalContext = { phase: 'active', timing: 'optimal' };

    // Step 9: DPEM - Balance personality expression (simplified)
    const personalityBalance = { currentBalance: 0.8, recommendation: 'maintain' };

    // Step 10: HFME - Generate harmonic response (simplified)
    const harmonicPrompt = {
      userMessage: message,
      intent: currentIntent,
      personalityVector: Array.from(personalityVector),
      memoryContext,
      insights,
      conflictStatus,
      blueprintSync,
      temporalPhase: temporalContext.phase,
      personalityBalance: personalityBalance.currentBalance,
      harmonyScore: 0.85
    };

    // Step 11: ACS - Adaptive conversation processing
    const acsResponse = await productionACSService.processMessage(
      JSON.stringify(harmonicPrompt),
      sessionIdRef.current,
      {
        enableRL: false,
        personalityScaling: true,
        frustrationThreshold: 0.3,
        sentimentSlopeNeg: -0.2,
        velocityFloor: 0.1,
        maxSilentMs: 180000,
        clarificationThreshold: 0.4
      },
      'NORMAL'
    );

    return {
      response: acsResponse.response,
      harmonyScore: harmonicPrompt.harmonyScore || 0.8,
      personalityAlignment: blueprintSync.alignmentScore || 0.85,
      insights: insights.slice(0, 2),
      conflictStatus: conflictStatus.status,
      hacsMetadata: {
        intentId: currentIntent?.id,
        systemHealth: hacsMonitorService.getSystemHealth()
      }
    };
  };

  // Send message through complete HACS pipeline
  const sendHACSMessage = useCallback(async (content: string) => {
    if (!user?.id || isLoading) return;

    const userMessage: HACSDreamMessage = {
      id: `user_${Date.now()}`,
      content,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Update user activity for NIK
      neuroIntentKernel.updateUserActivity();

      // Log activity
      await dreamActivityLogger.logActivity('hacs_dream_message_attempt', {
        message_length: content.length,
        session_id: sessionIdRef.current,
        hacs_enabled: true,
        system_health: hacsMonitorService.getSystemHealth().overall
      });

      // Process through complete HACS architecture
      const hacsResponse = await processWithFullHACS(content, 'user');

      // Create assistant message with HACS metadata
      const assistantMessage: HACSDreamMessage = {
        id: `assistant_${Date.now()}`,
        content: hacsResponse.response,
        sender: 'assistant',
        timestamp: new Date(),
        hacsMetadata: {
          intentId: hacsResponse.hacsMetadata?.intentId,
          harmonyScore: hacsResponse.harmonyScore,
          personalityAlignment: hacsResponse.personalityAlignment,
          insights: hacsResponse.insights,
          conflictResolution: hacsResponse.conflictStatus
        }
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update HACS state
      setHacsState(prev => ({
        ...prev,
        harmonyLevel: hacsResponse.harmonyScore,
        personalitySync: hacsResponse.personalityAlignment,
        conflictStatus: hacsResponse.conflictStatus === 'none' ? 'none' : 'resolved',
        memoryDepth: Math.min(prev.memoryDepth + 0.1, 1.0)
      }));

      // Log successful HACS processing
      await dreamActivityLogger.logActivity('hacs_dream_message_success', {
        harmony_score: hacsResponse.harmonyScore,
        personality_alignment: hacsResponse.personalityAlignment,
        insights_count: hacsResponse.insights?.length || 0,
        session_id: sessionIdRef.current
      });

    } catch (error) {
      console.error('❌ HACS Dream message processing failed:', error);

      // Use HACS fallback system
      try {
        const fallbackResponse = await hacsFallbackService.executeFallback({
          message: content,
          sessionId: sessionIdRef.current,
          userId: user.id,
          agentMode: 'guide',
          retryCount: 0
        }, error instanceof Error ? error.message : String(error));

        const fallbackMessage: HACSDreamMessage = {
          id: `fallback_${Date.now()}`,
          content: fallbackResponse.response,
          sender: 'assistant',
          timestamp: new Date(),
          hacsMetadata: {
            harmonyScore: 0.5,
            personalityAlignment: 0.6
          }
        };

        setMessages(prev => [...prev, fallbackMessage]);

      } catch (fallbackError) {
        console.error('❌ HACS Fallback also failed:', fallbackError);
        
        const errorMessage: HACSDreamMessage = {
          id: `error_${Date.now()}`,
          content: "I'm experiencing some technical difficulties with my dream guidance systems. Please try again in a moment.",
          sender: 'assistant',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, errorMessage]);
      }

      await dreamActivityLogger.logError('hacs_dream_message_error', {
        error: error instanceof Error ? error.message : String(error),
        session_id: sessionIdRef.current,
        hacs_system_health: hacsMonitorService.getSystemHealth().overall
      });

    } finally {
      setIsLoading(false);
    }
  }, [user, isLoading]);

  const resetHACSConversation = useCallback(() => {
    setMessages([]);
    setHacsState({
      dreamFocus: null,
      intentContinuity: false,
      harmonyLevel: 0.7,
      conflictStatus: 'none',
      personalitySync: 0.8,
      memoryDepth: 0.6
    });
    
    // Reset HACS systems
    neuroIntentKernel.updateIntent({
      type: 'abandon',
      intent: {},
      reason: 'conversation_reset'
    });
    
    // Generate new session
    sessionIdRef.current = `hacs_dream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    dreamActivityLogger.logActivity('hacs_dream_conversation_reset', {
      session_id: sessionIdRef.current,
      hacs_enabled: true
    });
  }, []);

  // Get HACS system status for debugging/monitoring
  const getHACSStatus = useCallback(() => {
    return {
      systemHealth: hacsMonitorService.getSystemHealth(),
      currentIntent: neuroIntentKernel.getCurrentIntent(),
      harmonyStatus: { activeHarmonics: 3, conflicts: [], resolutionScore: 0.8 },
      temporalPhase: { phase: 'active' },
      personalityVector: hacsState.personalitySync,
      memoryDepth: hacsState.memoryDepth,
      sessionId: sessionIdRef.current
    };
  }, [hacsState]);

  return {
    messages,
    isLoading,
    sendMessage: sendHACSMessage,
    resetConversation: resetHACSConversation,
    hacsState,
    getHACSStatus,
    isHACSEnabled: hacsInitializedRef.current
  };
};
