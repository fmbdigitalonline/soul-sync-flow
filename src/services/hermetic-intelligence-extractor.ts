import { supabase } from '@/integrations/supabase/client';
import type { 
  HermeticStructuredIntelligence,
  HermeticStructuredIntelligenceDB,
  ExtractionContext, 
  DimensionExtractionResult,
  ExtractionProgress 
} from '@/types/hermetic-intelligence';

/**
 * Hermetic Intelligence Extraction Service
 * 
 * Following SoulSync Principles:
 * - Pillar I: Preserves existing hermetic reports (no replacement)
 * - Pillar II: Operates on ground truth from real reports (no simulation)
 * - Pillar III: Builds structured intelligence layer for agent access
 */
export class HermeticIntelligenceExtractor {
  private readonly CHUNK_SIZE = 2500; // Optimal size for GPT processing
  private readonly EXTRACTION_VERSION = '1.0';

  /**
   * Extract structured intelligence from a single hermetic report
   */
  async extractFromReport(reportId: string): Promise<{ success: boolean; data?: HermeticStructuredIntelligence; error?: string }> {
    try {
      console.log('🔍 HERMETIC EXTRACTOR: Starting extraction for report:', reportId);

      // Fetch the report (preserve existing data pathways)
      const { data: report, error: reportError } = await supabase
        .from('personality_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (reportError || !report) {
        throw new Error(`Failed to fetch report: ${reportError?.message}`);
      }

      // Check if extraction already exists
      const { data: existing } = await supabase
        .from('hermetic_structured_intelligence')
        .select('id')
        .eq('personality_report_id', reportId)
        .single();

      if (existing) {
        console.log('✅ HERMETIC EXTRACTOR: Intelligence already extracted for report:', reportId);
        return { success: true };
      }

      // Prepare extraction context
      const reportContent = report.report_content;
      const textChunks = this.chunkReportContent(reportContent);
      
      console.log(`📊 HERMETIC EXTRACTOR: Processing ${textChunks.length} chunks for report ${reportId}`);

      // Extract all 12 dimensions in parallel for efficiency
      const extractionPromises = [
        this.extractIdentityConstructs(textChunks, report),
        this.extractBehavioralTriggers(textChunks, report),
        this.extractExecutionBias(textChunks, report),
        this.extractInternalConflicts(textChunks, report),
        this.extractSpiritualDimension(textChunks, report),
        this.extractAdaptiveFeedback(textChunks, report),
        this.extractTemporalBiology(textChunks, report),
        this.extractMetacognitiveBiases(textChunks, report),
        this.extractAttachmentStyle(textChunks, report),
        this.extractGoalArchetypes(textChunks, report),
        this.extractCrisisHandling(textChunks, report),
        this.extractIdentityFlexibility(textChunks, report),
        this.extractLinguisticFingerprint(textChunks, report)
      ];

      const results = await Promise.all(extractionPromises);
      
      // Calculate overall confidence score
      const overallConfidence = results.reduce((sum, result) => sum + result.confidence_score, 0) / results.length;

      // Build structured intelligence object (database-compatible)
      const structuredIntelligence: HermeticStructuredIntelligenceDB = {
        user_id: report.user_id,
        personality_report_id: reportId,
        identity_constructs: results[0].extracted_data,
        behavioral_triggers: results[1].extracted_data,
        execution_bias: results[2].extracted_data,
        internal_conflicts: results[3].extracted_data,
        spiritual_dimension: results[4].extracted_data,
        adaptive_feedback: results[5].extracted_data,
        temporal_biology: results[6].extracted_data,
        metacognitive_biases: results[7].extracted_data,
        attachment_style: results[8].extracted_data,
        goal_archetypes: results[9].extracted_data,
        crisis_handling: results[10].extracted_data,
        identity_flexibility: results[11].extracted_data,
        linguistic_fingerprint: results[12].extracted_data,
        extraction_confidence: overallConfidence,
        extraction_version: this.EXTRACTION_VERSION,
        processing_notes: {
          chunks_processed: textChunks.length,
          extraction_method: 'parallel_12_dimension',
          timestamp: new Date().toISOString(),
          dimension_confidences: results.map(r => ({ dimension: r.dimension_name, confidence: r.confidence_score }))
        }
      };

      // Store structured intelligence (additive - preserves original)
      const { data: savedIntelligence, error: saveError } = await supabase
        .from('hermetic_structured_intelligence')
        .insert(structuredIntelligence)
        .select()
        .single();

      if (saveError) {
        throw new Error(`Failed to save structured intelligence: ${saveError.message}`);
      }

      console.log('✅ HERMETIC EXTRACTOR: Successfully extracted and saved intelligence for report:', reportId);
      return { success: true, data: savedIntelligence as unknown as HermeticStructuredIntelligence };

    } catch (error) {
      console.error('❌ HERMETIC EXTRACTOR: Extraction failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown extraction error' 
      };
    }
  }

  /**
   * Extract structured intelligence from all user reports
   */
  async extractFromAllUserReports(userId: string): Promise<{ success: boolean; processed: number; error?: string }> {
    try {
      console.log('🔥 HERMETIC EXTRACTOR: Starting batch extraction for user:', userId);

      // Fetch all hermetic reports for user
      const { data: reports, error: reportsError } = await supabase
        .from('personality_reports')
        .select('id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (reportsError) {
        throw new Error(`Failed to fetch user reports: ${reportsError.message}`);
      }

      if (!reports || reports.length === 0) {
        console.log('ℹ️ HERMETIC EXTRACTOR: No reports found for user:', userId);
        return { success: true, processed: 0 };
      }

      let processed = 0;
      let errors: string[] = [];

      // Process each report (sequential to avoid overwhelming the system)
      for (const report of reports) {
        const result = await this.extractFromReport(report.id);
        if (result.success) {
          processed++;
        } else {
          errors.push(`Report ${report.id}: ${result.error}`);
        }
      }

      console.log(`✅ HERMETIC EXTRACTOR: Batch processing completed. Processed: ${processed}/${reports.length}`);

      if (errors.length > 0) {
        console.warn('⚠️ HERMETIC EXTRACTOR: Some extractions failed:', errors);
      }

      return { 
        success: true, 
        processed,
        error: errors.length > 0 ? `${errors.length} extractions failed` : undefined
      };

    } catch (error) {
      console.error('❌ HERMETIC EXTRACTOR: Batch extraction failed:', error);
      return { 
        success: false, 
        processed: 0, 
        error: error instanceof Error ? error.message : 'Unknown batch extraction error' 
      };
    }
  }

  /**
   * Chunk report content for optimal processing
   */
  private chunkReportContent(reportContent: any): string[] {
    // Extract key sections from hermetic report structure
    const sections = [
      reportContent.core_personality_synthesis || '',
      reportContent.consciousness_integration_map || '',
      reportContent.shadow_work_integration || '',
      reportContent.seven_laws_integration || '',
      reportContent.gate_analyses?.join(' ') || '',
      reportContent.system_translations || '',
      JSON.stringify(reportContent.fractal_analysis || {}),
      JSON.stringify(reportContent.transformative_insights || {})
    ];

    const allText = sections.join('\n\n');
    const chunks: string[] = [];
    
    for (let i = 0; i < allText.length; i += this.CHUNK_SIZE) {
      chunks.push(allText.slice(i, i + this.CHUNK_SIZE));
    }

    return chunks.filter(chunk => chunk.trim().length > 100); // Filter out tiny chunks
  }

  // Individual dimension extractors (following the 12 core dimensions)
  private async extractIdentityConstructs(chunks: string[], report: any): Promise<DimensionExtractionResult> {
    // Extract core narratives, role archetypes, impostor loops, and hero's journey stage
    const patterns = {
      core_narratives: this.extractPatterns(chunks, ['narrative', 'story', 'identity theme', 'self-concept']),
      role_archetypes: this.extractPatterns(chunks, ['archetype', 'role', 'persona', 'mask']),
      impostor_loops: this.extractPatterns(chunks, ['impostor', 'fraud', 'not enough', 'inadequacy']),
      heros_journey_stage: this.extractSinglePattern(chunks, ['hero', 'journey', 'stage', 'transformation'])
    };

    return {
      dimension_name: 'identity_constructs',
      extracted_data: patterns,
      confidence_score: this.calculateConfidence(patterns),
      source_chunks: chunks.slice(0, 3),
      processing_notes: ['Extracted from core personality synthesis and consciousness mapping']
    };
  }

  private async extractBehavioralTriggers(chunks: string[], report: any): Promise<DimensionExtractionResult> {
    const patterns = {
      energy_dips: this.extractPatterns(chunks, ['energy dip', 'fatigue', 'burnout', 'depletion']),
      avoidance_patterns: this.extractPatterns(chunks, ['avoid', 'resistance', 'procrastination', 'fear']),
      thought_loops: this.extractPatterns(chunks, ['loop', 'rumination', 'obsessive', 'repetitive']),
      activation_rituals: this.extractPatterns(chunks, ['ritual', 'routine', 'activation', 'energize'])
    };

    return {
      dimension_name: 'behavioral_triggers',
      extracted_data: patterns,
      confidence_score: this.calculateConfidence(patterns),
      source_chunks: chunks.slice(0, 3),
      processing_notes: ['Extracted from shadow work and behavioral analysis']
    };
  }

  private async extractExecutionBias(chunks: string[], report: any): Promise<DimensionExtractionResult> {
    const patterns = {
      preferred_style: this.extractSinglePattern(chunks, ['execution', 'style', 'approach', 'method']),
      completion_patterns: this.extractSinglePattern(chunks, ['completion', 'finishing', 'follow-through']),
      momentum_triggers: this.extractPatterns(chunks, ['momentum', 'trigger', 'catalyst', 'motivation']),
      risk_tolerance: this.extractSinglePattern(chunks, ['risk', 'tolerance', 'cautious', 'bold'])
    };

    return {
      dimension_name: 'execution_bias',
      extracted_data: patterns,
      confidence_score: this.calculateConfidence(patterns),
      source_chunks: chunks.slice(0, 3),
      processing_notes: ['Extracted from decision strategy and execution patterns']
    };
  }

  private async extractInternalConflicts(chunks: string[], report: any): Promise<DimensionExtractionResult> {
    const patterns = {
      belief_contradictions: this.extractPatterns(chunks, ['contradiction', 'conflict', 'tension', 'paradox']),
      emotional_double_binds: this.extractPatterns(chunks, ['double bind', 'trapped', 'impossible choice']),
      identity_splits: this.extractPatterns(chunks, ['split', 'fragmented', 'multiple selves', 'internal divide'])
    };

    return {
      dimension_name: 'internal_conflicts',
      extracted_data: patterns,
      confidence_score: this.calculateConfidence(patterns),
      source_chunks: chunks.slice(0, 3),
      processing_notes: ['Extracted from shadow work and internal conflict analysis']
    };
  }

  private async extractSpiritualDimension(chunks: string[], report: any): Promise<DimensionExtractionResult> {
    const patterns = {
      philosophical_filters: this.extractPatterns(chunks, ['philosophy', 'worldview', 'belief system']),
      life_meaning_themes: this.extractPatterns(chunks, ['meaning', 'purpose', 'significance', 'calling']),
      faith_model: this.extractSinglePattern(chunks, ['faith', 'spirituality', 'divine', 'sacred']),
      integration_themes: this.extractPatterns(chunks, ['integration', 'wholeness', 'unity', 'harmony'])
    };

    return {
      dimension_name: 'spiritual_dimension',
      extracted_data: patterns,
      confidence_score: this.calculateConfidence(patterns),
      source_chunks: chunks.slice(0, 3),
      processing_notes: ['Extracted from seven laws integration and transformative insights']
    };
  }

  // Additional extractors follow the same pattern...
  private async extractAdaptiveFeedback(chunks: string[], report: any): Promise<DimensionExtractionResult> {
    const patterns = {
      reflection_style: this.extractPatterns(chunks, ['reflection', 'introspection', 'self-awareness']),
      feedback_receptivity: this.extractSinglePattern(chunks, ['feedback', 'criticism', 'input', 'receptive']),
      change_resistance_profile: this.extractSinglePattern(chunks, ['change', 'resistance', 'adaptation', 'flexibility'])
    };

    return {
      dimension_name: 'adaptive_feedback',
      extracted_data: patterns,
      confidence_score: this.calculateConfidence(patterns),
      source_chunks: chunks.slice(0, 3),
      processing_notes: ['Extracted from consciousness integration and feedback patterns']
    };
  }

  private async extractTemporalBiology(chunks: string[], report: any): Promise<DimensionExtractionResult> {
    const patterns = {
      cognitive_peaks: this.extractPatterns(chunks, ['peak', 'optimal', 'best time', 'high energy']),
      vulnerable_times: this.extractPatterns(chunks, ['vulnerable', 'low', 'difficult time', 'weak']),
      biological_rhythms: this.extractPatterns(chunks, ['rhythm', 'cycle', 'pattern', 'timing'])
    };

    return {
      dimension_name: 'temporal_biology',
      extracted_data: patterns,
      confidence_score: this.calculateConfidence(patterns),
      source_chunks: chunks.slice(0, 3),
      processing_notes: ['Extracted from timing overlays and energy patterns']
    };
  }

  private async extractMetacognitiveBiases(chunks: string[], report: any): Promise<DimensionExtractionResult> {
    const patterns = {
      dominant_biases: this.extractPatterns(chunks, ['bias', 'tendency', 'inclination', 'predisposition']),
      self_judgment_heuristics: this.extractPatterns(chunks, ['judgment', 'evaluation', 'assessment', 'criticism']),
      perception_filters: this.extractPatterns(chunks, ['perception', 'filter', 'lens', 'perspective'])
    };

    return {
      dimension_name: 'metacognitive_biases',
      extracted_data: patterns,
      confidence_score: this.calculateConfidence(patterns),
      source_chunks: chunks.slice(0, 3),
      processing_notes: ['Extracted from cognitive patterns and bias analysis']
    };
  }

  private async extractAttachmentStyle(chunks: string[], report: any): Promise<DimensionExtractionResult> {
    const patterns = {
      pattern: this.extractSinglePattern(chunks, ['attachment', 'relationship', 'connection', 'bonding']),
      repair_tendencies: this.extractPatterns(chunks, ['repair', 'healing', 'reconciliation', 'restoration']),
      authority_archetypes: this.extractPatterns(chunks, ['authority', 'leader', 'guide', 'mentor'])
    };

    return {
      dimension_name: 'attachment_style',
      extracted_data: patterns,
      confidence_score: this.calculateConfidence(patterns),
      source_chunks: chunks.slice(0, 3),
      processing_notes: ['Extracted from relationship patterns and authority dynamics']
    };
  }

  private async extractGoalArchetypes(chunks: string[], report: any): Promise<DimensionExtractionResult> {
    const patterns = {
      orientation: this.extractPatterns(chunks, ['goal', 'objective', 'target', 'aim']),
      motivation_structure: this.extractSinglePattern(chunks, ['motivation', 'drive', 'incentive', 'inspiration']),
      friction_points: this.extractPatterns(chunks, ['friction', 'obstacle', 'challenge', 'barrier'])
    };

    return {
      dimension_name: 'goal_archetypes',
      extracted_data: patterns,
      confidence_score: this.calculateConfidence(patterns),
      source_chunks: chunks.slice(0, 3),
      processing_notes: ['Extracted from goal patterns and motivation analysis']
    };
  }

  private async extractCrisisHandling(chunks: string[], report: any): Promise<DimensionExtractionResult> {
    const patterns = {
      default_response: this.extractSinglePattern(chunks, ['crisis', 'emergency', 'stress response', 'pressure']),
      bounce_back_rituals: this.extractPatterns(chunks, ['recovery', 'bounce back', 'resilience', 'restoration']),
      threshold_triggers: this.extractPatterns(chunks, ['threshold', 'trigger', 'breaking point', 'limit'])
    };

    return {
      dimension_name: 'crisis_handling',
      extracted_data: patterns,
      confidence_score: this.calculateConfidence(patterns),
      source_chunks: chunks.slice(0, 3),
      processing_notes: ['Extracted from crisis patterns and stress response analysis']
    };
  }

  private async extractIdentityFlexibility(chunks: string[], report: any): Promise<DimensionExtractionResult> {
    const patterns = {
      narrative_rigidity: this.extractSinglePattern(chunks, ['rigid', 'flexible', 'adaptable', 'fixed']),
      reinvention_patterns: this.extractPatterns(chunks, ['reinvention', 'transformation', 'evolution', 'change']),
      fragmentation_signs: this.extractPatterns(chunks, ['fragmentation', 'scattered', 'disconnected', 'split'])
    };

    return {
      dimension_name: 'identity_flexibility',
      extracted_data: patterns,
      confidence_score: this.calculateConfidence(patterns),
      source_chunks: chunks.slice(0, 3),
      processing_notes: ['Extracted from identity evolution and flexibility patterns']
    };
  }

  private async extractLinguisticFingerprint(chunks: string[], report: any): Promise<DimensionExtractionResult> {
    const patterns = {
      signature_metaphors: this.extractPatterns(chunks, ['metaphor', 'analogy', 'comparison', 'like']),
      motivational_verbs: this.extractPatterns(chunks, ['action', 'verb', 'movement', 'doing']),
      emotional_syntax: this.extractPatterns(chunks, ['feeling', 'emotion', 'sentiment', 'mood'])
    };

    return {
      dimension_name: 'linguistic_fingerprint',
      extracted_data: patterns,
      confidence_score: this.calculateConfidence(patterns),
      source_chunks: chunks.slice(0, 3),
      processing_notes: ['Extracted from language patterns and communication style']
    };
  }

  // Helper methods for pattern extraction
  private extractPatterns(chunks: string[], keywords: string[]): string[] {
    const patterns: string[] = [];
    
    chunks.forEach(chunk => {
      keywords.forEach(keyword => {
        const sentences = chunk.split(/[.!?]+/);
        sentences.forEach(sentence => {
          if (sentence.toLowerCase().includes(keyword.toLowerCase()) && sentence.trim().length > 20) {
            patterns.push(sentence.trim());
          }
        });
      });
    });

    // Return unique patterns, limited to top 5 most relevant
    return [...new Set(patterns)].slice(0, 5);
  }

  private extractSinglePattern(chunks: string[], keywords: string[]): string {
    const patterns = this.extractPatterns(chunks, keywords);
    return patterns[0] || '';
  }

  private calculateConfidence(data: any): number {
    // Simple confidence calculation based on data completeness
    const entries = Object.values(data).flat();
    const filledEntries = entries.filter(entry => entry && String(entry).trim().length > 0);
    return Math.min(0.95, filledEntries.length / Math.max(entries.length, 1));
  }
}

// Export singleton instance for service access
export const hermeticIntelligenceExtractor = new HermeticIntelligenceExtractor();