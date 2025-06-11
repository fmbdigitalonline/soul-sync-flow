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
        
        try {
          const { data: blueprintData, error: blueprintError } = await blueprintService.getActiveBlueprintData();
          
          if (blueprintError) {
            console.warn("Blueprint service error:", blueprintError);
            systemPrompt = this.generateFallbackPrompt(agentType, language);
          } else if (blueprintData && Object.keys(blueprintData).length > 0) {
            console.log("Blueprint loaded successfully:", blueprintData);
            
            // Check if we have meaningful blueprint data
            const hasValidData = this.validateBlueprintData(blueprintData);
            
            if (hasValidData) {
              // Create personality engine with actual blueprint data
              const personalityEngine = new PersonalityEngine();
              
              // Convert blueprint data to personality modules format
              const personalityBlueprint = this.convertBlueprintToPersonalityModules(blueprintData, agentType);
              console.log("Converted personality blueprint:", personalityBlueprint);
              
              personalityEngine.updateBlueprint(personalityBlueprint);
              
              // Generate personalized system prompt
              systemPrompt = personalityEngine.generateSystemPrompt(agentType);
              
              console.log("Generated personalized prompt for agent type:", agentType);
              console.log("System prompt preview:", systemPrompt.substring(0, 200) + "...");
            } else {
              console.log("Blueprint data exists but lacks meaningful content, using fallback");
              systemPrompt = this.generateFallbackPrompt(agentType, language);
            }
          } else {
            console.log("No blueprint data found, using fallback prompt");
            systemPrompt = this.generateFallbackPrompt(agentType, language);
          }
        } catch (err) {
          console.error("Error loading blueprint:", err);
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

  // Validate that blueprint data contains meaningful information
  validateBlueprintData(blueprintData: any): boolean {
    if (!blueprintData) return false;
    
    // Check for meaningful data in key sections
    const hasWesternData = blueprintData.archetype_western?.sun_sign && 
                          blueprintData.archetype_western.sun_sign !== 'Unknown';
    
    const hasHumanDesignData = blueprintData.energy_strategy_human_design?.type && 
                              blueprintData.energy_strategy_human_design.type !== 'Generator';
    
    const hasMBTIData = blueprintData.cognition_mbti?.type;
    
    const hasChineseData = blueprintData.archetype_chinese?.animal && 
                          blueprintData.archetype_chinese.animal !== 'Unknown';
    
    const hasLifePathData = blueprintData.values_life_path?.lifePathNumber;
    
    console.log("Blueprint validation:", {
      hasWesternData,
      hasHumanDesignData,
      hasMBTIData,
      hasChineseData,
      hasLifePathData
    });
    
    // Return true if we have at least 2 meaningful data points
    const meaningfulSections = [hasWesternData, hasHumanDesignData, hasMBTIData, hasChineseData, hasLifePathData].filter(Boolean).length;
    return meaningfulSections >= 2;
  },

  // Convert blueprint data to personality modules format
  convertBlueprintToPersonalityModules(blueprintData: any, agentType: AgentType) {
    console.log("Converting blueprint data to enriched personality modules:", blueprintData);
    
    // Extract all the relevant data with fallbacks
    const mbtiType = blueprintData.cognition_mbti?.type || null;
    const sunSign = blueprintData.archetype_western?.sun_sign || null;
    const hdType = blueprintData.energy_strategy_human_design?.type || null;
    const hdAuthority = blueprintData.energy_strategy_human_design?.authority || null;
    const hdStrategy = blueprintData.energy_strategy_human_design?.strategy || null;
    const lifePathNumber = blueprintData.values_life_path?.lifePathNumber || null;
    const chineseAnimal = blueprintData.archetype_chinese?.animal || null;
    const chineseElement = blueprintData.archetype_chinese?.element || null;
    
    // Extract enriched cognitive functions
    const cognitiveFunctions = this.extractEnrichedCognitiveFunctions(mbtiType);
    
    console.log("Extracted enriched traits:", {
      mbtiType,
      cognitiveFunctions,
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
        functions: cognitiveFunctions.functions,
        dominantFunction: cognitiveFunctions.dominant,
        auxiliaryFunction: cognitiveFunctions.auxiliary,
        cognitiveStack: cognitiveFunctions.stack,
        taskApproach: this.extractTaskApproach(blueprintData),
        communicationStyle: this.extractCommunicationStyle(blueprintData),
        decisionMaking: this.extractDecisionMaking(blueprintData),
        informationProcessing: this.extractInformationProcessing(blueprintData)
      },
      energyDecisionStrategy: {
        humanDesignType: hdType || "Unknown",
        authority: hdAuthority || "Unknown",
        decisionStyle: this.extractDecisionStyle(blueprintData),
        pacing: this.extractPacing(blueprintData),
        energyType: hdType || "Unknown",
        strategy: hdStrategy || "Unknown",
        profile: this.extractHumanDesignProfile(blueprintData),
        centers: this.extractDefinedCenters(blueprintData),
        gates: this.extractActiveGates(blueprintData),
        channels: this.extractActiveChannels(blueprintData)
      },
      motivationBeliefEngine: {
        mindset: this.extractMindset(blueprintData),
        motivation: this.extractMotivations(blueprintData),
        stateManagement: this.extractStateManagement(blueprintData),
        coreBeliefs: this.extractCoreBeliefs(blueprintData),
        drivingForces: this.extractDrivingForces(blueprintData),
        excitementCompass: this.extractExcitementCompass(blueprintData),
        frequencyAlignment: this.extractFrequencyAlignment(blueprintData),
        beliefInterface: this.extractBeliefInterface(blueprintData),
        resistancePatterns: this.extractResistancePatterns(blueprintData)
      },
      coreValuesNarrative: {
        lifePath: lifePathNumber || 0,
        meaningfulAreas: this.extractMeaningfulAreas(blueprintData),
        anchoringVision: this.extractAnchoringVision(blueprintData),
        lifeThemes: this.extractLifeThemes(blueprintData),
        valueSystem: this.extractValueSystem(blueprintData),
        northStar: this.extractNorthStar(blueprintData),
        missionStatement: this.extractMissionStatement(blueprintData),
        purposeAlignment: this.extractPurposeAlignment(blueprintData)
      },
      publicArchetype: {
        sunSign: sunSign || "Unknown",
        socialStyle: this.extractSocialStyle(blueprintData),
        publicVibe: this.extractPublicVibe(blueprintData),
        publicPersona: this.extractPublicPersona(blueprintData),
        leadershipStyle: this.extractLeadershipStyle(blueprintData),
        socialMask: this.extractSocialMask(blueprintData),
        externalExpression: this.extractExternalExpression(blueprintData)
      },
      generationalCode: {
        chineseZodiac: chineseAnimal || "Unknown",
        element: chineseElement || "Unknown",
        cohortTint: this.extractCohortTint(blueprintData),
        generationalThemes: this.extractGenerationalThemes(blueprintData),
        collectiveInfluence: this.extractCollectiveInfluence(blueprintData)
      },
      surfaceExpression: {
        observableStyle: this.extractObservableStyle(blueprintData),
        realWorldImpact: this.extractRealWorldImpact(blueprintData),
        behavioralSignatures: this.extractBehavioralSignatures(blueprintData),
        externalManifestations: this.extractExternalManifestations(blueprintData)
      },
      marketingArchetype: {
        messagingStyle: this.extractMessagingStyle(blueprintData),
        socialHooks: this.extractSocialHooks(blueprintData),
        brandPersonality: this.extractBrandPersonality(blueprintData),
        communicationPatterns: this.extractCommunicationPatterns(blueprintData),
        influenceStyle: this.extractInfluenceStyle(blueprintData)
      },
      goalPersona: {
        currentMode: agentType as 'coach' | 'guide' | 'blend',
        serviceRole: this.extractServiceRole(blueprintData),
        coachingTone: this.extractCoachingTone(blueprintData),
        nudgeStyle: this.extractNudgeStyle(blueprintData),
        motivationApproach: this.extractMotivationApproach(blueprintData)
      },
      interactionPreferences: {
        rapportStyle: this.extractRapportStyle(blueprintData),
        storyPreference: this.extractStoryPreference(blueprintData),
        empathyLevel: this.extractEmpathyLevel(blueprintData),
        conflictStyle: this.extractConflictStyle(blueprintData),
        collaborationStyle: this.extractCollaborationStyle(blueprintData),
        feedbackStyle: this.extractFeedbackStyle(blueprintData),
        learningStyle: this.extractLearningStyle(blueprintData)
      },
      timingOverlays: {
        currentTransits: this.extractCurrentTransits(blueprintData),
        seasonalInfluences: this.extractSeasonalInfluences(),
        cyclicalPatterns: this.extractCyclicalPatterns(blueprintData),
        optimalTimings: this.extractOptimalTimings(blueprintData),
        energyWeather: this.extractEnergyWeather(blueprintData)
      },
      proactiveContext: {
        nudgeHistory: this.extractNudgeHistory(blueprintData),
        taskGraph: this.extractTaskGraph(blueprintData),
        streaks: this.extractStreaks(blueprintData),
        moodLog: this.extractMoodLog(blueprintData),
        recentPatterns: this.extractRecentPatterns(blueprintData),
        triggerEvents: this.extractTriggerEvents(blueprintData)
      }
    };
  },

  // Enhanced MBTI cognitive functions extraction
  extractEnrichedCognitiveFunctions(mbtiType: string | null): any {
    if (!mbtiType) return {
      functions: ["balanced cognitive processing"],
      dominant: "integrated awareness",
      auxiliary: "supportive processing", 
      stack: ["balanced thinking", "adaptive feeling", "practical sensing", "creative intuition"]
    };
    
    const functionMap: Record<string, any> = {
      'INTJ': {
        functions: ['Ni (introverted intuition)', 'Te (extraverted thinking)', 'Fi (introverted feeling)', 'Se (extraverted sensing)'],
        dominant: 'Ni - visionary pattern recognition',
        auxiliary: 'Te - systematic implementation',
        stack: ['Ni visionary insight', 'Te structured execution', 'Fi authentic values', 'Se present-moment awareness']
      },
      'INTP': {
        functions: ['Ti (introverted thinking)', 'Ne (extraverted intuition)', 'Si (introverted sensing)', 'Fe (extraverted feeling)'],
        dominant: 'Ti - logical analysis and understanding',
        auxiliary: 'Ne - exploring possibilities and connections',
        stack: ['Ti precise logic', 'Ne creative possibilities', 'Si detailed recall', 'Fe social harmony']
      },
      'ENTJ': {
        functions: ['Te (extraverted thinking)', 'Ni (introverted intuition)', 'Se (extraverted sensing)', 'Fi (introverted feeling)'],
        dominant: 'Te - organized external execution',
        auxiliary: 'Ni - strategic future planning',
        stack: ['Te decisive action', 'Ni strategic vision', 'Se adaptable presence', 'Fi personal values']
      },
      'ENTP': {
        functions: ['Ne (extraverted intuition)', 'Ti (introverted thinking)', 'Fe (extraverted feeling)', 'Si (introverted sensing)'],
        dominant: 'Ne - innovative idea generation',
        auxiliary: 'Ti - logical framework building',
        stack: ['Ne creative innovation', 'Ti analytical precision', 'Fe social connection', 'Si traditional grounding']
      },
      'INFJ': {
        functions: ['Ni (introverted intuition)', 'Fe (extraverted feeling)', 'Ti (introverted thinking)', 'Se (extraverted sensing)'],
        dominant: 'Ni - insightful pattern synthesis',
        auxiliary: 'Fe - empathetic connection and harmony',
        stack: ['Ni deep insight', 'Fe compassionate understanding', 'Ti logical precision', 'Se sensory awareness']
      },
      'INFP': {
        functions: ['Fi (introverted feeling)', 'Ne (extraverted intuition)', 'Si (introverted sensing)', 'Te (extraverted thinking)'],
        dominant: 'Fi - authentic value alignment',
        auxiliary: 'Ne - creative possibility exploration',
        stack: ['Fi authentic values', 'Ne creative exploration', 'Si detailed memory', 'Te practical organization']
      },
      'ENFJ': {
        functions: ['Fe (extraverted feeling)', 'Ni (introverted intuition)', 'Se (extraverted sensing)', 'Ti (introverted thinking)'],
        dominant: 'Fe - people-focused harmony and growth',
        auxiliary: 'Ni - intuitive future visioning',
        stack: ['Fe inspiring connection', 'Ni visionary insight', 'Se adaptive action', 'Ti logical analysis']
      },
      'ENFP': {
        functions: ['Ne (extraverted intuition)', 'Fi (introverted feeling)', 'Te (extraverted thinking)', 'Si (introverted sensing)'],
        dominant: 'Ne - enthusiastic possibility creation',
        auxiliary: 'Fi - value-driven authenticity',
        stack: ['Ne inspiring possibilities', 'Fi authentic passion', 'Te efficient action', 'Si grounding details']
      }
    };
    
    return functionMap[mbtiType] || {
      functions: ['balanced cognitive approach'],
      dominant: 'integrated awareness',
      auxiliary: 'adaptive processing',
      stack: ['balanced cognition']
    };
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

  extractInformationProcessing(blueprintData: any): string {
    const mbti = blueprintData.cognition_mbti?.type;
    if (mbti?.includes('S')) return "detailed and practical information processing";
    if (mbti?.includes('N')) return "pattern-based and conceptual information processing";
    return "balanced information processing";
  },

  extractHumanDesignProfile(blueprintData: any): string {
    return blueprintData.energy_strategy_human_design?.profile || "balanced approach";
  },

  extractDefinedCenters(blueprintData: any): string[] {
    return blueprintData.energy_strategy_human_design?.defined_centers || ["consistent energy flow"];
  },

  extractActiveGates(blueprintData: any): string[] {
    return blueprintData.energy_strategy_human_design?.gates || ["universal connection"];
  },

  extractActiveChannels(blueprintData: any): string[] {
    return blueprintData.energy_strategy_human_design?.channels || ["integrated flow"];
  },

  extractExcitementCompass(blueprintData: any): string {
    return "follow your highest excitement with integrity and purpose";
  },

  extractFrequencyAlignment(blueprintData: any): string {
    return "authentic self-expression at your natural frequency";
  },

  extractBeliefInterface(blueprintData: any): string[] {
    return ["I am worthy of my dreams", "Life supports my highest good", "Every experience offers wisdom"];
  },

  extractResistancePatterns(blueprintData: any): string[] {
    const lifePathNumber = blueprintData.values_life_path?.lifePathNumber;
    const patterns = [];
    
    if (lifePathNumber === 1) patterns.push("fear of not being good enough");
    if (lifePathNumber === 7) patterns.push("perfectionism and isolation");
    if (lifePathNumber === 9) patterns.push("overwhelm from others' needs");
    
    patterns.push("fear of judgment", "imposter syndrome");
    return patterns;
  },

  extractNorthStar(blueprintData: any): string {
    const lifePathNumber = blueprintData.values_life_path?.lifePathNumber;
    if (lifePathNumber === 1) return "authentic leadership and pioneering new paths";
    if (lifePathNumber === 7) return "bridging wisdom between spiritual and material worlds";
    if (lifePathNumber === 9) return "compassionate service and completion of meaningful cycles";
    return "living authentically while contributing to the greater good";
  },

  extractMissionStatement(blueprintData: any): string {
    const hdType = blueprintData.energy_strategy_human_design?.type;
    if (hdType === 'Projector') return "guiding others to their highest potential through wisdom and insight";
    if (hdType === 'Generator') return "building sustainable value through dedicated response to what lights me up";
    if (hdType === 'Manifestor') return "initiating positive change through independent action and innovation";
    return "expressing my authentic self while making a meaningful difference";
  },

  extractPurposeAlignment(blueprintData: any): string {
    return "integrating all aspects of self in service of authentic contribution";
  },

  extractSocialMask(blueprintData: any): string {
    const sunSign = blueprintData.archetype_western?.sun_sign;
    if (sunSign === 'Leo') return "confident and radiant leader";
    if (sunSign === 'Libra') return "harmonious and diplomatic connector";
    if (sunSign === 'Scorpio') return "mysterious and transformative force";
    return "authentic and approachable presence";
  },

  extractExternalExpression(blueprintData: any): string {
    return `${this.extractSocialStyle(blueprintData)} with ${this.extractPublicVibe(blueprintData)}`;
  },

  extractGenerationalThemes(blueprintData: any): string[] {
    const chineseAnimal = blueprintData.archetype_chinese?.animal;
    if (['Dragon', 'Tiger', 'Horse'].includes(chineseAnimal)) return ["transformation", "dynamic change", "innovation"];
    if (['Ox', 'Snake', 'Rooster'].includes(chineseAnimal)) return ["stability", "methodical progress", "refinement"];
    return ["balanced evolution", "integrated wisdom"];
  },

  extractCollectiveInfluence(blueprintData: any): string {
    return "contributing to collective consciousness through authentic self-expression";
  },

  extractBehavioralSignatures(blueprintData: any): string[] {
    const hdType = blueprintData.energy_strategy_human_design?.type;
    const signatures = [];
    
    if (hdType === 'Projector') signatures.push("waiting for recognition", "guiding others");
    if (hdType === 'Generator') signatures.push("responding to life", "sustained building energy");
    if (hdType === 'Manifestor') signatures.push("initiating action", "informing others");
    
    signatures.push("authentic self-expression", "purposeful action");
    return signatures;
  },

  extractExternalManifestations(blueprintData: any): string[] {
    return ["consistent personal growth", "meaningful relationships", "purposeful contribution"];
  },

  extractBrandPersonality(blueprintData: any): string {
    const communicationStyle = this.extractCommunicationStyle(blueprintData);
    const publicVibe = this.extractPublicVibe(blueprintData);
    return `${communicationStyle} with ${publicVibe} energy`;
  },

  extractCommunicationPatterns(blueprintData: any): string[] {
    const patterns = [];
    const mbti = blueprintData.cognition_mbti?.type;
    
    if (mbti?.includes('E')) patterns.push("expressive sharing", "energetic engagement");
    if (mbti?.includes('I')) patterns.push("thoughtful reflection", "deep listening");
    if (mbti?.includes('F')) patterns.push("empathetic connection", "values-based communication");
    if (mbti?.includes('T')) patterns.push("logical presentation", "objective analysis");
    
    patterns.push("authentic expression", "purposeful dialogue");
    return patterns;
  },

  extractInfluenceStyle(blueprintData: any): string {
    const hdType = blueprintData.energy_strategy_human_design?.type;
    if (hdType === 'Projector') return "wisdom-based guidance and recognition";
    if (hdType === 'Generator') return "inspiring through dedicated example";
    if (hdType === 'Manifestor') return "catalyzing change through independent action";
    return "authentic influence through aligned action";
  },

  extractNudgeStyle(blueprintData: any): string {
    const authority = blueprintData.energy_strategy_human_design?.authority;
    if (authority === 'Emotional') return "gentle emotional check-ins with patience";
    if (authority === 'Sacral') return "body-wisdom reminders and energy awareness";
    return "supportive encouragement aligned with natural timing";
  },

  extractMotivationApproach(blueprintData: any): string {
    const excitementCompass = this.extractExcitementCompass(blueprintData);
    return `${excitementCompass} with practical action steps`;
  },

  extractFeedbackStyle(blueprintData: any): string {
    const mbti = blueprintData.cognition_mbti?.type;
    if (mbti?.includes('F')) return "gentle and supportive with emotional attunement";
    if (mbti?.includes('T')) return "direct and constructive with logical framework";
    return "balanced and encouraging feedback";
  },

  extractLearningStyle(blueprintData: any): string {
    const mbti = blueprintData.cognition_mbti?.type;
    if (mbti?.includes('S')) return "hands-on experiential learning with practical application";
    if (mbti?.includes('N')) return "conceptual pattern-based learning with creative exploration";
    return "integrated learning combining theory and practice";
  },

  extractCurrentTransits(blueprintData: any): string[] {
    // In a real implementation, this would calculate current astrological transits
    return ["general growth phase", "integration period", "expansion opportunity"];
  },

  extractSeasonalInfluences(): string[] {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return ["spring renewal", "new growth", "creative emergence"];
    if (month >= 5 && month <= 7) return ["summer expansion", "active manifestation", "social connection"];
    if (month >= 8 && month <= 10) return ["autumn harvest", "integration", "wisdom gathering"];
    return ["winter reflection", "inner wisdom", "deep restoration"];
  },

  extractCyclicalPatterns(blueprintData: any): string[] {
    return ["monthly renewal cycles", "seasonal energy shifts", "annual growth themes"];
  },

  extractOptimalTimings(blueprintData: any): string[] {
    const hdType = blueprintData.energy_strategy_human_design?.type;
    if (hdType === 'Generator') return ["when energy is high", "in response to opportunities"];
    if (hdType === 'Projector') return ["when recognized and invited", "during rest periods"];
    if (hdType === 'Manifestor') return ["when inspiration strikes", "after informing others"];
    return ["aligned with natural energy", "following inner guidance"];
  },

  extractEnergyWeather(blueprintData: any): string {
    return "stable with opportunities for growth and expansion";
  },

  extractNudgeHistory(blueprintData: any): string[] {
    return ["gentle morning check-ins", "evening reflection prompts", "celebration of progress"];
  },

  extractTaskGraph(blueprintData: any): any {
    return blueprintData.task_graph || {};
  },

  extractStreaks(blueprintData: any): any {
    return { current: 0, longest: 0, recent_activities: [] };
  },

  extractMoodLog(blueprintData: any): string[] {
    return ["generally optimistic", "engaged with growth", "open to learning"];
  },

  extractRecentPatterns(blueprintData: any): string[] {
    return ["consistent engagement", "growth-oriented activities", "authentic expression"];
  },

  extractTriggerEvents(blueprintData: any): string[] {
    return ["goal completion", "learning milestones", "relationship insights"];
  },

  generateFallbackPrompt(agentType: AgentType, language: string): string {
    const isNL = language === 'nl';
    
    switch (agentType) {
      case 'coach':
        return isNL 
          ? "Je bent de Ziel Coach, EXCLUSIEF gericht op productiviteit en het bereiken van doelen. Bied gestructureerde, actie-gerichte begeleiding."
          : "You are the Soul Coach, focused EXCLUSIVELY on productivity and goal achievement. Provide structured, action-oriented guidance.";
      case 'guide':
        return isNL 
          ? "Je bent de Ziel Gids, EXCLUSIEF gericht op persoonlijke groei en levenswijsheid. Bied reflectieve, inzichtelijke begeleiding."
          : "You are the Soul Guide, focused EXCLUSIVELY on personal growth and life wisdom. Provide reflective, insightful guidance.";
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
