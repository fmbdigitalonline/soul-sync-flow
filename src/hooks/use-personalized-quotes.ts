import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { personalizedQuotesService, PersonalityQuote } from '@/services/personalized-quotes-service';

export const usePersonalizedQuotes = (count: number = 3) => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<PersonalityQuote[]>([]);
  const [defaultQuotes, setDefaultQuotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPersonalizedQuotes, setHasPersonalizedQuotes] = useState(false);

  useEffect(() => {
    const fetchQuotes = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      
      try {
        // Check if user has personalized quotes
        const hasQuotes = await personalizedQuotesService.hasUserQuotes(user.id);
        setHasPersonalizedQuotes(hasQuotes);
        
        if (hasQuotes) {
          // Get rotating personalized quotes
          const result = await personalizedQuotesService.getRotatingQuotes(user.id, count);
          if (result.success && result.quotes) {
            setQuotes(result.quotes);
          }
        } else {
          // Use default quotes
          const defaults = personalizedQuotesService.getDefaultQuotes();
          const shuffled = defaults.sort(() => 0.5 - Math.random()).slice(0, count);
          setDefaultQuotes(shuffled);
        }
      } catch (error) {
        console.error('Error fetching quotes:', error);
        // Fallback to default quotes
        const defaults = personalizedQuotesService.getDefaultQuotes();
        const shuffled = defaults.sort(() => 0.5 - Math.random()).slice(0, count);
        setDefaultQuotes(shuffled);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, [user, count]);

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
        const defaults = personalizedQuotesService.getDefaultQuotes();
        const shuffled = defaults.sort(() => 0.5 - Math.random()).slice(0, count);
        setDefaultQuotes(shuffled);
      }
    } catch (error) {
      console.error('Error refreshing quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayQuotes = hasPersonalizedQuotes 
    ? quotes.map(q => q.quote_text)
    : defaultQuotes;

  return {
    quotes: displayQuotes,
    personalizedQuotes: quotes,
    hasPersonalizedQuotes,
    loading,
    refreshQuotes
  };
};