// Predictive Intelligence Engine - Phase 2: Real-Time Adaptive Intelligence
// SoulSync Engineering Protocol: Cross-module synthesis with personality weighting

import { enhancedMemoryIntelligence } from './enhanced-memory-intelligence';
import { behavioralPatternIntelligence } from './behavioral-pattern-intelligence';
import { unifiedBrainContext } from './unified-brain-context';
import { supabase } from '@/integrations/supabase/client';

export interface PredictiveInsight {
  id: string;
  type: 'predictive' | 'adaptive' | 'meta' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  text: string;
  confidence: number;
  personalityAlignment: number;
  synthesizedModules: string[];
  predictiveFactor: number; // How far in advance this predicts (0-1)
  adaptiveContext: {
    currentState: string;
    optimalTiming: Date;
    interventionStyle: string;
  };
  evidence: {
    memoryPatterns: string[];
    behavioralIndicators: string[];
    personalityFactors: string[];
  };
  recommendedActions: string[];
}

export interface UserState {
  cognitive: 'focused' | 'scattered' | 'creative' | 'analytical' | 'overwhelmed';
  emotional: 'stable' | 'elevated' | 'stressed' | 'excited' | 'contemplative';
  learning: 'receptive' | 'resistant' | 'exploring' | 'consolidating' | 'breakthrough';
  energy: 'high' | 'medium' | 'low' | 'recharging';
  confidence: number;
}

/**
 * Predictive Intelligence Engine - Phase 2 Implementation
 * Synthesizes all data sources for predictive, adaptive intelligence
 */
export class PredictiveIntelligenceEngine {
  
  /**
   * Generate predictive insights by synthesizing all available intelligence
   */
  async generatePredictiveInsights(userId: string): Promise<PredictiveInsight[]> {
    try {
      console.log('🔮 Generating predictive insights for user:', userId);
      
      // Load user blueprint for personality context
      const blueprint = await unifiedBrainContext.loadBlueprint(userId);
      if (!blueprint) {
        console.log('❌ No blueprint available for predictive analysis');
        return [];
      }

      // Gather intelligence from all sources in parallel
      const [
        memoryPatterns,
        behavioralPatterns,
        currentState,
        hacsIntelligence
      ] = await Promise.all([
        enhancedMemoryIntelligence.analyzeMemoryPatterns(userId),
        behavioralPatternIntelligence.analyzeBehavioralPatterns(userId),
        this.assessCurrentUserState(userId),
        this.getHACSIntelligence(userId)
      ]);

      console.log('📊 Intelligence data gathered:', {
        memoryPatterns: memoryPatterns.length,
        behavioralPatterns: behavioralPatterns.length,
        currentState,
        hacsLevel: hacsIntelligence?.intelligence_level || 0
      });

      const insights: PredictiveInsight[] = [];

      // Generate meta-insights from cross-module synthesis
      const metaInsights = await this.generateMetaInsights(
        memoryPatterns,
        behavioralPatterns,
        currentState,
        blueprint
      );
      insights.push(...metaInsights);

      // Generate predictive insights based on pattern projections
      const predictiveInsights = await this.generatePredictiveProjections(
        memoryPatterns,
        behavioralPatterns,
        currentState,
        blueprint
      );
      insights.push(...predictiveInsights);

      // Generate adaptive insights for real-time optimization
      const adaptiveInsights = await this.generateAdaptiveInsights(
        currentState,
        blueprint,
        hacsIntelligence
      );
      insights.push(...adaptiveInsights);

      // Check for emergency interventions
      const emergencyInsights = await this.checkEmergencyInterventions(
        currentState,
        behavioralPatterns,
        blueprint
      );
      insights.push(...emergencyInsights);

      // Sort by priority and confidence
      insights.sort((a, b) => {
        const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
        const aScore = priorityWeight[a.priority] * a.confidence * a.personalityAlignment;
        const bScore = priorityWeight[b.priority] * b.confidence * b.personalityAlignment;
        return bScore - aScore;
      });

      console.log('✅ Predictive insights generated:', insights.length);
      return insights.slice(0, 5); // Return top 5 insights

    } catch (error) {
      console.error('❌ Predictive insight generation error:', error);
      return [];
    }
  }

  /**
   * Assess current user state across multiple dimensions
   */
  async assessCurrentUserState(userId: string): Promise<UserState> {
    try {
      // Get recent activity and intelligence data
      const [recentActivity, intelligence, recentMoods] = await Promise.all([
        this.getRecentActivity(userId),
        this.getHACSIntelligence(userId),
        this.getRecentMoods(userId)
      ]);

      // Assess cognitive state
      const cognitive = this.assessCognitiveState(recentActivity, intelligence);
      
      // Assess emotional state
      const emotional = this.assessEmotionalState(recentMoods, recentActivity);
      
      // Assess learning state
      const learning = this.assessLearningState(intelligence, recentActivity);
      
      // Assess energy state
      const energy = this.assessEnergyState(recentActivity, recentMoods);
      
      // Calculate overall confidence in assessment
      const confidence = this.calculateStateAssessmentConfidence(
        recentActivity?.length || 0,
        recentMoods?.length || 0,
        intelligence?.interaction_count || 0
      );

      return { cognitive, emotional, learning, energy, confidence };

    } catch (error) {
      console.error('❌ User state assessment error:', error);
      return {
        cognitive: 'scattered',
        emotional: 'stable',
        learning: 'receptive',
        energy: 'medium',
        confidence: 0.1
      };
    }
  }

  /**
   * Generate meta-insights from cross-module data synthesis
   */
  private async generateMetaInsights(
    memoryPatterns: any[],
    behavioralPatterns: any[],
    currentState: UserState,
    blueprint: any
  ): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = [];

    // Memory-Behavior Cross-Analysis
    if (memoryPatterns.length > 0 && behavioralPatterns.length > 0) {
      const memoryBehaviorInsight = this.synthesizeMemoryBehaviorPatterns(
        memoryPatterns,
        behavioralPatterns,
        blueprint
      );
      if (memoryBehaviorInsight) insights.push(memoryBehaviorInsight);
    }

    // State-Pattern Alignment Analysis
    const stateAlignmentInsight = this.analyzeStatePatternAlignment(
      currentState,
      behavioralPatterns,
      blueprint
    );
    if (stateAlignmentInsight) insights.push(stateAlignmentInsight);

    // Learning Trajectory Synthesis
    const learningTrajectoryInsight = this.synthesizeLearningTrajectory(
      memoryPatterns,
      behavioralPatterns,
      currentState,
      blueprint
    );
    if (learningTrajectoryInsight) insights.push(learningTrajectoryInsight);

    return insights;
  }

  /**
   * Generate predictive projections based on pattern analysis
   */
  private async generatePredictiveProjections(
    memoryPatterns: any[],
    behavioralPatterns: any[],
    currentState: UserState,
    blueprint: any
  ): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = [];

    // Predict learning opportunities
    const learningPrediction = this.predictLearningOpportunities(
      memoryPatterns,
      behavioralPatterns,
      blueprint
    );
    if (learningPrediction) insights.push(learningPrediction);

    // Predict productivity windows
    const productivityPrediction = this.predictProductivityWindows(
      behavioralPatterns,
      currentState,
      blueprint
    );
    if (productivityPrediction) insights.push(productivityPrediction);

    // Predict emotional support needs
    const emotionalPrediction = this.predictEmotionalSupportNeeds(
      behavioralPatterns,
      currentState,
      blueprint
    );
    if (emotionalPrediction) insights.push(emotionalPrediction);

    return insights;
  }

  /**
   * Generate adaptive insights for real-time optimization
   */
  private async generateAdaptiveInsights(
    currentState: UserState,
    blueprint: any,
    hacsIntelligence: any
  ): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = [];

    // Adaptive conversation style
    const conversationAdaptation = this.generateConversationAdaptation(
      currentState,
      blueprint
    );
    if (conversationAdaptation) insights.push(conversationAdaptation);

    // Adaptive learning difficulty
    const learningAdaptation = this.generateLearningAdaptation(
      currentState,
      hacsIntelligence,
      blueprint
    );
    if (learningAdaptation) insights.push(learningAdaptation);

    // Adaptive timing optimization
    const timingAdaptation = this.generateTimingAdaptation(
      currentState,
      blueprint
    );
    if (timingAdaptation) insights.push(timingAdaptation);

    return insights;
  }

  /**
   * Check for emergency interventions needed
   */
  private async checkEmergencyInterventions(
    currentState: UserState,
    behavioralPatterns: any[],
    blueprint: any
  ): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = [];

    // Check for cognitive overload
    if (currentState.cognitive === 'overwhelmed' && currentState.confidence > 0.7) {
      insights.push(this.createEmergencyInsight(
        'cognitive_overload',
        'Cognitive overload detected - immediate intervention recommended',
        currentState,
        blueprint
      ));
    }

    // Check for learning plateau
    const learningPattern = behavioralPatterns.find(p => p.patternType === 'learning');
    if (learningPattern?.trend === 'decreasing' && learningPattern.strength < 0.3) {
      insights.push(this.createEmergencyInsight(
        'learning_plateau',
        'Learning plateau detected - strategy adjustment needed',
        currentState,
        blueprint
      ));
    }

    // Check for emotional distress pattern
    if (currentState.emotional === 'stressed' && currentState.energy === 'low') {
      insights.push(this.createEmergencyInsight(
        'emotional_support',
        'Emotional support intervention recommended',
        currentState,
        blueprint
      ));
    }

    return insights;
  }

  // PRIVATE SYNTHESIS METHODS

  private synthesizeMemoryBehaviorPatterns(
    memoryPatterns: any[],
    behavioralPatterns: any[],
    blueprint: any
  ): PredictiveInsight | null {
    const topMemoryTheme = memoryPatterns[0]?.theme;
    const learningPattern = behavioralPatterns.find(p => p.patternType === 'learning');
    
    if (!topMemoryTheme || !learningPattern) return null;

    const confidence = Math.min(0.9, 
      (memoryPatterns[0].contextualRelevance + learningPattern.confidence) / 2
    );

    return {
      id: `meta_memory_behavior_${Date.now()}`,
      type: 'meta',
      priority: confidence > 0.7 ? 'high' : 'medium',
      text: this.createMemoryBehaviorInsightText(topMemoryTheme, learningPattern, blueprint),
      confidence,
      personalityAlignment: this.calculatePersonalityAlignment(blueprint, 'learning'),
      synthesizedModules: ['TMG', 'PIE', 'ACS'],
      predictiveFactor: 0.6,
      adaptiveContext: {
        currentState: 'learning',
        optimalTiming: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        interventionStyle: 'exploratory'
      },
      evidence: {
        memoryPatterns: [topMemoryTheme],
        behavioralIndicators: [`Learning trend: ${learningPattern.trend}`],
        personalityFactors: [blueprint.personality?.traits?.cognitiveStyle || 'balanced']
      },
      recommendedActions: [
        `Explore deeper connections in ${topMemoryTheme}`,
        'Build on current learning momentum'
      ]
    };
  }

  private predictLearningOpportunities(
    memoryPatterns: any[],
    behavioralPatterns: any[],
    blueprint: any
  ): PredictiveInsight | null {
    const knowledgeGaps = memoryPatterns.flatMap(p => p.knowledgeGaps);
    const learningPattern = behavioralPatterns.find(p => p.patternType === 'learning');
    
    if (knowledgeGaps.length === 0 || !learningPattern) return null;

    const nextOptimalTime = new Date();
    nextOptimalTime.setHours(nextOptimalTime.getHours() + 4); // 4 hours ahead

    return {
      id: `predictive_learning_${Date.now()}`,
      type: 'predictive',
      priority: 'medium',
      text: `Learning opportunity predicted: ${knowledgeGaps[0]} will become relevant in your upcoming activities`,
      confidence: Math.min(0.85, learningPattern.confidence * 0.9),
      personalityAlignment: this.calculatePersonalityAlignment(blueprint, 'learning'),
      synthesizedModules: ['PIE', 'TMG', 'ACS'],
      predictiveFactor: 0.8,
      adaptiveContext: {
        currentState: 'learning',
        optimalTiming: nextOptimalTime,
        interventionStyle: this.getOptimalInterventionStyle(blueprint)
      },
      evidence: {
        memoryPatterns: [knowledgeGaps[0]],
        behavioralIndicators: [`Learning pattern strength: ${learningPattern.strength}`],
        personalityFactors: [blueprint.personality?.traits?.cognitiveStyle || 'balanced']
      },
      recommendedActions: [
        `Prepare learning materials for ${knowledgeGaps[0]}`,
        'Schedule focused learning session'
      ]
    };
  }

  private generateConversationAdaptation(
    currentState: UserState,
    blueprint: any
  ): PredictiveInsight | null {
    const adaptedStyle = this.calculateAdaptedConversationStyle(currentState, blueprint);
    
    return {
      id: `adaptive_conversation_${Date.now()}`,
      type: 'adaptive',
      priority: 'medium',
      text: `Conversation style adapting to your current ${currentState.cognitive} cognitive state`,
      confidence: currentState.confidence,
      personalityAlignment: this.calculatePersonalityAlignment(blueprint, 'communication'),
      synthesizedModules: ['ACS', 'DPEM', 'CPSR'],
      predictiveFactor: 0.3, // Real-time adaptation
      adaptiveContext: {
        currentState: currentState.cognitive,
        optimalTiming: new Date(), // Immediate
        interventionStyle: adaptedStyle
      },
      evidence: {
        memoryPatterns: [],
        behavioralIndicators: [`Cognitive state: ${currentState.cognitive}`],
        personalityFactors: [blueprint.personality?.traits?.communicationStyle || 'adaptive']
      },
      recommendedActions: [
        `Adjust conversation complexity for ${currentState.cognitive} state`,
        'Use appropriate interaction patterns'
      ]
    };
  }

  // UTILITY METHODS

  private async getRecentActivity(userId: string): Promise<any[]> {
    const { data } = await supabase
      .from('dream_activity_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .order('created_at', { ascending: false })
      .limit(20);
    
    return data || [];
  }

  private async getHACSIntelligence(userId: string): Promise<any> {
    const { data } = await supabase
      .from('hacs_intelligence')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    return data;
  }

  private async getRecentMoods(userId: string): Promise<any[]> {
      const { data } = await supabase
        .from('dream_activity_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
        .order('created_at', { ascending: false })
        .limit(10);
    
    return data || [];
  }

  private assessCognitiveState(recentActivity: any[], intelligence: any): UserState['cognitive'] {
    if (!recentActivity || recentActivity.length === 0) return 'scattered';
    
    const activityTypes = recentActivity.map(a => a.activity_type);
    const uniqueTypes = new Set(activityTypes);
    
    // High activity diversity suggests scattered focus
    if (uniqueTypes.size > recentActivity.length * 0.7) return 'scattered';
    
    // Intelligence level influences cognitive assessment
    const intelligenceLevel = intelligence?.intelligence_level || 0;
    if (intelligenceLevel > 75) return 'analytical';
    if (intelligenceLevel > 50) return 'focused';
    
    return 'creative';
  }

  private assessEmotionalState(recentMoods: any[], recentActivity: any[]): UserState['emotional'] {
    if (!recentMoods || recentMoods.length === 0) return 'stable';
    
    const avgMood = recentMoods.reduce((sum, m) => sum + (m.mood_value || 5), 0) / recentMoods.length;
    
    if (avgMood > 7) return 'elevated';
    if (avgMood > 6) return 'stable';
    if (avgMood > 4) return 'contemplative';
    if (avgMood > 3) return 'stressed';
    
    return 'stable';
  }

  private assessLearningState(intelligence: any, recentActivity: any[]): UserState['learning'] {
    if (!intelligence) return 'receptive';
    
    const level = intelligence.intelligence_level || 0;
    const interactions = intelligence.interaction_count || 0;
    
    if (level > 90) return 'breakthrough';
    if (level > 70) return 'consolidating';
    if (interactions > 20) return 'exploring';
    
    return 'receptive';
  }

  private assessEnergyState(recentActivity: any[], recentMoods: any[]): UserState['energy'] {
    const activityCount = recentActivity?.length || 0;
    const avgMood = recentMoods?.length > 0 
      ? recentMoods.reduce((sum, m) => sum + (m.mood_value || 5), 0) / recentMoods.length 
      : 5;
    
    if (activityCount > 15 && avgMood > 6) return 'high';
    if (activityCount > 8 && avgMood > 5) return 'medium';
    if (activityCount < 3 || avgMood < 4) return 'low';
    
    return 'medium';
  }

  private calculateStateAssessmentConfidence(
    activityCount: number,
    moodCount: number,
    intelligenceInteractions: number
  ): number {
    const dataQuality = Math.min(1, 
      (activityCount / 10 + moodCount / 5 + intelligenceInteractions / 20) / 3
    );
    
    return Math.max(0.1, Math.min(0.95, dataQuality));
  }

  private calculatePersonalityAlignment(blueprint: any, context: string): number {
    // Simplified personality alignment calculation
    const traits = blueprint.personality?.traits || {};
    let alignment = 0.5;
    
    if (context === 'learning' && traits.cognitiveStyle?.includes('abstract')) {
      alignment += 0.2;
    }
    
    if (context === 'communication' && traits.communicationStyle?.includes('direct')) {
      alignment += 0.15;
    }
    
    return Math.min(1.0, Math.max(0.0, alignment));
  }

  private getOptimalInterventionStyle(blueprint: any): string {
    const communicationStyle = blueprint.personality?.traits?.communicationStyle || '';
    
    if (communicationStyle.includes('mystical')) return 'mystical';
    if (communicationStyle.includes('direct')) return 'direct';
    if (communicationStyle.includes('exploratory')) return 'exploratory';
    
    return 'adaptive';
  }

  private calculateAdaptedConversationStyle(currentState: UserState, blueprint: any): string {
    const baseStyle = blueprint.personality?.traits?.communicationStyle || 'adaptive';
    
    // Adapt based on current cognitive state
    if (currentState.cognitive === 'overwhelmed') return 'gentle';
    if (currentState.cognitive === 'analytical') return 'detailed';
    if (currentState.cognitive === 'creative') return 'exploratory';
    
    return baseStyle;
  }

  private createMemoryBehaviorInsightText(
    memoryTheme: string,
    learningPattern: any,
    blueprint: any
  ): string {
    const name = blueprint.user?.name || 'friend';
    const communicationStyle = blueprint.personality?.traits?.communicationStyle || '';
    
    if (communicationStyle.includes('mystical')) {
      return `The cosmic threads reveal a powerful convergence, ${name}. Your memory constellation around "${memoryTheme}" aligns with your ${learningPattern.trend} learning energies, creating potential for deep wisdom synthesis.`;
    } else {
      return `Your memory patterns around "${memoryTheme}" strongly correlate with your ${learningPattern.trend} learning trend, suggesting optimal conditions for knowledge integration and growth.`;
    }
  }

  private createEmergencyInsight(
    type: string,
    message: string,
    currentState: UserState,
    blueprint: any
  ): PredictiveInsight {
    return {
      id: `emergency_${type}_${Date.now()}`,
      type: 'emergency',
      priority: 'critical',
      text: message,
      confidence: currentState.confidence,
      personalityAlignment: this.calculatePersonalityAlignment(blueprint, 'support'),
      synthesizedModules: ['CNR', 'DPEM', 'HFME'],
      predictiveFactor: 0.1, // Immediate intervention
      adaptiveContext: {
        currentState: 'emergency',
        optimalTiming: new Date(), // Immediate
        interventionStyle: 'supportive'
      },
      evidence: {
        memoryPatterns: [],
        behavioralIndicators: [`Current state: ${JSON.stringify(currentState)}`],
        personalityFactors: [blueprint.personality?.traits?.communicationStyle || 'supportive']
      },
      recommendedActions: [
        'Immediate intervention recommended',
        'Adjust system parameters for optimal support'
      ]
    };
  }

  // Additional helper methods for other insight types would follow similar patterns...
  private analyzeStatePatternAlignment(currentState: UserState, behavioralPatterns: any[], blueprint: any): PredictiveInsight | null {
    // Implementation for state-pattern alignment analysis
    return null; // Placeholder
  }

  private synthesizeLearningTrajectory(memoryPatterns: any[], behavioralPatterns: any[], currentState: UserState, blueprint: any): PredictiveInsight | null {
    // Implementation for learning trajectory synthesis
    return null; // Placeholder
  }

  private predictProductivityWindows(behavioralPatterns: any[], currentState: UserState, blueprint: any): PredictiveInsight | null {
    // Implementation for productivity window prediction
    return null; // Placeholder
  }

  private predictEmotionalSupportNeeds(behavioralPatterns: any[], currentState: UserState, blueprint: any): PredictiveInsight | null {
    // Implementation for emotional support prediction
    return null; // Placeholder
  }

  private generateLearningAdaptation(currentState: UserState, hacsIntelligence: any, blueprint: any): PredictiveInsight | null {
    // Implementation for learning adaptation
    return null; // Placeholder
  }

  private generateTimingAdaptation(currentState: UserState, blueprint: any): PredictiveInsight | null {
    // Implementation for timing adaptation
    return null; // Placeholder
  }
}

export const predictiveIntelligenceEngine = new PredictiveIntelligenceEngine();