
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Menu, X, Brain, Settings } from "lucide-react";
import { useHACSConversation } from "@/hooks/use-hacs-conversation";
import { useHacsIntelligence } from "@/hooks/use-hacs-intelligence";
import { CoachLoadingMessage } from "@/components/coach/CoachLoadingMessage";
import { TypewriterText } from "@/components/coach/TypewriterText";
import { VFPGraphFeedback } from "@/components/coach/VFPGraphFeedback";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  agentMode?: string;
  isStreaming?: boolean;
}

interface PureHACSInterfaceProps {
  sessionId?: string;
  initialMessages?: Message[];
  onNewMessage?: (message: Message) => void;
}

export const PureHACSInterface: React.FC<PureHACSInterfaceProps> = ({
  sessionId,
  initialMessages = [],
  onNewMessage
}) => {
  const { isMobile, isUltraNarrow, spacing, getTextSize, touchTargetSize } = useResponsiveLayout();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  
  // Pure HACS conversation hook
  const {
    messages: hacsMessages,
    isLoading,
    sendMessage: hacsSendMessage,
    clearConversation,
    currentQuestion,
    provideFeedback
  } = useHACSConversation();

  // Intelligence tracking
  const { intelligence, refreshIntelligence } = useHacsIntelligence();
  
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Convert HACS messages to component Message format
  const convertedMessages: Message[] = hacsMessages.map(msg => ({
    id: msg.id,
    content: msg.content,
    isUser: msg.role === 'user',
    timestamp: new Date(msg.timestamp),
    agentMode: msg.module || 'guide',
    isStreaming: false
  }));

  const allMessages = [...initialMessages, ...convertedMessages];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [allMessages]);

  // Pure HACS send message implementation
  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isLoading) return;

    const messageToSend = inputMessage;
    setInputMessage("");
    
    // Notify parent of new user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageToSend,
      isUser: true,
      timestamp: new Date(),
      agentMode: 'guide'
    };
    
    onNewMessage?.(userMessage);
    
    try {
      // Send through pure HACS conversation
      await hacsSendMessage(messageToSend);
      
      // Refresh intelligence after conversation
      await refreshIntelligence();
      
    } catch (error) {
      console.error("Pure HACS message failed:", error);
      // Don't add fallback - let error surface for debugging
      throw error;
    }
  }, [inputMessage, isLoading, hacsSendMessage, onNewMessage, refreshIntelligence]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVFPFeedback = useCallback(async (messageId: string, isPositive: boolean) => {
    try {
      await provideFeedback(
        'helpful',
        isPositive ? 'positive' : 'negative',
        messageId
      );
      await refreshIntelligence();
    } catch (error) {
      console.error("VFP feedback failed:", error);
    }
  }, [provideFeedback, refreshIntelligence]);

  const handleReset = () => {
    clearConversation();
  };

  // Mobile Sidebar Component
  const MobileSidebar = () => (
    <div className={`
      fixed inset-0 z-50 md:hidden
      ${sidebarOpen ? 'visible' : 'invisible'}
    `}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      
      {/* Sidebar */}
      <div className={`
        absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-background border-r
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        overflow-y-auto
      `}>
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">HACS Intelligence</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Intelligence Status */}
          <div className="space-y-2">
            <h4 className={`font-medium ${getTextSize('text-sm')}`}>Intelligence Level</h4>
            <div className={`text-xs p-2 rounded bg-muted space-y-1`}>
              <div>Level: {intelligence?.intelligence_level || 0}%</div>
              <div>Interactions: {intelligence?.interaction_count || 0}</div>
              <div>PIE Score: {intelligence?.pie_score || 0}</div>
              <div>VFP Score: {intelligence?.vfp_score || 0}</div>
              <div>TMG Score: {intelligence?.tmg_score || 0}</div>
            </div>
          </div>
          
          {/* Current Question */}
          {currentQuestion && (
            <div className="space-y-2">
              <h4 className={`font-medium ${getTextSize('text-sm')}`}>Active Question</h4>
              <div className={`text-xs p-2 rounded bg-blue-50`}>
                <div>Module: {currentQuestion.module}</div>
                <div>Type: {currentQuestion.type}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Mobile Sidebar */}
      <MobileSidebar />
      
      {/* Header - Mobile Responsive */}
      <div className="border-b bg-background p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Mobile sidebar toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
            
            <h2 className={`font-semibold ${getTextSize('text-lg')}`}>
              Pure HACS Intelligence
            </h2>
            <Badge variant="default" className="text-xs">
              Level {intelligence?.intelligence_level || 0}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="hidden sm:block"
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile Responsive Layout */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Desktop Sidebar - Hidden on Mobile */}
        <div className="hidden md:block w-80 border-r bg-muted/50 p-4 space-y-4 overflow-y-auto">
          {/* Intelligence Status */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2 flex items-center">
                <Brain className="h-4 w-4 mr-2" />
                Intelligence System
              </h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>Level: {intelligence?.intelligence_level || 0}%</div>
                <div>Interactions: {intelligence?.interaction_count || 0}</div>
                <div>PIE Score: {intelligence?.pie_score || 0}</div>
                <div>VFP Score: {intelligence?.vfp_score || 0}</div>
                <div>TMG Score: {intelligence?.tmg_score || 0}</div>
              </div>
            </CardContent>
          </Card>
          
          {/* Current Question */}
          {currentQuestion && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Active Question</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>Module: {currentQuestion.module}</div>
                  <div>Type: {currentQuestion.type}</div>
                  <div className="text-xs mt-2 p-2 bg-blue-50 rounded">
                    {currentQuestion.text}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* System Status */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">System Status</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="text-green-600">✓ Pure HACS Active</div>
                <div className="text-green-600">✓ Intelligence Learning</div>
                <div className="text-green-600">✓ No Fallbacks</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface - Full Width on Mobile */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-3 md:p-4">
            <div className="space-y-4 max-w-4xl mx-auto">
              {allMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] md:max-w-[70%] rounded-lg px-3 md:px-4 py-2 md:py-3 ${
                      message.isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className={`${getTextSize('text-sm')} break-words`}>
                      {message.isStreaming ? (
                        <TypewriterText text={message.content} isStreaming={true} />
                      ) : (
                        message.content
                      )}
                    </div>
                    <div className={`${getTextSize('text-xs')} mt-1 opacity-70`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                    
                    {/* VFP Graph Feedback for assistant messages */}
                    {!message.isUser && !message.isStreaming && (
                      <VFPGraphFeedback
                        messageId={message.id}
                        onFeedbackGiven={(isPositive: boolean) => handleVFPFeedback(message.id, isPositive)}
                      />
                    )}
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <CoachLoadingMessage message="HACS Intelligence processing..." />
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area - Mobile Responsive */}
          <div className="border-t bg-background p-3 md:p-4">
            <div className="flex gap-2 max-w-4xl mx-auto">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message HACS Intelligence..."
                disabled={isLoading}
                className={`flex-1 ${getTextSize('text-sm')}`}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className={`${touchTargetSize} px-3`}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Pure intelligence learning - no fallbacks
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
