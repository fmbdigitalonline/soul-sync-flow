
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2, Brain, Activity, Database, Zap, Sparkles } from 'lucide-react';
import { unifiedBrainService } from '@/services/unified-brain-service';
import { AgentMode } from '@/types/personality-modules';
import { DialogueState } from '@/types/acs-types';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { usePIEEnhancedCoach } from '@/hooks/use-pie-enhanced-coach';
import { PIEContextualInsights } from '@/components/pie/PIEContextualInsights';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  agentMode?: AgentMode;
  brainMetrics?: any;
  interventionApplied?: boolean;
}

interface UnifiedCoachInterfaceProps {
  sessionId: string;
  agentMode: AgentMode;
  onModeChange?: (newMode: AgentMode) => void;
  initialMessages?: Message[];
  onNewMessage?: (message: Message) => void;
}

const UnifiedCoachInterface: React.FC<UnifiedCoachInterfaceProps> = ({
  sessionId,
  agentMode = 'guide',
  onModeChange,
  initialMessages = [],
  onNewMessage
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentState, setCurrentState] = useState<DialogueState>('NORMAL');
  const [brainInitialized, setBrainInitialized] = useState(false);
  const [brainHealth, setBrainHealth] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use PIE-enhanced coach instead of regular enhanced coach
  const pieCoach = usePIEEnhancedCoach(agentMode);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize unified brain service
  useEffect(() => {
    const initializeBrain = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          await unifiedBrainService.initialize(user.id);
          setBrainInitialized(true);
          setBrainHealth(unifiedBrainService.getBrainHealth());
          console.log("🧠 Unified brain initialized for coach interface");
        }
      } catch (error) {
        console.error("❌ Failed to initialize unified brain:", error);
        toast.error("Failed to initialize AI brain system");
      }
    };

    initializeBrain();
  }, []);

  // Handle agent mode switches
  const handleModeSwitch = async (newMode: AgentMode) => {
    if (!brainInitialized || newMode === agentMode) return;

    try {
      await unifiedBrainService.switchAgentMode(agentMode, newMode, sessionId);
      onModeChange?.(newMode);
      toast.success(`Switched to ${newMode} mode with continuity maintained`);
    } catch (error) {
      console.error("❌ Failed to switch agent mode:", error);
      toast.error("Failed to switch agent mode");
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !brainInitialized) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      content: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
      agentMode
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Use PIE-enhanced message sending
      await pieCoach.sendMessage(inputValue.trim(), true);
      
      // Convert PIE coach messages to our local Message interface
      const convertedMessages = pieCoach.messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        isUser: msg.sender === 'user',
        timestamp: msg.timestamp,
        agentMode: msg.agent_mode || agentMode
      }));
      
      // Update with converted messages, avoiding duplicates
      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const newMessages = convertedMessages.filter(m => !existingIds.has(m.id)).map(msg => ({
          ...msg,
          agentMode: (msg.agentMode as AgentMode) || agentMode
        }));
        return [...prev, ...newMessages];
      });
      
      // Update brain health metrics
      setBrainHealth(unifiedBrainService.getBrainHealth());
      
      if (onNewMessage) {
        onNewMessage(userMessage);
      }

    } catch (error) {
      console.error('❌ Unified brain processing failed:', error);
      toast.error('AI brain system error. Please try again.');
      
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        content: "I'm experiencing some technical difficulties with my brain systems. Please try again.",
        isUser: false,
        timestamp: new Date(),
        agentMode
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

  const getModeIcon = (mode: AgentMode) => {
    switch (mode) {
      case 'coach': return <Zap className="w-4 h-4" />;
      case 'guide': return <Brain className="w-4 h-4" />;
      case 'blend': return <Activity className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getModeColor = (mode: AgentMode) => {
    switch (mode) {
      case 'coach': return 'bg-blue-100 text-blue-800';
      case 'guide': return 'bg-purple-100 text-purple-800';
      case 'blend': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto space-y-4">
      
      {/* Unified Brain Status Bar with PIE Integration */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
        <div className="flex items-center space-x-3">
          <Brain className="w-5 h-5 text-purple-600" />
          <span className="text-sm font-medium">Unified Brain/Soul Architecture</span>
          <Badge variant={brainInitialized ? "default" : "secondary"}>
            {brainInitialized ? "Active" : "Initializing"}
          </Badge>
          <Badge variant={currentState === 'NORMAL' ? "outline" : "default"}>
            State: {currentState}
          </Badge>
          {pieCoach.pieEnabled && (
            <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500">
              PIE Enhanced
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {brainHealth && (
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <Database className="w-3 h-3" />
              <span>Memory: {brainHealth.memorySystemActive ? '✅' : '❌'}</span>
              <span>VFP: {brainHealth.personalityEngineActive ? '✅' : '❌'}</span>
              <span>ACS: {brainHealth.acsSystemActive ? '✅' : '❌'}</span>
              {pieCoach.pieInitialized && <span>PIE: ✅</span>}
            </div>
          )}
        </div>
      </div>

      {/* Agent Mode Selector */}
      <div className="flex items-center justify-center space-x-2 p-2 bg-gray-50 rounded-lg">
        {(['coach', 'guide', 'blend'] as AgentMode[]).map((mode) => (
          <Button
            key={mode}
            variant={agentMode === mode ? "default" : "outline"}
            size="sm"
            onClick={() => handleModeSwitch(mode)}
            disabled={!brainInitialized}
            className={`flex items-center space-x-1 ${agentMode === mode ? getModeColor(mode) : ''}`}
          >
            {getModeIcon(mode)}
            <span className="capitalize">{mode}</span>
          </Button>
        ))}
      </div>

      {/* PIE Insights Display */}
      {pieCoach.pieInsights.length > 0 && (
        <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Active Insights</span>
          </div>
          <div className="text-xs text-purple-700">
            {pieCoach.pieInsights.slice(0, 2).map(insight => insight.title).join(' • ')}
          </div>
        </div>
      )}

      {/* Contextual Coach Insights */}
      <div className="mb-4">
        <PIEContextualInsights context="coach" compact={true} maxInsights={2} />
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
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getModeColor(message.agentMode || agentMode)}>
                          {getModeIcon(message.agentMode || agentMode)}
                          <span className="ml-1 capitalize">{message.agentMode || agentMode}</span>
                        </Badge>
                        {message.interventionApplied && (
                          <Badge variant="outline" className="bg-orange-100 text-orange-800">
                            ACS Intervention
                          </Badge>
                        )}
                      </div>
                      <span className="text-gray-500">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  )}

                  {message.brainMetrics && (
                    <div className="mt-1 text-xs text-gray-500 flex space-x-2">
                      <span>Memory: {message.brainMetrics.memoryLatency.toFixed(0)}ms</span>
                      <span>•</span>
                      <span>Coherence: {(message.brainMetrics.personalityCoherence * 100).toFixed(0)}%</span>
                      {message.brainMetrics.adaptiveResponse && <span>• Adaptive ✓</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-gray-600">Brain processing...</span>
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
              placeholder={`Message your ${agentMode}... (unified brain + PIE active)`}
              className="flex-1 min-h-[60px]"
              disabled={isLoading || !brainInitialized}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim() || !brainInitialized}
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

export default UnifiedCoachInterface;
