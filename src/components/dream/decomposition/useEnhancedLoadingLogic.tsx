
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
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [dynamicProgress, setDynamicProgress] = useState(0);

  // Track long loading states with better logging
  useEffect(() => {
    console.log('🕐 Enhanced loading logic initialized:', {
      currentStage: currentStageIndex,
      totalStages,
      startTime: loadingStartTime
    });

    const timer1 = setTimeout(() => {
      setHasBeenLoadingLong(true);
      console.log('⏰ Loading has taken longer than expected (8s)', {
        currentStage: currentStageIndex,
        totalTime: Date.now() - loadingStartTime
      });
    }, 8000);

    const timer2 = setTimeout(() => {
      setShowReassurance(true);
      console.log('💬 Showing reassurance message (15s)', {
        currentStage: currentStageIndex,
        totalTime: Date.now() - loadingStartTime
      });
    }, 15000);

    const timer3 = setTimeout(() => {
      setShowTechnicalDetails(true);
      console.log('🔧 Showing technical details (60s)', {
        currentStage: currentStageIndex,
        totalTime: Date.now() - loadingStartTime
      });
    }, 60000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [loadingStartTime, currentStageIndex, totalStages]);

  // Smooth progress animation with better stage tracking
  useEffect(() => {
    const targetProgress = ((currentStageIndex + 1) / totalStages) * 100;
    
    console.log('📊 Progress update:', {
      currentStage: currentStageIndex,
      targetProgress,
      currentProgress: dynamicProgress
    });
    
    const progressInterval = setInterval(() => {
      setDynamicProgress(prev => {
        const diff = targetProgress - prev;
        if (Math.abs(diff) < 0.5) return targetProgress;
        return prev + (diff * 0.1);
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [currentStageIndex, totalStages, dynamicProgress]);

  const loadingDuration = Date.now() - loadingStartTime;

  return {
    hasBeenLoadingLong,
    showReassurance,
    showTechnicalDetails,
    dynamicProgress,
    loadingDuration,
    loadingStartTime
  };
};
