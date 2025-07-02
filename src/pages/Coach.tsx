
import React, { useRef, useEffect, useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle, RotateCcw, Zap, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSoulSync } from "@/hooks/use-soul-sync";
import { useBlueprintCache } from "@/contexts/BlueprintCacheContext";
import { supabase } from "@/integrations/supabase/client";
import { GuideInterface } from "@/components/coach/GuideInterface";
import { useLanguage } from "@/contexts/LanguageContext";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";
import { ActiveReminders } from "@/components/reminders/ActiveReminders";
import { MobileTogglePanel } from "@/components/ui/mobile-toggle-panel";
import { useAgentBrainSelector } from "@/hooks/use-agent-brain-selector";
import { useStreamingMessage } from "@/hooks/use-streaming-message";
import { Message } from "@/services/program-aware-coach-service";

const Coach = () => {
  const { 
    currentMode, 
    isInitialized, 
    error: brainError, 
    processMessage 
  } = useAgentBrainSelector();
  
  const { isSoulSyncReady, soulSyncError } = useSoulSync();
  const { hasBlueprint, blueprintData } = useBlueprintCache();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(`soul_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { productivityJourney, growthJourney } = useJourneyTracking();
  
  const { 
    streamingContent, 
    isStreaming, 
    streamText, 
    resetStreaming,
    startStreaming,
    completeStreaming 
  } = useStreamingMessage();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('🕊️ Soul Companion State:', {
      isAuthenticated,
      hasBlueprint,
      isSoulSyncReady,
      soulSyncError,
      blueprintDataExists: !!blueprintData,
      sessionId,
      currentBrainMode: currentMode,
      brainInitialized: isInitialized,
      brainError
    });
  }, [isAuthenticated, hasBlueprint, isSoulSyncReady, soulSyncError, blueprintData, sessionId, currentMode, isInitialized, brainError]);

  const handleNewConversation = () => {
    setMessages([]);
    resetStreaming();
    toast({
      title: "New Conversation",
      description: "Started a new conversation with your Soul Companion",
    });
  };

  const handleSendMessage = async (message: string) => {
    if (!isInitialized || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}_user`,
      content: message,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    resetStreaming();

    try {
      // Create placeholder assistant message for streaming
      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        content: '', // Start empty for streaming
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      startStreaming();

      // Process with appropriate brain service
      const response = await processMessage(message, sessionId);
      
      console.log("🕊️ Soul Companion response received, starting slow streaming");

      // Determine streaming speed based on brain mode
      let streamingSpeed = 75;
      if (currentMode === 'growth') {
        streamingSpeed = 90; // Slower for contemplative growth conversations
      } else if (currentMode === 'dreams') {
        streamingSpeed = 70; // Moderate for action-oriented conversations
      } else {
        streamingSpeed = 80; // Balanced for soul companion
      }

      // Start slow typewriter streaming
      streamText(response.response, streamingSpeed);

      // Update the actual message content after streaming
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, content: response.response }
              : msg
          )
        );
        completeStreaming();
      }, response.response.length * (streamingSpeed + 5) + 1000);

    } catch (error) {
      console.error('Error in Soul Companion conversation:', error);
      
      // Provide error recovery response with streaming
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        content: '',
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      
      const errorText = 'I apologize for the interruption. I\'m here as your companion - what would you like to explore together?';
      
      startStreaming();
      streamText(errorText, 80);
      
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === errorMessage.id 
              ? { ...msg, content: errorText }
              : msg
          )
        );
        completeStreaming();
      }, errorText.length * 85 + 1000);

    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="flex flex-col h-[calc(100vh-5rem)] max-w-md mx-auto p-4 items-center justify-center">
          <CosmicCard className="p-6 text-center">
            <Sparkles className="h-8 w-8 text-soul-purple mx-auto mb-4" />
            <h1 className="text-2xl font-bold font-display mb-2">
              <span className="gradient-text">Soul Companion</span>
            </h1>
            <p className="mb-6">Please sign in to access your AI companion</p>
            <Button 
              className="bg-soul-purple hover:bg-soul-purple/90"
              onClick={() => window.location.href = '/auth'}
            >
              Sign In
            </Button>
          </CosmicCard>
        </div>
      </MainLayout>
    );
  }

  const getBrainModeDisplay = () => {
    switch (currentMode) {
      case 'growth':
        return { name: 'Spiritual Growth', icon: '🌱', color: 'text-green-600' };
      case 'dreams':
        return { name: 'Dreams & Goals', icon: '🎯', color: 'text-blue-600' };
      case 'soul_companion':
        return { name: 'Soul Companion', icon: '🕊️', color: 'text-purple-600' };
      default:
        return { name: 'Soul Companion', icon: '🕊️', color: 'text-purple-600' };
    }
  };

  const brainMode = getBrainModeDisplay();

  const chatContent = (
    <>
      {/* Enhanced Header with Brain Mode Status */}
      <div className="flex-shrink-0 px-3 py-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className={`w-6 h-6 bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center ${isInitialized ? 'ring-2 ring-green-400' : ''}`}>
                {isInitialized ? (
                  <Brain className="h-3 w-3 text-white" />
                ) : (
                  <MessageCircle className="h-3 w-3 text-white" />
                )}
              </div>
              {isInitialized && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              )}
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-medium gradient-text">
                {brainMode.name} {brainMode.icon}
              </h1>
              {isInitialized && (
                <span className="text-xs text-green-600">Brain Active</span>
              )}
              {brainError && (
                <span className="text-xs text-red-500">Brain Error</span>
              )}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleNewConversation}
            className="h-6 px-1"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
        
        {/* Brain Status Banner */}
        {!hasBlueprint && (
          <div className="mt-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-amber-700">
              <Sparkles className="h-3 w-3" />
              <span>Create your Blueprint to unlock personalized {brainMode.name} responses</span>
              <Button 
                size="sm" 
                variant="outline" 
                className="ml-auto h-6 text-xs"
                onClick={() => window.location.href = '/blueprint'}
              >
                Create Blueprint
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Chat Interface */}
      <div className="flex-1 pb-3 min-h-0">
        <GuideInterface
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          messagesEndRef={messagesEndRef}
          streamingContent={streamingContent}
          isStreaming={isStreaming}
        />
      </div>
    </>
  );

  const remindersContent = (
    <div className="space-y-4">
      <ActiveReminders />
    </div>
  );

  return (
    <MainLayout>
      <MobileTogglePanel
        chatContent={chatContent}
        remindersContent={remindersContent}
        activeRemindersCount={0}
      />
    </MainLayout>
  );
};

export default Coach;
