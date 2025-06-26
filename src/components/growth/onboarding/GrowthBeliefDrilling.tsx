import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Send, ArrowLeft } from 'lucide-react';
import { LifeDomain } from '@/types/growth-program';
import { GuideInterface } from '@/components/coach/GuideInterface';
import { useEnhancedAICoach } from '@/hooks/use-enhanced-ai-coach';

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
  const { messages, isLoading, sendMessage, resetConversation } = useEnhancedAICoach("guide");
  const [isInitialized, setIsInitialized] = useState(false);
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

  useEffect(() => {
    if (!isInitialized) {
      console.log('🔍 Initializing belief drilling for domain:', domain);
      
      setIsInitialized(true);
      resetConversation();
      
      // Start with a simple, conversational drilling question
      setTimeout(() => {
        const startingQuestion = `What draws you to focusing on ${domainTitle[domain]} right now? What's happening in this area of your life that feels ready for exploration?`;
        
        console.log('🚀 Starting belief drilling with question:', startingQuestion);
        
        // Send this as a coach message directly, not as a system prompt
        sendMessage(startingQuestion, true); // Use assistant flag to make it appear as coach message
      }, 1000);
    }
  }, [domain, isInitialized, resetConversation, sendMessage, domainTitle]);

  const handleSendMessage = async (message: string) => {
    console.log('📤 Sending belief drilling response:', message);
    
    // Send user message normally
    sendMessage(message);
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

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-soul-purple/5 to-soul-teal/5 flex-shrink-0">
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

      {/* Scrollable Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-4">
          <GuideInterface
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            messagesEndRef={messagesEndRef}
          />
        </div>
      </div>

      {/* Action Bar */}
      {messages.length >= 6 && (
        <div className="p-4 border-t bg-gray-50 flex-shrink-0">
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
};
