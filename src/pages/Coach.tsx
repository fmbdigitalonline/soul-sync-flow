import React, { useRef, useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle, RotateCcw, Zap, Heart, Brain, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useHACSConversationAdapter } from "@/hooks/use-hacs-conversation-adapter";
import { useBlueprintCache } from "@/contexts/BlueprintCacheContext";
import { supabase } from "@/integrations/supabase/client";
import { HACSChatInterface } from "@/components/hacs/HACSChatInterface";
import { useLanguage } from "@/contexts/LanguageContext";
import { ActiveReminders } from "@/components/reminders/ActiveReminders";
import { MobileTogglePanel } from "@/components/ui/mobile-toggle-panel";
import { useIsMobile } from "@/hooks/use-mobile";
import { HACSSystemStatus } from "@/components/hacs/HACSSystemStatus";

// Sub-page components
const CompanionWelcome = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { hasBlueprint } = useBlueprintCache();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Soul Companion
          </h1>
          <p className="text-muted-foreground mb-8">
            Choose your interaction style and level of support
          </p>
        </div>

        {/* Mode Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          
          {/* Chat Mode */}
          <CosmicCard 
            className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
            onClick={() => navigate('/companion/chat')}
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">General Chat</h3>
                <p className="text-muted-foreground text-sm">
                  Open conversation with your Soul companion for any topic or question
                </p>
              </div>
              <Button className="w-full">
                Start Chatting
              </Button>
            </div>
          </CosmicCard>

          {/* Coach Mode */}
          <CosmicCard 
            className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
            onClick={() => navigate('/companion/coach')}
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Pure Coach</h3>
                <p className="text-muted-foreground text-sm">
                  Focused coaching sessions for goals, productivity, and personal growth
                </p>
              </div>
              <Button className="w-full">
                Start Coaching
              </Button>
            </div>
          </CosmicCard>

          {/* Guide Mode */}
          <CosmicCard 
            className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
            onClick={() => navigate('/companion/guide')}
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-soul-teal to-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Pure Guide</h3>
                <p className="text-muted-foreground text-sm">
                  Spiritual guidance, intuitive insights, and soul-level conversations
                </p>
              </div>
              <Button className="w-full">
                Connect with Guide
              </Button>
            </div>
          </CosmicCard>

        </div>

        {/* Quick Access */}
        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/companion/blend')}
            className="text-muted-foreground hover:text-primary"
          >
            <Users className="mr-2 h-4 w-4" />
            Blended Mode (Adaptive)
          </Button>
        </div>

        {/* Status */}
        <div className="mt-8 max-w-md mx-auto">
          <CosmicCard className="p-4">
            <div className="text-center space-y-2">
              <div className="flex justify-between text-sm">
                <span>Blueprint:</span>
                <span className={hasBlueprint ? "text-green-600" : "text-amber-600"}>
                  {hasBlueprint ? "Ready" : "Partial"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>HACS:</span>
                <span className="text-blue-600">Pure Intelligence</span>
              </div>
            </div>
          </CosmicCard>
        </div>
      </div>
    </div>
  );
};

const CompanionChat = () => {
  const {
    messages,
    isLoading,
    sendMessage,
    resetConversation
  } = useHACSConversationAdapter("blend", "companion");

  const { toast } = useToast();
  const { hasBlueprint } = useBlueprintCache();
  const { isMobile } = useIsMobile();

  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };

  const handleReset = () => {
    resetConversation();
    toast({
      title: "Conversation Reset",
      description: "Your companion conversation has been cleared.",
    });
  };

  const chatInterface = (
    <HACSChatInterface
      messages={messages}
      isLoading={isLoading}
      onSendMessage={handleSendMessage}
    />
  );

  const remindersContent = (
    <div className="space-y-4 h-full">
      <ActiveReminders />
      
      <CosmicCard className="p-4">
        <h3 className="font-semibold mb-3 flex items-center">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Chat
        </h3>
        <Button
          onClick={handleReset}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Clear Conversation
        </Button>
      </CosmicCard>

      <HACSSystemStatus />

      <CosmicCard className="p-4">
        <h3 className="font-semibold mb-3 flex items-center">
          <Sparkles className="h-4 w-4 mr-2" />
          System Status
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Blueprint:</span>
            <span className={hasBlueprint ? "text-green-600" : "text-amber-600"}>
              {hasBlueprint ? "Ready" : "Partial"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Mode:</span>
            <span className="text-primary">General Chat</span>
          </div>
          <div className="flex justify-between">
            <span>HACS:</span>
            <span className="text-blue-600">Adaptive Intelligence</span>
          </div>
        </div>
      </CosmicCard>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            General Chat
          </h1>
          <p className="text-muted-foreground">
            Open conversation with your Soul companion
          </p>
        </div>

        {isMobile ? (
          <MobileTogglePanel
            chatContent={<CosmicCard className="h-full">{chatInterface}</CosmicCard>}
            remindersContent={remindersContent}
            activeRemindersCount={0}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
            <div className="lg:col-span-1">
              {remindersContent}
            </div>

            <div className="lg:col-span-3">
              <CosmicCard className="h-full">
                {chatInterface}
              </CosmicCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CompanionCoach = () => {
  const {
    messages,
    isLoading,
    sendMessage,
    resetConversation
  } = useHACSConversationAdapter("coach", "companion");

  const { toast } = useToast();
  const { hasBlueprint } = useBlueprintCache();
  const { isMobile } = useIsMobile();

  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };

  const handleReset = () => {
    resetConversation();
    toast({
      title: "Coaching Session Reset",
      description: "Your coaching conversation has been cleared.",
    });
  };

  const chatInterface = (
    <HACSChatInterface
      messages={messages}
      isLoading={isLoading}
      onSendMessage={handleSendMessage}
    />
  );

  const remindersContent = (
    <div className="space-y-4 h-full">
      <ActiveReminders />
      
      <CosmicCard className="p-4">
        <h3 className="font-semibold mb-3 flex items-center">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Session
        </h3>
        <Button
          onClick={handleReset}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Clear Conversation
        </Button>
      </CosmicCard>

      <HACSSystemStatus />

      <CosmicCard className="p-4">
        <h3 className="font-semibold mb-3 flex items-center">
          <Brain className="h-4 w-4 mr-2" />
          Coaching Mode
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Blueprint:</span>
            <span className={hasBlueprint ? "text-green-600" : "text-amber-600"}>
              {hasBlueprint ? "Ready" : "Partial"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Mode:</span>
            <span className="text-soul-purple">Pure Coach</span>
          </div>
          <div className="flex justify-between">
            <span>Focus:</span>
            <span className="text-blue-600">Goals & Productivity</span>
          </div>
        </div>
      </CosmicCard>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Pure Coach Mode
          </h1>
          <p className="text-muted-foreground">
            Focused coaching for goals, productivity, and personal growth
          </p>
        </div>

        {isMobile ? (
          <MobileTogglePanel
            chatContent={<CosmicCard className="h-full">{chatInterface}</CosmicCard>}
            remindersContent={remindersContent}
            activeRemindersCount={0}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
            <div className="lg:col-span-1">
              {remindersContent}
            </div>

            <div className="lg:col-span-3">
              <CosmicCard className="h-full">
                {chatInterface}
              </CosmicCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CompanionGuide = () => {
  const {
    messages,
    isLoading,
    sendMessage,
    resetConversation
  } = useHACSConversationAdapter("guide", "companion");

  const { toast } = useToast();
  const { hasBlueprint } = useBlueprintCache();
  const { isMobile } = useIsMobile();

  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };

  const handleReset = () => {
    resetConversation();
    toast({
      title: "Guide Session Reset",
      description: "Your guidance conversation has been cleared.",
    });
  };

  const chatInterface = (
    <HACSChatInterface
      messages={messages}
      isLoading={isLoading}
      onSendMessage={handleSendMessage}
    />
  );

  const remindersContent = (
    <div className="space-y-4 h-full">
      <ActiveReminders />
      
      <CosmicCard className="p-4">
        <h3 className="font-semibold mb-3 flex items-center">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Session
        </h3>
        <Button
          onClick={handleReset}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Clear Conversation
        </Button>
      </CosmicCard>

      <HACSSystemStatus />

      <CosmicCard className="p-4">
        <h3 className="font-semibold mb-3 flex items-center">
          <Heart className="h-4 w-4 mr-2" />
          Guide Mode
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Blueprint:</span>
            <span className={hasBlueprint ? "text-green-600" : "text-amber-600"}>
              {hasBlueprint ? "Ready" : "Partial"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Mode:</span>
            <span className="text-soul-teal">Pure Guide</span>
          </div>
          <div className="flex justify-between">
            <span>Focus:</span>
            <span className="text-blue-600">Spiritual & Intuitive</span>
          </div>
        </div>
      </CosmicCard>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Pure Guide Mode
          </h1>
          <p className="text-muted-foreground">
            Spiritual guidance, intuitive insights, and soul-level conversations
          </p>
        </div>

        {isMobile ? (
          <MobileTogglePanel
            chatContent={<CosmicCard className="h-full">{chatInterface}</CosmicCard>}
            remindersContent={remindersContent}
            activeRemindersCount={0}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
            <div className="lg:col-span-1">
              {remindersContent}
            </div>

            <div className="lg:col-span-3">
              <CosmicCard className="h-full">
                {chatInterface}
              </CosmicCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CompanionBlend = () => {
  const {
    messages,
    isLoading,
    sendMessage,
    resetConversation
  } = useHACSConversationAdapter("blend", "companion");

  const { toast } = useToast();
  const { hasBlueprint } = useBlueprintCache();
  const { isMobile } = useIsMobile();

  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };

  const handleReset = () => {
    resetConversation();
    toast({
      title: "Blended Session Reset",
      description: "Your adaptive conversation has been cleared.",
    });
  };

  const chatInterface = (
    <HACSChatInterface
      messages={messages}
      isLoading={isLoading}
      onSendMessage={handleSendMessage}
    />
  );

  const remindersContent = (
    <div className="space-y-4 h-full">
      <ActiveReminders />
      
      <CosmicCard className="p-4">
        <h3 className="font-semibold mb-3 flex items-center">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Session
        </h3>
        <Button
          onClick={handleReset}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Clear Conversation
        </Button>
      </CosmicCard>

      <HACSSystemStatus />

      <CosmicCard className="p-4">
        <h3 className="font-semibold mb-3 flex items-center">
          <Users className="h-4 w-4 mr-2" />
          Blended Mode
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Blueprint:</span>
            <span className={hasBlueprint ? "text-green-600" : "text-amber-600"}>
              {hasBlueprint ? "Ready" : "Partial"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Mode:</span>
            <span className="text-primary">Adaptive Blend</span>
          </div>
          <div className="flex justify-between">
            <span>Intelligence:</span>
            <span className="text-blue-600">Dynamic HACS</span>
          </div>
        </div>
      </CosmicCard>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Blended Mode
          </h1>
          <p className="text-muted-foreground">
            Adaptive intelligence that blends coaching and guidance based on your needs
          </p>
        </div>

        {isMobile ? (
          <MobileTogglePanel
            chatContent={<CosmicCard className="h-full">{chatInterface}</CosmicCard>}
            remindersContent={remindersContent}
            activeRemindersCount={0}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
            <div className="lg:col-span-1">
              {remindersContent}
            </div>

            <div className="lg:col-span-3">
              <CosmicCard className="h-full">
                {chatInterface}
              </CosmicCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Coach = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const authenticated = !!data.session;
      setIsAuthenticated(authenticated);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const authenticated = !!session;
      setIsAuthenticated(authenticated);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <CosmicCard className="w-full max-w-md text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Soul Companion</h1>
              <p className="text-muted-foreground">Your personal Soul companion for integrated support and guidance.</p>
            </div>
            <Button 
              className="w-full"
              onClick={() => window.location.href = '/auth'}
            >
              Get Started
            </Button>
          </CosmicCard>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<CompanionWelcome />} />
        <Route path="/chat" element={<CompanionChat />} />
        <Route path="/coach" element={<CompanionCoach />} />
        <Route path="/guide" element={<CompanionGuide />} />
        <Route path="/blend" element={<CompanionBlend />} />
      </Routes>
    </MainLayout>
  );
};

export default Coach;