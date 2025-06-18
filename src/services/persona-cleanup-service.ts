
import { supabase } from "@/integrations/supabase/client";

export class PersonaCleanupService {
  /**
   * Clean up personas with NULL blueprint signatures (stale cache issue)
   * This should be run as part of the fix implementation
   */
  static async cleanupNullSignaturePersonas(): Promise<{ deletedCount: number; success: boolean }> {
    try {
      console.log("🧹 PersonaCleanup: Starting cleanup of NULL signature personas");
      
      const { data, error, count } = await supabase
        .from('personas')
        .delete({ count: 'exact' })
        .is('blueprint_signature', null);

      if (error) {
        console.error("❌ ERROR: Failed to cleanup NULL signature personas:", error);
        return { deletedCount: 0, success: false };
      }

      console.log(`✅ PersonaCleanup: Successfully deleted ${count || 0} stale personas`);
      return { deletedCount: count || 0, success: true };
    } catch (error) {
      console.error("❌ ERROR: Unexpected error during persona cleanup:", error);
      return { deletedCount: 0, success: false };
    }
  }

  /**
   * Force regeneration of all personas for a specific user
   * Useful when blueprint data structure changes
   */
  static async forceRegenerateUserPersonas(userId: string): Promise<boolean> {
    try {
      console.log("🔄 PersonaCleanup: Force regenerating personas for user:", userId);
      
      const { error } = await supabase
        .from('personas')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error("❌ ERROR: Failed to delete user personas for regeneration:", error);
        return false;
      }

      console.log("✅ PersonaCleanup: User personas deleted, will regenerate on next request");
      return true;
    } catch (error) {
      console.error("❌ ERROR: Unexpected error during user persona regeneration:", error);
      return false;
    }
  }

  /**
   * Get persona statistics for debugging
   */
  static async getPersonaStats(): Promise<{
    total: number;
    withNullSignature: number;
    withValidSignature: number;
    byTemplateVersion: Record<string, number>;
  }> {
    try {
      const [
        { count: total },
        { count: nullSignatures },
        { count: validSignatures },
        { data: versionStats }
      ] = await Promise.all([
        supabase.from('personas').select('*', { count: 'exact', head: true }),
        supabase.from('personas').select('*', { count: 'exact', head: true }).is('blueprint_signature', null),
        supabase.from('personas').select('*', { count: 'exact', head: true }).not('blueprint_signature', 'is', null),
        supabase.from('personas').select('template_version')
      ]);

      const byTemplateVersion: Record<string, number> = {};
      versionStats?.forEach(row => {
        const version = row.template_version || 'unknown';
        byTemplateVersion[version] = (byTemplateVersion[version] || 0) + 1;
      });

      return {
        total: total || 0,
        withNullSignature: nullSignatures || 0,
        withValidSignature: validSignatures || 0,
        byTemplateVersion
      };
    } catch (error) {
      console.error("❌ ERROR: Failed to get persona stats:", error);
      return {
        total: 0,
        withNullSignature: 0,
        withValidSignature: 0,
        byTemplateVersion: {}
      };
    }
  }
}
