import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { assistanceResponsePersistenceService } from '@/services/assistance-response-persistence-service';
import { AssistanceResponse } from '@/services/interactive-assistance-service';
import { toast } from 'sonner';

export function useAssistanceResponsePersistence(
  taskId: string,
  instructionId: string
) {
  const [responses, setResponses] = useState<AssistanceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResponses = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setResponses([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const loaded = await assistanceResponsePersistenceService.loadAssistanceResponses(
        user.id,
        taskId,
        instructionId
      );
      
      setResponses(loaded);
    } catch (err) {
      console.error('[useAssistanceResponsePersistence] Load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load assistance responses');
    } finally {
      setIsLoading(false);
    }
  }, [taskId, instructionId]);

  useEffect(() => {
    loadResponses();
  }, [loadResponses]);

  const saveResponse = useCallback(async (response: AssistanceResponse): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('You must be logged in to save assistance responses');
      return null;
    }

    try {
      const dbId = await assistanceResponsePersistenceService.saveAssistanceResponse(
        user.id,
        taskId,
        instructionId,
        response
      );

      // Add to local state with dbId
      setResponses(prev => [...prev, { ...response, dbId }]);
      
      return dbId;
    } catch (err) {
      console.error('[useAssistanceResponsePersistence] Save error:', err);
      toast.error('Failed to save assistance response');
      throw err;
    }
  }, [taskId, instructionId]);

  const deleteResponse = useCallback(async (dbId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    try {
      await assistanceResponsePersistenceService.deleteResponse(user.id, dbId);
      
      // Remove from local state
      setResponses(prev => prev.filter(r => r.dbId !== dbId));
      
      toast.success('Help panel removed');
    } catch (err) {
      console.error('[useAssistanceResponsePersistence] Delete error:', err);
      toast.error('Failed to delete assistance response');
      throw err;
    }
  }, []);

  const clearAllResponses = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    try {
      await assistanceResponsePersistenceService.deleteResponsesForInstruction(
        user.id,
        taskId,
        instructionId
      );
      
      setResponses([]);
      toast.success('All help panels cleared');
    } catch (err) {
      console.error('[useAssistanceResponsePersistence] Clear error:', err);
      toast.error('Failed to clear assistance responses');
      throw err;
    }
  }, [taskId, instructionId]);

  return {
    responses,
    isLoading,
    error,
    saveResponse,
    deleteResponse,
    clearAllResponses,
    refreshResponses: loadResponses
  };
}
