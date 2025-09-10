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
        // Enhanced metadata from backend improvements
        word_count_breakdown?: {
          system_sections?: number;
          hermetic_sections?: number;
          gate_sections?: number;
          intelligence_sections?: number;
          synthesis_sections?: number;
        };
        processing_quality?: string;
        version?: string;
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
      console.log('🌟 HERMETIC SERVICE: Creating Backend Hermetic Report Job with enhanced validation...');
      
      // Enhanced validation similar to backend process
      if (!blueprint || typeof blueprint !== 'object') {
        console.error('❌ HERMETIC SERVICE: Invalid blueprint data provided');
        return { success: false, error: 'Invalid blueprint data provided' };
      }

      // Enhanced blueprint structure validation
      const requiredSections = ['cognition_mbti', 'energy_strategy_human_design', 'archetype_western', 'values_life_path'];
      const missingSections = requiredSections.filter(section => 
        !blueprint[section] || typeof blueprint[section] !== 'object'
      );
      
      if (missingSections.length > 0) {
        console.warn(`⚠️ HERMETIC SERVICE: Missing blueprint sections: ${missingSections.join(', ')} - continuing with available data`);
        // Continue processing instead of failing - partial data is better than no processing
      }

      console.log('📋 HERMETIC SERVICE: Blueprint structure validation:', {
        blueprintId: blueprint.id,
        userId: blueprint.user_id,
        hasUserMeta: !!blueprint.user_meta,
        hasMBTI: !!blueprint.cognition_mbti,
        hasHD: !!blueprint.energy_strategy_human_design,
        hasAstrology: !!blueprint.archetype_western,
        hasNumerology: !!blueprint.values_life_path,
        blueprintSize: JSON.stringify(blueprint).length,
        missingSections: missingSections.length > 0 ? missingSections : 'none'
      });
      
      const userId = blueprint.user_id || blueprint.user_meta?.user_id;
      if (!userId) {
        console.error('❌ HERMETIC SERVICE: Missing User ID');
        return { success: false, error: 'User ID is required for backend job creation' };
      }
      
      console.log('🚀 HERMETIC SERVICE: Calling hermetic-job-creator edge function...');
      
      // Create backend job with enhanced error handling
      const { data: jobData, error: jobError } = await supabase.functions.invoke('hermetic-job-creator', {
        body: {
          user_id: userId,
          blueprint_data: blueprint,
          language: language
        }
      });

      console.log('📡 HERMETIC SERVICE: Edge function response:', {
        hasData: !!jobData,
        error: jobError,
        jobId: jobData?.job_id,
        message: jobData?.message,
        rawResponse: jobData
      });

      if (jobError) {
        console.error('❌ HERMETIC SERVICE: Failed to create hermetic job:', jobError);
        return { 
          success: false, 
          error: `Failed to start report generation: ${jobError.message}. This may be due to system capacity - please try again in a few minutes.` 
        };
      }

      if (!jobData?.job_id) {
        console.error('❌ HERMETIC SERVICE: Job creation succeeded but no job_id returned:', jobData);
        return { 
          success: false, 
          error: 'Report generation started but job tracking failed. Please check your reports page in a few minutes.' 
        };
      }

      const jobId = jobData.job_id;
      console.log('✅ HERMETIC SERVICE: Created backend hermetic processing job:', {
        job_id: jobId,
        user_id: userId,
        expectedDuration: '15-30 minutes',
        expectedWords: '120,000+',
        processingStages: ['system_translation', 'hermetic_laws', 'gate_analysis', 'intelligence_extraction', 'synthesis_integration']
      });
      
      return { 
        success: true, 
        job_id: jobId
      };
      
    } catch (error) {
      console.error('💥 HERMETIC SERVICE: Backend hermetic job creation failed:', error);
      return { 
        success: false, 
        error: `Service error: ${error.message || 'Unknown error occurred'}. Please try again or contact support if the issue persists.` 
      };
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
      console.log('🔍 HERMETIC SERVICE: Fetching Hermetic report for user:', userId);
      
      if (!userId) {
        return { success: false, error: 'User ID is required' };
      }
      
      const { data, error } = await supabase
        .from('personality_reports')
        .select('*')
        .eq('user_id', userId)
        .eq('blueprint_version', '2.0') // Hermetic reports use version 2.0
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ HERMETIC SERVICE: Database error fetching Hermetic report:', error);
        return { 
          success: false, 
          error: `Database error: ${error.message}. Please try again or contact support.` 
        };
      }

      if (!data) {
        console.log('📭 HERMETIC SERVICE: No Hermetic report found for user:', userId);
        return { 
          success: true, 
          report: undefined,
          error: 'No hermetic personality reports found. Generate your first report to get started.'
        };
      }

      console.log('✅ HERMETIC SERVICE: Hermetic report found:', {
        reportId: data.id,
        generatedAt: data.generated_at,
        hasContent: !!data.report_content,
        wordCount: (data.report_content as any)?.word_count || 'unknown',
        qualityScore: (data.report_content as any)?.generation_metadata?.hermetic_depth_score || 'unknown',
        processingQuality: (data.report_content as any)?.generation_metadata?.processing_quality || 'unknown'
      });

      // Enhanced report content validation
      const reportContent = data.report_content as any;
      if (!reportContent) {
        console.error('❌ HERMETIC SERVICE: Report found but missing content structure');
        return { 
          success: false, 
          error: 'Report data is incomplete. Please regenerate your report.' 
        };
      }

      // Enhanced structure mapping with validation and fallbacks
      try {
        const structuredReport: HermeticPersonalityReport = {
          id: data.id,
          user_id: data.user_id,
          blueprint_id: data.blueprint_id,
          generated_at: data.generated_at,
          blueprint_version: data.blueprint_version,
          report_content: {
            // Core sections with fallbacks
            core_personality_pattern: reportContent?.core_personality_pattern || "Analysis pending - please regenerate if empty.",
            decision_making_style: reportContent?.decision_making_style || "Analysis pending - please regenerate if empty.",
            relationship_style: reportContent?.relationship_style || "Analysis pending - please regenerate if empty.",
            life_path_purpose: reportContent?.life_path_purpose || "Analysis pending - please regenerate if empty.",
            current_energy_timing: reportContent?.current_energy_timing || "Analysis pending - please regenerate if empty.",
            integrated_summary: reportContent?.integrated_summary || "Analysis pending - please regenerate if empty.",
            
            // Enhanced Hermetic sections
            hermetic_fractal_analysis: reportContent?.hermetic_fractal_analysis || "Fractal analysis pending - please regenerate if empty.",
            consciousness_integration_map: reportContent?.consciousness_integration_map || "Consciousness mapping pending - please regenerate if empty.",
            practical_activation_framework: reportContent?.practical_activation_framework || "Practical framework pending - please regenerate if empty.",
            
            // Seven Laws with validation
            seven_laws_integration: reportContent?.seven_laws_integration || {
              mentalism: "Law analysis pending", correspondence: "Law analysis pending", 
              vibration: "Law analysis pending", polarity: "Law analysis pending", 
              rhythm: "Law analysis pending", causation: "Law analysis pending", 
              gender: "Law analysis pending"
            },
            
            // System translations with validation
            system_translations: reportContent?.system_translations || {
              mbti_hermetic: "Translation pending", astrology_hermetic: "Translation pending", 
              numerology_hermetic: "Translation pending", human_design_hermetic: "Translation pending", 
              chinese_astrology_hermetic: "Translation pending"
            },
            
            // Gate analyses with validation
            gate_analyses: reportContent?.gate_analyses || {},
            
            // Shadow work with validation
            shadow_work_integration: reportContent?.shadow_work_integration || {
              shadow_patterns: "Shadow analysis pending", 
              integration_practices: "Integration practices pending", 
              transformation_roadmap: "Transformation roadmap pending"
            },
            
            // Metadata with enhanced tracking
            blueprint_signature: reportContent?.blueprint_signature || 'unknown',
            word_count: reportContent?.word_count || 0,
            generation_metadata: {
              agents_used: reportContent?.generation_metadata?.agents_used || [],
              total_processing_time: reportContent?.generation_metadata?.total_processing_time || 0,
              hermetic_depth_score: reportContent?.generation_metadata?.hermetic_depth_score || 0,
              gates_analyzed: reportContent?.generation_metadata?.gates_analyzed || [],
              intelligence_status: reportContent?.generation_metadata?.intelligence_status || 'unknown',
              intelligence_analysts: reportContent?.generation_metadata?.intelligence_analysts || [],
              // Enhanced metadata from backend improvements
              word_count_breakdown: reportContent?.generation_metadata?.word_count_breakdown || {},
              processing_quality: reportContent?.generation_metadata?.processing_quality || 'unknown',
              version: '2.0'
            },
            structured_intelligence: reportContent?.structured_intelligence || {}
          }
        };

        console.log('📊 HERMETIC SERVICE: Report structure validated and transformed successfully');
        return { success: true, report: structuredReport };
        
      } catch (transformError) {
        console.error('❌ HERMETIC SERVICE: Error transforming report data:', transformError);
        return { 
          success: false, 
          error: 'Report data format is invalid. Please regenerate your report for the latest format.' 
        };
      }
      
    } catch (error) {
      console.error('❌ HERMETIC SERVICE: Error in getHermeticReport:', error);
      return { 
        success: false, 
        error: `Service error: ${error.message || 'Unknown error occurred'}. Please try again.` 
      };
    }
  }

  /**
   * CHECK IF USER HAS HERMETIC REPORT
   */
  async hasHermeticReport(userId: string): Promise<boolean> {
    try {
      // FIXED: Check for any hermetic report, regardless of version
      const { data, error } = await supabase
        .from('personality_reports')
        .select('id, blueprint_version, generated_at')
        .eq('user_id', userId)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ Error checking Hermetic report:', error);
        return false;
      }

      // RECOVERY: Check for completed jobs with generated content but missing reports
      if (!data) {
        console.log('🔍 No personality report found, checking for completed jobs...');
        const { data: completedJob, error: jobError } = await supabase
          .from('hermetic_processing_jobs')
          .select('id, result_data, status, user_id')
          .eq('user_id', userId)
          .eq('status', 'completed')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (completedJob && completedJob.result_data) {
          console.log('🚨 RECOVERY: Found completed job with result but no personality report');
          return true; // Report exists in job result, treat as having report
        }
      }

      const hasReport = !!data;
      if (hasReport) {
        console.log(`✅ Found hermetic report (version ${data.blueprint_version}) created ${data.generated_at}`);
      }
      return hasReport;
    } catch (error) {
      console.error('❌ Error in hasHermeticReport:', error);
      return false;
    }
  }
}

export const hermeticPersonalityReportService = new HermeticPersonalityReportService();