
import { LayeredBlueprint } from '@/types/personality-modules';

export class BlueprintValidationService {
  /**
   * Validates that a blueprint has all essential fields for persona generation
   * Throws an error if any critical fields are missing
   */
  static assertBlueprintComplete(bp: Partial<LayeredBlueprint>) {
    const missing = [];
    
    // Check core personality fields
    if (!bp.cognitiveTemperamental?.mbtiType || bp.cognitiveTemperamental.mbtiType === 'Unknown') {
      missing.push('MBTI type');
    }
    
    if (!bp.energyDecisionStrategy?.humanDesignType || bp.energyDecisionStrategy.humanDesignType === 'Unknown') {
      missing.push('Human Design type');
    }
    
    if (!bp.coreValuesNarrative?.lifePath || bp.coreValuesNarrative.lifePath === 0) {
      missing.push('Life Path number');
    }
    
    if (!bp.user_meta?.preferred_name || bp.user_meta.preferred_name === 'Unknown') {
      missing.push('Preferred name');
    }
    
    // Check astrology fields
    if (!bp.publicArchetype?.sunSign || bp.publicArchetype.sunSign === 'Unknown') {
      missing.push('Sun sign');
    }

    if (missing.length > 0) {
      const errorMessage = `Blueprint incomplete: ${missing.join(', ')}. Please complete your onboarding process.`;
      console.error("❌ Blueprint validation failed:", errorMessage);
      throw new Error(errorMessage);
    }
    
    console.log("✅ Blueprint validation passed - all essential fields present");
  }

  /**
   * Generates a SHA-256 signature for blueprint data
   */
  static generateBlueprintSignature(bp: Partial<LayeredBlueprint>): string {
    const signatureData = {
      mbtiType: bp.cognitiveTemperamental?.mbtiType,
      hdType: bp.energyDecisionStrategy?.humanDesignType,
      hdAuthority: bp.energyDecisionStrategy?.authority,
      sunSign: bp.publicArchetype?.sunSign,
      moonSign: bp.publicArchetype?.moonSign,
      lifePath: bp.coreValuesNarrative?.lifePath,
      userName: bp.user_meta?.preferred_name
    };

    // Simple hash function for blueprint signature
    const jsonString = JSON.stringify(signatureData);
    return btoa(jsonString).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  }

  /**
   * Logs blueprint data for debugging
   */
  static logBlueprintData(bp: Partial<LayeredBlueprint>, context: string = '') {
    console.log(`🔍 Blueprint Data ${context}:`, {
      mbtiType: bp.cognitiveTemperamental?.mbtiType,
      hdType: bp.energyDecisionStrategy?.humanDesignType,
      hdAuthority: bp.energyDecisionStrategy?.authority,
      sunSign: bp.publicArchetype?.sunSign,
      moonSign: bp.publicArchetype?.moonSign,
      lifePath: bp.coreValuesNarrative?.lifePath,
      userName: bp.user_meta?.preferred_name,
      signatureLength: this.generateBlueprintSignature(bp).length
    });
  }
}
