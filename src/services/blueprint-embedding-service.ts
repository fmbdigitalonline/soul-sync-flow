/**
 * Blueprint Embedding Service - Dual storage system for HACS
 * Maintains both structured and vector representations of user blueprints
 */

import { supabase } from '@/integrations/supabase/client';
import { LayeredBlueprint } from '@/types/personality-modules';

interface EmbeddingData {
  text: string;
  embedding: number[];
  metadata: HermeticMetadata | BasicMetadata;
}

interface HermeticMetadata {
  section_type: "law" | "gate" | "shadow" | "practice" | "correspondence" | "integration";
  hermetic_law?: string;
  gate_number?: number;
  shadow_keywords?: string[];
  archetype_tags?: string[];
  practice_type?: "meditation" | "ritual" | "reflection" | "integration";
  intensity_level?: number;
  report_section?: "core_analysis" | "shadow_work" | "integration" | "practical_application";
  category: string;
  weight: number;
  type: string;
  created_at: string;
}

interface BasicMetadata {
  category: string;
  weight: number;
  type: string;
  created_at: string;
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

  // Main Blueprint Processing (Existing)
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

  // NEW: Hermetic Report Processing
  async processAndStoreHermeticMemory(
    userId: string,
    hermeticReport: any // Personality report content
  ): Promise<BlueprintMemory> {
    console.log('🔮 Processing hermetic report into semantic chunks');

    try {
      // 1. Create structured representation for hermetic data
      const structured = this.createHermeticStructuredRepresentation(hermeticReport);

      // 2. Create intelligent hermetic semantic chunks
      const hermeticChunks = this.createHermeticSemanticChunks(hermeticReport);

      // 3. Generate embeddings for hermetic chunks
      const embeddedChunks = await this.generateEmbeddingsForChunks(hermeticChunks);

      // 4. Store in memory system
      const memory: BlueprintMemory = {
        structured,
        vector_chunks: embeddedChunks,
        last_updated: new Date().toISOString(),
        version: '2.0.0-hermetic'
      };

      await this.storeHermeticMemory(userId, memory);

      console.log('✅ Hermetic memory processed and stored');
      return memory;

    } catch (error) {
      console.error('❌ Hermetic processing failed:', error);
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

  // NEW: Hermetic Structured Representation
  private createHermeticStructuredRepresentation(hermeticReport: any): any {
    const reportContent = hermeticReport.report_content || hermeticReport;
    
    return {
      hermetic_identity: {
        core_archetype: this.extractArchetype(reportContent),
        dominant_laws: this.extractDominantLaws(reportContent),
        shadow_patterns: this.extractShadowPatterns(reportContent),
        integration_level: this.assessIntegrationLevel(reportContent)
      },
      hermetic_laws: this.mapHermeticLaws(reportContent),
      gate_analysis: this.extractGateAnalysis(reportContent),
      shadow_work: this.extractShadowWork(reportContent),
      practical_applications: this.extractPracticalApplications(reportContent)
    };
  }

  // NEW: Hermetic Semantic Chunking (Advanced)
  private createHermeticSemanticChunks(hermeticReport: any): any[] {
    const chunks = [];
    const reportContent = hermeticReport.report_content || hermeticReport;

    // Extract sections from the report
    const sections = this.parseReportSections(reportContent);

    // 1. Hermetic Law Chunks (Primary chunks 2-5K words each)
    sections.laws?.forEach((lawSection: any, index: number) => {
      if (lawSection.content && lawSection.content.length > 200) {
        chunks.push({
          type: 'hermetic_law',
          content: lawSection.content,
          metadata: {
            section_type: 'law' as const,
            hermetic_law: lawSection.law_name,
            category: 'hermetic_laws',
            weight: 1.0,
            type: 'hermetic_law',
            created_at: new Date().toISOString(),
            report_section: 'core_analysis' as const,
            intensity_level: lawSection.intensity || 5
          } as HermeticMetadata
        });
      }
    });

    // 2. Gate Analysis Chunks (500-1K words each)
    sections.gates?.forEach((gateSection: any) => {
      if (gateSection.content && gateSection.content.length > 200) {
        chunks.push({
          type: 'gate_analysis',
          content: gateSection.content,
          metadata: {
            section_type: 'gate' as const,
            gate_number: gateSection.gate_number,
            hermetic_law: gateSection.related_law,
            category: 'gate_analysis',
            weight: 0.9,
            type: 'gate_analysis',
            created_at: new Date().toISOString(),
            report_section: 'core_analysis' as const,
            shadow_keywords: gateSection.shadow_keywords || []
          } as HermeticMetadata
        });
      }
    });

    // 3. Shadow Pattern Chunks (300-800 words)
    sections.shadows?.forEach((shadowSection: any) => {
      if (shadowSection.content && shadowSection.content.length > 150) {
        chunks.push({
          type: 'shadow_pattern',
          content: shadowSection.content,
          metadata: {
            section_type: 'shadow' as const,
            shadow_keywords: shadowSection.keywords,
            hermetic_law: shadowSection.related_law,
            category: 'shadow_work',
            weight: 0.95,
            type: 'shadow_pattern',
            created_at: new Date().toISOString(),
            report_section: 'shadow_work' as const,
            intensity_level: shadowSection.intensity || 7
          } as HermeticMetadata
        });
      }
    });

    // 4. Practice Chunks (400-600 words)
    sections.practices?.forEach((practiceSection: any) => {
      if (practiceSection.content && practiceSection.content.length > 200) {
        chunks.push({
          type: 'hermetic_practice',
          content: practiceSection.content,
          metadata: {
            section_type: 'practice' as const,
            practice_type: practiceSection.practice_type || 'integration',
            hermetic_law: practiceSection.related_law,
            category: 'practical_application',
            weight: 0.8,
            type: 'hermetic_practice',
            created_at: new Date().toISOString(),
            report_section: 'practical_application' as const
          } as HermeticMetadata
        });
      }
    });

    // 5. Cross-Reference Chunks (Law+Gate combinations)
    sections.correspondences?.forEach((correspondence: any) => {
      if (correspondence.content && correspondence.content.length > 150) {
        chunks.push({
          type: 'hermetic_correspondence',
          content: correspondence.content,
          metadata: {
            section_type: 'correspondence' as const,
            hermetic_law: correspondence.primary_law,
            gate_number: correspondence.gate_number,
            category: 'hermetic_integration',
            weight: 0.85,
            type: 'hermetic_correspondence',
            created_at: new Date().toISOString(),
            report_section: 'integration' as const
          } as HermeticMetadata
        });
      }
    });

    console.log(`🔮 Created ${chunks.length} hermetic semantic chunks`);
    return chunks;
  }

  // Generate OpenAI Embeddings
  private async generateEmbeddingsForChunks(chunks: any[]): Promise<EmbeddingData[]> {
    const embeddedChunks: EmbeddingData[] = [];

    for (const chunk of chunks) {
      try {
        console.log('🔧 Generating embedding for chunk:', chunk.type);
        
        const { data, error } = await supabase.functions.invoke('openai-embeddings', {
          body: { query: chunk.content }
        });

        if (error) {
          console.error(`❌ Edge Function error for chunk ${chunk.type}:`, error);
          continue; // Skip this chunk but continue with others
        }

        if (!data?.embedding) {
          console.error(`❌ No embedding returned for chunk: ${chunk.type}`);
          continue;
        }
        
        embeddedChunks.push({
          text: chunk.content,
          embedding: data.embedding,
          metadata: {
            ...chunk.metadata,
            type: chunk.type,
            created_at: new Date().toISOString()
          }
        });

        console.log('✅ Successfully embedded chunk:', chunk.type);

      } catch (error) {
        console.error(`❌ Failed to embed chunk: ${chunk.type}`, error);
        // Continue with other chunks even if one fails
      }
    }

    console.log(`✅ Generated embeddings for ${embeddedChunks.length}/${chunks.length} chunks`);
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

  // NEW: Hermetic Context Retrieval with Advanced Filtering
  async retrieveRelevantHermeticContext(
    userId: string,
    query: string,
    topK: number = 3,
    filters?: {
      hermetic_laws?: string[];
      gate_numbers?: number[];
      shadow_keywords?: string[];
      section_types?: string[];
      intensity_min?: number;
    }
  ): Promise<any> {
    console.log('🔮 Retrieving hermetic context with advanced filtering for:', query.substring(0, 50) + '...');

    try {
      // 1. Generate query embedding
      const queryEmbedding = await this.generateQueryEmbedding(query);

      // 2. Get user's hermetic memory
      const memory = await this.getHermeticMemory(userId);
      if (!memory) {
        console.log('⚠️ No hermetic memory found, falling back to blueprint');
        return await this.retrieveRelevantBlueprintContext(userId, query, topK);
      }

      // 3. Apply pre-filtering based on metadata
      let filteredChunks = memory.vector_chunks;
      
      if (filters) {
        filteredChunks = memory.vector_chunks.filter(chunk => {
          const metadata = chunk.metadata as HermeticMetadata;
          
          // Filter by hermetic laws
          if (filters.hermetic_laws && metadata.hermetic_law) {
            if (!filters.hermetic_laws.some(law => metadata.hermetic_law?.includes(law))) {
              return false;
            }
          }
          
          // Filter by gate numbers
          if (filters.gate_numbers && metadata.gate_number) {
            if (!filters.gate_numbers.includes(metadata.gate_number)) {
              return false;
            }
          }
          
          // Filter by shadow keywords
          if (filters.shadow_keywords && metadata.shadow_keywords) {
            if (!filters.shadow_keywords.some(keyword => 
              metadata.shadow_keywords?.includes(keyword))) {
              return false;
            }
          }
          
          // Filter by section types
          if (filters.section_types && metadata.section_type) {
            if (!filters.section_types.includes(metadata.section_type)) {
              return false;
            }
          }
          
          // Filter by intensity level
          if (filters.intensity_min && metadata.intensity_level) {
            if (metadata.intensity_level < filters.intensity_min) {
              return false;
            }
          }
          
          return true;
        });
      }

      // 4. Calculate similarities on filtered chunks
      const similarities = filteredChunks.map(chunk => ({
        ...chunk,
        similarity: this.cosineSimilarity(queryEmbedding, chunk.embedding)
      }));

      // 5. Get top-K most relevant chunks
      const topChunks = similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);

      // 6. Combine with hermetic structured data
      const relevantStructured = this.getRelevantHermeticStructuredData(memory.structured, query, filters);

      console.log(`✅ Retrieved ${topChunks.length} hermetic chunks from ${filteredChunks.length} filtered chunks`);
      
      return {
        vector_context: topChunks,
        structured_context: relevantStructured,
        query_understanding: this.analyzeHermeticQueryIntent(query),
        retrieval_confidence: topChunks[0]?.similarity || 0,
        hermetic_insights: this.generateHermeticInsights(topChunks, query),
        data_source: 'hermetic_report'
      };

    } catch (error) {
      console.error('❌ Hermetic context retrieval failed:', error);
      // Fallback to blueprint context
      console.log('🔄 Falling back to blueprint context retrieval');
      return await this.retrieveRelevantBlueprintContext(userId, query, topK);
    }
  }

  // NEW: Unified Context Retrieval (Auto-detects best source)
  async retrieveRelevantContext(
    userId: string,
    query: string,
    topK: number = 3,
    preferHermetic: boolean = true
  ): Promise<any> {
    console.log('🎯 Auto-detecting best context source for user...');

    try {
      // Check if hermetic memory exists and user prefers it
      if (preferHermetic) {
        const hermeticMemory = await this.getHermeticMemory(userId);
        if (hermeticMemory) {
          console.log('✅ Using hermetic memory for context retrieval');
          return await this.retrieveRelevantHermeticContext(userId, query, topK);
        }
      }

      // Fallback to blueprint memory
      console.log('🔄 Using blueprint memory for context retrieval');
      return await this.retrieveRelevantBlueprintContext(userId, query, topK);

    } catch (error) {
      console.error('❌ Unified context retrieval failed:', error);
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
    try {
      console.log('🔧 Generating query embedding via Edge Function...');
      
      const { data, error } = await supabase.functions.invoke('openai-embeddings', {
        body: { query }
      });

      if (error) {
        console.error('❌ Edge Function error:', error);
        throw new Error(`Embedding generation failed: ${error.message}`);
      }

      if (!data?.embedding) {
        throw new Error('No embedding returned from Edge Function');
      }

      console.log('✅ Query embedding generated successfully, length:', data.embedding.length);
      return data.embedding;
    } catch (error) {
      console.error('❌ Query embedding failed:', error);
      throw new Error(`Query embedding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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

  // NEW: Hermetic Storage Functions
  private async storeHermeticMemory(userId: string, memory: BlueprintMemory): Promise<void> {
    // Store hermetic memory with distinct type
    const { error } = await supabase
      .from('user_session_memory')
      .upsert({
        user_id: userId,
        session_id: `hermetic_memory_${userId}`,
        memory_type: 'hermetic_embedding',
        memory_data: {
          structured: memory.structured,
          vector_chunks: memory.vector_chunks as any,
          last_updated: memory.last_updated,
          version: memory.version
        } as any,
        importance_score: 10, // High importance for hermetic data
        context_summary: 'User hermetic personality report in advanced semantic chunks'
      });

    if (error) throw error;
  }

  // NEW: Hermetic Report Parsing Functions
  private parseReportSections(reportContent: any): any {
    // Parse the personality report into structured sections
    console.log('🔮 Parsing hermetic report sections...');
    
    try {
      // Handle different report structures
      const content = typeof reportContent === 'string' ? reportContent : JSON.stringify(reportContent);
      
      return {
        laws: this.extractLawSections(content),
        gates: this.extractGateSections(content),
        shadows: this.extractShadowSections(content),
        practices: this.extractPracticeSections(content),
        correspondences: this.extractCorrespondenceSections(content)
      };
    } catch (error) {
      console.error('❌ Report parsing failed:', error);
      return { laws: [], gates: [], shadows: [], practices: [], correspondences: [] };
    }
  }

  private extractLawSections(content: string): any[] {
    // Extract Hermetic Law sections using pattern matching
    const lawPatterns = [
      /Law of ([^\.]+)[\s\S]*?(?=Law of|\n\n|\z)/gi,
      /(?:Law|Principle) of ([^:\n]+):([\s\S]*?)(?=(?:Law|Principle) of|\n\n\n|\z)/gi
    ];

    const laws = [];
    for (const pattern of lawPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        laws.push({
          law_name: `Law of ${match[1].trim()}`,
          content: match[0].trim(),
          intensity: 8 // Default intensity
        });
      }
    }

    return laws;
  }

  private extractGateSections(content: string): any[] {
    // Extract Gate analysis sections
    const gatePatterns = [
      /Gate (\d+)[:\s]+([\s\S]*?)(?=Gate \d+|\n\n\n|\z)/gi,
      /(\d+)(?:st|nd|rd|th)?\s+Gate[:\s]+([\s\S]*?)(?=\d+(?:st|nd|rd|th)?\s+Gate|\n\n\n|\z)/gi
    ];

    const gates = [];
    for (const pattern of gatePatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        gates.push({
          gate_number: parseInt(match[1]),
          content: match[2].trim(),
          shadow_keywords: this.extractShadowKeywords(match[2]),
          related_law: this.inferRelatedLaw(match[2])
        });
      }
    }

    return gates;
  }

  private extractShadowSections(content: string): any[] {
    // Extract shadow work sections
    const shadowPatterns = [
      /shadow[:\s]+([\s\S]*?)(?=gift|practice|integration|\n\n\n|\z)/gi,
      /(?:fear|block|resistance|sabotage)[:\s]+([\s\S]*?)(?=\n\n|\z)/gi
    ];

    const shadows = [];
    for (const pattern of shadowPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        shadows.push({
          content: match[1].trim(),
          keywords: this.extractShadowKeywords(match[1]),
          intensity: 9,
          related_law: this.inferRelatedLaw(match[1])
        });
      }
    }

    return shadows;
  }

  private extractPracticeSections(content: string): any[] {
    // Extract practice and ritual sections
    const practicePatterns = [
      /(?:practice|ritual|exercise|meditation)[:\s]+([\s\S]*?)(?=practice|ritual|\n\n\n|\z)/gi,
      /(?:integration|application)[:\s]+([\s\S]*?)(?=\n\n|\z)/gi
    ];

    const practices = [];
    for (const pattern of practicePatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        practices.push({
          content: match[1].trim(),
          practice_type: this.inferPracticeType(match[1]),
          related_law: this.inferRelatedLaw(match[1])
        });
      }
    }

    return practices;
  }

  private extractCorrespondenceSections(content: string): any[] {
    // Extract correspondence sections (Law+Gate combinations)
    const correspondences = [];
    
    // Look for sections that mention both laws and gates
    const correspondencePattern = /(Law of [^\.]+)[\s\S]*?(Gate \d+)[\s\S]*?(?=Law of|\n\n\n|\z)/gi;
    let match;
    while ((match = correspondencePattern.exec(content)) !== null) {
      correspondences.push({
        content: match[0].trim(),
        primary_law: match[1],
        gate_number: this.extractGateNumber(match[2])
      });
    }

    return correspondences;
  }

  // NEW: Hermetic Analysis Helper Functions
  private extractArchetype(content: any): string {
    // Extract core archetype from report
    const archetypePatterns = [
      /archetype[:\s]+([^\n\.]+)/i,
      /core\s+pattern[:\s]+([^\n\.]+)/i
    ];

    for (const pattern of archetypePatterns) {
      const match = JSON.stringify(content).match(pattern);
      if (match) return match[1].trim();
    }

    return 'Integrated Seeker';
  }

  private extractDominantLaws(content: any): string[] {
    const contentStr = JSON.stringify(content);
    const laws = [];
    const lawPattern = /Law of ([^\.]+)/gi;
    let match;

    while ((match = lawPattern.exec(contentStr)) !== null) {
      laws.push(`Law of ${match[1].trim()}`);
    }

    return [...new Set(laws)].slice(0, 3); // Top 3 unique laws
  }

  private extractShadowPatterns(content: any): string[] {
    // Extract shadow patterns from content
    const shadowKeywords = ['fear', 'resistance', 'block', 'sabotage', 'inadequacy', 'self-doubt'];
    const contentStr = JSON.stringify(content).toLowerCase();
    
    return shadowKeywords.filter(keyword => contentStr.includes(keyword));
  }

  private assessIntegrationLevel(content: any): number {
    // Assess integration level (1-10)
    const integrationKeywords = ['integration', 'mastery', 'embodiment', 'synthesis'];
    const contentStr = JSON.stringify(content).toLowerCase();
    
    const score = integrationKeywords.reduce((acc, keyword) => {
      return acc + (contentStr.match(new RegExp(keyword, 'g'))?.length || 0);
    }, 0);

    return Math.min(score + 3, 10); // Base 3, max 10
  }

  private mapHermeticLaws(content: any): Record<string, any> {
    // Map hermetic laws mentioned in the report
    const laws = {};
    const contentStr = JSON.stringify(content);
    
    const hermeticLaws = [
      'Mentalism', 'Correspondence', 'Vibration', 'Polarity', 
      'Rhythm', 'Cause and Effect', 'Gender'
    ];

    hermeticLaws.forEach(law => {
      const lawPattern = new RegExp(`Law of ${law}[:\\s]+([^\\n\\.]+)`, 'i');
      const match = contentStr.match(lawPattern);
      if (match) {
        laws[law] = { description: match[1].trim(), present: true };
      }
    });

    return laws;
  }

  private extractGateAnalysis(content: any): Record<string, any> {
    // Extract gate analysis data
    const contentStr = JSON.stringify(content);
    const gatePattern = /Gate (\d+)[:\s]+([^\.]+)/gi;
    const gates = {};
    let match;

    while ((match = gatePattern.exec(contentStr)) !== null) {
      gates[match[1]] = {
        description: match[2].trim(),
        analyzed: true
      };
    }

    return gates;
  }

  private extractShadowWork(content: any): Record<string, any> {
    // Extract shadow work themes
    return {
      themes: this.extractShadowPatterns(content),
      integration_level: this.assessIntegrationLevel(content),
      active_shadows: this.extractShadowKeywords(JSON.stringify(content))
    };
  }

  private extractPracticalApplications(content: any): Record<string, any> {
    // Extract practical applications
    return {
      practices: this.extractPracticeSections(JSON.stringify(content)),
      integration_methods: ['meditation', 'reflection', 'ritual'],
      daily_applications: this.inferDailyApplications(content)
    };
  }

  // Helper Functions for Parsing
  private extractShadowKeywords(text: string): string[] {
    const keywords = ['fear', 'doubt', 'resistance', 'sabotage', 'inadequacy', 'projection'];
    return keywords.filter(keyword => text.toLowerCase().includes(keyword));
  }

  private inferRelatedLaw(text: string): string {
    const lawKeywords = {
      'Mentalism': ['thought', 'mind', 'consciousness'],
      'Correspondence': ['as above', 'as below', 'pattern'],
      'Vibration': ['frequency', 'energy', 'vibration'],
      'Polarity': ['opposite', 'dual', 'polarity'],
      'Rhythm': ['cycle', 'rhythm', 'pendulum'],
      'Cause and Effect': ['cause', 'effect', 'consequence'],
      'Gender': ['masculine', 'feminine', 'creation']
    };

    for (const [law, keywords] of Object.entries(lawKeywords)) {
      if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
        return `Law of ${law}`;
      }
    }

    return 'Law of Correspondence'; // Default
  }

  private inferPracticeType(text: string): "meditation" | "ritual" | "reflection" | "integration" {
    if (text.toLowerCase().includes('meditat')) return 'meditation';
    if (text.toLowerCase().includes('ritual')) return 'ritual';
    if (text.toLowerCase().includes('reflect')) return 'reflection';
    return 'integration';
  }

  private extractGateNumber(text: string): number {
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1]) : 1;
  }

  private inferDailyApplications(content: any): string[] {
    return ['morning reflection', 'energy awareness', 'shadow observation', 'integration practice'];
  }

  // Missing methods to fix build errors
  private async getHermeticMemory(userId: string): Promise<BlueprintMemory | null> {
    const { data, error } = await supabase
      .from('user_session_memory')
      .select('*')
      .eq('user_id', userId)
      .eq('memory_type', 'hermetic_embedding')
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

  private getRelevantHermeticStructuredData(structured: any, query: string, filters?: any): any {
    return {
      hermetic_identity: structured.hermetic_identity,
      relevant_laws: structured.hermetic_laws,
      shadow_work: structured.shadow_work
    };
  }

  private analyzeHermeticQueryIntent(query: string): string {
    if (query.includes('shadow') || query.includes('fear')) return 'shadow_work';
    if (query.includes('law') || query.includes('hermetic')) return 'hermetic_law';
    if (query.includes('gate')) return 'gate_analysis';
    return 'general_hermetic';
  }

  private generateHermeticInsights(chunks: any[], query: string): any {
    return {
      dominant_themes: chunks.map(c => c.metadata.hermetic_law).filter(Boolean),
      shadow_patterns: chunks.flatMap(c => c.metadata.shadow_keywords || []),
      recommended_practices: ['meditation', 'shadow work', 'integration']
    };
  }
}

export const blueprintEmbeddingService = new BlueprintEmbeddingService();