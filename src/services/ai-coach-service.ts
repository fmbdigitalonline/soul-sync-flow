
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
          // Fall back to generic prompt if blueprint loading fails
          systemPrompt = this.generateFallbackPrompt(agentType, language);
        } else if (blueprintData) {
          console.log("Blueprint loaded successfully, generating personalized prompt");
          
          // Create personality engine with actual blueprint data
          const personalityEngine = new PersonalityEngine();
          
          // Convert blueprint data to personality modules format
          const personalityBlueprint = this.convertBlueprintToPersonalityModules(blueprintData);
          personalityEngine.updateBlueprint(personalityBlueprint);
          
          // Generate personalized system prompt
          systemPrompt = personalityEngine.generateSystemPrompt(agentType);
          
          console.log("Generated personalized prompt for agent type:", agentType);
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
    
    return {
      cognitiveTemperamental: {
        taskApproach: this.extractTaskApproach(blueprintData),
        communicationStyle: this.extractCommunicationStyle(blueprintData),
        decisionMaking: this.extractDecisionMaking(blueprintData)
      },
      energyDecisionStrategy: {
        energyType: blueprintData.energy_strategy_human_design?.type || "undefined",
        decisionStyle: blueprintData.energy_strategy_human_design?.authority || "undefined",
        strategy: blueprintData.energy_strategy_human_design?.strategy || "undefined"
      },
      motivationBeliefEngine: {
        motivation: this.extractMotivations(blueprintData),
        coreBeliefs: this.extractCoreBeliefs(blueprintData),
        drivingForces: this.extractDrivingForces(blueprintData)
      },
      coreValuesNarrative: {
        meaningfulAreas: this.extractMeaningfulAreas(blueprintData),
        lifeThemes: this.extractLifeThemes(blueprintData),
        valueSystem: this.extractValueSystem(blueprintData)
      },
      publicArchetype: {
        socialStyle: this.extractSocialStyle(blueprintData),
        publicPersona: this.extractPublicPersona(blueprintData),
        leadershipStyle: this.extractLeadershipStyle(blueprintData)
      },
      interactionPreferences: {
        rapportStyle: this.extractRapportStyle(blueprintData),
        conflictStyle: this.extractConflictStyle(blueprintData),
        collaborationStyle: this.extractCollaborationStyle(blueprintData)
      }
    };
  },

  // Helper methods to extract personality traits from blueprint data
  extractTaskApproach(blueprintData: any): string {
    const mbti = blueprintData.cognition_mbti?.type;
    const hdType = blueprintData.energy_strategy_human_design?.type;
    
    if (mbti?.includes('J')) return "systematic and structured";
    if (mbti?.includes('P')) return "flexible and adaptive";
    if (hdType === "Projector") return "strategic and guiding";
    if (hdType === "Generator") return "responsive and thorough";
    if (hdType === "Manifestor") return "initiating and direct";
    return "balanced and thoughtful";
  },

  extractCommunicationStyle(blueprintData: any): string {
    const sunSign = blueprintData.archetype_western?.sun_sign;
    const mbti = blueprintData.cognition_mbti?.type;
    
    if (mbti?.includes('E')) return "expressive and engaging";
    if (mbti?.includes('I')) return "thoughtful and reflective";
    if (['Aries', 'Leo', 'Sagittarius'].includes(sunSign)) return "enthusiastic and direct";
    if (['Cancer', 'Scorpio', 'Pisces'].includes(sunSign)) return "empathetic and intuitive";
    return "clear and considerate";
  },

  extractDecisionMaking(blueprintData: any): string {
    const authority = blueprintData.energy_strategy_human_design?.authority;
    const mbti = blueprintData.cognition_mbti?.type;
    
    if (authority === "Emotional") return "emotion-based with time for clarity";
    if (authority === "Sacral") return "gut instinct in the moment";
    if (authority === "Splenic") return "intuitive awareness";
    if (mbti?.includes('T')) return "logical and analytical";
    if (mbti?.includes('F')) return "values-based and people-centered";
    return "balanced consideration of facts and feelings";
  },

  extractMotivations(blueprintData: any): string[] {
    const motivations = [];
    const lifePathNumber = blueprintData.values_life_path?.lifePathNumber;
    const sunSign = blueprintData.archetype_western?.sun_sign;
    
    if (lifePathNumber === 1) motivations.push("leadership and independence");
    if (lifePathNumber === 2) motivations.push("harmony and cooperation");
    if (lifePathNumber === 3) motivations.push("creative expression");
    if (lifePathNumber === 7) motivations.push("deep understanding and wisdom");
    if (lifePathNumber === 9) motivations.push("service to humanity");
    
    if (['Leo', 'Aries', 'Capricorn'].includes(sunSign)) motivations.push("achievement and recognition");
    if (['Cancer', 'Pisces', 'Virgo'].includes(sunSign)) motivations.push("helping and nurturing others");
    
    return motivations.length > 0 ? motivations : ["personal growth", "authenticity"];
  },

  extractMeaningfulAreas(blueprintData: any): string[] {
    const areas = [];
    const hdType = blueprintData.energy_strategy_human_design?.type;
    const sunSign = blueprintData.archetype_western?.sun_sign;
    
    if (hdType === "Projector") areas.push("guiding others", "systems optimization");
    if (hdType === "Generator") areas.push("building and creating", "responding to life");
    if (hdType === "Manifestor") areas.push("initiating change", "innovation");
    
    if (['Gemini', 'Aquarius', 'Sagittarius'].includes(sunSign)) areas.push("learning and teaching");
    if (['Taurus', 'Virgo', 'Capricorn'].includes(sunSign)) areas.push("practical achievement");
    
    return areas.length > 0 ? areas : ["personal development", "meaningful relationships"];
  },

  extractSocialStyle(blueprintData: any): string {
    const mbti = blueprintData.cognition_mbti?.type;
    const sunSign = blueprintData.archetype_western?.sun_sign;
    
    if (mbti?.includes('E')) {
      if (['Leo', 'Aries', 'Sagittarius'].includes(sunSign)) return "charismatic and inspiring";
      return "warm and engaging";
    }
    if (mbti?.includes('I')) {
      if (['Scorpio', 'Capricorn', 'Virgo'].includes(sunSign)) return "reserved but insightful";
      return "thoughtful and authentic";
    }
    return "balanced and approachable";
  },

  extractRapportStyle(blueprintData: any): string {
    const mbti = blueprintData.cognition_mbti?.type;
    const authority = blueprintData.energy_strategy_human_design?.authority;
    
    if (authority === "Emotional") return "emotionally attuned and patient";
    if (mbti?.includes('F')) return "empathetic and validating";
    if (mbti?.includes('T')) return "respectful and direct";
    return "understanding and supportive";
  },

  // Fallback methods for other extraction functions
  extractCoreBeliefs(blueprintData: any): string[] {
    return ["growth through experience", "authentic self-expression"];
  },

  extractDrivingForces(blueprintData: any): string[] {
    return ["personal evolution", "meaningful impact"];
  },

  extractLifeThemes(blueprintData: any): string[] {
    return ["self-discovery", "purposeful living"];
  },

  extractValueSystem(blueprintData: any): string {
    return "authenticity and growth-oriented";
  },

  extractPublicPersona(blueprintData: any): string {
    return "genuine and purposeful";
  },

  extractLeadershipStyle(blueprintData: any): string {
    return "collaborative and inspiring";
  },

  extractConflictStyle(blueprintData: any): string {
    return "constructive and understanding";
  },

  extractCollaborationStyle(blueprintData: any): string {
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
