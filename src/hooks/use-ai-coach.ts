
import { useState, useCallback, useEffect } from "react";
import { aiCoachService, AICoachResponse } from "@/services/ai-coach-service";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  rawResponse?: any; // Add raw response for debug mode
}

export function useAICoach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [debugMode, setDebugMode] = useState(false); // Add debug mode state
  const { toast } = useToast();
  const { user } = useAuth();

  // Initialize session ID
  useEffect(() => {
    if (!sessionId) {
      setSessionId(aiCoachService.createNewSession());
    }
  }, [sessionId]);

  // Save messages to conversation memory
  useEffect(() => {
    const saveConversationMemory = async () => {
      if (messages.length > 0 && user && sessionId) {
        // Format messages for storage
        const messageData = messages.map(msg => ({
          content: msg.content,
          sender: msg.sender,
          timestamp: msg.timestamp.toISOString(),
          rawResponse: msg.rawResponse
        }));
        
        await aiCoachService.saveConversation(sessionId, messageData);
      }
    };
    
    saveConversationMemory();
  }, [messages, user, sessionId]);

  // Toggle debug mode
  const toggleDebugMode = useCallback(() => {
    setDebugMode(prev => !prev);
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

        // Call the AI Coach service with blueprint context
        const response = await aiCoachService.sendMessage(content, sessionId, true, debugMode);

        // Add AI response to state
        const aiMessage: Message = {
          id: `ai_${Date.now().toString()}`,
          content: response.response,
          sender: "ai",
          timestamp: new Date(),
          rawResponse: response.rawResponse, // Include raw response in debug mode
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
    [sessionId, user, toast, debugMode]
  );

  // Create a new session
  const resetConversation = useCallback(() => {
    setMessages([]);
    setSessionId(aiCoachService.createNewSession());
  }, []);

  // Load a specific conversation from memory
  const loadConversation = useCallback(async (conversationSessionId: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { messages: loadedMessages, error } = await aiCoachService.loadConversation(conversationSessionId);
      
      if (error) {
        toast({
          title: "Error",
          description: `Failed to load conversation: ${error}`,
          variant: "destructive",
        });
        return;
      }
      
      if (loadedMessages.length > 0) {
        // Convert loaded messages to the Message format
        const formattedMessages: Message[] = loadedMessages.map((msg: any, index: number) => ({
          id: `loaded_${index}_${Date.now()}`,
          content: msg.content,
          sender: msg.sender as "user" | "ai",
          timestamp: new Date(msg.timestamp)
        }));
        
        setMessages(formattedMessages);
        setSessionId(conversationSessionId);
      } else {
        // If no messages found, create a new conversation with this ID
        setMessages([]);
        setSessionId(conversationSessionId);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
      toast({
        title: "Error",
        description: "Failed to load conversation history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  return {
    messages,
    isLoading,
    sendMessage,
    resetConversation,
    loadConversation,
    sessionId,
    debugMode,
    toggleDebugMode,
  };
}
