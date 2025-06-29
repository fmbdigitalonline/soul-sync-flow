
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, SendHorizontal, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "@/hooks/use-ai-coach";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { VFPGraphFeedback } from "./VFPGraphFeedback";

interface BlendInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  personaReady: boolean;
  vfpGraphStatus?: {
    isAvailable: boolean;
    vectorDimensions: number;
    personalitySummary: string;
    vectorMagnitude?: number;
  };
}

export const BlendInterface: React.FC<BlendInterfaceProps> = ({
  messages,
  isLoading,
  onSendMessage,
  personaReady,
  vfpGraphStatus
}) => {
  const [inputValue, setInputValue] = useState("");
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    console.log(`VFP-Graph feedback from BlendInterface: ${messageId} - ${isPositive ? '👍' : '👎'}`);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* VFP-Graph Status Header */}
      {vfpGraphStatus?.isAvailable && (
        <div className="bg-gradient-to-r from-soul-purple/10 to-soul-teal/10 border border-soul-purple/20 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-soul-purple" />
            <span className="text-sm font-medium text-soul-purple">VFP-Graph Powered</span>
            <span className="text-xs text-muted-foreground">
              {vfpGraphStatus.vectorDimensions}D • {vfpGraphStatus.personalitySummary}
            </span>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className={cn("bg-gradient-to-br from-soul-purple to-soul-teal rounded-full mx-auto mb-4 flex items-center justify-center", isMobile ? "w-12 h-12" : "w-16 h-16")}>
              <Sparkles className={cn("text-white", isMobile ? "h-6 w-6" : "h-8 w-8")} />
            </div>
            <h3 className={cn("font-semibold mb-2", isMobile ? "text-lg" : "text-xl")}>
              {vfpGraphStatus?.isAvailable ? 'VFP-Graph Enhanced' : 'AI'} Blend Coach
            </h3>
            <p className={cn("text-muted-foreground max-w-md", isMobile ? "text-sm" : "text-base")}>
              {personaReady || vfpGraphStatus?.isAvailable
                ? "I understand your unique personality and am ready to provide personalized guidance that blends coaching and mentoring approaches."
                : "I'm here to provide balanced guidance that combines coaching questions with direct mentoring advice."}
            </p>
            {vfpGraphStatus?.isAvailable && (
              <div className="mt-3 px-3 py-1 bg-soul-purple/10 text-soul-purple text-xs rounded-full">
                Powered by 128-dimensional personality intelligence
              </div>
            )}
          </div>
        )}

        {messages.map((message, idx) => {
          if (message.sender === "user") {
            return (
              <div key={message.id} className={cn("flex justify-end", isMobile ? "px-2" : "px-4")}>
                <div className={cn("max-w-[80%] rounded-2xl bg-green-600 text-white", isMobile ? "px-3 py-2" : "px-4 py-3")}>
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowRight className="h-3 w-3" />
                    <span className="text-xs font-medium">You</span>
                  </div>
                  <div className={cn("whitespace-pre-line", isMobile ? "text-sm" : "text-base")}>
                    {message.content}
                  </div>
                </div>
              </div>
            );
          } else {
            const isVFPGraphPowered = vfpGraphStatus?.isAvailable && personaReady;
            
            return (
              <div key={message.id} className={cn("flex justify-start", isMobile ? "px-2" : "px-4")}>
                <div className={cn("max-w-[85%] rounded-2xl border bg-slate-50", isMobile ? "p-3" : "p-4")}>
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowRight className={cn("text-green-400", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                    <span className={cn("font-medium text-slate-700", isMobile ? "text-xs" : "text-sm")}>
                      {isVFPGraphPowered ? 'VFP-Graph' : 'AI'} Blend Coach
                    </span>
                    {isVFPGraphPowered && (
                      <Sparkles className="h-3 w-3 text-soul-purple" />
                    )}
                  </div>
                  <div className={cn("text-slate-800 whitespace-pre-line leading-relaxed", isMobile ? "text-sm" : "text-base")}>
                    {message.content}
                  </div>
                  
                  {/* VFP-Graph Feedback Integration */}
                  {isVFPGraphPowered && (
                    <VFPGraphFeedback
                      messageId={message.id}
                      onFeedbackGiven={(isPositive) => handleVFPGraphFeedback(message.id, isPositive)}
                    />
                  )}
                  
                  {/* Personality Insight Display */}
                  {isVFPGraphPowered && vfpGraphStatus && (
                    <div className="mt-2 px-2 py-1 bg-soul-purple/5 rounded text-xs text-soul-purple/70">
                      Personalized using your {vfpGraphStatus.vectorDimensions}D personality vector
                      {vfpGraphStatus.vectorMagnitude && (
                        <span className="ml-1">• Intensity: {vfpGraphStatus.vectorMagnitude}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          }
        })}

        {isLoading && (
          <div className={cn("flex justify-start", isMobile ? "px-2" : "px-4")}>
            <div className={cn("border border-green-200/20 max-w-[80%] rounded-2xl bg-slate-50", isMobile ? "p-3" : "p-4")}>
              <div className="flex items-center space-x-2">
                <ArrowRight className="h-4 w-4 text-green-400" />
                <p className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>
                  {vfpGraphStatus?.isAvailable ? 'VFP-Graph' : 'AI'} Blend Coach
                </p>
                {vfpGraphStatus?.isAvailable && (
                  <Sparkles className="h-3 w-3 text-soul-purple" />
                )}
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Loader2 className="h-4 w-4 animate-spin text-soul-purple" />
                <p className={cn("text-slate-600", isMobile ? "text-xs" : "text-sm")}>
                  {vfpGraphStatus?.isAvailable 
                    ? "Analyzing with VFP-Graph intelligence..." 
                    : "Thinking..."
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={cn("border-t bg-white", isMobile ? "p-3" : "p-4")}>
        <div className="flex items-center space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={
              vfpGraphStatus?.isAvailable 
                ? "Ask me anything - I understand your unique personality..."
                : "Ask me anything - I'll blend coaching questions with direct guidance..."
            }
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={inputValue.trim() === "" || isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <p className={cn("text-center text-muted-foreground mt-2", isMobile ? "text-xs" : "text-sm")}>
          {vfpGraphStatus?.isAvailable 
            ? `VFP-Graph powered blend coaching • ${vfpGraphStatus.personalitySummary}`
            : "Balanced coaching that combines questions with guidance"
          }
        </p>
      </div>
    </div>
  );
};
