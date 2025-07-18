
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Tag, Star } from 'lucide-react';

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

interface DreamsListProps {
  dreams: Dream[];
  onDreamSelect: (dream: Dream) => void;
}

export const DreamsList: React.FC<DreamsListProps> = ({ dreams, onDreamSelect }) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'personal_growth': return 'text-soul-purple bg-soul-purple/10 border-soul-purple/20';
      case 'career': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'creativity': return 'text-pink-600 bg-pink-50 border-pink-200';
      case 'relationships': return 'text-rose-600 bg-rose-50 border-rose-200';
      case 'health_wellness': return 'text-green-600 bg-green-50 border-green-200';
      case 'spiritual': return 'text-soul-teal bg-soul-teal/10 border-soul-teal/20';
      case 'adventure': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'contribution': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getImportanceIcon = (level: string) => {
    switch (level) {
      case 'critical': return <Star className="h-4 w-4 text-red-500 fill-current" />;
      case 'high': return <Star className="h-4 w-4 text-orange-500 fill-current" />;
      case 'medium': return <Star className="h-4 w-4 text-yellow-500" />;
      default: return <Star className="h-4 w-4 text-gray-400" />;
    }
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
              <div className="flex items-center gap-1">
                {getImportanceIcon(dream.importance_level)}
              </div>
            </div>
            
            <p className="font-inter text-sm text-gray-600 line-clamp-2">
              {dream.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-inter ${getCategoryColor(dream.category)}`}>
                  <Tag className="h-3 w-3" />
                  <span className="capitalize">{dream.category?.replace('_', ' ')}</span>
                </div>
                
                <div className="flex items-center gap-1 text-xs font-inter text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span className="capitalize">{dream.timeframe?.replace('_', ' ')}</span>
                </div>
              </div>
              
              <Button
                onClick={() => onDreamSelect(dream)}
                variant="outline"
                size="sm"
                className="font-inter text-xs"
              >
                Explore
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
