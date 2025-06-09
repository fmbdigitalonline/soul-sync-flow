
import { BlueprintData } from "./blueprint-service";
import { EnhancedBlueprintData } from "@/types/blueprint-enhanced";

export class BlueprintEnhancementService {
  
  // Enhance MBTI with proper cognitive functions
  static enhanceMBTI(mbtiType: string): { 
    dominant_function: string; 
    auxiliary_function: string; 
    tertiary_function: string; 
    inferior_function: string;
    assertiveness_style: string;
  } {
    const mbtiStack: Record<string, any> = {
      INTJ: {
        dominant_function: "Introverted Intuition (Ni)",
        auxiliary_function: "Extraverted Thinking (Te)", 
        tertiary_function: "Introverted Feeling (Fi)",
        inferior_function: "Extraverted Sensing (Se)",
        assertiveness_style: "Strategic-direct"
      },
      INFJ: {
        dominant_function: "Introverted Intuition (Ni)",
        auxiliary_function: "Extraverted Feeling (Fe)",
        tertiary_function: "Introverted Thinking (Ti)", 
        inferior_function: "Extraverted Sensing (Se)",
        assertiveness_style: "Gentle-persistent"
      },
      ENTJ: {
        dominant_function: "Extraverted Thinking (Te)",
        auxiliary_function: "Introverted Intuition (Ni)",
        tertiary_function: "Extraverted Sensing (Se)",
        inferior_function: "Introverted Feeling (Fi)",
        assertiveness_style: "Command-presence"
      },
      ENFJ: {
        dominant_function: "Extraverted Feeling (Fe)",
        auxiliary_function: "Introverted Intuition (Ni)",
        tertiary_function: "Extraverted Sensing (Se)",
        inferior_function: "Introverted Thinking (Ti)",
        assertiveness_style: "Inspirational-leading"
      },
      INFP: {
        dominant_function: "Introverted Feeling (Fi)",
        auxiliary_function: "Extraverted Intuition (Ne)",
        tertiary_function: "Introverted Sensing (Si)",
        inferior_function: "Extraverted Thinking (Te)",
        assertiveness_style: "Values-driven"
      },
      ENFP: {
        dominant_function: "Extraverted Intuition (Ne)",
        auxiliary_function: "Introverted Feeling (Fi)",
        tertiary_function: "Extraverted Thinking (Te)",
        inferior_function: "Introverted Sensing (Si)",
        assertiveness_style: "Enthusiastic-persuasive"
      },
      // Add more types as needed...
    };

    return mbtiStack[mbtiType] || {
      dominant_function: "To be determined",
      auxiliary_function: "To be determined", 
      tertiary_function: "To be determined",
      inferior_function: "To be determined",
      assertiveness_style: "Adaptive"
    };
  }

  // Derive marketing archetype from personality data
  static deriveMarketingArchetype(blueprint: BlueprintData): { 
    primary: string; 
    secondary?: string; 
    brand_voice_keywords: string[] 
  } {
    const mbti = blueprint.cognition_mbti?.type || "";
    const sunSign = blueprint.archetype_western?.sun_sign || "";
    const hdType = blueprint.energy_strategy_human_design?.type || "";

    // Simple mapping logic (can be enhanced)
    if (mbti.includes("NT")) {
      return {
        primary: "Explorer",
        secondary: "Sage",
        brand_voice_keywords: ["innovative", "strategic", "visionary", "analytical"]
      };
    } else if (mbti.includes("NF")) {
      return {
        primary: "Creator", 
        secondary: "Caregiver",
        brand_voice_keywords: ["authentic", "inspiring", "empathetic", "transformative"]
      };
    } else if (hdType === "Manifestor") {
      return {
        primary: "Hero",
        secondary: "Ruler", 
        brand_voice_keywords: ["bold", "initiating", "powerful", "direct"]
      };
    }

    return {
      primary: "Explorer",
      brand_voice_keywords: ["curious", "genuine", "growth-oriented"]
    };
  }

  // Derive goal persona from various signals
  static deriveGoalPersona(blueprint: BlueprintData): string {
    const personality = blueprint.user_meta?.personality;
    const hdType = blueprint.energy_strategy_human_design?.type;
    
    // Simple heuristics - can be made more sophisticated
    if (personality?.includes("achievement") || hdType === "Manifestor") {
      return "Productivity";
    } else if (personality?.includes("creative") || personality?.includes("art")) {
      return "Creativity";
    } else if (personality?.includes("help") || personality?.includes("service")) {
      return "Relationships";
    }
    
    return "Productivity"; // Default
  }

  // Generate default interaction preferences
  static generateInteractionPrefs(): {
    support_style: "Directive" | "Socratic" | "Reflective" | "Collaborative";
    tone: "Warm-honest" | "Professional" | "Casual-friendly" | "Mystical" | "Scientific";
    emoji_usage: "Minimal" | "Moderate" | "Abundant";
    preferred_format: "Bullet-points" | "Paragraphs" | "Questions" | "Action-steps";
  } {
    return {
      support_style: "Directive",
      tone: "Warm-honest", 
      emoji_usage: "Minimal",
      preferred_format: "Bullet-points"
    };
  }

  // Main enhancement function
  static enhanceBlueprint(blueprint: BlueprintData): EnhancedBlueprintData {
    const enhancedMBTI = this.enhanceMBTI(blueprint.cognition_mbti?.type || "");
    const marketingArchetype = this.deriveMarketingArchetype(blueprint);
    const goalPersona = this.deriveGoalPersona(blueprint);
    const interactionPrefs = this.generateInteractionPrefs();

    return {
      ...blueprint,
      interaction_prefs: interactionPrefs,
      marketing_archetype: marketingArchetype,
      goal_persona: goalPersona as any,
      north_star: "Decode yourself and take aligned action", // Default - can be customized
      
      // Enhanced cognition_mbti with proper functions
      cognition_mbti: {
        ...blueprint.cognition_mbti,
        ...enhancedMBTI
      },
      
      enhanced_sections: {
        energy_identity: {
          facts: [
            `Your ${blueprint.energy_strategy_human_design?.type || 'Generator'} energy works best when you ${blueprint.energy_strategy_human_design?.strategy?.toLowerCase() || 'respond to opportunities'}`,
            `Your ${blueprint.cognition_mbti?.type || 'INFJ'} thinking style processes through ${enhancedMBTI.dominant_function}`
          ],
          narratives: {
            novice: `You're a ${blueprint.energy_strategy_human_design?.type || 'Generator'} who thrives by ${blueprint.energy_strategy_human_design?.strategy?.toLowerCase() || 'responding to what lights you up'}.`,
            amateur: `Your energy blueprint combines ${blueprint.energy_strategy_human_design?.type || 'Generator'} mechanics with ${blueprint.cognition_mbti?.type || 'INFJ'} cognitive processing, creating a unique decision-making style.`,
            pro: `As a ${blueprint.energy_strategy_human_design?.type || 'Generator'} with ${enhancedMBTI.dominant_function} leading your cognition, your optimal workflow alternates between ${blueprint.energy_strategy_human_design?.strategy?.toLowerCase() || 'responsive action'} and ${enhancedMBTI.auxiliary_function} integration periods.`
          }
        },
        western_astrology: {
          facts: [
            `Sun in ${blueprint.archetype_western?.sun_sign || 'Taurus'} drives your core identity toward ${blueprint.archetype_western?.sun_keyword || 'stability'}`,
            `Moon in ${blueprint.archetype_western?.moon_sign || 'Scorpio'} governs your emotional needs and instinctive responses`
          ],
          narratives: {
            novice: `Your ${blueprint.archetype_western?.sun_sign || 'Taurus'} Sun wants ${blueprint.archetype_western?.sun_keyword?.toLowerCase() || 'security'}, while your ${blueprint.archetype_western?.moon_sign || 'Scorpio'} Moon needs ${blueprint.archetype_western?.moon_keyword?.toLowerCase() || 'depth'}.`,
            amateur: `The tension between your ${blueprint.archetype_western?.sun_sign || 'Taurus'} identity and ${blueprint.archetype_western?.moon_sign || 'Scorpio'} emotional nature creates your unique motivational pattern.`,
            pro: `Your ${blueprint.archetype_western?.sun_sign || 'Taurus'}-${blueprint.archetype_western?.moon_sign || 'Scorpio'} combination suggests optimal performance when you balance ${blueprint.archetype_western?.sun_keyword?.toLowerCase() || 'steady progress'} with ${blueprint.archetype_western?.moon_keyword?.toLowerCase() || 'transformative depth'}.`
          },
          aspects: [],
          houses: {},
          retrogrades: []
        },
        human_design: {
          facts: [
            `Your ${blueprint.energy_strategy_human_design?.authority || 'Sacral'} Authority is your decision-making compass`,
            `Your ${blueprint.energy_strategy_human_design?.profile || '1/3'} Profile shapes how you learn and interact with others`
          ],
          narratives: {
            novice: `Trust your ${blueprint.energy_strategy_human_design?.authority || 'gut feelings'} when making decisions.`,
            amateur: `Your ${blueprint.energy_strategy_human_design?.profile || '1/3'} Profile means you learn through ${blueprint.energy_strategy_human_design?.profile?.includes('1') ? 'investigation and' : ''} ${blueprint.energy_strategy_human_design?.profile?.includes('3') ? 'trial-and-error' : 'observation'}.`,
            pro: `Align with your ${blueprint.energy_strategy_human_design?.authority || 'Sacral Authority'} for major decisions while honoring your ${blueprint.energy_strategy_human_design?.profile || '1/3'} learning style in skill development.`
          },
          centers: {},
          gates: [],
          channels: []
        },
        numerology: {
          facts: [
            `Life Path ${blueprint.values_life_path?.lifePathNumber || 7} guides your soul's primary learning theme`,
            `Expression ${blueprint.values_life_path?.expressionNumber || 3} reveals your natural talents and gifts`
          ],
          narratives: {
            novice: `Your Life Path ${blueprint.values_life_path?.lifePathNumber || 7} journey is about ${blueprint.values_life_path?.lifePathKeyword?.toLowerCase() || 'seeking truth'}.`,
            amateur: `The combination of Life Path ${blueprint.values_life_path?.lifePathNumber || 7} and Expression ${blueprint.values_life_path?.expressionNumber || 3} suggests success through ${blueprint.values_life_path?.lifePathKeyword?.toLowerCase() || 'deep analysis'} expressed via ${blueprint.values_life_path?.expressionKeyword?.toLowerCase() || 'creative communication'}.`,
            pro: `Your numerological blueprint indicates optimal life satisfaction when you channel your ${blueprint.values_life_path?.expressionNumber || 3}-energy talents into ${blueprint.values_life_path?.lifePathNumber || 7}-themed pursuits.`
          },
          calculations: {}
        },
        chinese_astrology: {
          facts: [
            `${blueprint.archetype_chinese?.element || 'Earth'} ${blueprint.archetype_chinese?.animal || 'Dog'} brings ${blueprint.archetype_chinese?.keyword || 'loyalty'} energy to your approach`,
            `Your Chinese zodiac influences timing and relationship patterns`
          ],
          narratives: {
            novice: `As an ${blueprint.archetype_chinese?.element || 'Earth'} ${blueprint.archetype_chinese?.animal || 'Dog'}, you naturally embody ${blueprint.archetype_chinese?.keyword?.toLowerCase() || 'faithful'} energy.`,
            amateur: `Your ${blueprint.archetype_chinese?.element || 'Earth'} ${blueprint.archetype_chinese?.animal || 'Dog'} nature complements your Western ${blueprint.archetype_western?.sun_sign || 'Taurus'} identity, creating a ${blueprint.archetype_chinese?.yin_yang || 'balanced'} approach to goals.`,
            pro: `The ${blueprint.archetype_chinese?.element || 'Earth'} ${blueprint.archetype_chinese?.animal || 'Dog'} archetype suggests peak performance during years and seasons that honor ${blueprint.archetype_chinese?.keyword?.toLowerCase() || 'steady loyalty'} values.`
          },
          four_pillars: {
            year: { animal: blueprint.archetype_chinese?.animal || 'Dog', element: blueprint.archetype_chinese?.element || 'Earth' },
            month: { animal: 'TBD', element: 'TBD' },
            day: { animal: 'TBD', element: 'TBD' }, 
            hour: { animal: 'TBD', element: 'TBD' }
          }
        }
      }
    } as EnhancedBlueprintData;
  }
}
