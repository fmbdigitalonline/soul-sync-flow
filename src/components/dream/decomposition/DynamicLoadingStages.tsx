
import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Heart, Zap, Target, MapPin } from 'lucide-react';

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
}

export const DynamicLoadingStages: React.FC<DynamicLoadingStagesProps> = ({
  currentStageIndex,
  hasBeenLoadingLong,
  dreamTitle
}) => {
  const [dynamicTextIndex, setDynamicTextIndex] = useState(0);

  // Dynamic sub-messages that cycle within each stage
  const dynamicMessages = [
    "Interpreting the deeper symbolism...",
    "Connecting themes to your blueprint...", 
    "Weaving insights together...",
    "Discovering hidden patterns...",
    "Aligning with your soul's rhythm...",
    "Crafting your personalized pathway..."
  ];

  const reassuranceMessages = [
    `"${dreamTitle}" is a beautiful dream - deep ones take a moment to unfold`,
    "Your blueprint is rich with wisdom... we're honoring every detail",
    "Great dreams deserve thoughtful planning - almost there!",
    "The universe is conspiring to help you succeed... patience, dear soul"
  ];

  // Cycle through dynamic messages every 2.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setDynamicTextIndex(prev => (prev + 1) % dynamicMessages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {/* Main Dynamic Message */}
      <div className="flex items-center justify-center gap-3 min-h-[60px]">
        <div className="w-8 h-8 bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center animate-pulse">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <p className="text-gray-700 font-medium text-center transition-all duration-500 ease-in-out">
          {dynamicMessages[dynamicTextIndex]}
        </p>
      </div>

      {/* Floating Progress Dots */}
      <div className="flex justify-center space-x-2">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index <= dynamicTextIndex % 3 
                ? 'bg-soul-purple scale-110' 
                : 'bg-gray-300 scale-75'
            }`}
            style={{
              animationDelay: `${index * 200}ms`,
              animation: index <= dynamicTextIndex % 3 ? 'pulse 1.5s ease-in-out infinite' : 'none'
            }}
          />
        ))}
      </div>

      {/* Reassurance Message for Long Waits */}
      {hasBeenLoadingLong && (
        <div className="mt-6 p-4 bg-soul-purple/5 rounded-xl border border-soul-purple/10 animate-fade-in">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 text-soul-purple animate-pulse" />
            <p className="text-sm text-soul-purple font-medium italic">
              {reassuranceMessages[Math.floor(Date.now() / 10000) % reassuranceMessages.length]}
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
    </div>
  );
};
