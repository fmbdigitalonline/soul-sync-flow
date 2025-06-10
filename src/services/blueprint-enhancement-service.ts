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
    const sunSign = blueprint.archetype_western.sun_sign;
    const hdType = blueprint.energy_strategy_human_design.type;
    const lifePathNumber = blueprint.values_life_path.lifePathNumber;
    const chineseElement = blueprint.archetype_chinese.element;
    const chineseAnimal = blueprint.archetype_chinese.animal;

    const facts = [
      `${hdType}`,
      `Life Path ${lifePathNumber}`,
      `${sunSign}`,
      `${chineseElement} ${chineseAnimal}`
    ];

    return {
      facts,
      narratives: {
        novice: `You're a ${hdType} with ${sunSign}. This means you're designed to ${blueprint.energy_strategy_human_design.strategy.toLowerCase()}. Your Life Path ${lifePathNumber} shows you're here to be a ${blueprint.values_life_path.lifePathKeyword?.toLowerCase() || 'creator'}. As a ${chineseElement} ${chineseAnimal}, you bring ${chineseElement.toLowerCase()} energy to everything you do.`,
        
        amateur: `As a ${hdType} with ${blueprint.energy_strategy_human_design.authority} authority, your strategy is to ${blueprint.energy_strategy_human_design.strategy.toLowerCase()}. Your ${sunSign} gives you ${blueprint.archetype_western.sun_keyword.toLowerCase()} energy, while Life Path ${lifePathNumber} indicates your soul came here to master ${blueprint.values_life_path.lifePathKeyword?.toLowerCase() || 'creative expression'}. The ${chineseElement} ${chineseAnimal} combination adds ${chineseElement.toLowerCase()} stability and ${chineseAnimal.toLowerCase()} characteristics to your energetic signature.`,
        
        pro: `${hdType} with ${blueprint.energy_strategy_human_design.definition} definition and ${blueprint.energy_strategy_human_design.profile} profile. ${sunSign} creates ${blueprint.archetype_western.sun_keyword.toLowerCase()} solar expression through ${blueprint.energy_strategy_human_design.authority} decision-making authority. Life Path ${lifePathNumber} (${blueprint.values_life_path.lifePathKeyword}) intersects with Expression Number ${blueprint.values_life_path.expressionNumber} (${blueprint.values_life_path.expressionKeyword}) creating a complex mandala of ${chineseElement} ${chineseAnimal} ${blueprint.archetype_chinese.yin_yang} polarity. Strategy: ${blueprint.energy_strategy_human_design.strategy}. Not-self theme: ${blueprint.energy_strategy_human_design.not_self_theme}.`
      }
    };
  }

  private static generateWesternSection(blueprint: BlueprintData, celestialData?: any) {
    const sunSign = blueprint.archetype_western.sun_sign;
    const moonSign = blueprint.archetype_western.moon_sign;
    const risingSign = blueprint.archetype_western.rising_sign;
    
    // Extract degrees if available
    const sunDegrees = this.extractDegrees(sunSign);
    const moonDegrees = this.extractDegrees(moonSign);
    
    const facts = [
      `☉ ${sunSign}`,
      `☽ ${moonSign}`,
      `ASC ${risingSign}`,
      `Source: ${blueprint.archetype_western.source}`
    ];

    return {
      facts,
      narratives: {
        novice: `Your sun in ${sunSign.split(' ')[0]} makes you ${blueprint.archetype_western.sun_keyword.toLowerCase()}, while your moon in ${moonSign.split(' ')[0]} means you feel most comfortable when you're ${blueprint.archetype_western.moon_keyword.toLowerCase()}. Your rising sign shows how others see you when they first meet you.`,
        
        amateur: `Your ${sunSign} creates ${blueprint.archetype_western.sun_keyword.toLowerCase()} core identity and conscious ego expression. The ${moonSign} provides ${blueprint.archetype_western.moon_keyword.toLowerCase()} emotional responses and unconscious patterns. Your ${risingSign} ascendant is your mask and first impression - how you naturally approach new situations and how the world sees you initially.`,
        
        pro: `Solar placement at ${sunSign} creates ${blueprint.archetype_western.sun_keyword.toLowerCase()} conscious identity${sunDegrees ? ` at ${sunDegrees}` : ''}. Lunar expression through ${moonSign}${moonDegrees ? ` at ${moonDegrees}` : ''} provides ${blueprint.archetype_western.moon_keyword.toLowerCase()} emotional substrate and unconscious response patterns. ${risingSign} ascendant creates the persona filter through which this solar-lunar dynamic is expressed to the world. Calculated using ${blueprint.archetype_western.source} with ${blueprint.metadata.engine || 'unknown engine'}.`
      },
      aspects: celestialData?.aspects || [],
      houses: celestialData?.houses || {},
      retrogrades: this.findRetrogrades(celestialData)
    };
  }

  private static generateHumanDesignSection(blueprint: BlueprintData) {
    const hd = blueprint.energy_strategy_human_design;
    const definedCenters = this.getDefinedCenters(hd.centers);
    const totalGates = hd.gates.conscious_personality.length + hd.gates.unconscious_design.length;
    const channels = this.getChannelsFromCenters(hd.centers);

    const facts = [
      `${hd.type}`,
      `${hd.strategy}`,
      `${hd.authority}`,
      `Profile ${hd.profile}`,
      `${hd.definition}`,
      `${definedCenters.length}/9 Centers Defined`,
      `${totalGates} Active Gates`,
      `${channels.length} Channels`
    ];

    return {
      facts,
      narratives: {
        novice: `You're a ${hd.type}! This means your strategy is to ${hd.strategy.toLowerCase()}. When making decisions, listen to your ${hd.authority.toLowerCase()} authority. You have ${definedCenters.length} out of 9 energy centers defined, which means you have consistent energy in those areas. When you don't follow your strategy, you might feel ${hd.not_self_theme.toLowerCase()}.`,
        
        amateur: `As a ${hd.type} with ${hd.authority} authority, your strategy is to ${hd.strategy.toLowerCase()}. Your ${hd.definition} means your defined centers work ${hd.definition.includes('Single') ? 'as one connected system' : 'in separate groups'}. With ${definedCenters.length}/9 centers defined (${definedCenters.join(', ')}), you have reliable energy in these areas. Your ${hd.profile} profile shows you're here to ${this.getProfileDescription(hd.profile)}.`,
        
        pro: `${hd.type} with ${hd.definition} operating through ${hd.authority} authority. Profile ${hd.profile} creates ${this.getProfileDescription(hd.profile)} incarnation cross themes. Defined centers: ${definedCenters.join(', ')} creating ${channels.length} channels: ${channels.join(', ')}. Conscious gates: ${hd.gates.conscious_personality.join(', ')}. Unconscious gates: ${hd.gates.unconscious_design.join(', ')}. Strategy: ${hd.strategy}. Not-self: ${hd.not_self_theme}. Life purpose: ${hd.life_purpose}.`
      },
      centers: this.analyzeCenters(hd.centers),
      gates: this.combineGates(hd.gates),
      channels: this.identifyChannels(hd.gates)
    };
  }

  private static generateNumerologySection(blueprint: BlueprintData) {
    const num = blueprint.values_life_path;
    
    const facts = [
      `Life Path ${num.lifePathNumber}`,
      `Expression ${num.expressionNumber}`,
      `Soul Urge ${num.soulUrgeNumber}`,
      `Birthday ${num.birthdayNumber}`,
      `Birth Year ${num.birthYear}`
    ];

    return {
      facts,
      narratives: {
        novice: `Your Life Path ${num.lifePathNumber} means you're here to be a ${num.lifePathKeyword?.toLowerCase() || 'creator'}. Your Expression Number ${num.expressionNumber} shows you're naturally a ${num.expressionKeyword?.toLowerCase() || 'leader'}. Your Soul Urge ${num.soulUrgeNumber} reveals you deeply desire ${num.soulUrgeKeyword?.toLowerCase() || 'success'}.`,
        
        amateur: `Life Path ${num.lifePathNumber} (${num.lifePathKeyword}) represents your soul's primary lesson and life direction. Expression Number ${num.expressionNumber} (${num.expressionKeyword}) shows your natural talents and how you express yourself in the world. Soul Urge ${num.soulUrgeNumber} (${num.soulUrgeKeyword}) reveals your inner motivations and heart's desires. Birthday Number ${num.birthdayNumber} (${num.birthdayKeyword}) adds special gifts from the day you were born.`,
        
        pro: `Numerological matrix: Life Path ${num.lifePathNumber} derived from birth date ${num.birthDay}/${num.birthMonth}/${num.birthYear} indicating ${num.lifePathKeyword} karmic lessons. Expression ${num.expressionNumber} calculated from full birth name creating ${num.expressionKeyword} vibrational frequency. Soul Urge ${num.soulUrgeNumber} (${num.soulUrgeKeyword}) from vowels shows core motivation. Birthday ${num.birthdayNumber} (${num.birthdayKeyword}) provides additional talents. Master numbers and reduction patterns create complex numerological mandala.`
      },
      calculations: {
        lifePathNumber: { value: num.lifePathNumber, method: `${num.birthDay}/${num.birthMonth}/${num.birthYear} reduction` },
        expressionNumber: { value: num.expressionNumber, method: `Full name: ${blueprint.user_meta.full_name}` },
        soulUrgeNumber: { value: num.soulUrgeNumber, method: "Vowels in full name" },
        birthdayNumber: { value: num.birthdayNumber, method: `Birth day: ${num.birthDay}` }
      }
    };
  }

  private static generateChineseSection(blueprint: BlueprintData) {
    const chinese = blueprint.archetype_chinese;
    
    const facts = [
      `${chinese.animal}`,
      `${chinese.element}`,
      `${chinese.yin_yang}`,
      `Year ${blueprint.values_life_path.birthYear}`
    ];

    return {
      facts,
      narratives: {
        novice: `You're a ${chinese.element} ${chinese.animal}! This means you have the ${chinese.animal.toLowerCase()}'s natural qualities like being ${this.getAnimalTraits(chinese.animal)}. The ${chinese.element.toLowerCase()} element adds ${this.getElementTraits(chinese.element)} energy to your personality.`,
        
        amateur: `Born in a ${chinese.element} ${chinese.animal} year with ${chinese.yin_yang} polarity. The ${chinese.animal} brings ${this.getAnimalTraits(chinese.animal)} characteristics, while ${chinese.element} element provides ${this.getElementTraits(chinese.element)} energy. ${chinese.yin_yang} polarity affects how this energy expresses - ${chinese.yin_yang === 'Yang' ? 'active, external, giving' : 'receptive, internal, nurturing'}.`,
        
        pro: `${chinese.element} ${chinese.animal} with ${chinese.yin_yang} polarity in the sexagenary cycle. Year pillar: ${chinese.element} ${chinese.animal} (${blueprint.values_life_path.birthYear}). This creates specific energetic patterns within the Chinese metaphysical framework affecting personality, compatibility, and life timing. Element ${chinese.element} governs ${this.getElementGoverning(chinese.element)}, while ${chinese.animal} archetypes ${this.getAnimalArchetype(chinese.animal)}. ${chinese.yin_yang} polarity determines expression modality.`
      },
      four_pillars: {
        year: { animal: chinese.animal, element: chinese.element },
        month: { animal: "Calculating", element: "Calculating" },
        day: { animal: "Calculating", element: "Calculating" },
        hour: { animal: "Calculating", element: "Calculating" }
      }
    };
  }

  // Helper methods
  private static extractDegrees(signString: string): string | null {
    const match = signString.match(/(\d+\.?\d*)°/);
    return match ? `${match[1]}°` : null;
  }

  private static getDefinedCenters(centers: Record<string, any> | undefined | null): string[] {
    // Handle null/undefined centers by providing empty object as fallback
    const safeCenters = centers || {};
    return Object.entries(safeCenters)
      .filter(([_, center]: [string, any]) => center?.defined)
      .map(([name, _]) => name);
  }

  private static getChannelsFromCenters(centers: Record<string, any> | undefined | null): string[] {
    const safeCenters = centers || {};
    const allChannels: string[] = [];
    Object.values(safeCenters).forEach((center: any) => {
      if (center?.channels) {
        allChannels.push(...center.channels);
      }
    });
    return [...new Set(allChannels)];
  }

  private static getProfileDescription(profile: string): string {
    const profiles: Record<string, string> = {
      '1/3': 'investigate and experiment through trial and error',
      '1/4': 'investigate and influence others through relationships',
      '2/4': 'develop natural talents and share them through relationships',
      '2/5': 'develop talents and project solutions to others',
      '3/5': 'experiment and project solutions through experience',
      '3/6': 'experiment, transition, and become a role model',
      '4/6': 'influence through relationships and become a role model',
      '5/1': 'project solutions while investigating foundations',
      '5/2': 'project solutions while developing natural talents',
      '6/2': 'be a role model while developing natural talents',
      '6/3': 'be a role model through experimentation'
    };
    return profiles[profile.split(' ')[0]] || 'live authentically';
  }

  private static getAnimalTraits(animal: string): string {
    const traits: Record<string, string> = {
      'Rat': 'clever and resourceful',
      'Ox': 'reliable and determined',
      'Tiger': 'brave and competitive',
      'Rabbit': 'gentle and compassionate',
      'Dragon': 'confident and ambitious',
      'Snake': 'wise and intuitive',
      'Horse': 'energetic and independent',
      'Goat': 'creative and peaceful',
      'Monkey': 'clever and versatile',
      'Rooster': 'confident and hardworking',
      'Dog': 'loyal and honest',
      'Pig': 'generous and compassionate'
    };
    return traits[animal] || 'unique';
  }

  private static getElementTraits(element: string): string {
    const traits: Record<string, string> = {
      'Wood': 'growing and flexible',
      'Fire': 'passionate and dynamic',
      'Earth': 'stable and nurturing',
      'Metal': 'precise and structured',
      'Water': 'flowing and adaptable'
    };
    return traits[element] || 'balanced';
  }

  private static getElementGoverning(element: string): string {
    const governing: Record<string, string> = {
      'Wood': 'growth, flexibility, and expansion',
      'Fire': 'transformation, passion, and illumination',
      'Earth': 'stability, nourishment, and grounding',
      'Metal': 'structure, precision, and refinement',
      'Water': 'flow, adaptability, and depth'
    };
    return governing[element] || 'balance';
  }

  private static getAnimalArchetype(animal: string): string {
    const archetypes: Record<string, string> = {
      'Horse': 'freedom, movement, and independence',
      'Dragon': 'power, transformation, and leadership',
      'Tiger': 'courage, strength, and protection'
    };
    return archetypes[animal] || 'natural wisdom';
  }

  private static findRetrogrades(celestialData: any): string[] {
    return [];
  }

  private static analyzeCenters(centers: Record<string, any> | undefined | null) {
    const safeCenters = centers || {};
    const analyzed: Record<string, { defined: boolean; percentage: number }> = {};
    Object.entries(safeCenters).forEach(([name, center]: [string, any]) => {
      analyzed[name] = {
        defined: center?.defined || false,
        percentage: center?.defined ? 100 : 0
      };
    });
    return analyzed;
  }

  private static combineGates(gates: { unconscious_design: any[]; conscious_personality: any[] }) {
    const allGates = [...gates.unconscious_design, ...gates.conscious_personality];
    return allGates.map((gate, index) => ({
      number: parseInt(gate.toString().split('.')[0]),
      name: `Gate ${gate}`,
      line: parseInt(gate.toString().split('.')[1] || '1')
    }));
  }

  private static identifyChannels(gates: { unconscious_design: any[]; conscious_personality: any[] }) {
    return [
      { name: "1-8: Inspiration to Action", gates: [1, 8] },
      { name: "13-33: The Witness", gates: [13, 33] }
    ];
  }
}
