
import React, { useRef, useEffect, useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle, RotateCcw, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedAICoach } from "@/hooks/use-enhanced-ai-coach";
import { useSoulSync } from "@/hooks/use-soul-sync";
import { useBlueprintCache } from "@/contexts/BlueprintCacheContext";
import { supabase } from "@/integrations/supabase/client";
import { BlendInterface } from "@/components/coach/BlendInterface";
import { useLanguage } from "@/contexts/LanguageContext";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";

const Coach = () => {
  const { messages, isLoading, sendMessage, resetConversation, streamingContent, isStreaming } = useEnhancedAICoach("blend");
  const { isSoulSyncReady, soulSyncError } = useSoulSync();
  const { hasBlueprint, blueprintData } = useBlueprintCache();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { productivityJourney, growthJourney } = useJourneyTracking();

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
    console.log('🎯 Coach Component State:', {
      isAuthenticated,
      hasBlueprint,
      isSoulSyncReady,
      soulSyncError,
      blueprintDataExists: !!blueprintData
    });
  }, [isAuthenticated, hasBlueprint, isSoulSyncReady, soulSyncError, blueprintData]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewConversation = () => {
    resetConversation();
    toast({
      title: "New Conversation",
      description: "Started a new conversation with your Soul Companion",
    });
  };

  const handleSendMessage = async (message: string) => {
    // Use SoulSync if available, otherwise fall back to regular mode
    await sendMessage(message, isSoulSyncReady);
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
            <p className="mb-6">Please sign in to access your AI coach</p>
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

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-5rem)] w-full">
        {/* Enhanced Header with SoulSync Status */}
        <div className="flex-shrink-0 px-3 py-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className={`w-6 h-6 bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center ${isSoulSyncReady ? 'ring-2 ring-green-400' : ''}`}>
                  {isSoulSyncReady ? (
                    <Zap className="h-3 w-3 text-white" />
                  ) : (
                    <MessageCircle className="h-3 w-3 text-white" />
                  )}
                </div>
                {isSoulSyncReady && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                )}
              </div>
              <div className="flex flex-col">
                <h1 className="text-sm font-medium gradient-text">
                  {isSoulSyncReady ? 'SoulSync Active' : 'Soul Companion'}
                </h1>
                {isSoulSyncReady && (
                  <span className="text-xs text-green-600">Personalized AI Ready</span>
                )}
                {soulSyncError && (
                  <span className="text-xs text-red-500">Generic Mode</span>
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
          
          {/* SoulSync Status Banner - Only show if no blueprint detected */}
          {!hasBlueprint && (
            <div className="mt-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-amber-700">
                <Sparkles className="h-3 w-3" />
                <span>Create your Blueprint to unlock personalized AI responses</span>
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

        {/* Maximum Chat Interface - Full width */}
        <div className="flex-1 pb-3 min-h-0">
          <BlendInterface
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            messagesEndRef={messagesEndRef}
            streamingContent={streamingContent}
            isStreaming={isStreaming}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Coach;
