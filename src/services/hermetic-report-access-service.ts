/**
 * Hermetic Report Access Service
 * 
 * PILLAR I: Preserve Core Intelligence - Provides access to full Hermetic 2.0 reports
 * PILLAR II: Ground Truth - Real report data, no simulations  
 * PILLAR III: Intentional Craft - Intelligent section selection for context budgeting
 * 
 * Gives the companion access to the full 60-100K character Hermetic 2.0 report
 * with all 18 sections instead of just fragmented intelligence summaries.
 */

import { supabase } from '@/integrations/supabase/client';

export interface HermeticReportSection {
  content: string;
  relevanceScore: number;
  tokenCount: number;
}

export interface HermeticFullReport {
  id: string;
  userId: string;
  reportSections: Record<string, any>;
  metadata: {
    version: string;
    totalSections: number;
    contentLength: number;
    generatedAt: string;
  };
}

export interface ReportContextRequest {
  conversationTopic?: string;
  maxTokens?: number;
  prioritySections?: string[];
  includeMetadata?: boolean;
}

class HermeticReportAccessService {
  private static instance: HermeticReportAccessService;
  private cache: Map<string, { report: HermeticFullReport; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  // Section relevance mapping for intelligent selection
  private readonly TOPIC_SECTION_MAP = {
    relationship: ['relationship_style', 'attachment_style', 'conflict_resolution'],
    purpose: ['life_path_purpose', 'integrated_summary', 'practical_activation_framework'],
    career: ['life_path_purpose', 'practical_activation_framework', 'decision_making_style'],
    spirituality: ['consciousness_integration_map', 'seven_laws_integration', 'spiritual_development'],
    growth: ['shadow_work_integration', 'consciousness_integration_map', 'growth_edges'],
    decisions: ['decision_making_style', 'core_personality_pattern', 'practical_activation_framework'],
    energy: ['current_energy_timing', 'hermetic_fractal_analysis', 'optimal_timing'],
    patterns: ['core_personality_pattern', 'hermetic_fractal_analysis', 'system_translations'],
    shadow: ['shadow_work_integration', 'internal_conflicts', 'growth_edges'],
    timing: ['current_energy_timing', 'optimal_timing', 'energy_patterns']
  };

  // Section priority weights (higher = more important)
  private readonly SECTION_PRIORITY = {
    integrated_summary: 10,
    life_path_purpose: 9,
    consciousness_integration_map: 8,
    core_personality_pattern: 8,
    decision_making_style: 7,
    relationship_style: 7,
    shadow_work_integration: 6,
    practical_activation_framework: 6,
    current_energy_timing: 5,
    hermetic_fractal_analysis: 5,
    seven_laws_integration: 4,
    system_translations: 3,
    gate_analyses: 3,
    comprehensive_overview: 2
  };

  static getInstance(): HermeticReportAccessService {
    if (!HermeticReportAccessService.instance) {
      HermeticReportAccessService.instance = new HermeticReportAccessService();
    }
    return HermeticReportAccessService.instance;
  }

  /**
   * Get relevant sections from the full Hermetic 2.0 report
   * PRINCIPLE #2: Ground truth - real report data with intelligent filtering
   */
  async getRelevantSections(
    userId: string, 
    request: ReportContextRequest = {}
  ): Promise<Record<string, HermeticReportSection>> {
    try {
      console.log('📖 HERMETIC REPORT ACCESS: Getting relevant sections', { userId, request });

      // Get full report (cached or fresh)
      const fullReport = await this.getFullReport(userId);
      if (!fullReport) {
        console.log('⚠️ No Hermetic 2.0 report found for user');
        return {};
      }

      // Determine relevant sections based on conversation topic
      const relevantSectionNames = this.selectRelevantSections(
        request.conversationTopic,
        request.prioritySections
      );

      console.log('🎯 SECTION SELECTION: Selected sections', {
        topic: request.conversationTopic,
        selectedSections: relevantSectionNames,
        totalAvailable: Object.keys(fullReport.reportSections).length
      });

      // Extract and score sections
      const relevantSections: Record<string, HermeticReportSection> = {};
      let totalTokens = 0;
      const maxTokens = request.maxTokens || 8000;

      // Sort sections by priority and relevance
      const sortedSections = relevantSectionNames.sort((a, b) => {
        const priorityA = this.SECTION_PRIORITY[a as keyof typeof this.SECTION_PRIORITY] || 1;
        const priorityB = this.SECTION_PRIORITY[b as keyof typeof this.SECTION_PRIORITY] || 1;
        return priorityB - priorityA;
      });

      for (const sectionName of sortedSections) {
        const sectionData = fullReport.reportSections[sectionName];
        if (!sectionData) continue;

        const content = this.extractSectionContent(sectionData);
        const tokenCount = this.estimateTokenCount(content);

        // Check token budget
        if (totalTokens + tokenCount > maxTokens) {
          console.log(`🚫 Token budget exceeded, skipping ${sectionName}`);
          break;
        }

        relevantSections[sectionName] = {
          content,
          relevanceScore: this.calculateRelevanceScore(sectionName, request.conversationTopic),
          tokenCount
        };

        totalTokens += tokenCount;
      }

      console.log('✅ HERMETIC REPORT ACCESS: Sections prepared', {
        sectionsSelected: Object.keys(relevantSections).length,
        totalTokens,
        tokenBudget: maxTokens
      });

      return relevantSections;
    } catch (error) {
      console.error('❌ HERMETIC REPORT ACCESS: Error getting relevant sections:', error);
      return {};
    }
  }

  /**
   * Get the full Hermetic 2.0 report for a user
   * PRINCIPLE #6: Respect existing data pathways
   */
  private async getFullReport(userId: string): Promise<HermeticFullReport | null> {
    try {
      // Check cache first
      const cached = this.cache.get(userId);
      if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
        console.log('✅ Using cached Hermetic report');
        return cached.report;
      }

      // Fetch from database
      const { data, error } = await supabase
        .from('personality_reports')
        .select('*')
        .eq('user_id', userId)
        .eq('blueprint_version', '2.0') // Hermetic reports use version 2.0
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ Database query failed:', error);
        return null;
      }

      if (!data) {
        console.log('⚠️ No Hermetic 2.0 report found for user');
        return null;
      }

      // Parse report content
      let reportSections: Record<string, any> = {};
      try {
        if (typeof data.report_content === 'string') {
          reportSections = JSON.parse(data.report_content);
        } else if (typeof data.report_content === 'object') {
          reportSections = data.report_content;
        }
      } catch (parseError) {
        console.error('❌ Error parsing report content:', parseError);
        return null;
      }

      const fullReport: HermeticFullReport = {
        id: data.id,
        userId: data.user_id,
        reportSections,
        metadata: {
          version: data.blueprint_version,
          totalSections: Object.keys(reportSections).length,
          contentLength: JSON.stringify(reportSections).length,
          generatedAt: data.generated_at
        }
      };

      // Cache the result
      this.cache.set(userId, { report: fullReport, timestamp: Date.now() });

      console.log('✅ HERMETIC REPORT ACCESS: Full report loaded', {
        reportId: fullReport.id,
        totalSections: fullReport.metadata.totalSections,
        contentLength: fullReport.metadata.contentLength,
        version: fullReport.metadata.version
      });

      return fullReport;
    } catch (error) {
      console.error('❌ Error fetching full Hermetic report:', error);
      return null;
    }
  }

  /**
   * Select relevant sections based on conversation topic
   */
  private selectRelevantSections(
    conversationTopic?: string,
    prioritySections?: string[]
  ): string[] {
    // Start with priority sections if provided
    let relevantSections = new Set(prioritySections || []);

    // Add topic-based sections
    if (conversationTopic) {
      const topic = conversationTopic.toLowerCase();
      
      // Check topic mapping
      for (const [topicKey, sections] of Object.entries(this.TOPIC_SECTION_MAP)) {
        if (topic.includes(topicKey)) {
          sections.forEach(section => relevantSections.add(section));
        }
      }

      // Keyword-based selection
      if (topic.includes('relationship') || topic.includes('love') || topic.includes('partner')) {
        this.TOPIC_SECTION_MAP.relationship.forEach(s => relevantSections.add(s));
      }
      if (topic.includes('purpose') || topic.includes('calling') || topic.includes('mission')) {
        this.TOPIC_SECTION_MAP.purpose.forEach(s => relevantSections.add(s));
      }
      if (topic.includes('spiritual') || topic.includes('consciousness') || topic.includes('awakening')) {
        this.TOPIC_SECTION_MAP.spirituality.forEach(s => relevantSections.add(s));
      }
    }

    // Always include core sections if no specific topic
    if (relevantSections.size === 0) {
      relevantSections.add('integrated_summary');
      relevantSections.add('life_path_purpose');
      relevantSections.add('core_personality_pattern');
      relevantSections.add('consciousness_integration_map');
    }

    return Array.from(relevantSections);
  }

  /**
   * Extract readable content from section data
   */
  private extractSectionContent(sectionData: any): string {
    if (typeof sectionData === 'string') {
      return sectionData;
    }

    if (typeof sectionData === 'object' && sectionData !== null) {
      // Look for common content fields
      if (sectionData.content) return sectionData.content;
      if (sectionData.text) return sectionData.text;
      if (sectionData.description) return sectionData.description;
      if (sectionData.summary) return sectionData.summary;
      
      // If it's a complex object, stringify the important parts
      return JSON.stringify(sectionData, null, 2);
    }

    return String(sectionData);
  }

  /**
   * Calculate relevance score for a section
   */
  private calculateRelevanceScore(sectionName: string, conversationTopic?: string): number {
    let score = this.SECTION_PRIORITY[sectionName as keyof typeof this.SECTION_PRIORITY] || 1;

    if (conversationTopic) {
      const topic = conversationTopic.toLowerCase();
      
      // Boost score for topic-relevant sections
      for (const [topicKey, sections] of Object.entries(this.TOPIC_SECTION_MAP)) {
        if (topic.includes(topicKey) && sections.includes(sectionName)) {
          score += 5;
          break;
        }
      }
    }

    return score;
  }

  /**
   * Estimate token count for content
   */
  private estimateTokenCount(content: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(content.length / 4);
  }

  /**
   * Clear cache for a user
   */
  clearCache(userId: string): void {
    this.cache.delete(userId);
    console.log('🗑️ HERMETIC REPORT ACCESS: Cache cleared for user:', userId);
  }

  /**
   * Get available sections for a user's report
   */
  async getAvailableSections(userId: string): Promise<string[]> {
    const fullReport = await this.getFullReport(userId);
    return fullReport ? Object.keys(fullReport.reportSections) : [];
  }
}

export const hermeticReportAccessService = HermeticReportAccessService.getInstance();