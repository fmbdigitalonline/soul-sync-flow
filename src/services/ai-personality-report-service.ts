
import { supabase } from "@/integrations/supabase/client";
import { BlueprintData } from "./blueprint-service";

export interface PersonalityReport {
  id: string;
  user_id: string;
  blueprint_id: string;
  report_content: {
    core_personality_pattern: string;
    decision_making_style: string;
    relationship_style: string;
    life_path_purpose: string;
    current_energy_timing: string;
    integrated_summary: string;
  };
  generated_at: string;
  blueprint_version: string;
}

export interface PersonalityReportWithQuotes {
  report: PersonalityReport;
  quotes: {
    quote_text: string;
    category: string;
    personality_alignment: any;
  }[];
}

class AIPersonalityReportService {
  async generatePersonalityReport(blueprint: BlueprintData): Promise<{ success: boolean; report?: PersonalityReport; quotes?: any[]; error?: string }> {
    try {
      console.log('🎭 Generating comprehensive personality report with personalized quotes...');
      console.log('📋 Blueprint data:', JSON.stringify(blueprint, null, 2));
      
      const { data, error } = await supabase.functions.invoke("generate-personality-report", {
        body: {
          blueprint,
          userId: blueprint.user_meta?.user_id,
        },
      });

      if (error) {
        console.error('❌ Error generating personality report:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Report generation successful:', data);
      return { 
        success: true, 
        report: data.report,
        quotes: data.quotes || []
      };
    } catch (error) {
      console.error('💥 Service error generating personality report:', error);
      return { success: false, error: String(error) };
    }
  }

  async getStoredReport(userId: string): Promise<{ success: boolean; report?: PersonalityReport; error?: string }> {
    try {
      console.log('🔍 Fetching stored report for user:', userId);
      
      // Query the personality_reports table directly, bypassing supabase type checking for the table
      const { data, error } = await (supabase as any)
        .from('personality_reports')
        .select('*')
        .eq('user_id', userId)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching stored report:', error);
        return { success: false, error: error.message };
      }

      if (!data) {
        console.log('📝 No stored report found for user:', userId);
        return { success: true, report: undefined };
      }

      console.log('✅ Report found:', data);
      return { success: true, report: data as PersonalityReport };
    } catch (error) {
      console.error('💥 Service error fetching stored report:', error);
      return { success: false, error: String(error) };
    }
  }

  async hasExistingReport(userId: string): Promise<boolean> {
    try {
      console.log('🔍 Checking for existing report for user:', userId);
      
      // Query the personality_reports table directly
      const { data, error } = await (supabase as any)
        .from('personality_reports')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (error) {
        console.error('❌ Error checking for existing report:', error);
        return false;
      }

      const hasReport = data && data.length > 0;
      console.log('📊 Has existing report:', hasReport);
      return hasReport;
    } catch (error) {
      console.error('💥 Service error checking existing report:', error);
      return false;
    }
  }
}

export const aiPersonalityReportService = new AIPersonalityReportService();
