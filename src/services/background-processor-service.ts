import { supabase } from "@/integrations/supabase/client";
import { BlueprintData } from "./blueprint-service";

export class BackgroundProcessorService {
  /**
   * PRINCIPLE #2: NO MASKING ERRORS - Surface real invocation failures
   * PRINCIPLE #7: BUILD TRANSPARENTLY - Comprehensive logging and validation
   */
  static async startHermeticGeneration(blueprint: BlueprintData, jobId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      console.log(`🚀 Attempting background hermetic generation for job: ${jobId}`);
      
      // FIRST: Verify edge function is accessible with health check
      const healthCheck = await this.verifyFunctionHealth();
      if (!healthCheck.healthy) {
        console.error('❌ Background processor not accessible:', healthCheck.error);
        return { success: false, error: `Function unavailable: ${healthCheck.error}` };
      }
      
      const { data, error } = await supabase.functions.invoke('hermetic-background-processor', {
        body: {
          jobId,
          blueprint
        }
      });

      // PRINCIPLE #3: NO FALLBACKS THAT MASK ERRORS - Validate actual response
      if (error) {
        console.error('❌ Edge function invocation error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return { 
          success: false, 
          error: `Function invocation failed: ${error.message}${error.details ? ` - ${error.details}` : ''}` 
        };
      }

      // Validate that the function actually started processing
      if (!data || !data.success) {
        const errorMsg = data?.error || 'Function returned unsuccessful response';
        console.error('❌ Background processor returned failure:', errorMsg);
        return { success: false, error: errorMsg };
      }

      console.log('✅ Background processing confirmed started:', data);
      return { success: true };

    } catch (error: any) {
      console.error('❌ Background processing initiation failed:', {
        error: error.message,
        stack: error.stack,
        jobId
      });
      return { 
        success: false, 
        error: `Processing failed to start: ${error.message}` 
      };
    }
  }

  /**
   * PRINCIPLE #2: GROUND TRUTH - Verify function is actually deployed and accessible
   */
  private static async verifyFunctionHealth(): Promise<{ healthy: boolean; error?: string }> {
    try {
      // Test function accessibility with minimal payload
      const { data, error } = await supabase.functions.invoke('hermetic-background-processor', {
        body: { healthCheck: true }
      });

      if (error) {
        return { 
          healthy: false, 
          error: `Function not accessible: ${error.message}` 
        };
      }

      return { healthy: true };
    } catch (error: any) {
      return { 
        healthy: false, 
        error: `Health check failed: ${error.message}` 
      };
    }
  }
}