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
    const sunSign = blueprint.archetype_western?.sun_sign || "Unknown";
    const hdType = blueprint.energy_strategy_human_design?.type || "Generator";
    const lifePathNumber = blueprint.values_life_path?.lifePathNumber || 1;
    const chineseElement = blueprint.archetype_chinese?.element || "Wood";
    const chineseAnimal = blueprint.archetype_chinese?.animal || "Dragon";

    const facts = [
      `${hdType}`,
      `Life Path ${lifePathNumber}`,
      `${sunSign}`,
      `${chineseElement} ${chineseAnimal}`
    ];

    return {
      facts,
      narratives: {
        novice: `You're a ${hdType} with ${sunSign}. This means you're designed to ${blueprint.energy_strategy_human_design?.strategy?.toLowerCase() || 'respond'}. Your Life Path ${lifePathNumber} shows you're here to be a ${blueprint.values_life_path?.lifePathKeyword?.toLowerCase() || 'creator'}. As a ${chineseElement} ${chineseAnimal}, you bring ${chineseElement.toLowerCase()} energy to everything you do.`,
        
        amateur: `As a ${hdType} with ${blueprint.energy_strategy_human_design?.authority || 'Sacral'} authority, your strategy is to ${blueprint.energy_strategy_human_design?.strategy?.toLowerCase() || 'respond'}. Your ${sunSign} gives you ${blueprint.archetype_western?.sun_keyword?.toLowerCase() || 'communication'} energy, while Life Path ${lifePathNumber} indicates your soul came here to master ${blueprint.values_life_path?.lifePathKeyword?.toLowerCase() || 'creative expression'}. The ${chineseElement} ${chineseAnimal} combination adds ${chineseElement.toLowerCase()} stability and ${chineseAnimal.toLowerCase()} characteristics to your energetic signature.`,
        
        pro: `${hdType} with ${blueprint.energy_strategy_human_design?.definition || 'Single'} definition and ${blueprint.energy_strategy_human_design?.profile || '2/4'} profile. ${sunSign} creates ${blueprint.archetype_western?.sun_keyword?.toLowerCase() || 'communication'} solar expression through ${blueprint.energy_strategy_human_design?.authority || 'Sacral'} decision-making authority. Life Path ${lifePathNumber} (${blueprint.values_life_path?.lifePathKeyword || 'Seeker'}) intersects with Expression Number ${blueprint.values_life_path?.expressionNumber || 5} (${blueprint.values_life_path?.expressionKeyword || 'Freedom'}) creating a complex mandala of ${chineseElement} ${chineseAnimal} ${blueprint.archetype_chinese?.yin_yang || 'Yang'} polarity. Strategy: ${blueprint.energy_strategy_human_design?.strategy || 'Respond'}. Not-self theme: ${blueprint.energy_strategy_human_design?.not_self_theme || 'Frustration'}.`
      }
    };
  }

  private static generateWesternSection(blueprint: BlueprintData, celestialData?: any) {
    const sunSign = blueprint.archetype_western?.sun_sign || "Unknown";
    const moonSign = blueprint.archetype_western?.moon_sign || "Unknown";
    const risingSign = blueprint.archetype_western?.rising_sign || "Unknown";
    
    // Extract degrees if available
    const sunDegrees = this.extractDegrees(sunSign);
    const moonDegrees = this.extractDegrees(moonSign);
    
    const facts = [
      `☉ ${sunSign}`,
      `☽ ${moonSign}`,
      `ASC ${risingSign}`,
      `Source: ${blueprint.archetype_western?.source || 'template'}`
    ];

    return {
      facts,
      narratives: {
        novice: `Your sun in ${sunSign.split(' ')[0]} makes you ${blueprint.archetype_western?.sun_keyword?.toLowerCase() || 'communicative'}, while your moon in ${moonSign.split(' ')[0]} means you feel most comfortable when you're ${blueprint.archetype_western?.moon_keyword?.toLowerCase() || 'nurturing'}. Your rising sign shows how others see you when they first meet you.`,
        
        amateur: `Your ${sunSign} creates ${blueprint.archetype_western?.sun_keyword?.toLowerCase() || 'communicative'} core identity and conscious ego expression. The ${moonSign} provides ${blueprint.archetype_western?.moon_keyword?.toLowerCase() || 'nurturing'} emotional responses and unconscious patterns. Your ${risingSign} ascendant is your mask and first impression - how you naturally approach new situations and how the world sees you initially.`,
        
        pro: `Solar placement at ${sunSign} creates ${blueprint.archetype_western?.sun_keyword?.toLowerCase() || 'communicative'} conscious identity${sunDegrees ? ` at ${sunDegrees}` : ''}. Lunar expression through ${moonSign}${moonDegrees ? ` at ${moonDegrees}` : ''} provides ${blueprint.archetype_western?.moon_keyword?.toLowerCase() || 'nurturing'} emotional substrate and unconscious response patterns. ${risingSign} ascendant creates the persona filter through which this solar-lunar dynamic is expressed to the world. Calculated using ${blueprint.archetype_western?.source || 'template'} with ${blueprint.metadata?.engine || 'unknown engine'}.`
      },
      aspects: celestialData?.aspects || [],
      houses: celestialData?.houses || {},
      retrogrades: this.findRetrogrades(celestialData)
    };
  }

  private static generateHumanDesignSection(blueprint: BlueprintData) {
    const hd = blueprint.energy_strategy_human_design || {};
    
    // Safely access gates with fallback
    const gates = hd.gates || { conscious_personality: [], unconscious_design: [] };
    const definedCenters = this.getDefinedCenters(hd.centers);
    const totalGates = (gates.conscious_personality?.length || 0) + (gates.unconscious_design?.length || 0);
    const channels = this.getChannelsFromCenters(hd.centers);

    const facts = [
      `${hd.type || 'Generator'}`,
      `${hd.strategy || 'Respond'}`,
      `${hd.authority || 'Sacral'}`,
      `Profile ${hd.profile || '2/4'}`,
      `${hd.definition || 'Single'}`,
      `${definedCenters.length}/9 Centers Defined`,
      `${totalGates} Active Gates`,
      `${channels.length} Channels`
    ];

    return {
      facts,
      narratives: {
        novice: `You're a ${hd.type || 'Generator'}! This means your strategy is to ${hd.strategy?.toLowerCase() || 'respond'}. When making decisions, listen to your ${hd.authority?.toLowerCase() || 'sacral'} authority. You have ${definedCenters.length} out of 9 energy centers defined, which means you have consistent energy in those areas. When you don't follow your strategy, you might feel ${hd.not_self_theme?.toLowerCase() || 'frustration'}.`,
        
        amateur: `As a ${hd.type || 'Generator'} with ${hd.authority || 'Sacral'} authority, your strategy is to ${hd.strategy?.toLowerCase() || 'respond'}. Your ${hd.definition || 'Single'} means your defined centers work ${(hd.definition || 'Single').includes('Single') ? 'as one connected system' : 'in separate groups'}. With ${definedCenters.length}/9 centers defined (${definedCenters.join(', ')}), you have reliable energy in these areas. Your ${hd.profile || '2/4'} profile shows you're here to ${this.getProfileDescription(hd.profile || '2/4')}.`,
        
        pro: `${hd.type || 'Generator'} with ${hd.definition || 'Single'} operating through ${hd.authority || 'Sacral'} authority. Profile ${hd.profile || '2/4'} creates ${this.getProfileDescription(hd.profile || '2/4')} incarnation cross themes. Defined centers: ${definedCenters.join(', ')} creating ${channels.length} channels: ${channels.join(', ')}. Conscious gates: ${gates.conscious_personality?.join(', ') || 'None'}. Unconscious gates: ${gates.unconscious_design?.join(', ') || 'None'}. Strategy: ${hd.strategy || 'Respond'}. Not-self: ${hd.not_self_theme || 'Frustration'}. Life purpose: ${hd.life_purpose || 'To find satisfaction'}.`
      },
      centers: this.analyzeCenters(hd.centers),
      gates: this.combineGates(gates),
      channels: this.identifyChannels(gates)
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
