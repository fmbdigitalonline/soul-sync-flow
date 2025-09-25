import { supabase } from '@/integrations/supabase/client';

export interface DatabaseIntelligenceInsight {
  domain: string;
  signal_strength: number;
  mention_frequency: number;
  gap_score: number;
  whisper_text?: string;
}

export interface SubconsciousWhisper {
  type: 'domain_gap' | 'polarity_balance' | 'energetic_rhythm' | 'causal_chain' | 'personality_mismatch';
  whisper: string;
  confidence: number;
  source_modules: string[];
  timestamp: number;
}

export interface DatabaseIntelligenceData {
  eleven_module_analysis: Record<string, any>;
  conversation_patterns: Record<string, number>;
  unspoken_domains: string[];
  polarity_balance: { problems: number; possibilities: number };
  energy_timing_patterns: Record<string, number>;
  personality_traits: Record<string, any>;
  shadow_patterns: Array<{ type: string; frequency: number }>;
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
      const { data: hotMemoryData, error: hotMemoryError } = await supabase
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

      // Get conversation patterns from user_session_memory  
      const { data: sessionMemoryData, error: sessionMemoryError } = await supabase
        .from('user_session_memory')
        .select('memory_content, conversation_elements, emotional_indicators')
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (sessionMemoryError) {
        console.error('🚨 DATABASE BRIDGE: Session memory error:', sessionMemoryError);
      }

      // Get memory deltas for intent analysis
      const { data: memoryDeltasData, error: memoryDeltasError } = await supabase
        .from('memory_deltas')
        .select('intent_analysis, emotional_state, conversation_topic')
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (memoryDeltasError) {
        console.error('🚨 DATABASE BRIDGE: Memory deltas error:', memoryDeltasError);
      }

      // Principle #3: Surface gaps clearly if data missing
      if (!hotMemoryData && !sessionMemoryData?.length && !memoryDeltasData?.length) {
        console.warn('⚠️ DATABASE BRIDGE: No intelligence data found');
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
   * Generate subconscious whispers based on negative space analysis
   * Principle #2: Dynamic data - analyzes what's NOT being discussed vs what's in analysis
   */
  static generateSubconsciousWhispers(
    intelligenceData: DatabaseIntelligenceData
  ): SubconsciousWhisper[] {
    const whispers: SubconsciousWhisper[] = [];
    const currentTime = Date.now();

    try {
      // 1. Domain Gap Whispers - what's analyzed but not discussed
      const domainGaps = this.identifyDomainGaps(intelligenceData);
      domainGaps.forEach(gap => {
        if (gap.gap_score > 0.7) { // High signal, low mention
          whispers.push({
            type: 'domain_gap',
            whisper: this.formatDomainGapWhisper(gap.domain),
            confidence: gap.gap_score,
            source_modules: ['NIK', 'HFME'],
            timestamp: currentTime
          });
        }
      });

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

  private static extractConversationPatterns(sessionData: any[]): Record<string, number> {
    const patterns: Record<string, number> = {
      work: 0, relationships: 0, health: 0, finance: 0, selfcare: 0, 
      spiritual: 0, creativity: 0, family: 0, goals: 0, emotions: 0
    };
    
    sessionData.forEach(session => {
      const content = session.memory_content || '';
      const elements = session.conversation_elements || {};
      
      // Count domain mentions in conversation content
      Object.keys(patterns).forEach(domain => {
        const regex = new RegExp(this.getDomainKeywords(domain).join('|'), 'gi');
        const matches = content.match(regex) || [];
        patterns[domain] += matches.length;
      });
    });

    return patterns;
  }

  private static identifyUnspokenDomains(sessionData: any[], deltaData: any[]): string[] {
    const conversationPatterns = this.extractConversationPatterns(sessionData);
    const unspoken: string[] = [];

    // Domains with high analysis signal but low conversation mention
    Object.entries(conversationPatterns).forEach(([domain, mentions]) => {
      if (mentions < 2) { // Rarely mentioned
        unspoken.push(domain);
      }
    });

    return unspoken.slice(0, 3); // Top 3 unspoken domains
  }

  private static analyzePolarityBalance(sessionData: any[]): { problems: number; possibilities: number } {
    let problems = 0;
    let possibilities = 0;

    sessionData.forEach(session => {
      const content = session.memory_content || '';
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
      const topic = delta.conversation_topic || '';
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
      const indicators = session.emotional_indicators || {};
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
    
    // Detect potential causal chains not explicitly mentioned
    if (patterns.work > 3 && patterns.health === 0) {
      whispers.push('Ik hoor stress bij werk, maar vraag me af of je slaap of herstel daar ook iets mee te maken heeft?');
    }
    
    if (patterns.emotions > 2 && patterns.selfcare === 0) {
      whispers.push('Bij alle emoties die je voelt, hoe zorg je eigenlijk voor jezelf in dit proces?');
    }

    return whispers;
  }

  private static identifyPersonalityMismatches(data: DatabaseIntelligenceData): string | null {
    const traits = data.personality_traits;
    const patterns = data.conversation_patterns;
    
    // Extravert talking only about internal struggles
    if (traits.energy_source === 'extraversion' && patterns.relationships === 0) {
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
