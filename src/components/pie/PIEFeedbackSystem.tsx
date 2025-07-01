
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, MessageSquare, X, Send } from 'lucide-react';
import { pieService } from '@/services/pie-service';
import { toast } from 'sonner';

interface PIEFeedbackSystemProps {
  insightId: string;
  onFeedbackSubmitted?: (feedback: any) => void;
  compact?: boolean;
}

export const PIEFeedbackSystem: React.FC<PIEFeedbackSystemProps> = ({
  insightId,
  onFeedbackSubmitted,
  compact = false
}) => {
  const [feedbackType, setFeedbackType] = useState<'positive' | 'negative' | 'detailed' | null>(null);
  const [detailedFeedback, setDetailedFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickFeedback = async (type: 'positive' | 'negative') => {
    setIsSubmitting(true);
    try {
      await pieService.recordInsightFeedback(insightId, {
        type,
        helpful: type === 'positive',
        timestamp: new Date().toISOString()
      });
      
      toast.success(type === 'positive' ? 'Thanks for the positive feedback!' : 'Thanks for helping us improve!');
      setFeedbackType(type);
      
      onFeedbackSubmitted?.({ type, helpful: type === 'positive' });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDetailedFeedback = async () => {
    if (!detailedFeedback.trim()) return;
    
    setIsSubmitting(true);
    try {
      await pieService.recordInsightFeedback(insightId, {
        type: 'detailed',
        feedback: detailedFeedback,
        timestamp: new Date().toISOString()
      });
      
      toast.success('Detailed feedback submitted - thank you!');
      setFeedbackType('detailed');
      setDetailedFeedback('');
      
      onFeedbackSubmitted?.({ type: 'detailed', feedback: detailedFeedback });
    } catch (error) {
      console.error('Error submitting detailed feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFeedback = () => {
    setFeedbackType(null);
    setDetailedFeedback('');
  };

  if (feedbackType && feedbackType !== 'detailed') {
    return (
      <div className="flex items-center space-x-2">
        <Badge variant="outline" className="text-xs">
          Feedback: {feedbackType === 'positive' ? '👍' : '👎'}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFeedback}
          className="h-6 w-6 p-0"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  if (feedbackType === 'detailed') {
    return (
      <Card className="p-3 bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-800">Share detailed feedback</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFeedback}
            className="h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
        <Textarea
          value={detailedFeedback}
          onChange={(e) => setDetailedFeedback(e.target.value)}
          placeholder="How can we improve this insight?"
          className="text-sm mb-2"
          rows={2}
          disabled={isSubmitting}
        />
        <Button
          onClick={handleDetailedFeedback}
          disabled={!detailedFeedback.trim() || isSubmitting}
          size="sm"
          className="w-full"
        >
          <Send className="w-3 h-3 mr-1" />
          Submit Feedback
        </Button>
      </Card>
    );
  }

  return (
    <div className="flex items-center space-x-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleQuickFeedback('positive')}
        disabled={isSubmitting}
        className="h-6 w-6 p-0"
      >
        <ThumbsUp className="w-3 h-3" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleQuickFeedback('negative')}
        disabled={isSubmitting}
        className="h-6 w-6 p-0"
      >
        <ThumbsDown className="w-3 h-3" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setFeedbackType('detailed')}
        disabled={isSubmitting}
        className="h-6 w-6 p-0"
      >
        <MessageSquare className="w-3 h-3" />
      </Button>
    </div>
  );
};
