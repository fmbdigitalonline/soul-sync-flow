import { useState, useEffect, useCallback } from 'react';
import { 
  getOrbPresenceController, 
  OrbPresenceState, 
  OrbPresenceMode,
  LoadingOperation 
} from '@/services/orb-presence-controller';

/**
 * React hook for accessing and controlling the orb presence system
 * Provides unified loading state management across the app
 */
export const useOrbPresence = () => {
  const [presenceState, setPresenceState] = useState<OrbPresenceState>({
    mode: 'floating',
    isThinking: false
  });
  
  const controller = getOrbPresenceController();

  // Subscribe to state changes
  useEffect(() => {
    const unsubscribe = controller.addListener((state) => {
      setPresenceState(state);
    });
    return unsubscribe;
  }, [controller]);

  // Control methods
  const setChatOpen = useCallback((isOpen: boolean) => {
    controller.setChatOpen(isOpen);
  }, [controller]);

  const startLoading = useCallback((operation: LoadingOperation, progress?: number) => {
    controller.startLoading(operation, progress);
  }, [controller]);

  const updateLoadingProgress = useCallback((operation: LoadingOperation, progress: number) => {
    controller.updateLoadingProgress(operation, progress);
  }, [controller]);

  const completeLoading = useCallback((operation: LoadingOperation) => {
    controller.completeLoading(operation);
  }, [controller]);

  // Convenience getters
  const isFloating = presenceState.mode === 'floating';
  const isChatAvatar = presenceState.mode === 'chat_avatar';
  const isCenterLoading = presenceState.mode === 'center_loading';

  return {
    // Full state
    presenceState,
    mode: presenceState.mode,
    loadingMessage: presenceState.loadingMessage,
    loadingProgress: presenceState.loadingProgress,
    activeOperation: presenceState.activeOperation,
    isThinking: presenceState.isThinking,
    
    // Convenience flags
    isFloating,
    isChatAvatar,
    isCenterLoading,
    
    // Control methods
    setChatOpen,
    startLoading,
    updateLoadingProgress,
    completeLoading,
    
    // Direct controller access (for advanced use)
    controller
  };
};

export type { OrbPresenceState, OrbPresenceMode, LoadingOperation };
