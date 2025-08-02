import { useState, useEffect, useCallback, useRef } from 'react';
import { LoadingCoordinator, LoadingSource, LoadingState, createLoadingCoordinator } from '@/services/loading-coordinator';

/**
 * React hook that provides coordinated loading state management
 * Eliminates race conditions between multiple loading sources
 */
export const useCoordinatedLoading = () => {
  const coordinatorRef = useRef<LoadingCoordinator | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize coordinator
  useEffect(() => {
    coordinatorRef.current = createLoadingCoordinator();
    
    // Listen to state changes
    const unsubscribe = coordinatorRef.current.addListener((state) => {
      setLoadingState(state);
      setIsLoading(coordinatorRef.current!.getEffectiveLoadingState());
    });

    return () => {
      unsubscribe();
      coordinatorRef.current?.destroy();
    };
  }, []);

  // Start a loading operation
  const startLoading = useCallback((source: LoadingSource): AbortController => {
    if (!coordinatorRef.current) {
      throw new Error('LoadingCoordinator not initialized');
    }
    return coordinatorRef.current.startOperation(source);
  }, []);

  // Complete a loading operation
  const completeLoading = useCallback((source: LoadingSource): void => {
    coordinatorRef.current?.completeOperation(source);
  }, []);

  // Force recovery from stuck state
  const forceRecovery = useCallback((): void => {
    coordinatorRef.current?.forceRecovery();
  }, []);

  // Get current active operations
  const getActiveOperations = useCallback((): LoadingSource[] => {
    return coordinatorRef.current?.getActiveOperations() || [];
  }, []);

  return {
    loadingState,
    isLoading,
    startLoading,
    completeLoading,
    forceRecovery,
    getActiveOperations
  };
};