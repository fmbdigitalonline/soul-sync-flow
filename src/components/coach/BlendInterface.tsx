import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, SendHorizontal, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "@/hooks/use-ai-coach";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { VFPGraphFeedback } from "./VFPGraphFeedback";
import { IntelligentSoulOrb } from "@/components/ui/intelligent-soul-orb";
import { useAuth } from "@/contexts/AuthContext";

interface BlendInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  personaReady?: boolean;
  vfpGraphStatus?: {
    isAvailable: boolean;
    vectorDimensions: number;
    personalitySummary: string;
    vectorMagnitude?: number;
  };
  onFeedback?: (messageId: string, isPositive: boolean) => void;
}

export const BlendInterface: React.FC<BlendInterfaceProps> = ({
  messages,
  isLoading,
  onSendMessage,
  personaReady = false,
  vfpGraphStatus,
  onFeedback
}) => {
  const [inputValue, setInputValue] = useState("");
  const { t } = useLanguage();
  const { isMobile, isFoldDevice, isUltraNarrow } = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Get user's display name
  const userName = user?.user_metadata?.preferred_name || 
                   user?.user_metadata?.full_name?.split(' ')[0] || 
                   user?.email?.split('@')[0] || 
                   'friend';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;
    onSendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVFPGraphFeedback = (messageId: string, isPositive: boolean) => {
    console.log(`Feedback from BlendInterface: ${messageId} - ${isPositive ? '👍' : '👎'}`);
    onFeedback?.(messageId, isPositive);
  };

  // Calculate proper mobile spacing: MobileNav (64px) + safe area + input height (60px) + padding (16px)
  const mobileBottomSpacing = isMobile ? 'pb-36' : 'pb-4';
  const mobileInputBottom = isMobile ? 'bottom-20' : '';

  return (
    <div className={`flex flex-col h-full max-w-4xl mx-auto`}>
      {/* Messages Area - Unified spacing calculation */}
      <div className={`flex-1 overflow-y-auto space-y-4 ${mobileBottomSpacing}`}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="mb-6">
              <IntelligentSoulOrb
                size="lg"
                pulse={true}
                stage="welcome"
                intelligenceLevel={85}
                showProgressRing={true}
                showIntelligenceTooltip={false}
              />
            </div>
            <h3 className={cn("font-semibold mb-2", isMobile ? "text-lg" : "text-xl")}>
              AI Companion
            </h3>
            <p className={cn("text-muted-foreground max-w-md", isMobile ? "text-sm" : "text-base")}>
              {personaReady
                ? `Hello ${userName}! I understand your unique blueprint and am ready to provide personalized guidance that blends coaching and mentoring approaches.`
                : `Hello ${userName}! I'm here to provide balanced guidance that combines coaching questions with direct mentoring advice.`}
            </p>
          </div>
        )}

        {messages.map((message, idx) => {
          if (message.sender === "user") {
            return (
              <div key={message.id} className={cn("flex justify-end", isMobile ? "px-2" : "px-4")}>
                <div className={cn("max-w-[80%] rounded-2xl bg-green-600 text-white", isMobile ? "px-3 py-2" : "px-4 py-3")}>
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowRight className="h-3 w-3" />
                    <span className="text-xs font-medium">{userName}</span>
                  </div>
                  <div className={cn("whitespace-pre-line", isMobile ? "text-sm" : "text-base")}>
                    {message.content}
                  </div>
                </div>
              </div>
            );
          } else {
            return (
              <div key={message.id} className={cn("flex justify-start items-start gap-3", isMobile ? "px-2" : "px-4")}>
                <div className="flex-shrink-0 mt-1">
                  <IntelligentSoulOrb
                    size="sm"
                    pulse={false}
                    speaking={isLoading && idx === messages.length - 1}
                    stage="complete"
                    intelligenceLevel={85}
                    showProgressRing={true}
                  />
                </div>
                <div className={cn("max-w-[85%] rounded-2xl border bg-slate-50", isMobile ? "p-3" : "p-4")}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn("font-medium text-slate-700", isMobile ? "text-xs" : "text-sm")}>
                      AI Companion
                    </span>
                  </div>
                  <div className={cn("text-slate-800 whitespace-pre-line leading-relaxed", isMobile ? "text-sm" : "text-base")}>
                    {message.content}
                  </div>
                  
                  {/* Feedback Integration - Keep internal functionality */}
                  <VFPGraphFeedback
                    messageId={message.id}
                    onFeedbackGiven={(isPositive) => handleVFPGraphFeedback(message.id, isPositive)}
                  />
                </div>
              </div>
            );
          }
        })}

        {isLoading && (
          <div className={cn("flex justify-start items-start gap-3", isMobile ? "px-2" : "px-4")}>
            <div className="flex-shrink-0 mt-1">
              <IntelligentSoulOrb
                size="sm"
                pulse={true}
                speaking={true}
                stage="generating"
                intelligenceLevel={85}
                showProgressRing={true}
              />
            </div>
            <div className={cn("border border-green-200/20 max-w-[80%] rounded-2xl bg-slate-50", isMobile ? "p-3" : "p-4")}>
              <div className="flex items-center space-x-2">
                <p className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>
                  AI Companion
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Loader2 className="h-4 w-4 animate-spin text-soul-purple" />
                <p className={cn("text-slate-600", isMobile ? "text-xs" : "text-sm")}>
                  Thinking...
                </p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Single Input Area - Proper mobile coordination */}
      <div className={cn(
        "border-t bg-white/95 backdrop-blur-lg",
        isMobile 
          ? `fixed ${mobileInputBottom} left-0 right-0 z-[100] border-t border-gray-200 shadow-lg p-3` 
          : "p-4"
      )}>
        <div className={cn("flex items-center space-x-2", isMobile ? "max-w-md mx-auto" : "")}>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={`Ask me anything, ${userName} - I'll blend coaching questions with direct guidance...`}
            className={cn("flex-1", isFoldDevice ? "text-sm" : "")}
            disabled={isLoading}
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={inputValue.trim() === "" || isLoading}
            className="bg-green-600 hover:bg-green-700 flex-shrink-0"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <p className={cn("text-center text-muted-foreground mt-2", isMobile ? "text-xs" : "text-sm")}>
          Balanced guidance that combines questions with direct advice for {userName}
        </p>
      </div>
    </div>
  );
};
