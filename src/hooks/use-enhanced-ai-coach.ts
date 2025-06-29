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

export const useEnhancedAICoach = (defaultAgent: AgentType = "guide") => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<AgentType>(defaultAgent);
  const [currentSessionId] = useState(() => enhancedAICoachService.createNewSession(defaultAgent));
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
  } = useACSIntegration(user?.id || null, true); // Enable ACS by default

  // Initialize authentication with enhanced VFP-Graph integration
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("🔐 Enhanced AI Coach Hook: Initializing with VFP-Graph integration services");
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          console.log("👤 Enhanced AI Coach Hook: User authenticated for VFP-Graph:", user.id);
          await enhancedAICoachService.setCurrentUser(user.id);
          
          // Load VFP-Graph status
          await loadVFPGraphStatus();
          
          // Trigger blueprint sync
          await blueprintAIIntegrationService.performBlueprintSync();
          
          setAuthInitialized(true);
        } else {
          console.log("👤 Enhanced AI Coach Hook: No authenticated user");
          setAuthInitialized(true);
        }
      } catch (error) {
        console.error("❌ Enhanced AI Coach Hook: Auth initialization error:", error);
        setAuthInitialized(true);
      }
    };

    initializeAuth();
  }, [user]);

  const loadVFPGraphStatus = async () => {
    try {
      const status = await enhancedAICoachService.getVFPGraphStatus();
      setVFPGraphStatus(status);
      console.log("✅ VFP-Graph status loaded:", status);
    } catch (error) {
      console.error("❌ Error loading VFP-Graph status:", error);
    }
  };

  // Enhanced blueprint status monitoring with VFP-Graph integration
  useEffect(() => {
    if (!authInitialized || blueprintLoading) {
      console.log("⏳ Enhanced AI Coach Hook: Waiting for auth/blueprint initialization");
      return;
    }

    const updateBlueprintStatus = async () => {
      if (hasBlueprint && blueprintData) {
        console.log("🎭 Enhanced AI Coach Hook: Blueprint available, triggering VFP-Graph enhanced integration");
        
        try {
          // Force blueprint sync to ensure consistency
          const syncResult = await blueprintAIIntegrationService.forceBlueprintSync();
          console.log("🔄 Blueprint sync result:", syncResult);
          
          // Generate integration report
          const integrationReport = await blueprintAIIntegrationService.generateIntegrationReport();
          console.log("📊 Blueprint integration report:", integrationReport);
          
          // Update blueprint status
          const summary = UnifiedBlueprintService.extractBlueprintSummary(blueprintData);
          setBlueprintStatus({
            isAvailable: integrationReport.blueprintLoaded,
            completionPercentage: integrationReport.completionPercentage,
            summary
          });
          
          // Refresh VFP-Graph status
          await loadVFPGraphStatus();
          
          console.log("✅ Enhanced blueprint and VFP-Graph system fully initialized");
        } catch (error) {
          console.error("❌ Enhanced blueprint integration error:", error);
          // Fallback to basic blueprint handling
          const validation = UnifiedBlueprintService.validateBlueprint(blueprintData);
          const summary = UnifiedBlueprintService.extractBlueprintSummary(blueprintData);
          setBlueprintStatus({
            isAvailable: validation.isComplete,
            completionPercentage: validation.completionPercentage,
            summary
          });
        }
      } else {
        console.log("⚠️ Enhanced AI Coach Hook: No blueprint data available");
        setBlueprintStatus({
          isAvailable: false,
          completionPercentage: 0,
          summary: 'No blueprint data available'
        });
      }
    };

    updateBlueprintStatus();
  }, [authInitialized, hasBlueprint, blueprintData, blueprintLoading]);

  // Enhanced conversation history loading with memory integration and ACS
  useEffect(() => {
    if (!authInitialized) return;
    
    const loadHistory = async () => {
      try {
        console.log("📚 Enhanced AI Coach Hook: Loading conversation history with memory integration and ACS");
        const history = await enhancedAICoachService.loadConversationHistory(currentAgent);
        
        // Also load relevant memories for context
        if (user) {
          const memoryReport = await enhancedMemoryService.generateConsistencyReport();
          console.log("🧠 Memory integration status:", memoryReport.consistencyScore + "% consistency");
        }
        
        setMessages(history);
        console.log(`✅ Enhanced AI Coach Hook: Loaded ${history.length} messages for ${currentAgent} mode with ACS: ${acsEnabled}`);
      } catch (error) {
        console.error("❌ Enhanced AI Coach Hook: Error loading conversation history:", error);
      }
    };

    loadHistory();
  }, [currentAgent, authInitialized, user, acsEnabled]);

  // Enhanced conversation history saving
  useEffect(() => {
    if (!authInitialized || messages.length === 0) return;
    
    const saveHistory = async () => {
      try {
        await enhancedAICoachService.saveConversationHistory(currentAgent, messages);
        console.log(`💾 Enhanced AI Coach Hook: Saved ${messages.length} messages for ${currentAgent} mode`);
      } catch (error) {
        console.error("❌ Enhanced AI Coach Hook: Error saving conversation history:", error);
      }
    };

    const timeoutId = setTimeout(saveHistory, 1000);
    return () => clearTimeout(timeoutId);
  }, [messages, currentAgent, authInitialized]);

  const sendMessage = async (content: string, useStreaming: boolean = true, displayMessage?: string) => {
    if (!content.trim()) return;

    // Enhanced blueprint and VFP-Graph integration check
    const integrationReport = await blueprintAIIntegrationService.generateIntegrationReport();
    const canUsePersona = integrationReport.blueprintLoaded && integrationReport.completionPercentage > 0;
    const hasVFPGraph = vfpGraphStatus.isAvailable;
    
    console.log('📤 Enhanced AI Coach Hook: Sending message with VFP-GRAPH and ACS ENHANCED INTEGRATION:', {
      contentLength: content.length,
      useStreaming,
      currentAgent,
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

    // Process user message through ACS
    if (acsEnabled && acsInitialized) {
      acsProcessUserMessage(content);
    }

    // Use displayMessage if provided (for clean UI display), otherwise use the full content
    const messageToDisplay = displayMessage || content;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageToDisplay,
      sender: "user",
      timestamp: new Date(),
      agentType: currentAgent,
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
        agentType: currentAgent,
        isStreaming: true,
      };

      setMessages(prev => [...prev, assistantMessage]);
      startStreaming();

      try {
        let accumulatedContent = '';
        
        console.log('📡 Enhanced AI Coach Hook: Starting VFP-GRAPH and ACS ENHANCED streaming:', {
          canUsePersona,
          hasVFPGraph,
          integrationScore: integrationReport.integrationScore,
          currentAgent,
          blueprintAvailable: integrationReport.blueprintLoaded,
          acsEnabled,
          acsState
        });
        
        await enhancedAICoachService.sendStreamingMessage(
          content,
          currentSessionId,
          canUsePersona,
          currentAgent,
          language,
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
              console.log('✅ VFP-Graph and ACS Enhanced streaming complete, response length:', fullResponse.length);
              
              // Process assistant message through ACS
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
              console.error("❌ VFP-Graph and ACS Enhanced streaming error:", error);
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
        console.error("❌ VFP-Graph and ACS Enhanced streaming error:", error);
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
    console.log("🔄 VFP-Graph and ACS Enhanced AI Coach Hook: Resetting conversation");
    setMessages([]);
    enhancedAICoachService.clearConversationCache();
  };

  const switchAgent = (newAgent: AgentType) => {
    console.log("🔄 VFP-Graph and ACS Enhanced AI Coach Hook: Switching agent from", currentAgent, "to", newAgent);
    setCurrentAgent(newAgent);
  };

  const recordVFPGraphFeedback = async (messageId: string, isPositive: boolean) => {
    try {
      await enhancedAICoachService.recordVFPGraphFeedback(messageId, isPositive);
      
      // Also record ACS feedback for learning
      if (acsEnabled && acsInitialized) {
        acsRecordFeedback(isPositive ? 'positive' : 'negative', `VFP-Graph feedback: ${isPositive ? 'thumbs up' : 'thumbs down'}`);
      }
      
      console.log(`✅ VFP-Graph and ACS feedback recorded from hook: ${isPositive ? '👍' : '👎'}`);
    } catch (error) {
      console.error("❌ Error recording VFP-Graph and ACS feedback from hook:", error);
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
