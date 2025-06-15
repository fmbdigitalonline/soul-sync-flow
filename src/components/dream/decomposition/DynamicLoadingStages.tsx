
import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Heart, Zap, Target, MapPin, Clock, AlertCircle } from 'lucide-react';

interface LoadingStage {
  id: string;
  message: string;
  icon: React.ReactNode;
  duration: number;
  isReassurance?: boolean;
}

interface DynamicLoadingStagesProps {
  currentStageIndex: number;
  hasBeenLoadingLong: boolean;
  dreamTitle: string;
  processingStartTime?: number;
  aiProcessingTime?: number | null;
}

export const DynamicLoadingStages: React.FC<DynamicLoadingStagesProps> = ({
  currentStageIndex,
  hasBeenLoadingLong,
  dreamTitle,
  processingStartTime,
  aiProcessingTime
}) => {
  const [dynamicTextIndex, setDynamicTextIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every second for real-time duration display
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Dynamic sub-messages that cycle within each stage
  const dynamicMessages = [
    "Interpreting the deeper symbolism...",
    "Connecting themes to your blueprint...", 
    "Weaving insights together...",
    "Discovering hidden patterns...",
    "Aligning with your soul's rhythm...",
    "Crafting your personalized pathway...",
    "Processing through AI coach...",
    "Generating milestone structure...",
    "Creating task breakdowns...",
    "Applying blueprint insights..."
  ];

  const reassuranceMessages = [
    `"${dreamTitle}" is a beautiful dream - deep ones take a moment to unfold`,
    "Your blueprint is rich with wisdom... we're honoring every detail",
    "Great dreams deserve thoughtful planning - almost there!",
    "The universe is conspiring to help you succeed... patience, dear soul",
    "Complex goals require deeper AI analysis - this ensures better results",
    "Your personalized journey is being crafted with extra care"
  ];

  // More frequent cycling for better perceived progress
  useEffect(() => {
    const interval = setInterval(() => {
      setDynamicTextIndex(prev => (prev + 1) % dynamicMessages.length);
    }, 2000); // Faster cycling

    return () => clearInterval(interval);
  }, []);

  // Calculate processing duration
  const processingDuration = processingStartTime ? Math.floor((currentTime - processingStartTime) / 1000) : 0;
  const isLongProcessing = processingDuration > 60; // More than 1 minute

  return (
    <div className="space-y-4">
      {/* Processing Duration Display */}
      {processingStartTime && (
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>Processing for {processingDuration}s</span>
          {aiProcessingTime && (
            <span className="text-soul-purple">• AI: {Math.floor(aiProcessingTime / 1000)}s</span>
          )}
        </div>
      )}

      {/* Main Dynamic Message */}
      <div className="flex items-center justify-center gap-3 min-h-[60px]">
        <div className="w-8 h-8 bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center animate-pulse">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <p className="text-gray-700 font-medium text-center transition-all duration-500 ease-in-out">
          {dynamicMessages[dynamicTextIndex]}
        </p>
      </div>

      {/* Enhanced Progress Dots with Speed Indication */}
      <div className="flex justify-center space-x-2">
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index <= dynamicTextIndex % 5 
                ? 'bg-soul-purple scale-110' 
                : 'bg-gray-300 scale-75'
            }`}
            style={{
              animationDelay: `${index * 100}ms`,
              animation: index <= dynamicTextIndex % 5 
                ? isLongProcessing 
                  ? 'pulse 2s ease-in-out infinite' 
                  : 'pulse 1s ease-in-out infinite'
                : 'none'
            }}
          />
        ))}
      </div>

      {/* Long Processing Warning */}
      {isLongProcessing && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl animate-fade-in">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-amber-800 font-medium">Complex dream detected</p>
              <p className="text-amber-700 text-xs mt-1">
                Rich goals require deeper AI analysis. We're ensuring the highest quality personalization for you.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reassurance Message for Long Waits */}
      {hasBeenLoadingLong && (
        <div className="mt-6 p-4 bg-soul-purple/5 rounded-xl border border-soul-purple/10 animate-fade-in">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 text-soul-purple animate-pulse" />
            <p className="text-sm text-soul-purple font-medium italic">
              {reassuranceMessages[Math.floor(Date.now() / 8000) % reassuranceMessages.length]}
            </p>
          </div>
        </div>
      )}

      {/* Dream Insight Tip */}
      <div className="text-center mt-4">
        <p className="text-xs text-gray-500 italic">
          💫 The deeper the dream, the richer the journey ahead
        </p>
      </div>

      {/* Technical Details for Long Processing (Debug) */}
      {isLongProcessing && processingDuration > 120 && (
        <div className="mt-4 p-2 bg-gray-50 rounded-lg">
          <details className="text-xs text-gray-600">
            <summary className="cursor-pointer hover:text-gray-800">Processing details</summary>
            <div className="mt-2 space-y-1">
              <p>Total time: {processingDuration}s</p>
              <p>AI processing: {aiProcessingTime ? `${Math.floor(aiProcessingTime / 1000)}s` : 'In progress...'}</p>
              <p>Stage: {currentStageIndex + 1}/4</p>
              <p>Status: {aiProcessingTime ? 'AI completed, finalizing...' : 'AI processing...'}</p>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};
