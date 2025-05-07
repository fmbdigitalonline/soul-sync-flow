
import React, { useState, useRef, useEffect } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, SendHorizontal, User, Loader2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { blueprintService, BlueprintData, defaultBlueprintData } from "@/services/blueprint-service";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
};

const Coach = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [blueprint, setBlueprint] = useState<BlueprintData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingBlueprint, setIsLoadingBlueprint] = useState(true);
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

  // Fetch blueprint data
  useEffect(() => {
    const fetchBlueprintData = async () => {
      if (isAuthenticated) {
        setIsLoadingBlueprint(true);
        const { data, error } = await blueprintService.getActiveBlueprintData();
        
        if (error) {
          toast({
            title: "Error loading blueprint data",
            description: error,
            variant: "destructive"
          });
        }
        
        // Use default data if no blueprint exists
        setBlueprint(data || defaultBlueprintData);
        setIsLoadingBlueprint(false);
      }
    };
    
    if (isAuthenticated) {
      fetchBlueprintData();
    }
  }, [isAuthenticated, toast]);

  // Initialize welcome message when blueprint loads
  useEffect(() => {
    if (blueprint && messages.length === 0 && !isLoadingBlueprint) {
      // Create personalized welcome message based on blueprint data
      const mbtiType = blueprint.cognition_mbti.type;
      const hdType = blueprint.energy_strategy_human_design.type;
      const preferredName = blueprint.user_meta.preferred_name || "there";
      const sunSign = blueprint.archetype_western.sun_sign.split(" ")[0];
      const moonSign = blueprint.archetype_western.moon_sign.split(" ")[0];
      const rising = blueprint.archetype_western.rising_sign || "Virgo";
      const lifePathNumber = blueprint.values_life_path.life_path_number;
      
      const welcomeMessage: Message = {
        id: "welcome",
        content: `Hello ${preferredName}! I'm your SoulSync AI coach. Based on your Soul Blueprint (${sunSign} Sun, ${moonSign} Moon, ${rising} Rising, ${mbtiType}, Life Path ${lifePathNumber}, ${hdType}), I'm here to provide guidance aligned with your unique design. How can I assist you today?`,
        sender: "ai",
        timestamp: new Date(),
      };
      
      setMessages([welcomeMessage]);
    }
  }, [blueprint, messages.length, isLoadingBlueprint]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsLoading(true);

    // Generate AI response using blueprint data
    generateAIResponse(inputValue, blueprint);
  };

  const generateAIResponse = (userInput: string, blueprint: BlueprintData | null) => {
    // In a real implementation, this would call an AI service with the blueprint data
    // For now, we'll simulate responses based on keywords and blueprint properties
    
    setTimeout(() => {
      let responseText = "I understand. Based on your unique blueprint, I recommend focusing on activities that align with your natural gifts while honoring your sensitivity and need for meaningful work. Would you like more specific guidance on this topic?";
      
      if (!blueprint) {
        responseText = "I don't seem to have access to your complete Soul Blueprint. Let me provide some general guidance instead.";
      } else {
        // Generate more personalized responses based on blueprint data and user input
        const mbtiType = blueprint.cognition_mbti.type;
        const hdType = blueprint.energy_strategy_human_design.type;
        const strategy = blueprint.energy_strategy_human_design.strategy;
        const authority = blueprint.energy_strategy_human_design.authority;
        
        const keywords = {
          "goal": `Based on your ${mbtiType} personality and ${hdType} energy, I sense you're drawn to goals with meaning and impact. Your ${hdType} energy works best when you're ${strategy.toLowerCase()}. What specific area are you looking to make progress in?`,
          
          "stuck": `I see that you're feeling stuck. With your ${blueprint.archetype_western.moon_sign} Moon, you might be absorbing surrounding energies that aren't yours. Your Life Path ${blueprint.values_life_path.life_path_number} suggests you need ${blueprint.values_life_path.life_path_number === 7 ? "quiet reflection time" : "creative expression"}. Try taking a break to meditate for 10 minutes, then approach your task with fresh eyes.`,
          
          "motivation": `As a ${hdType} with ${blueprint.archetype_western.sun_sign} energy, your motivation comes when you're ${strategy.toLowerCase()}. Your ${mbtiType} nature needs meaningful work aligned with your values. Consider how your current goals connect to your deeper purpose - or if they need adjustment to better match your authentic design.`,
          
          "tired": `Your ${hdType} design isn't meant for constant action - ${hdType === "Projector" ? "you're designed to guide energy, not generate it" : hdType === "Manifesting Generator" ? "you need to respond to what lights you up" : "you need to wait for clarity before acting"}. Your ${blueprint.archetype_western.moon_sign} Moon also makes you sensitive to energy depletion. Try scheduling focused work during your natural energy peaks, followed by true rest.`,
          
          "advice": `With your ${authority} Authority, decisions are best made by ${authority === "Emotional" ? "waiting through your emotional wave" : authority === "Splenic" ? "listening to your intuitive hits" : "consulting with others then feeling into it"}. Given your ${mbtiType} cognition style, you'll want to ${mbtiType.includes("N") ? "consider the big picture implications" : "focus on practical, tangible outcomes"}.`,
          
          "purpose": `Your Life Path ${blueprint.values_life_path.life_path_number} as a ${blueprint.values_life_path.life_path_keyword} combined with your ${hdType} energy suggests your purpose involves ${hdType === "Projector" ? "guiding others with your insights" : hdType === "Generator" ? "finding satisfaction in your work" : "initiating transformative changes"}. How does that resonate with you?`
        };
        
        for (const [keyword, response] of Object.entries(keywords)) {
          if (userInput.toLowerCase().includes(keyword)) {
            responseText = response;
            break;
          }
        }
      }

      const newAIMessage: Message = {
        id: Date.now().toString(),
        content: responseText,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newAIMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
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

  if (isLoadingBlueprint) {
    return (
      <MainLayout>
        <div className="flex flex-col h-[calc(100vh-5rem)] max-w-md mx-auto p-4 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-soul-purple" />
          <p className="mt-2">Loading your Soul Blueprint...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-5rem)] max-w-md mx-auto p-4">
        <div className="text-center mb-4 flex justify-between items-center">
          <div></div> {/* Empty div for spacing */}
          <h1 className="text-2xl font-bold font-display">
            <span className="gradient-text">Soul Coach</span>
          </h1>
          <Button variant="ghost" size="icon" onClick={() => window.location.href = '/blueprint'}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto mb-4 space-y-4 pb-4">
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
