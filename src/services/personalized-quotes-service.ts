import { supabase } from "@/integrations/supabase/client";

export interface PersonalityQuote {
  id: string;
  user_id: string;
  personality_report_id: string;
  quote_text: string;
  attribution?: string;
  category: string;
  personality_alignment: {
    explanation: string;
    mbti_connection?: string;
    hd_connection?: string;
    astro_connection?: string;
  };
  usage_count: number;
  is_favorite: boolean;
  created_at: string;
  last_shown?: string;
}

class PersonalizedQuotesService {
  async getUserQuotes(userId: string): Promise<{ success: boolean; quotes?: PersonalityQuote[]; error?: string }> {
    try {
      const { data, error } = await (supabase as any)
        .from('personality_quotes')
        .select('*')
        .eq('user_id', userId)
        .order('usage_count', { ascending: true }); // Rotate less-used quotes first

      if (error) {
        console.error('Error fetching user quotes:', error);
        return { success: false, error: error.message };
      }

      return { success: true, quotes: data || [] };
    } catch (error) {
      console.error('Service error fetching quotes:', error);
      return { success: false, error: String(error) };
    }
  }

  async getRotatingQuotes(userId: string, count: number = 3): Promise<{ success: boolean; quotes?: PersonalityQuote[]; error?: string }> {
    try {
      const { data, error } = await (supabase as any)
        .from('personality_quotes')
        .select('*')
        .eq('user_id', userId)
        .order('last_shown', { ascending: true, nullsFirst: true })
        .limit(count);

      if (error) {
        console.error('Error fetching rotating quotes:', error);
        return { success: false, error: error.message };
      }

      // Update last_shown timestamp for these quotes
      if (data && data.length > 0) {
        const quoteIds = data.map((q: PersonalityQuote) => q.id);
        await (supabase as any)
          .from('personality_quotes')
          .update({ 
            last_shown: new Date().toISOString(),
            usage_count: 1 // Simple increment for now
          })
          .in('id', quoteIds);
      }

      return { success: true, quotes: data || [] };
    } catch (error) {
      console.error('Service error fetching rotating quotes:', error);
      return { success: false, error: String(error) };
    }
  }

  async getQuotesByCategory(userId: string, category: string): Promise<{ success: boolean; quotes?: PersonalityQuote[]; error?: string }> {
    try {
      const { data, error } = await (supabase as any)
        .from('personality_quotes')
        .select('*')
        .eq('user_id', userId)
        .eq('category', category)
        .order('usage_count', { ascending: true });

      if (error) {
        console.error('Error fetching quotes by category:', error);
        return { success: false, error: error.message };
      }

      return { success: true, quotes: data || [] };
    } catch (error) {
      console.error('Service error fetching quotes by category:', error);
      return { success: false, error: String(error) };
    }
  }

  async toggleFavorite(quoteId: string, isFavorite: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await (supabase as any)
        .from('personality_quotes')
        .update({ is_favorite: isFavorite })
        .eq('id', quoteId);

      if (error) {
        console.error('Error toggling quote favorite:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Service error toggling favorite:', error);
      return { success: false, error: String(error) };
    }
  }

  async hasUserQuotes(userId: string): Promise<boolean> {
    try {
      const { data, error } = await (supabase as any)
        .from('personality_quotes')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (error) {
        console.error('Error checking for user quotes:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Service error checking user quotes:', error);
      return false;
    }
  }

  // Default quotes for users without personalized ones
  getDefaultQuotes(language: string = 'en'): string[] {
    const quotes = {
      en: [
        "Your authentic self is your greatest gift to the world.",
        "Growth happens when you honor your natural energy patterns.",
        "Trust your inner wisdom—it knows the path forward.",
        "Every challenge is an opportunity to discover your strength.",
        "You are exactly where you need to be in your journey.",
        "Your unique perspective adds beauty to the collective tapestry.",
        "Embrace your complexities—they make you magnificently human.",
        "Your intuition is a compass pointing toward your highest good."
      ],
      nl: [
        "Je authentieke zelf is je grootste geschenk aan de wereld.",
        "Groei gebeurt wanneer je je natuurlijke energiepatronen eert.",
        "Vertrouw op je innerlijke wijsheid—het kent de weg vooruit.",
        "Elke uitdaging is een kans om je kracht te ontdekken.",
        "Je bent precies waar je moet zijn in je reis.",
        "Jouw unieke perspectief voegt schoonheid toe aan het collectieve tapijt.",
        "Omarm je complexiteit—het maakt je prachtig menselijk.",
        "Je intuïtie is een kompas dat naar je hoogste goed wijst."
      ]
    };
    
    return quotes[language as keyof typeof quotes] || quotes.en;
  }
}

export const personalizedQuotesService = new PersonalizedQuotesService();