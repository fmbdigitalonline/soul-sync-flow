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
    // Only initialize once when the component mounts
    if (!isInitialized) {
      console.log('🔍 Initializing belief drilling for domain:', domain);
      
      setIsInitialized(true);
      
      // Clear any existing conversation
      resetConversation();
      
      // Start with a proper belief drilling question
      setTimeout(() => {
        const drillingPrompt = `I am facilitating a belief drilling session for ${domainTitle[domain]}. This is Growth Mode - I need to guide the user through deep self-exploration using targeted questions.

BELIEF DRILLING INSTRUCTIONS:
- I am a Growth Coach conducting a belief drilling session about ${domainTitle[domain]}
- The user has chosen this domain for growth and needs to explore their deeper beliefs
- I must ask ONE specific, penetrating question at a time
- I should wait for their response before asking the next question
- My goal is to help them discover limiting beliefs, root causes, and core motivations
- I should be warm but focused, going deeper with each question
- NO analysis or reports - just ask targeted questions that reveal beliefs

DRILLING APPROACH:
- Start with "what draws you to this area right now?"
- Follow up based on their answer with deeper "why" questions
- Look for beliefs, fears, patterns, and root causes
- Each question should build on their previous answer

USER CONTEXT: Has chosen ${domainTitle[domain]} as their growth area.

Start the belief drilling session by asking ONE specific question about what draws them to ${domainTitle[domain]} right now. Be conversational and warm, but focused on drilling deeper.`;

        console.log('🚀 Starting belief drilling session');
        sendMessage(drillingPrompt);
      }, 1000);
    }
  }, [domain, isInitialized, resetConversation, sendMessage, domainTitle]);

  const handleSendMessage = async (message: string) => {
    console.log('📤 Sending belief drilling response:', message);
    
    const guidedMessage = `USER RESPONSE TO BELIEF DRILLING: ${message}

BELIEF DRILLING CONTEXT: We are in a belief drilling session about ${domainTitle[domain]}. The user just responded to my question.

NEXT STEP INSTRUCTIONS:
- Based on their response, ask ONE follow-up question that goes deeper
- Look for beliefs, fears, patterns, or root causes to explore
- Ask about specific experiences, feelings, or thoughts they mentioned
- Help them discover what's underneath their surface response
- Stay conversational but focused on going deeper
- NO summaries or analysis - just ask the next drilling question

Continue the belief drilling conversation by asking ONE targeted follow-up question based on their response.`;

    await sendMessage(guidedMessage);
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

  const extractKeyInsights = (msgs: any[]) => {
    // Simple extraction - could be enhanced with AI analysis
    return msgs
      .filter(m => m.sender === 'user')
      .map(m => m.content)
      .slice(-3); // Last 3 user messages
  };

  const extractCoreChallenges = (msgs: any[]) => {
    // Extract challenges mentioned
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
  };

  const extractRootCauses = (msgs: any[]) => {
    // Extract root causes or patterns
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
  };

  return (
    <div className="flex flex-col h-[80vh]">
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-soul-purple/5 to-soul-teal/5">
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

      {/* Chat Interface */}
      <div className="flex-1 p-4">
        <GuideInterface
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          messagesEndRef={messagesEndRef}
        />
      </div>

      {/* Action Bar */}
      {messages.length >= 6 && (
        <div className="p-4 border-t bg-gray-50">
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
