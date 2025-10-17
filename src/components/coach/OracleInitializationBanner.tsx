import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useManualBlueprintProcessor } from '@/hooks/use-manual-blueprint-processor';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OracleInitializationBannerProps {
  userId: string;
}

export const OracleInitializationBanner = ({ userId }: OracleInitializationBannerProps) => {
  const [embeddingCount, setEmbeddingCount] = useState<number | null>(null);
  const [hasLegacyEmbeddings, setHasLegacyEmbeddings] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { triggerProcessing, isProcessing, processingResult, currentJob } = useManualBlueprintProcessor();
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
      // Count total embeddings
      const { count, error } = await supabase
        .from('blueprint_text_embeddings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;
      setEmbeddingCount(count || 0);

      // Check if embeddings have facet metadata (semantic intelligence)
      if (count && count > 0) {
        const { data: facetCheck, error: facetError } = await supabase
          .from('blueprint_text_embeddings')
          .select('facet')
          .eq('user_id', userId)
          .not('facet', 'is', null)
          .limit(1);

        if (facetError) throw facetError;
        
        // If no facets found, these are legacy embeddings
        setHasLegacyEmbeddings(!facetCheck || facetCheck.length === 0);
      } else {
        setHasLegacyEmbeddings(false);
      }
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

  const handleUpgrade = async () => {
    try {
      console.log('🔄 ORACLE UPGRADE: Triggering force reprocess...');
      
      toast({
        title: "Upgrading Oracle Intelligence",
        description: "Clearing legacy embeddings and regenerating with semantic facets...",
      });

      // Trigger reprocessing with forceReprocess=true (edge function will handle deletion)
      await triggerProcessing(userId, true);
    } catch (error) {
      console.error('Failed to upgrade Oracle:', error);
      toast({
        title: "Upgrade Failed",
        description: error.message || 'Failed to upgrade Oracle intelligence',
        variant: "destructive"
      });
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

  // Show progress during processing
  if (isProcessing && currentJob) {
    return (
      <div className="flex flex-col gap-3 px-4 py-3 bg-primary/10 rounded-lg border border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div>
              <p className="text-sm font-medium text-primary">
                Upgrading Intelligence... {currentJob.progress_percentage}%
              </p>
              <p className="text-xs text-muted-foreground">
                {currentJob.current_step}
              </p>
            </div>
          </div>
          {currentJob.total_chunks > 0 && (
            <span className="text-xs text-muted-foreground">
              {currentJob.processed_chunks}/{currentJob.total_chunks} chunks
            </span>
          )}
        </div>
        <Progress value={currentJob.progress_percentage} className="h-2" />
      </div>
    );
  }

  // Legacy embeddings detected - show upgrade prompt
  if (hasLegacyEmbeddings && embeddingCount && embeddingCount > 0) {
    return (
      <div className="flex items-center justify-between gap-4 px-4 py-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <div>
            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
              Oracle: Legacy Mode ({embeddingCount} memories)
            </p>
            <p className="text-xs text-muted-foreground">
              Upgrade to semantic intelligence for 10x more personalized insights
            </p>
          </div>
        </div>
        <Button
          onClick={handleUpgrade}
          disabled={isProcessing}
          variant="default"
          size="sm"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Upgrading...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade Intelligence
            </>
          )}
        </Button>
      </div>
    );
  }

  // Modern embeddings with facets - full power
  if (embeddingCount && embeddingCount > 0 && !hasLegacyEmbeddings) {
    return (
      <div className="flex items-center justify-between gap-4 px-4 py-3 bg-primary/10 rounded-lg border border-primary/20">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            Oracle: Full Power ({embeddingCount} semantic memories)
          </span>
        </div>
        <Button
          onClick={handleUpgrade}
          disabled={isProcessing}
          variant="outline"
          size="sm"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Reprocessing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Force Reprocess
            </>
          )}
        </Button>
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
