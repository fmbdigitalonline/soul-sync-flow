
import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { enhancedPersonalityEngine } from '@/services/enhanced-personality-engine';
import { personalityVectorService } from '@/services/personality-vector-service';

export interface VFPGraphMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  personalityInsight?: string;
  vectorInfluence?: number;
}

export const useEnhancedAICoachVFP = () => {
  const [messages, setMessages] = useState<VFPGraphMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [personalityVector, setPersonalityVector] = useState<Float32Array | null>(null);
  const { user } = useAuth();
  
  const conversationRef = useRef<{ messageCount: number }>({ messageCount: 0 });

  // Initialize VFP-Graph intelligence
  const initializeVFPGraph = useCallback(async () => {
    if (!user) return;

    try {
      console.log('🧠 Initializing VFP-Graph intelligence...');
      
      // Set user ID in personality engine
      enhancedPersonalityEngine.setUserId(user.id);
      
      // Load personality vector
      const vector = await personalityVectorService.getVector(user.id);
      setPersonalityVector(vector);
      
      // Get persona summary
      const summary = await personalityVectorService.getPersonaSummary(user.id);
      
      console.log(`✅ VFP-Graph initialized: ${summary}`);
      
      // Add welcome message with personality insight
      const welcomeMessage: VFPGraphMessage = {
        id: `vfp-welcome-${Date.now()}`,
        content: `Hello! I'm powered by VFP-Graph technology and have a deep understanding of your unique personality: ${summary}. How can I help you today?`,
        sender: 'ai',
        timestamp: new Date(),
        personalityInsight: summary,
        vectorInfluence: Array.from(vector).reduce((sum, val) => sum + Math.abs(val), 0) / 128
      };
      
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('❌ Error initializing VFP-Graph:', error);
    }
  }, [user]);

  // Send message with VFP-Graph intelligence
  const sendMessage = useCallback(async (content: string, mode: 'coach' | 'guide' | 'blend' = 'guide') => {
    if (!user || !content.trim()) return;

    const userMessage: VFPGraphMessage = {
      id: `user-${Date.now()}`,
      content: content.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsGenerating(true);

    try {
      // Generate VFP-Graph powered system prompt
      const systemPrompt = await enhancedPersonalityEngine.generateSystemPrompt(mode, content);
      
      console.log('🎯 VFP-Graph system prompt generated for coaching');

      // Simulate AI response (in real implementation, this would call OpenAI)
      const aiResponse = await generateVFPGraphResponse(content, systemPrompt, personalityVector);
      
      const aiMessage: VFPGraphMessage = {
        id: `ai-${Date.now()}`,
        content: aiResponse.content,
        sender: 'ai',
        timestamp: new Date(),
        personalityInsight: aiResponse.personalityInsight,
        vectorInfluence: aiResponse.vectorInfluence
      };

      setMessages(prev => [...prev, aiMessage]);
      conversationRef.current.messageCount += 2;

    } catch (error) {
      console.error('❌ Error sending VFP-Graph message:', error);
      
      const errorMessage: VFPGraphMessage = {
        id: `error-${Date.now()}`,
        content: 'I apologize, but I encountered an issue. My VFP-Graph intelligence is still learning. Please try again.',
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  }, [user, personalityVector]);

  // Handle feedback for continuous learning
  const provideFeedback = useCallback(async (messageId: string, isPositive: boolean) => {
    if (!user) return;

    try {
      await personalityVectorService.voteThumb(user.id, messageId, isPositive);
      
      // Update local message to reflect feedback given
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, personalityInsight: `${msg.personalityInsight} (Feedback: ${isPositive ? '👍' : '👎'})` }
          : msg
      ));

      console.log(`✅ VFP-Graph feedback recorded for message ${messageId}`);
    } catch (error) {
      console.error('❌ Error providing feedback:', error);
    }
  }, [user]);

  return {
    messages,
    isGenerating,
    personalityVector,
    sendMessage,
    provideFeedback,
    initializeVFPGraph,
    conversationStats: {
      messageCount: conversationRef.current.messageCount,
      hasPersonalityVector: !!personalityVector,
      vectorDimensions: personalityVector?.length || 0
    }
  };
};

// Simulate VFP-Graph powered AI response generation
async function generateVFPGraphResponse(
  userInput: string, 
  systemPrompt: string, 
  vector: Float32Array | null
): Promise<{
  content: string;
  personalityInsight: string;
  vectorInfluence: number;
}> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Analyze vector influence on response
  const vectorInfluence = vector 
    ? Array.from(vector).reduce((sum, val) => sum + Math.abs(val), 0) / 128
    : 0.5;

  // Generate personality-aware response
  const responses = [
    "Based on your unique personality pattern, I'd suggest approaching this step by step. Your vector shows you prefer detailed planning.",
    "I can see from your personality profile that you're naturally intuitive. Trust that instinct while we work through this together.",
    "Your personality vector indicates you thrive with structured support. Let me break this down into manageable pieces for you.",
    "Given your energy patterns, I think you'll find this approach resonates with your natural way of processing information."
  ];

  const response = responses[Math.floor(Math.random() * responses.length)];
  
  return {
    content: response,
    personalityInsight: `Calibrated to your ${vectorInfluence > 0.6 ? 'high-intensity' : 'balanced'} personality vector`,
    vectorInfluence
  };
}
