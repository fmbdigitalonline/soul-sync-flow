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
  const initializationLockRef = useRef(false);
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());

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

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current.clear();
  }, []);

  const addTimeout = useCallback((callback: () => void, delay: number) => {
    const timeoutId = setTimeout(() => {
      timeoutsRef.current.delete(timeoutId);
      callback();
    }, delay);
    timeoutsRef.current.add(timeoutId);
    return timeoutId;
  }, []);

  useEffect(() => {
    // StrictMode-safe initialization: prevent double initialization
    if (initializationLockRef.current) {
      console.log('🔧 SystemInit: Initialization already in progress (StrictMode detected)');
      return;
    }

    console.log('🔧 SystemInit: Starting initialization sequence');
    initializationLockRef.current = true;
    
    // Clear any existing timeouts
    clearAllTimeouts();
    
    // Reset start time for this initialization
    startTimeRef.current = Date.now();
    
    // Phase 1: Auth check
    setPhase('auth-check');
    
    if (authLoading) {
      console.log('🔧 SystemInit: Waiting for auth state...');
      initializationLockRef.current = false;
      return;
    }

    // Phase 2: User setup (if authenticated)
    if (user) {
      console.log('🔧 SystemInit: User authenticated, setting up user context');
      setPhase('user-setup');
      
      // Add error handling and cleanup for timeout
      addTimeout(() => {
        try {
          setPhase('ready');
          console.log('🔧 SystemInit: System ready for user interaction');
          initializationLockRef.current = false;
        } catch (error) {
          console.error('🔧 SystemInit: Error during setup completion:', error);
          setPhase('error', 'Setup timeout failed');
          initializationLockRef.current = false;
        }
      }, 100);

      // Failsafe: Force ready state after 5 seconds max
      addTimeout(() => {
        console.warn('🔧 SystemInit: Failsafe activated - forcing ready state');
        setPhase('ready');
        initializationLockRef.current = false;
      }, 5000);

    } else {
      console.log('🔧 SystemInit: No user, system ready for guest interaction');
      setPhase('ready');
      initializationLockRef.current = false;
    }

    // Cleanup function
    return () => {
      clearAllTimeouts();
      initializationLockRef.current = false;
    };
  }, [user, authLoading, clearAllTimeouts, addTimeout, setPhase]);

  const reinitialize = useCallback(() => {
    console.log('🔧 SystemInit: Manual reinitialization requested');
    clearAllTimeouts();
    initializationLockRef.current = false;
    startTimeRef.current = Date.now();
    setPhase('initializing');
  }, [clearAllTimeouts, setPhase]);

  const forceReady = useCallback(() => {
    console.log('🔧 SystemInit: Force ready state requested');
    clearAllTimeouts();
    initializationLockRef.current = false;
    setPhase('ready');
  }, [clearAllTimeouts, setPhase]);

  return {
    ...state,
    reinitialize,
    forceReady,
    isAuthenticatedAndReady: state.isReady && !!user,
    isGuestAndReady: state.isReady && !user,
  };
}