import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Menu, X } from "lucide-react";
import { useEnhancedAICoach } from "@/hooks/use-enhanced-ai-coach";
import { useACSIntegration } from "@/hooks/use-acs-integration";
import { useTieredMemory } from "@/hooks/use-tiered-memory";
import { usePIEEnhancedCoach } from "@/hooks/use-pie-enhanced-coach";
import { AgentSelector } from "./AgentSelector";
import { CoachLoadingMessage } from "./CoachLoadingMessage";
import { TypewriterText } from "./TypewriterText";
import { VFPGraphFeedback } from "./VFPGraphFeedback";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  agentMode?: string;
  isStreaming?: boolean;
}

interface EnhancedCoachInterfaceProps {
  sessionId?: string;
  initialMessages?: Message[];
  onNewMessage?: (message: Message) => void;
}

export default function EnhancedCoachInterface({
  sessionId,
  initialMessages = [],
  onNewMessage
}: EnhancedCoachInterfaceProps) {
  const { t } = useLanguage();
  const { isMobile, isUltraNarrow, spacing, getTextSize, touchTargetSize } = useResponsiveLayout();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  
  // Generate session ID if not provided
  const currentSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Initialize all 4 brain innovations
  const baseCoach = useEnhancedAICoach();
  const pieCoach = usePIEEnhancedCoach(baseCoach.currentAgent);
  const acsIntegration = useACSIntegration(user?.id || null, true);
  const tieredMemory = useTieredMemory(user?.id || 'anonymous', currentSessionId);
  
  // Use PIE-enhanced coach for better conversations
  const {
    messages,
    isLoading,
    sendMessage: baseSendMessage,
    resetConversation,
    currentAgent,
    switchAgent,
    streamingContent,
    isStreaming,
    personaReady,
    authInitialized,
    blueprintStatus,
    vfpGraphStatus,
    recordVFPGraphFeedback
  } = pieCoach.pieEnabled ? pieCoach : baseCoach;

  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Convert hook messages to component Message format and combine with initial messages
  const convertedMessages: Message[] = messages.map(msg => ({
    id: msg.id,
    content: msg.content,
    isUser: msg.sender === 'user',
    timestamp: msg.timestamp,
    agentMode: currentAgent,
    isStreaming: false
  }));

  const allMessages = [...initialMessages, ...convertedMessages];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [allMessages, streamingContent]);

  // Enhanced send message with all 4 brain innovations
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
      agentMode: currentAgent
    };
    
    onNewMessage?.(userMessage);
    
    try {
      // ACS: Process user message for adaptive context
      if (acsIntegration.isEnabled) {
        acsIntegration.processUserMessage(messageToSend);
      }
      
      // TMG: Store conversation turn for memory
      if (tieredMemory.isInitialized) {
        await tieredMemory.storeConversationTurn({
          content: messageToSend,
          sender: 'user',
          timestamp: new Date().toISOString(),
          agent_mode: currentAgent
        }, 7.0); // High importance for user messages
      }
      
      // Send message with enhanced system prompt from ACS
      let enhancedMessage = messageToSend;
      if (acsIntegration.isEnabled) {
        const systemPromptEnhancement = acsIntegration.getEnhancedSystemPrompt("");
        if (systemPromptEnhancement !== "") {
          enhancedMessage = `${messageToSend}\n\n[Context: ${systemPromptEnhancement}]`;
        }
      }
      
      await baseSendMessage(enhancedMessage, true);
      
      // ACS: Process assistant response
      if (acsIntegration.isEnabled) {
        // We'll process the assistant response when it's received
        setTimeout(() => {
          if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.sender === 'assistant') {
              acsIntegration.processAssistantMessage(lastMessage.content);
            }
          }
        }, 1000);
      }
      
    } catch (error) {
      console.error("Error sending enhanced message:", error);
    }
  }, [inputMessage, isLoading, baseSendMessage, onNewMessage, currentAgent, acsIntegration, tieredMemory, messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAgentSwitch = (newAgent: any) => {
    switchAgent(newAgent);
    if (isMobile) setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  // Enhanced VFP feedback with ACS integration - Fixed callback signature
  const handleVFPFeedback = useCallback((messageId: string, isPositive: boolean) => {
    recordVFPGraphFeedback(messageId, isPositive);
    
    // ACS: Record feedback for learning
    if (acsIntegration.isEnabled) {
      acsIntegration.recordFeedback(isPositive ? 'positive' : 'negative', `Message ${messageId}`);
    }
  }, [recordVFPGraphFeedback, acsIntegration]);

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
          <h3 className="font-semibold">Coach Settings</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <h4 className={`font-medium mb-3 ${getTextSize('text-sm')}`}>Select Coach Mode</h4>
            <AgentSelector
              currentAgent={currentAgent}
              onAgentChange={handleAgentSwitch}
            />
          </div>
          
          {/* Brain Innovation Status */}
          <div className="space-y-2">
            <h4 className={`font-medium ${getTextSize('text-sm')}`}>Brain Innovations</h4>
            <div className={`text-xs p-2 rounded bg-muted space-y-1`}>
              <div>ACS: {acsIntegration.isEnabled ? '✅ Active' : '❌ Inactive'}</div>
              <div>VFP: {vfpGraphStatus.isAvailable ? '✅ Active' : '❌ Inactive'}</div>
              <div>PIE: {pieCoach.pieEnabled ? '✅ Active' : '❌ Inactive'}</div>
              <div>TMG: {tieredMemory.isInitialized ? '✅ Active' : '❌ Inactive'}</div>
            </div>
          </div>
          
          {/* Blueprint Status */}
          <div className="space-y-2">
            <h4 className={`font-medium ${getTextSize('text-sm')}`}>Blueprint Status</h4>
            <div className={`text-xs p-2 rounded bg-muted`}>
              <div>Available: {blueprintStatus.isAvailable ? '✓' : '✗'}</div>
              <div>Completion: {blueprintStatus.completionPercentage}%</div>
            </div>
          </div>
          
          {/* VFP Graph Status */}
          <div className="space-y-2">
            <h4 className={`font-medium ${getTextSize('text-sm')}`}>VFP Graph Status</h4>
            <div className={`text-xs p-2 rounded bg-muted`}>
              <div>Available: {vfpGraphStatus.isAvailable ? '✓' : '✗'}</div>
              <div>Dimensions: {vfpGraphStatus.vectorDimensions}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!authInitialized) {
    return (
      <div className="h-full flex items-center justify-center">
        <CoachLoadingMessage message="Initializing brain innovations..." />
      </div>
    );
  }

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
              AI Coach - {currentAgent}
              {pieCoach.pieEnabled && <span className="text-xs text-purple-600 ml-2">PIE Enhanced</span>}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetConversation}
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
          <div>
            <h4 className="font-medium mb-3">Select Coach Mode</h4>
            <AgentSelector
              currentAgent={currentAgent}
              onAgentChange={switchAgent}
            />
          </div>
          
          {/* Brain Innovation Status */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Brain Innovations</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>ACS: {acsIntegration.isEnabled ? '✅ Active' : '❌ Inactive'}</div>
                <div>VFP: {vfpGraphStatus.isAvailable ? '✅ Active' : '❌ Inactive'}</div>
                <div>PIE: {pieCoach.pieEnabled ? '✅ Active' : '❌ Inactive'}</div>
                <div>TMG: {tieredMemory.isInitialized ? '✅ Active' : '❌ Inactive'}</div>
              </div>
              {acsIntegration.isEnabled && (
                <div className="text-xs mt-2 text-blue-600">
                  Context State: {acsIntegration.currentState}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Blueprint Status */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Blueprint Status</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>Available: {blueprintStatus.isAvailable ? '✓' : '✗'}</div>
                <div>Completion: {blueprintStatus.completionPercentage}%</div>
                <div className="text-xs mt-2">{blueprintStatus.summary}</div>
              </div>
            </CardContent>
          </Card>
          
          {/* VFP Graph Status */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">VFP Graph Status</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>Available: {vfpGraphStatus.isAvailable ? '✓' : '✗'}</div>
                <div>Dimensions: {vfpGraphStatus.vectorDimensions}</div>
                <div>Magnitude: {vfpGraphStatus.vectorMagnitude?.toFixed(2) || 'N/A'}</div>
                <div className="text-xs mt-2">{vfpGraphStatus.personalitySummary}</div>
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
                        ? "bg-soul-purple text-white"
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
                    
                    {/* VFP Graph Feedback for assistant messages - Fixed callback */}
                    {!message.isUser && !message.isStreaming && (
                      <VFPGraphFeedback
                        messageId={message.id}
                        onFeedbackGiven={(isPositive: boolean) => handleVFPFeedback(message.id, isPositive)}
                      />
                    )}
                  </div>
                </div>
              ))}
              
              {/* Streaming message */}
              {isStreaming && streamingContent && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] sm:max-w-[80%] md:max-w-[70%] rounded-lg px-3 md:px-4 py-2 md:py-3 bg-muted">
                    <div className={`${getTextSize('text-sm')} break-words`}>
                      <TypewriterText text={streamingContent} isStreaming={true} />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Loading indicator */}
              {isLoading && !isStreaming && (
                <div className="flex justify-start">
                  <CoachLoadingMessage />
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
                placeholder={t('forms.placeholders.typeMessage')}
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
          </div>
        </div>
      </div>
    </div>
  );
}
