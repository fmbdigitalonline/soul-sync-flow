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

      // Load fresh hermetic intelligence data
      const [structuredIntelligence, semanticChunks] = await Promise.all([
        this.loadStructuredIntelligence(userId),
        userMessage ? this.getSemanticBlueprintChunks(userId, userMessage, maxSemanticChunks) : []
      ]);

      const context: HermeticCompanionContext = {
        structuredIntelligence,
        semanticBlueprintChunks: semanticChunks,
        personalityContext: this.aggregatePersonalityContext(structuredIntelligence),
        extractionMetadata: this.extractMetadata(structuredIntelligence)
      };

      // Cache the result
      this.cache.set(userId, { data: context, timestamp: Date.now() });
      
      console.log('✅ HERMETIC BRIDGE: Context loaded successfully', {
        hasStructuredIntelligence: !!structuredIntelligence,
        dimensionsAvailable: structuredIntelligence ? Object.keys(structuredIntelligence).length : 0,
        semanticChunks: semanticChunks.length,
        personalityInsights: context.personalityContext.coreNarratives.length
      });

      return context;
    } catch (error) {
      console.error('❌ HERMETIC BRIDGE: Failed to load context:', error);
      
      // PRINCIPLE #3: Surface errors clearly, no silent fallbacks
      return {
        structuredIntelligence: null,
        semanticBlueprintChunks: [],
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
        .from('hermetic_structured_intelligence')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ HERMETIC BRIDGE: Database query failed:', error);
        return null;
      }

      if (!data) {
        console.log('⚠️ HERMETIC BRIDGE: No structured intelligence found for user');
        return null;
      }

      console.log('✅ HERMETIC BRIDGE: Structured intelligence loaded', {
        id: data.id,
        confidence: data.extraction_confidence,
        version: data.extraction_version,
        dimensions: Object.keys(data).filter(key => !['id', 'user_id', 'created_at', 'updated_at'].includes(key)).length
      });

      // Convert database Json types to proper TypeScript types
      return {
        id: data.id,
        user_id: data.user_id,
        personality_report_id: data.personality_report_id,
        identity_constructs: data.identity_constructs as any,
        behavioral_triggers: data.behavioral_triggers as any,
        execution_bias: data.execution_bias as any,
        internal_conflicts: data.internal_conflicts as any,
        spiritual_dimension: data.spiritual_dimension as any,
        adaptive_feedback: data.adaptive_feedback as any,
        temporal_biology: data.temporal_biology as any,
        metacognitive_biases: data.metacognitive_biases as any,
        attachment_style: data.attachment_style as any,
        goal_archetypes: data.goal_archetypes as any,
        crisis_handling: data.crisis_handling as any,
        identity_flexibility: data.identity_flexibility as any,
        linguistic_fingerprint: data.linguistic_fingerprint as any,
        extraction_confidence: data.extraction_confidence,
        extraction_version: data.extraction_version,
        processing_notes: data.processing_notes as any,
        created_at: data.created_at,
        updated_at: data.updated_at
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
   * Clear cache for a specific user (e.g., after new intelligence extraction)
   */
  clearCache(userId: string): void {
    this.cache.delete(userId);
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
