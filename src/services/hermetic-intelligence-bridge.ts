/**
 * Hermetic Intelligence Bridge Service
 * 
 * PILLAR I: Preserve Core Intelligence - Bridges existing Hermetic 2.0 data to companion system
 * PILLAR II: Ground Truth - Real hermetic intelligence data, no simulations
 * PILLAR III: Intentional Craft - Intelligent context aggregation for companion conversations
 * 
 * Connects the full 13-dimension Hermetic Intelligence to the companion conversational system
 * without disrupting existing pathways or functionality.
 */

import { supabase } from '@/integrations/supabase/client';
import { HermeticStructuredIntelligence } from '@/types/hermetic-intelligence';
import { semanticMemoryService } from './semantic-memory-service';
import { hermeticReportAccessService } from './hermetic-report-access-service';

export interface HermeticCompanionContext {
  // Core Intelligence Dimensions (13 analysts)
  structuredIntelligence: HermeticStructuredIntelligence | null;
  
  // Semantic Blueprint Context
  semanticBlueprintChunks: Array<{
    content: string;
    facet: string;
    confidence: number;
    similarity?: number;
  }>;
  
  // Full Hermetic 2.0 Report Access (NEW - ADDITIVE)
  fullHermeticReport: Record<string, any>;
  relevantReportSections: string[];
  reportMetadata: {
    totalSections: number;
    contentLength: number;
    version: string;
    generatedAt: string;
  };
  
  // Aggregated Personality Insights
  personalityContext: {
    coreNarratives: string[];
    dominantPatterns: string[];
    executionStyle: string;
    spiritualFramework: string;
    conflictAreas: string[];
    adaptationStyle: string[];
  };
  
  // Intelligence Metadata
  extractionMetadata: {
    confidence: number;
    version: string;
    dimensionsExtracted: number;
    lastUpdate: string;
  };
}

class HermeticIntelligenceBridge {
  private static instance: HermeticIntelligenceBridge;
  private cache: Map<string, { data: HermeticCompanionContext; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): HermeticIntelligenceBridge {
    if (!HermeticIntelligenceBridge.instance) {
      HermeticIntelligenceBridge.instance = new HermeticIntelligenceBridge();
    }
    return HermeticIntelligenceBridge.instance;
  }

  /**
   * CORE METHOD: Get full hermetic context for companion conversations
   * PRINCIPLE #6: Respect Critical Data Pathways - Uses existing hermetic intelligence service
   */
  async getHermeticCompanionContext(
    userId: string, 
    userMessage?: string,
    maxSemanticChunks: number = 5
  ): Promise<HermeticCompanionContext> {
    try {
      console.log('🧠 HERMETIC BRIDGE: Loading full intelligence context for companion', { userId });
      
      // Check cache first
      const cached = this.cache.get(userId);
      if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
        console.log('✅ HERMETIC BRIDGE: Using cached context');
        
        // If we have a message, get fresh semantic chunks but keep cached structure
        if (userMessage) {
          const semanticChunks = await this.getSemanticBlueprintChunks(userId, userMessage, maxSemanticChunks);
          return {
            ...cached.data,
            semanticBlueprintChunks: semanticChunks
          };
        }
        
        return cached.data;
      }

      // Load fresh hermetic intelligence data AND full report context
      const [structuredIntelligence, semanticChunks, fullReportSections] = await Promise.all([
        this.loadStructuredIntelligence(userId),
        userMessage ? this.getSemanticBlueprintChunks(userId, userMessage, maxSemanticChunks) : [],
        this.getFullReportContext(userId, userMessage)
      ]);

      const context: HermeticCompanionContext = {
        structuredIntelligence,
        semanticBlueprintChunks: semanticChunks,
        // NEW: Full report access
        fullHermeticReport: fullReportSections.sections,
        relevantReportSections: Object.keys(fullReportSections.sections),
        reportMetadata: fullReportSections.metadata,
        personalityContext: this.aggregatePersonalityContext(structuredIntelligence),
        extractionMetadata: this.extractMetadata(structuredIntelligence)
      };

      // Cache the result
      this.cache.set(userId, { data: context, timestamp: Date.now() });
      
      console.log('✅ HERMETIC BRIDGE: Context loaded successfully', {
        hasStructuredIntelligence: !!structuredIntelligence,
        dimensionsAvailable: structuredIntelligence ? Object.keys(structuredIntelligence).length : 0,
        semanticChunks: semanticChunks.length,
        personalityInsights: context.personalityContext.coreNarratives.length,
        // NEW: Full report metrics
        fullReportSections: context.relevantReportSections.length,
        reportContentLength: context.reportMetadata.contentLength,
        reportVersion: context.reportMetadata.version
      });

      return context;
    } catch (error) {
      console.error('❌ HERMETIC BRIDGE: Failed to load context:', error);
      
      // PRINCIPLE #3: Surface errors clearly, no silent fallbacks
      return {
        structuredIntelligence: null,
        semanticBlueprintChunks: [],
        // NEW: Empty full report context on error
        fullHermeticReport: {},
        relevantReportSections: [],
        reportMetadata: {
          totalSections: 0,
          contentLength: 0,
          version: 'error',
          generatedAt: new Date().toISOString()
        },
        personalityContext: {
          coreNarratives: [],
          dominantPatterns: [],
          executionStyle: 'Unknown - Error loading intelligence',
          spiritualFramework: 'Unknown - Error loading intelligence',
          conflictAreas: ['Intelligence extraction error'],
          adaptationStyle: []
        },
        extractionMetadata: {
          confidence: 0,
          version: 'error',
          dimensionsExtracted: 0,
          lastUpdate: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Load structured intelligence from hermetic processing
   * PRINCIPLE #2: No hardcoded data - real database query
   */
  private async loadStructuredIntelligence(userId: string): Promise<HermeticStructuredIntelligence | null> {
    try {
    const { data, error } = await supabase
      .from('personality_reports')
      .select('id, report_content, blueprint_version, generated_at, updated_at')
      .eq('user_id', userId)
      .not('report_content', 'is', null)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

      if (error) {
        console.error('❌ HERMETIC BRIDGE: Database query failed:', error);
        return null;
      }

      const reportContent = data.report_content as any;
      if (!data || !reportContent?.structured_intelligence) {
        console.log('⚠️ HERMETIC BRIDGE: No structured intelligence found for user');
        return null;
      }

      const intelligence = reportContent.structured_intelligence;

      console.log('✅ HERMETIC BRIDGE: Structured intelligence loaded', {
        reportId: data.id,
        confidence: 1.0,
        version: data.blueprint_version,
        dimensions: Object.keys(intelligence).length
      });

      // Convert to HermeticStructuredIntelligence format
      return {
        id: data.id,
        user_id: userId,
        personality_report_id: data.id,
        identity_constructs: intelligence.identity_constructs as any,
        behavioral_triggers: intelligence.behavioral_triggers as any,
        execution_bias: intelligence.execution_bias as any,
        internal_conflicts: intelligence.internal_conflicts as any,
        spiritual_dimension: intelligence.spiritual_dimension as any,
        adaptive_feedback: intelligence.adaptive_feedback as any,
        temporal_biology: intelligence.temporal_biology as any,
        metacognitive_biases: intelligence.metacognitive_biases as any,
        attachment_style: intelligence.attachment_style as any,
        goal_archetypes: intelligence.goal_archetypes as any,
        crisis_handling: intelligence.crisis_handling as any,
        identity_flexibility: intelligence.identity_flexibility as any,
        linguistic_fingerprint: intelligence.linguistic_fingerprint as any,
        extraction_confidence: 1.0, // Hermetic 2.0 is full report
        extraction_version: data.blueprint_version,
        processing_notes: { source: 'personality_reports' } as any,
        created_at: data.generated_at,
        updated_at: data.updated_at || data.generated_at
      } as HermeticStructuredIntelligence;
    } catch (error) {
      console.error('❌ HERMETIC BRIDGE: Error loading structured intelligence:', error);
      return null;
    }
  }

  /**
   * Get semantic blueprint chunks relevant to the user's message
   * PRINCIPLE #6: Respect existing semantic memory pathways
   */
  private async getSemanticBlueprintChunks(
    userId: string, 
    userMessage: string, 
    maxChunks: number
  ): Promise<Array<{ content: string; facet: string; confidence: number; similarity?: number }>> {
    try {
      // Use existing blueprint embedding table for semantic search
      const { data, error } = await supabase.functions.invoke('semantic-blueprint-search', {
        body: {
          userId,
          query: userMessage,
          maxResults: maxChunks,
          similarityThreshold: 0.6
        }
      });

      if (error) {
        console.warn('⚠️ HERMETIC BRIDGE: Semantic blueprint search failed:', error);
        return [];
      }

      const chunks = (data?.chunks || []).map((chunk: any) => ({
        content: chunk.chunk_content,
        facet: chunk.facet || 'general',
        confidence: chunk.confidence || 0.8,
        similarity: chunk.similarity
      }));

      console.log('✅ HERMETIC BRIDGE: Semantic blueprint chunks retrieved', {
        chunksFound: chunks.length,
        avgSimilarity: chunks.reduce((sum: number, c: any) => sum + (c.similarity || 0), 0) / chunks.length
      });

      return chunks;
    } catch (error) {
      console.warn('⚠️ HERMETIC BRIDGE: Semantic chunk retrieval error:', error);
      return [];
    }
  }

  /**
   * Aggregate personality insights from all 13 intelligence dimensions
   * PRINCIPLE #2: Ground truth - extract real patterns from actual data
   */
  private aggregatePersonalityContext(intelligence: HermeticStructuredIntelligence | null): HermeticCompanionContext['personalityContext'] {
    if (!intelligence) {
      return {
        coreNarratives: [],
        dominantPatterns: [],
        executionStyle: 'Unknown - No intelligence data',
        spiritualFramework: 'Unknown - No intelligence data',
        conflictAreas: [],
        adaptationStyle: []
      };
    }

    try {
      // Extract core narratives from identity constructs
      const coreNarratives = [
        ...(intelligence.identity_constructs?.core_narratives || []),
        ...(intelligence.identity_constructs?.role_archetypes || [])
      ].slice(0, 5);

      // Extract dominant behavioral patterns
      const dominantPatterns = [
        ...(intelligence.behavioral_triggers?.activation_rituals || []),
        ...(intelligence.metacognitive_biases?.dominant_biases || [])
      ].slice(0, 4);

      // Extract execution style
      const executionStyle = intelligence.execution_bias?.preferred_style || 'Adaptive';

      // Extract spiritual framework
      const spiritualFramework = intelligence.spiritual_dimension?.faith_model || 'Seeking';

      // Extract conflict areas
      const conflictAreas = [
        ...(intelligence.internal_conflicts?.belief_contradictions || []),
        ...(intelligence.internal_conflicts?.emotional_double_binds || [])
      ].slice(0, 3);

      // Extract adaptation style
      const adaptationStyle = [
        ...(intelligence.adaptive_feedback?.reflection_style || []),
        intelligence.adaptive_feedback?.change_resistance_profile || ''
      ].filter(Boolean).slice(0, 3);

      return {
        coreNarratives,
        dominantPatterns,
        executionStyle,
        spiritualFramework,
        conflictAreas,
        adaptationStyle
      };
    } catch (error) {
      console.error('❌ HERMETIC BRIDGE: Error aggregating personality context:', error);
      return {
        coreNarratives: ['Error extracting narratives'],
        dominantPatterns: ['Error extracting patterns'],
        executionStyle: 'Error - Unable to determine',
        spiritualFramework: 'Error - Unable to determine',
        conflictAreas: ['Error extracting conflicts'],
        adaptationStyle: ['Error extracting adaptation style']
      };
    }
  }

  /**
   * Extract metadata about the intelligence extraction
   */
  private extractMetadata(intelligence: HermeticStructuredIntelligence | null): HermeticCompanionContext['extractionMetadata'] {
    if (!intelligence) {
      return {
        confidence: 0,
        version: 'none',
        dimensionsExtracted: 0,
        lastUpdate: 'Never'
      };
    }

    // Count non-empty dimensions
    const dimensionKeys = [
      'identity_constructs', 'behavioral_triggers', 'execution_bias', 'internal_conflicts',
      'spiritual_dimension', 'adaptive_feedback', 'temporal_biology', 'metacognitive_biases',
      'attachment_style', 'goal_archetypes', 'crisis_handling', 'identity_flexibility',
      'linguistic_fingerprint'
    ];

    const extractedDimensions = dimensionKeys.filter(key => {
      const dimension = intelligence[key as keyof HermeticStructuredIntelligence];
      return dimension && typeof dimension === 'object' && Object.keys(dimension).length > 0;
    }).length;

    return {
      confidence: intelligence.extraction_confidence || 0,
      version: intelligence.extraction_version || '2.0',
      dimensionsExtracted: extractedDimensions,
      lastUpdate: intelligence.updated_at || intelligence.created_at || 'Unknown'
    };
  }

  /**
   * Get full report context with intelligent section selection
   * NEW METHOD - ADDITIVE ENHANCEMENT
   */
  private async getFullReportContext(userId: string, userMessage?: string): Promise<{
    sections: Record<string, any>;
    metadata: { totalSections: number; contentLength: number; version: string; generatedAt: string };
  }> {
    try {
      // Detect conversation topic from user message
      const conversationTopic = this.detectConversationTopic(userMessage);
      
      // Get relevant sections from full report
      const relevantSections = await hermeticReportAccessService.getRelevantSections(userId, {
        conversationTopic,
        maxTokens: 6000, // Reasonable token budget for companion context
        includeMetadata: true
      });

      // Convert to simple content format for companion
      const sections: Record<string, any> = {};
      let totalContentLength = 0;

      Object.entries(relevantSections).forEach(([sectionName, sectionData]) => {
        sections[sectionName] = sectionData.content;
        totalContentLength += sectionData.content.length;
      });

      console.log('✅ HERMETIC BRIDGE: Full report context prepared', {
        sectionsSelected: Object.keys(sections).length,
        contentLength: totalContentLength,
        conversationTopic
      });

      return {
        sections,
        metadata: {
          totalSections: Object.keys(sections).length,
          contentLength: totalContentLength,
          version: '2.0',
          generatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ Error getting full report context:', error);
      return {
        sections: {},
        metadata: {
          totalSections: 0,
          contentLength: 0,
          version: 'error',
          generatedAt: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Detect conversation topic from user message for intelligent section selection
   * NEW METHOD - ADDITIVE ENHANCEMENT
   */
  private detectConversationTopic(userMessage?: string): string | undefined {
    if (!userMessage) return undefined;

    const message = userMessage.toLowerCase();
    
    // Topic detection keywords
    if (message.includes('relationship') || message.includes('love') || message.includes('dating') || message.includes('partner')) {
      return 'relationship';
    }
    if (message.includes('purpose') || message.includes('calling') || message.includes('mission') || message.includes('career')) {
      return 'purpose';
    }
    if (message.includes('spiritual') || message.includes('consciousness') || message.includes('awakening') || message.includes('meditation')) {
      return 'spirituality';
    }
    if (message.includes('growth') || message.includes('develop') || message.includes('evolve') || message.includes('improve')) {
      return 'growth';
    }
    if (message.includes('decision') || message.includes('choose') || message.includes('choice') || message.includes('decide')) {
      return 'decisions';
    }
    if (message.includes('energy') || message.includes('timing') || message.includes('when') || message.includes('optimal')) {
      return 'energy';
    }
    if (message.includes('pattern') || message.includes('behavior') || message.includes('tendency') || message.includes('habit')) {
      return 'patterns';
    }
    if (message.includes('shadow') || message.includes('struggle') || message.includes('challenge') || message.includes('weakness')) {
      return 'shadow';
    }

    return undefined;
  }

  /**
   * Clear cache for a specific user (e.g., after new intelligence extraction)
   */
  clearCache(userId: string): void {
    this.cache.delete(userId);
    // Also clear report access service cache
    hermeticReportAccessService.clearCache(userId);
    console.log('🗑️ HERMETIC BRIDGE: Cache cleared for user:', userId);
  }

  /**
   * Clear all cached data
   */
  clearAllCache(): void {
    this.cache.clear();
    console.log('🗑️ HERMETIC BRIDGE: All cache cleared');
  }
}

export const hermeticIntelligenceBridge = HermeticIntelligenceBridge.getInstance();
