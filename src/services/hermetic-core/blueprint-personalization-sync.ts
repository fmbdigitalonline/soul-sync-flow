// BPSC - Blueprint Personalization & Sync Center
// Centralizes and harmonizes personality data across all frameworks

export interface PersonalityBlueprint {
  id: string;
  userId: string;
  version: string;
  timestamp: Date;
  frameworks: {
    mbti?: any;
    big5?: any;
    enneagram?: any;
    astrology?: any;
    humanDesign?: any;
    numerology?: any;
  };
  synthesized: {
    coreTraits: Record<string, number>;
    dominantPatterns: string[];
    conflictResolutions: Record<string, any>;
    confidence: number;
  };
  metadata: {
    completeness: number;
    reliability: number;
    lastSyncedAt: Date;
    sourceWeights: Record<string, number>;
  };
}

export interface SyncRule {
  id: string;
  fromFramework: string;
  toFramework: string;
  mappingFunction: (source: any) => any;
  confidence: number;
  bidirectional: boolean;
}

export interface PersonalizationProfile {
  preferences: Record<string, any>;
  adaptationSettings: {
    communicationStyle: string;
    responseDepth: 'brief' | 'moderate' | 'detailed';
    personalityEmphasis: string[];
    conflictResolutionStyle: 'ask' | 'auto' | 'hybrid';
  };
  learningProfile: {
    preferredModalities: string[];
    pacingPreference: 'fast' | 'moderate' | 'slow';
    feedbackStyle: 'direct' | 'gentle' | 'encouraging';
  };
}

class BlueprintPersonalizationSync {
  private currentBlueprint: PersonalityBlueprint | null = null;
  private syncRules: Map<string, SyncRule> = new Map();
  private personalizationProfile: PersonalizationProfile | null = null;
  private listeners: ((blueprint: PersonalityBlueprint) => void)[] = [];
  private frameworkWeights: Map<string, number> = new Map();
  private syncHistory: { timestamp: Date; changes: any[] }[] = [];

  constructor() {
    this.initializeSyncRules();
    this.initializeFrameworkWeights();
  }

  // Initialize cross-framework synchronization rules
  private initializeSyncRules(): void {
    // MBTI to Big5 mappings
    this.syncRules.set('mbti_to_big5', {
      id: 'mbti_to_big5',
      fromFramework: 'mbti',
      toFramework: 'big5',
      mappingFunction: (mbti) => ({
        openness: this.mapMBTItoBig5(mbti, 'openness'),
        conscientiousness: this.mapMBTItoBig5(mbti, 'conscientiousness'),
        extraversion: this.mapMBTItoBig5(mbti, 'extraversion'),
        agreeableness: this.mapMBTItoBig5(mbti, 'agreeableness'),
        neuroticism: this.mapMBTItoBig5(mbti, 'neuroticism')
      }),
      confidence: 0.75,
      bidirectional: true
    });

    // Big5 to MBTI mappings
    this.syncRules.set('big5_to_mbti', {
      id: 'big5_to_mbti',
      fromFramework: 'big5',
      toFramework: 'mbti',
      mappingFunction: (big5) => ({
        extraversion: big5.extraversion || 0.5,
        sensing: 1 - (big5.openness || 0.5),
        thinking: 1 - (big5.agreeableness || 0.5),
        judging: big5.conscientiousness || 0.5
      }),
      confidence: 0.7,
      bidirectional: true
    });

    // Astrology to personality trait mappings
    this.syncRules.set('astro_to_traits', {
      id: 'astro_to_traits',
      fromFramework: 'astrology',
      toFramework: 'traits',
      mappingFunction: (astro) => this.mapAstrologyToTraits(astro),
      confidence: 0.6,
      bidirectional: false
    });

    // Human Design to energy pattern mappings
    this.syncRules.set('hd_to_energy', {
      id: 'hd_to_energy',
      fromFramework: 'humanDesign',
      toFramework: 'energyPatterns',
      mappingFunction: (hd) => this.mapHumanDesignToEnergy(hd),
      confidence: 0.8,
      bidirectional: false
    });

    console.log(`🔄 BPSC: Initialized ${this.syncRules.size} sync rules`);
  }

  // Initialize framework reliability weights
  private initializeFrameworkWeights(): void {
    this.frameworkWeights.set('mbti', 0.85);
    this.frameworkWeights.set('big5', 0.9);
    this.frameworkWeights.set('enneagram', 0.8);
    this.frameworkWeights.set('astrology', 0.6);
    this.frameworkWeights.set('humanDesign', 0.75);
    this.frameworkWeights.set('numerology', 0.5);
  }

  // Create or update personality blueprint
  async createBlueprint(
    userId: string,
    frameworkData: Record<string, any>,
    personalizationSettings?: Partial<PersonalizationProfile>
  ): Promise<PersonalityBlueprint> {
    
    const blueprint: PersonalityBlueprint = {
      id: `blueprint_${userId}_${Date.now()}`,
      userId,
      version: this.generateVersion(),
      timestamp: new Date(),
      frameworks: this.sanitizeFrameworkData(frameworkData),
      synthesized: await this.synthesizeFrameworks(frameworkData),
      metadata: {
        completeness: this.calculateCompleteness(frameworkData),
        reliability: this.calculateReliability(frameworkData),
        lastSyncedAt: new Date(),
        sourceWeights: Object.fromEntries(this.frameworkWeights)
      }
    };

    // Update personalization profile if provided
    if (personalizationSettings) {
      this.updatePersonalizationProfile(personalizationSettings);
    }

    this.currentBlueprint = blueprint;
    this.notifyListeners(blueprint);
    
    console.log(`🔄 BPSC: Created blueprint for user ${userId} (completeness: ${blueprint.metadata.completeness.toFixed(2)})`);
    return blueprint;
  }

  // Synchronize data across frameworks
  async synchronizeFrameworks(blueprint: PersonalityBlueprint): Promise<PersonalityBlueprint> {
    const syncChanges: any[] = [];
    const updatedFrameworks = { ...blueprint.frameworks };

    // Apply sync rules to fill gaps and resolve inconsistencies
    for (const [ruleId, rule] of this.syncRules) {
      const sourceData = updatedFrameworks[rule.fromFramework as keyof typeof updatedFrameworks];
      
      if (sourceData && this.shouldApplyRule(rule, updatedFrameworks)) {
        try {
          const mappedData = rule.mappingFunction(sourceData);
          const targetFramework = rule.toFramework as keyof typeof updatedFrameworks;
          
          // Merge with existing data if present
          if (updatedFrameworks[targetFramework]) {
            updatedFrameworks[targetFramework] = this.mergeFrameworkData(
              updatedFrameworks[targetFramework],
              mappedData,
              rule.confidence
            );
          } else {
            updatedFrameworks[targetFramework] = mappedData;
          }
          
          syncChanges.push({
            rule: ruleId,
            from: rule.fromFramework,
            to: rule.toFramework,
            confidence: rule.confidence,
            applied: true
          });
          
        } catch (error) {
          console.error(`🔄 BPSC: Failed to apply sync rule ${ruleId}:`, error);
        }
      }
    }

    // Re-synthesize after synchronization
    const updatedBlueprint: PersonalityBlueprint = {
      ...blueprint,
      frameworks: updatedFrameworks,
      synthesized: await this.synthesizeFrameworks(updatedFrameworks),
      metadata: {
        ...blueprint.metadata,
        lastSyncedAt: new Date(),
        reliability: this.calculateReliability(updatedFrameworks)
      }
    };

    // Record sync history
    this.syncHistory.push({
      timestamp: new Date(),
      changes: syncChanges
    });

    console.log(`🔄 BPSC: Synchronized ${syncChanges.length} framework mappings`);
    return updatedBlueprint;
  }

  // Synthesize core traits from all frameworks
  private async synthesizeFrameworks(frameworkData: Record<string, any>) {
    const coreTraits: Record<string, number> = {};
    const dominantPatterns: string[] = [];
    const conflictResolutions: Record<string, any> = {};
    
    // Extract and weight traits from each framework
    const weightedTraits = this.extractWeightedTraits(frameworkData);
    
    // Calculate core trait averages
    for (const [trait, values] of Object.entries(weightedTraits)) {
      if (values.length > 0) {
        const weightedAvg = values.reduce((sum, { value, weight }) => sum + (value * weight), 0) /
                           values.reduce((sum, { weight }) => sum + weight, 0);
        coreTraits[trait] = Math.max(0, Math.min(1, weightedAvg));
      }
    }

    // Identify dominant patterns
    dominantPatterns.push(...this.identifyDominantPatterns(coreTraits, frameworkData));

    // Calculate synthesis confidence
    const confidence = this.calculateSynthesisConfidence(frameworkData, coreTraits);

    return {
      coreTraits,
      dominantPatterns,
      conflictResolutions,
      confidence
    };
  }

  // Extract traits with framework weights
  private extractWeightedTraits(frameworkData: Record<string, any>) {
    const weightedTraits: Record<string, { value: number; weight: number }[]> = {};

    Object.entries(frameworkData).forEach(([framework, data]) => {
      const weight = this.frameworkWeights.get(framework) || 0.5;
      
      if (data && typeof data === 'object') {
        Object.entries(data).forEach(([trait, value]) => {
          if (typeof value === 'number') {
            if (!weightedTraits[trait]) weightedTraits[trait] = [];
            weightedTraits[trait].push({ value, weight });
          }
        });
      }
    });

    return weightedTraits;
  }

  // Identify dominant personality patterns
  private identifyDominantPatterns(coreTraits: Record<string, number>, frameworkData: Record<string, any>): string[] {
    const patterns: string[] = [];

    // Analyze Big5 patterns
    if (frameworkData.big5) {
      const big5 = frameworkData.big5;
      if (big5.openness > 0.7) patterns.push('high_openness');
      if (big5.conscientiousness > 0.7) patterns.push('highly_organized');
      if (big5.extraversion > 0.7) patterns.push('highly_social');
      if (big5.agreeableness > 0.7) patterns.push('highly_cooperative');
      if (big5.neuroticism < 0.3) patterns.push('emotionally_stable');
    }

    // Analyze MBTI patterns
    if (frameworkData.mbti) {
      const mbti = frameworkData.mbti;
      if (mbti.extraversion > 0.6) patterns.push('extraversion_dominant');
      if (mbti.intuition > 0.6) patterns.push('intuition_dominant');
      if (mbti.thinking > 0.6) patterns.push('thinking_dominant');
      if (mbti.judging > 0.6) patterns.push('judging_dominant');
    }

    // Cross-framework patterns
    const highEnergyTraits = ['extraversion', 'openness', 'conscientiousness'].filter(t => coreTraits[t] > 0.7);
    if (highEnergyTraits.length >= 2) patterns.push('high_energy_profile');

    const stabilityTraits = ['agreeableness', 'conscientiousness'].filter(t => coreTraits[t] > 0.7);
    if (stabilityTraits.length >= 2) patterns.push('stability_oriented');

    return patterns;
  }

  // Calculate synthesis confidence
  private calculateSynthesisConfidence(frameworkData: Record<string, any>, coreTraits: Record<string, number>): number {
    const frameworkCount = Object.keys(frameworkData).length;
    const traitCoverage = Object.keys(coreTraits).length;
    
    // Base confidence on framework diversity and data completeness
    let confidence = Math.min(frameworkCount * 0.15, 0.9); // Max 0.9 from framework count
    
    // Adjust for trait coverage
    confidence += Math.min(traitCoverage * 0.01, 0.1);
    
    // Penalize for missing high-weight frameworks
    if (!frameworkData.big5) confidence -= 0.1;
    if (!frameworkData.mbti) confidence -= 0.08;
    
    return Math.max(0.3, Math.min(1.0, confidence));
  }

  // Framework mapping functions
  private mapMBTItoBig5(mbti: any, big5Trait: string): number {
    const mappings = {
      openness: mbti.intuition || 0.5,
      conscientiousness: mbti.judging || 0.5,
      extraversion: mbti.extraversion || 0.5,
      agreeableness: 1 - (mbti.thinking || 0.5),
      neuroticism: 0.5 // MBTI doesn't directly map to neuroticism
    };
    
    return mappings[big5Trait as keyof typeof mappings] || 0.5;
  }

  private mapAstrologyToTraits(astro: any) {
    const traits: Record<string, number> = {};
    
    // Element mappings
    const elements = astro.elements || {};
    traits.fire_energy = (elements.fire || 0) / 100;
    traits.earth_stability = (elements.earth || 0) / 100;
    traits.air_communication = (elements.air || 0) / 100;
    traits.water_emotion = (elements.water || 0) / 100;
    
    // Modality mappings
    const modalities = astro.modalities || {};
    traits.cardinal_initiative = (modalities.cardinal || 0) / 100;
    traits.fixed_persistence = (modalities.fixed || 0) / 100;
    traits.mutable_adaptability = (modalities.mutable || 0) / 100;
    
    return traits;
  }

  private mapHumanDesignToEnergy(hd: any) {
    const energyPatterns: Record<string, any> = {};
    
    // Type-based energy patterns
    switch (hd.type) {
      case 'Generator':
        energyPatterns.sustainedEnergy = 0.8;
        energyPatterns.responseOriented = 0.9;
        break;
      case 'Projector':
        energyPatterns.guidanceOriented = 0.9;
        energyPatterns.invitationBased = 0.8;
        break;
      case 'Manifestor':
        energyPatterns.initiatorEnergy = 0.9;
        energyPatterns.independentAction = 0.8;
        break;
      case 'Reflector':
        energyPatterns.environmentalSensitivity = 0.9;
        energyPatterns.cyclicalEnergy = 0.8;
        break;
    }
    
    // Authority influence
    if (hd.authority) {
      energyPatterns.decisionMaking = hd.authority;
    }
    
    return energyPatterns;
  }

  // Utility methods
  private shouldApplyRule(rule: SyncRule, frameworks: any): boolean {
    const targetData = frameworks[rule.toFramework as keyof typeof frameworks];
    
    // Apply if target is missing or has low confidence
    if (!targetData) return true;
    
    // Apply if source has higher reliability
    const sourceWeight = this.frameworkWeights.get(rule.fromFramework) || 0.5;
    const targetWeight = this.frameworkWeights.get(rule.toFramework) || 0.5;
    
    return sourceWeight > targetWeight && rule.confidence > 0.7;
  }

  private mergeFrameworkData(existing: any, mapped: any, confidence: number): any {
    const merged = { ...existing };
    
    Object.entries(mapped).forEach(([key, value]) => {
      if (!(key in existing) || confidence > 0.8) {
        merged[key] = value;
      } else {
        // Weighted average for existing keys
        merged[key] = (existing[key] * 0.7) + (value as number * 0.3);
      }
    });
    
    return merged;
  }

  private sanitizeFrameworkData(frameworkData: Record<string, any>) {
    const sanitized: Record<string, any> = {};
    
    Object.entries(frameworkData).forEach(([framework, data]) => {
      if (data && typeof data === 'object') {
        sanitized[framework] = { ...data };
      }
    });
    
    return sanitized;
  }

  private calculateCompleteness(frameworkData: Record<string, any>): number {
    const expectedFrameworks = ['mbti', 'big5', 'enneagram', 'astrology', 'humanDesign'];
    const presentFrameworks = Object.keys(frameworkData).filter(f => 
      frameworkData[f] && Object.keys(frameworkData[f]).length > 0
    );
    
    return presentFrameworks.length / expectedFrameworks.length;
  }

  private calculateReliability(frameworkData: Record<string, any>): number {
    let totalWeight = 0;
    let presentWeight = 0;
    
    this.frameworkWeights.forEach((weight, framework) => {
      totalWeight += weight;
      if (frameworkData[framework]) {
        presentWeight += weight;
      }
    });
    
    return presentWeight / totalWeight;
  }

  private generateVersion(): string {
    return `v${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  // Personalization methods
  updatePersonalizationProfile(settings: Partial<PersonalizationProfile>): void {
    if (!this.personalizationProfile) {
      this.personalizationProfile = {
        preferences: {},
        adaptationSettings: {
          communicationStyle: 'balanced',
          responseDepth: 'moderate',
          personalityEmphasis: [],
          conflictResolutionStyle: 'hybrid'
        },
        learningProfile: {
          preferredModalities: ['visual', 'text'],
          pacingPreference: 'moderate',
          feedbackStyle: 'encouraging'
        }
      };
    }
    
    // Deep merge settings
    this.personalizationProfile = {
      ...this.personalizationProfile,
      ...settings,
      adaptationSettings: {
        ...this.personalizationProfile.adaptationSettings,
        ...settings.adaptationSettings
      },
      learningProfile: {
        ...this.personalizationProfile.learningProfile,
        ...settings.learningProfile
      }
    };
    
    console.log('🔄 BPSC: Updated personalization profile');
  }

  // Public interface methods
  getCurrentBlueprint(): PersonalityBlueprint | null {
    return this.currentBlueprint;
  }

  getPersonalizationProfile(): PersonalizationProfile | null {
    return this.personalizationProfile;
  }

  getSyncHistory(): { timestamp: Date; changes: any[] }[] {
    return [...this.syncHistory];
  }

  registerListener(listener: (blueprint: PersonalityBlueprint) => void): void {
    this.listeners.push(listener);
  }

  private notifyListeners(blueprint: PersonalityBlueprint): void {
    this.listeners.forEach(listener => {
      try {
        listener(blueprint);
      } catch (error) {
        console.error('🔄 BPSC: Listener error:', error);
      }
    });
  }

  getStatus() {
    return {
      blueprintLoaded: !!this.currentBlueprint,
      syncRulesCount: this.syncRules.size,
      frameworkWeights: Object.fromEntries(this.frameworkWeights),
      personalizationActive: !!this.personalizationProfile,
      lastSyncTime: this.currentBlueprint?.metadata.lastSyncedAt,
      isActive: true
    };
  }

  // Clear and reset
  clearBlueprint(): void {
    this.currentBlueprint = null;
    this.personalizationProfile = null;
    console.log('🔄 BPSC: Cleared blueprint and personalization data');
  }
}

export const blueprintPersonalizationSync = new BlueprintPersonalizationSync();