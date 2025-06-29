
/**
 * VFP-Graph Migration Service
 * Handles safe migration of existing users to VFP-Graph intelligence
 */

import { supabase } from '@/integrations/supabase/client';
import { personalityFusionService } from './personality-fusion-service';

export class VFPGraphMigration {
  private static readonly BATCH_SIZE = 10;
  private static readonly MIGRATION_VERSION = '1.0.0';

  // Migrate existing users to VFP-Graph
  static async migrateExistingUsers(): Promise<{
    migrated: number;
    skipped: number;
    errors: number;
  }> {
    console.log('🚀 Starting VFP-Graph migration for existing users...');
    
    const stats = { migrated: 0, skipped: 0, errors: 0 };

    try {
      // Get all users with blueprints but no fusion vectors
      const { data: usersToMigrate } = await supabase
        .from('user_blueprints')
        .select(`
          user_id,
          blueprint,
          updated_at
        `)
        .eq('is_active', true)
        .order('updated_at', { ascending: true });

      if (!usersToMigrate || usersToMigrate.length === 0) {
        console.log('✅ No users require VFP-Graph migration');
        return stats;
      }

      console.log(`📊 Found ${usersToMigrate.length} users for potential migration`);

      // Process in batches to avoid overwhelming the system
      for (let i = 0; i < usersToMigrate.length; i += this.BATCH_SIZE) {
        const batch = usersToMigrate.slice(i, i + this.BATCH_SIZE);
        
        console.log(`🔄 Processing batch ${Math.floor(i / this.BATCH_SIZE) + 1}/${Math.ceil(usersToMigrate.length / this.BATCH_SIZE)}`);
        
        await Promise.all(
          batch.map(async (user) => {
            try {
              const result = await this.migrateUser(user.user_id, user.blueprint);
              if (result.success) {
                stats.migrated++;
                console.log(`✅ Migrated user ${user.user_id}`);
              } else {
                stats.skipped++;
                console.log(`⏭️ Skipped user ${user.user_id}: ${result.reason}`);
              }
            } catch (error) {
              stats.errors++;
              console.error(`❌ Error migrating user ${user.user_id}:`, error);
            }
          })
        );

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`🏁 VFP-Graph migration complete:`, stats);
      
      // Log migration completion
      await supabase.from('user_activities').insert({
        user_id: 'system',
        activity_type: 'vfp_migration_complete',
        activity_data: {
          ...stats,
          version: this.MIGRATION_VERSION,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('❌ VFP-Graph migration failed:', error);
      throw error;
    }

    return stats;
  }

  // Migrate individual user
  private static async migrateUser(userId: string, blueprint: any): Promise<{
    success: boolean;
    reason?: string;
  }> {
    try {
      // Check if user already has a fusion vector
      const existing = await personalityFusionService.loadFusionVector(userId);
      if (existing) {
        return { success: false, reason: 'Already has fusion vector' };
      }

      // Extract personality data from blueprint
      const mbtiType = blueprint.cognitiveTemperamental?.mbtiType;
      const hdData = blueprint.energyDecisionStrategy;
      const astroData = blueprint.publicArchetype;
      const lifePathData = blueprint.coreValuesNarrative;

      if (!mbtiType) {
        return { success: false, reason: 'Missing MBTI data' };
      }

      // Convert blueprint data to VFP-Graph format
      const hdGates = hdData?.gates || this.generateDefaultHDGates(userId);
      const astrologyInput = {
        sunSign: this.convertSignToNumber(astroData?.sunSign),
        moonSign: this.convertSignToNumber(astroData?.moonSign),
        ascendant: this.convertSignToNumber(astroData?.ascendant) || 7,
        lifePathNumber: lifePathData?.lifePath || this.calculateLifePath(userId)
      };

      // Generate VFP-Graph fusion vector
      const result = await personalityFusionService.generatePersonalityFusion(
        userId,
        mbtiType,
        hdGates,
        astrologyInput
      );

      // Mark as migrated
      await supabase
        .from('personality_fusion_vectors')
        .update({
          fusion_metadata: {
            ...result.fusionVector.calibrationParams,
            migrated: true,
            migrationVersion: this.MIGRATION_VERSION,
            migrationDate: new Date().toISOString(),
            sourceBlueprint: true
          }
        })
        .eq('id', result.fusionVector.id);

      return { success: true };

    } catch (error) {
      console.error(`Migration error for user ${userId}:`, error);
      return { success: false, reason: error.message };
    }
  }

  // Helper methods for data conversion
  private static generateDefaultHDGates(userId: string): number[] {
    // Generate consistent gates based on user ID hash
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return [
      (hash % 64) + 1,
      ((hash * 2) % 64) + 1,
      ((hash * 3) % 64) + 1,
      ((hash * 4) % 64) + 1
    ];
  }

  private static convertSignToNumber(sign: string | undefined): number {
    const signMap: Record<string, number> = {
      'Aries': 1, 'Taurus': 2, 'Gemini': 3, 'Cancer': 4,
      'Leo': 5, 'Virgo': 6, 'Libra': 7, 'Scorpio': 8,
      'Sagittarius': 9, 'Capricorn': 10, 'Aquarius': 11, 'Pisces': 12
    };
    return signMap[sign || 'Leo'] || 5;
  }

  private static calculateLifePath(userId: string): number {
    // Generate life path number from user ID
    const sum = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (sum % 9) + 1;
  }

  // Check migration status
  static async getMigrationStatus(): Promise<{
    totalUsers: number;
    migratedUsers: number;
    pendingMigration: number;
    migrationComplete: boolean;
  }> {
    const [blueprints, vectors] = await Promise.all([
      supabase.from('user_blueprints').select('user_id', { count: 'exact' }).eq('is_active', true),
      supabase.from('personality_fusion_vectors').select('user_id', { count: 'exact' })
    ]);

    const totalUsers = blueprints.count || 0;
    const migratedUsers = vectors.count || 0;
    const pendingMigration = Math.max(0, totalUsers - migratedUsers);

    return {
      totalUsers,
      migratedUsers,
      pendingMigration,
      migrationComplete: pendingMigration === 0
    };
  }
}

// Auto-run migration for new users
export const ensureUserVFPGraph = async (userId: string): Promise<void> => {
  try {
    // Check if user already has VFP-Graph data
    const existing = await personalityFusionService.loadFusionVector(userId);
    if (existing) return;

    // Run individual migration
    const result = await VFPGraphMigration['migrateUser'](userId, {});
    if (result.success) {
      console.log(`✅ Auto-migrated new user ${userId} to VFP-Graph`);
    }
  } catch (error) {
    console.warn(`⚠️ Auto-migration failed for user ${userId}:`, error);
  }
};
