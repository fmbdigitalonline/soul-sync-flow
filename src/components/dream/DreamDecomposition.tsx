
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Target, Calendar, Tag, Sparkles } from 'lucide-react';

interface Dream {
  id: string;
  title: string;
  description: string;
  category: string;
  timeframe: string;
  importance_level: string;
  created_at: string;
}

interface DreamDecompositionProps {
  dream: Dream;
  onBack: () => void;
}

export const DreamDecomposition: React.FC<DreamDecompositionProps> = ({ dream, onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-soul-purple/5 via-white to-soul-teal/5 mobile-container">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="font-inter"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dreams
          </Button>
        </div>

        {/* Dream Overview */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h1 className="font-cormorant text-3xl font-bold text-gray-800">
                {dream.title}
              </h1>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-soul-purple" />
                <span className="font-inter text-sm font-medium text-soul-purple capitalize">
                  {dream.importance_level} Priority
                </span>
              </div>
            </div>
            
            <p className="font-inter text-gray-600 leading-relaxed">
              {dream.description}
            </p>
            
            <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <span className="font-inter text-sm text-gray-600 capitalize">
                  {dream.category?.replace('_', ' ')}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-inter text-sm text-gray-600">
                  Target: {dream.timeframe}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Dream Analysis Coming Soon */}
        <Card className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center mx-auto">
              <Target className="h-8 w-8 text-white" />
            </div>
            
            <h2 className="font-cormorant text-xl font-semibold text-gray-800">
              Dream Analysis & Roadmap
            </h2>
            
            <p className="font-inter text-gray-600 max-w-md mx-auto">
              Your personalized dream decomposition and action plan will appear here soon. 
              This will include step-by-step guidance tailored to your unique blueprint.
            </p>
            
            <Button className="font-cormorant bg-gradient-to-r from-soul-purple to-soul-teal text-white">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Analysis
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
