
import { useState, useEffect } from 'react';

interface UseEnhancedLoadingLogicProps {
  currentStageIndex: number;
  totalStages: number;
}

export const useEnhancedLoadingLogic = ({
  currentStageIndex,
  totalStages
}: UseEnhancedLoadingLogicProps) => {
  const [loadingStartTime] = useState(Date.now());
  const [hasBeenLoadingLong, setHasBeenLoadingLong] = useState(false);
  const [showReassurance, setShowReassurance] = useState(false);
  const [dynamicProgress, setDynamicProgress] = useState(0);

  // Track long loading states
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setHasBeenLoadingLong(true);
    }, 8000); // 8 seconds

    const timer2 = setTimeout(() => {
      setShowReassurance(true);
    }, 12000); // 12 seconds

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Smooth progress animation
  useEffect(() => {
    const targetProgress = ((currentStageIndex + 1) / totalStages) * 100;
    
    const progressInterval = setInterval(() => {
      setDynamicProgress(prev => {
        const diff = targetProgress - prev;
        if (Math.abs(diff) < 0.5) return targetProgress;
        return prev + (diff * 0.1); // Smooth easing
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [currentStageIndex, totalStages]);

  const loadingDuration = Date.now() - loadingStartTime;

  return {
    hasBeenLoadingLong,
    showReassurance,
    dynamicProgress,
    loadingDuration
  };
};
