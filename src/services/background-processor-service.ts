import { supabase } from "@/integrations/supabase/client";
import { BlueprintData } from "./blueprint-service";

export class BackgroundProcessorService {
  static async startHermeticGeneration(blueprint: BlueprintData, jobId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      console.log(`🚀 Starting background hermetic generation for job: ${jobId}`);
      
      const { data, error } = await supabase.functions.invoke('hermetic-background-processor', {
        body: {
          jobId,
          blueprint
        }
      });

      if (error) {
        console.error('❌ Background processor invocation failed:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Background processing started successfully');
      return { success: true };

    } catch (error) {
      console.error('❌ Failed to start background processing:', error);
      return { success: false, error: String(error) };
    }
  }
}