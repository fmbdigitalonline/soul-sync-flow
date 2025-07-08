
import { useState, useEffect } from "react";
import { enhancedAICoachService, AgentType } from "@/services/enhanced-ai-coach-service";
import { UnifiedBlueprintService } from "@/services/unified-blueprint-service";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBlueprintCache } from "@/contexts/BlueprintCacheContext";
import { useStreamingMessage } from "./use-streaming-message";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { blueprintAIIntegrationService } from "@/services/blueprint-ai-integration-service";
import { enhancedMemoryService } from "@/services/enhanced-memory-service";
import { useACSIntegration } from './use-acs-integration';

export interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  agentType?: AgentType;
  isStreaming?: boolean;
}

// Domain to agent type mapping for consistency
const DOMAIN_AGENT_MAPPING = {
  'companion': 'blend' as AgentType,
  'dreams': 'guide' as AgentType,
  'spiritual-growth': 'coach' as AgentType,
  'productivity': 'guide' as AgentType,
  'coach': 'blend' as AgentType, // Legacy support
} as const;

type DomainType = keyof typeof DOMAIN_AGENT_MAPPING;

export const useEnhancedAICoach = (defaultAgent: AgentType = "guide", pageContext: string = 'coach') => {
  // Ensure correct agent type based on domain
  const mappedAgent = DOMAIN_AGENT_MAPPING[pageContext as DomainType] || defaultAgent;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<AgentType>(mappedAgent);
  
  // Create domain-isolated session ID
  const [currentSessionId] = useState(() => {
    const timestamp = Date.now();
    return `${pageContext}_${mappedAgent}_${timestamp}`;
  });
  
  const [authInitialized, setAuthInitialized] = useState(false);
  const [blueprintStatus, setBlueprintStatus] = useState<{
    isAvailable: boolean;
    completionPercentage: number;
    summary: string;
  }>({ isAvailable: false, completionPercentage: 0, summary: 'Loading...' });
  const [vfpGraphStatus, setVFPGraphStatus] = useState<{
    isAvailable: boolean;
    vectorDimensions: number;
    personalitySummary: string;
    vectorMagnitude: number;
  }>({ isAvailable: false, vectorDimensions: 0, personalitySummary: 'Loading...', vectorMagnitude: 0 });
  
  const { language } = useLanguage();
  const { blueprintData, hasBlueprint, loading: blueprintLoading } = useBlueprintCache();
  const { user } = useAuth();
  
  const {
    streamingContent,
    isStreaming,
    addStreamingChunk,
    startStreaming,
    completeStreaming,
    resetStreaming,
  } = useStreamingMessage();

  // ACS Integration
  const {
    isInitialized: acsInitialized,
    currentState: acsState,
    processUserMessage: acsProcessUserMessage,
    processAssistantMessage: acsProcessAssistantMessage,
    recordFeedback: acsRecordFeedback,
    getEnhancedSystemPrompt: acsGetEnhancedSystemPrompt,
    getGenerationParams: acsGetGenerationParams,
    isEnabled: acsEnabled
  } = useACSIntegration(user?.id || null, true);

  // Initialize authentication with enhanced VFP-Graph integration
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log(`🔐 Enhanced AI Coach Hook: Initializing ${pageContext} domain with ${mappedAgent} agent`);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          console.log(`👤 Enhanced AI Coach Hook: User authenticated for ${pageContext}:`, user.id);
          await enhancedAICoachService.setCurrentUser(user.id);
          
          // Load VFP-Graph status
          await loadVFPGraphStatus();
          
          // Trigger blueprint sync
          await blueprintAIIntegrationService.performBlueprintSync();
          
          setAuthInitialized(true);
        } else {
          console.log(`👤 Enhanced AI Coach Hook: No authenticated user for ${pageContext}`);
          setAuthInitialized(true);
        }
      } catch (error) {
        console.error(`❌ Enhanced AI Coach Hook: Auth initialization error for ${pageContext}:`, error);
        setAuthInitialized(true);
      }
    };

    initializeAuth();
  }, [user, pageContext, mappedAgent]);

  const loadVFPGraphStatus = async () => {
    try {
      const status = await enhancedAICoachService.getVFPGraphStatus();
      const statusWithMagnitude = {
        ...status,
        vectorMagnitude: status.vectorMagnitude ?? 0
      };
      setVFPGraphStatus(statusWithMagnitude);
      console.log(`✅ VFP-Graph status loaded for ${pageContext}:`, statusWithMagnitude);
    } catch (error) {
      console.error(`❌ Error loading VFP-Graph status for ${pageContext}:`, error);
    }
  };

  // Enhanced blueprint status monitoring with VFP-Graph integration
  useEffect(() => {
    if (!authInitialized || blueprintLoading) {
      console.log(`⏳ Enhanced AI Coach Hook: Waiting for auth/blueprint initialization for ${pageContext}`);
      return;
    }

    const updateBlueprintStatus = async () => {
      if (hasBlueprint && blueprintData) {
        console.log(`🎭 Enhanced AI Coach Hook: Blueprint available for ${pageContext}, triggering VFP-Graph enhanced integration`);
        
        try {
          const syncResult = await blueprintAIIntegrationService.forceBlueprintSync();
          console.log(`🔄 Blueprint sync result for ${pageContext}:`, syncResult);
          
          const integrationReport = await blueprintAIIntegrationService.generateIntegrationReport();
          console.log(`📊 Blueprint integration report for ${pageContext}:`, integrationReport);
          
          const summary = UnifiedBlueprintService.extractBlueprintSummary(blueprintData);
          setBlueprintStatus({
            isAvailable: integrationReport.blueprintLoaded,
            completionPercentage: integrationReport.completionPercentage,
            summary
          });
          
          await loadVFPGraphStatus();
          
          console.log(`✅ Enhanced blueprint and VFP-Graph system fully initialized for ${pageContext}`);
        } catch (error) {
          console.error(`❌ Enhanced blueprint integration error for ${pageContext}:`, error);
          const validation = UnifiedBlueprintService.validateBlueprint(blueprintData);
          const summary = UnifiedBlueprintService.extractBlueprintSummary(blueprintData);
          setBlueprintStatus({
            isAvailable: validation.isComplete,
            completionPercentage: validation.completionPercentage,
            summary
          });
        }
      } else {
        console.log(`⚠️ Enhanced AI Coach Hook: No blueprint data available for ${pageContext}`);
        setBlueprintStatus({
          isAvailable: false,
          completionPercentage: 0,
          summary: 'No blueprint data available'
        });
      }
    };

    updateBlueprintStatus();
  }, [authInitialized, hasBlueprint, blueprintData, blueprintLoading, pageContext]);

  // Enhanced conversation history loading with memory integration and ACS - DOMAIN ISOLATED
  useEffect(() => {
    if (!authInitialized) return;
    
    const loadHistory = async () => {
      try {
        console.log(`📚 Enhanced AI Coach Hook: Loading domain-isolated conversation history for ${pageContext} with ${currentAgent}`);
        
        // Load conversation history with domain isolation
        const history = await enhancedAICoachService.loadConversationHistoryWithDomain(currentAgent, pageContext);
        
        if (user) {
          const memoryReport = await enhancedMemoryService.generateConsistencyReport();
          console.log(`🧠 Memory integration status for ${pageContext}:`, memoryReport.consistencyScore + "% consistency");
        }
        
        setMessages(history);
        console.log(`✅ Enhanced AI Coach Hook: Loaded ${history.length} domain-isolated messages for ${pageContext}/${currentAgent} with ACS: ${acsEnabled}`);
      } catch (error) {
        console.error(`❌ Enhanced AI Coach Hook: Error loading conversation history for ${pageContext}:`, error);
      }
    };

    loadHistory();
  }, [currentAgent, authInitialized, user, acsEnabled, pageContext]);

  // Enhanced conversation history saving - DOMAIN ISOLATED
  useEffect(() => {
    if (!authInitialized || messages.length === 0) return;
    
    const saveHistory = async () => {
      try {
        await enhancedAICoachService.saveConversationHistoryWithDomain(currentAgent, pageContext, messages);
        console.log(`💾 Enhanced AI Coach Hook: Saved ${messages.length} domain-isolated messages for ${pageContext}/${currentAgent}`);
      } catch (error) {
        console.error(`❌ Enhanced AI Coach Hook: Error saving conversation history for ${pageContext}:`, error);
      }
    };

    const timeoutId = setTimeout(saveHistory, 1000);
    return () => clearTimeout(timeoutId);
  }, [messages, currentAgent, authInitialized, pageContext]);

  const sendMessage = async (content: string, useStreaming: boolean = true, displayMessage?: string, contextOverride?: string) => {
    if (!content.trim()) return;

    const effectiveContext = contextOverride || pageContext;
    const effectiveAgent = DOMAIN_AGENT_MAPPING[effectiveContext as DomainType] || currentAgent;

    const integrationReport = await blueprintAIIntegrationService.generateIntegrationReport();
    const canUsePersona = integrationReport.blueprintLoaded && integrationReport.completionPercentage > 0;
    const hasVFPGraph = vfpGraphStatus.isAvailable;
    
    console.log(`📤 Enhanced AI Coach Hook: Sending message for ${effectiveContext} with ${effectiveAgent} agent:`, {
      contentLength: content.length,
      useStreaming,
      currentAgent: effectiveAgent,
      integrationScore: integrationReport.integrationScore,
      canUsePersona,
      hasVFPGraph,
      vfpGraphDimensions: vfpGraphStatus.vectorDimensions,
      blueprintCompletionPercentage: integrationReport.completionPercentage,
      authInitialized,
      blueprintLoading,
      acsEnabled,
      acsState
    });

    if (acsEnabled && acsInitialized) {
      acsProcessUserMessage(content);
    }

    const messageToDisplay = displayMessage || content;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageToDisplay,
      sender: "user",
      timestamp: new Date(),
      agentType: effectiveAgent,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    resetStreaming();

    if (useStreaming) {
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        content: "",
        sender: "assistant",
        timestamp: new Date(),
        agentType: effectiveAgent,
        isStreaming: true,
      };

      setMessages(prev => [...prev, assistantMessage]);
      startStreaming();

      try {
        let accumulatedContent = '';
        
        console.log(`📡 Enhanced AI Coach Hook: Starting domain-isolated streaming for ${effectiveContext}:`, {
          canUsePersona,
          hasVFPGraph,
          integrationScore: integrationReport.integrationScore,
          currentAgent: effectiveAgent,
          blueprintAvailable: integrationReport.blueprintLoaded,
          acsEnabled,
          acsState
        });
        
        await enhancedAICoachService.sendStreamingMessageWithDomain(
          content,
          currentSessionId,
          canUsePersona,
          effectiveAgent,
          language,
          effectiveContext,
          {
            onChunk: (chunk: string) => {
              accumulatedContent += chunk;
              addStreamingChunk(chunk);
              
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: accumulatedContent, isStreaming: true }
                    : msg
                )
              );
            },
            onComplete: (fullResponse: string) => {
              console.log(`✅ Domain-isolated streaming complete for ${effectiveContext}, response length:`, fullResponse.length);
              
              if (acsEnabled && acsInitialized) {
                acsProcessAssistantMessage(fullResponse);
              }
              
              completeStreaming();
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: fullResponse || accumulatedContent, isStreaming: false }
                    : msg
                )
              );
              setIsLoading(false);
            },
            onError: (error: Error) => {
              console.error(`❌ Domain-isolated streaming error for ${effectiveContext}:`, error);
              completeStreaming();
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: accumulatedContent || "Sorry, there was an error. Please try again.", isStreaming: false }
                    : msg
                )
              );
              setIsLoading(false);
            }
          }
        );
      } catch (error) {
        console.error(`❌ Domain-isolated streaming error for ${effectiveContext}:`, error);
        completeStreaming();
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: "Sorry, there was an error. Please try again.", isStreaming: false }
              : msg
          )
        );
        setIsLoading(false);
      }
    } else {
      try {
        console.log('📤 Enhanced AI Coach Hook: Sending non-streaming message with VFP-Graph and ACS enhancement');
        
        const response = await enhancedAICoachService.sendMessage(
          content,
          currentSessionId,
          canUsePersona,
          currentAgent,
          language
        );

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.response,
          sender: "assistant",
          timestamp: new Date(),
          agentType: currentAgent,
        };

        // Process assistant message through ACS
        if (acsEnabled && acsInitialized) {
          acsProcessAssistantMessage(response.response);
        }

        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        console.error("❌ VFP-Graph and ACS Enhanced non-streaming error:", error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: language === 'nl' ? 
            "Sorry, er is een fout opgetreden. Probeer het later opnieuw." : 
            "Sorry, there was an error. Please try again later.",
          sender: "assistant",
          timestamp: new Date(),
          agentType: currentAgent,
        };

        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetConversation = () => {
    console.log(`🔄 Enhanced AI Coach Hook: Resetting domain-isolated conversation for ${pageContext}`);
    setMessages([]);
    enhancedAICoachService.clearConversationCacheForDomain(pageContext);
  };

  const switchAgent = (newAgent: AgentType) => {
    console.log(`🔄 Enhanced AI Coach Hook: Switching agent from ${currentAgent} to ${newAgent} for ${pageContext}`);
    setCurrentAgent(newAgent);
  };

  const recordVFPGraphFeedback = async (messageId: string, isPositive: boolean) => {
    try {
      await enhancedAICoachService.recordVFPGraphFeedback(messageId, isPositive);
      
      if (acsEnabled && acsInitialized) {
        acsRecordFeedback(isPositive ? 'positive' : 'negative', `VFP-Graph feedback from ${pageContext}: ${isPositive ? 'thumbs up' : 'thumbs down'}`);
      }
      
      console.log(`✅ VFP-Graph and ACS feedback recorded from ${pageContext}: ${isPositive ? '👍' : '👎'}`);
    } catch (error) {
      console.error(`❌ Error recording VFP-Graph and ACS feedback from ${pageContext}:`, error);
    }
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
    sessionId: currentSessionId,
    personaReady: hasBlueprint && !blueprintLoading && blueprintStatus.completionPercentage > 0,
    authInitialized,
    blueprintStatus,
    vfpGraphStatus,
    recordVFPGraphFeedback,
    
    // ACS integration
    acsEnabled,
    acsState,
    acsInitialized,
    recordACSFeedback: acsRecordFeedback,
  };
};
