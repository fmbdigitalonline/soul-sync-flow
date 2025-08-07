import { supabase } from '@/integrations/supabase/client';
import type { HermeticStructuredIntelligence } from '@/types/hermetic-intelligence';

/**
 * Hermetic Intelligence Service
 * 
 * Integration layer for FloatingOrb and other agents to access structured psychological intelligence.
 * 
 * Following SoulSync Principles:
 * - Pillar I: Preserves existing systems while adding structured access
 * - Pillar II: Operates on ground truth from extracted intelligence
 * - Pillar III: Provides sub-200ms query performance for real-time agent access
 */
export class HermeticIntelligenceService {
  
  /**
   * Get structured intelligence for a user
   */
  async getStructuredIntelligence(userId: string): Promise<{ 
    success: boolean; 
    intelligence?: HermeticStructuredIntelligence; 
    error?: string 
  }> {
    try {
      console.log('🧠 HERMETIC INTELLIGENCE SERVICE: Fetching structured intelligence for user:', userId);

      const { data, error } = await supabase
        .from('hermetic_structured_intelligence')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found
          return { 
            success: false, 
            error: 'No structured intelligence found. Please generate hermetic report first.' 
          };
        }
        throw error;
      }

      console.log('✅ HERMETIC INTELLIGENCE SERVICE: Successfully retrieved structured intelligence');
      return { success: true, intelligence: data as unknown as HermeticStructuredIntelligence };

    } catch (error) {
      console.error('❌ HERMETIC INTELLIGENCE SERVICE: Failed to fetch intelligence:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch structured intelligence' 
      };
    }
  }

  /**
   * Get specific psychological dimension for a user
   */
  async getDimension(userId: string, dimension: keyof Omit<HermeticStructuredIntelligence, 'id' | 'user_id' | 'personality_report_id' | 'extraction_confidence' | 'extraction_version' | 'processing_notes' | 'created_at' | 'updated_at'>): Promise<{
    success: boolean;
    dimension_data?: any;
    confidence?: number;
    error?: string;
  }> {
    try {
      console.log(`🎯 HERMETIC INTELLIGENCE SERVICE: Fetching dimension '${dimension}' for user:`, userId);

      const { data, error } = await supabase
        .from('hermetic_structured_intelligence')
        .select(`${dimension}, extraction_confidence`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { 
            success: false, 
            error: 'No structured intelligence found for this dimension' 
          };
        }
        throw error;
      }

      console.log(`✅ HERMETIC INTELLIGENCE SERVICE: Successfully retrieved dimension '${dimension}'`);
      return { 
        success: true, 
        dimension_data: data[dimension],
        confidence: (data as any).extraction_confidence
      };

    } catch (error) {
      console.error(`❌ HERMETIC INTELLIGENCE SERVICE: Failed to fetch dimension '${dimension}':`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch dimension data' 
      };
    }
  }

  /**
   * Get multiple dimensions at once for efficient FloatingOrb queries
   */
  async getMultipleDimensions(userId: string, dimensions: string[]): Promise<{
    success: boolean;
    dimensions_data?: Record<string, any>;
    confidence?: number;
    error?: string;
  }> {
    try {
      console.log(`🔍 HERMETIC INTELLIGENCE SERVICE: Fetching multiple dimensions for user:`, userId, dimensions);

      const selectFields = [...dimensions, 'extraction_confidence'].join(', ');
      
      const { data, error } = await supabase
        .from('hermetic_structured_intelligence')
        .select(selectFields)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { 
            success: false, 
            error: 'No structured intelligence found for these dimensions' 
          };
        }
        throw error;
      }

      // Extract requested dimensions
      const dimensionsData: Record<string, any> = {};
      dimensions.forEach(dim => {
        dimensionsData[dim] = data[dim];
      });

      console.log(`✅ HERMETIC INTELLIGENCE SERVICE: Successfully retrieved ${dimensions.length} dimensions`);
      return { 
        success: true, 
        dimensions_data: dimensionsData,
        confidence: (data as any).extraction_confidence
      };

    } catch (error) {
      console.error('❌ HERMETIC INTELLIGENCE SERVICE: Failed to fetch multiple dimensions:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch dimensions data' 
      };
    }
  }

  /**
   * Search for patterns across all dimensions
   */
  async searchPatterns(userId: string, searchQuery: string): Promise<{
    success: boolean;
    matches?: Array<{ dimension: string; field: string; content: string; relevance: number }>;
    error?: string;
  }> {
    try {
      console.log(`🔎 HERMETIC INTELLIGENCE SERVICE: Searching patterns for user:`, userId, 'query:', searchQuery);

      const { data, error } = await supabase
        .from('hermetic_structured_intelligence')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { 
            success: false, 
            error: 'No structured intelligence found for pattern search' 
          };
        }
        throw error;
      }

      // Search across all dimensions
      const matches: Array<{ dimension: string; field: string; content: string; relevance: number }> = [];
      const lowerQuery = searchQuery.toLowerCase();

      // Define searchable dimensions and their fields
      const searchableDimensions = [
        'identity_constructs', 'behavioral_triggers', 'execution_bias', 'internal_conflicts',
        'spiritual_dimension', 'adaptive_feedback', 'temporal_biology', 'metacognitive_biases',
        'attachment_style', 'goal_archetypes', 'crisis_handling', 'identity_flexibility',
        'linguistic_fingerprint'
      ];

      searchableDimensions.forEach(dimension => {
        const dimensionData = data[dimension];
        if (dimensionData && typeof dimensionData === 'object') {
          Object.entries(dimensionData).forEach(([field, value]) => {
            if (value) {
              const content = Array.isArray(value) ? value.join(' ') : String(value);
              const lowerContent = content.toLowerCase();
              
              if (lowerContent.includes(lowerQuery)) {
                // Calculate relevance based on match position and frequency
                const firstIndex = lowerContent.indexOf(lowerQuery);
                const frequency = (lowerContent.match(new RegExp(lowerQuery, 'g')) || []).length;
                const relevance = Math.min(1.0, (frequency * 0.3) + (firstIndex === 0 ? 0.5 : 0.2));
                
                matches.push({
                  dimension,
                  field,
                  content: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
                  relevance
                });
              }
            }
          });
        }
      });

      // Sort by relevance
      matches.sort((a, b) => b.relevance - a.relevance);

      console.log(`✅ HERMETIC INTELLIGENCE SERVICE: Found ${matches.length} pattern matches`);
      return { 
        success: true, 
        matches: matches.slice(0, 10) // Return top 10 matches
      };

    } catch (error) {
      console.error('❌ HERMETIC INTELLIGENCE SERVICE: Pattern search failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to search patterns' 
      };
    }
  }

  /**
   * Check if structured intelligence exists for a user
   */
  async hasStructuredIntelligence(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('hermetic_structured_intelligence')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (error) {
        console.error('❌ HERMETIC INTELLIGENCE SERVICE: Failed to check intelligence existence:', error);
        return false;
      }

      return data && data.length > 0;

    } catch (error) {
      console.error('❌ HERMETIC INTELLIGENCE SERVICE: Error checking intelligence existence:', error);
      return false;
    }
  }

  /**
   * Trigger intelligence extraction for a user
   */
  async triggerExtraction(userId: string, forceReprocess = false): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      console.log('🔄 HERMETIC INTELLIGENCE SERVICE: Triggering extraction for user:', userId);

      const { data, error } = await supabase.functions.invoke('extract-hermetic-intelligence', {
        body: { userId, forceReprocess }
      });

      if (error) {
        throw error;
      }

      console.log('✅ HERMETIC INTELLIGENCE SERVICE: Extraction triggered successfully');
      return { 
        success: true, 
        message: data?.message || 'Intelligence extraction completed successfully' 
      };

    } catch (error) {
      console.error('❌ HERMETIC INTELLIGENCE SERVICE: Failed to trigger extraction:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to trigger intelligence extraction' 
      };
    }
  }

  /**
   * Get extraction metadata and confidence scores
   */
  async getExtractionMetadata(userId: string): Promise<{
    success: boolean;
    metadata?: {
      extraction_confidence: number;
      extraction_version: string;
      processing_notes: any;
      created_at: string;
      updated_at: string;
    };
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('hermetic_structured_intelligence')
        .select('extraction_confidence, extraction_version, processing_notes, created_at, updated_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { 
            success: false, 
            error: 'No extraction metadata found' 
          };
        }
        throw error;
      }

      return { success: true, metadata: data };

    } catch (error) {
      console.error('❌ HERMETIC INTELLIGENCE SERVICE: Failed to fetch metadata:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch extraction metadata' 
      };
    }
  }
}

// Export singleton instance for service access
export const hermeticIntelligenceService = new HermeticIntelligenceService();