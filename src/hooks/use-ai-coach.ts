
import { useState, useEffect } from "react";
import { aiCoachService, AgentType } from "@/services/ai-coach-service";
import { useLanguage } from "@/contexts/LanguageContext";

export interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  agentType?: AgentType;
  isStreaming?: boolean;
}

export const useAICoach = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<AgentType>("guide");
  const [currentSessionId] = useState(() => aiCoachService.createNewSession());
  const { language } = useLanguage();

  const sendMessage = async (content: string, useStreaming: boolean = true) => {
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

    if (useStreaming) {
      // Create assistant message with empty content for streaming
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

      try {
        await aiCoachService.sendStreamingMessage(
          content,
          currentSessionId,
          true,
          currentAgent,
          language,
          {
            onChunk: (chunk: string) => {
              console.log('Received chunk:', chunk);
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: msg.content + chunk }
                    : msg
                )
              );
            },
            onComplete: (fullResponse: string) => {
              console.log('Streaming complete, full response length:', fullResponse.length);
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: fullResponse, isStreaming: false }
                    : msg
                )
              );
              setIsLoading(false);
            },
            onError: (error: Error) => {
              console.error("Streaming error:", error);
              // Remove the empty streaming message and fall back to non-streaming
              setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
              handleNonStreamingMessage(content);
            }
          }
        );
      } catch (error) {
        console.error("Error with streaming, falling back:", error);
        // Remove the empty streaming message and fall back to non-streaming
        setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
        handleNonStreamingMessage(content);
      }
    } else {
      handleNonStreamingMessage(content);
    }
  };

  const handleNonStreamingMessage = async (content: string, existingMessageId?: string) => {
    try {
      const response = await aiCoachService.sendMessage(
        content,
        currentSessionId,
        true,
        currentAgent,
        language
      );

      const assistantMessage: Message = {
        id: existingMessageId || (Date.now() + 1).toString(),
        content: response.response,
        sender: "assistant",
        timestamp: new Date(),
        agentType: currentAgent,
      };

      if (existingMessageId) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === existingMessageId ? assistantMessage : msg
          )
        );
      } else {
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: existingMessageId || (Date.now() + 1).toString(),
        content: language === 'nl' ? "Sorry, er is een fout opgetreden. Probeer het later opnieuw." : "Sorry, there was an error. Please try again later.",
        sender: "assistant",
        timestamp: new Date(),
        agentType: currentAgent,
      };

      if (existingMessageId) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === existingMessageId ? errorMessage : msg
          )
        );
      } else {
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetConversation = () => {
    setMessages([]);
  };

  const switchAgent = (newAgent: AgentType) => {
    setCurrentAgent(newAgent);
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
