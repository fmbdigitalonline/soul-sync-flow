
import React, { useRef, useEffect, useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, SendHorizontal, User, Loader2, Settings, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAICoach } from "@/hooks/use-ai-coach";
import { supabase } from "@/integrations/supabase/client";

const Coach = () => {
  const { messages, isLoading, sendMessage, resetConversation } = useAICoach();
  const [inputValue, setInputValue] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;
    sendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleNewConversation = () => {
    resetConversation();
    toast({
      title: "New Conversation",
      description: "Started a new conversation with your Soul Coach",
    });
  };

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="flex flex-col h-[calc(100vh-5rem)] max-w-md mx-auto p-4 items-center justify-center">
          <CosmicCard className="p-6 text-center">
            <Sparkles className="h-8 w-8 text-soul-purple mx-auto mb-4" />
            <h1 className="text-2xl font-bold font-display mb-2">
              <span className="gradient-text">Soul Coach</span>
            </h1>
            <p className="mb-6">You need to sign in to access your personalized AI coach</p>
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
      <div className="flex flex-col h-[calc(100vh-5rem)] max-w-md mx-auto p-4">
        <div className="text-center mb-4 flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleNewConversation}
            title="New Conversation"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold font-display">
            <span className="gradient-text">Soul Coach</span>
          </h1>
          <Button variant="ghost" size="icon" onClick={() => window.location.href = '/blueprint'}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto mb-4 space-y-4 pb-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
              <Sparkles className="h-12 w-12 text-soul-purple mb-4" />
              <h3 className="text-lg font-medium mb-1">Your Soul Coach is ready</h3>
              <p className="text-sm max-w-xs">
                Ask a question or share what's on your mind for personalized guidance based on your Soul Blueprint
              </p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.sender === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl p-4",
                  message.sender === "user"
                    ? "bg-soul-purple text-white"
                    : "cosmic-card"
                )}
              >
                <div className="flex items-center space-x-2 mb-1">
                  {message.sender === "ai" ? (
                    <Sparkles className="h-4 w-4 text-soul-purple" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <p className="text-xs font-medium">
                    {message.sender === "ai" ? "Soul Coach" : "You"}
                  </p>
                </div>
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="cosmic-card max-w-[80%] rounded-2xl p-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-soul-purple" />
                  <p className="text-xs font-medium">Soul Coach</p>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm">Consulting your Soul Blueprint...</p>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="sticky bottom-0 pb-4">
          <CosmicCard className="flex items-center space-x-2 p-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask your Soul Coach..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={inputValue.trim() === "" || isLoading}
              className="bg-soul-purple hover:bg-soul-purple/90"
            >
              <SendHorizontal className="h-4 w-4" />
            </Button>
          </CosmicCard>
          <p className="text-xs text-center text-muted-foreground mt-2">
            Your Soul Coach responds based on your unique Blueprint
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Coach;
