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

      let itemsTriggered = 0;
      const errors: string[] = [];

      // Try to trigger regeneration via edge functions (these may or may not exist)
      try {
        // Try personality report regeneration
        const personalityResult = await supabase.functions.invoke('regenerate-personality-report', {
          body: { userId, language: newLanguage }
        });

        if (personalityResult.error) {
          console.log('ℹ️ Personality report regeneration not available:', personalityResult.error.message);
        } else if (personalityResult.data?.success) {
          itemsTriggered++;
          console.log('✅ Personality report regeneration triggered');
        }
      } catch (error) {
        console.log('ℹ️ Personality report regeneration service not available');
      }

      // Try quotes regeneration
      try {
        const quotesResult = await supabase.functions.invoke('regenerate-quotes', {
          body: { userId, language: newLanguage }
        });

        if (quotesResult.error) {
          console.log('ℹ️ Quotes regeneration not available:', quotesResult.error.message);
        } else if (quotesResult.data?.success) {
          itemsTriggered++;
          console.log('✅ Quotes regeneration triggered');
        }
      } catch (error) {
        console.log('ℹ️ Quotes regeneration service not available');
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
      const contentTypes: string[] = [];
      
      // Check for blueprint data
      try {
        const { data: blueprints } = await supabase
          .from('blueprints')
          .select('id')
          .eq('user_id', userId)
          .limit(1);
        
        if (blueprints && blueprints.length > 0) {
          contentTypes.push('Blueprint Data');
        }
      } catch (error) {
        console.log('ℹ️ Blueprint check not available');
      }

      // For now, we assume there might be other content types
      // This is a conservative approach that doesn't break if tables don't exist
      if (contentTypes.length === 0) {
        contentTypes.push('User Profile Data');
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