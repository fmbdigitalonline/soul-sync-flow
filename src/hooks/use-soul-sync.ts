
import { useState, useEffect } from 'react';
import { soulSyncService } from '@/services/soul-sync-service';
import { enhancedAICoachService } from '@/services/enhanced-ai-coach-service';
import { UnifiedBlueprintService } from '@/services/unified-blueprint-service';
import { useBlueprintCache } from '@/contexts/BlueprintCacheContext';
import { useAuth } from '@/contexts/AuthContext';

export function useSoulSync() {
  const { user } = useAuth();
  const { blueprintData, hasBlueprint } = useBlueprintCache();
  const [isSoulSyncReady, setIsSoulSyncReady] = useState(false);
  const [soulSyncError, setSoulSyncError] = useState<string | null>(null);
  const [blueprintValidation, setBlueprintValidation] = useState<{
    isComplete: boolean;
    completionPercentage: number;
    missingFields: string[];
  }>({ isComplete: false, completionPercentage: 0, missingFields: [] });

  useEffect(() => {
    const initializeSoulSync = async () => {
      if (!user || !blueprintData) {
        setIsSoulSyncReady(false);
        return;
      }

      try {
        console.log("🔄 SoulSync: Initializing with comprehensive blueprint validation");
        
        // Validate blueprint completeness
        const validation = UnifiedBlueprintService.validateBlueprint(blueprintData);
        setBlueprintValidation({
          isComplete: validation.isComplete,
          completionPercentage: validation.completionPercentage,
          missingFields: validation.missingFields
        });
        
        console.log("📊 SoulSync: Blueprint validation result:", validation);
        
        if (validation.completionPercentage < 30) {
          console.log("⚠️ SoulSync: Blueprint too incomplete for optimal operation");
          setSoulSyncError(`Blueprint only ${validation.completionPercentage}% complete. Missing: ${validation.missingFields.join(', ')}`);
          setIsSoulSyncReady(false);
          return;
        }

        // Generate comprehensive blueprint summary for logging
        const summary = UnifiedBlueprintService.extractBlueprintSummary(blueprintData);
        console.log("🎯 SoulSync: Blueprint summary:", summary);

        // Update both services with validated blueprint data
        enhancedAICoachService.updateUserBlueprint(blueprintData);
        await enhancedAICoachService.setCurrentUser(user.id);
        
        setIsSoulSyncReady(true);
        setSoulSyncError(null);
        console.log("✅ SoulSync: Comprehensive blueprint system ready with", validation.completionPercentage + "% complete data");
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
    blueprintData,
    blueprintValidation, // Expose validation details
  };
}
