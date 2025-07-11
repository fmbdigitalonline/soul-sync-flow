
import { useState, useEffect, useMemo } from "react";
import { enhancedAICoachService, AgentType } from "@/services/enhanced-ai-coach-service";
import { UnifiedBlueprintService } from "@/services/unified-blueprint-service";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBlueprintCache } from "@/contexts/BlueprintCacheContext";
import { useAuth } from "@/contexts/AuthContext";

export interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  agent_mode?: string;
}

export interface VFPGraphStatus {
  isAvailable: boolean;
  vectorDimensions: number;
  vectorMagnitude?: number;
  personalitySummary: string;
}

export interface BlueprintStatus {
  isAvailable: boolean;
  completionPercentage: number;
  summary: string;
}

export interface UseEnhancedAICoachProps {
  initialAgent?: AgentType;
  pageContext?: string;
}

export function useEnhancedAICoach(
  initialAgent: AgentType = "guide",
  pageContext: string = "general"
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<AgentType>(initialAgent);
  const [streamingContent, setStreamingContent] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [personaReady, setPersonaReady] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [vfpGraphStatus, setVfpGraphStatus] = useState<VFPGraphStatus>({
    isAvailable: false,
    vectorDimensions: 0,
    personalitySummary: "No personality data available"
  });
  const [blueprintStatus, setBlueprintStatus] = useState<BlueprintStatus>({
    isAvailable: false,
    completionPercentage: 0,
    summary: "Blueprint not initialized"
  });

  const { t } = useLanguage();
  const { blueprintData, hasBlueprint, loading: blueprintLoading } = useBlueprintCache();
  const { user } = useAuth();
  
  // Get user's display name - now reactive using useMemo
  const userName = useMemo(() => {
    const resolvedName = blueprintData?.user_meta?.preferred_name ||
                         user?.user_metadata?.preferred_name || 
                         user?.user_metadata?.full_name?.split(' ')[0] || 
                         user?.email?.split('@')[0] || 
                         'friend';
    
    // Debug logging to track name resolution
    console.log(`👤 userName resolved for ${pageContext}:`, {
      resolvedName,
      hasBlueprintData: !!blueprintData,
      blueprintPreferredName: blueprintData?.user_meta?.preferred_name,
      userMetadataPreferredName: user?.user_metadata?.preferred_name,
      userEmail: user?.email,
      fallbackPath: !blueprintData?.user_meta?.preferred_name ? 
        (!user?.user_metadata?.preferred_name ? 
          (!user?.user_metadata?.full_name ? 'email' : 'full_name') : 'user_metadata') : 'blueprint'
    });
    
    return resolvedName;
  }, [blueprintData?.user_meta?.preferred_name, user?.user_metadata?.preferred_name, user?.user_metadata?.full_name, user?.email, pageContext]);

  // Initialize authentication status
  useEffect(() => {
    const checkAuthStatus = () => {
      const isAuthenticated = !!user;
      console.log(`🔐 Auth status check for ${pageContext}:`, { 
        isAuthenticated, 
        userId: user?.id, 
        userName 
      });
      setAuthInitialized(isAuthenticated);
    };

    checkAuthStatus();
  }, [user, pageContext, userName]);

  // Initialize persona readiness
  useEffect(() => {
    const initializePersona = async () => {
      if (!authInitialized || !user?.id) {
        console.log(`⏸️ Skipping persona init for ${pageContext} - auth not ready`);
        return;
      }

      try {
        console.log(`🎭 Initializing persona for ${pageContext} with user: ${userName}`);
        
        // Set current user for the service
        await enhancedAICoachService.setCurrentUser(user.id);
        
        // Update blueprint if available
        if (blueprintData) {
          enhancedAICoachService.updateUserBlueprint(blueprintData);
        }
        
        console.log(`✅ Persona initialization result for ${pageContext}: ready`);
        setPersonaReady(true);
      } catch (error) {
        console.error(`❌ Failed to initialize persona for ${pageContext}:`, error);
        setPersonaReady(false);
      }
    };

    initializePersona();
  }, [authInitialized, user?.id, currentAgent, blueprintData, pageContext, userName]);

  // Update VFP Graph status
  useEffect(() => {
    const updateVFPStatus = async () => {
      if (!hasBlueprint || !blueprintData) {
        setVfpGraphStatus({
          isAvailable: false,
          vectorDimensions: 0,
          personalitySummary: "No blueprint data available"
        });
        return;
      }

      try {
        // For now, create a simple status based on available data
        const hasPersonalityData = !!(
          blueprintData.user_meta ||
          blueprintData.cognition_mbti ||
          blueprintData.energy_strategy_human_design
        );
        
        setVfpGraphStatus({
          isAvailable: hasPersonalityData,
          vectorDimensions: hasPersonalityData ? 128 : 0,
          vectorMagnitude: hasPersonalityData ? 75.5 : 0,
          personalitySummary: hasPersonalityData ? 
            `${userName}'s personality fusion vector (128D)` : 
            "No personality data available"
        });
      } catch (error) {
        console.error('Error updating VFP status:', error);
        setVfpGraphStatus({
          isAvailable: false,
          vectorDimensions: 0,
          personalitySummary: "Error loading personality data"
        });
      }
    };

    updateVFPStatus();
  }, [hasBlueprint, blueprintData, userName]);

  // Update Blueprint status
  useEffect(() => {
    if (!blueprintData) {
      setBlueprintStatus({
        isAvailable: false,
        completionPercentage: 0,
        summary: "No blueprint data"
      });
      return;
    }

    // Calculate completion percentage
    const totalSections = 8;
    let completedSections = 0;

    if (blueprintData.user_meta) completedSections++;
    if (blueprintData.cognition_mbti?.type !== 'Unknown') completedSections++;
    if (blueprintData.energy_strategy_human_design?.type !== 'Unknown') completedSections++;
    if (blueprintData.archetype_western?.sun_sign !== 'Unknown') completedSections++;
    if (blueprintData.archetype_chinese?.animal !== 'Unknown') completedSections++;
    if (blueprintData.values_life_path?.life_path_number) completedSections++;
    if (blueprintData.goal_stack) completedSections++;
    if (blueprintData.bashar_suite) completedSections++;

    const percentage = Math.round((completedSections / totalSections) * 100);

    setBlueprintStatus({
      isAvailable: hasBlueprint,
      completionPercentage: percentage,
      summary: `${userName}'s blueprint (${percentage}% complete)`
    });
  }, [blueprintData, hasBlueprint, userName]);

  const sendMessage = async (
    content: string,
    usePersonalization: boolean = true,
    context?: any,
    agentOverride?: AgentType
  ) => {
    if (!content.trim()) return;

    console.log(`💬 Sending message in ${pageContext}:`, {
      content: content.substring(0, 100) + '...',
      usePersonalization,
      currentAgent: agentOverride || currentAgent,
      authInitialized,
      blueprintLoading,
      userName
    });

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
      agent_mode: agentOverride || currentAgent
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Create integration report and effective agent BEFORE using them
      const integrationReport = {
        blueprintLoaded: hasBlueprint,
        blueprintData: blueprintData || null,
        personaInitialized: personaReady,
        userAuthenticated: authInitialized,
        contextualData: context || {},
        userDisplayName: userName
      };

      const effectiveAgent = agentOverride || currentAgent;
      
      console.log(`🚀 Sending message via enhanced AI coach service for ${pageContext}:`, {
        hasPersona: personaReady,
        agent: effectiveAgent,
        userDisplayName: userName,
        personalization: usePersonalization,
        context: {
          pageContext,
          currentAgent: effectiveAgent,
          blueprintAvailable: integrationReport.blueprintLoaded,
          userName
        }
      });

      console.log(`📊 Integration report for ${pageContext}:`, {
        ...integrationReport,
        effectiveAgent,
        pageContext
      });

      console.log(`🎯 About to call sendStreamingMessage with:`, {
        messageContent: content.substring(0, 50) + '...',
        usePersonalization,
        integrationReport: {
          blueprintLoaded: integrationReport.blueprintLoaded,
          personaInitialized: integrationReport.personaInitialized,
          userAuthenticated: integrationReport.userAuthenticated,
          userDisplayName: integrationReport.userDisplayName
        },
        effectiveAgent,
        context: {
          pageContext,
          currentAgent: effectiveAgent,
          blueprintAvailable: integrationReport.blueprintLoaded,
          userName
        }
      });
      
      const sessionId = enhancedAICoachService.createNewSession(effectiveAgent);
      
      await enhancedAICoachService.sendStreamingMessage(
        content,
        sessionId,
        usePersonalization,
        effectiveAgent,
        "en",
        {
          onStreamStart: () => {
            console.log(`🌊 Stream started for ${pageContext}`);
            setIsStreaming(true);
            setStreamingContent("");
          },
          onChunk: (chunk: string) => {
            console.log(`📝 Stream chunk received for ${pageContext}:`, chunk.substring(0, 50) + '...');
            setStreamingContent(prev => prev + chunk);
          },
          onComplete: (fullContent: string) => {
            console.log(`✅ Stream completed for ${pageContext}:`, fullContent.substring(0, 100) + '...');
            
            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: fullContent,
              sender: "assistant",
              timestamp: new Date(),
              agent_mode: effectiveAgent
            };

            setMessages(prev => [...prev, assistantMessage]);
            setIsStreaming(false);
            setStreamingContent("");
            setIsLoading(false);
          },
          onError: (error: string) => {
            console.error(`❌ Stream error for ${pageContext}:`, error);
            setIsStreaming(false);
            setStreamingContent("");
            setIsLoading(false);
          }
        },
        userName
      );
    } catch (error) {
      console.error(`💥 Error sending message for ${pageContext}:`, error);
      setIsLoading(false);
    }
  };

  const switchAgent = (newAgent: AgentType) => {
    console.log(`🔄 Switching agent in ${pageContext}:`, { from: currentAgent, to: newAgent, userName });
    setCurrentAgent(newAgent);
  };

  const resetConversation = () => {
    console.log(`🔄 Resetting conversation for ${pageContext}`, { userName });
    setMessages([]);
    setStreamingContent("");
    setIsStreaming(false);
    setIsLoading(false);
  };

  const recordVFPGraphFeedback = (messageId: string, isPositive: boolean) => {
    console.log(`👍 Recording VFP feedback for ${pageContext}:`, { 
      messageId, 
      isPositive, 
      userName,
      currentAgent 
    });
    // TODO: Implement VFP feedback recording
  };

  return {
    messages,
    isLoading,
    sendMessage,
    resetConversation,
    currentAgent,
    switchAgent,
    streamingContent,
    isStreaming,
    personaReady,
    authInitialized,
    blueprintStatus,
    vfpGraphStatus,
    recordVFPGraphFeedback,
    acsEnabled: false,
    acsState: 'NORMAL' as const,
    userName
  };
}
