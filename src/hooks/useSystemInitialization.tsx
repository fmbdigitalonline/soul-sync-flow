import { useState, useEffect, useCallback, useRef } from 'react';
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
  const startTimeRef = useRef(Date.now());

  const setPhase = useCallback((phase: SystemPhase, error?: string) => {
    console.log(`🔧 SystemInit: Phase transition to ${phase}`, { error });
    setState(prev => ({
      ...prev,
      phase,
      error: error || null,
      isReady: phase === 'ready',
      initializationTime: phase === 'ready' ? Date.now() - startTimeRef.current : null,
    }));
  }, []);

  useEffect(() => {
    console.log('🔧 SystemInit: Starting initialization sequence');
    
    // Reset start time for this initialization
    startTimeRef.current = Date.now();
    
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
      
      // Add error handling and cleanup for timeout
      const timeoutId = setTimeout(() => {
        try {
          setPhase('ready');
          console.log('🔧 SystemInit: System ready for user interaction');
        } catch (error) {
          console.error('🔧 SystemInit: Error during setup completion:', error);
          setPhase('error', 'Setup timeout failed');
        }
      }, 100);

      // Failsafe: Force ready state after 5 seconds max
      const failsafeId = setTimeout(() => {
        console.warn('🔧 SystemInit: Failsafe activated - forcing ready state');
        setPhase('ready');
      }, 5000);

      return () => {
        clearTimeout(timeoutId);
        clearTimeout(failsafeId);
      };
    } else {
      console.log('🔧 SystemInit: No user, system ready for guest interaction');
      setPhase('ready');
    }
  }, [user, authLoading]);

  const reinitialize = useCallback(() => {
    console.log('🔧 SystemInit: Manual reinitialization requested');
    startTimeRef.current = Date.now();
    setPhase('initializing');
  }, []);

  const forceReady = useCallback(() => {
    console.log('🔧 SystemInit: Force ready state requested');
    setPhase('ready');
  }, []);

  return {
    ...state,
    reinitialize,
    forceReady,
    isAuthenticatedAndReady: state.isReady && !!user,
    isGuestAndReady: state.isReady && !user,
  };
}