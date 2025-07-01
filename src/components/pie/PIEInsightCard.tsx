
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Star, Clock, ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { PIEInsight } from '@/types/pie-types';

interface PIEInsightCardProps {
  insight: PIEInsight;
  onFeedback: (insightId: string, isPositive: boolean) => void;
  onDismiss: (insightId: string) => void;
  compact?: boolean;
}

export const PIEInsightCard: React.FC<PIEInsightCardProps> = ({
  insight,
  onFeedback,
  onDismiss,
  compact = false
}) => {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <Star className="w-4 h-4 text-red-500" />;
      case 'high': return <TrendingUp className="w-4 h-4 text-orange-500" />;
      case 'medium': return <Brain className="w-4 h-4 text-blue-500" />;
      default: return <Brain className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-200 bg-red-50';
      case 'high': return 'border-orange-200 bg-orange-50';
      case 'medium': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (compact) {
    return (
      <div className={`p-3 rounded-lg border ${getPriorityColor(insight.priority)} relative`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDismiss(insight.id)}
          className="absolute top-1 right-1 h-6 w-6 p-0"
        >
          <X className="w-3 h-3" />
        </Button>
        
        <div className="flex items-start space-x-2 mb-2">
          {getPriorityIcon(insight.priority)}
          <div className="flex-1">
            <h4 className="font-medium text-sm">{insight.title}</h4>
            <p className="text-xs text-gray-600 mt-1">{insight.message}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {Math.round(insight.confidence * 100)}% confidence
          </Badge>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFeedback(insight.id, true)}
              className="h-6 w-6 p-0"
            >
              <ThumbsUp className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFeedback(insight.id, false)}
              className="h-6 w-6 p-0"
            >
              <ThumbsDown className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={`p-4 ${getPriorityColor(insight.priority)} relative`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDismiss(insight.id)}
        className="absolute top-2 right-2 h-6 w-6 p-0"
      >
        <X className="w-4 h-4" />
      </Button>

      <div className="flex items-start space-x-3 mb-3">
        {getPriorityIcon(insight.priority)}
        <div className="flex-1">
          <h3 className="font-semibold text-base">{insight.title}</h3>
          <p className="text-sm text-gray-700 mt-1">{insight.message}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {insight.insightType}
          </Badge>
          <Badge variant="outline">
            {Math.round(insight.confidence * 100)}% confidence
          </Badge>
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="w-3 h-3 mr-1" />
            {new Date(insight.triggerTime).toLocaleDateString()}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFeedback(insight.id, true)}
            className="h-8 w-8 p-0"
          >
            <ThumbsUp className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFeedback(insight.id, false)}
            className="h-8 w-8 p-0"
          >
            <ThumbsDown className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
