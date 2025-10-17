import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ProcessingJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress_percentage: number;
  current_step: string;
  processed_chunks: number;
  total_chunks: number;
  error_message?: string;
}

export const useManualBlueprintProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState<any>(null);
  const [currentJob, setCurrentJob] = useState<ProcessingJob | null>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Poll for job status
  const pollJobStatus = async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .from('embedding_processing_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;

      setCurrentJob(data as ProcessingJob);

      if (data.status === 'completed') {
        console.log('✅ Job completed:', data);
        setProcessingResult({ embeddingCount: data.processed_chunks });
        setIsProcessing(false);
        
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
          pollingInterval.current = null;
        }

        toast({
          title: "Blueprint Processing Complete",
          description: `Successfully processed ${data.processed_chunks} personality chunks`,
          variant: "default"
        });
      } else if (data.status === 'failed') {
        console.error('❌ Job failed:', data.error_message);
        setIsProcessing(false);
        
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
          pollingInterval.current = null;
        }

        toast({
          title: "Processing Failed",
          description: data.error_message || 'Failed to process blueprint embeddings',
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to poll job status:', error);
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  const triggerProcessing = async (userId: string, forceReprocess: boolean = false) => {
    setIsProcessing(true);
    setProcessingResult(null);
    setCurrentJob(null);

    try {
      console.log('🔥 ASYNC BOOTSTRAP: Triggering blueprint processing for user:', userId, 'forceReprocess:', forceReprocess);
      
      const { data, error } = await supabase.functions.invoke('process-blueprint-embeddings-v3', {
        body: { userId, forceReprocess }
      });

      if (error) {
        console.error('❌ ASYNC BOOTSTRAP: Failed to trigger processing', error);
        throw error;
      }

      console.log('✅ ASYNC BOOTSTRAP: Background processing started', data);

      // Start polling for job status
      if (data.jobId) {
        pollingInterval.current = setInterval(() => {
          pollJobStatus(data.jobId);
        }, 2000); // Poll every 2 seconds

        // Initial poll
        pollJobStatus(data.jobId);
      }

      return data;
    } catch (error) {
      console.error('❌ ASYNC BOOTSTRAP: Processing failed', error);
      setIsProcessing(false);
      toast({
        title: "Processing Failed",
        description: error.message || 'Failed to start blueprint processing',
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    triggerProcessing,
    isProcessing,
    processingResult,
    currentJob
  };
};