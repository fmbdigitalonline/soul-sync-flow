
import { useState, useCallback, useEffect } from "react";
import { aiCoachService, AICoachResponse, AgentType } from "@/services/ai-coach-service";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  agentType?: AgentType;
}

export function useAICoach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [currentAgent, setCurrentAgent] = useState<AgentType>("guide");
  const [conversationContext, setConversationContext] = useState<string>("");
  const { toast } = useToast();
  const { user } = useAuth();

  // Initialize session ID
  useEffect(() => {
    if (!sessionId) {
      setSessionId(aiCoachService.createNewSession());
    }
  }, [sessionId]);

  // Build conversation context from recent messages
  const buildContext = useCallback((messages: Message[]) => {
    const recentMessages = messages.slice(-6); // Last 6 messages for context
    return recentMessages.map(msg => 
      `${msg.sender === "user" ? "User" : "Assistant"}: ${msg.content}`
    ).join("\n");
  }, []);

  // Create a new session
  const resetConversation = useCallback(() => {
    setMessages([]);
    setSessionId(aiCoachService.createNewSession());
    setConversationContext("");
  }, []);

  // Switch agent type with context preservation
  const switchAgent = useCallback((agentType: AgentType) => {
    const previousAgent = currentAgent;
    setCurrentAgent(agentType);
    
    // Build context from recent conversation
    const context = buildContext(messages);
    setConversationContext(context);
    
    // Add a system message to indicate the switch with context
    const systemMessage: Message = {
      id: `system_${Date.now()}`,
      content: `Switched to ${
        agentType === "coach" ? "Soul Coach" : 
        agentType === "guide" ? "Soul Guide" : 
        "Soul Companion"
      } mode. Your conversation context has been preserved.`,
      sender: "ai",
      timestamp: new Date(),
      agentType,
    };
    
    setMessages((prev) => [...prev, systemMessage]);
    
    // Show toast notification
    toast({
      title: "Agent Switch",
      description: `Now chatting with your ${
        agentType === "coach" ? "Soul Coach" : 
        agentType === "guide" ? "Soul Guide" : 
        "Soul Companion"
      }. Your conversation context is preserved.`,
    });
  }, [currentAgent, messages, buildContext, toast]);

  // Send a message to the AI Coach
  const sendMessage = useCallback(
    async (content: string, agentType?: AgentType) => {
      if (!content.trim() || !user) return;

      const activeAgent = agentType || currentAgent;

      try {
        // Add user message to state
        const userMessage: Message = {
          id: Date.now().toString(),
          content,
          sender: "user",
          timestamp: new Date(),
          agentType: activeAgent,
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        // Include conversation context for agent switches
        const messageWithContext = conversationContext 
          ? `Previous conversation context:\n${conversationContext}\n\nCurrent message: ${content}`
          : content;

        // Call the AI Coach service
        const response = await aiCoachService.sendMessage(
          messageWithContext, 
          sessionId, 
          true, 
          activeAgent
        );

        // Clear context after first message with new agent
        if (conversationContext) {
          setConversationContext("");
        }

        // Add AI response to state
        const aiMessage: Message = {
          id: `ai_${Date.now().toString()}`,
          content: response.response,
          sender: "ai",
          timestamp: new Date(),
          agentType: activeAgent,
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (error) {
        console.error("Error sending message to AI Coach:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to get response from Soul Coach",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, user, toast, currentAgent, conversationContext]
  );

  return {
    messages,
    isLoading,
    sendMessage,
    resetConversation,
    sessionId,
    currentAgent,
    switchAgent,
  };
}
