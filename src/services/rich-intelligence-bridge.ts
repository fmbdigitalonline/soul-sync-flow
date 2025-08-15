import { supabase } from '@/integrations/supabase/client';
import { HACSInsight } from '@/hooks/use-hacs-insights';
import { HacsIntelligence, ModuleScores } from '@/hooks/use-hacs-intelligence';
import { LayeredBlueprint } from '@/types/personality-modules';
import { Language } from '@/contexts/LanguageContext';

export interface WarmInsightConfig {
  userName?: string;
  mbtiType?: string;
  humanDesignType?: string;
  sunSign?: string;
  communicationPreference?: 'encouraging' | 'direct' | 'mystical' | 'practical';
  language?: Language;
}

/**
 * Rich Intelligence Bridge - Transforms cold HACS metrics into warm, personalized insights
 */
export class RichIntelligenceBridge {
  
  /**
   * Generate warm, personalized insights from HACS intelligence data
   */
  static async generateWarmInsights(userId: string, language: Language = 'en'): Promise<HACSInsight[]> {
    try {
      console.log('🌟 Rich Intelligence Bridge: Starting warm insight generation...');
      
      // 1. Fetch HACS intelligence data
      const hacsData = await this.fetchHacsIntelligence(userId);
      if (!hacsData) {
        console.log('🌟 No HACS intelligence data found');
        return [];
      }
      
      // 2. Validate user has meaningful activity before generating insights
      const hasRealActivity = await this.validateUserActivity(userId, hacsData);
      if (!hasRealActivity) {
        console.log('🌟 User lacks meaningful activity - no insights generated');
        return [];
      }
      
      // 3. Fetch blueprint for personalization (from User 360)
      const blueprint = await this.fetchBlueprintFromUser360(userId);
      const config = this.extractPersonalizationConfig(blueprint, language);
      
      console.log('🌟 Personalization config:', config);
      
      // 4. Generate warm insights based on module scores
      const insights = this.transformModuleScoresToWarmInsights(hacsData, config);
      
      console.log('🌟 Generated warm insights:', insights.length);
      
      return insights;
      
    } catch (error) {
      console.error('🚨 Rich Intelligence Bridge error:', error);
      return [];
    }
  }
  
  /**
   * Validate user has meaningful activity before generating insights
   * This prevents artificial insights for new users who haven't actually used the system
   */
  private static async validateUserActivity(userId: string, hacsData: HacsIntelligence): Promise<boolean> {
    try {
      // Check 1: Must have meaningful interaction count
      if (hacsData.interaction_count < 5) {
        console.log('🚫 Insufficient interactions:', hacsData.interaction_count);
        return false;
      }
      
      // Check 2: Must have at least one module score > 5 (showing real growth)
      const moduleScores = Object.values(hacsData.module_scores);
      const hasRealGrowth = moduleScores.some(score => score > 5);
      if (!hasRealGrowth) {
        console.log('🚫 No real module growth detected');
        return false;
      }
      
      // Check 3: Must have actual conversation history or activity
      const { data: conversations } = await supabase
        .from('hacs_conversations')
        .select('id')
        .eq('user_id', userId)
        .limit(3);
        
      const { data: activities } = await supabase
        .from('user_activities') 
        .select('id')
        .eq('user_id', userId)
        .limit(3);
      
      const hasConversations = conversations && conversations.length > 0;
      const hasActivities = activities && activities.length > 0;
      
      if (!hasConversations && !hasActivities) {
        console.log('🚫 No conversation or activity history');
        return false;
      }
      
      console.log('✅ User has meaningful activity - insights approved', {
        interactions: hacsData.interaction_count,
        hasRealGrowth,
        conversationCount: conversations?.length || 0,
        activityCount: activities?.length || 0
      });
      
      return true;
      
    } catch (error) {
      console.error('🚨 Error validating user activity:', error);
      return false; // Fail safely - no insights if we can't validate
    }
  }

  /**
   * Fetch HACS intelligence data for user
   */
  private static async fetchHacsIntelligence(userId: string): Promise<HacsIntelligence | null> {
    const { data, error } = await supabase
      .from('hacs_intelligence')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) {
      console.error('🚨 Error fetching HACS intelligence:', error);
      return null;
    }
    
    if (!data) return null;
    
    // Parse module_scores safely
    const rawModuleScores = data.module_scores;
    const moduleScores: ModuleScores = {
      NIK: (rawModuleScores as any)?.NIK || 0,
      CPSR: (rawModuleScores as any)?.CPSR || 0,
      TWS: (rawModuleScores as any)?.TWS || 0,
      HFME: (rawModuleScores as any)?.HFME || 0,
      DPEM: (rawModuleScores as any)?.DPEM || 0,
      CNR: (rawModuleScores as any)?.CNR || 0,
      BPSC: (rawModuleScores as any)?.BPSC || 0,
      ACS: (rawModuleScores as any)?.ACS || 0,
      PIE: data.pie_score || 0,
      VFP: data.vfp_score || 0,
      TMG: data.tmg_score || 0,
    };
    
    return {
      ...data,
      module_scores: moduleScores,
      pie_score: data.pie_score || 0,
      vfp_score: data.vfp_score || 0,
      tmg_score: data.tmg_score || 0,
    } as HacsIntelligence;
  }
  
  /**
   * Fetch blueprint data from User 360 service (proper architecture)
   * This respects the data flow and uses the aggregated profile
   */
  private static async fetchBlueprintFromUser360(userId: string): Promise<LayeredBlueprint | null> {
    try {
      // Get from User 360 profiles first (proper architecture)
      const { data: profile360, error: profileError } = await supabase
        .from('user_360_profiles')
        .select('profile_data')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (!profileError && profile360?.profile_data && typeof profile360.profile_data === 'object') {
        const profileData = profile360.profile_data as any;
        if (profileData.blueprint) {
          console.log('🌟 Using User 360 aggregated blueprint data');
          return profileData.blueprint as unknown as LayeredBlueprint;
        }
      }
      
      // Fallback to direct blueprint fetch if User 360 not available
      console.log('🔄 Falling back to direct blueprint fetch');
      const { data, error } = await supabase
        .from('blueprints')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();
        
      if (error) {
        console.error('🚨 Error fetching blueprint:', error);
        return null;
      }
      
      if (!data) return null;
      
      // Transform blueprints table structure to match User 360 format
      return {
        user_meta: data.user_meta,
        cognition_mbti: data.cognition_mbti,
        human_design: data.energy_strategy_human_design,
        astrology: data.archetype_western,
        energy_strategy_human_design: data.energy_strategy_human_design,
        archetype_western: data.archetype_western,
        archetype_chinese: data.archetype_chinese,
        values_life_path: data.values_life_path,
        timing_overlays: data.timing_overlays,
        bashar_suite: data.bashar_suite
      } as unknown as LayeredBlueprint;
      
    } catch (error) {
      console.error('🚨 Rich Intelligence Bridge blueprint fetch error:', error);
      return null;
    }
  }
  
  /**
   * Extract personalization configuration from blueprint
   * Fixed to match actual User 360 blueprint structure
   */
  private static extractPersonalizationConfig(blueprint: LayeredBlueprint | null, language: Language = 'en'): WarmInsightConfig {
    if (!blueprint) {
      return { userName: language === 'nl' ? 'vriend' : 'friend', communicationPreference: 'encouraging', language };
    }
    
    // Extract MBTI from actual blueprint structure
    const mbtiType = (blueprint as any).user_meta?.personality?.likelyType || 
                     (blueprint as any).cognition_mbti?.type ||
                     (blueprint as any).mbti?.type;
    
    // Extract Human Design type from actual structure  
    const humanDesignType = (blueprint as any).human_design?.type ||
                           (blueprint as any).energy_strategy_human_design?.type;
    
    // Extract sun sign from actual astrology structure
    const sunSign = (blueprint as any).astrology?.sun_sign ||
                    (blueprint as any).archetype_western?.sun_sign;
    
    console.log('🔬 Blueprint extraction results:', {
      mbtiType,
      humanDesignType, 
      sunSign,
      userName: (blueprint as any).user_meta?.preferred_name
    });
    
    return {
      userName: (blueprint as any).user_meta?.preferred_name || 
                (blueprint as any).user_meta?.full_name?.split(' ')[0] || 
                (language === 'nl' ? 'vriend' : 'friend'),
      mbtiType,
      humanDesignType,
      sunSign,
      communicationPreference: this.determineCommunicationStyle(blueprint, mbtiType, humanDesignType),
      language
    };
  }
  
  /**
   * Determine communication style based on personality traits
   * Enhanced with proper data extraction
   */
  private static determineCommunicationStyle(
    blueprint: LayeredBlueprint, 
    mbtiType?: string, 
    humanDesignType?: string
  ): 'encouraging' | 'direct' | 'mystical' | 'practical' {
    
    // Use extracted MBTI type or fallback to blueprint access
    const mbti = mbtiType || (blueprint as any).user_meta?.personality?.likelyType;
    const hdType = humanDesignType || (blueprint as any).human_design?.type;
    
    console.log('🎯 Communication style determination:', { mbti, hdType });
    
    // Feeling types prefer encouraging
    if (mbti?.includes('F')) return 'encouraging';
    
    // Thinking types prefer direct  
    if (mbti?.includes('T')) return 'direct';
    
    // Projectors often resonate with mystical
    if (hdType === 'Projector') return 'mystical';
    
    // Default to practical
    return 'practical';
  }
  
  /**
   * Transform module scores into warm, personalized insights
   */
  private static transformModuleScoresToWarmInsights(
    hacsData: HacsIntelligence, 
    config: WarmInsightConfig
  ): HACSInsight[] {
    const insights: HACSInsight[] = [];
    const moduleScores = hacsData.module_scores;
    
    // Find strongest and developing modules
    const moduleEntries = Object.entries(moduleScores) as [keyof ModuleScores, number][];
    const sortedModules = moduleEntries.sort(([,a], [,b]) => b - a);
    
    const strongestModule = sortedModules[0];
    const developingModule = sortedModules[sortedModules.length - 1];
    
    // Generate strength insight (only for users with real progress)
    if (strongestModule && strongestModule[1] > 15) {
      insights.push(this.generateStrengthInsight(strongestModule, config));
    }
    
    // Generate growth insight for developing module (only if user has some baseline activity)
    if (developingModule && developingModule[1] < 40 && hacsData.interaction_count > 8) {
      insights.push(this.generateGrowthInsight(developingModule, config));
    }
    
    // Generate overall intelligence insight
    if (hacsData.intelligence_level > 0) {
      insights.push(this.generateIntelligencePhaseInsight(hacsData.intelligence_level, config));
    }
    
    // Generate conversation adaptation insight if ACS is notable
    if (moduleScores.ACS > 15) {
      insights.push(this.generateConversationInsight(moduleScores.ACS, config));
    }
    
    return insights.slice(0, 2); // Limit to 2 insights to avoid overwhelming
  }
  
  /**
   * Generate warm insight about user's strongest module
   */
  private static generateStrengthInsight(
    module: [keyof ModuleScores, number], 
    config: WarmInsightConfig
  ): HACSInsight {
    const [moduleKey, score] = module;
    const moduleName = this.getWarmModuleName(moduleKey, config.language);
    const userName = config.userName || (config.language === 'nl' ? 'vriend' : 'friend');
    
    const isDutch = config.language === 'nl';
    const strengthAction = this.getModuleStrength(moduleKey, config.language);
    
    const strengthMessages = {
      encouraging: isDutch ? [
        `${userName}, je ${moduleName} ontwikkelt zich prachtig. Ik zie hoe natuurlijk je ${strengthAction}.`,
        `Ik heb iets wonderbaarlijks aan je opgemerkt, ${userName} - je ${moduleName} heeft een bijzondere kwaliteit. Je ${strengthAction} met zoveel gratie.`,
        `${userName}, er is iets opmerkelijks aan hoe je ${strengthAction}. Je ${moduleName} wordt steeds verfijnder.`
      ] : [
        `${userName}, your ${moduleName} is beautifully developing. I see how naturally you ${strengthAction}.`,
        `I've noticed something wonderful about you, ${userName} - your ${moduleName} has a special quality. You ${strengthAction} with such grace.`,
        `${userName}, there's something remarkable about how you ${strengthAction}. Your ${moduleName} is becoming quite refined.`
      ],
      direct: isDutch ? [
        `${userName}, je ${moduleName} is je sterkste troef. Je ${strengthAction} consequent.`,
        `Je ${moduleName} valt op, ${userName}. Je ${strengthAction} beter dan de meesten.`,
        `${userName}, je excelleert in ${moduleName}. Blijf gebruikmaken van hoe je ${strengthAction}.`
      ] : [
        `${userName}, your ${moduleName} is your strongest asset. You consistently ${strengthAction}.`,
        `Your ${moduleName} stands out, ${userName}. You ${strengthAction} better than most.`,
        `${userName}, you excel at ${moduleName}. Keep leveraging how you ${strengthAction}.`
      ],
      mystical: isDutch ? [
        `${userName}, het universum heeft je begiftigd met diepgaande ${moduleName}. Ik voel hoe diep je ${strengthAction}.`,
        `Er is een eeuwenoude wijsheid in je ${moduleName}, ${userName}. De manier waarop je ${strengthAction} verbindt met iets tijdloos.`,
        `${userName}, je ${moduleName} draagt kosmisch inzicht. Je ${strengthAction} met intuïtieve kennis.`
      ] : [
        `${userName}, the universe has gifted you with profound ${moduleName}. I sense how deeply you ${strengthAction}.`,
        `There's an ancient wisdom in your ${moduleName}, ${userName}. The way you ${strengthAction} connects to something timeless.`,
        `${userName}, your ${moduleName} carries cosmic insight. You ${strengthAction} with intuitive knowing.`
      ],
      practical: isDutch ? [
        `${userName}, je ${moduleName} is een betrouwbare kracht. Je ${strengthAction} consistent.`,
        `Je ${moduleName} werkt goed voor je, ${userName}. Je ${strengthAction} effectief.`,
        `${userName}, je hebt solide ${moduleName} ontwikkeld. De manier waarop je ${strengthAction} dient je goed.`
      ] : [
        `${userName}, your ${moduleName} is a reliable strength. You consistently ${strengthAction}.`,
        `Your ${moduleName} works well for you, ${userName}. You ${strengthAction} effectively.`,
        `${userName}, you've developed solid ${moduleName}. The way you ${strengthAction} serves you well.`
      ]
    };
    
    const style = config.communicationPreference || 'encouraging';
    const messages = strengthMessages[style];
    const selectedMessage = messages[Math.floor(Math.random() * messages.length)];
    
    return {
      id: `strength_${moduleKey}_${Date.now()}`,
      text: selectedMessage,
      module: isDutch ? 'Intelligentie Kracht' : 'Intelligence Strength',
      type: 'growth',
      confidence: 0.9,
      evidence: [isDutch ? `Je ${moduleName} toont consistente ontwikkeling` : `Your ${moduleName} shows consistent development`],
      timestamp: new Date(),
      acknowledged: false,
      priority: 'medium'
    };
  }
  
  /**
   * Generate warm insight about user's developing module
   */
  private static generateGrowthInsight(
    module: [keyof ModuleScores, number], 
    config: WarmInsightConfig
  ): HACSInsight {
    const [moduleKey, score] = module;
    const moduleName = this.getWarmModuleName(moduleKey);
    const userName = config.userName || 'friend';
    
    const growthMessages = {
      encouraging: [
        `${userName}, your ${moduleName} is just beginning to bloom. I see beautiful potential in how you approach ${this.getModuleGrowthArea(moduleKey)}.`,
        `${userName}, there's such gentle strength emerging in your ${moduleName}. You're naturally learning to ${this.getModuleGrowthArea(moduleKey)}.`,
        `I feel excited about your ${moduleName} journey, ${userName}. You're developing a wonderful capacity for ${this.getModuleGrowthArea(moduleKey)}.`
      ],
      direct: [
        `${userName}, your ${moduleName} has room for improvement. Focus on ${this.getModuleGrowthArea(moduleKey)} to strengthen this area.`,
        `${userName}, developing your ${moduleName} would serve you well. Work on ${this.getModuleGrowthArea(moduleKey)}.`,
        `${userName}, your ${moduleName} is your next growth edge. Practice ${this.getModuleGrowthArea(moduleKey)} regularly.`
      ],
      mystical: [
        `${userName}, your ${moduleName} is awakening to new possibilities. The path of ${this.getModuleGrowthArea(moduleKey)} calls to your soul.`,
        `${userName}, I sense your ${moduleName} is ready for transformation. Trust your journey in ${this.getModuleGrowthArea(moduleKey)}.`,
        `${userName}, your ${moduleName} holds sacred potential. Allow yourself to explore ${this.getModuleGrowthArea(moduleKey)} with wonder.`
      ],
      practical: [
        `${userName}, your ${moduleName} is developing steadily. Continue working on ${this.getModuleGrowthArea(moduleKey)}.`,
        `${userName}, you're building your ${moduleName} step by step. Keep practicing ${this.getModuleGrowthArea(moduleKey)}.`,
        `${userName}, your ${moduleName} is a work in progress. Regular attention to ${this.getModuleGrowthArea(moduleKey)} will help.`
      ]
    };
    
    const style = config.communicationPreference || 'encouraging';
    const messages = growthMessages[style];
    const selectedMessage = messages[Math.floor(Math.random() * messages.length)];
    
    return {
      id: `growth_${moduleKey}_${Date.now()}`,
      text: selectedMessage,
      module: 'Intelligence Growth',
      type: 'learning',
      confidence: 0.8,
      evidence: [`Your ${moduleName} shows potential for development`],
      timestamp: new Date(),
      acknowledged: false,
      priority: 'medium'
    };
  }
  
  /**
   * Generate warm insight about overall intelligence phase
   */
  private static generateIntelligencePhaseInsight(
    intelligenceLevel: number, 
    config: WarmInsightConfig
  ): HACSInsight {
    const userName = config.userName || 'friend';
    const phase = this.getIntelligencePhase(intelligenceLevel);
    
    const phaseMessages = {
      Awakening: `${userName}, you're in a beautiful awakening phase. Your mind is opening to new ways of understanding yourself and the world.`,
      Learning: `${userName}, you're in an active learning phase. I can sense your curiosity growing and your insights deepening.`,
      Developing: `${userName}, you're in a powerful development phase. Your understanding is becoming more sophisticated and nuanced.`,
      Advanced: `${userName}, you've reached an advanced phase of understanding. Your wisdom is becoming a source of strength.`,
      Autonomous: `${userName}, you've achieved autonomous intelligence. Your insights now flow with remarkable clarity and depth.`
    };
    
    return {
      id: `phase_${Date.now()}`,
      text: phaseMessages[phase as keyof typeof phaseMessages] || phaseMessages.Awakening,
      module: 'Intelligence Phase',
      type: 'intelligence_trend',
      confidence: 0.95,
      evidence: [`Currently in ${phase} phase`],
      timestamp: new Date(),
      acknowledged: false,
      priority: 'low'
    };
  }
  
  /**
   * Generate warm insight about conversation adaptation
   */
  private static generateConversationInsight(
    acsScore: number, 
    config: WarmInsightConfig
  ): HACSInsight {
    const userName = config.userName || 'friend';
    
    let message = '';
    if (acsScore > 30) {
      message = `${userName}, I love how naturally you guide our conversations to exactly what you need. You have a gift for creating meaningful dialogue.`;
    } else if (acsScore > 15) {
      message = `${userName}, you're developing a beautiful rhythm in how we connect. I see you becoming more comfortable sharing your deeper thoughts.`;
    } else {
      message = `${userName}, I appreciate your authentic way of communicating. You bring a genuine presence to our conversations.`;
    }
    
    return {
      id: `conversation_${Date.now()}`,
      text: message,
      module: 'Conversation Intelligence',
      type: 'behavioral',
      confidence: 0.85,
      evidence: ['Based on conversation adaptation patterns'],
      timestamp: new Date(),
      acknowledged: false,
      priority: 'low'
    };
  }
  
  /**
   * Get warm, human-readable module names
   */
  private static getWarmModuleName(moduleKey: keyof ModuleScores, language: Language = 'en'): string {
    const moduleNames = language === 'nl' ? {
      NIK: 'leerintegration',
      CPSR: 'patroonherkenning',
      TWS: 'wijsheidssynthese',
      HFME: 'systeemdenken',
      DPEM: 'authentieke expressie',
      CNR: 'harmonienavigatie',
      BPSC: 'zelf-afstemming',
      ACS: 'gespreksflow',
      PIE: 'intuïtieve inzichten',
      VFP: 'informatieverwerking',
      TMG: 'geheugenverbindingen'
    } : {
      NIK: 'learning integration',
      CPSR: 'pattern recognition',
      TWS: 'wisdom synthesis',
      HFME: 'systems thinking',
      DPEM: 'authentic expression',
      CNR: 'harmony navigation',
      BPSC: 'self-alignment',
      ACS: 'conversation flow',
      PIE: 'intuitive insights',
      VFP: 'information processing',
      TMG: 'memory connections'
    };
    
    return moduleNames[moduleKey] || (language === 'nl' ? 'intelligentie' : 'intelligence');
  }
  
  /**
   * Get what the user excels at for each module
   */
  private static getModuleStrength(moduleKey: keyof ModuleScores, language: Language = 'en'): string {
    const strengths = {
      NIK: 'connect ideas and integrate new learning',
      CPSR: 'recognize patterns and spot meaningful connections',
      TWS: 'weave experiences into deeper wisdom',
      HFME: 'organize complex information into clear frameworks',
      DPEM: 'express yourself authentically and adapt your communication',
      CNR: 'navigate challenges with grace and find harmonious solutions',
      BPSC: 'stay aligned with your values and authentic self',
      ACS: 'guide conversations toward meaningful depth',
      PIE: 'generate insights and see possibilities others miss',
      VFP: 'process complex information with remarkable clarity',
      TMG: 'create meaningful connections between past and present experiences'
    };
    
    return strengths[moduleKey] || 'process information thoughtfully';
  }
  
  /**
   * Get growth areas for each module
   */
  private static getModuleGrowthArea(moduleKey: keyof ModuleScores): string {
    const growthAreas = {
      NIK: 'connecting different ideas and building on what you learn',
      CPSR: 'noticing patterns in your experiences and responses',
      TWS: 'reflecting on experiences to extract deeper wisdom',
      HFME: 'organizing thoughts and creating clear mental frameworks',
      DPEM: 'expressing yourself more authentically in different contexts',
      CNR: 'approaching conflicts with curiosity rather than avoidance',
      BPSC: 'checking in with your values and staying true to yourself',
      ACS: 'guiding conversations toward what truly matters to you',
      PIE: 'trusting your intuition and exploring "what if" scenarios',
      VFP: 'taking time to fully process information before responding',
      TMG: 'reflecting on how past experiences inform your current choices'
    };
    
    return growthAreas[moduleKey] || 'developing this aspect of your intelligence';
  }
  
  /**
   * Get intelligence phase name
   */
  private static getIntelligencePhase(level: number): string {
    if (level >= 100) return 'Autonomous';
    if (level >= 75) return 'Advanced';
    if (level >= 50) return 'Developing';
    if (level >= 25) return 'Learning';
    return 'Awakening';
  }
}