
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { personalizedQuotesService, PersonalityQuote } from '@/services/personalized-quotes-service';

export const usePersonalizedQuotes = (count: number = 3) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [quotes, setQuotes] = useState<PersonalityQuote[]>([]);
  const [defaultQuotes, setDefaultQuotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPersonalizedQuotes, setHasPersonalizedQuotes] = useState(false);

  useEffect(() => {
    const fetchQuotes = async () => {
      console.log('🎭 usePersonalizedQuotes: Starting fetch for user:', user?.id);
      
      if (!user) {
        console.log('🎭 usePersonalizedQuotes: No user, clearing all state');
        // Clear all quote state when user logs out
        setQuotes([]);
        setDefaultQuotes([]);
        setHasPersonalizedQuotes(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      
      try {
        // Check if user has personalized quotes
        console.log('🎭 usePersonalizedQuotes: Checking for user quotes...');
        const hasQuotes = await personalizedQuotesService.hasUserQuotes(user.id);
        console.log('🎭 usePersonalizedQuotes: Has quotes result:', hasQuotes);
        setHasPersonalizedQuotes(hasQuotes);
        
        if (hasQuotes) {
          // Get rotating personalized quotes
          console.log('🎭 usePersonalizedQuotes: Fetching rotating quotes...');
          const result = await personalizedQuotesService.getRotatingQuotes(user.id, count);
          console.log('🎭 usePersonalizedQuotes: Rotating quotes result:', result);
          
          if (result.success && result.quotes) {
            setQuotes(result.quotes);
            console.log('🎭 usePersonalizedQuotes: Set personalized quotes:', result.quotes.length);
          } else {
            console.log('🎭 usePersonalizedQuotes: Failed to get rotating quotes, using defaults');
            const defaults = personalizedQuotesService.getDefaultQuotes(language);
            const shuffled = defaults.sort(() => 0.5 - Math.random()).slice(0, count);
            setDefaultQuotes(shuffled);
          }
        } else {
          // Use default quotes
          console.log('🎭 usePersonalizedQuotes: No personalized quotes, using defaults');
          const defaults = personalizedQuotesService.getDefaultQuotes(language);
          const shuffled = defaults.sort(() => 0.5 - Math.random()).slice(0, count);
          setDefaultQuotes(shuffled);
          console.log('🎭 usePersonalizedQuotes: Set default quotes:', shuffled);
        }
      } catch (error) {
        console.error('🎭 usePersonalizedQuotes: Error fetching quotes:', error);
        // Fallback to default quotes
        const defaults = personalizedQuotesService.getDefaultQuotes(language);
        const shuffled = defaults.sort(() => 0.5 - Math.random()).slice(0, count);
        setDefaultQuotes(shuffled);
        console.log('🎭 usePersonalizedQuotes: Error fallback, set default quotes:', shuffled);
      } finally {
        setLoading(false);
        console.log('🎭 usePersonalizedQuotes: Fetch complete');
      }
    };

    fetchQuotes();
  }, [user, count, language]);

  const refreshQuotes = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      if (hasPersonalizedQuotes) {
        const result = await personalizedQuotesService.getRotatingQuotes(user.id, count);
        if (result.success && result.quotes) {
          setQuotes(result.quotes);
        }
      } else {
        const defaults = personalizedQuotesService.getDefaultQuotes(language);
        const shuffled = defaults.sort(() => 0.5 - Math.random()).slice(0, count);
        setDefaultQuotes(shuffled);
      }
    } catch (error) {
      console.error('🎭 usePersonalizedQuotes: Error refreshing quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayQuotes = hasPersonalizedQuotes 
    ? quotes.map(q => q.quote_text)
    : defaultQuotes;

  console.log('🎭 usePersonalizedQuotes: Final state:', {
    hasPersonalizedQuotes,
    quotesCount: quotes.length,
    defaultQuotesCount: defaultQuotes.length,
    displayQuotesCount: displayQuotes.length,
    loading
  });

  return {
    quotes: displayQuotes,
    personalizedQuotes: quotes,
    hasPersonalizedQuotes,
    loading,
    refreshQuotes
  };
};
