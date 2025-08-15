import React from 'react';
import { RotatingText } from './rotating-text';
import { usePersonalizedQuotes } from '@/hooks/use-personalized-quotes';
import { Sparkles, RefreshCw } from 'lucide-react';
import { quoteRegenerationService } from '@/services/quote-regeneration-service';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { interpolateTranslation } from '@/utils/translation-utils';
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
    user
  } = useAuth();
  const { t, language } = useLanguage();
  const {
    quotes,
    hasPersonalizedQuotes,
    loading,
    refreshQuotes
  } = usePersonalizedQuotes(5);
  const handleRegenerateQuotes = async () => {
    if (!user?.id) return;
    try {
      toast.loading(t('personalizedQuotes.regenerating'));
      const result = await quoteRegenerationService.regenerateQuotes(user.id, language);
      if (result.success) {
        toast.success(interpolateTranslation(t('personalizedQuotes.regenerationSuccess'), {
          count: result.quotesGenerated?.toString() || '0'
        }));
        await refreshQuotes();
      } else {
        toast.error(result.error || t('personalizedQuotes.regenerationError'));
      }
    } catch (error) {
      toast.error(t('personalizedQuotes.regenerationError'));
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
    return <div className={className}>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span className="text-sm">{t('personalizedQuotes.loading')}</span>
        </div>
      </div>;
  }

  // Use personalized quotes if available, otherwise use fallback quotes
  const displayQuotes = quotes.length > 0 ? quotes : fallbackQuotes;
  console.log('🎭 Final display quotes:', displayQuotes);
  if (displayQuotes.length === 0) {
    return <div className={className}>
        <span className="text-muted-foreground">
          "{t('personalizedQuotes.fallbackMessage')}"
        </span>
      </div>;
  }
  return <div className="space-y-2">
      <RotatingText texts={displayQuotes} className={className} interval={interval} />
      {hasPersonalizedQuotes ? <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3 text-soul-purple" />
          <span className="py-[10px]">{t('personalizedQuotes.personalizedText')}</span>
          {quotes.length < 5 && (
            <button 
              onClick={handleRegenerateQuotes}
              className="ml-2 p-1 rounded-full hover:bg-muted/50 transition-colors"
              title={t('personalizedQuotes.generateMoreTitle')}
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          )}
        </div> : displayQuotes.length > 0 && <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <span>{t('personalizedQuotes.defaultText')}</span>
        </div>}
    </div>;
};