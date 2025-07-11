
import React from 'react';
import { RotatingText } from './rotating-text';
import { usePersonalizedQuotes } from '@/hooks/use-personalized-quotes';
import { Sparkles, RefreshCw } from 'lucide-react';
import { quoteRegenerationService } from '@/services/quote-regeneration-service';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PersonalizedQuoteDisplayProps {
  className?: string;
  interval?: number;
  fallbackQuotes?: string[];
}

export const PersonalizedQuoteDisplay: React.FC<PersonalizedQuoteDisplayProps> = ({
  className,
  interval = 4000,
  fallbackQuotes = []
}) => {
  const { user } = useAuth();
  const {
    quotes,
    hasPersonalizedQuotes,
    loading,
    refreshQuotes
  } = usePersonalizedQuotes(5);

  const handleRegenerateQuotes = async () => {
    if (!user?.id) return;
    
    try {
      toast.loading('Regenerating your personalized quotes...');
      const result = await quoteRegenerationService.regenerateQuotes(user.id);
      
      if (result.success) {
        toast.success(`Generated ${result.quotesGenerated} new personalized quotes!`);
        await refreshQuotes();
      } else {
        toast.error(result.error || 'Failed to regenerate quotes');
      }
    } catch (error) {
      toast.error('Failed to regenerate quotes');
    }
  };

  console.log('🎭 PersonalizedQuoteDisplay state:', {
    quotes,
    hasPersonalizedQuotes,
    loading,
    quotesLength: quotes.length,
    fallbackQuotesLength: fallbackQuotes.length
  });

  if (loading) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span className="text-sm">Loading your personalized inspiration...</span>
        </div>
      </div>
    );
  }

  // Use personalized quotes if available, otherwise use fallback quotes
  const displayQuotes = quotes.length > 0 ? quotes : fallbackQuotes;
  
  console.log('🎭 Final display quotes:', displayQuotes);

  if (displayQuotes.length === 0) {
    return (
      <div className={className}>
        <span className="text-muted-foreground">
          "Your unique journey is unfolding perfectly."
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <RotatingText texts={displayQuotes} className={className} interval={interval} />
      {hasPersonalizedQuotes ? (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3 text-soul-purple" />
          <span className="py-[10px]">Personalized for your unique blueprint</span>
          {quotes.length < 5 && (
            <button 
              onClick={handleRegenerateQuotes}
              className="ml-2 flex items-center gap-1 text-xs text-soul-purple hover:text-soul-purple-bright transition-colors"
              title="Regenerate more quotes"
            >
              <RefreshCw className="h-3 w-3" />
              Generate more
            </button>
          )}
        </div>
      ) : displayQuotes.length > 0 && (
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <span>Default inspiration quotes</span>
        </div>
      )}
    </div>
  );
};
