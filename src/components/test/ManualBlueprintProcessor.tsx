import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useManualBlueprintProcessor } from '@/hooks/use-manual-blueprint-processor';
import { useState } from 'react';

export const ManualBlueprintProcessor = () => {
  const { triggerProcessing, isProcessing, processingResult } = useManualBlueprintProcessor();
  const [userId] = useState('465f1c5a-9054-478e-8337-d940072e0326'); // Target user ID
  const [forceReprocess, setForceReprocess] = useState(true); // Default to true for testing

  const handleTriggerProcessing = async () => {
    try {
      await triggerProcessing(userId, forceReprocess);
    } catch (error) {
      console.error('Processing failed:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Manual Blueprint Processing</CardTitle>
        <CardDescription>
          Phase 1: Bootstrap the embedding pipeline for user {userId}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
          <Checkbox 
            id="force-reprocess" 
            checked={forceReprocess}
            onCheckedChange={(checked) => setForceReprocess(checked === true)}
          />
          <label
            htmlFor="force-reprocess"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Force Reprocess (Delete existing embeddings)
          </label>
        </div>

        <Button 
          onClick={handleTriggerProcessing}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? 'Processing Blueprint...' : 'Execute process-blueprint-embeddings-v3'}
        </Button>

        {processingResult && (
          <div className="mt-4 p-4 bg-secondary rounded-lg">
            <h3 className="font-semibold text-green-600 mb-2">✅ Processing Complete</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Created {processingResult.embeddingCount} personality embeddings
            </p>
            
            {processingResult.embeddings && (
              <div className="space-y-2">
                <h4 className="font-medium">Sample Chunks:</h4>
                {processingResult.embeddings.map((embedding: any, index: number) => (
                  <div key={embedding.id} className="text-xs bg-background p-2 rounded border">
                    <div className="font-mono text-primary">{embedding.id}</div>
                    <div className="text-muted-foreground">{embedding.preview}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};