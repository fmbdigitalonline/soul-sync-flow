import { useState, useEffect } from 'react';
import { LifeWheelAssessment, LifeDomain } from '@/types/growth-program';
import { useBlueprintData } from './use-blueprint-data';

interface AssessmentMethodRecommendation {
  method: 'quick_focus' | 'full_assessment' | 'guided_discovery' | 'progressive_journey';
  confidence: number;
  reasoning: string[];
  estimatedTime: string;
  bestForUser: boolean;
}

interface AssessmentQualityScore {
  overall: number;
  completeness: number;
  consistency: number;
  personalAlignment: number;
  insights: string[];
}

interface ContextualInsight {
  type: 'strength' | 'opportunity' | 'pattern' | 'recommendation';
  title: string;
  description: string;
  domains: LifeDomain[];
  confidence: number;
}

export function useAssessmentIntelligence() {
  const [methodRecommendations, setMethodRecommendations] = useState<AssessmentMethodRecommendation[]>([]);
  const [lastQualityScore, setLastQualityScore] = useState<AssessmentQualityScore | null>(null);
  const [userPreferences, setUserPreferences] = useState<{
    preferredMethod?: string;
    timeAvailability: 'low' | 'medium' | 'high';
    detailPreference: 'quick' | 'detailed' | 'thorough';
    lastMethodUsed?: string;
    methodSatisfaction?: number;
  }>({
    timeAvailability: 'medium',
    detailPreference: 'detailed'
  });

  const { blueprintData } = useBlueprintData();

  // Load user preferences from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('assessment_user_preferences');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserPreferences(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  }, []);

  // Save preferences when they change
  useEffect(() => {
    try {
      localStorage.setItem('assessment_user_preferences', JSON.stringify(userPreferences));
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  }, [userPreferences]);

  const generateMethodRecommendations = (): AssessmentMethodRecommendation[] => {
    const recommendations: AssessmentMethodRecommendation[] = [];

    // Analyze user context for personalized recommendations
    const hasBlueprint = !!blueprintData;
    const isNewUser = !userPreferences.lastMethodUsed;
    const hasLimitedTime = userPreferences.timeAvailability === 'low';
    const prefersDetail = userPreferences.detailPreference === 'thorough';

    // Quick Focus Recommendation
    const quickFocusReasons: string[] = [];
    let quickFocusConfidence = 0.6;

    if (hasLimitedTime) {
      quickFocusReasons.push('Perfect for your busy schedule');
      quickFocusConfidence += 0.2;
    }
    if (userPreferences.preferredMethod === 'quick_focus') {
      quickFocusReasons.push('Matches your previous preference');
      quickFocusConfidence += 0.2;
    }
    if (userPreferences.detailPreference === 'quick') {
      quickFocusReasons.push('Aligns with your preference for quick insights');
      quickFocusConfidence += 0.15;
    }

    recommendations.push({
      method: 'quick_focus',
      confidence: Math.min(quickFocusConfidence, 1.0),
      reasoning: quickFocusReasons.length > 0 ? quickFocusReasons : ['Fast and focused on your priorities'],
      estimatedTime: '2-3 minutes',
      bestForUser: quickFocusConfidence > 0.8
    });

    // Full Assessment Recommendation
    const fullAssessmentReasons: string[] = [];
    let fullAssessmentConfidence = 0.7;

    if (prefersDetail) {
      fullAssessmentReasons.push('Provides comprehensive life overview');
      fullAssessmentConfidence += 0.2;
    }
    if (isNewUser) {
      fullAssessmentReasons.push('Ideal for your first complete assessment');
      fullAssessmentConfidence += 0.15;
    }
    if (userPreferences.timeAvailability === 'high') {
      fullAssessmentReasons.push('You have time for a thorough assessment');
      fullAssessmentConfidence += 0.1;
    }

    recommendations.push({
      method: 'full_assessment',
      confidence: Math.min(fullAssessmentConfidence, 1.0),
      reasoning: fullAssessmentReasons.length > 0 ? fullAssessmentReasons : ['Complete assessment across all life domains'],
      estimatedTime: '5-7 minutes',
      bestForUser: fullAssessmentConfidence > 0.8
    });

    // Guided Discovery Recommendation
    const guidedReasons: string[] = [];
    let guidedConfidence = 0.5;

    if (hasBlueprint) {
      guidedReasons.push('AI coach knows your personality blueprint');
      guidedConfidence += 0.25;
    }
    if (userPreferences.detailPreference === 'detailed') {
      guidedReasons.push('Interactive approach matches your style');
      guidedConfidence += 0.2;
    }
    if (isNewUser) {
      guidedReasons.push('Gentle introduction with AI guidance');
      guidedConfidence += 0.15;
    }

    recommendations.push({
      method: 'guided_discovery',
      confidence: Math.min(guidedConfidence, 1.0),
      reasoning: guidedReasons.length > 0 ? guidedReasons : ['Conversational assessment with AI coach'],
      estimatedTime: '10-15 minutes',
      bestForUser: guidedConfidence > 0.8
    });

    // Progressive Journey Recommendation
    const progressiveReasons: string[] = [];
    let progressiveConfidence = 0.4;

    if (userPreferences.lastMethodUsed && userPreferences.methodSatisfaction && userPreferences.methodSatisfaction < 7) {
      progressiveReasons.push('Different approach may work better for you');
      progressiveConfidence += 0.3;
    }
    if (userPreferences.detailPreference === 'thorough') {
      progressiveReasons.push('Deep, step-by-step exploration');
      progressiveConfidence += 0.25;
    }
    if (hasBlueprint) {
      progressiveReasons.push('Leverages domain interdependencies');
      progressiveConfidence += 0.2;
    }

    recommendations.push({
      method: 'progressive_journey',
      confidence: Math.min(progressiveConfidence, 1.0),
      reasoning: progressiveReasons.length > 0 ? progressiveReasons : ['Smart expansion based on domain connections'],
      estimatedTime: '8-12 minutes',
      bestForUser: progressiveConfidence > 0.8
    });

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  };

  const evaluateAssessmentQuality = (assessments: LifeWheelAssessment[]): AssessmentQualityScore => {
    if (assessments.length === 0) {
      return {
        overall: 0,
        completeness: 0,
        consistency: 0,
        personalAlignment: 0,
        insights: ['No assessments to evaluate']
      };
    }

    // Completeness Score (30% of overall)
    const expectedDomains = 7;
    const completeness = Math.min(assessments.length / expectedDomains, 1.0);

    // Consistency Score (30% of overall)
    const scores = assessments.map(a => a.current_score);
    const variance = calculateVariance(scores);
    const consistency = Math.max(0, 1 - (variance / 25)); // Normalize variance

    // Personal Alignment Score (40% of overall) 
    let personalAlignment = 0.6; // Base score
    
    if (blueprintData) {
      // Check alignment with personality traits
      const personalityTraits = extractPersonalityTraits();
      personalAlignment = calculatePersonalityAlignment(assessments, personalityTraits);
    }

    // Overall Score
    const overall = (completeness * 0.3) + (consistency * 0.3) + (personalAlignment * 0.4);

    // Generate insights
    const insights = generateQualityInsights(assessments, { completeness, consistency, personalAlignment });

    const qualityScore = {
      overall: Math.round(overall * 100) / 100,
      completeness: Math.round(completeness * 100) / 100,
      consistency: Math.round(consistency * 100) / 100,
      personalAlignment: Math.round(personalAlignment * 100) / 100,
      insights
    };

    setLastQualityScore(qualityScore);
    return qualityScore;
  };

  const generateContextualInsights = (assessments: LifeWheelAssessment[]): ContextualInsight[] => {
    const insights: ContextualInsight[] = [];

    if (assessments.length === 0) return insights;

    // Identify strengths (high current scores)
    const strengths = assessments
      .filter(a => a.current_score >= 8)
      .sort((a, b) => b.current_score - a.current_score);

    if (strengths.length > 0) {
      insights.push({
        type: 'strength',
        title: 'Your Life Strengths',
        description: `You're thriving in ${strengths.map(s => s.domain.replace('_', ' ')).join(', ')}. These are your foundation areas.`,
        domains: strengths.map(s => s.domain),
        confidence: 0.9
      });
    }

    // Identify biggest opportunities (high gaps with high importance)
    const opportunities = assessments
      .map(a => ({
        ...a,
        priorityScore: (a.desired_score - a.current_score) * a.importance_rating
      }))
      .filter(a => a.priorityScore > 15)
      .sort((a, b) => b.priorityScore - a.priorityScore);

    if (opportunities.length > 0) {
      insights.push({
        type: 'opportunity',
        title: 'High-Impact Growth Areas',
        description: `Focus on ${opportunities.slice(0, 2).map(o => o.domain.replace('_', ' ')).join(' and ')} for maximum impact.`,
        domains: opportunities.slice(0, 2).map(o => o.domain),
        confidence: 0.85
      });
    }

    // Pattern detection
    const lowScores = assessments.filter(a => a.current_score <= 4);
    if (lowScores.length > 2) {
      insights.push({
        type: 'pattern',
        title: 'Multiple Areas Need Attention',
        description: `Several life domains are below your satisfaction threshold. Consider a holistic approach.`,
        domains: lowScores.map(a => a.domain),
        confidence: 0.75
      });
    }

    // Recommendations based on blueprint
    if (blueprintData) {
      const personalityBasedInsights = generatePersonalityBasedInsights(assessments);
      insights.push(...personalityBasedInsights);
    }

    return insights;
  };

  const recordMethodExperience = (
    method: string, 
    satisfaction: number, 
    timeSpent: number,
    completed: boolean
  ) => {
    setUserPreferences(prev => ({
      ...prev,
      lastMethodUsed: method,
      methodSatisfaction: satisfaction,
      preferredMethod: satisfaction > 7 ? method : prev.preferredMethod
    }));
  };

  const getOptimalMethod = (): AssessmentMethodRecommendation => {
    const recommendations = generateMethodRecommendations();
    return recommendations[0]; // Return highest confidence recommendation
  };

  // Helper functions
  const calculateVariance = (numbers: number[]): number => {
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return squaredDiffs.reduce((sum, sq) => sum + sq, 0) / numbers.length;
  };

  const extractPersonalityTraits = (): string[] => {
    if (!blueprintData) return [];

    const traits: string[] = [];
    
    if (blueprintData.cognition_mbti?.type) {
      traits.push(blueprintData.cognition_mbti.type);
    }
    
    if (blueprintData.energy_strategy_human_design?.type) {
      traits.push(blueprintData.energy_strategy_human_design.type);
    }

    return traits;
  };

  const calculatePersonalityAlignment = (
    assessments: LifeWheelAssessment[], 
    traits: string[]
  ): number => {
    // Simplified alignment calculation
    // In reality, this would be more sophisticated based on personality research
    let alignment = 0.6; // Base alignment

    // Example: Introverts might prioritize personal_growth, extroverts relationships
    const introvertTypes = ['INTJ', 'INFJ', 'INTP', 'INFP', 'ISTJ', 'ISFJ', 'ISTP', 'ISFP'];
    const isIntrovert = traits.some(trait => introvertTypes.includes(trait));

    if (isIntrovert) {
      const personalGrowthScore = assessments.find(a => a.domain === 'personal_growth')?.importance_rating || 5;
      alignment += (personalGrowthScore / 10) * 0.2;
    }

    return Math.min(alignment, 1.0);
  };

  const generateQualityInsights = (
    assessments: LifeWheelAssessment[],
    scores: { completeness: number; consistency: number; personalAlignment: number }
  ): string[] => {
    const insights: string[] = [];

    if (scores.completeness < 0.8) {
      insights.push(`Consider assessing ${Math.ceil((1 - scores.completeness) * 7)} more life domains for a complete picture`);
    }

    if (scores.consistency < 0.6) {
      insights.push('Your scores show high variance - this might indicate a period of transition');
    }

    if (scores.personalAlignment > 0.8) {
      insights.push('Your assessment aligns well with your personality blueprint');
    }

    if (insights.length === 0) {
      insights.push('Solid assessment quality across all dimensions');
    }

    return insights;
  };

  const generatePersonalityBasedInsights = (assessments: LifeWheelAssessment[]): ContextualInsight[] => {
    const insights: ContextualInsight[] = [];
    
    // This would be expanded with real personality-based recommendations
    if (blueprintData?.cognition_mbti?.type?.startsWith('I')) {
      const personalGrowth = assessments.find(a => a.domain === 'personal_growth');
      if (personalGrowth && personalGrowth.current_score < 7) {
        insights.push({
          type: 'recommendation',
          title: 'Introvert Growth Opportunity',
          description: 'As an introvert, focusing on personal growth often yields high satisfaction returns.',
          domains: ['personal_growth'],
          confidence: 0.7
        });
      }
    }

    return insights;
  };

  // Initialize recommendations
  useEffect(() => {
    setMethodRecommendations(generateMethodRecommendations());
  }, [blueprintData, userPreferences]);

  return {
    methodRecommendations,
    evaluateAssessmentQuality,
    generateContextualInsights,
    recordMethodExperience,
    getOptimalMethod,
    lastQualityScore,
    userPreferences,
    setUserPreferences
  };
}