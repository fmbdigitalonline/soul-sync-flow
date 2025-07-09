import React from 'react';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { Button } from '@/components/ui/button';
import { Target, Zap, MessageCircle, Route, ArrowLeft } from 'lucide-react';
import { LifeDomain } from '@/types/growth-program';

interface LifeOperatingSystemChoicesProps {
  onChoiceSelect: (choice: 'quick_focus' | 'full_assessment' | 'guided_discovery' | 'progressive_journey') => void;
  onBack: () => void;
}

export function LifeOperatingSystemChoices({ onChoiceSelect, onBack }: LifeOperatingSystemChoicesProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        
        {/* Header with back button */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Growth Options
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Life Operating System
            </h1>
            <p className="text-gray-600 text-lg">
              Choose your preferred assessment approach
            </p>
          </div>
        </div>

        {/* Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Quick Focus Option */}
          <CosmicCard 
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1" 
            onClick={() => onChoiceSelect('quick_focus')}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick Focus</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Choose 1-3 life areas you want to focus on and get targeted insights.
                </p>
              </div>
              <div className="text-xs text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full">
                ⚡ 2-3 minutes
              </div>
            </div>
          </CosmicCard>

          {/* Full Assessment Option */}
          <CosmicCard 
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1" 
            onClick={() => onChoiceSelect('full_assessment')}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Full Assessment</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Comprehensive evaluation across all 7 life domains for complete insights.
                </p>
              </div>
              <div className="text-xs text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">
                🎯 5-7 minutes
              </div>
            </div>
          </CosmicCard>

          {/* Guided Discovery Option */}
          <CosmicCard 
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1" 
            onClick={() => onChoiceSelect('guided_discovery')}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Guided Discovery</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Conversational assessment with your AI coach guiding the process.
                </p>
              </div>
              <div className="text-xs text-purple-600 font-medium bg-purple-50 px-3 py-1 rounded-full">
                💬 Interactive
              </div>
            </div>
          </CosmicCard>

          {/* Progressive Journey Option */}
          <CosmicCard 
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1" 
            onClick={() => onChoiceSelect('progressive_journey')}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Route className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Progressive Journey</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Start with one area and gradually expand based on interconnections.
                </p>
              </div>
              <div className="text-xs text-indigo-600 font-medium bg-indigo-50 px-3 py-1 rounded-full">
                🛤️ Step-by-step
              </div>
            </div>
          </CosmicCard>

        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            All approaches lead to the same comprehensive dashboard and growth planning system
          </p>
        </div>

      </div>
    </div>
  );
}