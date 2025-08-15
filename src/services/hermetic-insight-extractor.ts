// Hermetic Insight Extractor Service
// Extracts insights from completed 50,000+ word Hermetic reports
// SoulSync Protocol: Use real data, no simulation, preserve existing functionality

import { supabase } from '@/integrations/supabase/client';
import { HACSInsight } from '@/hooks/use-hacs-insights';
import { translateAnalyticsToOracle, PersonalityContext } from '@/utils/oracle-insight-translator';

export interface HermeticReportData {
  id: string;
  user_id: string;
  report_content: {
    structured_intelligence?: any;
    seven_laws?: any;
    gate_analyses?: any;
    shadow_work?: any;
    integration_practices?: any;
    personality_summary?: any;
  };
  generated_at: string;
}

export class HermeticInsightExtractor {
  
  /**
   * Main function to generate insights from hermetic report
   * Prioritizes hermetic insights over analytics insights
   */
  async generateHermeticReportInsights(userId: string): Promise<HACSInsight[]> {
    console.log('🔮 Extracting insights from hermetic report for user:', userId);
    
    try {
      // Get the latest hermetic report
      const { data: reports, error } = await supabase
        .from('personality_reports')
        .select('*')
        .eq('user_id', userId)
        .order('generated_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('🚨 Error fetching hermetic report:', error);
        return [];
      }

      if (!reports || reports.length === 0) {
        console.log('📄 No hermetic report found for user');
        return [];
      }

      const report = reports[0] as HermeticReportData;
      console.log('📖 Found hermetic report:', {
        reportId: report.id,
        hasStructuredIntelligence: !!report.report_content?.structured_intelligence,
        hasSevenLaws: !!report.report_content?.seven_laws,
        hasGateAnalyses: !!report.report_content?.gate_analyses,
        hasShadowWork: !!report.report_content?.shadow_work
      });

      const insights: HACSInsight[] = [];

      // Extract insights from different sections
      insights.push(...await this.extractFromStructuredIntelligence(report));
      insights.push(...await this.extractFromSevenLaws(report));
      insights.push(...await this.extractFromGateAnalyses(report));
      insights.push(...await this.extractFromShadowWork(report));
      insights.push(...await this.extractFromIntegrationPractices(report));

      // Apply oracle translation for personality-aware delivery
      const personalityCtx = await this.getPersonalityContext(userId);
      const translatedInsights = insights.map(insight => 
        translateAnalyticsToOracle(insight, personalityCtx)
      );

      console.log('✨ Generated hermetic insights:', {
        total: translatedInsights.length,
        types: translatedInsights.map(i => i.type)
      });

      return translatedInsights;
    } catch (error) {
      console.error('🚨 Error generating hermetic insights:', error);
      return [];
    }
  }

  /**
   * Extract positive growth insights from structured intelligence
   */
  private async extractFromStructuredIntelligence(report: HermeticReportData): Promise<HACSInsight[]> {
    const insights: HACSInsight[] = [];
    const structuredIntel = report.report_content?.structured_intelligence;
    
    if (!structuredIntel) return insights;

    console.log('🧠 Extracting from structured intelligence...');

    // Extract identity constructs insights
    if (structuredIntel.identity_constructs) {
      const identityInsight: HACSInsight = {
        id: `hermetic_identity_${Date.now()}`,
        text: `Your core identity is anchored in ${structuredIntel.identity_constructs.core_identity_markers?.[0] || 'self-discovery'}. This foundation shapes how you navigate the world with authenticity.`,
        module: 'Hermetic Intelligence',
        type: 'growth',
        confidence: 0.95,
        evidence: structuredIntel.identity_constructs.core_identity_markers || [],
        timestamp: new Date(),
        acknowledged: false,
        priority: 'high'
      };
      insights.push(identityInsight);
    }

    // Extract behavioral triggers insights
    if (structuredIntel.behavioral_triggers) {
      const triggerInsight: HACSInsight = {
        id: `hermetic_triggers_${Date.now()}`,
        text: `You respond most powerfully to ${structuredIntel.behavioral_triggers.positive_triggers?.[0] || 'meaningful challenges'}. Understanding this pattern gives you conscious control over your responses.`,
        module: 'Hermetic Intelligence',
        type: 'behavioral',
        confidence: 0.9,
        evidence: structuredIntel.behavioral_triggers.positive_triggers || [],
        timestamp: new Date(),
        acknowledged: false,
        priority: 'medium'
      };
      insights.push(triggerInsight);
    }

    return insights;
  }

  /**
   * Extract insights from Seven Laws analysis
   */
  private async extractFromSevenLaws(report: HermeticReportData): Promise<HACSInsight[]> {
    const insights: HACSInsight[] = [];
    const sevenLaws = report.report_content?.seven_laws;
    
    if (!sevenLaws) return insights;

    console.log('⚖️ Extracting from Seven Laws...');

    // Extract from different laws
    Object.entries(sevenLaws).forEach(([lawName, lawData]: [string, any]) => {
      if (lawData && typeof lawData === 'object') {
        const insight: HACSInsight = {
          id: `hermetic_law_${lawName}_${Date.now()}`,
          text: `The Law of ${lawName.replace('_', ' ')} reveals: ${lawData.summary || lawData.description || 'a deeper pattern in your life'}. This cosmic principle is actively shaping your journey.`,
          module: 'Seven Laws',
          type: 'growth',
          confidence: 0.85,
          evidence: [lawData.summary || lawData.description || `Law of ${lawName}`],
          timestamp: new Date(),
          acknowledged: false,
          priority: 'medium'
        };
        insights.push(insight);
      }
    });

    return insights.slice(0, 2); // Limit to 2 most relevant laws
  }

  /**
   * Extract insights from gate analyses (Human Design gates)
   */
  private async extractFromGateAnalyses(report: HermeticReportData): Promise<HACSInsight[]> {
    const insights: HACSInsight[] = [];
    const gateAnalyses = report.report_content?.gate_analyses;
    
    if (!gateAnalyses) return insights;

    console.log('🚪 Extracting from gate analyses...');

    // Extract from conscious gates (most accessible energies)
    if (gateAnalyses.conscious_gates) {
      Object.entries(gateAnalyses.conscious_gates).slice(0, 2).forEach(([gateName, gateData]: [string, any]) => {
        if (gateData && typeof gateData === 'object') {
          const insight: HACSInsight = {
            id: `hermetic_gate_${gateName}_${Date.now()}`,
            text: `Gate ${gateName} in your conscious design brings ${gateData.gift || gateData.theme || 'a unique gift'}. This energy is readily available to you and others can sense it clearly.`,
            module: 'Gate Analysis',
            type: 'growth',
            confidence: 0.9,
            evidence: [gateData.gift || gateData.theme || `Gate ${gateName} energy`],
            timestamp: new Date(),
            acknowledged: false,
            priority: 'high'
          };
          insights.push(insight);
        }
      });
    }

    return insights;
  }

  /**
   * Extract loving shadow work insights
   */
  private async extractFromShadowWork(report: HermeticReportData): Promise<HACSInsight[]> {
    const insights: HACSInsight[] = [];
    const shadowWork = report.report_content?.shadow_work;
    
    if (!shadowWork) return insights;

    console.log('🌑 Extracting shadow work insights...');

    // Extract shadow patterns with loving, supportive language
    if (shadowWork.shadow_patterns) {
      Object.entries(shadowWork.shadow_patterns).slice(0, 1).forEach(([patternName, patternData]: [string, any]) => {
        if (patternData && typeof patternData === 'object') {
          const insight: HACSInsight = {
            id: `hermetic_shadow_${patternName}_${Date.now()}`,
            text: `Your soul is ready to transform the pattern of ${patternData.description || patternName}. This isn't a flaw—it's an invitation to reclaim a lost part of your power with compassion.`,
            module: 'Shadow Integration',
            type: 'growth',
            confidence: 0.8,
            evidence: [patternData.description || patternName, 'Shadow integration opportunity'],
            timestamp: new Date(),
            acknowledged: false,
            priority: 'medium'
          };
          insights.push(insight);
        }
      });
    }

    // Extract integration opportunities
    if (shadowWork.integration_opportunities) {
      shadowWork.integration_opportunities.slice(0, 1).forEach((opportunity: any, index: number) => {
        const insight: HACSInsight = {
          id: `hermetic_integration_${index}_${Date.now()}`,
          text: `Your next growth edge: ${opportunity.description || opportunity}. Approach this with the gentleness you'd show a dear friend learning something new.`,
          module: 'Shadow Integration',
          type: 'growth',
          confidence: 0.85,
          evidence: [opportunity.description || opportunity],
          timestamp: new Date(),
          acknowledged: false,
          priority: 'medium'
        };
        insights.push(insight);
      });
    }

    return insights;
  }

  /**
   * Extract actionable insights from integration practices
   */
  private async extractFromIntegrationPractices(report: HermeticReportData): Promise<HACSInsight[]> {
    const insights: HACSInsight[] = [];
    const practices = report.report_content?.integration_practices;
    
    if (!practices) return insights;

    console.log('🔄 Extracting integration practices...');

    // Extract daily practices
    if (practices.daily_practices) {
      practices.daily_practices.slice(0, 1).forEach((practice: any, index: number) => {
        const insight: HACSInsight = {
          id: `hermetic_practice_${index}_${Date.now()}`,
          text: `Your soul is calling for this practice: ${practice.description || practice}. Even 5 minutes daily can create profound shifts in your consciousness.`,
          module: 'Integration Practice',
          type: 'productivity',
          confidence: 0.9,
          evidence: [practice.description || practice],
          timestamp: new Date(),
          acknowledged: false,
          priority: 'medium'
        };
        insights.push(insight);
      });
    }

    return insights;
  }

  /**
   * Get personality context for oracle translation
   */
  private async getPersonalityContext(userId: string): Promise<PersonalityContext> {
    try {
      const { data: blueprint } = await supabase
        .from('user_blueprints')
        .select('blueprint')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      return {
        blueprint: blueprint?.blueprint || null,
        communicationStyle: 'mystical',
        preferredTone: 'loving',
        timingPattern: 'immediate'
      };
    } catch (error) {
      console.error('Error getting personality context:', error);
      return {
        blueprint: null,
        communicationStyle: 'mystical',
        preferredTone: 'loving',
        timingPattern: 'immediate'
      };
    }
  }
}

// Export singleton instance
export const hermeticInsightExtractor = new HermeticInsightExtractor();