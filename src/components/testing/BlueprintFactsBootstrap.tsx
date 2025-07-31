import React from 'react';
import { Button } from '@/components/ui/button';
import { useManualBlueprintProcessor } from '@/hooks/use-manual-blueprint-processor';
import { retrievalSidecarService } from '@/services/retrieval-sidecar-service';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const BlueprintFactsBootstrap: React.FC = () => {
  const { triggerProcessing, isProcessing } = useManualBlueprintProcessor();
  const [isExtractingFacts, setIsExtractingFacts] = React.useState(false);
  const [isTestingRetrieval, setIsTestingRetrieval] = React.useState(false);

  const handleExtractFacts = async () => {
    setIsExtractingFacts(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to extract blueprint facts",
          variant: "destructive"
        });
        return;
      }

      console.log('🔧 BOOTSTRAP: Triggering blueprint facts ETL...');
      
      const { data, error } = await supabase.functions.invoke('blueprint-facts-etl', {
        body: { userId: user.user.id, forceReprocess: true }
      });

      if (error) {
        console.error('❌ BOOTSTRAP: Facts ETL failed', error);
        throw error;
      }

      console.log('✅ BOOTSTRAP: Facts ETL completed', data);
      toast({
        title: "Facts Extracted Successfully", 
        description: `Extracted ${data.factsCount} structured facts from your blueprint`,
        variant: "default"
      });

    } catch (error) {
      console.error('❌ BOOTSTRAP: Facts extraction failed', error);
      toast({
        title: "Facts Extraction Failed",
        description: error.message || 'Failed to extract blueprint facts',
        variant: "destructive"
      });
    } finally {
      setIsExtractingFacts(false);
    }
  };

  const handleTestRetrieval = async () => {
    setIsTestingRetrieval(true);
    try {
      console.log('🧪 BOOTSTRAP: Testing retrieval sidecar...');
      
      const result = await retrievalSidecarService.queryRetrieval(
        '465f1c5a-9054-478e-8337-d940072e0326',
        'what are my numerology numbers?',
        'companion'
      );

      console.log('🧪 BOOTSTRAP: Retrieval test result', result);
      
      toast({
        title: "Retrieval Test Complete",
        description: `Found ${result?.facts?.length || 0} facts and ${result?.passages?.length || 0} passages`,
        variant: "default"
      });

    } catch (error) {
      console.error('❌ BOOTSTRAP: Retrieval test failed', error);
      toast({
        title: "Retrieval Test Failed", 
        description: error.message || 'Failed to test retrieval',
        variant: "destructive"
      });
    } finally {
      setIsTestingRetrieval(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-background/90 backdrop-blur-sm border rounded-lg p-4 shadow-lg z-50">
      <h3 className="text-sm font-semibold mb-3">Retrieval Sidecar Bootstrap</h3>
      <div className="flex flex-col gap-2">
        <Button
          onClick={handleExtractFacts}
          disabled={isExtractingFacts}
          size="sm"
          variant="outline"
        >
          {isExtractingFacts ? 'Extracting Facts...' : 'Extract Blueprint Facts'}
        </Button>
        
        <Button
          onClick={handleTestRetrieval}
          disabled={isTestingRetrieval}
          size="sm"
          variant="outline"
        >
          {isTestingRetrieval ? 'Testing...' : 'Test Retrieval'}
        </Button>
        
        <Button
          onClick={triggerProcessing.bind(null, '465f1c5a-9054-478e-8337-d940072e0326')}
          disabled={isProcessing}
          size="sm"
          variant="outline"
        >
          {isProcessing ? 'Processing...' : 'Process Embeddings'}
        </Button>
      </div>
    </div>
  );
};