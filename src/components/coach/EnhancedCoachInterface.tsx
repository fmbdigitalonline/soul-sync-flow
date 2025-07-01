
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
import ACSEnhancedCoachInterface from './ACSEnhancedCoachInterface';
import UnifiedCoachInterface from './UnifiedCoachInterface';
import { AgentMode } from '@/types/personality-modules';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  agentMode: AgentMode;
  interventionApplied?: boolean;
  fallbackUsed?: boolean;
  brainMetrics?: any;
}

interface EnhancedCoachInterfaceProps {
  sessionId: string;
  initialMessages?: Message[];
  onNewMessage?: (message: Message) => void;
}

const EnhancedCoachInterface: React.FC<EnhancedCoachInterfaceProps> = (props) => {
  // Check if unified brain should be enabled (could be based on user settings, feature flags, etc.)
  const [useUnifiedBrain, setUseUnifiedBrain] = useState(true);
  const [useACS, setUseACS] = useState(true);
  const [messages, setMessages] = useState<Message[]>(props.initialMessages || []);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      timestamp: new Date(),
      agentMode: 'guide'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Use regular AI coach without unified brain or ACS
      const { data, error } = await supabase.functions.invoke("ai-coach", {
        body: {
          message: inputValue.trim(),
          sessionId: props.sessionId,
          systemPrompt: "You are a helpful AI assistant. Respond naturally and helpfully to user questions.",
          temperature: 0.7,
          maxTokens: 200,
          includeBlueprint: false,
          agentType: "guide",
          language: "en"
        },
      });

      if (error || !data?.response) {
        throw new Error("AI coach service failed");
      }

      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        content: data.response,
        isUser: false,
        timestamp: new Date(),
        agentMode: 'guide'
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (props.onNewMessage) {
        props.onNewMessage(userMessage);
        props.onNewMessage(assistantMessage);
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
      
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        content: "I'm sorry, I'm having trouble responding right now. Please try again.",
        isUser: false,
        timestamp: new Date(),
        agentMode: 'guide',
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

  if (useUnifiedBrain) {
    return <UnifiedCoachInterface {...props} agentMode="guide" />;
  }

  if (useACS) {
    return <ACSEnhancedCoachInterface {...props} />;
  }

  // Original coach interface (both systems disabled)
  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto space-y-4">
      
      {/* Status Bar */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium">Basic AI Coach</span>
          <Badge variant="secondary">No Brain/ACS</Badge>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUseACS(true)}
          >
            Enable ACS
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUseUnifiedBrain(true)}
          >
            <Brain className="w-4 h-4 mr-2" />
            Enable Unified Brain
          </Button>
        </div>
      </div>

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
                  
                  {!message.isUser && (
                    <div className="flex items-center space-x-2 mt-2">
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
              placeholder="Type your message..."
              className="flex-1 min-h-[60px]"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="self-end"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EnhancedCoachInterface;
