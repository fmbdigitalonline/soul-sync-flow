
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
  const { toast } = useToast();
  const { user } = useAuth();

  // Initialize session ID
  useEffect(() => {
    if (!sessionId) {
      setSessionId(aiCoachService.createNewSession());
    }
  }, [sessionId]);

  // Create a new session
  const resetConversation = useCallback(() => {
    setMessages([]);
    setSessionId(aiCoachService.createNewSession());
  }, []);

  // Switch agent type
  const switchAgent = useCallback((agentType: AgentType) => {
    setCurrentAgent(agentType);
    // Add a system message to indicate the switch
    const systemMessage: Message = {
      id: `system_${Date.now()}`,
      content: `Switched to ${agentType === "coach" ? "Soul Coach" : agentType === "guide" ? "Soul Guide" : "Blend"} mode`,
      sender: "ai",
      timestamp: new Date(),
      agentType,
    };
    setMessages((prev) => [...prev, systemMessage]);
  }, []);

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

        // Call the AI Coach service
        const response = await aiCoachService.sendMessage(content, sessionId, true, activeAgent);

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
    [sessionId, user, toast, currentAgent]
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
