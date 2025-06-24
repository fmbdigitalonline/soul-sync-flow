
import { enhancedAICoachService } from "./enhanced-ai-coach-service";
import { UnifiedBlueprintService } from "./unified-blueprint-service";
import { blueprintService, BlueprintData } from "./blueprint-service";
import { supabase } from "@/integrations/supabase/client";

export interface BlueprintIntegrationReport {
  userId: string;
  blueprintLoaded: boolean;
  blueprintValid: boolean;
  completionPercentage: number;
  aiServiceSynced: boolean;
  lastSyncTime: string | null;
  integrationScore: number;
  validationErrors: string[];
}

export interface BlueprintSyncResult {
  success: boolean;
  previousState: any;
  newState: any;
  syncTime: string;
  error?: string;
}

class BlueprintAIIntegrationService {
  private lastBlueprintHash: string | null = null;
  private lastSyncTime: string | null = null;

  private async getAuthenticatedUserId(): Promise<string | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.error('🔐 Blueprint Integration: Authentication error:', error?.message);
        return null;
      }
      
      return user.id;
    } catch (error) {
      console.error('🔐 Blueprint Integration: Unexpected auth error:', error);
      return null;
    }
  }

  private generateBlueprintHash(blueprint: BlueprintData): string {
    const hashData = {
      user_meta: blueprint.user_meta,
      astrology: blueprint.astrology,
      human_design: blueprint.human_design,
      numerology: blueprint.numerology,
      mbti: blueprint.mbti
    };
    return JSON.stringify(hashData);
  }

  async performBlueprintSync(): Promise<BlueprintSyncResult> {
    const syncTime = new Date().toISOString();
    
    try {
      console.log('🔄 Blueprint Integration: Starting sync process');
      
      const userId = await this.getAuthenticatedUserId();
      if (!userId) {
        return {
          success: false,
          previousState: null,
          newState: null,
          syncTime,
          error: 'User not authenticated'
        };
      }

      // Get current blueprint data
      const blueprintResult = await blueprintService.getActiveBlueprintData();
      
      if (!blueprintResult.data) {
        return {
          success: false,
          previousState: null,
          newState: null,
          syncTime,
          error: blueprintResult.error || 'No blueprint data available'
        };
      }

      const currentHash = this.generateBlueprintHash(blueprintResult.data);
      const previousState = {
        hash: this.lastBlueprintHash,
        syncTime: this.lastSyncTime
      };

      // Check if blueprint has changed
      if (currentHash === this.lastBlueprintHash) {
        console.log('✅ Blueprint Integration: No changes detected, sync not needed');
        return {
          success: true,
          previousState,
          newState: { hash: currentHash, syncTime: this.lastSyncTime },
          syncTime
        };
      }

      console.log('🔄 Blueprint Integration: Changes detected, performing sync');

      // Validate blueprint before sync
      const validation = UnifiedBlueprintService.validateBlueprint(blueprintResult.data);
      
      if (validation.completionPercentage < 30) {
        console.warn('⚠️ Blueprint Integration: Blueprint completion too low for optimal sync');
      }

      // Update AI service with new blueprint
      await enhancedAICoachService.setCurrentUser(userId);
      enhancedAICoachService.updateUserBlueprint(blueprintResult.data);

      // Update tracking variables
      this.lastBlueprintHash = currentHash;
      this.lastSyncTime = syncTime;

      const newState = {
        hash: currentHash,
        syncTime,
        completionPercentage: validation.completionPercentage
      };

      console.log('✅ Blueprint Integration: Sync completed successfully');
      
      return {
        success: true,
        previousState,
        newState,
        syncTime
      };
    } catch (error) {
      console.error('❌ Blueprint Integration: Sync error:', error);
      return {
        success: false,
        previousState: { hash: this.lastBlueprintHash, syncTime: this.lastSyncTime },
        newState: null,
        syncTime,
        error: error instanceof Error ? error.message : 'Unknown sync error'
      };
    }
  }

  async generateIntegrationReport(): Promise<BlueprintIntegrationReport> {
    const userId = await this.getAuthenticatedUserId();
    
    if (!userId) {
      return {
        userId: 'not_authenticated',
        blueprintLoaded: false,
        blueprintValid: false,
        completionPercentage: 0,
        aiServiceSynced: false,
        lastSyncTime: null,
        integrationScore: 0,
        validationErrors: ['User not authenticated']
      };
    }

    try {
      console.log('📊 Blueprint Integration: Generating integration report');
      
      // Get blueprint data
      const blueprintResult = await blueprintService.getActiveBlueprintData();
      const blueprintLoaded = !!blueprintResult.data;
      
      let blueprintValid = false;
      let completionPercentage = 0;
      let validationErrors: string[] = [];
      
      if (blueprintResult.data) {
        const validation = UnifiedBlueprintService.validateBlueprint(blueprintResult.data);
        blueprintValid = validation.isComplete;
        completionPercentage = validation.completionPercentage;
        validationErrors = validation.errors || [];
      } else {
        validationErrors.push(blueprintResult.error || 'Blueprint not found');
      }

      // Check AI service sync status
      const currentHash = blueprintResult.data ? this.generateBlueprintHash(blueprintResult.data) : null;
      const aiServiceSynced = currentHash === this.lastBlueprintHash && this.lastSyncTime !== null;

      // Calculate integration score
      const integrationScore = this.calculateIntegrationScore({
        blueprintLoaded,
        blueprintValid,
        completionPercentage,
        aiServiceSynced,
        validationErrorCount: validationErrors.length
      });

      return {
        userId: userId.substring(0, 8),
        blueprintLoaded,
        blueprintValid,
        completionPercentage,
        aiServiceSynced,
        lastSyncTime: this.lastSyncTime,
        integrationScore,
        validationErrors
      };
    } catch (error) {
      console.error('❌ Blueprint Integration: Report generation error:', error);
      return {
        userId: userId.substring(0, 8),
        blueprintLoaded: false,
        blueprintValid: false,
        completionPercentage: 0,
        aiServiceSynced: false,
        lastSyncTime: null,
        integrationScore: 0,
        validationErrors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private calculateIntegrationScore(metrics: {
    blueprintLoaded: boolean;
    blueprintValid: boolean;
    completionPercentage: number;
    aiServiceSynced: boolean;
    validationErrorCount: number;
  }): number {
    let score = 0;
    
    // Blueprint availability (0-25)
    if (metrics.blueprintLoaded) score += 25;
    
    // Blueprint validity (0-25)
    if (metrics.blueprintValid) score += 25;
    
    // Completion percentage (0-30)
    score += Math.floor(metrics.completionPercentage * 0.3);
    
    // AI service sync (0-15)
    if (metrics.aiServiceSynced) score += 15;
    
    // Error penalty (0-5 deduction)
    score -= Math.min(5, metrics.validationErrorCount);
    
    return Math.max(0, Math.min(100, score));
  }

  async testBlueprintIntegration(): Promise<{
    blueprintLoadTest: boolean;
    validationTest: boolean;
    aiSyncTest: boolean;
    consistencyTest: boolean;
    error?: string;
  }> {
    try {
      console.log('🧪 Blueprint Integration: Starting integration test');
      
      // Test 1: Blueprint loading
      const blueprintResult = await blueprintService.getActiveBlueprintData();
      const blueprintLoadTest = !!blueprintResult.data;
      console.log('🧪 Blueprint load test:', blueprintLoadTest ? 'PASS' : 'FAIL');
      
      if (!blueprintLoadTest) {
        return {
          blueprintLoadTest: false,
          validationTest: false,
          aiSyncTest: false,
          consistencyTest: false,
          error: blueprintResult.error || 'Blueprint not found'
        };
      }
      
      // Test 2: Blueprint validation
      const validation = UnifiedBlueprintService.validateBlueprint(blueprintResult.data!);
      const validationTest = validation.completionPercentage > 0;
      console.log('🧪 Blueprint validation test:', validationTest ? 'PASS' : 'FAIL');
      
      // Test 3: AI service sync
      const syncResult = await this.performBlueprintSync();
      const aiSyncTest = syncResult.success;
      console.log('🧪 AI sync test:', aiSyncTest ? 'PASS' : 'FAIL');
      
      // Test 4: Consistency check
      const report = await this.generateIntegrationReport();
      const consistencyTest = report.integrationScore > 50;
      console.log('🧪 Consistency test:', consistencyTest ? 'PASS' : 'FAIL');
      
      return {
        blueprintLoadTest,
        validationTest,
        aiSyncTest,
        consistencyTest
      };
    } catch (error) {
      console.error('❌ Blueprint Integration: Integration test error:', error);
      return {
        blueprintLoadTest: false,
        validationTest: false,
        aiSyncTest: false,
        consistencyTest: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Force sync method for testing
  async forceBlueprintSync(): Promise<BlueprintSyncResult> {
    this.lastBlueprintHash = null; // Force sync by clearing hash
    return this.performBlueprintSync();
  }
}

export const blueprintAIIntegrationService = new BlueprintAIIntegrationService();
