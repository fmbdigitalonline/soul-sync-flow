import { supabase } from "@/integrations/supabase/client";
import { personalityFusionService } from "./personality-fusion-service";
import { PersonalityProfile } from "@/types/personality-fusion";
import { BlueprintHealthChecker } from "./blueprint-health-checker";

export interface UserProfile {
  full_name: string;
  preferred_name?: string;
  birth_date: string;
  birth_time_local: string;
  birth_location: string;
  timezone: string;
  personality?: string;
  user_id?: string;
}

export interface BlueprintData {
  id?: string;
  user_id?: string;
  user_meta: UserProfile;
  astrology: any;
  human_design: any;
  numerology: any;
  mbti: any;
  goal_stack: any;
  metadata: any;
  personality?: any;
  // Legacy property names for backward compatibility
  archetype_western?: any;
  archetype_chinese?: any;
  values_life_path?: any;
  energy_strategy_human_design?: any;
  cognition_mbti?: any;
  bashar_suite?: any;
  timing_overlays?: any;
}

export interface BlueprintDataResult {
  data: BlueprintData | null;
  error: string | null;
  isPartial?: boolean;
}

interface CalculationResult {
  success: boolean;
  data?: any;
  error?: string;
  component: string;
}

class BlueprintService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private pendingRequests = new Map<string, Promise<any>>();

  private getCacheKey(userId: string): string {
    return `blueprint_${userId}`;
  }

  private isValidCache(cacheEntry: { data: any; timestamp: number }): boolean {
    return Date.now() - cacheEntry.timestamp < this.CACHE_DURATION;
  }

  async getActiveBlueprintData(): Promise<BlueprintDataResult> {
    try {
      console.log('🔍 BLUEPRINT SERVICE: Starting getActiveBlueprintData');
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.log('❌ BLUEPRINT SERVICE: User not authenticated', userError);
        return { data: null, error: "User not authenticated" };
      }

      console.log('✅ BLUEPRINT SERVICE: User authenticated:', user.id);

      const cacheKey = this.getCacheKey(user.id);
      
      // Check cache first
      const cached = this.cache.get(cacheKey);
      if (cached && this.isValidCache(cached)) {
        console.log('📋 BLUEPRINT SERVICE: Cache hit, returning cached data');
        return { data: cached.data, error: null };
      }

      // Check for pending request to avoid duplicates
      if (this.pendingRequests.has(cacheKey)) {
        console.log('⏳ BLUEPRINT SERVICE: Request deduplication, waiting for existing request');
        const result = await this.pendingRequests.get(cacheKey)!;
        return result;
      }

      // Create new request
      const requestPromise = this.fetchBlueprintFromDatabase(user.id);
      this.pendingRequests.set(cacheKey, requestPromise);

      try {
        const result = await requestPromise;
        
        // Cache successful results
        if (result.data) {
          console.log('💾 BLUEPRINT SERVICE: Caching successful result');
          this.cache.set(cacheKey, {
            data: result.data,
            timestamp: Date.now()
          });
        }

        return result;
      } finally {
        this.pendingRequests.delete(cacheKey);
      }
    } catch (error) {
      console.error("💥 BLUEPRINT SERVICE: Unexpected error in getActiveBlueprintData:", error);
      return { data: null, error: "Unexpected error occurred." };
    }
  }

  private async fetchBlueprintFromDatabase(userId: string): Promise<BlueprintDataResult> {
    console.log('🗄️ BLUEPRINT SERVICE: Fetching from database for user:', userId);

    // First, ensure single active blueprint
    await this.ensureSingleActiveBlueprint(userId);

    // Fetch the active blueprint
    const { data, error } = await supabase
      .from('user_blueprints')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("❌ BLUEPRINT SERVICE: Database error:", error);
      return { data: null, error: error.message };
    }

    if (!data) {
      console.log("📝 BLUEPRINT SERVICE: No active blueprint found in database");
      return { data: null, error: "No active blueprint found." };
    }

    console.log("✅ BLUEPRINT SERVICE: Raw blueprint data found:", {
      id: data.id,
      hasBlueprint: !!data.blueprint,
      blueprintKeys: data.blueprint ? Object.keys(data.blueprint) : [],
      isActive: data.is_active
    });

    // Convert and validate the blueprint data
    const blueprintData = this.convertDatabaseBlueprintToFormat(data.blueprint as any);
    
    console.log("🔄 BLUEPRINT SERVICE: Converted blueprint data:", {
      hasUserMeta: !!blueprintData.user_meta,
      hasAstrology: !!blueprintData.archetype_western,
      hasNumerology: !!blueprintData.values_life_path,
      hasHumanDesign: !!blueprintData.energy_strategy_human_design,
      hasMBTI: !!blueprintData.cognition_mbti
    });

    return { data: blueprintData, error: null };
  }

  private convertDatabaseBlueprintToFormat(rawBlueprint: any): BlueprintData {
    console.log('🔄 BLUEPRINT SERVICE: Converting database format to BlueprintData');
    
    if (!rawBlueprint) {
      console.warn('⚠️ BLUEPRINT SERVICE: No raw blueprint data provided');
      return this.createEmptyBlueprint();
    }

    // Handle both old and new format
    const converted: BlueprintData = {
      user_meta: rawBlueprint.user_meta || {},
      metadata: rawBlueprint.metadata || {},
      
      // Map new format to legacy format for compatibility
      astrology: rawBlueprint.archetype_western || rawBlueprint.astrology || {},
      human_design: rawBlueprint.energy_strategy_human_design || rawBlueprint.human_design || {},
      numerology: rawBlueprint.values_life_path || rawBlueprint.numerology || {},
      mbti: rawBlueprint.cognition_mbti || rawBlueprint.mbti || {},
      goal_stack: rawBlueprint.goal_stack || {},
      
      // Keep legacy properties
      archetype_western: rawBlueprint.archetype_western || rawBlueprint.astrology || {},
      archetype_chinese: rawBlueprint.archetype_chinese || {},
      values_life_path: rawBlueprint.values_life_path || rawBlueprint.numerology || {},
      energy_strategy_human_design: rawBlueprint.energy_strategy_human_design || rawBlueprint.human_design || {},
      cognition_mbti: rawBlueprint.cognition_mbti || rawBlueprint.mbti || {},
      bashar_suite: rawBlueprint.bashar_suite || {},
      timing_overlays: rawBlueprint.timing_overlays || {}
    };

    console.log('✅ BLUEPRINT SERVICE: Conversion complete:', {
      hasUserMeta: !!converted.user_meta && Object.keys(converted.user_meta).length > 0,
      hasAstrology: !!converted.archetype_western && Object.keys(converted.archetype_western).length > 0,
      hasNumerology: !!converted.values_life_path && Object.keys(converted.values_life_path).length > 0,
      hasHumanDesign: !!converted.energy_strategy_human_design && Object.keys(converted.energy_strategy_human_design).length > 0
    });

    return converted;
  }

  private createEmptyBlueprint(): BlueprintData {
    return {
      user_meta: {},
      astrology: {},
      human_design: {},
      numerology: {},
      mbti: {},
      goal_stack: {},
      metadata: {},
      archetype_western: {},
      archetype_chinese: {},
      values_life_path: {},
      energy_strategy_human_design: {},
      cognition_mbti: {},
      bashar_suite: {},
      timing_overlays: {}
    };
  }

  private async ensureSingleActiveBlueprint(userId: string): Promise<void> {
    try {
      const { data: activeBlueprints, error } = await supabase
        .from('user_blueprints')
        .select('id, updated_at')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (error || !activeBlueprints || activeBlueprints.length <= 1) {
        return;
      }

      const blueprintsToDeactivate = activeBlueprints.slice(1);
      
      if (blueprintsToDeactivate.length > 0) {
        const idsToDeactivate = blueprintsToDeactivate.map(bp => bp.id);
        
        const { error: updateError } = await supabase
          .from('user_blueprints')
          .update({ is_active: false })
          .in('id', idsToDeactivate);

        if (updateError) {
          console.error("Error deactivating duplicate blueprints:", updateError);
        } else {
          console.log(`Deactivated ${blueprintsToDeactivate.length} duplicate active blueprints`);
        }
      }
    } catch (error) {
      console.error("Error ensuring single active blueprint:", error);
    }
  }

  async generateBlueprintFromBirthData(userProfile: UserProfile): Promise<BlueprintDataResult> {
    try {
      console.log("🎯 BLUEPRINT ENGINE: Starting calculation with NO FALLBACKS");
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return { data: null, error: "User not authenticated" };
      }

      const profileWithDefaults = {
        ...userProfile,
        preferred_name: userProfile.preferred_name || userProfile.full_name.split(' ')[0],
        user_id: user.id
      };

      // Initialize calculation tracking
      const calculationResults: CalculationResult[] = [];
      const calculationErrors: string[] = [];

      // Attempt real calculations - NO FALLBACKS
      console.log("🔧 Calling Supabase Edge Function for real calculations...");
      
      const blueprintResult = await this.callBlueprintCalculator(profileWithDefaults);
      
      if (blueprintResult.success && blueprintResult.data) {
        console.log("✅ Real calculations successful");
        
        // Validate calculation results
        const validationResult = this.validateCalculationResults(blueprintResult.data);
        
        const finalBlueprint: BlueprintData = {
          user_meta: profileWithDefaults,
          metadata: {
            calculation_success: validationResult.allValid,
            partial_calculation: !validationResult.allValid,
            calculation_date: new Date().toISOString(),
            engine: "supabase_edge_function",
            data_sources: validationResult.sources,
            validation_errors: validationResult.errors,
            health_check_mode: BlueprintHealthChecker.isHealthCheck()
          },
          // Map the results from edge function
          archetype_western: blueprintResult.data.westernProfile || null,
          archetype_chinese: blueprintResult.data.chineseZodiac || null,
          values_life_path: blueprintResult.data.numerology || null,
          energy_strategy_human_design: blueprintResult.data.humanDesign || null,
          // Legacy fields for compatibility
          astrology: blueprintResult.data.westernProfile || {},
          human_design: blueprintResult.data.humanDesign || {},
          numerology: blueprintResult.data.numerology || {},
          mbti: {},
          goal_stack: {},
          cognition_mbti: {
            type: "Unknown",
            core_keywords: [],
            dominant_function: "Unknown",
            auxiliary_function: "Unknown"
          },
          bashar_suite: {
            excitement_compass: { principle: "Follow your highest excitement" },
            belief_interface: { principle: "Beliefs create reality", reframe_prompt: "What would I rather believe?" },
            frequency_alignment: { quick_ritual: "Take 3 deep breaths and feel gratitude" }
          },
          timing_overlays: {}
        };

        if (validationResult.allValid) {
          return { data: finalBlueprint, error: null, isPartial: false };
        } else {
          return { 
            data: finalBlueprint, 
            error: `Partial calculation: ${validationResult.errors.join(', ')}`, 
            isPartial: true 
          };
        }
      } else {
        // Real calculation failed - NO FALLBACKS, return error
        const errorMessage = blueprintResult.error || "Blueprint calculation failed";
        console.error("❌ Blueprint calculation failed:", errorMessage);
        
        if (BlueprintHealthChecker.isHealthCheck()) {
          BlueprintHealthChecker.failIfHealthCheck("Blueprint Calculator", errorMessage);
        }
        
        return {
          data: null,
          error: `Blueprint calculation failed: ${errorMessage}. Please check your birth data and try again.`,
          isPartial: false
        };
      }
    } catch (error) {
      console.error("❌ Error in blueprint generation:", error);
      
      if (BlueprintHealthChecker.isHealthCheck()) {
        BlueprintHealthChecker.failIfHealthCheck("Blueprint Service", error.message);
      }
      
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        isPartial: false
      };
    }
  }

  private async callBlueprintCalculator(userProfile: UserProfile): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log("📡 Calling blueprint-calculator edge function...");
      
      const { data, error } = await supabase.functions.invoke('blueprint-calculator', {
        body: {
          birthDate: userProfile.birth_date,
          birthTime: userProfile.birth_time_local,
          birthLocation: userProfile.birth_location,
          fullName: userProfile.full_name
        }
      });

      if (error) {
        console.error("Edge function error:", error);
        return { success: false, error: error.message };
      }

      if (!data?.success) {
        console.error("Edge function returned unsuccessful result:", data);
        return { success: false, error: data?.error || "Unknown edge function error" };
      }

      console.log("✅ Edge function call successful");
      return { success: true, data: data.data };
    } catch (error) {
      console.error("Exception calling edge function:", error);
      return { success: false, error: error.message };
    }
  }

  private validateCalculationResults(data: any): { allValid: boolean; errors: string[]; sources: any } {
    const errors: string[] = [];
    const sources: any = {};

    // Validate Western Astrology
    if (!data.westernProfile?.sun_sign || data.westernProfile.sun_sign === "Unknown") {
      errors.push("Western astrology calculation failed");
      sources.western = "failed";
    } else {
      sources.western = "calculated";
    }

    // Validate Chinese Zodiac
    if (!data.chineseZodiac?.animal || data.chineseZodiac.animal === "Unknown") {
      errors.push("Chinese zodiac calculation failed");
      sources.chinese = "failed";
    } else {
      sources.chinese = "calculated";
    }

    // Validate Numerology
    if (!data.numerology?.lifePathNumber && !data.numerology?.life_path_number) {
      errors.push("Numerology calculation failed");
      sources.numerology = "failed";
    } else {
      sources.numerology = "calculated";
    }

    // Validate Human Design
    if (!data.humanDesign?.type || data.humanDesign.type === "Unknown") {
      errors.push("Human Design calculation failed");
      sources.humanDesign = "failed";
    } else {
      sources.humanDesign = "calculated";
    }

    return {
      allValid: errors.length === 0,
      errors,
      sources
    };
  }

  async updateBlueprintRuntimePreferences(preferences: {
    primary_goal: string;
    support_style: number;
    time_horizon: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return { success: false, error: "User not authenticated" };
      }

      const { data: blueprint, error: fetchError } = await supabase
        .from('user_blueprints')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching blueprint for preferences update:", fetchError);
        return { success: false, error: fetchError.message };
      }

      if (!blueprint || !blueprint.blueprint) {
        console.error("No blueprint found for user when updating preferences");
        return { success: false, error: "No blueprint found for this user" };
      }

      const currentBlueprintData = (blueprint.blueprint as unknown) as BlueprintData;
      const updatedBlueprintData = {
        ...currentBlueprintData,
        goal_stack: {
          primary_goal: preferences.primary_goal,
          support_style: preferences.support_style,
          time_horizon: preferences.time_horizon
        }
      };

      const { error: updateError } = await supabase
        .from('user_blueprints')
        .update({
          blueprint: updatedBlueprintData as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', blueprint.id);

      if (updateError) {
        console.error("Error updating blueprint with preferences:", updateError);
        return { success: false, error: updateError.message };
      }

      // Clear cache after update
      const cacheKey = this.getCacheKey(user.id);
      this.cache.delete(cacheKey);

      console.log("Blueprint preferences updated successfully");
      return { success: true };
    } catch (error) {
      console.error("Unexpected error updating blueprint preferences:", error);
      return { success: false, error: "Unexpected error occurred." };
    }
  }

  async saveBlueprintData(blueprintData: BlueprintData): Promise<{ success: boolean; error?: string }> {
    try {
      if (!blueprintData.user_meta?.user_id) {
        return { success: false, error: "User ID is required" };
      }

      console.log("Saving blueprint data:", blueprintData);

      await this.ensureSingleActiveBlueprint(blueprintData.user_meta.user_id);

      const { data, error } = await supabase
        .from('user_blueprints')
        .insert({
          user_id: blueprintData.user_meta.user_id,
          blueprint: blueprintData as any,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase error saving blueprint:", error);
        return { success: false, error: error.message };
      }

      // Clear cache after successful save
      const cacheKey = this.getCacheKey(blueprintData.user_meta.user_id);
      this.cache.delete(cacheKey);

      console.log("Blueprint saved successfully:", data);
      return { success: true };

    } catch (error) {
      console.error("Unexpected error saving blueprint:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      };
    }
  }

  async deleteBlueprintData(blueprintId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_blueprints')
        .delete()
        .eq('id', blueprintId);

      if (error) {
        console.error("Error deleting blueprint:", error);
        return { success: false, error: error.message };
      }

      // Clear all cache entries (since we don't know which user this belonged to)
      this.cache.clear();

      console.log(`Blueprint with ID ${blueprintId} deleted successfully.`);
      return { success: true };
    } catch (error) {
      console.error("Unexpected error deleting blueprint:", error);
      return { success: false, error: "Unexpected error occurred." };
    }
  }
}

export const blueprintService = new BlueprintService();
