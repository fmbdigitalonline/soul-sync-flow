import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface HACSQuestion {
  id: string;
  text: string;
  module: string;
  type: 'foundational' | 'validation' | 'philosophical';
}

export const useHACSMicroLearning = () => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<HACSQuestion | null>(null);
  const [sessionId] = useState(`micro_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const generateMicroQuestion = useCallback(async () => {
    if (!user || isGenerating) return null;

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('hacs-intelligent-conversation', {
        body: {
          action: 'generate_question',
          userId: user.id,
          sessionId,
          messageHistory: []
        }
      });

      if (error) throw error;

      if (data.generatedQuestion) {
        const question: HACSQuestion = {
          id: data.generatedQuestion.id,
          text: data.generatedQuestion.text,
          module: data.generatedQuestion.module,
          type: data.generatedQuestion.type
        };
        
        setCurrentQuestion(question);
        return question;
      }

      return null;
    } catch (error) {
      console.error('Error generating micro question:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [user, sessionId, isGenerating]);

  const submitResponse = useCallback(async (
    question: HACSQuestion,
    userResponse: string
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('hacs-response-analysis', {
        body: {
          questionId: question.id,
          userResponse: userResponse.trim(),
          questionText: question.text,
          questionModule: question.module,
          questionType: question.type,
          userId: user.id,
          sessionId
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error submitting response:', error);
      return null;
    }
  }, [user, sessionId]);

  const clearCurrentQuestion = useCallback(() => {
    setCurrentQuestion(null);
  }, []);

  // Trigger micro-learning session based on user activity
  const triggerMicroLearning = useCallback(async (context?: string) => {
    // Don't trigger if already have a question or generating
    if (currentQuestion || isGenerating) return false;

    // Smart timing: trigger after user engagement, not randomly
    const shouldTrigger = Math.random() < 0.3; // 30% chance
    
    if (shouldTrigger) {
      const question = await generateMicroQuestion();
      return !!question;
    }
    
    return false;
  }, [currentQuestion, isGenerating, generateMicroQuestion]);

  return {
    currentQuestion,
    isGenerating,
    generateMicroQuestion,
    submitResponse,
    clearCurrentQuestion,
    triggerMicroLearning
  };
};