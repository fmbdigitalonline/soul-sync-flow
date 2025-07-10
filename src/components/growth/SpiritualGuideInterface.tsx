
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, RotateCcw, Sparkles, Loader2, Activity, Brain, Zap } from "lucide-react";
import { IntelligentSoulOrb } from "@/components/IntelligentSoulOrb";
import { useIntelligence } from "@/hooks/useIntelligence";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useHACSDreamGuide } from "@/hooks/use-hacs-dream-guide";

// Device detection
const useDeviceType = () => {
  const [isFoldDevice, setIsFoldDevice] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = width / height;
      
      // Detect fold devices by aspect ratio and screen width
      const isFold = (width <= 673 && aspectRatio < 1.5) || 
                   (width >= 673 && width <= 800 && aspectRatio < 2);
      setIsFoldDevice(isFold);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return isFoldDevice;
};

export const SpiritualGuideInterface: React.FC = () => {
  const { user } = useAuth();
  const { intelligence } = useIntelligence();
  const isFoldDevice = useDeviceType();
  
  // Use complete HACS architecture
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    resetConversation, 
    hacsState,
    getHACSStatus,
    isHACSEnabled 
  } = useHACSDreamGuide();
  
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const userDisplayName = user?.user_metadata?.full_name?.split(' ')[0] || 'You';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const messageToSend = inputMessage.trim();
    setInputMessage('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await sendMessage(messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const getTextSize = (baseSize: string) => {
    return isFoldDevice ? baseSize.replace('text-', 'text-xs') : baseSize;
  };

  const getSpacing = (baseSpacing: string) => {
    return isFoldDevice ? baseSpacing.replace(/\d+/, (match) => String(Math.max(1, parseInt(match) - 1))) : baseSpacing;
  };

  // HACS Status Display Component
  const HacsStatusIndicator = () => {
    if (!isHACSEnabled) return null;

    const status = getHACSStatus();
    const systemHealth = status.systemHealth.overall;
    
    return (
      <div className="flex items-center gap-2 mb-4 p-3 bg-gradient-to-r from-soul-purple/5 to-soul-gold/5 rounded-lg border border-soul-purple/10">
        <div className="flex items-center gap-2">
          <Brain className={`h-4 w-4 ${systemHealth === 'healthy' ? 'text-green-500' : 'text-yellow-500'}`} />
          <span className="text-xs font-medium text-soul-purple">
            HACS {isHACSEnabled ? 'Active' : 'Offline'}
          </span>
        </div>
        
        {hacsState.dreamFocus && (
          <div className="flex items-center gap-2 ml-4">
            <Zap className="h-3 w-3 text-soul-gold" />
            <span className="text-xs text-gray-600 truncate max-w-32">
              Focus: {hacsState.dreamFocus}
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-2 ml-auto">
          <Activity className="h-3 w-3 text-soul-purple" />
          <span className="text-xs text-gray-500">
            Harmony: {Math.round(hacsState.harmonyLevel * 100)}%
          </span>
        </div>
      </div>
    );
  };

  if (messages.length === 0 && !isLoading) {
    return (
      <div className={`max-w-4xl mx-auto ${getSpacing('p-6')} space-y-6`}>
        <HacsStatusIndicator />
        
        <div className="text-center space-y-4 max-w-md mx-auto">
          <div className="flex justify-center">
            <IntelligentSoulOrb 
              size="lg"
              intelligenceLevel={intelligence?.intelligence_level || 65}
              showProgressRing={true}
              showIntelligenceTooltip={false}
              stage="welcome"
            />
          </div>
          
          <div className="space-y-2">
            <h2 className={`font-semibold text-soul-purple ${getTextSize('text-xl')}`}>
              HACS Dream Guide
            </h2>
            <p className={`text-gray-600 ${getTextSize('text-sm')} leading-relaxed`}>
              {isHACSEnabled 
                ? "Complete Hermetic Architecture is active. I'm ready to guide you through your dreams using all 11 systems of consciousness."
                : "Initializing complete HACS architecture... Please wait while all systems come online."
              }
            </p>
          </div>

          {isHACSEnabled && (
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              <div>✓ Neural Intent Processing</div>
              <div>✓ Personality Vector Fusion</div>
              <div>✓ Temporal Wisdom Synthesis</div>
              <div>✓ Harmonic Frequency Modulation</div>
              <div>✓ Memory Graph Integration</div>
              <div>✓ Proactive Insight Engine</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto ${getSpacing('p-4')} flex flex-col h-[calc(100vh-8rem)]`}>
      <HacsStatusIndicator />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <IntelligentSoulOrb 
            size="sm"
            intelligenceLevel={intelligence?.intelligence_level || 65}
            showProgressRing={true}
            showIntelligenceTooltip={false}
            stage="active"
          />
          <div>
            <h1 className={`font-semibold text-soul-purple ${getTextSize('text-lg')}`}>
              HACS Dream Guide
            </h1>
            <p className={`text-gray-500 ${getTextSize('text-xs')}`}>
              {isHACSEnabled ? 'Complete Hermetic Architecture Active' : 'Initializing HACS...'}
            </p>
          </div>
        </div>
        
        <Button
          onClick={resetConversation}
          variant="ghost"
          size={isFoldDevice ? "sm" : "default"}
          className="text-gray-500 hover:text-gray-700"
          disabled={isLoading}
        >
          <RotateCcw className={isFoldDevice ? "h-3 w-3" : "h-4 w-4"} />
          {!isFoldDevice && <span className="ml-2">Reset</span>}
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.sender === 'user' ? "justify-end" : "justify-start items-start gap-3"
              )}
            >
              {/* Avatar for assistant messages */}
              {message.sender === 'assistant' && (
                <div className="flex-shrink-0 mt-1">
                  <IntelligentSoulOrb 
                    size="sm"
                    intelligenceLevel={intelligence?.intelligence_level || 65}
                    showProgressRing={true}
                    speaking={message.isStreaming}
                    stage="complete"
                    pulse={false}
                  />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-soul-purple text-white'
                    : 'bg-gray-50 text-gray-800 border border-gray-100'
                }`}
              >
                {/* User label for user messages */}
                {message.sender === 'user' && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium opacity-90">{userDisplayName}</span>
                  </div>
                )}
                
                {/* Assistant label for assistant messages */}
                {message.sender === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className={`text-soul-purple ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    <span className={`font-medium text-soul-purple ${getTextSize('text-xs')}`}>
                      HACS Dream Guide
                    </span>
                    {message.hacsMetadata?.harmonyScore && (
                      <span className="text-xs text-gray-400 ml-2">
                        ⚡ {Math.round(message.hacsMetadata.harmonyScore * 100)}%
                      </span>
                    )}
                  </div>
                )}
                
                <div className={`${getTextSize('text-sm')} leading-relaxed whitespace-pre-wrap`}>
                  {message.content}
                  {message.isStreaming && (
                    <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />
                  )}
                </div>

                {/* HACS Metadata Display */}
                {message.hacsMetadata && message.hacsMetadata.insights && message.hacsMetadata.insights.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500 space-y-1">
                      {message.hacsMetadata.insights.slice(0, 2).map((insight: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Zap className="h-3 w-3 text-soul-gold" />
                          <span>{insight.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <IntelligentSoulOrb 
                  size="sm"
                  intelligenceLevel={intelligence?.intelligence_level || 65}
                  showProgressRing={true}
                  speaking={true}
                  stage="generating"
                  pulse={true}
                />
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className={`text-soul-purple ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  <span className={`font-medium text-soul-purple ${getTextSize('text-xs')}`}>
                    HACS Dream Guide
                  </span>
                  <Brain className="h-3 w-3 text-soul-gold animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 className={`animate-spin text-soul-purple ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  <span className={`text-gray-600 ${getTextSize('text-sm')}`}>
                    Processing through complete HACS architecture...
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder={isHACSEnabled 
              ? "Share your dreams and aspirations... HACS is listening with all systems active."
              : "Waiting for HACS initialization..."
            }
            disabled={isLoading || !isHACSEnabled}
            className={`resize-none min-h-[44px] max-h-[120px] ${getTextSize('text-sm')}`}
            style={{ height: 'auto' }}
          />
        </div>
        <Button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading || !isHACSEnabled}
          size={isFoldDevice ? "sm" : "default"}
          className="shrink-0 bg-soul-purple hover:bg-soul-purple/90"
        >
          <Send className={isFoldDevice ? "h-3 w-3" : "h-4 w-4"} />
        </Button>
      </div>
    </div>
  );
};
