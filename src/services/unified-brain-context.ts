import { Database } from "@/integrations/supabase/database.types";

export interface VPGBlueprint {
  user: {
    id: string;
    preferences: any;
    profile: any;
  };
  personality: {
    traits: any;
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
      const { data, error } = await supabase
        .from('user_blueprints')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error("❌ UBC: Error fetching VPG blueprint:", error);
        return null;
      }

      if (!data) {
        console.warn("⚠️ UBC: No VPG blueprint found in Supabase");
        return null;
      }

      const blueprint: VPGBlueprint = {
        user: {
          id: userId,
          preferences: data.user_preferences || {},
          profile: data.user_profile || {}
        },
        personality: {
          traits: data.personality_traits || {},
          cognitiveStyle: data.cognitive_style || 'balanced',
          communicationStyle: data.communication_style || 'adaptive',
          energyStrategy: data.energy_strategy || 'sustainable'
        },
        goals: {
          current: data.current_goals || [],
          aspirations: data.aspirations || []
        },
        sessionContext: {
          lastActivity: data.last_activity || 'none',
          focusMetrics: data.focus_metrics || {}
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
}

export const unifiedBrainContext = new UnifiedBrainContext();
