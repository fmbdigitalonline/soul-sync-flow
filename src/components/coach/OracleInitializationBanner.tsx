import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useManualBlueprintProcessor } from '@/hooks/use-manual-blueprint-processor';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OracleInitializationBannerProps {
  userId: string;
}

export const OracleInitializationBanner = ({ userId }: OracleInitializationBannerProps) => {
  const [embeddingCount, setEmbeddingCount] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const { triggerProcessing, isProcessing, processingResult } = useManualBlueprintProcessor();
  const { toast } = useToast();

  useEffect(() => {
    checkEmbeddingStatus();
  }, [userId]);

  useEffect(() => {
    if (processingResult) {
      checkEmbeddingStatus();
    }
  }, [processingResult]);

  const checkEmbeddingStatus = async () => {
    setIsChecking(true);
    try {
      const { count, error } = await supabase
        .from('blueprint_text_embeddings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;
      setEmbeddingCount(count || 0);
    } catch (error) {
      console.error('Failed to check embedding status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleInitialize = async () => {
    try {
      await triggerProcessing(userId);
    } catch (error) {
      console.error('Failed to initialize Oracle:', error);
    }
  };

  if (isChecking) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg border border-border/50">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Checking Oracle status...</span>
      </div>
    );
  }

  if (embeddingCount === null || embeddingCount > 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-primary">
          Oracle: Full Power {embeddingCount && `(${embeddingCount} semantic memories)`}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 bg-accent/50 rounded-lg border border-accent">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-accent-foreground" />
        <div>
          <p className="text-sm font-medium text-accent-foreground">Oracle Initialization Required</p>
          <p className="text-xs text-muted-foreground">Process your blueprint for personalized insights</p>
        </div>
      </div>
      <Button
        onClick={handleInitialize}
        disabled={isProcessing}
        variant="default"
        size="sm"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Initialize Oracle
          </>
        )}
      </Button>
    </div>
  );
};
