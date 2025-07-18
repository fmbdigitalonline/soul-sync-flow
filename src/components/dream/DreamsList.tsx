
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Calendar, Tag } from 'lucide-react';

interface Dream {
  id: string;
  title: string;
  description: string;
  category: string;
  timeframe: string;
  importance_level: string;
  created_at: string;
}

interface DreamsListProps {
  dreams: Dream[];
  onDreamSelect: (dream: Dream) => void;
}

export const DreamsList: React.FC<DreamsListProps> = ({ dreams, onDreamSelect }) => {
  const getCategoryColor = (category: string) => {
    const colors = {
      personal_growth: 'bg-soul-purple/10 text-soul-purple',
      career: 'bg-soul-teal/10 text-soul-teal',
      creativity: 'bg-orange-100 text-orange-600',
      relationships: 'bg-pink-100 text-pink-600',
      health_wellness: 'bg-green-100 text-green-600',
      spiritual: 'bg-purple-100 text-purple-600',
      adventure: 'bg-blue-100 text-blue-600',
      contribution: 'bg-yellow-100 text-yellow-600',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  const getImportanceColor = (importance: string) => {
    const colors = {
      critical: 'text-red-600',
      high: 'text-orange-600',
      medium: 'text-yellow-600',
      low: 'text-gray-600',
    };
    return colors[importance as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <div className="space-y-4">
      {dreams.map((dream) => (
        <Card key={dream.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="font-cormorant text-lg font-semibold text-gray-800">
                {dream.title}
              </h3>
              <span className={`text-sm font-medium ${getImportanceColor(dream.importance_level)}`}>
                {dream.importance_level}
              </span>
            </div>
            
            <p className="font-inter text-sm text-gray-600 line-clamp-2">
              {dream.description}
            </p>
            
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(dream.category)}`}>
                  {dream.category?.replace('_', ' ')}
                </span>
              </div>
              
              <div className="flex items-center gap-1 text-gray-500">
                <Calendar className="h-3 w-3" />
                <span className="font-inter">{dream.timeframe}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <span className="font-inter text-xs text-gray-500">
                Created {new Date(dream.created_at).toLocaleDateString()}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDreamSelect(dream)}
                className="font-inter"
              >
                <Heart className="h-3 w-3 mr-1" />
                Explore
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
