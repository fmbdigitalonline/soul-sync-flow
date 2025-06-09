
import { BlueprintData } from "@/services/blueprint-service";
import { EnhancedBlueprintData } from "@/types/blueprint-enhanced";

export class BlueprintEnhancementService {
  static enhanceBlueprintData(blueprint: BlueprintData, celestialData?: any): EnhancedBlueprintData {
    const enhanced: EnhancedBlueprintData = {
      ...blueprint,
      enhanced_sections: {
        energy_identity: this.generateEnergyIdentitySection(blueprint),
        western_astrology: this.generateWesternSection(blueprint, celestialData),
        human_design: this.generateHumanDesignSection(blueprint),
        numerology: this.generateNumerologySection(blueprint),
        chinese_astrology: this.generateChineseSection(blueprint)
      }
    };
    
    return enhanced;
  }

  private static generateEnergyIdentitySection(blueprint: BlueprintData) {
    const facts = [
      `${blueprint.energy_strategy_human_design.type}`,
      `Life Path ${blueprint.values_life_path.lifePathNumber}`,
      `${blueprint.archetype_western.sun_sign}`,
      `${blueprint.archetype_chinese.element} ${blueprint.archetype_chinese.animal}`
    ];

    return {
      facts,
      narratives: {
        novice: `You're a ${blueprint.energy_strategy_human_design.type}. This means you're designed to ${blueprint.energy_strategy_human_design.strategy.toLowerCase()}. Your life path number ${blueprint.values_life_path.lifePathNumber} shows your soul's journey, while your ${blueprint.archetype_western.sun_sign} sun brings ${blueprint.archetype_western.sun_keyword.toLowerCase()} energy.`,
        amateur: `As a ${blueprint.energy_strategy_human_design.type} with ${blueprint.energy_strategy_human_design.authority} authority, your strategy is to ${blueprint.energy_strategy_human_design.strategy.toLowerCase()}. Your Life Path ${blueprint.values_life_path.lifePathNumber} combined with ${blueprint.archetype_western.sun_sign} sun creates a unique blend of ${blueprint.archetype_western.sun_keyword.toLowerCase()} solar energy and structured life purpose.`,
        pro: `${blueprint.energy_strategy_human_design.type}, ${blueprint.energy_strategy_human_design.definition} definition, Profile ${blueprint.energy_strategy_human_design.profile}. Strategy: ${blueprint.energy_strategy_human_design.strategy}. The intersection of HD Type energy with Life Path ${blueprint.values_life_path.lifePathNumber} and ${blueprint.archetype_western.sun_sign} solar expression creates a complex energetic signature focused on ${blueprint.energy_strategy_human_design.life_purpose.toLowerCase()}.`
      }
    };
  }

  private static generateWesternSection(blueprint: BlueprintData, celestialData?: any) {
    const facts = [
      `☉ ${blueprint.archetype_western.sun_sign}`,
      `☽ ${blueprint.archetype_western.moon_sign}`,
      `ASC ${blueprint.archetype_western.rising_sign}`,
    ];

    // Add additional facts if we have celestial data
    if (celestialData?.aspects?.length > 0) {
      const tightestAspect = celestialData.aspects[0];
      facts.push(`${tightestAspect.planet1} ${tightestAspect.aspect} ${tightestAspect.planet2}`);
    }

    return {
      facts,
      narratives: {
        novice: `Your sun in ${blueprint.archetype_western.sun_sign} makes you a ${blueprint.archetype_western.sun_keyword.toLowerCase()}, while your moon in ${blueprint.archetype_western.moon_sign} shows you're ${blueprint.archetype_western.moon_keyword.toLowerCase()} emotionally. Your rising sign ${blueprint.archetype_western.rising_sign} is how others first see you.`,
        amateur: `The ${blueprint.archetype_western.sun_sign} sun gives you ${blueprint.archetype_western.sun_keyword.toLowerCase()} core energy, while ${blueprint.archetype_western.moon_sign} moon provides ${blueprint.archetype_western.moon_keyword.toLowerCase()} emotional responses. Your ${blueprint.archetype_western.rising_sign} ascendant creates your outer personality and first impressions.`,
        pro: `Solar ${blueprint.archetype_western.sun_sign} expression manifests as ${blueprint.archetype_western.sun_keyword.toLowerCase()} identity, lunar ${blueprint.archetype_western.moon_sign} provides ${blueprint.archetype_western.moon_keyword.toLowerCase()} emotional substrate, and ${blueprint.archetype_western.rising_sign} rising creates the persona through which this internal dynamic is expressed to the world.`
      },
      aspects: celestialData?.aspects || [],
      houses: celestialData?.houses || {},
      retrogrades: this.findRetrogrades(celestialData)
    };
  }

  private static generateHumanDesignSection(blueprint: BlueprintData) {
    const facts = [
      `${blueprint.energy_strategy_human_design.type}`,
      `${blueprint.energy_strategy_human_design.strategy}`,
      `${blueprint.energy_strategy_human_design.authority}`,
      `Profile ${blueprint.energy_strategy_human_design.profile}`,
      `${blueprint.energy_strategy_human_design.definition} Definition`
    ];

    // Add gates if available
    const totalGates = blueprint.energy_strategy_human_design.gates.conscious_personality.length + 
                     blueprint.energy_strategy_human_design.gates.unconscious_design.length;
    if (totalGates > 0) {
      facts.push(`${totalGates} Active Gates`);
    }

    return {
      facts,
      narratives: {
        novice: `You're a ${blueprint.energy_strategy_human_design.type}! Your strategy is to ${blueprint.energy_strategy_human_design.strategy.toLowerCase()}. Listen to your ${blueprint.energy_strategy_human_design.authority} for decisions. When you don't follow this, you might feel ${blueprint.energy_strategy_human_design.not_self_theme.toLowerCase()}.`,
        amateur: `As a ${blueprint.energy_strategy_human_design.type} with ${blueprint.energy_strategy_human_design.authority} authority, your strategy is to ${blueprint.energy_strategy_human_design.strategy.toLowerCase()}. Your ${blueprint.energy_strategy_human_design.definition} definition and ${blueprint.energy_strategy_human_design.profile} profile show how your energy flows and how you learn best.`,
        pro: `${blueprint.energy_strategy_human_design.type} with ${blueprint.energy_strategy_human_design.definition} definition creates specific energetic dynamics. Profile ${blueprint.energy_strategy_human_design.profile} determines learning style and life themes. ${blueprint.energy_strategy_human_design.authority} authority provides the decision-making mechanism that aligns with your design's natural flow.`
      },
      centers: this.analyzeCenters(blueprint.energy_strategy_human_design.centers),
      gates: this.combineGates(blueprint.energy_strategy_human_design.gates),
      channels: this.identifyChannels(blueprint.energy_strategy_human_design.gates)
    };
  }

  private static generateNumerologySection(blueprint: BlueprintData) {
    const facts = [
      `Life Path ${blueprint.values_life_path.lifePathNumber}`,
      `Expression ${blueprint.values_life_path.expressionNumber}`,
      `Birth Day ${blueprint.values_life_path.birthDay}`,
      `Birth Year ${blueprint.values_life_path.birthYear}`
    ];

    return {
      facts,
      narratives: {
        novice: `Your Life Path ${blueprint.values_life_path.lifePathNumber} is like your soul's main mission in this lifetime. Your Expression Number ${blueprint.values_life_path.expressionNumber} shows your natural talents and abilities.`,
        amateur: `Life Path ${blueprint.values_life_path.lifePathNumber} represents your core life purpose and lessons. Expression Number ${blueprint.values_life_path.expressionNumber} reveals your inherent talents and how you naturally express yourself in the world.`,
        pro: `Life Path ${blueprint.values_life_path.lifePathNumber} indicates karmic lessons and spiritual evolution path. Expression Number ${blueprint.values_life_path.expressionNumber} represents the vibrational frequency of your full birth name, showing innate capabilities and destined expression.`
      },
      calculations: {
        lifePathNumber: { value: blueprint.values_life_path.lifePathNumber, method: "Birth date reduction" },
        expressionNumber: { value: blueprint.values_life_path.expressionNumber, method: "Full name calculation" }
      }
    };
  }

  private static generateChineseSection(blueprint: BlueprintData) {
    const facts = [
      `${blueprint.archetype_chinese.animal}`,
      `${blueprint.archetype_chinese.element}`,
      `${blueprint.archetype_chinese.yin_yang}`,
      `Year ${blueprint.values_life_path.birthYear}`
    ];

    return {
      facts,
      narratives: {
        novice: `You're a ${blueprint.archetype_chinese.element} ${blueprint.archetype_chinese.animal}! This means you have the ${blueprint.archetype_chinese.animal.toLowerCase()}'s natural qualities combined with ${blueprint.archetype_chinese.element.toLowerCase()} energy.`,
        amateur: `Born in a ${blueprint.archetype_chinese.element} ${blueprint.archetype_chinese.animal} year with ${blueprint.archetype_chinese.yin_yang} polarity, you carry both the ${blueprint.archetype_chinese.animal.toLowerCase()}'s characteristic traits and the ${blueprint.archetype_chinese.element.toLowerCase()} element's influence on your personality and life approach.`,
        pro: `${blueprint.archetype_chinese.element} ${blueprint.archetype_chinese.animal} with ${blueprint.archetype_chinese.yin_yang} polarity creates a specific energetic signature in the Chinese metaphysical system. This combination influences both personality expression and compatibility patterns within the sexagenary cycle.`
      },
      four_pillars: {
        year: { animal: blueprint.archetype_chinese.animal, element: blueprint.archetype_chinese.element },
        month: { animal: "Unknown", element: "Unknown" },
        day: { animal: "Unknown", element: "Unknown" },
        hour: { animal: "Unknown", element: "Unknown" }
      }
    };
  }

  private static findRetrogrades(celestialData: any): string[] {
    // Implementation would check planetary speeds
    return [];
  }

  private static analyzeCenters(centers: Record<string, any>) {
    // Implementation would analyze center definitions
    return {};
  }

  private static combineGates(gates: { unconscious_design: any[]; conscious_personality: any[] }) {
    return [...gates.unconscious_design, ...gates.conscious_personality];
  }

  private static identifyChannels(gates: { unconscious_design: any[]; conscious_personality: any[] }) {
    // Implementation would identify formed channels
    return [];
  }
}
