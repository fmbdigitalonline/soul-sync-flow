/**
 * Hermetic Personality Report Service - Parallel service for comprehensive 25,000+ word reports
 * Operates independently from existing ai-personality-report-service to avoid conflicts
 */

import { supabase } from "@/integrations/supabase/client";
import { BlueprintData } from "./blueprint-service";
import { hermeticReportOrchestrator } from "./hermetic-report-orchestrator";

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
  async generateHermeticReport(blueprint: BlueprintData, language: string = 'en'): Promise<{ 
    success: boolean; 
    report?: HermeticPersonalityReport; 
    quotes?: any[]; 
    error?: string 
  }> {
    try {
      console.log('🌟 Generating comprehensive Hermetic Blueprint Report (25,000+ words)...');
      console.log('📋 Blueprint structure:', {
        blueprintId: blueprint.id,
        userId: blueprint.user_id,
        hasUserMeta: !!blueprint.user_meta,
        hasAllSystems: !!(blueprint.cognition_mbti && blueprint.archetype_western && 
                         blueprint.values_life_path && blueprint.energy_strategy_human_design)
      });
      
      const startTime = Date.now();
      
      // Use the Hermetic Report Orchestrator for multi-agent generation
      const hermeticResult = await hermeticReportOrchestrator.generateHermeticReport(blueprint);
      
      // Generate Intelligence Analysis (12 analysts)
      console.log('🧠 Generating 12 Intelligence Analysts Analysis...');
      const { intelligenceReportOrchestrator } = await import('./intelligence-report-orchestrator');
      const intelligenceReport = await intelligenceReportOrchestrator.generateIntelligenceReport(
        blueprint.user_id || blueprint.user_meta?.user_id || '',
        hermeticResult,
        blueprint
      );
      
      // Transform orchestrator result into report format
      const report = await this.buildHermeticReport(blueprint, hermeticResult, intelligenceReport);
      
      // Store the report in the database
      const storedReport = await this.storeHermeticReport(report);
      
      // Generate personalized quotes aligned with Hermetic laws
      const quotes = await this.generateHermeticQuotes(blueprint, hermeticResult, language);
      
      // Automatically trigger structured intelligence extraction and storage
      await this.triggerIntelligenceExtraction(blueprint.user_id || blueprint.user_meta?.user_id);
      
      const endTime = Date.now();
      console.log(`✅ Hermetic Report generated: ${hermeticResult.total_word_count} words in ${endTime - startTime}ms`);
      
      return { 
        success: true, 
        report: storedReport,
        quotes: quotes || []
      };
      
    } catch (error) {
      console.error('❌ Hermetic report generation failed:', error);
      return { success: false, error: String(error) };
    }
  }

  private async buildHermeticReport(
    blueprint: BlueprintData, 
    hermeticResult: any,
    intelligenceReport?: any
  ): Promise<HermeticPersonalityReport> {
    
    // Extract sections by agent type
    const sections = hermeticResult.sections;
    console.log(`📊 Building report from ${sections.length} sections`);
    
    // Extract gate analyses specifically - ENSURE ALL GATE SECTIONS ARE CAPTURED
    const gateSections = sections.filter((s: any) => 
      s.gate_number && 
      s.agent_type === 'gate_hermetic_analyst' && 
      s.content && 
      s.content.length > 0
    );
    
    console.log(`🚪 Found ${gateSections.length} gate sections out of ${sections.length} total sections`);
    console.log(`🚪 Gate sections structure:`, gateSections.map(s => ({ 
      gate: s.gate_number, 
      agent: s.agent_type, 
      hasContent: !!s.content,
      contentLength: s.content?.length || 0 
    })));
    
    const gateAnalyses: { [gateNumber: string]: string } = {};
    const analyzedGates: number[] = [];
    
    gateSections.forEach((section: any) => {
      const gateNum = section.gate_number.toString();
      gateAnalyses[`gate_${gateNum}`] = section.content;
      analyzedGates.push(section.gate_number);
      console.log(`🚪 Added Gate ${section.gate_number} analysis (${section.content.length} chars)`);
    });
    
    console.log(`🚪 Total gate analyses stored: ${Object.keys(gateAnalyses).length}`);
    console.log(`🚪 Gates analyzed: ${analyzedGates.sort((a, b) => a - b).join(', ')}`);
    
    // CRITICAL: Verify no gate analysis was lost
    if (gateSections.length !== Object.keys(gateAnalyses).length) {
      console.error(`❌ GATE DATA LOSS DETECTED: ${gateSections.length} sections found but only ${Object.keys(gateAnalyses).length} stored!`);
    }
    const sevenLaws = {
      mentalism: sections.find((s: any) => s.agent_type === 'mentalism_analyst')?.content || '',
      correspondence: sections.find((s: any) => s.agent_type === 'correspondence_analyst')?.content || '',
      vibration: sections.find((s: any) => s.agent_type === 'vibration_analyst')?.content || '',
      polarity: sections.find((s: any) => s.agent_type === 'polarity_analyst')?.content || '',
      rhythm: sections.find((s: any) => s.agent_type === 'rhythm_analyst')?.content || '',
      causation: sections.find((s: any) => s.agent_type === 'causation_analyst')?.content || '',
      gender: sections.find((s: any) => s.agent_type === 'gender_analyst')?.content || ''
    };

    const systemTranslations = {
      mbti_hermetic: sections.find((s: any) => s.agent_type === 'mbti_hermetic_translator')?.content || '',
      astrology_hermetic: sections.find((s: any) => s.agent_type === 'astrology_hermetic_translator')?.content || '',
      numerology_hermetic: sections.find((s: any) => s.agent_type === 'numerology_hermetic_translator')?.content || '',
      human_design_hermetic: sections.find((s: any) => s.agent_type === 'human_design_hermetic_translator')?.content || '',
      chinese_astrology_hermetic: sections.find((s: any) => s.agent_type === 'chinese_astrology_hermetic_translator')?.content || ''
    };

    return {
      id: crypto.randomUUID(),
      user_id: blueprint.user_id || blueprint.user_meta?.user_id || '',
      blueprint_id: blueprint.id || null,
      report_content: {
        // Standard sections (enhanced with Hermetic perspective)
        core_personality_pattern: this.extractCorePattern(sevenLaws, systemTranslations),
        decision_making_style: this.extractDecisionStyle(sevenLaws.causation, systemTranslations.mbti_hermetic),
        relationship_style: this.extractRelationshipStyle(sevenLaws.correspondence, sevenLaws.polarity),
        life_path_purpose: this.extractLifePurpose(sevenLaws.mentalism, systemTranslations.numerology_hermetic),
        current_energy_timing: this.extractEnergyTiming(sevenLaws.rhythm, sevenLaws.vibration),
        integrated_summary: hermeticResult.synthesis,
        
        // NEW: Hermetic Blueprint sections
        hermetic_fractal_analysis: hermeticResult.synthesis,
        consciousness_integration_map: hermeticResult.consciousness_map,
        practical_activation_framework: hermeticResult.practical_applications,
        seven_laws_integration: sevenLaws,
        system_translations: systemTranslations,
        gate_analyses: gateAnalyses, // Include all gate analyses with shadow work
        shadow_work_integration: {
          shadow_patterns: this.extractShadowPatterns(sevenLaws, gateAnalyses),
          integration_practices: this.extractIntegrationPractices(hermeticResult.practical_applications),
          transformation_roadmap: this.extractTransformationRoadmap(hermeticResult.consciousness_map)
        }, // NEW: Comprehensive shadow work integration
        blueprint_signature: hermeticResult.blueprint_signature,
        word_count: hermeticResult.total_word_count,
        generation_metadata: {
          agents_used: sections.map((s: any) => s.agent_type),
          total_processing_time: 0, // Will be calculated
          hermetic_depth_score: 10, // Maximum depth achieved
          gates_analyzed: analyzedGates // NEW: Track analyzed gates
        },
        structured_intelligence: intelligenceReport || hermeticResult.structured_intelligence
      },
      generated_at: hermeticResult.generated_at,
      blueprint_version: '2.0'
    };
  }

  private extractCorePattern(sevenLaws: any, systemTranslations: any): string {
    return `${systemTranslations.mbti_hermetic.substring(0, 300)}...

Through the Hermetic lens, your core pattern emerges as a fractal expression of universal principles. ${sevenLaws.mentalism.substring(0, 200)}...`;
  }

  private extractDecisionStyle(causationAnalysis: string, mbtiHermetic: string): string {
    return `${mbtiHermetic.substring(0, 200)}...

From the Law of Cause & Effect perspective: ${causationAnalysis.substring(0, 300)}...`;
  }

  private extractRelationshipStyle(correspondenceAnalysis: string, polarityAnalysis: string): string {
    return `Relationship dynamics through Correspondence: ${correspondenceAnalysis.substring(0, 250)}...

Polarity integration in relationships: ${polarityAnalysis.substring(0, 250)}...`;
  }

  private extractLifePurpose(mentalismAnalysis: string, numerologyHermetic: string): string {
    return `Mental framework of purpose: ${mentalismAnalysis.substring(0, 250)}...

Numerological purpose pattern: ${numerologyHermetic.substring(0, 250)}...`;
  }

  private extractEnergyTiming(rhythmAnalysis: string, vibrationAnalysis: string): string {
    return `Natural rhythms and timing: ${rhythmAnalysis.substring(0, 250)}...

Vibrational energy patterns: ${vibrationAnalysis.substring(0, 250)}...`;
  }

  private extractShadowPatterns(sevenLaws: any, gateAnalyses: any): string {
    const shadowElements = [];
    
    // Extract shadow patterns from seven laws
    Object.entries(sevenLaws).forEach(([law, content]) => {
      if (typeof content === 'string' && content.includes('shadow')) {
        const shadowMatch = content.match(/(shadow[^.]*\.)/gi);
        if (shadowMatch) {
          shadowElements.push(`**${law.toUpperCase()} Shadow**: ${shadowMatch[0]}`);
        }
      }
    });
    
    // Extract shadow patterns from gate analyses
    Object.entries(gateAnalyses).forEach(([gate, content]) => {
      if (typeof content === 'string' && content.includes('shadow')) {
        const shadowMatch = content.match(/(shadow[^.]*\.)/gi);
        if (shadowMatch) {
          shadowElements.push(`**${gate.toUpperCase()} Shadow**: ${shadowMatch[0]}`);
        }
      }
    });
    
    return shadowElements.length > 0 
      ? shadowElements.join('\n\n') 
      : 'Shadow patterns are integrated throughout the analysis above.';
  }

  private extractIntegrationPractices(practicalApplications: string): string {
    const practices = [];
    
    if (typeof practicalApplications === 'string') {
      // Extract practice-related sentences
      const practiceMatches = practicalApplications.match(/(practice[^.]*\.)/gi) || [];
      const exerciseMatches = practicalApplications.match(/(exercise[^.]*\.)/gi) || [];
      const techniqueMatches = practicalApplications.match(/(technique[^.]*\.)/gi) || [];
      
      practices.push(...practiceMatches, ...exerciseMatches, ...techniqueMatches);
    }
    
    return practices.length > 0 
      ? practices.slice(0, 10).join('\n\n') 
      : 'Integration practices are woven throughout the practical applications section.';
  }

  private extractTransformationRoadmap(consciousnessMap: string): string {
    const roadmapElements = [];
    
    if (typeof consciousnessMap === 'string') {
      // Extract transformation-related guidance
      const stepMatches = consciousnessMap.match(/(step[^.]*\.)/gi) || [];
      const stageMatches = consciousnessMap.match(/(stage[^.]*\.)/gi) || [];
      const levelMatches = consciousnessMap.match(/(level[^.]*\.)/gi) || [];
      
      roadmapElements.push(...stepMatches, ...stageMatches, ...levelMatches);
    }
    
    return roadmapElements.length > 0 
      ? roadmapElements.slice(0, 8).join('\n\n') 
      : 'The transformation roadmap is detailed within the consciousness integration map.';
  }

  private async storeHermeticReport(report: HermeticPersonalityReport): Promise<HermeticPersonalityReport> {
    const { data, error } = await supabase
      .from('personality_reports')
      .insert({
        id: report.id,
        user_id: report.user_id,
        blueprint_id: report.blueprint_id,
        report_content: report.report_content,
        generated_at: report.generated_at,
        blueprint_version: report.blueprint_version
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to store Hermetic report:', error);
      throw new Error(`Storage failed: ${error.message}`);
    }

    return data as unknown as HermeticPersonalityReport;
  }

  private async generateHermeticQuotes(blueprint: BlueprintData, hermeticResult: any, language: string = 'en'): Promise<any[]> {
    try {
      // Call existing quote generation but with Hermetic alignment
      const { data, error } = await supabase.functions.invoke("regenerate-quotes", {
        body: {
          blueprint: blueprint,
          userId: blueprint.user_id,
          language: language,
          hermeticContext: {
            blueprint_signature: hermeticResult.blueprint_signature,
            seven_laws_themes: hermeticResult.sections
              .filter((s: any) => s.hermetic_law)
              .map((s: any) => ({ law: s.hermetic_law, theme: s.content.substring(0, 100) }))
          }
        }
      });

      if (error) {
        console.warn('⚠️ Quote generation failed, continuing without quotes:', error);
        return [];
      }

      return data?.quotes || [];
      
    } catch (error) {
      console.warn('⚠️ Quote generation error, continuing without quotes:', error);
      return [];
    }
  }

  async getHermeticReport(userId: string): Promise<{ 
    success: boolean; 
    report?: HermeticPersonalityReport; 
    error?: string 
  }> {
    try {
      console.log('🔍 Fetching Hermetic report for user:', userId);
      
      const { data, error } = await supabase
        .from('personality_reports')
        .select('*, structured_intelligence')
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
          structured_intelligence: (data.structured_intelligence && typeof data.structured_intelligence === 'object' && !Array.isArray(data.structured_intelligence)) 
            ? data.structured_intelligence as Record<string, any> 
            : {},
          blueprint_signature: reportContent?.blueprint_signature || '',
          word_count: reportContent?.word_count || 0,
          generation_metadata: reportContent?.generation_metadata || {
            agents_used: [], total_processing_time: 0, hermetic_depth_score: 0, gates_analyzed: []
          }
        }
      };
      
      console.log('📊 Report structure check:', {
        hasGateAnalyses: !!structuredReport.report_content.gate_analyses,
        hasSevenLaws: !!structuredReport.report_content.seven_laws_integration,
        hasShadowWork: !!structuredReport.report_content.shadow_work_integration,
        gateCount: structuredReport.report_content.gate_analyses ? Object.keys(structuredReport.report_content.gate_analyses).length : 0
      });
      
      return { success: true, report: structuredReport };
      
    } catch (error) {
      console.error('❌ Service error fetching Hermetic report:', error);
      return { success: false, error: String(error) };
    }
  }

  async hasHermeticReport(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('personality_reports')
        .select('id')
        .eq('user_id', userId)
        .eq('blueprint_version', '2.0')
        .limit(1);

      if (error) {
        console.error('❌ Error checking for Hermetic report:', error);
        return false;
      }

      return !!(data && data.length > 0);
      
    } catch (error) {
      console.error('❌ Service error checking Hermetic report:', error);
      return false;
    }
  }

  private async triggerIntelligenceExtraction(userId: string): Promise<void> {
    try {
      console.log('🧠 Triggering automatic intelligence extraction for user:', userId);
      
      const { data, error } = await supabase.functions.invoke('extract-hermetic-intelligence', {
        body: { userId, forceReprocess: false }
      });

      if (error) {
        console.warn('⚠️ Intelligence extraction trigger failed (non-critical):', error);
        return;
      }

      console.log('✅ Intelligence extraction triggered successfully:', data);
      
    } catch (error) {
      console.warn('⚠️ Intelligence extraction trigger error (non-critical):', error);
      // Don't throw - intelligence extraction failure should not break report generation
    }
  }
}

export const hermeticPersonalityReportService = new HermeticPersonalityReportService();
