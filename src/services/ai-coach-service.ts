import { supabase } from "@/integrations/supabase/client";
import { PersonalityEngine } from "@/services/personality-engine";
import { blueprintService } from "@/services/blueprint-service";

export interface AICoachResponse {
  response: string;
  conversationId: string | null;
}

export type AgentType = "coach" | "guide" | "blend";

export const aiCoachService = {
  async sendMessage(
    message: string,
    sessionId: string = "default",
    includeBlueprint: boolean = true,
    agentType: AgentType = "guide",
    language: string = "en"
  ): Promise<AICoachResponse> {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        throw new Error("User not authenticated");
      }

      const userId = authData.user.id;
      
      let systemPrompt = "";
      
      if (includeBlueprint) {
        // Load user's blueprint data from the database
        console.log("Loading user blueprint for personalized coaching...");
        const { data: blueprintData, error: blueprintError } = await blueprintService.getActiveBlueprintData();
        
        if (blueprintError) {
          console.warn("Could not load blueprint data:", blueprintError);
          systemPrompt = this.generateFallbackPrompt(agentType, language);
        } else if (blueprintData) {
          console.log("Blueprint loaded successfully:", blueprintData);
          
          // Create personality engine with actual blueprint data
          const personalityEngine = new PersonalityEngine();
          
          // Convert blueprint data to personality modules format
          const personalityBlueprint = this.convertBlueprintToPersonalityModules(blueprintData);
          console.log("Converted personality blueprint:", personalityBlueprint);
          
          personalityEngine.updateBlueprint(personalityBlueprint);
          
          // Generate personalized system prompt
          systemPrompt = personalityEngine.generateSystemPrompt(agentType);
          
          console.log("Generated personalized prompt for agent type:", agentType);
          console.log("System prompt preview:", systemPrompt.substring(0, 200) + "...");
        } else {
          console.log("No blueprint data found, using fallback prompt");
          systemPrompt = this.generateFallbackPrompt(agentType, language);
        }
      } else {
        systemPrompt = this.generateFallbackPrompt(agentType, language);
      }

      const { data, error } = await supabase.functions.invoke("ai-coach", {
        body: {
          message,
          userId,
          sessionId,
          includeBlueprint,
          agentType,
          systemPrompt,
          language,
        },
      });

      if (error) {
        console.error("Error calling AI Coach:", error);
        throw new Error(error.message || "Failed to connect to AI Coach");
      }

      return data as AICoachResponse;
    } catch (err) {
      console.error("Error in AI Coach service:", err);
      throw err;
    }
  },

  // Convert blueprint data to personality modules format
  convertBlueprintToPersonalityModules(blueprintData: any) {
    console.log("Converting blueprint data to personality modules:", blueprintData);
    
    // Extract all the relevant data with fallbacks
    const mbtiType = blueprintData.cognition_mbti?.type || null;
    const sunSign = blueprintData.archetype_western?.sun_sign || null;
    const hdType = blueprintData.energy_strategy_human_design?.type || null;
    const hdAuthority = blueprintData.energy_strategy_human_design?.authority || null;
    const hdStrategy = blueprintData.energy_strategy_human_design?.strategy || null;
    const lifePathNumber = blueprintData.values_life_path?.lifePathNumber || null;
    const chineseAnimal = blueprintData.archetype_chinese?.animal || null;
    const chineseElement = blueprintData.archetype_chinese?.element || null;
    
    console.log("Extracted traits:", {
      mbtiType,
      sunSign,
      hdType,
      hdAuthority,
      hdStrategy,
      lifePathNumber,
      chineseAnimal,
      chineseElement
    });
    
    return {
      cognitiveTemperamental: {
        mbtiType: mbtiType || "Unknown",
        functions: this.extractCognitiveFunctions(mbtiType),
        taskApproach: this.extractTaskApproach(blueprintData),
        communicationStyle: this.extractCommunicationStyle(blueprintData),
        decisionMaking: this.extractDecisionMaking(blueprintData)
      },
      energyDecisionStrategy: {
        humanDesignType: hdType || "Unknown",
        authority: hdAuthority || "Unknown",
        decisionStyle: this.extractDecisionStyle(blueprintData),
        pacing: this.extractPacing(blueprintData),
        energyType: hdType || "Unknown",
        strategy: hdStrategy || "Unknown"
      },
      motivationBeliefEngine: {
        mindset: this.extractMindset(blueprintData),
        motivation: this.extractMotivations(blueprintData),
        stateManagement: this.extractStateManagement(blueprintData),
        coreBeliefs: this.extractCoreBeliefs(blueprintData),
        drivingForces: this.extractDrivingForces(blueprintData)
      },
      coreValuesNarrative: {
        lifePath: lifePathNumber || 0,
        meaningfulAreas: this.extractMeaningfulAreas(blueprintData),
        anchoringVision: this.extractAnchoringVision(blueprintData),
        lifeThemes: this.extractLifeThemes(blueprintData),
        valueSystem: this.extractValueSystem(blueprintData)
      },
      publicArchetype: {
        sunSign: sunSign || "Unknown",
        socialStyle: this.extractSocialStyle(blueprintData),
        publicVibe: this.extractPublicVibe(blueprintData),
        publicPersona: this.extractPublicPersona(blueprintData),
        leadershipStyle: this.extractLeadershipStyle(blueprintData)
      },
      generationalCode: {
        chineseZodiac: chineseAnimal || "Unknown",
        element: chineseElement || "Unknown",
        cohortTint: this.extractCohortTint(blueprintData)
      },
      surfaceExpression: {
        observableStyle: this.extractObservableStyle(blueprintData),
        realWorldImpact: this.extractRealWorldImpact(blueprintData)
      },
      marketingArchetype: {
        messagingStyle: this.extractMessagingStyle(blueprintData),
        socialHooks: this.extractSocialHooks(blueprintData)
      },
      goalPersona: {
        currentMode: 'guide' as const,
        serviceRole: this.extractServiceRole(blueprintData),
        coachingTone: this.extractCoachingTone(blueprintData)
      },
      interactionPreferences: {
        rapportStyle: this.extractRapportStyle(blueprintData),
        storyPreference: this.extractStoryPreference(blueprintData),
        empathyLevel: this.extractEmpathyLevel(blueprintData),
        conflictStyle: this.extractConflictStyle(blueprintData),
        collaborationStyle: this.extractCollaborationStyle(blueprintData)
      }
    };
  },

  // Enhanced extraction methods with detailed personality profiling
  extractCognitiveFunctions(mbtiType: string | null): string[] {
    if (!mbtiType) return ["balanced cognitive processing"];
    
    const functionMap: Record<string, string[]> = {
      'INTJ': ['Ni (visionary)', 'Te (systematic)', 'Fi (values)', 'Se (experiential)'],
      'INTP': ['Ti (analytical)', 'Ne (possibilities)', 'Si (detailed)', 'Fe (harmony)'],
      'ENTJ': ['Te (organizing)', 'Ni (strategic)', 'Se (action)', 'Fi (personal)'],
      'ENTP': ['Ne (innovative)', 'Ti (logical)', 'Fe (social)', 'Si (traditional)'],
      'INFJ': ['Ni (insightful)', 'Fe (empathetic)', 'Ti (precise)', 'Se (present)'],
      'INFP': ['Fi (authentic)', 'Ne (creative)', 'Si (personal)', 'Te (efficient)'],
      'ENFJ': ['Fe (people-focused)', 'Ni (future-oriented)', 'Se (adaptable)', 'Ti (analytical)'],
      'ENFP': ['Ne (enthusiastic)', 'Fi (value-driven)', 'Te (goal-oriented)', 'Si (detailed)']
    };
    
    return functionMap[mbtiType] || ['balanced cognitive approach'];
  },

  extractTaskApproach(blueprintData: any): string {
    const mbti = blueprintData.cognition_mbti?.type;
    const hdType = blueprintData.energy_strategy_human_design?.type;
    
    if (mbti?.includes('J') && hdType === 'Manifestor') return "structured initiating with clear planning";
    if (mbti?.includes('J') && hdType === 'Projector') return "systematic guidance with strategic oversight";
    if (mbti?.includes('J') && hdType === 'Generator') return "methodical building with sustained focus";
    if (mbti?.includes('P') && hdType === 'Projector') return "flexible guidance adapting to what emerges";
    if (mbti?.includes('P') && hdType === 'Generator') return "responsive building following energy and interest";
    if (hdType === 'Manifestor') return "initiating action with independent direction";
    if (hdType === 'Projector') return "guiding and optimizing systems and people";
    if (hdType === 'Generator') return "building through sustained responsive energy";
    if (mbti?.includes('J')) return "structured and organized approach";
    if (mbti?.includes('P')) return "flexible and adaptive approach";
    return "balanced task approach";
  },

  extractCommunicationStyle(blueprintData: any): string {
    const sunSign = blueprintData.archetype_western?.sun_sign;
    const mbti = blueprintData.cognition_mbti?.type;
    
    const communicationMap: Record<string, string> = {
      'Aries': 'direct and energetic',
      'Taurus': 'steady and practical', 
      'Gemini': 'articulate and curious',
      'Cancer': 'nurturing and intuitive',
      'Leo': 'warm and expressive',
      'Virgo': 'precise and helpful',
      'Libra': 'diplomatic and harmonious',
      'Scorpio': 'intense and insightful',
      'Sagittarius': 'enthusiastic and philosophical',
      'Capricorn': 'structured and purposeful',
      'Aquarius': 'innovative and detached',
      'Pisces': 'empathetic and flowing'
    };
    
    const baseStyle = communicationMap[sunSign] || 'clear and authentic';
    
    if (mbti?.includes('E')) return `${baseStyle} with outward expression`;
    if (mbti?.includes('I')) return `${baseStyle} with thoughtful reflection`;
    return baseStyle;
  },

  extractDecisionMaking(blueprintData: any): string {
    const authority = blueprintData.energy_strategy_human_design?.authority;
    const mbti = blueprintData.cognition_mbti?.type;
    
    if (authority === 'Emotional') return "emotional clarity through time and feeling";
    if (authority === 'Sacral') return "gut response and body wisdom";
    if (authority === 'Splenic') return "intuitive awareness in the moment";
    if (authority === 'Self-Projected') return "speaking truth to hear your direction";
    if (authority === 'Mental') return "talking through options with trusted others";
    if (mbti?.includes('T')) return "logical analysis with objective criteria";
    if (mbti?.includes('F')) return "values-based with consideration for people";
    return "integrated head-heart-gut decision making";
  },

  extractDecisionStyle(blueprintData: any): string {
    return this.extractDecisionMaking(blueprintData);
  },

  extractPacing(blueprintData: any): string {
    const hdType = blueprintData.energy_strategy_human_design?.type;
    if (hdType === 'Manifestor') return "burst-oriented with rest periods";
    if (hdType === 'Generator') return "sustainable building energy";
    if (hdType === 'Projector') return "focused bursts with significant rest";
    return "natural rhythm with rest and activity";
  },

  extractMindset(blueprintData: any): string {
    const lifePathNumber = blueprintData.values_life_path?.lifePathNumber;
    if (lifePathNumber === 1) return "pioneering and leadership-oriented";
    if (lifePathNumber === 7) return "spiritual seeking and analytical";
    if (lifePathNumber === 9) return "humanitarian and completion-focused";
    return "growth-oriented and authentic";
  },

  extractMotivations(blueprintData: any): string[] {
    const motivations = [];
    const lifePathNumber = blueprintData.values_life_path?.lifePathNumber;
    const sunSign = blueprintData.archetype_western?.sun_sign;
    const hdType = blueprintData.energy_strategy_human_design?.type;
    
    if (lifePathNumber === 1) motivations.push("leadership and independence");
    if (lifePathNumber === 2) motivations.push("harmony and cooperation");
    if (lifePathNumber === 3) motivations.push("creative expression and communication");
    if (lifePathNumber === 7) motivations.push("deep understanding and spiritual wisdom");
    if (lifePathNumber === 9) motivations.push("service to humanity and completion");
    
    if (['Leo', 'Aries', 'Capricorn'].includes(sunSign)) motivations.push("achievement and recognition");
    if (['Cancer', 'Pisces', 'Virgo'].includes(sunSign)) motivations.push("helping and nurturing others");
    if (['Gemini', 'Aquarius', 'Sagittarius'].includes(sunSign)) motivations.push("learning and sharing knowledge");
    
    if (hdType === 'Projector') motivations.push("guiding and optimizing others");
    if (hdType === 'Generator') motivations.push("building and creating through response");
    if (hdType === 'Manifestor') motivations.push("initiating change and innovation");
    
    return motivations.length > 0 ? motivations : ["personal growth", "authentic self-expression"];
  },

  extractStateManagement(blueprintData: any): string {
    const authority = blueprintData.energy_strategy_human_design?.authority;
    if (authority === 'Emotional') return "riding the emotional wave with patience";
    if (authority === 'Sacral') return "honoring body wisdom and energy levels";
    return "mindful awareness of internal states";
  },

  extractCoreBeliefs(blueprintData: any): string[] {
    const beliefs = [];
    const lifePathNumber = blueprintData.values_life_path?.lifePathNumber;
    
    if (lifePathNumber === 1) beliefs.push("I am here to lead and pioneer new paths");
    if (lifePathNumber === 7) beliefs.push("Deep understanding comes through spiritual seeking");
    if (lifePathNumber === 9) beliefs.push("Service to others is my highest calling");
    
    beliefs.push("Growth happens through authentic self-expression");
    beliefs.push("Every experience offers wisdom and learning");
    
    return beliefs;
  },

  extractDrivingForces(blueprintData: any): string[] {
    return ["authentic self-expression", "meaningful impact", "personal evolution"];
  },

  extractMeaningfulAreas(blueprintData: any): string[] {
    const areas = [];
    const hdType = blueprintData.energy_strategy_human_design?.type;
    const sunSign = blueprintData.archetype_western?.sun_sign;
    
    if (hdType === 'Projector') areas.push("guiding others", "systems optimization", "recognition of gifts");
    if (hdType === 'Generator') areas.push("building and creating", "responding to what lights you up", "mastery through practice");
    if (hdType === 'Manifestor') areas.push("initiating change", "independent action", "innovation and impact");
    
    if (['Gemini', 'Aquarius', 'Sagittarius'].includes(sunSign)) areas.push("learning and teaching", "sharing knowledge");
    if (['Taurus', 'Virgo', 'Capricorn'].includes(sunSign)) areas.push("practical achievement", "building lasting value");
    if (['Cancer', 'Scorpio', 'Pisces'].includes(sunSign)) areas.push("emotional depth", "healing and transformation");
    
    return areas.length > 0 ? areas : ["personal development", "meaningful relationships", "creative expression"];
  },

  extractAnchoringVision(blueprintData: any): string {
    const lifePathNumber = blueprintData.values_life_path?.lifePathNumber;
    if (lifePathNumber === 1) return "being a pioneering leader who opens new paths for others";
    if (lifePathNumber === 7) return "becoming a wise spiritual seeker who bridges worlds";
    if (lifePathNumber === 9) return "serving humanity through compassionate wisdom and completion";
    return "living authentically while making a meaningful difference in the world";
  },

  extractLifeThemes(blueprintData: any): string[] {
    const themes = [];
    const lifePathNumber = blueprintData.values_life_path?.lifePathNumber;
    const hdType = blueprintData.energy_strategy_human_design?.type;
    
    if (lifePathNumber === 1) themes.push("leadership", "independence", "pioneering");
    if (lifePathNumber === 7) themes.push("spiritual seeking", "deep analysis", "mystical understanding");
    if (lifePathNumber === 9) themes.push("humanitarian service", "wisdom sharing", "completion");
    
    if (hdType === 'Projector') themes.push("guidance", "recognition", "efficiency");
    if (hdType === 'Generator') themes.push("building", "responding", "mastery");
    if (hdType === 'Manifestor') themes.push("initiation", "impact", "independence");
    
    themes.push("authentic self-expression", "personal growth");
    
    return themes;
  },

  extractValueSystem(blueprintData: any): string {
    return "authenticity-based with emphasis on growth and meaningful contribution";
  },

  extractSocialStyle(blueprintData: any): string {
    const mbti = blueprintData.cognition_mbti?.type;
    const sunSign = blueprintData.archetype_western?.sun_sign;
    
    if (mbti?.includes('E')) {
      if (['Leo', 'Aries', 'Sagittarius'].includes(sunSign)) return "charismatic and inspiring leader";
      if (['Gemini', 'Libra', 'Aquarius'].includes(sunSign)) return "social connector and idea sharer";
      return "warm and engaging presence";
    }
    if (mbti?.includes('I')) {
      if (['Scorpio', 'Capricorn', 'Virgo'].includes(sunSign)) return "quietly powerful and observant";
      if (['Cancer', 'Pisces'].includes(sunSign)) return "deeply empathetic and intuitive";
      return "thoughtful and authentic presence";
    }
    return "balanced and approachable social style";
  },

  extractPublicVibe(blueprintData: any): string {
    const sunSign = blueprintData.archetype_western?.sun_sign;
    const vibeMap: Record<string, string> = {
      'Leo': 'radiant confidence and warmth',
      'Scorpio': 'magnetic intensity and depth',
      'Aquarius': 'innovative uniqueness and detachment',
      'Aries': 'dynamic energy and directness',
      'Libra': 'harmonious charm and balance'
    };
    return vibeMap[sunSign] || 'authentic and genuine presence';
  },

  extractPublicPersona(blueprintData: any): string {
    const hdType = blueprintData.energy_strategy_human_design?.type;
    const sunSign = blueprintData.archetype_western?.sun_sign;
    
    if (hdType === 'Projector' && ['Leo', 'Capricorn'].includes(sunSign)) return "wise guide with natural authority";
    if (hdType === 'Generator' && ['Taurus', 'Virgo'].includes(sunSign)) return "reliable builder with steady presence";
    if (hdType === 'Manifestor' && ['Aries', 'Scorpio'].includes(sunSign)) return "powerful initiator with transformative impact";
    
    return "authentic self with purposeful presence";
  },

  extractLeadershipStyle(blueprintData: any): string {
    const hdType = blueprintData.energy_strategy_human_design?.type;
    const mbti = blueprintData.cognition_mbti?.type;
    
    if (hdType === 'Projector') return "guiding and optimizing through wisdom";
    if (hdType === 'Manifestor') return "initiating and directing with independence";
    if (hdType === 'Generator') return "leading by example through dedicated building";
    if (mbti?.includes('J')) return "structured and organized leadership";
    if (mbti?.includes('P')) return "adaptive and inspirational leadership";
    return "collaborative and authentic leadership";
  },

  extractCohortTint(blueprintData: any): string {
    const chineseAnimal = blueprintData.archetype_chinese?.animal;
    if (['Dragon', 'Tiger', 'Horse'].includes(chineseAnimal)) return "dynamic and ambitious generational energy";
    if (['Ox', 'Snake', 'Rooster'].includes(chineseAnimal)) return "steady and methodical generational approach";
    return "balanced generational perspective";
  },

  extractObservableStyle(blueprintData: any): string {
    return `${this.extractSocialStyle(blueprintData)} with ${this.extractCommunicationStyle(blueprintData)}`;
  },

  extractRealWorldImpact(blueprintData: any): string {
    const hdType = blueprintData.energy_strategy_human_design?.type;
    if (hdType === 'Projector') return "optimizing systems and guiding others to efficiency";
    if (hdType === 'Generator') return "building sustainable value through dedicated work";
    if (hdType === 'Manifestor') return "initiating change and creating new possibilities";
    return "contributing unique gifts for meaningful impact";
  },

  extractMessagingStyle(blueprintData: any): string {
    const communicationStyle = this.extractCommunicationStyle(blueprintData);
    return `${communicationStyle} with authentic personal touch`;
  },

  extractSocialHooks(blueprintData: any): string[] {
    const hooks = [];
    const sunSign = blueprintData.archetype_western?.sun_sign;
    const hdType = blueprintData.energy_strategy_human_design?.type;
    
    if (['Leo', 'Aries'].includes(sunSign)) hooks.push("inspiring leadership stories");
    if (['Gemini', 'Aquarius'].includes(sunSign)) hooks.push("innovative ideas and insights");
    if (['Cancer', 'Pisces'].includes(sunSign)) hooks.push("emotional depth and empathy");
    if (hdType === 'Projector') hooks.push("wisdom and guidance");
    if (hdType === 'Generator') hooks.push("sustainable building and dedication");
    
    hooks.push("authentic vulnerability", "personal growth journey");
    return hooks;
  },

  extractServiceRole(blueprintData: any): string {
    const hdType = blueprintData.energy_strategy_human_design?.type;
    if (hdType === 'Projector') return "guide and systems optimizer";
    if (hdType === 'Generator') return "builder and responsive creator";
    if (hdType === 'Manifestor') return "initiator and change catalyst";
    return "authentic guide and supporter";
  },

  extractCoachingTone(blueprintData: any): string {
    const authority = blueprintData.energy_strategy_human_design?.authority;
    const sunSign = blueprintData.archetype_western?.sun_sign;
    
    if (authority === 'Emotional') return "patient and emotionally attuned";
    if (['Cancer', 'Pisces'].includes(sunSign)) return "nurturing and empathetic";
    if (['Capricorn', 'Virgo'].includes(sunSign)) return "practical and supportive";
    return "warm and encouraging";
  },

  extractRapportStyle(blueprintData: any): string {
    const mbti = blueprintData.cognition_mbti?.type;
    const authority = blueprintData.energy_strategy_human_design?.authority;
    
    if (authority === 'Emotional') return "emotionally attuned and patient";
    if (mbti?.includes('F')) return "empathetic and validating";
    if (mbti?.includes('T')) return "respectful and direct";
    return "understanding and authentic";
  },

  extractStoryPreference(blueprintData: any): string {
    const sunSign = blueprintData.archetype_western?.sun_sign;
    if (['Sagittarius', 'Gemini'].includes(sunSign)) return "philosophical and exploratory narratives";
    if (['Cancer', 'Pisces'].includes(sunSign)) return "emotional and meaningful stories";
    return "authentic personal journey stories";
  },

  extractEmpathyLevel(blueprintData: any): string {
    const mbti = blueprintData.cognition_mbti?.type;
    const sunSign = blueprintData.archetype_western?.sun_sign;
    
    if (mbti?.includes('F') && ['Cancer', 'Pisces'].includes(sunSign)) return "deeply empathetic and intuitive";
    if (mbti?.includes('F')) return "naturally empathetic";
    if (mbti?.includes('T')) return "cognitively empathetic";
    return "balanced empathy";
  },

  extractConflictStyle(blueprintData: any): string {
    const sunSign = blueprintData.archetype_western?.sun_sign;
    const mbti = blueprintData.cognition_mbti?.type;
    
    if (sunSign === 'Libra') return "harmonizing and diplomatic";
    if (sunSign === 'Scorpio') return "direct but transformative";
    if (mbti?.includes('F')) return "values-based and relationship-focused";
    if (mbti?.includes('T')) return "logical and solution-focused";
    return "constructive and understanding";
  },

  extractCollaborationStyle(blueprintData: any): string {
    const hdType = blueprintData.energy_strategy_human_design?.type;
    const mbti = blueprintData.cognition_mbti?.type;
    
    if (hdType === 'Projector') return "guiding and optimizing group dynamics";
    if (hdType === 'Generator') return "building and supporting team goals";
    if (hdType === 'Manifestor') return "initiating and directing collaborative efforts";
    if (mbti?.includes('E')) return "engaging and energizing";
    if (mbti?.includes('I')) return "thoughtful and contributing";
    return "supportive and synergistic";
  },

  generateFallbackPrompt(agentType: AgentType, language: string): string {
    const isNL = language === 'nl';
    
    switch (agentType) {
      case 'coach':
        return isNL 
          ? "Je bent de Ziel Coach, gericht op productiviteit en het bereiken van doelen. Bied gestructureerde, actie-gerichte begeleiding."
          : "You are the Soul Coach, focused on productivity and goal achievement. Provide structured, action-oriented guidance.";
      case 'guide':
        return isNL 
          ? "Je bent de Ziel Gids, gericht op persoonlijke groei en levenswijsheid. Bied reflectieve, inzichtelijke begeleiding."
          : "You are the Soul Guide, focused on personal growth and life wisdom. Provide reflective, insightful guidance.";
      case 'blend':
      default:
        return isNL 
          ? "Je bent de Ziel Metgezel, die productiviteit en persoonlijke groei integreert. Bied uitgebalanceerde begeleiding."
          : "You are the Soul Companion, integrating productivity and personal growth. Provide balanced guidance.";
    }
  },

  createNewSession(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
};
