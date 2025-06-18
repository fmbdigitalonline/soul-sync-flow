
import { useState, useEffect } from 'react';
import { soulSyncService } from '@/services/soul-sync-service';
import { enhancedAICoachService } from '@/services/enhanced-ai-coach-service';
import { useBlueprintCache } from '@/contexts/BlueprintCacheContext';
import { useAuth } from '@/contexts/AuthContext';

export function useSoulSync() {
  const { user } = useAuth();
  const { blueprintData, hasBlueprint } = useBlueprintCache();
  const [isSoulSyncReady, setIsSoulSyncReady] = useState(false);
  const [soulSyncError, setSoulSyncError] = useState<string | null>(null);

  useEffect(() => {
    const initializeSoulSync = async () => {
      if (!user || !blueprintData) {
        setIsSoulSyncReady(false);
        return;
      }

      try {
        console.log("🔄 SoulSync: Initializing with blueprint data");
        
        // Convert blueprint data to LayeredBlueprint format
        const layeredBlueprint = {
          user_meta: blueprintData.user_meta,
          cognitiveTemperamental: {
            mbtiType: blueprintData.cognition_mbti?.type || 'Unknown',
            dominantFunction: blueprintData.cognition_mbti?.dominant_function || 'Unknown',
            auxiliaryFunction: blueprintData.cognition_mbti?.auxiliary_function || 'Unknown',
            coreKeywords: blueprintData.cognition_mbti?.core_keywords || []
          },
          energyDecisionStrategy: {
            humanDesignType: blueprintData.energy_strategy_human_design?.type || 'Unknown',
            authority: blueprintData.energy_strategy_human_design?.authority || 'Unknown',
            strategy: blueprintData.energy_strategy_human_design?.strategy || 'Unknown',
            profile: blueprintData.energy_strategy_human_design?.profile || 'Unknown'
          },
          publicArchetype: {
            sunSign: blueprintData.archetype_western?.sun_sign || 'Unknown',
            moonSign: blueprintData.archetype_western?.moon_sign || 'Unknown',
            risingSign: blueprintData.archetype_western?.rising_sign || 'Unknown'
          },
          coreValuesNarrative: {
            lifePath: blueprintData.values_life_path?.lifePathNumber || blueprintData.values_life_path?.life_path_number || 'Unknown',
            missionStatement: blueprintData.values_life_path?.mission_statement || 'Live authentically',
            coreValues: blueprintData.values_life_path?.core_values || []
          },
          motivationBeliefEngine: blueprintData.bashar_suite || {},
          generationalCode: blueprintData.timing_overlays || {}
        };

        // Update both services with blueprint data
        enhancedAICoachService.updateUserBlueprint(layeredBlueprint);
        await enhancedAICoachService.setCurrentUser(user.id);
        
        setIsSoulSyncReady(true);
        setSoulSyncError(null);
        console.log("✅ SoulSync: Successfully initialized");
      } catch (error) {
        console.error("❌ SoulSync: Initialization error:", error);
        setSoulSyncError(error instanceof Error ? error.message : 'Unknown error');
        setIsSoulSyncReady(false);
      }
    };

    initializeSoulSync();
  }, [user, blueprintData]);

  return {
    isSoulSyncReady: isSoulSyncReady && hasBlueprint,
    soulSyncError,
    hasBlueprint,
    blueprintData
  };
}
