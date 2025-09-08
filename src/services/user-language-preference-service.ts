import { supabase } from '@/integrations/supabase/client';
import { Language } from '@/contexts/LanguageContext';

export class UserLanguagePreferenceService {
  /**
   * Save user language preference to their profile
   */
  async saveLanguagePreference(userId: string, language: Language): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('💬 Saving language preference:', { userId, language });

      // Update user profile with language preference
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
          language_preference: language,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('❌ Error saving language preference:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Language preference saved successfully');
      return { success: true };

    } catch (error) {
      console.error('💥 Unexpected error saving language preference:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Load user language preference from their profile
   */
  async loadLanguagePreference(userId: string): Promise<{ language: Language | null; error?: string }> {
    try {
      console.log('💬 Loading language preference for user:', userId);

      const { data, error } = await supabase
        .from('profiles')
        .select('language_preference')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found - this is normal for new users
          console.log('ℹ️ No profile found for user, defaulting to English');
          return { language: null };
        }
        console.error('❌ Error loading language preference:', error);
        return { language: null, error: error.message };
      }

      const language = data?.language_preference as Language || null;
      console.log('✅ Language preference loaded:', language);
      return { language };

    } catch (error) {
      console.error('💥 Unexpected error loading language preference:', error);
      return { 
        language: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Trigger regeneration of existing content when language changes
   */
  async triggerContentRegeneration(userId: string, newLanguage: Language): Promise<{ success: boolean; error?: string; itemsTriggered?: number }> {
    try {
      console.log('🔄 Triggering content regeneration for language change:', { userId, newLanguage });

      // Check what content exists that might need regeneration
      const contentChecks = await Promise.allSettled([
        // Check for existing personality reports
        supabase
          .from('personality_reports')
          .select('id')
          .eq('user_id', userId)
          .limit(1),
        
        // Check for existing quotes
        supabase
          .from('personalized_quotes')
          .select('id')
          .eq('user_id', userId)
          .limit(1)
      ]);

      let itemsTriggered = 0;
      const errors: string[] = [];

      // Trigger personality report regeneration if exists
      if (contentChecks[0].status === 'fulfilled' && contentChecks[0].value.data?.length > 0) {
        try {
          const { data, error } = await supabase.functions.invoke('regenerate-personality-report', {
            body: { userId, language: newLanguage }
          });

          if (error) {
            errors.push(`Personality report: ${error.message}`);
          } else if (data?.success) {
            itemsTriggered++;
            console.log('✅ Personality report regeneration triggered');
          }
        } catch (error) {
          errors.push(`Personality report: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Trigger quotes regeneration if exists
      if (contentChecks[1].status === 'fulfilled' && contentChecks[1].value.data?.length > 0) {
        try {
          const { data, error } = await supabase.functions.invoke('regenerate-quotes', {
            body: { userId, language: newLanguage }
          });

          if (error) {
            errors.push(`Quotes: ${error.message}`);
          } else if (data?.success) {
            itemsTriggered++;
            console.log('✅ Quotes regeneration triggered');
          }
        } catch (error) {
          errors.push(`Quotes: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (errors.length > 0) {
        console.warn('⚠️ Some content regeneration failed:', errors);
        return { 
          success: itemsTriggered > 0, 
          error: `Partial success: ${errors.join(', ')}`,
          itemsTriggered 
        };
      }

      console.log(`✅ Content regeneration completed: ${itemsTriggered} items triggered`);
      return { success: true, itemsTriggered };

    } catch (error) {
      console.error('💥 Error triggering content regeneration:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Check if user has existing content that could be regenerated
   */
  async checkRegenerableContent(userId: string): Promise<{ hasContent: boolean; contentTypes: string[]; error?: string }> {
    try {
      const contentChecks = await Promise.allSettled([
        supabase.from('personality_reports').select('id').eq('user_id', userId).limit(1),
        supabase.from('personalized_quotes').select('id').eq('user_id', userId).limit(1),
        supabase.from('blueprint_data').select('id').eq('user_id', userId).limit(1)
      ]);

      const contentTypes: string[] = [];
      
      if (contentChecks[0].status === 'fulfilled' && contentChecks[0].value.data?.length > 0) {
        contentTypes.push('Personality Reports');
      }
      
      if (contentChecks[1].status === 'fulfilled' && contentChecks[1].value.data?.length > 0) {
        contentTypes.push('Personalized Quotes');
      }
      
      if (contentChecks[2].status === 'fulfilled' && contentChecks[2].value.data?.length > 0) {
        contentTypes.push('Blueprint Data');
      }

      return { 
        hasContent: contentTypes.length > 0, 
        contentTypes 
      };

    } catch (error) {
      console.error('💥 Error checking regenerable content:', error);
      return { 
        hasContent: false, 
        contentTypes: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export const userLanguagePreferenceService = new UserLanguagePreferenceService();