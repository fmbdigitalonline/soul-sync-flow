
import { EnrichmentData } from '@/types/personality-modules';

export const personalityEnrichmentService = {
  // Calculate current astrological transits
  calculateCurrentTransits(blueprintData: any): string[] {
    // In a real implementation, this would calculate actual transits
    // For now, return seasonal and general growth themes
    const month = new Date().getMonth();
    const transits = ["general growth phase"];
    
    if (month >= 2 && month <= 4) transits.push("spring activation", "new beginnings");
    if (month >= 5 && month <= 7) transits.push("summer expansion", "manifestation period");
    if (month >= 8 && month <= 10) transits.push("autumn integration", "harvest time");
    if (month >= 11 || month <= 1) transits.push("winter reflection", "inner wisdom");
    
    return transits;
  },

  // Generate Bashar-style excitement compass
  generateExcitementCompass(blueprintData: any): string {
    const hdType = blueprintData.energy_strategy_human_design?.type;
    const lifePathNumber = blueprintData.values_life_path?.lifePathNumber;
    
    let compass = "follow your highest excitement";
    
    if (hdType === 'Generator') compass += " through responsive building";
    if (hdType === 'Projector') compass += " when recognized and invited";
    if (hdType === 'Manifestor') compass += " through independent initiation";
    
    if (lifePathNumber === 1) compass += " with leadership courage";
    if (lifePathNumber === 7) compass += " with spiritual depth";
    if (lifePathNumber === 9) compass += " in service to others";
    
    return compass + " and act with integrity";
  },

  // Create marketing archetype based on personality blend
  deriveMarketingArchetype(blueprintData: any): any {
    const sunSign = blueprintData.archetype_western?.sun_sign;
    const mbti = blueprintData.cognition_mbti?.type;
    const hdType = blueprintData.energy_strategy_human_design?.type;
    
    let archetype = {
      primary: "Authentic Connector",
      secondary: "Wisdom Sharer",
      messagingTone: "genuine and purposeful",
      contentStyle: "story-driven with practical insights"
    };
    
    // Adjust based on sun sign
    if (['Leo', 'Aries', 'Sagittarius'].includes(sunSign)) {
      archetype.primary = "Inspiring Leader";
      archetype.messagingTone = "confident and energizing";
    }
    if (['Cancer', 'Pisces', 'Scorpio'].includes(sunSign)) {
      archetype.primary = "Empathetic Guide";
      archetype.messagingTone = "nurturing and transformative";
    }
    if (['Gemini', 'Aquarius', 'Libra'].includes(sunSign)) {
      archetype.primary = "Innovative Connector";
      archetype.messagingTone = "creative and collaborative";
    }
    
    // Adjust based on MBTI
    if (mbti?.includes('N')) archetype.contentStyle = "conceptual with creative examples";
    if (mbti?.includes('S')) archetype.contentStyle = "practical with real-world applications";
    
    // Adjust based on Human Design
    if (hdType === 'Projector') archetype.secondary = "Systems Optimizer";
    if (hdType === 'Generator') archetype.secondary = "Dedicated Builder";
    if (hdType === 'Manifestor') archetype.secondary = "Change Catalyst";
    
    return archetype;
  },

  // Proactive coaching context
  generateProactiveContext(blueprintData: any): any {
    return {
      nudgeHistory: this.generateNudgeHistory(blueprintData),
      optimalTimes: this.calculateOptimalTimes(blueprintData),
      energyPatterns: this.identifyEnergyPatterns(blueprintData),
      resistanceAwareness: this.mapResistancePatterns(blueprintData),
      celebrationStyle: this.determineCelebrationStyle(blueprintData)
    };
  },

  generateNudgeHistory(blueprintData: any): string[] {
    const authority = blueprintData.energy_strategy_human_design?.authority;
    const nudges = ["gentle progress check-ins"];
    
    if (authority === 'Emotional') nudges.push("emotional wave awareness", "patience reminders");
    if (authority === 'Sacral') nudges.push("gut wisdom prompts", "energy level check-ins");
    if (authority === 'Splenic') nudges.push("intuitive awareness nudges", "present moment reminders");
    
    return nudges;
  },

  calculateOptimalTimes(blueprintData: any): string[] {
    const hdType = blueprintData.energy_strategy_human_design?.type;
    const times = [];
    
    if (hdType === 'Generator') times.push("high energy periods", "after energizing activities");
    if (hdType === 'Projector') times.push("when recognized", "during rest periods for insight");
    if (hdType === 'Manifestor') times.push("during inspiration waves", "after informing others");
    
    times.push("aligned with natural rhythms", "when feeling authentic");
    return times;
  },

  identifyEnergyPatterns(blueprintData: any): string[] {
    const patterns = ["natural energy fluctuations"];
    const hdType = blueprintData.energy_strategy_human_design?.type;
    
    if (hdType === 'Generator') patterns.push("building energy through response", "sustainable work rhythms");
    if (hdType === 'Projector') patterns.push("burst energy with rest needs", "efficiency through guidance");
    if (hdType === 'Manifestor') patterns.push("initiation energy surges", "rest after manifestation");
    
    return patterns;
  },

  mapResistancePatterns(blueprintData: any): string[] {
    const patterns = [];
    const lifePathNumber = blueprintData.values_life_path?.lifePathNumber;
    const mbti = blueprintData.cognition_mbti?.type;
    
    if (lifePathNumber === 1) patterns.push("fear of not being unique enough", "impatience with others' pace");
    if (lifePathNumber === 7) patterns.push("perfectionism paralysis", "analysis over action");
    if (lifePathNumber === 9) patterns.push("overwhelm from others' needs", "completion anxiety");
    
    if (mbti?.includes('P')) patterns.push("structure resistance", "commitment anxiety");
    if (mbti?.includes('J')) patterns.push("change resistance", "control needs");
    
    patterns.push("imposter syndrome", "comparison trap");
    return patterns;
  },

  determineCelebrationStyle(blueprintData: any): string {
    const sunSign = blueprintData.archetype_western?.sun_sign;
    const mbti = blueprintData.cognition_mbti?.type;
    
    if (sunSign === 'Leo' || mbti?.includes('E')) return "public recognition and sharing success";
    if (['Cancer', 'Pisces'].includes(sunSign)) return "meaningful reflection and gratitude";
    if (['Virgo', 'Capricorn'].includes(sunSign)) return "practical progress acknowledgment";
    
    return "authentic appreciation aligned with personal values";
  }
};
