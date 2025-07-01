
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Clock, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { PIEInsight } from '@/types/pie-types';
import { PIEFeedbackSystem } from './PIEFeedbackSystem';

interface PIEInsightPreviewProps {
  insight: PIEInsight;
  onView: (insightId: string) => void;
  onDismiss: (insightId: string) => void;
  isExpanded?: boolean;
  onToggleExpanded?: (insightId: string) => void;
}

export const PIEInsightPreview: React.FC<PIEInsightPreviewProps> = ({
  insight,
  onView,
  onDismiss,
  isExpanded = false,
  onToggleExpanded
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 border-red-200 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-200 text-orange-800';
      case 'medium': return 'bg-blue-100 border-blue-200 text-blue-800';
      default: return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return '🚀';
      case 'warning': return '⚠️';
      case 'preparation': return '📋';
      case 'awareness': return '💡';
      default: return '🔮';
    }
  };

  return (
    <Card className={`p-4 transition-all duration-200 ${getPriorityColor(insight.priority)}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getTypeIcon(insight.insightType)}</span>
          <Badge variant="outline" className="capitalize">
            {insight.insightType}
          </Badge>
          <Badge variant="outline">
            {Math.round(insight.confidence * 100)}%
          </Badge>
        </div>
        
        <div className="flex items-center space-x-1">
          {onToggleExpanded && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleExpanded(insight.id)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </Button>
          )}
        </div>
      </div>

      <div className="mb-3">
        <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
        {isExpanded ? (
          <p className="text-xs text-gray-700 leading-relaxed">{insight.message}</p>
        ) : (
          <p className="text-xs text-gray-700 line-clamp-2">{insight.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{new Date(insight.triggerTime).toLocaleDateString()}</span>
          {insight.triggerEvent && (
            <>
              <span>•</span>
              <span className="capitalize">{insight.triggerEvent.replace(/_/g, ' ')}</span>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <PIEFeedbackSystem
            insightId={insight.id}
            compact={true}
            onFeedbackSubmitted={(feedback) => {
              console.log('Feedback submitted for insight:', insight.id, feedback);
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(insight.id)}
            className="text-xs h-6 px-2"
          >
            View
          </Button>
        </div>
      </div>
    </Card>
  );
};
