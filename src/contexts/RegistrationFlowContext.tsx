import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

type RegistrationFlowState = {
  isInOnboardingFlow: boolean;
  hasCompletedOnboarding: boolean;
  onboardingStartTime: string | null;
  currentStep: 'auth' | 'onboarding' | 'blueprint-generation' | 'complete' | null;
};

type RegistrationFlowContextType = {
  flowState: RegistrationFlowState;
  startOnboardingFlow: () => void;
  completeOnboardingFlow: () => void;
  setCurrentStep: (step: RegistrationFlowState['currentStep']) => void;
  clearFlowState: () => void;
  isNavigationSafe: () => boolean;
};

const RegistrationFlowContext = createContext<RegistrationFlowContextType | undefined>(undefined);

const STORAGE_KEY = 'registration_flow_state';

const defaultState: RegistrationFlowState = {
  isInOnboardingFlow: false,
  hasCompletedOnboarding: false,
  onboardingStartTime: null,
  currentStep: null,
};

export function RegistrationFlowProvider({ children }: { children: React.ReactNode }) {
  const [flowState, setFlowState] = useState<RegistrationFlowState>(defaultState);
  const { user, loading: authLoading } = useAuth();

  // Initialize flow state from session storage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedState = JSON.parse(stored);
        console.log('🔄 RegistrationFlow: Restored state from session storage', parsedState);
        setFlowState(parsedState);
      } catch (error) {
        console.error('🔄 RegistrationFlow: Failed to parse stored state', error);
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Persist flow state to session storage whenever it changes
  useEffect(() => {
    if (flowState !== defaultState) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(flowState));
      console.log('🔄 RegistrationFlow: Saved state to session storage', flowState);
    }
  }, [flowState]);

  // Clear flow state if user signs out
  useEffect(() => {
    if (!authLoading && !user && flowState !== defaultState) {
      console.log('🔄 RegistrationFlow: User signed out, clearing flow state');
      clearFlowState();
    }
  }, [user, authLoading]);

  const startOnboardingFlow = () => {
    console.log('🔄 RegistrationFlow: Starting onboarding flow');
    setFlowState({
      isInOnboardingFlow: true,
      hasCompletedOnboarding: false,
      onboardingStartTime: new Date().toISOString(),
      currentStep: 'onboarding',
    });
  };

  const completeOnboardingFlow = () => {
    console.log('🔄 RegistrationFlow: Completing onboarding flow');
    setFlowState(prev => ({
      ...prev,
      isInOnboardingFlow: false,
      hasCompletedOnboarding: true,
      currentStep: 'complete',
    }));
    
    // Clean up session storage after successful completion
    setTimeout(() => {
      sessionStorage.removeItem(STORAGE_KEY);
      console.log('🔄 RegistrationFlow: Cleaned up session storage after completion');
    }, 1000);
  };

  const setCurrentStep = (step: RegistrationFlowState['currentStep']) => {
    console.log('🔄 RegistrationFlow: Setting current step to', step);
    setFlowState(prev => ({ ...prev, currentStep: step }));
  };

  const clearFlowState = () => {
    console.log('🔄 RegistrationFlow: Clearing flow state');
    setFlowState(defaultState);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const isNavigationSafe = () => {
    // Navigation is safe if not in active onboarding flow or if onboarding is completed
    const safe = !flowState.isInOnboardingFlow || flowState.hasCompletedOnboarding;
    console.log('🔄 RegistrationFlow: Navigation safety check', { safe, flowState });
    return safe;
  };

  return (
    <RegistrationFlowContext.Provider 
      value={{ 
        flowState, 
        startOnboardingFlow, 
        completeOnboardingFlow, 
        setCurrentStep, 
        clearFlowState,
        isNavigationSafe 
      }}
    >
      {children}
    </RegistrationFlowContext.Provider>
  );
}

export function useRegistrationFlow() {
  const context = useContext(RegistrationFlowContext);
  if (context === undefined) {
    throw new Error("useRegistrationFlow must be used within a RegistrationFlowProvider");
  }
  return context;
}