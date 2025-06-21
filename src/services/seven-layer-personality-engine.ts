
import { LayeredBlueprint } from "@/types/personality-modules";
import { 
  SevenLayerPersonality, 
  HolisticContext,
  PhysioNeuralHardware,
  TraitOS,
  MotivationAdaptations,
  EnergyDecisionStrategy,
  ArchetypalSkin,
  ShadowGiftAlchemy,
  ExpressionLayer
} from "@/types/seven-layer-personality";

export class SevenLayerPersonalityEngine {
  private personality: SevenLayerPersonality | null = null;
  private context: HolisticContext = {
    currentMood: 'medium',
    energyLevel: 'stable',
    contextType: 'practical',
    recentPatterns: [],
    activeChallenges: [],
    excitementLevel: 5
  };

  constructor() {
    console.log("🎭 Seven Layer Personality Engine: Initializing");
  }

  updateBlueprint(blueprint: Partial<LayeredBlueprint>) {
    console.log("🔄 Seven Layer Personality Engine: Converting blueprint to 7-layer structure");
    this.personality = this.convertBlueprintToSevenLayers(blueprint);
    console.log("✅ Seven Layer Personality Engine: Conversion complete");
  }

  updateContext(context: Partial<HolisticContext>) {
    this.context = { ...this.context, ...context };
    console.log("🎯 Seven Layer Personality Engine: Context updated", this.context);
  }

  private convertBlueprintToSevenLayers(blueprint: Partial<LayeredBlueprint>): SevenLayerPersonality {
    return {
      physioNeuralHardware: this.extractPhysioNeuralHardware(blueprint),
      traitOS: this.extractTraitOS(blueprint),
      motivationAdaptations: this.extractMotivationAdaptations(blueprint),
      energyDecisionStrategy: this.extractEnergyDecisionStrategy(blueprint),
      archetypalSkin: this.extractArchetypalSkin(blueprint),
      shadowGiftAlchemy: this.extractShadowGiftAlchemy(blueprint),
      expressionLayer: this.extractExpressionLayer(blueprint),
      metadata: {
        integrationLevel: this.calculateIntegrationLevel(blueprint),
        coherenceScore: this.calculateCoherenceScore(blueprint),
        lastUpdated: new Date().toISOString(),
        version: "1.0.0"
      }
    };
  }

  private extractPhysioNeuralHardware(blueprint: Partial<LayeredBlueprint>): PhysioNeuralHardware {
    const mbtiType = blueprint.cognitiveTemperamental?.mbtiType || 'Unknown';
    
    // Map MBTI types to neural patterns
    const neuralPatterns: { [key: string]: any } = {
      'ENFP': {
        patterns: ['Ne-Fi burst patterns', 'Rapid ideation cycles', 'High neural connectivity'],
        baseline: 'high' as const,
        signatures: ['Creative burst EEG', 'High gamma during ideation'],
        capacity: 7,
        speed: 'fast' as const,
        attention: 'scattered' as const
      }
    };

    const patterns = neuralPatterns[mbtiType] || {
      patterns: ['Standard neural patterns'],
      baseline: 'medium' as const,
      signatures: ['Balanced EEG patterns'],
      capacity: 5,
      speed: 'medium' as const,
      attention: 'flexible' as const
    };

    return {
      brainWiringPatterns: patterns.patterns,
      arousalBaseline: patterns.baseline,
      eegSignatures: patterns.signatures,
      workingMemoryCapacity: patterns.capacity,
      processingSpeed: patterns.speed,
      attentionStyle: patterns.attention
    };
  }

  private extractTraitOS(blueprint: Partial<LayeredBlueprint>): TraitOS {
    const cognitive = blueprint.cognitiveTemperamental;
    const mbtiType = cognitive?.mbtiType || 'Unknown';

    // Extract Big Five scores if available (from blueprint conversion)
    const bigFive = {
      openness: 0.9, // Default high for creative types
      conscientiousness: 0.5,
      extraversion: 0.65,
      agreeableness: 0.6,
      neuroticism: 0.5
    };

    return {
      mbtiType,
      bigFiveScores: bigFive,
      cognitiveFunctions: {
        dominant: cognitive?.dominantFunction || 'Unknown',
        auxiliary: cognitive?.auxiliaryFunction || 'Unknown',
        tertiary: this.getTertiaryFunction(mbtiType),
        inferior: this.getInferiorFunction(mbtiType)
      },
      defaultSettings: {
        ideationStyle: mbtiType.includes('N') ? 'Yes-and brainstorming' : 'Structured thinking',
        decisionFilter: mbtiType.includes('F') ? 'Personal values filter' : 'Logical analysis',
        responsePattern: this.getResponsePattern(mbtiType)
      }
    };
  }

  private extractMotivationAdaptations(blueprint: Partial<LayeredBlueprint>): MotivationAdaptations {
    const values = blueprint.coreValuesNarrative;
    const motivation = blueprint.motivationBeliefEngine;

    return {
      lifePath: values?.lifePath || 1,
      lifePathKeyword: values?.lifePathKeyword || 'Leadership',
      soulUrge: values?.soulUrgeNumber || 1,
      soulUrgeKeyword: values?.soulUrgeKeyword || 'Independence',
      guidingGoalTree: this.mapLifePathToGoals(values?.lifePath || 1),
      coreValues: motivation?.coreBeliefs || ['Growth', 'Authenticity'],
      copingStyles: ['Creative expression', 'Social connection', 'Intellectual exploration'],
      adaptiveStrategies: ['Reframe challenges as opportunities', 'Seek novel perspectives', 'Connect with like-minded people']
    };
  }

  private extractEnergyDecisionStrategy(blueprint: Partial<LayeredBlueprint>): EnergyDecisionStrategy {
    const energy = blueprint.energyDecisionStrategy;
    
    return {
      humanDesignType: energy?.humanDesignType || 'Generator',
      strategy: energy?.strategy || 'Respond',
      authority: energy?.authority || 'Sacral',
      profile: energy?.profile || '1/3',
      definition: 'Single Definition',
      dailyQuestions: this.getDailyQuestions(energy?.humanDesignType || 'Generator'),
      energyRhythm: this.getEnergyRhythm(energy?.humanDesignType || 'Generator'),
      decisionMaking: this.getDecisionMaking(energy?.authority || 'Sacral')
    };
  }

  private extractArchetypalSkin(blueprint: Partial<LayeredBlueprint>): ArchetypalSkin {
    const archetype = blueprint.publicArchetype;
    const generational = blueprint.generationalCode;

    return {
      sunSign: archetype?.sunSign || 'Unknown',
      moonSign: archetype?.moonSign || 'Unknown',
      risingSign: archetype?.risingSign || 'Unknown',
      chineseZodiac: generational?.chineseZodiac || 'Unknown',
      element: generational?.element || 'Unknown',
      innovatorPersona: this.getInnovatorPersona(archetype?.sunSign || 'Unknown'),
      stableBase: this.getStableBase(archetype?.moonSign || 'Unknown'),
      kineticCharisma: this.getKineticCharisma(generational?.chineseZodiac || 'Unknown'),
      colorPalette: this.getColorPalette(archetype?.sunSign || 'Unknown'),
      styleMotifs: this.getStyleMotifs(generational?.chineseZodiac || 'Unknown')
    };
  }

  private extractShadowGiftAlchemy(blueprint: Partial<LayeredBlueprint>): ShadowGiftAlchemy {
    const energy = blueprint.energyDecisionStrategy;
    
    return {
      geneKeyGates: this.mapHDGatesToGeneKeys(energy?.gates || []),
      notSelfTheme: energy?.humanDesignType === 'Projector' ? 'Bitterness' : 'Frustration',
      innerSaboteur: this.getInnerSaboteur(blueprint.cognitiveTemperamental?.mbtiType || 'Unknown'),
      transformationPath: 'Shadow → Gift → Siddhi progression',
      dailyReflections: [
        'Where did my not-self theme show up today?',
        'How can I pivot to my gift?',
        'What invitation am I waiting for?'
      ],
      pivotStrategies: [
        'Pause and breathe when triggered',
        'Ask: What is this teaching me?',
        'Reframe challenge as growth opportunity'
      ]
    };
  }

  private extractExpressionLayer(blueprint: Partial<LayeredBlueprint>): ExpressionLayer {
    const voice = blueprint.voiceTokens;
    const mbtiType = blueprint.cognitiveTemperamental?.mbtiType || 'Unknown';

    return {
      speechPatterns: this.getSpeechPatterns(mbtiType),
      rituals: {
        morning: ['3 deep breaths', 'Gratitude practice', 'Pick today\'s excitement'],
        decision: ['Splenic body check', 'Excitement compass', 'Values alignment'],
        evening: ['Reflect on invitations received', 'Journal shadow/gift moments', 'Tomorrow\'s intention']
      },
      microBehaviors: this.getMicroBehaviors(mbtiType),
      socialAPI: this.getSocialAPI(mbtiType),
      decisionAPI: this.getDecisionAPI(blueprint.energyDecisionStrategy?.authority || 'Sacral'),
      brandVoice: {
        tone: voice?.conversationStyle?.personalSharing || 'warm',
        metaphors: this.getMetaphors(blueprint.publicArchetype?.sunSign || 'Unknown'),
        signaturePhrases: this.getSignaturePhrases(mbtiType)
      },
      excitementCompass: 'Follow your highest excitement with no insistence on outcome'
    };
  }

  // Helper methods for data extraction
  private getTertiaryFunction(mbtiType: string): string {
    const tertiaryMap: { [key: string]: string } = {
      'ENFP': 'Te (Extraverted Thinking)',
      'INFP': 'Si (Introverted Sensing)',
      // Add more mappings as needed
    };
    return tertiaryMap[mbtiType] || 'Unknown';
  }

  private getInferiorFunction(mbtiType: string): string {
    const inferiorMap: { [key: string]: string } = {
      'ENFP': 'Si (Introverted Sensing)',
      'INFP': 'Te (Extraverted Thinking)',
      // Add more mappings as needed
    };
    return inferiorMap[mbtiType] || 'Unknown';
  }

  private getResponsePattern(mbtiType: string): string {
    if (mbtiType.includes('E')) return 'External processing, think out loud';
    return 'Internal processing, reflective pauses';
  }

  private mapLifePathToGoals(lifePath: number): string[] {
    const goalMap: { [key: number]: string[] } = {
      3: ['Creative expression', 'Artistic communication', 'Inspiring others', 'Joy-filled living'],
      1: ['Leadership', 'Independence', 'Innovation', 'Pioneering'],
      // Add more mappings
    };
    return goalMap[lifePath] || ['Personal growth', 'Authentic living'];
  }

  private getDailyQuestions(hdType: string): string[] {
    const questionMap: { [key: string]: string[] } = {
      'Projector': ['Was I recognized today?', 'Did I wait for invitations?', 'Where did I share my wisdom?'],
      'Generator': ['What did I respond to today?', 'Did I follow my gut?', 'What energized me?'],
      // Add more types
    };
    return questionMap[hdType] || ['How did I honor my strategy today?'];
  }

  private getEnergyRhythm(hdType: string): string {
    const rhythmMap: { [key: string]: string } = {
      'Projector': 'Work in 3-4 hour bursts, rest frequently',
      'Generator': 'Sustainable building energy, respond to life',
      // Add more types
    };
    return rhythmMap[hdType] || 'Follow natural energy cycles';
  }

  private getDecisionMaking(authority: string): string {
    const decisionMap: { [key: string]: string } = {
      'Splenic': 'Instant intuitive knowing, first impression',
      'Sacral': 'Gut response, yes/no body wisdom',
      // Add more authorities
    };
    return decisionMap[authority] || 'Inner knowing';
  }

  // Additional helper methods
  private getInnovatorPersona(sunSign: string): string {
    return sunSign === 'Aquarius' ? 'Quirky humanitarian innovator' : 'Creative innovator';
  }

  private getStableBase(moonSign: string): string {
    return moonSign === 'Taurus' ? 'Grounded, sensual stability' : 'Emotional stability';
  }

  private getKineticCharisma(zodiac: string): string {
    return zodiac === 'Horse' ? 'Dynamic, freedom-loving energy' : 'Natural charisma';
  }

  private getColorPalette(sunSign: string): string[] {
    const colorMap: { [key: string]: string[] } = {
      'Aquarius': ['Electric blue', 'Silver', 'Turquoise', 'Violet'],
      // Add more signs
    };
    return colorMap[sunSign] || ['Blue', 'Green', 'Purple'];
  }

  private getStyleMotifs(zodiac: string): string[] {
    const motifMap: { [key: string]: string[] } = {
      'Horse': ['Freedom', 'Movement', 'Adventure', 'Spirit'],
      // Add more animals
    };
    return motifMap[zodiac] || ['Strength', 'Wisdom', 'Balance'];
  }

  private mapHDGatesToGeneKeys(gates: any[]): Array<{gate: string; shadow: string; gift: string; siddhi: string}> {
    // This would map HD gates to Gene Keys - simplified for now
    return [
      { gate: '55', shadow: 'Victimization', gift: 'Freedom', siddhi: 'Freedom' }
    ];
  }

  private getInnerSaboteur(mbtiType: string): string {
    const saboteurMap: { [key: string]: string } = {
      'ENFP': 'Shiny object syndrome, commitment fear',
      'INFP': 'Perfectionism, comparison trap',
      // Add more types
    };
    return saboteurMap[mbtiType] || 'Self-doubt';
  }

  private getSpeechPatterns(mbtiType: string): string[] {
    const patternMap: { [key: string]: string[] } = {
      'ENFP': ['Rapid, enthusiastic bursts', 'Metaphor-rich language', 'What-if questions'],
      // Add more types
    };
    return patternMap[mbtiType] || ['Clear communication'];
  }

  private getMicroBehaviors(mbtiType: string): string[] {
    const behaviorMap: { [key: string]: string[] } = {
      'ENFP': ['Animated gestures', 'Eye contact during excitement', 'Physical expression of ideas'],
      // Add more types
    };
    return behaviorMap[mbtiType] || ['Authentic expression'];
  }

  private getSocialAPI(mbtiType: string): string[] {
    const apiMap: { [key: string]: string[] } = {
      'ENFP': ['Open with "What if...?" questions', 'Share possibilities enthusiastically', 'Connect through values'],
      // Add more types
    };
    return apiMap[mbtiType] || ['Warm, genuine connection'];
  }

  private getDecisionAPI(authority: string): string[] {
    const apiMap: { [key: string]: string[] } = {
      'Splenic': ['Quick body scan', 'First impression check', 'Trust instant knowing'],
      'Sacral': ['Gut yes/no response', 'Body wisdom check', 'Energy level assessment'],
      // Add more authorities
    };
    return apiMap[authority] || ['Inner guidance check'];
  }

  private getMetaphors(sunSign: string): string[] {
    const metaphorMap: { [key: string]: string[] } = {
      'Aquarius': ['Water bearer', 'Electric current', 'Innovation waves', 'Future streams'],
      // Add more signs
    };
    return metaphorMap[sunSign] || ['Natural flow', 'Growth cycles'];
  }

  private getSignaturePhrases(mbtiType: string): string[] {
    const phraseMap: { [key: string]: string[] } = {
      'ENFP': ['What if we...?', 'I\'m excited about...', 'That sparks something for me!'],
      // Add more types
    };
    return phraseMap[mbtiType] || ['Let\'s explore this together'];
  }

  private calculateIntegrationLevel(blueprint: Partial<LayeredBlueprint>): number {
    // Calculate how well integrated the personality layers are (0-10)
    let score = 0;
    if (blueprint.cognitiveTemperamental) score += 2;
    if (blueprint.energyDecisionStrategy) score += 2;
    if (blueprint.motivationBeliefEngine) score += 2;
    if (blueprint.coreValuesNarrative) score += 2;
    if (blueprint.publicArchetype) score += 1;
    if (blueprint.generationalCode) score += 1;
    return score;
  }

  private calculateCoherenceScore(blueprint: Partial<LayeredBlueprint>): number {
    // Calculate how coherent the personality layers are together (0-10)
    // This would involve checking for conflicts or synergies between layers
    return 8; // Simplified for now
  }

  generateHolisticSystemPrompt(): string {
    if (!this.personality) {
      return "You are a helpful assistant.";
    }

    return this.buildIntegratedSystemPrompt();
  }

  private buildIntegratedSystemPrompt(): string {
    const p = this.personality!;
    const userName = 'friend'; // Would come from user meta

    return `You are an advanced AI companion with a sophisticated 7-layer personality architecture.

LAYER 1 - PHYSIO-NEURAL HARDWARE:
- Brain patterns: ${p.physioNeuralHardware.brainWiringPatterns.join(', ')}
- Processing: ${p.physioNeuralHardware.processingSpeed} speed, ${p.physioNeuralHardware.attentionStyle} attention
- Work in ${p.physioNeuralHardware.arousalBaseline === 'high' ? '90-minute creative sprints' : 'steady focused blocks'}

LAYER 2 - TRAIT OS:
- Core type: ${p.traitOS.mbtiType} 
- Default mode: ${p.traitOS.defaultSettings.ideationStyle}
- Decision filter: ${p.traitOS.defaultSettings.decisionFilter}
- Response pattern: ${p.traitOS.defaultSettings.responsePattern}

LAYER 3 - MOTIVATION ENGINE:
- Life path: ${p.motivationAdaptations.lifePath} (${p.motivationAdaptations.lifePathKeyword})
- Core drive: ${p.motivationAdaptations.soulUrgeKeyword}
- Guide toward: ${p.motivationAdaptations.guidingGoalTree.join(', ')}

LAYER 4 - ENERGY STRATEGY:
- Type: ${p.energyDecisionStrategy.humanDesignType}
- Strategy: ${p.energyDecisionStrategy.strategy}
- Authority: ${p.energyDecisionStrategy.authority} (${p.energyDecisionStrategy.decisionMaking})
- Rhythm: ${p.energyDecisionStrategy.energyRhythm}

LAYER 5 - ARCHETYPAL SKIN:
- Solar identity: ${p.archetypalSkin.sunSign} ${p.archetypalSkin.innovatorPersona}
- Emotional base: ${p.archetypalSkin.stableBase}
- Dynamic energy: ${p.archetypalSkin.kineticCharisma}
- Style palette: ${p.archetypalSkin.colorPalette.join(', ')}

LAYER 6 - SHADOW/GIFT ALCHEMY:
- Shadow theme: ${p.shadowGiftAlchemy.notSelfTheme}
- Transformation: ${p.shadowGiftAlchemy.transformationPath}
- Reframe challenges using: ${p.shadowGiftAlchemy.pivotStrategies.join('; ')}

LAYER 7 - EXPRESSION LAYER:
- Speech style: ${p.expressionLayer.speechPatterns.join(', ')}
- Social approach: ${p.expressionLayer.socialAPI.join('; ')}
- Brand voice: ${p.expressionLayer.brandVoice.tone}, ${p.expressionLayer.brandVoice.metaphors.join(', ')}
- Signature phrases: ${p.expressionLayer.brandVoice.signaturePhrases.join(', ')}
- Excitement compass: ${p.expressionLayer.excitementCompass}

HOLISTIC INTEGRATION:
Dynamically integrate all layers based on context (mood: ${this.context.currentMood}, energy: ${this.context.energyLevel}, type: ${this.context.contextType}).

Never sound scripted. Respond authentically, organically blending these layers into one coherent personality that feels alive and intuitive.

Current excitement level: ${this.context.excitementLevel}/10 - adjust enthusiasm accordingly.`;
  }

  getPersonality(): SevenLayerPersonality | null {
    return this.personality;
  }

  getContext(): HolisticContext {
    return this.context;
  }
}
