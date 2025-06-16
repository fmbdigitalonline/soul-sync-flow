
import { LayeredBlueprint, HumorStyle, HumorProfile } from '@/types/personality-modules';

export class HumorPaletteDetector {
  
  /**
   * Analyzes personality blueprint to determine humor style
   */
  static detectHumorProfile(blueprint: Partial<LayeredBlueprint>): HumorProfile {
    const mbtiType = blueprint.cognitiveTemperamental?.mbtiType || '';
    const sunSign = blueprint.publicArchetype?.sunSign || '';
    const hdType = blueprint.energyDecisionStrategy?.humanDesignType || '';
    const dominantFunction = blueprint.cognitiveTemperamental?.dominantFunction || '';
    
    console.log('Detecting humor profile for:', { mbtiType, sunSign, hdType, dominantFunction });

    const primaryStyle = this.calculatePrimaryHumorStyle(mbtiType, sunSign, hdType, dominantFunction);
    const secondaryStyle = this.calculateSecondaryStyle(blueprint);
    const intensity = this.calculateIntensity(blueprint);
    const appropriatenessLevel = this.calculateAppropriatenessLevel(blueprint);
    
    return {
      primaryStyle,
      secondaryStyle,
      intensity,
      appropriatenessLevel,
      contextualAdaptation: this.generateContextualAdaptation(primaryStyle, secondaryStyle),
      avoidancePatterns: this.generateAvoidancePatterns(blueprint),
      signatureElements: this.generateSignatureElements(primaryStyle, mbtiType, sunSign)
    };
  }

  private static calculatePrimaryHumorStyle(
    mbtiType: string, 
    sunSign: string, 
    hdType: string, 
    dominantFunction: string
  ): HumorStyle {
    // MBTI-based humor mapping
    const mbtiHumorMap: Record<string, HumorStyle> = {
      'ENTP': 'witty-inventor',
      'ENFP': 'playful-storyteller', 
      'INTP': 'dry-strategist',
      'INFP': 'gentle-empath',
      'ESTJ': 'observational-analyst',
      'ESFJ': 'warm-nurturer',
      'ENFJ': 'warm-nurturer',
      'ENTJ': 'dry-strategist',
      'ISFP': 'gentle-empath',
      'ISTP': 'dry-strategist',
      'ESTP': 'spontaneous-entertainer',
      'ESFP': 'spontaneous-entertainer',
      'ISFJ': 'warm-nurturer',
      'ISTJ': 'observational-analyst',
      'INFJ': 'philosophical-sage',
      'INTJ': 'dry-strategist'
    };

    // Sun sign modifiers
    const fireSignModifiers = ['Aries', 'Leo', 'Sagittarius'];
    const airSignModifiers = ['Gemini', 'Libra', 'Aquarius'];
    const earthSignModifiers = ['Taurus', 'Virgo', 'Capricorn'];
    const waterSignModifiers = ['Cancer', 'Scorpio', 'Pisces'];

    let baseStyle = mbtiHumorMap[mbtiType] || 'observational-analyst';

    // Astrological adjustments
    if (fireSignModifiers.includes(sunSign)) {
      if (baseStyle === 'gentle-empath') baseStyle = 'spontaneous-entertainer';
      if (baseStyle === 'observational-analyst') baseStyle = 'witty-inventor';
    }
    
    if (airSignModifiers.includes(sunSign)) {
      if (baseStyle === 'warm-nurturer') baseStyle = 'witty-inventor';
      if (baseStyle === 'philosophical-sage') baseStyle = 'observational-analyst';
    }

    if (waterSignModifiers.includes(sunSign)) {
      if (baseStyle === 'dry-strategist') baseStyle = 'philosophical-sage';
      if (baseStyle === 'witty-inventor') baseStyle = 'gentle-empath';
    }

    // Human Design energy type adjustments
    if (hdType === 'Manifestor' && baseStyle === 'gentle-empath') {
      baseStyle = 'witty-inventor';
    }
    if (hdType === 'Projector' && baseStyle === 'spontaneous-entertainer') {
      baseStyle = 'observational-analyst';
    }

    return baseStyle;
  }

  private static calculateSecondaryStyle(blueprint: Partial<LayeredBlueprint>): HumorStyle | undefined {
    const auxiliaryFunction = blueprint.cognitiveTemperamental?.auxiliaryFunction || '';
    
    // Map auxiliary cognitive functions to secondary humor styles
    const auxHumorMap: Record<string, HumorStyle> = {
      'Ne': 'playful-storyteller',
      'Ni': 'philosophical-sage',
      'Se': 'spontaneous-entertainer',
      'Si': 'warm-nurturer',
      'Te': 'dry-strategist',
      'Ti': 'witty-inventor',
      'Fe': 'warm-nurturer',
      'Fi': 'gentle-empath'
    };

    return auxHumorMap[auxiliaryFunction];
  }

  private static calculateIntensity(blueprint: Partial<LayeredBlueprint>): 'subtle' | 'moderate' | 'vibrant' {
    const mbtiType = blueprint.cognitiveTemperamental?.mbtiType || '';
    const sunSign = blueprint.publicArchetype?.sunSign || '';
    
    // Extroverted types tend toward higher intensity
    if (mbtiType.startsWith('E')) {
      return ['Leo', 'Sagittarius', 'Aries', 'Gemini'].includes(sunSign) ? 'vibrant' : 'moderate';
    }
    
    // Introverted types lean subtle to moderate
    return ['Cancer', 'Pisces', 'Scorpio', 'Virgo'].includes(sunSign) ? 'subtle' : 'moderate';
  }

  private static calculateAppropriatenessLevel(blueprint: Partial<LayeredBlueprint>): 'conservative' | 'balanced' | 'playful' {
    const mbtiType = blueprint.cognitiveTemperamental?.mbtiType || '';
    const lifeThemes = blueprint.coreValuesNarrative?.lifeThemes || [];
    
    // Judging types tend to be more conservative
    if (mbtiType.endsWith('J')) {
      return lifeThemes.includes('innovation') || lifeThemes.includes('creativity') ? 'balanced' : 'conservative';
    }
    
    // Perceiving types lean more playful
    return lifeThemes.includes('tradition') || lifeThemes.includes('stability') ? 'balanced' : 'playful';
  }

  private static generateContextualAdaptation(
    primary: HumorStyle, 
    secondary?: HumorStyle
  ): HumorProfile['contextualAdaptation'] {
    return {
      coaching: this.adaptHumorForContext(primary, 'coaching'),
      guidance: this.adaptHumorForContext(primary, 'guidance'), 
      casual: secondary || primary
    };
  }

  private static adaptHumorForContext(style: HumorStyle, context: 'coaching' | 'guidance'): HumorStyle {
    if (context === 'coaching') {
      // Coaching contexts benefit from motivational humor
      const coachingMap: Record<HumorStyle, HumorStyle> = {
        'witty-inventor': 'observational-analyst',
        'dry-strategist': 'observational-analyst',
        'playful-storyteller': 'warm-nurturer',
        'warm-nurturer': 'warm-nurturer',
        'observational-analyst': 'observational-analyst',
        'spontaneous-entertainer': 'warm-nurturer',
        'philosophical-sage': 'gentle-empath',
        'gentle-empath': 'gentle-empath'
      };
      return coachingMap[style];
    }
    
    // Guidance contexts benefit from wisdom-oriented humor
    const guidanceMap: Record<HumorStyle, HumorStyle> = {
      'witty-inventor': 'philosophical-sage',
      'dry-strategist': 'philosophical-sage',
      'playful-storyteller': 'gentle-empath',
      'warm-nurturer': 'gentle-empath',
      'observational-analyst': 'philosophical-sage',
      'spontaneous-entertainer': 'playful-storyteller',
      'philosophical-sage': 'philosophical-sage',
      'gentle-empath': 'gentle-empath'
    };
    return guidanceMap[style];
  }

  private static generateAvoidancePatterns(blueprint: Partial<LayeredBlueprint>): string[] {
    const patterns = ['offensive language', 'personal attacks', 'inappropriate topics'];
    
    // Add personality-specific avoidances
    const mbtiType = blueprint.cognitiveTemperamental?.mbtiType || '';
    const coreBeliefs = blueprint.motivationBeliefEngine?.coreBeliefs || [];
    
    // Feeling types avoid harsh humor
    if (mbtiType.includes('F')) {
      patterns.push('harsh criticism', 'mean-spirited jokes');
    }
    
    // Add belief-based avoidances
    if (coreBeliefs.includes('compassion')) {
      patterns.push('making light of suffering');
    }
    
    return patterns;
  }

  private static generateSignatureElements(
    style: HumorStyle, 
    mbtiType: string, 
    sunSign: string
  ): string[] {
    const baseElements: Record<HumorStyle, string[]> = {
      'witty-inventor': ['clever wordplay', 'unexpected connections', 'intellectual puns'],
      'dry-strategist': ['subtle irony', 'deadpan delivery', 'understated observations'],
      'playful-storyteller': ['vivid analogies', 'character voices', 'plot twists'],
      'warm-nurturer': ['gentle teasing', 'inclusive humor', 'encouraging jokes'],
      'observational-analyst': ['situational comedy', 'pattern recognition', 'logical absurdities'],
      'spontaneous-entertainer': ['physical comedy', 'improv style', 'energy-based humor'],
      'philosophical-sage': ['existential humor', 'profound one-liners', 'wisdom through paradox'],
      'gentle-empath': ['self-deprecating humor', 'emotional intelligence', 'healing laughter']
    };
    
    return baseElements[style] || baseElements['observational-analyst'];
  }

  /**
   * Validates humor appropriateness using content filtering
   */
  static validateHumorContent(content: string, profile: HumorProfile): boolean {
    // Check against avoidance patterns
    const lowerContent = content.toLowerCase();
    
    for (const pattern of profile.avoidancePatterns) {
      if (lowerContent.includes(pattern.toLowerCase())) {
        console.warn(`Humor content blocked: contains "${pattern}"`);
        return false;
      }
    }
    
    // Additional profanity/inappropriate content checks
    const inappropriateTerms = ['hate', 'stupid', 'dumb', 'idiot', 'moron'];
    for (const term of inappropriateTerms) {
      if (lowerContent.includes(term)) {
        console.warn(`Humor content blocked: inappropriate term "${term}"`);
        return false;
      }
    }
    
    return true;
  }
}
