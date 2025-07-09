import { supabase } from "@/integrations/supabase/client";
import { BlueprintData } from "./blueprint-service";

export interface PersonalityReport {
  id: string;
  user_id: string;
  blueprint_id: string;
  report_content: {
    core_personality_pattern: string;
    decision_making_style: string;
    relationship_style: string;
    life_path_purpose: string;
    current_energy_timing: string;
    integrated_summary: string;
  };
  generated_at: string;
  blueprint_version: string;
}

export interface PersonalityReportWithQuotes {
  report: PersonalityReport;
  quotes: {
    quote_text: string;
    category: string;
    personality_alignment: any;
  }[];
}

class AIPersonalityReportService {
  async generatePersonalityReport(blueprint: BlueprintData): Promise<{ success: boolean; report?: PersonalityReport; quotes?: any[]; error?: string }> {
    try {
      console.log('🎭 Generating comprehensive personality report with personalized quotes...');
      console.log('📋 Blueprint data structure:', {
        blueprintId: blueprint.id,
        hasUserMeta: !!blueprint.user_meta,
        hasArchetypeWestern: !!blueprint.archetype_western,
        hasValuesLifePath: !!blueprint.values_life_path,
        hasEnergyStrategy: !!blueprint.energy_strategy_human_design,
        hasCognitionMbti: !!blueprint.cognition_mbti,
        hasGoalStack: !!blueprint.goal_stack
      });
      
      // Transform blueprint to ensure it has the expected structure for the edge function
      const transformedBlueprint = this.transformBlueprintForEdgeFunction(blueprint);
      
      console.log('🔄 Transformed blueprint for edge function:', {
        id: transformedBlueprint.id,
        hasUserMeta: !!transformedBlueprint.user_meta,
        hasCognitionMbti: !!transformedBlueprint.cognition_mbti,
        hasEnergyStrategy: !!transformedBlueprint.energy_strategy_human_design,
        hasArchetypeWestern: !!transformedBlueprint.archetype_western,
        hasValuesLifePath: !!transformedBlueprint.values_life_path,
        hasBasharSuite: !!transformedBlueprint.bashar_suite
      });
      
      const { data, error } = await supabase.functions.invoke("generate-personality-report", {
        body: {
          blueprint: transformedBlueprint,
          userId: transformedBlueprint.user_meta?.user_id || transformedBlueprint.user_meta?.id,
        },
      });

      if (error) {
        console.error('❌ Error generating personality report:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Report generation successful:', data);
      return { 
        success: true, 
        report: data.report,
        quotes: data.quotes || []
      };
    } catch (error) {
      console.error('💥 Service error generating personality report:', error);
      return { success: false, error: String(error) };
    }
  }

  private transformBlueprintForEdgeFunction(blueprint: BlueprintData): any {
    console.log('🔄 Transforming blueprint data for edge function compatibility');
    
    // Ensure the blueprint has the expected structure for the edge function
    return {
      id: blueprint.id,
      user_meta: {
        ...blueprint.user_meta,
        user_id: blueprint.user_meta?.user_id || blueprint.user_id,
        preferred_name: blueprint.user_meta?.preferred_name || blueprint.user_meta?.full_name?.split(' ')[0],
        full_name: blueprint.user_meta?.full_name || 'User'
      },
      // Map to expected property names for edge function
      cognition_mbti: blueprint.cognition_mbti || blueprint.mbti || {
        type: 'Unknown',
        dominant_function: 'Unknown',
        auxiliary_function: 'Unknown',
        core_keywords: []
      },
      energy_strategy_human_design: blueprint.energy_strategy_human_design || blueprint.human_design || {
        type: 'Unknown',
        authority: 'Unknown',
        profile: 'Unknown'
      },
      archetype_western: blueprint.archetype_western || blueprint.astrology || {
        sun_sign: 'Unknown',
        moon_sign: 'Unknown',
        rising_sign: 'Unknown'
      },
      values_life_path: blueprint.values_life_path || blueprint.numerology || {
        lifePathNumber: 'Unknown',
        lifePathKeyword: 'Unknown'
      },
      bashar_suite: blueprint.bashar_suite || {
        excitement_compass: { 
          principle: 'Follow your highest excitement' 
        },
        belief_interface: { 
          principle: 'Beliefs create reality', 
          reframe_prompt: 'What would I rather believe?' 
        },
        frequency_alignment: { 
          quick_ritual: 'Take 3 deep breaths and feel gratitude' 
        }
      },
      goal_stack: blueprint.goal_stack || {},
      metadata: blueprint.metadata || {}
    };
  }

  async getStoredReport(userId: string): Promise<{ success: boolean; report?: PersonalityReport; error?: string }> {
    try {
      console.log('🔍 Fetching stored report for user:', userId);
      
      // Query the personality_reports table directly, bypassing supabase type checking for the table
      const { data, error } = await (supabase as any)
        .from('personality_reports')
        .select('*')
        .eq('user_id', userId)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching stored report:', error);
        return { success: false, error: error.message };
      }

      if (!data) {
        console.log('📝 No stored report found for user:', userId);
        return { success: true, report: undefined };
      }

      console.log('✅ Report found:', data);
      return { success: true, report: data as PersonalityReport };
    } catch (error) {
      console.error('💥 Service error fetching stored report:', error);
      return { success: false, error: String(error) };
    }
  }

  async hasExistingReport(userId: string): Promise<boolean> {
    try {
      console.log('🔍 Checking for existing report for user:', userId);
      
      // Query the personality_reports table directly
      const { data, error } = await (supabase as any)
        .from('personality_reports')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (error) {
        console.error('❌ Error checking for existing report:', error);
        return false;
      }

      const hasReport = data && data.length > 0;
      console.log('📊 Has existing report:', hasReport);
      return hasReport;
    } catch (error) {
      console.error('💥 Service error checking existing report:', error);
      return false;
    }
  }
}

export const aiPersonalityReportService = new AIPersonalityReportService();
