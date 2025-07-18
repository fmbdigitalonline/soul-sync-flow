
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Target, Calendar, Star } from 'lucide-react';

interface Dream {
  id: string;
  title: string;
  description: string;
  category: string;
  timeframe: string;
  importance_level: string;
  status: string;
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
            onClick={onBack}
            variant="outline"
            size="sm"
            className="font-inter"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dreams
          </Button>
        </div>

        {/* Dream Details */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h1 className="font-cormorant text-3xl font-bold text-gray-800">
                {dream.title}
              </h1>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-soul-purple" />
                <span className="font-inter text-sm text-gray-600 capitalize">
                  {dream.importance_level} Priority
                </span>
              </div>
            </div>
            
            <p className="font-inter text-gray-600 leading-relaxed">
              {dream.description}
            </p>
            
            <div className="flex items-center gap-6 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-soul-purple" />
                <span className="font-inter text-sm text-gray-600">
                  Category: <span className="font-medium capitalize">{dream.category?.replace('_', ' ')}</span>
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-soul-teal" />
                <span className="font-inter text-sm text-gray-600">
                  Timeline: <span className="font-medium capitalize">{dream.timeframe?.replace('_', ' ')}</span>
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Dream Decomposition Content */}
        <Card className="p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h2 className="font-cormorant text-2xl font-bold text-gray-800 mb-2">
              Dream Analysis Coming Soon
            </h2>
            <p className="font-inter text-gray-600 max-w-md mx-auto">
              We're building an intelligent system to break down your dreams into actionable steps. 
              This feature will be available soon!
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
