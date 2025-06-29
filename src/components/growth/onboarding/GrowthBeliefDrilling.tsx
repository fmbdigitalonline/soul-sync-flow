
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Send, ArrowLeft } from 'lucide-react';
import { LifeDomain } from '@/types/growth-program';
import { GuideInterface } from '@/components/coach/GuideInterface';
import { useProgramAwareCoach } from '@/hooks/use-program-aware-coach';
import { useConversationRecovery } from '@/hooks/use-conversation-recovery';
import { ConversationRecoveryBanner } from '@/components/growth/ConversationRecoveryBanner';

interface GrowthBeliefDrillingProps {
  domain: LifeDomain;
  onComplete: (beliefData: any) => void;
  beliefData: any;
}

export const GrowthBeliefDrilling: React.FC<GrowthBeliefDrillingProps> = ({
  domain,
  onComplete,
  beliefData
}) => {
  const { messages, isLoading, sendMessage, initializeBeliefDrilling, recoverConversation } = useProgramAwareCoach();
  const { availableRecoveries, loadAvailableRecoveries, deleteConversation } = useConversationRecovery();
  const [isInitialized, setIsInitialized] = useState(false);
  const [showRecoveryBanner, setShowRecoveryBanner] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const domainEmoji = {
    career: '🏢',
    relationships: '💕',
    wellbeing: '🌱',
    finances: '💰',
    creativity: '🎨',
    spirituality: '✨',
    home_family: '🏠'
  };

  const domainTitle = {
    career: 'Career & Purpose',
    relationships: 'Relationships & Love',
    wellbeing: 'Health & Wellbeing',
    finances: 'Money & Abundance',
    creativity: 'Creativity & Expression',
    spirituality: 'Spirituality & Meaning',
    home_family: 'Home & Family'
  };

  // Load available recoveries when component mounts
  useEffect(() => {
    loadAvailableRecoveries(domain);
  }, [domain, loadAvailableRecoveries]);

  useEffect(() => {
    if (!isInitialized && availableRecoveries.length === 0) {
      console.log('🔍 Initializing belief drilling for domain:', domain);
      setIsInitialized(true);
      
      // Initialize belief drilling mode - AI will start the conversation
      initializeBeliefDrilling(domain);
    }
  }, [domain, isInitialized, initializeBeliefDrilling, availableRecoveries.length]);

  const handleSendMessage = async (message: string) => {
    console.log('📤 Sending belief drilling response:', message);
    sendMessage(message);
  };

  const handleRecoverConversation = async (sessionId: string) => {
    console.log('🔄 Recovering conversation:', sessionId);
    await recoverConversation(sessionId);
    setShowRecoveryBanner(false);
    setIsInitialized(true);
  };

  const handleDismissRecovery = async (sessionId: string) => {
    await deleteConversation(sessionId);
    setShowRecoveryBanner(false);
    
    // Start fresh conversation
    if (!isInitialized) {
      setIsInitialized(true);
      initializeBeliefDrilling(domain);
    }
  };

  const handleContinue = () => {
    console.log('✅ Belief drilling complete, extracting data from', messages.length, 'messages');
    
    // Extract belief data from conversation
    const extractedBeliefs = {
      domain,
      conversations: messages,
      keyInsights: extractKeyInsights(messages),
      coreChallenges: extractCoreChallenges(messages),
      rootCauses: extractRootCauses(messages)
    };
    
    console.log('📊 Extracted belief data:', extractedBeliefs);
    onComplete(extractedBeliefs);
  };

  function extractKeyInsights(msgs: any[]) {
    return msgs
      .filter(m => m.sender === 'user')
      .map(m => m.content)
      .slice(-3);
  }

  function extractCoreChallenges(msgs: any[]) {
    const challenges = [];
    const userMessages = msgs.filter(m => m.sender === 'user');
    
    for (const msg of userMessages) {
      const content = msg.content.toLowerCase();
      if (content.includes('struggle') || content.includes('difficult') || 
          content.includes('challenge') || content.includes('fear')) {
        challenges.push(msg.content);
      }
    }
    
    return challenges.slice(0, 3);
  }

  function extractRootCauses(msgs: any[]) {
    const patterns = [];
    const userMessages = msgs.filter(m => m.sender === 'user');
    
    for (const msg of userMessages) {
      const content = msg.content.toLowerCase();
      if (content.includes('because') || content.includes('always') || 
          content.includes('never') || content.includes('believe')) {
        patterns.push(msg.content);
      }
    }
    
    return patterns.slice(0, 3);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b bg-gradient-to-r from-soul-purple/5 to-soul-teal/5">
        <div className="flex items-center space-x-4">
          <div className="text-3xl">{domainEmoji[domain]}</div>
          <div>
            <h2 className="text-xl font-bold">Exploring {domainTitle[domain]}</h2>
            <p className="text-sm text-muted-foreground">
              Let's dive deep into your motivations and beliefs in this area
            </p>
          </div>
        </div>
      </div>

      {/* Conversation Recovery Banner */}
      {showRecoveryBanner && availableRecoveries.length > 0 && (
        <div className="flex-shrink-0 p-4">
          <ConversationRecoveryBanner
            recoveries={availableRecoveries}
            onRecover={handleRecoverConversation}
            onDismiss={handleDismissRecovery}
            onClose={() => setShowRecoveryBanner(false)}
          />
        </div>
      )}

      {/* Chat Interface - Preserve conversation history */}
      <div className="flex-1 min-h-0">
        <GuideInterface
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          messagesEndRef={messagesEndRef}
        />
      </div>

      {/* Action Bar */}
      {messages.length >= 6 && (
        <div className="flex-shrink-0 p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center max-w-2xl mx-auto">
            <p className="text-sm text-muted-foreground">
              Ready to create your personalized growth program?
            </p>
            <Button 
              onClick={handleContinue}
              className="bg-soul-purple hover:bg-soul-purple/90"
            >
              Generate My Program
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
