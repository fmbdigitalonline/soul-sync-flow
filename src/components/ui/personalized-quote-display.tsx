
import React from 'react';
import { RotatingText } from './rotating-text';
import { usePersonalizedQuotes } from '@/hooks/use-personalized-quotes';
import { Sparkles } from 'lucide-react';

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
  const {
    quotes,
    hasPersonalizedQuotes,
    loading
  } = usePersonalizedQuotes(5);

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
      {hasPersonalizedQuotes && (
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3 text-soul-purple" />
          <span className="py-[10px]">Personalized for your unique blueprint</span>
        </div>
      )}
    </div>
  );
};
