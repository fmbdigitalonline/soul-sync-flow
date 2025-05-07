
import React, { useState, useRef, useEffect } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, SendHorizontal, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
};

const initialMessages: Message[] = [
  {
    id: "1",
    content: "Hello Sarah! I'm your SoulSync AI coach. Based on your Soul Blueprint (Leo Sun, Pisces Moon, Virgo Rising, INFJ, Life Path 7, Projector), I'm here to provide guidance aligned with your unique design. How can I assist you today?",
    sender: "ai",
    timestamp: new Date(),
  },
];

const Coach = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    // Simulate AI response after a delay
    setTimeout(() => {
      const aiResponses: { [key: string]: string } = {
        "goal": "Based on your Leo Sun and INFJ personality, I sense you're drawn to goals with meaning and impact. Your Projector energy works best when you're recognized for your guidance and insights. What specific area are you looking to make progress in?",
        "stuck": "I see that you're feeling stuck. With your Pisces Moon, you might be absorbing surrounding energies that aren't yours. Your Life Path 7 suggests you need quiet reflection time. Try taking a break to meditate for 10 minutes, then approach your task with fresh eyes.",
        "motivation": "As a Projector with Leo energy, your motivation comes when you're recognized and invited to share your gifts. Your INFJ nature needs meaningful work aligned with your values. Consider how your current goals connect to your deeper purpose - or if they need adjustment to better match your authentic design.",
        "tired": "Your Projector design isn't meant for constant action - you're designed to guide energy, not generate it. Your Pisces Moon also makes you sensitive to energy depletion. Try scheduling focused work during your natural energy peaks, followed by true rest. Your Blueprint suggests mornings might be your optimal time.",
      };

      let responseText = "I understand. With your unique blueprint, I recommend focusing on activities that align with your natural gifts while honoring your sensitivity and need for meaningful work. Would you like more specific guidance on this topic?";
      
      for (const [keyword, response] of Object.entries(aiResponses)) {
        if (inputValue.toLowerCase().includes(keyword)) {
          responseText = response;
          break;
        }
      }

      const newAiMessage: Message = {
        id: Date.now().toString(),
        content: responseText,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newAiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-5rem)] max-w-md mx-auto p-4">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold font-display">
            <span className="gradient-text">Soul Coach</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Your AI guide aligned with your Soul Blueprint
          </p>
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
