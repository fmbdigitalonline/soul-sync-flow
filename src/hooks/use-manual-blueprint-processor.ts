import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useManualBlueprintProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState<any>(null);

  const triggerProcessing = async (userId: string) => {
    setIsProcessing(true);
    setProcessingResult(null);

    try {
      console.log('🔥 MANUAL BOOTSTRAP: Triggering blueprint processing for user:', userId);
      
      const { data, error } = await supabase.functions.invoke('trigger-blueprint-processing', {
        body: { userId, forceReprocess: true }
      });

      if (error) {
        console.error('❌ MANUAL BOOTSTRAP: Failed to trigger processing', error);
        throw error;
      }

      console.log('✅ MANUAL BOOTSTRAP: Processing completed successfully', data);
      setProcessingResult(data);
      
      toast({
        title: "Blueprint Processing Complete",
        description: `Successfully processed ${data.embeddingCount} personality chunks`,
        variant: "default"
      });

      return data;
    } catch (error) {
      console.error('❌ MANUAL BOOTSTRAP: Processing failed', error);
      toast({
        title: "Processing Failed",
        description: error.message || 'Failed to process blueprint embeddings',
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    triggerProcessing,
    isProcessing,
    processingResult
  };
};