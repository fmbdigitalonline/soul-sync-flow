import { supabase } from "@/integrations/supabase/client";

export interface VPGBlueprint {
  user: {
    id: string;
    name?: string;
    preferences: any;
    profile: any;
  };
  personality: {
    traits: any;
    summary?: string;
    cognitiveStyle: string;
    communicationStyle: string;
    energyStrategy: string;
  };
  goals: {
    current: any[];
    aspirations: any[];
  };
  sessionContext: {
    lastActivity: string;
    focusMetrics: any;
  };
}

class UnifiedBrainContext {
  private cache = new Map<string, any>();
  private sessionCache = new Map<string, Map<string, any>>();

  get<T>(key: string, userId?: string): T | null {
    const fullKey = userId ? `${userId}-${key}` : key;
    return this.cache.get(fullKey) || null;
  }

  set<T>(key: string, value: T, userId?: string): void {
    const fullKey = userId ? `${userId}-${key}` : key;
    this.cache.set(fullKey, value);
  }

  getSessionData<T>(sessionId: string, key: string): T | null {
    const sessionData = this.sessionCache.get(sessionId);
    return sessionData ? sessionData.get(key) || null : null;
  }

  setSessionData<T>(sessionId: string, key: string, value: T): void {
    let sessionData = this.sessionCache.get(sessionId);
    if (!sessionData) {
      sessionData = new Map<string, any>();
      this.sessionCache.set(sessionId, sessionData);
    }
    sessionData.set(key, value);
  }

  async loadBlueprint(userId: string): Promise<VPGBlueprint | null> {
    const cachedBlueprint = this.get<VPGBlueprint>('blueprint', userId);
    if (cachedBlueprint) {
      console.log("🧠 UBC: Loaded VPG blueprint from cache");
      return cachedBlueprint;
    }

    try {
      console.log("🧠 UBC: Fetching VPG blueprint from Supabase...");
      // Try from blueprints table first, fallback to user_blueprints
      let blueprintData = null;
      
      const { data: bpData, error: bpError } = await supabase
        .from('blueprints')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (bpData) {
        blueprintData = bpData;
      } else {
        // Fallback to user_blueprints table structure
        const { data: ubData, error: ubError } = await supabase
          .from('user_blueprints')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (ubData) {
          blueprintData = ubData;
        }
      }

      if (!blueprintData) {
        console.warn("⚠️ UBC: No VPG blueprint found in Supabase");
        return null;
      }

      // Handle different table structures
      const isBlueprints = !!bpData;
      const blueprint: VPGBlueprint = {
        user: {
          id: userId,
          name: isBlueprints ? blueprintData.user_meta?.preferred_name : undefined,
          preferences: isBlueprints ? blueprintData.user_meta : (blueprintData.user_preferences || {}),
          profile: isBlueprints ? blueprintData.user_meta : (blueprintData.user_profile || {})
        },
        personality: {
          traits: isBlueprints ? blueprintData.cognition_mbti : (blueprintData.personality_traits || {}),
          summary: isBlueprints ? "MBTI-based personality" : undefined,
          cognitiveStyle: isBlueprints ? 'analytical' : (blueprintData.cognitive_style || 'balanced'),
          communicationStyle: isBlueprints ? 'adaptive' : (blueprintData.communication_style || 'adaptive'),
          energyStrategy: isBlueprints ? 'sustainable' : (blueprintData.energy_strategy || 'sustainable')
        },
        goals: {
          current: isBlueprints ? (blueprintData.goal_stack || []) : (blueprintData.current_goals || []),
          aspirations: isBlueprints ? [] : (blueprintData.aspirations || [])
        },
        sessionContext: {
          lastActivity: isBlueprints ? 'recent' : (blueprintData.last_activity || 'none'),
          focusMetrics: isBlueprints ? {} : (blueprintData.focus_metrics || {})
        }
      };

      this.set('blueprint', blueprint, userId);
      console.log("✅ UBC: VPG blueprint loaded and cached");
      return blueprint;

    } catch (error) {
      console.error("❌ UBC: Failed to load VPG blueprint:", error);
      return null;
    }
  }

  clearAll(): void {
    console.log("🧠 UBC: Clearing all cached data");
    this.cache.clear();
    this.sessionCache.clear();
  }

  clearSession(sessionId: string): void {
    console.log("🧠 UBC: Clearing session data for:", sessionId);
    this.sessionCache.delete(sessionId);
  }

  clearUser(userId: string): void {
    console.log("🧠 UBC: Clearing user data for:", userId);
    
    // Clear user-specific keys from main cache
    const keysToDelete: string[] = [];
    this.cache.forEach((value, key) => {
      if (key.includes(userId)) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    // Clear session cache entries for this user
    this.sessionCache.forEach((sessionData, sessionId) => {
      if (sessionData.has('userId') && sessionData.get('userId') === userId) {
        this.sessionCache.delete(sessionId);
      }
    });
  }

  getStats(): {
    cacheSize: number;
    sessionCount: number;
    memoryUsage: string;
  } {
    return {
      cacheSize: this.cache.size,
      sessionCount: this.sessionCache.size,
      memoryUsage: `${JSON.stringify([...this.cache.entries()]).length} bytes`
    };
  }

  clearCache(): void {
    console.log("🧠 UBC: Clearing cache");
    this.cache.clear();
  }
}

export const unifiedBrainContext = new UnifiedBrainContext();
