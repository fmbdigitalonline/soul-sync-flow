
import { useState, useCallback, useEffect } from "react";
import { aiCoachService, AICoachResponse } from "@/services/ai-coach-service";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export function useAICoach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
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

  // Send a message to the AI Coach
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !user) return;

      try {
        // Add user message to state
        const userMessage: Message = {
          id: Date.now().toString(),
          content,
          sender: "user",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        // Call the AI Coach service
        const response = await aiCoachService.sendMessage(content, sessionId, true);

        // Add AI response to state
        const aiMessage: Message = {
          id: `ai_${Date.now().toString()}`,
          content: response.response,
          sender: "ai",
          timestamp: new Date(),
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
    [sessionId, user, toast]
  );

  return {
    messages,
    isLoading,
    sendMessage,
    resetConversation,
    sessionId,
  };
}
