
import React from 'react';
import { SoulOrb } from '@/components/ui/soul-orb';
import { Sparkles } from 'lucide-react';

interface CelebrationHeaderProps {
  speaking: boolean;
  celebrationComplete: boolean;
  goalTitle: string;
}

export const CelebrationHeader: React.FC<CelebrationHeaderProps> = ({
  speaking,
  celebrationComplete,
  goalTitle
}) => {
  return (
    <div className="text-center space-y-4">
      <div className="relative">
        <SoulOrb 
          speaking={speaking}
          stage="complete"
          size="lg"
          pulse={true}
        />
        {celebrationComplete && (
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center animate-bounce">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
      
      <div>
        <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-soul-purple to-soul-teal bg-clip-text text-transparent">
          🎯 Your Dream Journey is Ready!
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          I've transformed "{goalTitle}" into a personalized, step-by-step roadmap that honors your unique soul blueprint
        </p>
      </div>
    </div>
  );
};
