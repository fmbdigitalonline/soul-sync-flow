
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

  // Track long loading states with more granular feedback
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setHasBeenLoadingLong(true);
      console.log('⏰ Loading has taken longer than expected (8s)', {
        currentStage: currentStageIndex,
        totalTime: Date.now() - loadingStartTime
      });
    }, 8000); // 8 seconds

    const timer2 = setTimeout(() => {
      setShowReassurance(true);
      console.log('💬 Showing reassurance message (15s)', {
        currentStage: currentStageIndex,
        totalTime: Date.now() - loadingStartTime
      });
    }, 15000); // 15 seconds

    const timer3 = setTimeout(() => {
      setShowTechnicalDetails(true);
      console.log('🔧 Showing technical details (60s)', {
        currentStage: currentStageIndex,
        totalTime: Date.now() - loadingStartTime
      });
    }, 60000); // 1 minute

    // Log milestone timings
    const timer4 = setTimeout(() => {
      console.log('⚠️ LONG PROCESSING DETECTED (2 minutes)', {
        currentStage: currentStageIndex,
        totalTime: Date.now() - loadingStartTime,
        suggestion: 'Consider implementing retry logic or fallback'
      });
    }, 120000); // 2 minutes

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [loadingStartTime, currentStageIndex]);

  // Smooth progress animation with acceleration for long waits
  useEffect(() => {
    const targetProgress = ((currentStageIndex + 1) / totalStages) * 100;
    const currentTime = Date.now();
    const elapsedTime = currentTime - loadingStartTime;
    
    // Accelerate progress for very long waits to show activity
    const accelerationFactor = elapsedTime > 60000 ? 0.2 : 0.1;
    
    const progressInterval = setInterval(() => {
      setDynamicProgress(prev => {
        const diff = targetProgress - prev;
        if (Math.abs(diff) < 0.5) return targetProgress;
        return prev + (diff * accelerationFactor);
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [currentStageIndex, totalStages, loadingStartTime]);

  const loadingDuration = Date.now() - loadingStartTime;

  // Log performance metrics every 30 seconds
  useEffect(() => {
    const performanceLogger = setInterval(() => {
      const elapsed = Date.now() - loadingStartTime;
      console.log('📊 Decomposition Performance Metrics', {
        elapsedSeconds: Math.floor(elapsed / 1000),
        currentStage: currentStageIndex + 1,
        totalStages,
        progressPercent: Math.round(dynamicProgress),
        hasBeenLoadingLong,
        showReassurance,
        timestamp: new Date().toISOString()
      });
    }, 30000);

    return () => clearInterval(performanceLogger);
  }, [loadingStartTime, currentStageIndex, totalStages, dynamicProgress, hasBeenLoadingLong, showReassurance]);

  return {
    hasBeenLoadingLong,
    showReassurance,
    showTechnicalDetails,
    dynamicProgress,
    loadingDuration,
    loadingStartTime
  };
};
