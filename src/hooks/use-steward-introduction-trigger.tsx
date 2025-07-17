
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStewardIntroduction } from '@/contexts/StewardIntroductionContext';
import { useAuth } from '@/contexts/AuthContext';

export const useStewardIntroductionTrigger = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    isIntroductionNeeded,
    showIntroduction,
    currentStep,
    startIntroduction,
    dismissIntroduction
  } = useStewardIntroduction();

  // Trigger introduction when user lands on homepage after onboarding
  useEffect(() => {
    if (
      user &&
      isIntroductionNeeded &&
      !showIntroduction &&
      location.pathname === '/' &&
      location.state?.fromOnboarding
    ) {
      // Small delay to ensure page is loaded
      const timer = setTimeout(() => {
        startIntroduction();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user, isIntroductionNeeded, showIntroduction, location, startIntroduction]);

  // Handle completion - navigate to home when complete
  useEffect(() => {
    if (currentStep === 'complete' && showIntroduction) {
      const timer = setTimeout(() => {
        dismissIntroduction();
        // Clear the fromOnboarding state to prevent re-triggering
        navigate('/', { replace: true, state: {} });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [currentStep, showIntroduction, dismissIntroduction, navigate]);

  return {
    isIntroductionActive: showIntroduction,
    introductionStep: currentStep,
  };
};
