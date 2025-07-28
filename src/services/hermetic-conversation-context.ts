import { supabase } from '@/integrations/supabase/client';

export interface HermeticConversationContext {
  depth: 'basic' | 'enhanced' | 'hermetic' | 'oracle';
  user360Profile?: any;
  personalityReports?: any[];
  dataAvailability: {
    hasBlueprint: boolean;
    hasUser360: boolean;
    hasPersonalityReports: boolean;
    hasAdvancedAssessments: boolean;
  };
  contextLayers: {
    blueprint?: any;
    personalityProfile?: any;
    deepInsights?: any;
    temporalPatterns?: any;
  };
}

/**
 * Service to build rich conversation context using Hermetic intelligence data
 * Operates on Ground Truth (Principle #2) - uses real data from database
 */
export class HermeticConversationContextService {
  
  /**
   * Builds comprehensive conversation context from available Hermetic data
   * Returns depth indicator and context layers for conversation enhancement
   */
  async buildConversationContext(userId: string): Promise<HermeticConversationContext> {
    console.log('🧠 HERMETIC CONTEXT: Building conversation context for user:', userId.substring(0, 8));
    
    try {
      // PARALLEL DATA RETRIEVAL - Principle #6: Respect data pathways
      const [blueprintResult, user360Result, personalityReportsResult] = await Promise.all([
        this.getUserBlueprint(userId),
        this.getUser360Profile(userId),
        this.getPersonalityReports(userId)
      ]);

      // GROUND TRUTH ANALYSIS - determine actual data availability
      const dataAvailability = {
        hasBlueprint: !!blueprintResult,
        hasUser360: !!user360Result,
        hasPersonalityReports: personalityReportsResult.length > 0,
        hasAdvancedAssessments: this.hasAdvancedPersonalityData(blueprintResult)
      };

      // DEPTH CALCULATION - based on actual available data
      const depth = this.calculateConversationDepth(dataAvailability, personalityReportsResult);

      // BUILD CONTEXT LAYERS
      const contextLayers = this.buildContextLayers(
        blueprintResult,
        user360Result,
        personalityReportsResult
      );

      console.log('✅ HERMETIC CONTEXT: Built context with depth:', depth, {
        blueprint: dataAvailability.hasBlueprint,
        user360: dataAvailability.hasUser360,
        personalityReports: dataAvailability.hasPersonalityReports,
        layers: Object.keys(contextLayers).length
      });

      return {
        depth,
        user360Profile: user360Result,
        personalityReports: personalityReportsResult,
        dataAvailability,
        contextLayers
      };

    } catch (error) {
      console.error('❌ HERMETIC CONTEXT ERROR:', error);
      
      // TRANSPARENT ERROR HANDLING - Principle #7: Build transparently
      return {
        depth: 'basic',
        dataAvailability: {
          hasBlueprint: false,
          hasUser360: false,
          hasPersonalityReports: false,
          hasAdvancedAssessments: false
        },
        contextLayers: {}
      };
    }
  }

  private async getUserBlueprint(userId: string) {
    const { data } = await supabase
      .from('user_blueprints')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();
    
    return data;
  }

  private async getUser360Profile(userId: string) {
    const { data } = await supabase
      .from('user_360_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    
    return data;
  }

  private async getPersonalityReports(userId: string) {
    const { data } = await supabase
      .from('personality_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
    
    return data || [];
  }

  private hasAdvancedPersonalityData(blueprintResult: any): boolean {
    if (!blueprintResult?.blueprint) return false;
    
    const blueprint = blueprintResult.blueprint as any;
    
    // Check for MBTI data
    const hasMBTI = !!(
      blueprint?.user_meta?.personality?.likelyType ||
      blueprint?.cognition_mbti?.type
    );
    
    // Check for Human Design data
    const hasHD = !!(
      blueprint?.energy_strategy_human_design?.type
    );
    
    return hasMBTI && hasHD;
  }

  private calculateConversationDepth(
    dataAvailability: any, 
    personalityReports: any[]
  ): 'basic' | 'enhanced' | 'hermetic' | 'oracle' {
    
    // ORACLE DEPTH: Full personality reports with comprehensive analysis
    if (dataAvailability.hasPersonalityReports && personalityReports.length >= 2) {
      return 'oracle';
    }
    
    // HERMETIC DEPTH: Has comprehensive blueprint + 360 profile
    if (dataAvailability.hasBlueprint && dataAvailability.hasUser360 && dataAvailability.hasAdvancedAssessments) {
      return 'hermetic';
    }
    
    // ENHANCED DEPTH: Has basic blueprint with personality data
    if (dataAvailability.hasBlueprint && dataAvailability.hasAdvancedAssessments) {
      return 'enhanced';
    }
    
    // BASIC DEPTH: Minimal or no data
    return 'basic';
  }

  private buildContextLayers(blueprint: any, user360: any, personalityReports: any[]) {
    const layers: any = {};

    // BLUEPRINT LAYER
    if (blueprint?.blueprint) {
      layers.blueprint = {
        name: blueprint.blueprint.user_meta?.preferred_name,
        mbti: blueprint.blueprint.user_meta?.personality?.likelyType || blueprint.blueprint.cognition_mbti?.type,
        humanDesign: {
          type: blueprint.blueprint.energy_strategy_human_design?.type,
          strategy: blueprint.blueprint.energy_strategy_human_design?.strategy,
          authority: blueprint.blueprint.energy_strategy_human_design?.authority
        },
        astrology: {
          sunSign: blueprint.blueprint.archetype_western?.sun_sign,
          moonSign: blueprint.blueprint.archetype_western?.moon_sign,
          chinese: blueprint.blueprint.archetype_chinese
        },
        lifePath: blueprint.blueprint.values_life_path?.life_path_number
      };
    }

    // USER 360 LAYER
    if (user360?.profile_data) {
      layers.personalityProfile = {
        comprehensiveData: user360.profile_data,
        dataSources: user360.data_sources,
        availability: user360.data_availability
      };
    }

    // PERSONALITY INSIGHTS LAYER
    if (personalityReports.length > 0) {
      layers.deepInsights = personalityReports.map(report => ({
        blueprintId: report.blueprint_id,
        version: report.blueprint_version,
        content: report.report_content,
        generatedAt: report.generated_at,
        timestamp: report.created_at
      }));
    }

    return layers;
  }

  /**
   * Generates conversation prompt enhancement based on available Hermetic context
   */
  generateHermeticPromptEnhancement(context: HermeticConversationContext): string {
    if (context.depth === 'basic') {
      return ''; // No enhancement for basic level
    }

    let enhancement = '\n\n# HERMETIC INTELLIGENCE CONTEXT\n';
    
    // Add depth indicator
    enhancement += `## Intelligence Depth: ${context.depth.toUpperCase()}\n`;

    // Add blueprint context if available
    if (context.contextLayers.blueprint) {
      const bp = context.contextLayers.blueprint;
      enhancement += `\n## User Personality Blueprint:\n`;
      enhancement += `- Name: ${bp.name || 'User'}\n`;
      if (bp.mbti) enhancement += `- MBTI: ${bp.mbti}\n`;
      if (bp.humanDesign?.type) enhancement += `- Human Design: ${bp.humanDesign.type} ${bp.humanDesign.strategy}\n`;
      if (bp.astrology?.sunSign) enhancement += `- Astrology: ${bp.astrology.sunSign} Sun\n`;
    }

    // Add 360 profile insights
    if (context.contextLayers.personalityProfile) {
      enhancement += `\n## Comprehensive Profile Available\n`;
      enhancement += `- Data Sources: ${context.user360Profile?.data_sources?.join(', ') || 'Multiple'}\n`;
      enhancement += `- Profile Completeness: Enhanced psychological modeling available\n`;
    }

    // Add personality reports for oracle mode
    if (context.depth === 'oracle' && context.contextLayers.deepInsights) {
      enhancement += `\n## Comprehensive Personality Reports Available\n`;
      enhancement += `- Reports: ${context.personalityReports?.length || 0} detailed analyses\n`;
      enhancement += `- Deep Patterns: Advanced personality modeling available\n`;
      enhancement += `- Comprehensive Insights: Multi-dimensional personality understanding\n`;
    }

    enhancement += `\n## Conversation Instructions:\n`;
    enhancement += `Based on the ${context.depth} depth level, provide responses that utilize the available intelligence layers while maintaining natural conversation flow. Reference insights naturally without technical jargon.\n`;

    return enhancement;
  }
}

export const hermeticConversationContextService = new HermeticConversationContextService();