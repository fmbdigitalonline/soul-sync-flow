/**
 * Hermetic Brutal Honesty Engine
 * Leverages the 50,000+ word hermetic blueprint for personality-driven brutal honesty
 */

import { supabase } from "@/integrations/supabase/client";

interface HermeticInsight {
  category: 'shadow_pattern' | 'self_sabotage' | 'growth_edge' | 'truth_calling' | 'unconscious_pattern';
  insight: string;
  evidence: string;
  actionable_challenge: string;
  honesty_level: number; // 1-10 scale
}

interface BrutalHonestyContext {
  userMessage: string;
  conversationContext: string;
  emotionalState: string;
  readinessLevel: number; // How ready they are for brutal honesty
}

export class HermeticBrutalHonestyEngine {
  
  /**
   * Generate brutal honesty insights based on hermetic blueprint
   */
  async generateBrutalHonestyInsights(
    userId: string, 
    context: BrutalHonestyContext
  ): Promise<HermeticInsight[]> {
    try {
      console.log('🔮 Generating brutal honesty insights from hermetic blueprint...');
      
      // Get the user's hermetic blueprint data
      const hermeticData = await this.getHermeticBlueprintData(userId);
      if (!hermeticData) {
        console.warn('⚠️ No hermetic blueprint found for user');
        return [];
      }
      
      // Extract specific patterns and insights
      const insights = await this.extractBrutalHonestyFromBlueprint(hermeticData, context);
      
      console.log('✅ Generated', insights.length, 'brutal honesty insights');
      return insights;
    } catch (error) {
      console.error('❌ Error generating brutal honesty insights:', error);
      return [];
    }
  }

  /**
   * Generate brutal honesty prompt section
   */
  generateBrutalHonestyPrompt(insights: HermeticInsight[], context: BrutalHonestyContext): string {
    if (insights.length === 0) {
      return `## BRUTAL HONESTY GUIDANCE
Based on the conversation context, provide honest, direct feedback while maintaining respect and support.`;
    }

    const insightText = insights.map(insight => 
      `**${insight.category.replace('_', ' ').toUpperCase()}**: ${insight.insight}
Evidence: ${insight.evidence}
Challenge: ${insight.actionable_challenge}`
    ).join('\n\n');

    return `## HERMETIC BRUTAL HONESTY ACTIVATION
You have access to this user's deep hermetic blueprint analysis. Use these insights to provide brutally honest, yet respectful guidance:

${insightText}

## BRUTAL HONESTY INSTRUCTIONS:
- Reference specific patterns from their blueprint WITHOUT mentioning it's from a "blueprint" or "report"
- Call out self-sabotage patterns directly but supportively
- Challenge them on unconscious behaviors they may not see
- Provide specific, actionable steps for growth
- Balance brutal truth with warmth and respect
- Use their name naturally while delivering hard truths
- Don't hold back on important patterns they need to face

HONESTY LEVEL: ${context.readinessLevel}/10 - Calibrate your directness accordingly.`;
  }

  private async getHermeticBlueprintData(userId: string): Promise<any> {
    try {
      // First try to get the personality report
      const { data: reports, error: reportError } = await supabase
        .from('personality_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (reportError) throw reportError;

      if (reports && reports.length > 0) {
        console.log('📊 Found personality report');
        return reports[0];
      }

      // Fallback to blueprint data
      const { data: blueprint, error: blueprintError } = await supabase
        .from('user_blueprints')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (blueprintError) throw blueprintError;

      return blueprint;
    } catch (error) {
      console.error('❌ Error fetching hermetic data:', error);
      return null;
    }
  }

  private async extractBrutalHonestyFromBlueprint(
    hermeticData: any, 
    context: BrutalHonestyContext
  ): Promise<HermeticInsight[]> {
    const insights: HermeticInsight[] = [];

    // Extract from shadow work section
    if (hermeticData.shadow_work_integration) {
      const shadowInsights = this.extractShadowPatterns(hermeticData.shadow_work_integration, context);
      insights.push(...shadowInsights);
    }

    // Extract from hermetic fractal analysis
    if (hermeticData.hermetic_fractal_analysis) {
      const fractalInsights = this.extractFractalPatterns(hermeticData.hermetic_fractal_analysis, context);
      insights.push(...fractalInsights);
    }

    // Extract from transformation phases
    if (hermeticData.transformation_phases) {
      const transformationInsights = this.extractTransformationPatterns(hermeticData.transformation_phases, context);
      insights.push(...transformationInsights);
    }

    // Extract from polarity integration
    if (hermeticData.polarity_integration) {
      const polarityInsights = this.extractPolarityPatterns(hermeticData.polarity_integration, context);
      insights.push(...polarityInsights);
    }

    return insights.slice(0, 3); // Top 3 most relevant insights
  }

  private extractShadowPatterns(shadowData: any, context: BrutalHonestyContext): HermeticInsight[] {
    const insights: HermeticInsight[] = [];

    if (typeof shadowData === 'string') {
      // Extract self-sabotage patterns
      const sabotagePatterns = this.extractPatternsByKeywords(
        shadowData, 
        ['self-sabotage', 'sabotaging', 'undermining', 'blocking', 'avoiding'],
        'self_sabotage'
      );
      insights.push(...sabotagePatterns);

      // Extract unconscious patterns
      const unconsciousPatterns = this.extractPatternsByKeywords(
        shadowData,
        ['unconscious', 'unaware', 'blind spot', 'hidden', 'beneath the surface'],
        'unconscious_pattern'
      );
      insights.push(...unconsciousPatterns);
    }

    return insights;
  }

  private extractFractalPatterns(fractalData: any, context: BrutalHonestyContext): HermeticInsight[] {
    const insights: HermeticInsight[] = [];

    if (typeof fractalData === 'string') {
      // Extract growth edge patterns
      const growthPatterns = this.extractPatternsByKeywords(
        fractalData,
        ['growth edge', 'needs to', 'must learn', 'challenge', 'development'],
        'growth_edge'
      );
      insights.push(...growthPatterns);
    }

    return insights;
  }

  private extractTransformationPatterns(transformationData: any, context: BrutalHonestyContext): HermeticInsight[] {
    const insights: HermeticInsight[] = [];

    if (typeof transformationData === 'string') {
      // Extract truth calling patterns
      const truthPatterns = this.extractPatternsByKeywords(
        transformationData,
        ['truth', 'authentic', 'genuine', 'real self', 'calling'],
        'truth_calling'
      );
      insights.push(...truthPatterns);
    }

    return insights;
  }

  private extractPolarityPatterns(polarityData: any, context: BrutalHonestyContext): HermeticInsight[] {
    const insights: HermeticInsight[] = [];

    if (typeof polarityData === 'string') {
      // Extract shadow patterns from polarity work
      const polarityPatterns = this.extractPatternsByKeywords(
        polarityData,
        ['shadow', 'rejected', 'denied', 'suppressed', 'integrate'],
        'shadow_pattern'
      );
      insights.push(...polarityPatterns);
    }

    return insights;
  }

  private extractPatternsByKeywords(
    text: string, 
    keywords: string[], 
    category: HermeticInsight['category']
  ): HermeticInsight[] {
    const insights: HermeticInsight[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);

    sentences.forEach(sentence => {
      if (keywords.some(keyword => sentence.toLowerCase().includes(keyword.toLowerCase()))) {
        const insight = this.createInsightFromSentence(sentence.trim(), category);
        if (insight) {
          insights.push(insight);
        }
      }
    });

    return insights.slice(0, 2); // Limit per category
  }

  private createInsightFromSentence(sentence: string, category: HermeticInsight['category']): HermeticInsight | null {
    if (sentence.length < 30) return null;

    // Generate actionable challenge based on category
    let actionableChallenge = '';
    
    switch (category) {
      case 'self_sabotage':
        actionableChallenge = 'Notice this pattern in the next 48 hours and interrupt it once. What would courage look like instead?';
        break;
      case 'unconscious_pattern':
        actionableChallenge = 'Set a daily check-in: Ask yourself "Am I doing this pattern right now?" three times today.';
        break;
      case 'growth_edge':
        actionableChallenge = 'Take one small action outside your comfort zone in this area within the next week.';
        break;
      case 'truth_calling':
        actionableChallenge = 'Identify one way you\'re not being authentic and make one honest choice about it today.';
        break;
      case 'shadow_pattern':
        actionableChallenge = 'Notice when this shadow pattern emerges and breathe into it instead of fighting it.';
        break;
    }

    return {
      category,
      insight: sentence,
      evidence: 'Pattern identified in comprehensive hermetic analysis',
      actionable_challenge: actionableChallenge,
      honesty_level: this.calculateHonestyLevel(sentence)
    };
  }

  private calculateHonestyLevel(sentence: string): number {
    // Calculate honesty level based on directness of language
    const directWords = ['must', 'need to', 'stop', 'avoiding', 'denying', 'blocking'];
    const directCount = directWords.filter(word => 
      sentence.toLowerCase().includes(word)
    ).length;

    return Math.min(5 + directCount * 2, 10); // Scale 5-10
  }

  /**
   * Assess user's readiness for brutal honesty based on context
   */
  assessReadinessLevel(context: BrutalHonestyContext): number {
    let readiness = 5; // base level

    // Check for explicit requests for honesty
    if (context.userMessage.toLowerCase().includes('brutal') || 
        context.userMessage.toLowerCase().includes('honest')) {
      readiness += 4;
    }

    // Check for frustration or seeking change
    if (context.userMessage.toLowerCase().includes('stuck') ||
        context.userMessage.toLowerCase().includes('frustrated') ||
        context.userMessage.toLowerCase().includes('change')) {
      readiness += 2;
    }

    // Check emotional state
    if (context.emotionalState === 'seeking_support' || 
        context.emotionalState === 'vulnerable') {
      readiness -= 2; // Lower honesty when vulnerable
    }

    return Math.max(3, Math.min(readiness, 10)); // Scale 3-10
  }
}

export const hermeticBrutalHonestyEngine = new HermeticBrutalHonestyEngine();