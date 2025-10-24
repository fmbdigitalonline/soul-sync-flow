import { supabase } from '@/integrations/supabase/client';

export interface DatabaseIntelligenceInsight {
  domain: string;
  signal_strength: number;
  mention_frequency: number;
  gap_score: number;
  whisper_text?: string;
}

export interface SubconsciousWhisper {
  type: 'domain_gap' | 'polarity_balance' | 'energetic_rhythm' | 'causal_chain' | 'personality_mismatch' | 'foundation_depth' | 'home_connection';
  whisper: string;
  confidence: number;
  source_modules: string[];
  timestamp: number;
}

export interface DatabaseIntelligenceData {
  eleven_module_analysis?: Record<string, any>;
  conversation_patterns: {
    dominant_themes: string[];
    emotional_indicators?: string[];
    communication_style?: string;
    engagement_level?: string;
  };
  unspoken_domains?: string[];
  polarity_balance: { problems: number; possibilities: number; emotional_tone?: string };
  energy_timing_patterns?: Record<string, number>;
  personality_traits?: Record<string, any>;
  shadow_patterns?: Array<{ type: string; frequency: number }>;
}

/**
 * Database Intelligence Bridge - Connects SubconsciousOrb to rich database intelligence
 * Preserves Core Intelligence (Pillar I) by respecting critical data pathways
 * Operates on Ground Truth (Pillar II) with real, dynamic database data
 */
export class DatabaseIntelligenceBridge {
  
  /**
   * Get comprehensive intelligence data from database for whisper generation
   * Principle #2: No Hardcoded Data - operates on real database intelligence
   */
  static async getIntelligenceContext(
    userId: string, 
    sessionId: string
  ): Promise<DatabaseIntelligenceData | null> {
    try {
      console.log('🔍 DATABASE BRIDGE: Fetching intelligence context', { userId, sessionId });

      // Get 11-module analysis from hot_memory_cache
      let { data: hotMemoryData, error: hotMemoryError } = await supabase
        .from('hot_memory_cache')
        .select('raw_content, cache_key')
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .like('cache_key', '%accumulated_intelligence%')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (hotMemoryError) {
        console.error('🚨 DATABASE BRIDGE: Hot memory error:', hotMemoryError);
      }

      // Fallback to most recent cached intelligence for the user when the current session has no cache entry.
      if (!hotMemoryData) {
        const fallbackHotMemory = await supabase
          .from('hot_memory_cache')
          .select('raw_content, cache_key')
          .eq('user_id', userId)
          .like('cache_key', '%accumulated_intelligence%')
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (fallbackHotMemory.error) {
          console.error('🚨 DATABASE BRIDGE: Fallback hot memory error:', fallbackHotMemory.error);
        } else {
          hotMemoryData = fallbackHotMemory.data;
        }
      }

      // Get conversation patterns from user_session_memory
      let { data: sessionMemoryData, error: sessionMemoryError } = await supabase
        .from('user_session_memory')
        .select('memory_data, context_summary, memory_type, importance_score')
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (sessionMemoryError) {
        console.error('🚨 DATABASE BRIDGE: Session memory error:', sessionMemoryError);
      }

      if (!sessionMemoryData?.length) {
        const fallbackSessionMemory = await supabase
          .from('user_session_memory')
          .select('memory_data, context_summary, memory_type, importance_score')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (fallbackSessionMemory.error) {
          console.error('🚨 DATABASE BRIDGE: Fallback session memory error:', fallbackSessionMemory.error);
        } else {
          sessionMemoryData = fallbackSessionMemory.data || [];
        }
      }

      // Get memory deltas for intent analysis
      let { data: memoryDeltasData, error: memoryDeltasError } = await supabase
        .from('memory_deltas')
        .select('delta_data, delta_type, importance_score')
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (memoryDeltasError) {
        console.error('🚨 DATABASE BRIDGE: Memory deltas error:', memoryDeltasError);
      }

      if (!memoryDeltasData?.length) {
        const fallbackMemoryDeltas = await supabase
          .from('memory_deltas')
          .select('delta_data, delta_type, importance_score')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (fallbackMemoryDeltas.error) {
          console.error('🚨 DATABASE BRIDGE: Fallback memory deltas error:', fallbackMemoryDeltas.error);
        } else {
          memoryDeltasData = fallbackMemoryDeltas.data || [];
        }
      }

      // Principle #3: Surface gaps clearly if data missing
      if (!hotMemoryData && !sessionMemoryData?.length && !memoryDeltasData?.length) {
        console.warn('⚠️ DATABASE BRIDGE: No intelligence data found for user', { userId, sessionId });
        return null;
      }

      // Parse and structure intelligence data (Principle #2: Real data only)
      const intelligenceData: DatabaseIntelligenceData = {
        eleven_module_analysis: this.safeParseJson(hotMemoryData?.raw_content) || {},
        conversation_patterns: this.extractConversationPatterns(sessionMemoryData || []),
        unspoken_domains: this.identifyUnspokenDomains(sessionMemoryData || [], memoryDeltasData || []),
        polarity_balance: this.analyzePolarityBalance(sessionMemoryData || []),
        energy_timing_patterns: this.extractEnergyPatterns(memoryDeltasData || []),
        personality_traits: this.extractPersonalityTraits(this.safeParseJson(hotMemoryData?.raw_content)),
        shadow_patterns: this.extractShadowPatterns(sessionMemoryData || [])
      };

      console.log('✅ DATABASE BRIDGE: Intelligence context assembled', {
        hasElevenModules: Object.keys(intelligenceData.eleven_module_analysis).length > 0,
        conversationPatternsCount: Object.keys(intelligenceData.conversation_patterns).length,
        unspokenDomainsCount: intelligenceData.unspoken_domains.length,
        polarityBalance: intelligenceData.polarity_balance,
        energyPatternsCount: Object.keys(intelligenceData.energy_timing_patterns).length
      });

      return intelligenceData;

    } catch (error) {
      console.error('🚨 DATABASE BRIDGE: Error fetching intelligence context:', error);
      // Principle #3: Surface error clearly, don't mask with fallback
      return null;
    }
  }

  /**
   * Extract module analysis from session conversation data
   */
  private static extractModuleAnalysisFromSession(sessionData: any[]): any {
    const domains = ['home_family', 'foundation', 'aspirations', 'self_identification'];
    const moduleAnalysis: any = {};
    
    sessionData.forEach(item => {
      if (item.memory_data?.context) {
        const context = item.memory_data.context;
        const content = item.memory_data.content || '';
        
        // Identify domain presence
        domains.forEach(domain => {
          if (context.includes(domain) || content.toLowerCase().includes(domain.replace('_', ' '))) {
            if (!moduleAnalysis[domain]) {
              moduleAnalysis[domain] = {
                signal_strength: 0.7,
                mention_frequency: 1,
                analysis_depth: item.importance_score / 10
              };
            } else {
              moduleAnalysis[domain].mention_frequency += 1;
              moduleAnalysis[domain].signal_strength = Math.min(0.9, moduleAnalysis[domain].signal_strength + 0.1);
            }
          }
        });
      }
    });
    
    return moduleAnalysis;
  }

  /**
   * Extract dominant themes from session conversation patterns
   */
  private static extractThemesFromSession(sessionData: any[]): string[] {
    const themes: string[] = [];
    const themeMap = new Map<string, number>();
    
    sessionData.forEach(item => {
      if (item.memory_data?.context) {
        const context = item.memory_data.context;
        themeMap.set(context, (themeMap.get(context) || 0) + 1);
      }
    });
    
    // Return top themes by frequency
    return Array.from(themeMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([theme]) => theme);
  }

  /**
   * Generate subconscious whispers based on negative space analysis
   * Enhanced to work with session conversation data when memory_deltas is empty
   */
  static generateSubconsciousWhispers(
    intelligenceData: DatabaseIntelligenceData
  ): SubconsciousWhisper[] {
    const whispers: SubconsciousWhisper[] = [];
    const currentTime = Date.now();

    try {
      // Enhanced whisper generation - create whispers about unspoken domains
      if (intelligenceData.eleven_module_analysis) {
        const spokenDomains = Object.keys(intelligenceData.eleven_module_analysis);
        const allDomains = ['home_family', 'foundation', 'relationships', 'career', 'health', 'spirituality', 'creativity', 'growth'];
        const unspokenDomains = allDomains.filter(domain => !spokenDomains.includes(domain));
        
        // Generate whispers for prominent unspoken areas
        unspokenDomains.slice(0, 2).forEach(domain => {
          whispers.push({
            type: 'domain_gap',
            whisper: this.formatDomainGapWhisper(domain),
            confidence: 0.75,
            source_modules: ['Foundation Analysis'],
            timestamp: currentTime
          });
        });
      }

      // Foundation-specific whispers for current session context
      if (intelligenceData.conversation_patterns?.dominant_themes?.includes('foundation')) {
        whispers.push({
          type: 'foundation_depth',
          whisper: 'Ik vraag me af... wat zou er gebeuren als je de fundamenten van deze week echt voelt, in plaats van alleen maar analyseert?',
          confidence: 0.8,
          source_modules: ['Foundation Context'],
          timestamp: currentTime
        });
      }

      if (intelligenceData.conversation_patterns?.dominant_themes?.includes('home_family')) {
        whispers.push({
          type: 'home_connection',
          whisper: 'Zou er misschien iets zijn in je thuisomgeving dat nog onuitgesproken wacht om ontdekt te worden?',
          confidence: 0.75,
          source_modules: ['Home Context'],
          timestamp: currentTime
        });
      }

      // 2. Polarity Balance Whispers - DPEM analysis
      if (intelligenceData.polarity_balance.problems > intelligenceData.polarity_balance.possibilities * 2) {
        whispers.push({
          type: 'polarity_balance',
          whisper: 'Naast de uitdagingen, is er ook een klein sprankje hoop. Zie je dat ergens vandaag?',
          confidence: 0.8,
          source_modules: ['DPEM'],
          timestamp: currentTime
        });
      }

      // 3. Energetic Rhythm Whispers - TWS/HFME patterns
      const energyGaps = this.identifyEnergyRhythmGaps(intelligenceData);
      energyGaps.forEach(gap => {
        whispers.push({
          type: 'energetic_rhythm',
          whisper: gap,
          confidence: 0.7,
          source_modules: ['TWS', 'HFME'],
          timestamp: currentTime
        });
      });

      // 4. Causal Chain Whispers - CNR connections user hasn't mentioned
      const causalGaps = this.identifyCausalChainGaps(intelligenceData);
      causalGaps.forEach(gap => {
        whispers.push({
          type: 'causal_chain',
          whisper: gap,
          confidence: 0.75,
          source_modules: ['CNR'],
          timestamp: currentTime
        });
      });

      // 5. Personality Layer Whispers - VFP traits vs conversation content
      const personalityMismatch = this.identifyPersonalityMismatches(intelligenceData);
      if (personalityMismatch) {
        whispers.push({
          type: 'personality_mismatch',
          whisper: personalityMismatch,
          confidence: 0.8,
          source_modules: ['VFP'],
          timestamp: currentTime
        });
      }

      // Sort by confidence and return top 2 (keep it subtle)
      return whispers
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 2);

    } catch (error) {
      console.error('🚨 DATABASE BRIDGE: Error generating whispers:', error);
      return [];
    }
  }

  // Private helper methods for analysis

  private static safeParseJson(data: any): Record<string, any> {
    if (!data) return {};
    if (typeof data === 'object') return data as Record<string, any>;
    try {
      return JSON.parse(String(data)) as Record<string, any>;
    } catch {
      return {};
    }
  }

  private static extractConversationPatterns(sessionData: any[]): {
    dominant_themes: string[];
    emotional_indicators?: string[];
    communication_style?: string;
    engagement_level?: string;
  } {
    const themes = this.extractThemesFromSession(sessionData);
    return {
      dominant_themes: themes,
      emotional_indicators: [],
      communication_style: 'exploratory',
      engagement_level: sessionData.length > 3 ? 'high' : 'medium'
    };
  }

  private static identifyUnspokenDomains(sessionData: any[], deltaData: any[]): string[] {
    const unspoken: string[] = [];
    const conversationPatterns = this.extractConversationPatterns(sessionData);
    
    // All possible domains
    const allDomains = ['relationships', 'career', 'health', 'spirituality', 'creativity', 'finance'];
    
    // Find domains not mentioned in conversation themes  
    allDomains.forEach(domain => {
      if (!conversationPatterns.dominant_themes.some(theme => theme.includes(domain))) {
        unspoken.push(domain);
      }
    });

    return unspoken.slice(0, 3); // Top 3 unspoken domains
  }

  private static analyzePolarityBalance(sessionData: any[]): { problems: number; possibilities: number } {
    let problems = 0;
    let possibilities = 0;

    sessionData.forEach(session => {
      // Parse memory_data JSONB to extract content
      const memoryData = this.safeParseJson(session.memory_data);
      const content = memoryData.content || session.context_summary || '';
      
      const problemWords = ['problem', 'issue', 'difficult', 'hard', 'struggle', 'challenge', 'cant', 'unable'];
      const possibilityWords = ['hope', 'opportunity', 'possible', 'maybe', 'could', 'might', 'potential', 'chance'];
      
      problemWords.forEach(word => {
        const regex = new RegExp(word, 'gi');
        problems += (content.match(regex) || []).length;
      });

      possibilityWords.forEach(word => {
        const regex = new RegExp(word, 'gi');
        possibilities += (content.match(regex) || []).length;
      });
    });

    return { problems, possibilities };
  }

  private static extractEnergyPatterns(deltaData: any[]): Record<string, number> {
    const patterns: Record<string, number> = {
      morning: 0, afternoon: 0, evening: 0, night: 0
    };
    
    deltaData.forEach(delta => {
      // Parse delta_data JSONB to extract conversation topic
      const deltaContent = this.safeParseJson(delta.delta_data);
      const topic = deltaContent.conversation_topic || deltaContent.topic || '';
      
      // Simple time pattern detection
      if (topic.includes('morning') || topic.includes('ochtend')) patterns.morning++;
      if (topic.includes('afternoon') || topic.includes('middag')) patterns.afternoon++;  
      if (topic.includes('evening') || topic.includes('avond')) patterns.evening++;
      if (topic.includes('night') || topic.includes('nacht')) patterns.night++;
    });

    return patterns;
  }

  private static extractPersonalityTraits(rawContent: any): Record<string, any> {
    const parsedContent = this.safeParseJson(rawContent);
    
    // Extract VFP and personality traits from 11-module analysis
    return {
      mbti_type: parsedContent.VFP?.personality_type || 'Unknown',
      energy_source: parsedContent.VFP?.energy_source || 'Unknown',
      decision_style: parsedContent.VFP?.decision_style || 'Unknown',
      social_preference: parsedContent.VFP?.social_preference || 'Unknown'
    };
  }

  private static extractShadowPatterns(sessionData: any[]): Array<{ type: string; frequency: number }> {
    const patterns: Record<string, number> = {
      emotional_trigger: 0,
      resistance: 0,
      projection: 0,
      blind_spot: 0
    };

    sessionData.forEach(session => {
      // Parse memory_data JSONB to extract emotional indicators
      const memoryData = this.safeParseJson(session.memory_data);
      const indicators = memoryData.emotional_indicators || {};
      
      Object.keys(patterns).forEach(pattern => {
        if (indicators[pattern]) {
          patterns[pattern]++;
        }
      });
    });

    return Object.entries(patterns)
      .map(([type, frequency]) => ({ type, frequency }))
      .filter(p => p.frequency > 0);
  }

  private static identifyDomainGaps(data: DatabaseIntelligenceData): DatabaseIntelligenceInsight[] {
    const gaps: DatabaseIntelligenceInsight[] = [];
    const moduleAnalysis = data.eleven_module_analysis;
    
    // Check for high-signal domains with low conversation mention
    data.unspoken_domains.forEach(domain => {
      const signal_strength = this.calculateDomainSignal(domain, moduleAnalysis);
      const mention_frequency = data.conversation_patterns[domain] || 0;
      
      if (signal_strength > 0.6 && mention_frequency < 2) {
        gaps.push({
          domain,
          signal_strength,
          mention_frequency,
          gap_score: signal_strength - (mention_frequency * 0.1)
        });
      }
    });

    return gaps;
  }

  private static calculateDomainSignal(domain: string, moduleAnalysis: any): number {
    // Calculate how much the 11 modules reference this domain
    let signal = 0;
    const modules = ['NIK', 'CPSR', 'TWS', 'HFME', 'DPEM', 'CNR', 'BPSC', 'ACS', 'PIE', 'VFP', 'TMG'];
    
    modules.forEach(module => {
      const moduleData = moduleAnalysis[module];
      if (moduleData && typeof moduleData === 'object') {
        const content = JSON.stringify(moduleData).toLowerCase();
        const keywords = this.getDomainKeywords(domain);
        const mentions = keywords.filter(keyword => content.includes(keyword)).length;
        signal += mentions * 0.1;
      }
    });

    return Math.min(signal, 1.0); // Cap at 1.0
  }

  private static formatDomainGapWhisper(domain: string): string {
    const whispers = {
      health: 'Je praat veel over werk… soms kan het helpend zijn ook even te voelen hoe je lichaam of energie meedoet in dit proces.',
      relationships: 'Ik hoor veel over doelen... vraag me af hoe de mensen om je heen hier ook in meebewegen.',
      selfcare: 'Onder al je activiteit, is er ook ruimte voor zachte aandacht voor jezelf?',
      spiritual: 'Naast alle praktische zaken, hoe voelt je ziel zich eigenlijk in dit alles?',
      emotions: 'Onder je woorden klinkt ook een verlangen naar erkenning van je gevoel... hoe klinkt dat vanbinnen voor jou?',
      finance: 'Je spreekt over veel verschillende aspecten... hoe voelt de financiële kant zich eigenlijk voor jou?',
      creativity: 'Ik hoor veel over structuur... waar leeft je creatieve kant eigenlijk in dit proces?',
      family: 'Tussen al je persoonlijke groei, hoe ervaren je naasten deze veranderingen eigenlijk?'
    };
    
    return whispers[domain] || `Je noemt veel over andere aspecten... hoe voelt ${domain} eigenlijk mee in dit alles?`;
  }

  private static identifyEnergyRhythmGaps(data: DatabaseIntelligenceData): string[] {
    const whispers: string[] = [];
    const energyPatterns = data.energy_timing_patterns;
    
    // Check for time periods that are avoided
    if (energyPatterns.morning > 0 && energyPatterns.evening === 0) {
      whispers.push('Je noemt vaak de drukke ochtenden… hoe zijn de avonden eigenlijk voor je?');
    }
    
    if (energyPatterns.evening > 0 && energyPatterns.morning === 0) {
      whispers.push('Je spreekt over de avonden… hoe beginnen je dagen eigenlijk?');
    }

    return whispers;
  }

  private static identifyCausalChainGaps(data: DatabaseIntelligenceData): string[] {
    const whispers: string[] = [];
    const patterns = data.conversation_patterns;
    
    // Detect potential causal chains not explicitly mentioned - use dominant_themes array
    const themes = patterns.dominant_themes || [];
    if (themes.some(t => t.includes('work')) && !themes.some(t => t.includes('health'))) {
      whispers.push('Ik hoor stress bij werk, maar vraag me af of je slaap of herstel daar ook iets mee te maken heeft?');
    }
    
    if (themes.some(t => t.includes('emotion')) && !themes.some(t => t.includes('selfcare'))) {
      whispers.push('Bij alle emoties die je voelt, hoe zorg je eigenlijk voor jezelf in dit proces?');
    }

    return whispers;
  }

  private static identifyPersonalityMismatches(data: DatabaseIntelligenceData): string | null {
    const traits = data.personality_traits;
    const patterns = data.conversation_patterns;
    
    // Extravert talking only about internal struggles - use dominant_themes array
    if (traits.energy_source === 'extraversion' && !patterns.dominant_themes.some(t => t.includes('relationship'))) {
      return 'Je kracht om energie uit mensen te halen hoor ik nog niet terug… zou contact maken nu juist steun kunnen geven?';
    }
    
    // Intuitive type not mentioning possibilities
    if (traits.decision_style === 'intuition' && data.polarity_balance.possibilities === 0) {
      return 'Je intuïtieve kant ziet meestal mogelijkheden… waar leven die eigenlijk in deze situatie?';
    }

    return null;
  }

  private static getDomainKeywords(domain: string): string[] {
    const keywords = {
      work: ['work', 'job', 'career', 'office', 'boss', 'colleague', 'project', 'deadline', 'meeting', 'werk', 'baan', 'kantoor'],
      health: ['health', 'body', 'exercise', 'sleep', 'tired', 'energy', 'fitness', 'gezondheid', 'lichaam', 'slapen', 'moe'],
      relationships: ['relationship', 'partner', 'friend', 'family', 'love', 'conflict', 'relatie', 'vrienden', 'familie', 'liefde'],
      finance: ['money', 'budget', 'income', 'expense', 'financial', 'salary', 'geld', 'budget', 'inkomen', 'financieel'],
      selfcare: ['selfcare', 'relax', 'rest', 'peaceful', 'calm', 'meditation', 'zelfzorg', 'rust', 'ontspanning'],
      spiritual: ['spiritual', 'soul', 'meaning', 'purpose', 'faith', 'spiritueel', 'ziel', 'betekenis', 'doel'],
      creativity: ['creative', 'art', 'music', 'writing', 'design', 'creatief', 'kunst', 'muziek', 'schrijven'],
      emotions: ['feel', 'emotion', 'sad', 'happy', 'angry', 'scared', 'voelen', 'emotie', 'verdrietig', 'blij'],
      goals: ['goal', 'dream', 'ambition', 'future', 'plan', 'doel', 'droom', 'ambitie', 'toekomst'],
      family: ['family', 'mother', 'father', 'child', 'parent', 'familie', 'moeder', 'vader', 'kind', 'ouder']
    };
    
    return keywords[domain] || [];
  }
}
