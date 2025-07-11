import { supabase } from "@/integrations/supabase/client";

export class QuoteRegenerationService {
  async regenerateQuotes(userId: string): Promise<{ success: boolean; error?: string; quotesGenerated?: number }> {
    try {
      console.log('🔄 Calling quote regeneration for user:', userId);
      
      const { data, error } = await supabase.functions.invoke('regenerate-quotes', {
        body: { userId }
      });

      if (error) {
        console.error('❌ Error calling regenerate-quotes function:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Unknown error during quote regeneration');
      }

      console.log('✅ Successfully regenerated quotes:', data.quotesGenerated);
      return { success: true, quotesGenerated: data.quotesGenerated };

    } catch (error) {
      console.error('💥 Quote regeneration service error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to regenerate quotes'
      };
    }
  }
}

export const quoteRegenerationService = new QuoteRegenerationService();