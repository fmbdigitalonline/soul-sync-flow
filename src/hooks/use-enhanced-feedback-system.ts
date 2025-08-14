import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface DetailedFeedback {
  messageId: string;
  feedbackType: 'insight' | 'question' | 'conversation';
  quickRating?: 'positive' | 'negative';
  detailedRating?: 1 | 2 | 3 | 4 | 5;
  relevanceRating?: 1 | 2 | 3 | 4 | 5;
  communicationStylePreference?: 'more_formal' | 'less_formal' | 'more_analytical' | 'more_intuitive' | 'just_right';
  topicInterest?: 'very_interested' | 'somewhat_interested' | 'not_interested' | 'suggest_different';
  additionalNotes?: string;
  preferredLanguageComplexity?: 'simpler' | 'current' | 'more_complex';
  preferredFrequency?: 'more_frequent' | 'current' | 'less_frequent';
}

export interface FeedbackPreferences {
  communicationStyle: 'formal' | 'casual' | 'analytical' | 'intuitive' | 'balanced';
  languageComplexity: 'simple' | 'moderate' | 'complex';
  insightFrequency: 'high' | 'moderate' | 'low';
  preferredTopics: string[];
  feedbackHistory: DetailedFeedback[];
}

export const useEnhancedFeedbackSystem = () => {
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [preferences, setPreferences] = useState<FeedbackPreferences>({
    communicationStyle: 'balanced',
    languageComplexity: 'moderate',
    insightFrequency: 'moderate',
    preferredTopics: [],
    feedbackHistory: []
  });
  
  const { language, t } = useLanguage();
  const { user } = useAuth();

  const submitDetailedFeedback = useCallback(async (feedback: DetailedFeedback) => {
    if (!user?.id) return false;

    setIsSubmittingFeedback(true);
    try {
      // Store feedback in HACS learning system
      const { error } = await supabase
        .from('hacs_learning_feedback')
        .insert({
          user_id: user.id,
          message_id: feedback.messageId,
          feedback_type: feedback.feedbackType,
          feedback_value: {
            quickRating: feedback.quickRating,
            detailedRating: feedback.detailedRating,
            relevanceRating: feedback.relevanceRating,
            communicationStylePreference: feedback.communicationStylePreference,
            topicInterest: feedback.topicInterest,
            preferredLanguageComplexity: feedback.preferredLanguageComplexity,
            preferredFrequency: feedback.preferredFrequency,
            language,
            timestamp: new Date().toISOString()
          },
          feedback_text: feedback.additionalNotes,
          module_affected: feedback.feedbackType === 'insight' ? 'PIE' : 'CNR'
        });

      if (error) throw error;

      // Update local preferences based on feedback
      const updatedPreferences = calculateUpdatedPreferences(preferences, feedback);
      setPreferences(updatedPreferences);

      console.log('✅ Enhanced feedback submitted successfully:', {
        messageId: feedback.messageId,
        type: feedback.feedbackType,
        language,
        hasDetailedRating: !!feedback.detailedRating
      });

      return true;
    } catch (error) {
      console.error('❌ Enhanced feedback submission error:', error);
      return false;
    } finally {
      setIsSubmittingFeedback(false);
    }
  }, [user, language, preferences]);

  const getPersonalizedPromptAdjustments = useCallback(() => {
    const adjustments = [];
    
    if (language === 'nl') {
      adjustments.push('Respond in fluent Dutch with appropriate cultural context');
    }
    
    if (preferences.communicationStyle === 'formal') {
      adjustments.push('Use formal, professional language');
    } else if (preferences.communicationStyle === 'casual') {
      adjustments.push('Use casual, friendly language');
    } else if (preferences.communicationStyle === 'analytical') {
      adjustments.push('Provide detailed analysis and logical explanations');
    } else if (preferences.communicationStyle === 'intuitive') {
      adjustments.push('Focus on intuitive insights and holistic understanding');
    }
    
    if (preferences.languageComplexity === 'simple') {
      adjustments.push('Use simple, clear language and avoid technical terms');
    } else if (preferences.languageComplexity === 'complex') {
      adjustments.push('Use sophisticated vocabulary and detailed explanations');
    }
    
    return adjustments;
  }, [language, preferences]);

  const shouldReduceFrequency = useCallback(() => {
    const recentNegativeFeedback = preferences.feedbackHistory
      .filter(f => Date.now() - new Date(f.messageId).getTime() < 24 * 60 * 60 * 1000) // Last 24 hours
      .filter(f => f.quickRating === 'negative' || (f.detailedRating && f.detailedRating <= 2));
    
    return recentNegativeFeedback.length >= 2;
  }, [preferences.feedbackHistory]);

  const getOptimalInsightTiming = useCallback(() => {
    const feedbackHistory = preferences.feedbackHistory;
    
    if (preferences.insightFrequency === 'low' || shouldReduceFrequency()) {
      return 60000; // 1 minute
    } else if (preferences.insightFrequency === 'high') {
      return 15000; // 15 seconds  
    }
    
    return 30000; // 30 seconds default
  }, [preferences, shouldReduceFrequency]);

  return {
    submitDetailedFeedback,
    isSubmittingFeedback,
    preferences,
    getPersonalizedPromptAdjustments,
    shouldReduceFrequency,
    getOptimalInsightTiming,
    t
  };
};

function calculateUpdatedPreferences(
  current: FeedbackPreferences, 
  feedback: DetailedFeedback
): FeedbackPreferences {
  const updated = { ...current };
  
  // Update communication style based on feedback
  if (feedback.communicationStylePreference) {
    switch (feedback.communicationStylePreference) {
      case 'more_formal':
        updated.communicationStyle = 'formal';
        break;
      case 'less_formal':
        updated.communicationStyle = 'casual';
        break;
      case 'more_analytical':
        updated.communicationStyle = 'analytical';
        break;
      case 'more_intuitive':
        updated.communicationStyle = 'intuitive';
        break;
    }
  }
  
  // Update language complexity
  if (feedback.preferredLanguageComplexity) {
    switch (feedback.preferredLanguageComplexity) {
      case 'simpler':
        updated.languageComplexity = 'simple';
        break;
      case 'more_complex':
        updated.languageComplexity = 'complex';
        break;
      case 'current':
        // Keep current setting
        break;
    }
  }
  
  // Update frequency preferences
  if (feedback.preferredFrequency) {
    switch (feedback.preferredFrequency) {
      case 'more_frequent':
        updated.insightFrequency = 'high';
        break;
      case 'less_frequent':
        updated.insightFrequency = 'low';
        break;
      case 'current':
        // Keep current setting
        break;
    }
  }
  
  // Add to feedback history
  updated.feedbackHistory = [...current.feedbackHistory.slice(-19), feedback]; // Keep last 20
  
  return updated;
}
