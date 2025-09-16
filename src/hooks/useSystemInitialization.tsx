import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type SystemPhase = 'initializing' | 'auth-check' | 'user-setup' | 'ready' | 'error';

interface SystemInitializationState {
  phase: SystemPhase;
  isReady: boolean;
  error: string | null;
  initializationTime: number | null;
}

export function useSystemInitialization() {
  const [state, setState] = useState<SystemInitializationState>({
    phase: 'initializing',
    isReady: false,
    error: null,
    initializationTime: null,
  });
  
  const { user, loading: authLoading } = useAuth();
  const startTime = Date.now();

  const setPhase = useCallback((phase: SystemPhase, error?: string) => {
    console.log(`🔧 SystemInit: Phase transition to ${phase}`, { error });
    setState(prev => ({
      ...prev,
      phase,
      error: error || null,
      isReady: phase === 'ready',
      initializationTime: phase === 'ready' ? Date.now() - startTime : null,
    }));
  }, [startTime]);

  useEffect(() => {
    console.log('🔧 SystemInit: Starting initialization sequence');
    
    // Phase 1: Auth check
    setPhase('auth-check');
    
    if (authLoading) {
      console.log('🔧 SystemInit: Waiting for auth state...');
      return;
    }

    // Phase 2: User setup (if authenticated)
    if (user) {
      console.log('🔧 SystemInit: User authenticated, setting up user context');
      setPhase('user-setup');
      
      // Simulate brief setup time to prevent race conditions
      setTimeout(() => {
        setPhase('ready');
        console.log('🔧 SystemInit: System ready for user interaction');
      }, 100);
    } else {
      console.log('🔧 SystemInit: No user, system ready for guest interaction');
      setPhase('ready');
    }
  }, [user, authLoading, setPhase]);

  const reinitialize = useCallback(() => {
    console.log('🔧 SystemInit: Manual reinitialization requested');
    setPhase('initializing');
  }, [setPhase]);

  return {
    ...state,
    reinitialize,
    isAuthenticatedAndReady: state.isReady && !!user,
    isGuestAndReady: state.isReady && !user,
  };
}