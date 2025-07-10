
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart, Target, Lightbulb } from 'lucide-react';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';

interface DreamSuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  confidence: number;
  blueprintReason: string;
}

interface DreamSuggestionCardProps {
  suggestion: DreamSuggestion;
  onSelect: (suggestion: DreamSuggestion) => void;
  isSelected?: boolean;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'creativity': return Heart;
    case 'career': return Target;
    case 'personal_growth': return Sparkles;
    case 'relationships': return Heart;
    case 'spiritual': return Sparkles;
    default: return Lightbulb;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'creativity': return 'text-pink-600 bg-pink-50 border-pink-200';
    case 'career': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'personal_growth': return 'text-soul-purple bg-soul-purple/10 border-soul-purple/20';
    case 'relationships': return 'text-rose-600 bg-rose-50 border-rose-200';
    case 'spiritual': return 'text-soul-teal bg-soul-teal/10 border-soul-teal/20';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export const DreamSuggestionCard: React.FC<DreamSuggestionCardProps> = ({
  suggestion,
  onSelect,
  isSelected = false
}) => {
  const { getTextSize, touchTargetSize, isFoldDevice } = useResponsiveLayout();
  const CategoryIcon = getCategoryIcon(suggestion.category);
  const categoryColor = getCategoryColor(suggestion.category);

  return (
    <Card className={`border-2 transition-colors duration-300 cursor-pointer hover:bg-accent/30 ${
      isSelected 
        ? 'border-soul-purple bg-soul-purple/5' 
        : 'border-gray-200 hover:border-soul-purple/50'
    }`}>
      <div className={`p-4 ${isFoldDevice ? 'p-3' : ''}`}>
        {/* Header with category and confidence */}
        <div className="flex items-center justify-between mb-3">
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${categoryColor} ${getTextSize('text-xs')}`}>
            <CategoryIcon className={`${isFoldDevice ? 'h-2 w-2' : 'h-3 w-3'}`} />
            <span className="font-medium capitalize">{suggestion.category.replace('_', ' ')}</span>
          </div>
          <div className={`flex items-center gap-1 text-soul-purple ${getTextSize('text-xs')}`}>
            <Sparkles className={`${isFoldDevice ? 'h-2 w-2' : 'h-3 w-3'}`} />
            <span className="font-medium">{Math.round(suggestion.confidence * 100)}% match</span>
          </div>
        </div>

        {/* Title and description */}
        <div className="mb-4">
          <h3 className={`font-semibold text-gray-800 mb-2 ${getTextSize('text-sm')}`}>
            {suggestion.title}
          </h3>
          <p className={`text-gray-600 leading-relaxed mb-3 ${getTextSize('text-xs')}`}>
            {suggestion.description}
          </p>
        </div>

        {/* Blueprint reason */}
        <div className={`bg-soul-purple/5 rounded-lg p-3 mb-4 border-l-4 border-soul-purple ${isFoldDevice ? 'p-2' : ''}`}>
          <p className={`text-soul-purple font-medium ${getTextSize('text-xs')}`}>
            <Lightbulb className={`inline mr-1 ${isFoldDevice ? 'h-2 w-2' : 'h-3 w-3'}`} />
            Why this fits you:
          </p>
          <p className={`text-gray-700 mt-1 leading-relaxed ${getTextSize('text-xs')}`}>
            {suggestion.blueprintReason}
          </p>
        </div>

        {/* Action button */}
        <Button
          onClick={() => onSelect(suggestion)}
          className={`w-full bg-gradient-to-r from-soul-purple to-soul-teal text-white rounded-xl font-medium transition-colors duration-300 ${getTextSize('text-sm')} ${touchTargetSize}`}
        >
          <Heart className={`mr-2 ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
          Explore This Dream
        </Button>
      </div>
    </Card>
  );
};
