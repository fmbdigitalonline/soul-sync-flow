import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Send, ThumbsUp, ThumbsDown, Mic, MicOff, Sparkles, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { IntelligentSoulOrb } from '@/components/ui/intelligent-soul-orb';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useHACSConversation, type ConversationMessage } from '@/hooks/use-hacs-conversation';
import { useHacsIntelligence } from '@/hooks/use-hacs-intelligence';
import { cn } from '@/lib/utils';

interface InteractiveHACSChatProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: ConversationMessage | null;
}

export const InteractiveHACSChat: React.FC<InteractiveHACSChatProps> = ({
  isOpen,
  onClose,
  initialMessage
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isLoading,
    isTyping,
    currentQuestion,
    sendMessage,
    generateQuestion,
    provideFeedback
  } = useHACSConversation();

  const { intelligence, loading: intelligenceLoading } = useHacsIntelligence();
  const intelligenceLevel = intelligence?.intelligence_level || 50;

  // Add initial message to conversation if provided
  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      // The useHACSConversation hook will handle loading history
    }
  }, [initialMessage, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    await sendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input is not supported in your browser');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      alert('Voice input error. Please try again.');
    };

    recognition.start();
  };

  const handleQuickResponse = (response: string) => {
    setInputValue(response);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleFeedback = (type: 'helpful' | 'not_helpful', messageId: string, questionId?: string) => {
    provideFeedback(type, type === 'helpful' ? 1 : -1, messageId, questionId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Chat Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-8 z-50 flex items-center justify-center pointer-events-none"
          >
            <CosmicCard className="w-full max-w-4xl h-[90vh] flex flex-col pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
                <div className="flex items-center space-x-3">
                  <IntelligentSoulOrb
                    size="sm"
                    intelligenceLevel={intelligenceLevel}
                    showProgressRing={true}
                    pulse={isTyping}
                  />
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      HACS Companion
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Adaptive Intelligence: {intelligenceLevel}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateQuestion}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Ask Me
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="rounded-full w-8 h-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center space-y-4 mt-8">
                      <div className="text-muted-foreground">
                        Your HACS companion is ready for conversation
                      </div>
                      <div className="flex justify-center">
                        <Button onClick={generateQuestion} disabled={isLoading}>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Start with a Question
                        </Button>
                      </div>
                    </div>
                  )}

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex items-start space-x-3",
                        message.role === 'user' ? "flex-row-reverse space-x-reverse" : ""
                      )}
                    >
                      {message.role === 'hacs' && (
                        <IntelligentSoulOrb
                          size="sm"
                          intelligenceLevel={intelligenceLevel}
                          showProgressRing={false}
                          pulse={false}
                        />
                      )}
                      
                      <div className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3",
                        message.role === 'user' 
                          ? "bg-primary text-primary-foreground ml-auto" 
                          : "bg-muted/50"
                      )}>
                        {message.module && (
                          <Badge variant="outline" className="mb-2 text-xs">
                            {message.module} Module
                          </Badge>
                        )}
                        
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-60">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                          
                          {message.role === 'hacs' && (
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleFeedback('helpful', message.id, message.questionId)}
                                className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleFeedback('not_helpful', message.id, message.questionId)}
                                className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex items-start space-x-3">
                      <IntelligentSoulOrb
                        size="sm"
                        intelligenceLevel={intelligenceLevel}
                        showProgressRing={false}
                        pulse={true}
                      />
                      <div className="bg-muted/50 rounded-2xl px-4 py-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Response Suggestions */}
                {currentQuestion && (
                  <div className="p-4 border-t border-border">
                    <div className="text-sm text-muted-foreground mb-2">Quick responses:</div>
                    <div className="flex gap-2 flex-wrap">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleQuickResponse("Yes, that's accurate")}
                      >
                        Yes
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleQuickResponse("Not really")}
                      >
                        No
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleQuickResponse("Tell me more about this")}
                      >
                        More Info
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleQuickResponse("I'd prefer not to answer that")}
                      >
                        Skip
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-border shrink-0">
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <Textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Share your thoughts with HACS..."
                      className="min-h-[60px] resize-none pr-12"
                      disabled={isLoading}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleVoiceInput}
                      disabled={isLoading}
                      className={cn(
                        "absolute bottom-2 right-2 w-8 h-8 p-0",
                        isListening ? "text-red-500" : "text-muted-foreground"
                      )}
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputValue.trim()}
                    className="self-end h-[60px] px-6"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CosmicCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};