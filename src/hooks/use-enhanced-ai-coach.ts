
import { useState, useEffect } from "react";
import { enhancedAICoachService, AgentType } from "@/services/enhanced-ai-coach-service";
import { UnifiedBlueprintService } from "@/services/unified-blueprint-service";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBlueprintCache } from "@/contexts/BlueprintCacheContext";
import { useStreamingMessage } from "./use-streaming-message";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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

  // Initialize authentication
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("🔐 Enhanced AI Coach Hook: Initializing authentication");
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          console.log("👤 Enhanced AI Coach Hook: User authenticated:", user.id);
          await enhancedAICoachService.setCurrentUser(user.id);
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

  // Update AI service with blueprint data when available
  useEffect(() => {
    if (!authInitialized || blueprintLoading) {
      console.log("⏳ Enhanced AI Coach Hook: Waiting for auth/blueprint initialization");
      return;
    }

    const updateBlueprintStatus = async () => {
      if (hasBlueprint && blueprintData) {
        console.log("🎭 Enhanced AI Coach Hook: Blueprint available, updating AI service with COMPREHENSIVE DATA");
        
        // Validate blueprint completeness
        const validation = UnifiedBlueprintService.validateBlueprint(blueprintData);
        console.log("📊 Blueprint validation result:", validation);
        
        // Update the AI service with complete blueprint
        enhancedAICoachService.updateUserBlueprint(blueprintData);
        
        // Update status for UI
        const summary = UnifiedBlueprintService.extractBlueprintSummary(blueprintData);
        setBlueprintStatus({
          isAvailable: validation.isComplete,
          completionPercentage: validation.completionPercentage,
          summary
        });
        
        console.log("✅ Blueprint system fully initialized with", validation.completionPercentage + "% complete data");
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

  // Load conversation history when component mounts or agent changes
  useEffect(() => {
    if (!authInitialized) return;
    
    const loadHistory = async () => {
      try {
        console.log("📚 Enhanced AI Coach Hook: Loading conversation history for", currentAgent);
        const history = await enhancedAICoachService.loadConversationHistory(currentAgent);
        setMessages(history);
        console.log(`✅ Enhanced AI Coach Hook: Loaded ${history.length} messages for ${currentAgent} mode`);
      } catch (error) {
        console.error("❌ Enhanced AI Coach Hook: Error loading conversation history:", error);
      }
    };

    loadHistory();
  }, [currentAgent, authInitialized]);

  // Save conversation history when messages change
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

  const sendMessage = async (content: string, useStreaming: boolean = true) => {
    if (!content.trim()) return;

    // Use comprehensive blueprint data when available
    const canUsePersona = hasBlueprint && !!blueprintData && blueprintStatus.completionPercentage > 0;
    
    console.log('📤 Enhanced AI Coach Hook: Sending message with COMPREHENSIVE BLUEPRINT STATUS:', {
      contentLength: content.length,
      useStreaming,
      currentAgent,
      hasBlueprint,
      canUsePersona,
      blueprintCompletionPercentage: blueprintStatus.completionPercentage,
      authInitialized,
      blueprintLoading,
      blueprintSummary: blueprintStatus.summary
    });

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
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
        
        console.log('📡 Enhanced AI Coach Hook: Starting streaming with COMPREHENSIVE BLUEPRINT:', {
          canUsePersona,
          blueprintCompletionPercentage: blueprintStatus.completionPercentage,
          currentAgent,
          blueprintAvailable: blueprintStatus.isAvailable
        });
        
        await enhancedAICoachService.sendStreamingMessage(
          content,
          currentSessionId,
          canUsePersona, // Use comprehensive blueprint when available
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
              console.log('✅ Enhanced AI Coach Hook: Streaming complete, response length:', fullResponse.length);
              console.log('🎯 COMPREHENSIVE RESPONSE ANALYSIS:', {
                hasPersonalizedContent: fullResponse.includes(blueprintData?.user_meta?.preferred_name || ''),
                containsPersonalityTraits: fullResponse.includes('MBTI') || fullResponse.includes('Human Design') || fullResponse.includes('Life Path'),
                isGeneric: fullResponse.includes('Creating a full blueprint') || fullResponse.includes('I don\'t have access'),
                responsePreview: fullResponse.substring(0, 200),
                usedBlueprintData: canUsePersona,
                blueprintCompleteness: blueprintStatus.completionPercentage
              });
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
              console.error("❌ Enhanced AI Coach Hook: Streaming error:", error);
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
        console.error("❌ Enhanced AI Coach Hook: Error with streaming:", error);
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
        console.log('📤 Enhanced AI Coach Hook: Sending non-streaming message with comprehensive blueprint integration');
        
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

        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        console.error("❌ Enhanced AI Coach Hook: Error in non-streaming:", error);
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
    console.log("🔄 Enhanced AI Coach Hook: Resetting conversation");
    setMessages([]);
    enhancedAICoachService.clearConversationCache();
  };

  const switchAgent = (newAgent: AgentType) => {
    console.log("🔄 Enhanced AI Coach Hook: Switching agent from", currentAgent, "to", newAgent);
    setCurrentAgent(newAgent);
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
    personaReady: hasBlueprint && !blueprintLoading && blueprintStatus.completionPercentage > 0,
    authInitialized,
    blueprintStatus, // Expose blueprint status for UI
  };
};
