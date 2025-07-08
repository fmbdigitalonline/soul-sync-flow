/**
 * Blueprint Embedding Service - Dual storage system for HACS
 * Maintains both structured and vector representations of user blueprints
 */

import { supabase } from '@/integrations/supabase/client';
import { LayeredBlueprint } from '@/types/personality-modules';

interface EmbeddingData {
  text: string;
  embedding: number[];
  metadata: any;
}

interface BlueprintMemory {
  structured: any;
  vector_chunks: EmbeddingData[];
  last_updated: string;
  version: string;
}

export class BlueprintEmbeddingService {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1';

  constructor() {
    // In browser environment, we'll need to use edge functions for API calls
    this.apiKey = '';
  }

  // Main Blueprint Processing
  async processAndStoreBlueprintMemory(
    userId: string, 
    blueprint: LayeredBlueprint
  ): Promise<BlueprintMemory> {
    console.log('🧠 Processing blueprint into dual memory format');

    try {
      // 1. Create structured representation
      const structured = this.createStructuredRepresentation(blueprint);

      // 2. Create semantic chunks for embedding
      const semanticChunks = this.createSemanticChunks(blueprint);

      // 3. Generate embeddings for chunks
      const embeddedChunks = await this.generateEmbeddingsForChunks(semanticChunks);

      // 4. Store in both formats
      const memory: BlueprintMemory = {
        structured,
        vector_chunks: embeddedChunks,
        last_updated: new Date().toISOString(),
        version: '1.0.0'
      };

      await this.storeBlueprintMemory(userId, memory);

      console.log('✅ Blueprint memory processed and stored');
      return memory;

    } catch (error) {
      console.error('❌ Blueprint processing failed:', error);
      throw error;
    }
  }

  // Structured Representation (for deterministic lookups)
  private createStructuredRepresentation(blueprint: LayeredBlueprint): any {
    return {
      // Core identity markers
      identity: {
        mbti_type: blueprint.cognitiveTemperamental?.mbtiType || 'Unknown',
        hd_type: blueprint.energyDecisionStrategy?.humanDesignType || 'Unknown',
        hd_authority: blueprint.energyDecisionStrategy?.authority || 'Unknown',
        sun_sign: blueprint.publicArchetype?.sunSign || 'Unknown',
        life_path: blueprint.coreValuesNarrative?.lifePath || 'Unknown'
      },

      // Processing preferences
      cognitive_style: {
        thinking_preference: blueprint.cognitiveTemperamental?.mbtiType?.includes('T') ? 'thinking' : 'feeling',
        perceiving_style: blueprint.cognitiveTemperamental?.mbtiType?.includes('P') ? 'perceiving' : 'judging',
        energy_direction: blueprint.cognitiveTemperamental?.mbtiType?.includes('E') ? 'extraverted' : 'introverted',
        information_gathering: blueprint.cognitiveTemperamental?.mbtiType?.includes('S') ? 'sensing' : 'intuitive'
      },

      // Energy patterns
      energy_strategy: {
        hd_strategy: this.getHDStrategy(blueprint.energyDecisionStrategy?.humanDesignType),
        natural_rhythm: this.deriveNaturalRhythm(blueprint),
        decision_authority: blueprint.energyDecisionStrategy?.authority,
        optimal_timing: this.deriveOptimalTiming(blueprint)
      },

      // Values and motivation
      core_values: {
        life_path_energy: blueprint.coreValuesNarrative?.lifePath,
        expression_number: blueprint.coreValuesNarrative?.expressionNumber,
        soul_urge: blueprint.coreValuesNarrative?.soulUrgeNumber,
        primary_motivations: this.extractPrimaryMotivations(blueprint)
      },

      // Preferences and constraints
      preferences: {
        communication_style: this.deriveCommunicationStyle(blueprint),
        learning_style: this.deriveLearningStyle(blueprint),
        goal_approach: this.deriveGoalApproach(blueprint),
        feedback_preference: this.deriveFeedbackPreference(blueprint)
      }
    };
  }

  // Semantic Chunks (for vector similarity search)
  private createSemanticChunks(blueprint: LayeredBlueprint): any[] {
    const chunks = [];

    // Personality narrative chunk
    chunks.push({
      type: 'personality_overview',
      content: `This person is a ${blueprint.cognitiveTemperamental?.mbtiType || 'unique individual'} with ${blueprint.energyDecisionStrategy?.humanDesignType || 'natural'} energy strategy. Their cognitive style combines ${this.describeCognitiveStyle(blueprint)} with ${this.describeEnergyPattern(blueprint)}. They approach decisions through ${blueprint.energyDecisionStrategy?.authority || 'their intuition'}.`,
      metadata: { category: 'core_identity', weight: 1.0 }
    });

    // Values and motivation chunk
    chunks.push({
      type: 'values_motivation',
      content: `Their core values center around life path ${blueprint.coreValuesNarrative?.lifePath || 'growth'}, expressing through ${blueprint.coreValuesNarrative?.expressionNumber || 'their unique gifts'}. They are motivated by ${this.extractMotivationDescription(blueprint)} and find meaning in ${this.extractMeaningDescription(blueprint)}.`,
      metadata: { category: 'values', weight: 0.9 }
    });

    // Growth patterns chunk
    chunks.push({
      type: 'growth_patterns',
      content: `In growth contexts, they naturally ${this.describeGrowthStyle(blueprint)}. They respond best to ${this.describeOptimalGrowthConditions(blueprint)} and may struggle with ${this.identifyGrowthChallenges(blueprint)}. Their ideal development pace is ${this.describeDevelopmentPace(blueprint)}.`,
      metadata: { category: 'growth_style', weight: 0.95 }
    });

    // Communication and feedback chunk
    chunks.push({
      type: 'communication_style',
      content: `They communicate best through ${this.deriveCommunicationStyle(blueprint)} and prefer feedback that is ${this.deriveFeedbackPreference(blueprint)}. In coaching relationships, they thrive with ${this.describeCoachingStyle(blueprint)} and need ${this.describeCoachingNeeds(blueprint)}.`,
      metadata: { category: 'communication', weight: 0.8 }
    });

    // Timing and rhythm chunk
    chunks.push({
      type: 'timing_rhythm',
      content: `Their natural rhythm involves ${this.deriveNaturalRhythm(blueprint)} with optimal timing for growth activities being ${this.deriveOptimalTiming(blueprint)}. They work best with ${this.describeWorkingStyle(blueprint)} and need ${this.describeRecoveryNeeds(blueprint)} for sustainability.`,
      metadata: { category: 'timing', weight: 0.85 }
    });

    return chunks;
  }

  // Generate OpenAI Embeddings
  private async generateEmbeddingsForChunks(chunks: any[]): Promise<EmbeddingData[]> {
    const embeddedChunks: EmbeddingData[] = [];

    for (const chunk of chunks) {
      try {
        const response = await fetch(`${this.baseURL}/embeddings`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: chunk.content,
            encoding_format: 'float'
          })
        });

        if (!response.ok) {
          throw new Error(`Embedding API error: ${response.statusText}`);
        }

        const data = await response.json();
        
        embeddedChunks.push({
          text: chunk.content,
          embedding: data.data[0].embedding,
          metadata: {
            ...chunk.metadata,
            type: chunk.type,
            created_at: new Date().toISOString()
          }
        });

      } catch (error) {
        console.error(`❌ Failed to embed chunk: ${chunk.type}`, error);
        // Continue with other chunks even if one fails
      }
    }

    return embeddedChunks;
  }

  // Retrieval Functions
  async retrieveRelevantBlueprintContext(
    userId: string,
    query: string,
    topK: number = 3
  ): Promise<any> {
    console.log('🔍 Retrieving relevant blueprint context for query:', query.substring(0, 50) + '...');

    try {
      // 1. Generate query embedding
      const queryEmbedding = await this.generateQueryEmbedding(query);

      // 2. Get user's blueprint memory
      const memory = await this.getBlueprintMemory(userId);
      if (!memory) throw new Error('No blueprint memory found');

      // 3. Calculate similarities and rank
      const similarities = memory.vector_chunks.map(chunk => ({
        ...chunk,
        similarity: this.cosineSimilarity(queryEmbedding, chunk.embedding)
      }));

      // 4. Get top-K most relevant chunks
      const topChunks = similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);

      // 5. Combine with structured data
      const relevantStructured = this.getRelevantStructuredData(memory.structured, query);

      console.log('✅ Retrieved relevant context:', topChunks.length, 'chunks');
      
      return {
        vector_context: topChunks,
        structured_context: relevantStructured,
        query_understanding: this.analyzeQueryIntent(query),
        retrieval_confidence: topChunks[0]?.similarity || 0
      };

    } catch (error) {
      console.error('❌ Context retrieval failed:', error);
      throw error;
    }
  }

  // Storage Functions - Use existing user_session_memory table for now
  private async storeBlueprintMemory(userId: string, memory: BlueprintMemory): Promise<void> {
    // Store in existing user_session_memory table with a special type
    const { error } = await supabase
      .from('user_session_memory')
      .upsert({
        user_id: userId,
        session_id: `blueprint_memory_${userId}`,
        memory_type: 'blueprint_embedding',
        memory_data: {
          structured: memory.structured,
          vector_chunks: memory.vector_chunks as any,
          last_updated: memory.last_updated,
          version: memory.version
        } as any,
        importance_score: 10, // High importance for blueprint data
        context_summary: 'User blueprint in dual storage format for AI agents'
      });

    if (error) throw error;
  }

  private async getBlueprintMemory(userId: string): Promise<BlueprintMemory | null> {
    const { data, error } = await supabase
      .from('user_session_memory')
      .select('*')
      .eq('user_id', userId)
      .eq('memory_type', 'blueprint_embedding')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    
    if (!data) return null;

    const memoryData = data.memory_data as any;
    return {
      structured: memoryData.structured,
      vector_chunks: memoryData.vector_chunks,
      last_updated: memoryData.last_updated,
      version: memoryData.version
    };
  }

  // Utility Functions
  private async generateQueryEmbedding(query: string): Promise<number[]> {
    const response = await fetch(`${this.baseURL}/embeddings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query,
        encoding_format: 'float'
      })
    });

    if (!response.ok) {
      throw new Error(`Query embedding failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Blueprint Analysis Helpers
  private getHDStrategy(type?: string): string {
    const strategies = {
      'Manifestor': 'Inform before acting',
      'Generator': 'Respond to life',
      'Manifesting Generator': 'Respond and inform',
      'Projector': 'Wait for invitation',
      'Reflector': 'Wait a lunar cycle'
    };
    return strategies[type as keyof typeof strategies] || 'Follow intuition';
  }

  private deriveNaturalRhythm(blueprint: LayeredBlueprint): string {
    // Logic to derive rhythm from blueprint
    const hdType = blueprint.energyDecisionStrategy?.humanDesignType;
    const mbtiType = blueprint.cognitiveTemperamental?.mbtiType;
    
    if (hdType === 'Reflector') return 'lunar cycle awareness';
    if (hdType === 'Projector') return 'invitation-based bursts';
    if (mbtiType?.includes('P')) return 'flexible, responsive rhythm';
    return 'consistent, structured rhythm';
  }

  private deriveOptimalTiming(blueprint: LayeredBlueprint): string {
    // Logic to derive optimal timing
    return 'morning clarity, afternoon action, evening reflection';
  }

  private extractPrimaryMotivations(blueprint: LayeredBlueprint): string[] {
    // Extract motivations from various blueprint elements
    return ['growth', 'authenticity', 'contribution', 'mastery'];
  }

  private deriveCommunicationStyle(blueprint: LayeredBlueprint): string {
    const mbti = blueprint.cognitiveTemperamental?.mbtiType;
    if (mbti?.includes('T')) return 'logical, structured communication';
    if (mbti?.includes('F')) return 'values-based, empathetic communication';
    return 'balanced communication';
  }

  private deriveLearningStyle(blueprint: LayeredBlueprint): string {
    const mbti = blueprint.cognitiveTemperamental?.mbtiType;
    if (mbti?.includes('S')) return 'practical, step-by-step learning';
    if (mbti?.includes('N')) return 'conceptual, big-picture learning';
    return 'adaptive learning';
  }

  private deriveGoalApproach(blueprint: LayeredBlueprint): string {
    return 'balanced goal approach';
  }

  private deriveFeedbackPreference(blueprint: LayeredBlueprint): string {
    return 'constructive and specific';
  }

  // Description Helpers
  private describeCognitiveStyle(blueprint: LayeredBlueprint): string {
    return 'analytical and intuitive thinking';
  }

  private describeEnergyPattern(blueprint: LayeredBlueprint): string {
    return 'sustainable energy management';
  }

  private extractMotivationDescription(blueprint: LayeredBlueprint): string {
    return 'authentic self-expression and meaningful growth';
  }

  private extractMeaningDescription(blueprint: LayeredBlueprint): string {
    return 'contributing to something larger than themselves';
  }

  private describeGrowthStyle(blueprint: LayeredBlueprint): string {
    return 'prefer gradual, sustainable development';
  }

  private describeOptimalGrowthConditions(blueprint: LayeredBlueprint): string {
    return 'supportive environment with clear guidance';
  }

  private identifyGrowthChallenges(blueprint: LayeredBlueprint): string {
    return 'overwhelming complexity or rushed timelines';
  }

  private describeDevelopmentPace(blueprint: LayeredBlueprint): string {
    return 'steady and sustainable';
  }

  private describeCoachingStyle(blueprint: LayeredBlueprint): string {
    return 'collaborative and insightful guidance';
  }

  private describeCoachingNeeds(blueprint: LayeredBlueprint): string {
    return 'personalized attention and authentic connection';
  }

  private describeWorkingStyle(blueprint: LayeredBlueprint): string {
    return 'focused blocks with regular breaks';
  }

  private describeRecoveryNeeds(blueprint: LayeredBlueprint): string {
    return 'adequate rest and reflection time';
  }

  private getRelevantStructuredData(structured: any, query: string): any {
    // Simple keyword matching - could be more sophisticated
    return {
      identity: structured.identity,
      cognitive_style: structured.cognitive_style,
      preferences: structured.preferences
    };
  }

  private analyzeQueryIntent(query: string): string {
    // Analyze what the user is asking about
    if (query.includes('goal') || query.includes('plan')) return 'planning';
    if (query.includes('motivation') || query.includes('energy')) return 'motivation';
    if (query.includes('communication') || query.includes('feedback')) return 'communication';
    return 'general';
  }
}

export const blueprintEmbeddingService = new BlueprintEmbeddingService();