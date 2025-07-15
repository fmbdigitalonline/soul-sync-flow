// Unified Brain Context - Session-level Blueprint Caching
// Implements SoulSync Engineering Protocol directive for shared context

import { LayeredBlueprint } from "@/types/personality-modules";
import { personalityVectorService } from "./personality-vector-service";
import { supabase } from "@/integrations/supabase/client";

export interface VPGBlueprint {
  // Core personality data
  personality: {
    vector: Float32Array;
    summary: string;
    traits: {
      dominantPatterns: string[];
      energySignature: string;
      communicationStyle: string;
      cognitiveStyle: string;
    };
  };
  
  // User metadata
  user: {
    id: string;
    name: string;
    preferences: {
      tone: string;
      pace: string;
      depth: string;
    };
  };
  
  // Session info
  session: {
    loadedAt: Date;
    version: string;
    cacheExpiry: Date;
  };
  
  // Raw blueprint data
  raw: Partial<LayeredBlueprint>;
}

class UnifiedBrainContext {
  private static instance: UnifiedBrainContext;
  private blueprintCache = new Map<string, VPGBlueprint>();
  private readonly CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

  static getInstance(): UnifiedBrainContext {
    if (!UnifiedBrainContext.instance) {
      UnifiedBrainContext.instance = new UnifiedBrainContext();
    }
    return UnifiedBrainContext.instance;
  }

  // Load and cache VPG blueprint for session (Stage 0)
  async loadBlueprint(userId: string): Promise<VPGBlueprint> {
    console.log(`🧠 UBC: Loading VPG blueprint for user ${userId}`);
    
    try {
      // Check cache first
      const cached = this.blueprintCache.get(userId);
      if (cached && cached.session.cacheExpiry > new Date()) {
        console.log(`✅ UBC: Blueprint loaded (cached) for ${userId}`);
        return cached;
      }

      // Load fresh blueprint
      const startTime = performance.now();
      
      // 1. Get personality vector and summary
      const [personalityVector, personaSummary] = await Promise.all([
        personalityVectorService.getVector(userId),
        personalityVectorService.getPersonaSummary(userId)
      ]);

      // 2. Get raw blueprint data
      const { data: blueprint } = await supabase
        .from('blueprints')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // 3. Analyze personality traits
      const traits = this.analyzePersonalityTraits(personalityVector);

      // 4. Extract user preferences
      const userMeta = blueprint?.user_meta as any || {};
      const userName = this.extractUserName(userMeta);
      const preferences = this.extractUserPreferences(personalityVector, userMeta);

      // 5. Create VPG blueprint
      const vgpBlueprint: VPGBlueprint = {
        personality: {
          vector: personalityVector,
          summary: personaSummary,
          traits
        },
        user: {
          id: userId,
          name: userName,
          preferences
        },
        session: {
          loadedAt: new Date(),
          version: '1.0.0',
          cacheExpiry: new Date(Date.now() + this.CACHE_DURATION_MS)
        },
        raw: { user_meta: userMeta }
      };

      // Cache the blueprint
      this.blueprintCache.set(userId, vgpBlueprint);
      
      const loadTime = performance.now() - startTime;
      console.log(`✅ UBC: VPG blueprint loaded and cached for ${userName} in ${loadTime.toFixed(1)}ms`);
      
      return vgpBlueprint;
    } catch (error) {
      console.error('❌ UBC: Failed to load VPG blueprint:', error);
      return this.getFallbackBlueprint(userId);
    }
  }

  // Get cached blueprint (used by all stages)
  get(key: 'blueprint', userId: string): VPGBlueprint | null {
    const cached = this.blueprintCache.get(userId);
    if (cached && cached.session.cacheExpiry > new Date()) {
      return cached;
    }
    return null;
  }

  // Set blueprint in cache
  set(key: 'blueprint', userId: string, blueprint: VPGBlueprint): void {
    this.blueprintCache.set(userId, blueprint);
  }

  // Clear cache for user
  clearCache(userId: string): void {
    this.blueprintCache.delete(userId);
    console.log(`🧠 UBC: Cache cleared for user ${userId}`);
  }

  // Analyze personality traits from 128D vector
  private analyzePersonalityTraits(vector: Float32Array): VPGBlueprint['personality']['traits'] {
    // MBTI section analysis (dimensions 0-31)
    const mbtiSection = Array.from(vector.slice(0, 32));
    const mbtiSum = mbtiSection.reduce((sum, val) => sum + val, 0);
    
    // Human Design section (dimensions 32-95)
    const hdSection = Array.from(vector.slice(32, 96));
    const hdActivation = hdSection.filter(val => val > 0.5).length;
    
    // Astrology section (dimensions 96-127)
    const astroSection = Array.from(vector.slice(96, 128));
    const astroVariance = this.calculateVariance(astroSection);

    // Analyze dominant patterns
    const dominantPatterns = [];
    if (mbtiSum > 10) dominantPatterns.push('intuitive thinking');
    else if (mbtiSum < -10) dominantPatterns.push('practical sensing');
    
    if (hdActivation > 20) dominantPatterns.push('defined energy centers');
    if (astroVariance > 0.3) dominantPatterns.push('complex archetypal influences');

    // Energy signature
    const totalEnergy = Array.from(vector).reduce((sum, val) => sum + Math.abs(val), 0);
    let energySignature: string;
    if (totalEnergy > 80) energySignature = 'high-intensity, dynamic';
    else if (totalEnergy > 60) energySignature = 'moderate, balanced';
    else energySignature = 'calm, steady';

    // Communication style
    const vectorBalance = this.calculateBalance(vector);
    let communicationStyle: string;
    if (vectorBalance > 0.7) communicationStyle = 'direct and clear';
    else if (vectorBalance > 0.4) communicationStyle = 'nuanced and adaptive';
    else communicationStyle = 'gentle and exploratory';

    // Cognitive style (based on MBTI patterns)
    let cognitiveStyle: string;
    if (mbtiSum > 15) cognitiveStyle = 'conceptual and abstract';
    else if (mbtiSum > 0) cognitiveStyle = 'balanced analytical';
    else cognitiveStyle = 'concrete and detailed';

    return {
      dominantPatterns,
      energySignature,
      communicationStyle,
      cognitiveStyle
    };
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  private calculateBalance(vector: Float32Array): number {
    const positives = Array.from(vector).filter(val => val > 0).length;
    const negatives = Array.from(vector).filter(val => val < 0).length;
    return Math.min(positives, negatives) / Math.max(positives, negatives);
  }

  private extractUserName(userMeta: any): string {
    return userMeta?.preferred_name || userMeta?.first_name || 
           userMeta?.full_name?.split(' ')[0] || 'friend';
  }

  private extractUserPreferences(vector: Float32Array, userMeta: any): VPGBlueprint['user']['preferences'] {
    // Derive preferences from personality vector
    const totalEnergy = Array.from(vector).reduce((sum, val) => sum + Math.abs(val), 0);
    const balance = this.calculateBalance(vector);
    
    return {
      tone: balance > 0.6 ? 'direct' : 'gentle',
      pace: totalEnergy > 70 ? 'energetic' : 'calm',
      depth: Array.from(vector.slice(0, 32)).reduce((sum, val) => sum + val, 0) > 5 ? 'detailed' : 'concise'
    };
  }

  private getFallbackBlueprint(userId: string): VPGBlueprint {
    const fallbackVector = new Float32Array(128);
    fallbackVector.fill(0.5);
    
    return {
      personality: {
        vector: fallbackVector,
        summary: 'Dynamic personality profile',
        traits: {
          dominantPatterns: ['balanced'],
          energySignature: 'moderate, balanced',
          communicationStyle: 'adaptive',
          cognitiveStyle: 'balanced analytical'
        }
      },
      user: {
        id: userId,
        name: 'friend',
        preferences: {
          tone: 'gentle',
          pace: 'calm',
          depth: 'balanced'
        }
      },
      session: {
        loadedAt: new Date(),
        version: '1.0.0-fallback',
        cacheExpiry: new Date(Date.now() + this.CACHE_DURATION_MS)
      },
      raw: {}
    };
  }
}

// Static helper methods for global access
export class UnifiedBrainContextHelper {
  static getBlueprint(): VPGBlueprint | null {
    // Since we don't have a specific userId in global context, return null
    // The proper way is to use instance.get('blueprint', userId)
    return null;
  }
}

export const unifiedBrainContext = UnifiedBrainContext.getInstance();