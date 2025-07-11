
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IntelligentSoulOrb } from "@/components/ui/intelligent-soul-orb";
import { useHacsIntelligence } from "@/hooks/use-hacs-intelligence";
import { Send, Loader2, Brain, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  type: "user" | "hacs";
  content: string;
  timestamp: Date;
  components?: string[];
}

interface HACSChatInterfaceProps {
  onClose: () => void;
  initialMessage?: string;
  activeComponents: string[];
  intelligenceLevel: number;
}

export const HACSChatInterface: React.FC<HACSChatInterfaceProps> = ({
  onClose,
  initialMessage,
  activeComponents,
  intelligenceLevel
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    generateResponse,
    isProcessing
  } = useHACSIntelligence();

  // Initialize with HACS greeting and initial message
  useEffect(() => {
    const welcomeMessages: Message[] = [
      {
        id: "welcome",
        type: "hacs",
        content: "Hello! I'm your HACS intelligence system. I'm here to help you navigate your journey with personalized insights from all my components.",
        timestamp: new Date(),
        components: ["PIE", "DPEM"]
      }
    ];

    if (initialMessage) {
      welcomeMessages.push({
        id: "initial",
        type: "hacs", 
        content: initialMessage,
        timestamp: new Date(),
        components: activeComponents.slice(0, 3)
      });
    }

    setMessages(welcomeMessages);
  }, [initialMessage, activeComponents]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Generate HACS response
      const response = await generateResponse(inputValue.trim());
      
      const hacsMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "hacs",
        content: response.message,
        timestamp: new Date(),
        components: response.activeComponents
      };

      setMessages(prev => [...prev, hacsMessage]);
    } catch (error) {
      console.error("Error generating HACS response:", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "hacs",
        content: "I apologize, I'm having trouble processing that right now. Could you try rephrasing your question?",
        timestamp: new Date(),
        components: ["CNR"]
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, isProcessing, generateResponse]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex gap-3",
                message.type === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.type === "hacs" && (
                <div className="flex-shrink-0">
                  <IntelligentSoulOrb
                    size="sm"
                    stage="complete"
                    pulse={false}
                    intelligenceLevel={intelligenceLevel}
                    showProgressRing={false}
                  />
                </div>
              )}
              
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-3",
                  message.type === "user"
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-muted text-foreground"
                )}
              >
                <div className="text-sm leading-relaxed">
                  {message.content}
                </div>
                
                {message.components && message.components.length > 0 && (
                  <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/50">
                    <Brain className="h-3 w-3 text-muted-foreground" />
                    <div className="text-xs text-muted-foreground">
                      {message.components.join(", ")}
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground/70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Typing Indicator */}
        <AnimatePresence>
          {(isTyping || isProcessing) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex gap-3 justify-start"
            >
              <IntelligentSoulOrb
                size="sm"
                stage="generating"
                pulse={true}
                speaking={true}
                intelligenceLevel={intelligenceLevel}
                showProgressRing={false}
              />
              <div className="bg-muted rounded-2xl px-4 py-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  HACS is thinking...
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask HACS anything about your journey..."
              className="pr-12 rounded-xl border-border focus:border-primary"
              disabled={isProcessing}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Zap className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">
                {Math.round(intelligenceLevel)}
              </span>
            </div>
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isProcessing}
            size="icon"
            className="rounded-xl bg-primary hover:bg-primary/90"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Active Components Indicator */}
        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
          <Brain className="h-3 w-3" />
          <span>Active: {activeComponents.join(", ") || "Initializing..."}</span>
        </div>
      </div>
    </div>
  );
};
