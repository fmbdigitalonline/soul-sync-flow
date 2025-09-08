
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2, Brain, Settings } from 'lucide-react';
import { useProductionACS } from '@/hooks/use-production-acs';
import ACSControlPanel from '@/components/acs/ACSControlPanel';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  interventionApplied?: boolean;
  fallbackUsed?: boolean;
}

interface ACSEnhancedCoachInterfaceProps {
  sessionId: string;
  initialMessages?: Message[];
  onNewMessage?: (message: Message) => void;
}

const ACSEnhancedCoachInterface: React.FC<ACSEnhancedCoachInterfaceProps> = ({
  sessionId,
  initialMessages = [],
  onNewMessage
}) => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showACSPanel, setShowACSPanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { status, processMessage } = useProductionACS({
    personalityScaling: true,
    frustrationThreshold: 0.3
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      content: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Try ACS processing first
      let response: string;
      let interventionApplied = false;
      let fallbackUsed = false;

      try {
        const acsResult = await processMessage(inputValue.trim(), sessionId);
        response = acsResult.response;
        interventionApplied = acsResult.interventionApplied;
        fallbackUsed = acsResult.fallbackUsed;
      } catch (acsError) {
        console.log("ACS failed, using regular Soul coach:", acsError);
        
        // Fallback to regular Soul coach
        const { data, error } = await supabase.functions.invoke("ai-coach", {
          body: {
            message: inputValue.trim(),
            sessionId,
            systemPrompt: "You are a helpful Soul assistant. Respond naturally and helpfully to user questions.",
            temperature: 0.7,
            maxTokens: 200,
            includeBlueprint: false,
            agentType: "guide",
            language: "en"
          },
        });

        if (error || !data?.response) {
          throw new Error("Both ACS and fallback coach failed");
        }

        response = data.response;
        fallbackUsed = true;
        toast.warning("Using backup system - ACS temporarily unavailable");
      }

      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        content: response,
        isUser: false,
        timestamp: new Date(),
        interventionApplied,
        fallbackUsed
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (onNewMessage) {
        onNewMessage(userMessage);
        onNewMessage(assistantMessage);
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
      
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        content: "I'm sorry, I'm having trouble responding right now. Please try again.",
        isUser: false,
        timestamp: new Date(),
        fallbackUsed: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto space-y-4">
      
      {/* ACS Status Bar */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
        <div className="flex items-center space-x-3">
          <Brain className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium">Adaptive Context System</span>
          <Badge variant={status.isEnabled ? "default" : "secondary"}>
            {status.isEnabled ? "Active" : "Disabled"}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {status.currentState.replace('_', ' ')}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-600">
            {status.interventionsCount} adaptations
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowACSPanel(!showACSPanel)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ACS Control Panel */}
      {showACSPanel && (
        <ACSControlPanel sessionId={sessionId} />
      )}

      {/* Messages */}
      <Card className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    message.isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  
                  {/* ACS Status Indicators */}
                  {!message.isUser && (
                    <div className="flex items-center space-x-2 mt-2">
                      {message.interventionApplied && (
                        <Badge variant="outline" className="text-xs bg-blue-50">
                          <Brain className="w-3 h-3 mr-1" />
                          Adapted
                        </Badge>
                      )}
                      {message.fallbackUsed && (
                        <Badge variant="outline" className="text-xs bg-orange-50">
                          <Settings className="w-3 h-3 mr-1" />
                          Backup
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('forms.placeholders.typeMessage')}
              className="flex-1 min-h-[60px]"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="self-end"
            >
              {isLoading ? (
                <Loader2 className="w-4 w-4 animate-spin" />
              ) : (
                <Send className="w-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ACSEnhancedCoachInterface;
