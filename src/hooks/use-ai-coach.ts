
import { useState, useEffect } from "react";
import { aiCoachService, AgentType } from "@/services/ai-coach-service";
import { useLanguage } from "@/contexts/LanguageContext";

export interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  agentType?: AgentType;
}

export const useAICoach = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<AgentType>("guide");
  const [currentSessionId] = useState(() => aiCoachService.createNewSession());
  const { language } = useLanguage();

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
      agentType: currentAgent,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await aiCoachService.sendMessage(
        content,
        currentSessionId,
        true,
        currentAgent,
        language // Pass the current language
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
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: language === 'nl' ? "Sorry, er is een fout opgetreden. Probeer het later opnieuw." : "Sorry, there was an error. Please try again later.",
        sender: "assistant",
        timestamp: new Date(),
        agentType: currentAgent,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetConversation = () => {
    setMessages([]);
  };

  const switchAgent = (newAgent: AgentType) => {
    setCurrentAgent(newAgent);
    // Optionally reset conversation when switching agents
    // resetConversation();
  };

  return {
    messages,
    isLoading,
    sendMessage,
    resetConversation,
    currentAgent,
    switchAgent,
  };
};
