/**
 * Hermetic Personality Report Service - Backend job creation service
 * Creates backend jobs for comprehensive hermetic reports
 */

import { supabase } from "@/integrations/supabase/client";
import { BlueprintData } from "./blueprint-service";

export interface HermeticPersonalityReport {
  id: string;
  user_id: string;
  blueprint_id: string;
  report_content: {
    // Standard personality report sections
    core_personality_pattern: string;
    decision_making_style: string;
    relationship_style: string;
    life_path_purpose: string;
    current_energy_timing: string;
    integrated_summary: string;
    
    // NEW: Hermetic Blueprint sections
    hermetic_fractal_analysis: string;
    consciousness_integration_map: string;
    practical_activation_framework: string;
    seven_laws_integration: {
      mentalism: string;
      correspondence: string;
      vibration: string;
      polarity: string;
      rhythm: string;
      causation: string;
      gender: string;
    };
    system_translations: {
      mbti_hermetic: string;
      astrology_hermetic: string;
      numerology_hermetic: string;
      human_design_hermetic: string;
      chinese_astrology_hermetic: string;
    };
    gate_analyses: { [gateNumber: string]: string }; // Individual gate analyses with shadow work
    shadow_work_integration: {
      shadow_patterns: string;
      integration_practices: string;
      transformation_roadmap: string;
    }; // NEW: Comprehensive shadow work sections
    blueprint_signature: string;
    word_count: number;
    generation_metadata: {
      agents_used: string[];
      total_processing_time: number;
      hermetic_depth_score: number;
      gates_analyzed: number[]; // NEW: Track which gates were analyzed
      intelligence_status?: string;
      intelligence_analysts?: string[];
    };
    structured_intelligence?: Record<string, any>;
  };
  generated_at: string;
  blueprint_version: string;
}

export interface HermeticReportWithQuotes {
  report: HermeticPersonalityReport;
  quotes: {
    quote_text: string;
    category: string;
    personality_alignment: any;
    hermetic_law_alignment?: string;
  }[];
}

class HermeticPersonalityReportService {
  /**
   * CREATE BACKEND JOB for hermetic report generation
   * This replaces all client-side generation with backend processing
   */
  async generateHermeticReport(blueprint: BlueprintData, language: string = 'en'): Promise<{ 
    success: boolean; 
    job_id?: string;
    error?: string 
  }> {
    try {
      console.log('🌟 HERMETIC SERVICE: Creating Backend Hermetic Report Job...');
      console.log('📋 HERMETIC SERVICE: Blueprint structure:', {
        blueprintId: blueprint.id,
        userId: blueprint.user_id,
        hasUserMeta: !!blueprint.user_meta,
        hasAllSystems: !!(blueprint.cognition_mbti && blueprint.archetype_western && 
                         blueprint.values_life_path && blueprint.energy_strategy_human_design),
        blueprintKeys: Object.keys(blueprint)
      });
      
      const userId = blueprint.user_id || blueprint.user_meta?.user_id;
      if (!userId) {
        console.error('❌ HERMETIC SERVICE: Missing User ID');
        throw new Error('User ID is required for backend job creation');
      }
      
      console.log('🚀 HERMETIC SERVICE: Calling hermetic-job-creator edge function...');
      
      // Create backend job instead of client-side generation
      const { data: jobData, error: jobError } = await supabase.functions.invoke('hermetic-job-creator', {
        body: {
          user_id: userId,
          blueprint_data: blueprint
        }
      });

      console.log('📡 HERMETIC SERVICE: Edge function response:', {
        hasData: !!jobData,
        error: jobError,
        jobId: jobData?.job_id,
        message: jobData?.message,
        rawResponse: jobData
      });

      if (jobError || !jobData?.job_id) {
        console.error('❌ HERMETIC SERVICE: Failed to create hermetic job:', jobError);
        throw new Error(`Failed to create backend job: ${jobError?.message || 'Unknown error'}`);
      }

      const jobId = jobData.job_id;
      console.log('✅ HERMETIC SERVICE: Created backend hermetic processing job:', jobId);
      console.log('🎯 HERMETIC SERVICE: Job creation successful - monitoring will begin automatically');
      
      return { 
        success: true, 
        job_id: jobId
      };
      
    } catch (error) {
      console.error('💥 HERMETIC SERVICE: Backend hermetic job creation failed:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * GET EXISTING HERMETIC REPORT from database
   */
  async getHermeticReport(userId: string): Promise<{ 
    success: boolean; 
    report?: HermeticPersonalityReport; 
    error?: string 
  }> {
    try {
      console.log('🔍 Fetching Hermetic report for user:', userId);
      
      const { data, error } = await supabase
        .from('personality_reports')
        .select('*')
        .eq('user_id', userId)
        .eq('blueprint_version', '2.0') // Hermetic reports use version 2.0
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching Hermetic report:', error);
        return { success: false, error: error.message };
      }

      if (!data) {
        console.log('📝 No Hermetic report found for user:', userId);
        return { success: true, report: undefined };
      }

      console.log('✅ Hermetic report found:', data.id);
      
      // Ensure proper structure mapping for JSONB content with type assertion
      const reportContent = data.report_content as any;
      const structuredReport: HermeticPersonalityReport = {
        id: data.id,
        user_id: data.user_id,
        blueprint_id: data.blueprint_id,
        generated_at: data.generated_at,
        blueprint_version: data.blueprint_version,
        report_content: {
          core_personality_pattern: reportContent?.core_personality_pattern || '',
          decision_making_style: reportContent?.decision_making_style || '',
          relationship_style: reportContent?.relationship_style || '',
          life_path_purpose: reportContent?.life_path_purpose || '',
          current_energy_timing: reportContent?.current_energy_timing || '',
          integrated_summary: reportContent?.integrated_summary || '',
          hermetic_fractal_analysis: reportContent?.hermetic_fractal_analysis || '',
          consciousness_integration_map: reportContent?.consciousness_integration_map || '',
          practical_activation_framework: reportContent?.practical_activation_framework || '',
          seven_laws_integration: reportContent?.seven_laws_integration || {
            mentalism: '', correspondence: '', vibration: '', polarity: '', 
            rhythm: '', causation: '', gender: ''
          },
          system_translations: reportContent?.system_translations || {
            mbti_hermetic: '', astrology_hermetic: '', numerology_hermetic: '', 
            human_design_hermetic: '', chinese_astrology_hermetic: ''
          },
          gate_analyses: reportContent?.gate_analyses || {},
          shadow_work_integration: reportContent?.shadow_work_integration || {
            shadow_patterns: '', integration_practices: '', transformation_roadmap: ''
          },
          blueprint_signature: reportContent?.blueprint_signature || '',
          word_count: reportContent?.word_count || 0,
          generation_metadata: reportContent?.generation_metadata || {
            agents_used: [], total_processing_time: 0, hermetic_depth_score: 0, gates_analyzed: []
          },
          structured_intelligence: reportContent?.structured_intelligence
        }
      };

      return { success: true, report: structuredReport };
      
    } catch (error) {
      console.error('❌ Error in getHermeticReport:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * CHECK IF USER HAS HERMETIC REPORT
   */
  async hasHermeticReport(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('personality_reports')
        .select('id')
        .eq('user_id', userId)
        .eq('blueprint_version', '2.0')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ Error checking Hermetic report:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('❌ Error in hasHermeticReport:', error);
      return false;
    }
  }
}

export const hermeticPersonalityReportService = new HermeticPersonalityReportService();