import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { retrievalSidecarService, RetrievalResult } from '@/services/retrieval-sidecar-service';
import { useToast } from '@/hooks/use-toast';

export const useRetrievalSidecar = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<any>(null);

  const queryRetrieval = useCallback(async (
    query: string, 
    mode: string = 'companion'
  ): Promise<RetrievalResult | null> => {
    if (!user?.id) {
      console.warn('⚠️ No user authenticated for retrieval query');
      return null;
    }

    setIsLoading(true);
    try {
      const result = await retrievalSidecarService.queryRetrieval(user.id, query, mode);
      return result;
    } catch (error) {
      console.error('❌ Retrieval query failed:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const extractFacts = useCallback(async (forceReprocess: boolean = false) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to extract blueprint facts.",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);
    try {
      const success = await retrievalSidecarService.extractBlueprintFacts(user.id, forceReprocess);
      
      if (success) {
        toast({
          title: "Facts Extracted",
          description: "Your blueprint facts have been processed and are ready for enhanced retrieval.",
        });
      } else {
        toast({
          title: "Extraction Failed",
          description: "There was an issue extracting your blueprint facts. Please try again.",
          variant: "destructive"
        });
      }
      
      return success;
    } catch (error) {
      console.error('❌ Facts extraction failed:', error);
      toast({
        title: "Extraction Error",
        description: "An unexpected error occurred during facts extraction.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast]);

  const loadConfig = useCallback(async () => {
    if (!user?.id) return;

    try {
      const userConfig = await retrievalSidecarService.getRetrievalConfig(user.id);
      setConfig(userConfig);
      return userConfig;
    } catch (error) {
      console.error('❌ Failed to load retrieval config:', error);
      return null;
    }
  }, [user?.id]);

  const updateConfig = useCallback(async (updates: any) => {
    if (!user?.id) return null;

    setIsLoading(true);
    try {
      const updatedConfig = await retrievalSidecarService.updateRetrievalConfig(user.id, updates);
      setConfig(updatedConfig);
      
      if (updatedConfig) {
        toast({
          title: "Settings Updated",
          description: "Your retrieval preferences have been saved.",
        });
      }
      
      return updatedConfig;
    } catch (error) {
      console.error('❌ Failed to update retrieval config:', error);
      toast({
        title: "Update Failed",
        description: "Could not save your retrieval settings. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast]);

  const toggleSidecar = useCallback((enabled: boolean) => {
    if (enabled) {
      retrievalSidecarService.enableSidecar();
    } else {
      retrievalSidecarService.disableSidecar();
    }
    
    toast({
      title: enabled ? "Sidecar Enabled" : "Sidecar Disabled",
      description: `Enhanced retrieval is now ${enabled ? 'active' : 'disabled'}.`,
    });
  }, [toast]);

  return {
    queryRetrieval,
    extractFacts,
    loadConfig,
    updateConfig,
    toggleSidecar,
    isLoading,
    config,
    isEnabled: retrievalSidecarService.isEnabled(),
    user: user?.id
  };
};