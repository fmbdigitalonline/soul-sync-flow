
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { personalityVectorService } from '@/services/personality-vector-service';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface VFPGraphFeedbackProps {
  messageId: string;
  onFeedbackGiven?: (isPositive: boolean) => void;
}

export const VFPGraphFeedback: React.FC<VFPGraphFeedbackProps> = ({ 
  messageId, 
  onFeedbackGiven 
}) => {
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleFeedback = async (isPositive: boolean) => {
    if (!user || feedbackGiven !== null || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      await personalityVectorService.voteThumb(user.id, messageId, isPositive);
      
      setFeedbackGiven(isPositive);
      onFeedbackGiven?.(isPositive);
      
      toast.success(
        isPositive 
          ? '👍 Thanks! This helps me understand you better.' 
          : '👎 Got it. I\'ll adjust my approach.'
      );

      console.log(`✅ Feedback recorded: ${isPositive ? '👍' : '👎'}`);
    } catch (error) {
      console.error('❌ Error submitting feedback:', error);
      toast.error('Unable to record feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2 opacity-60 hover:opacity-100 transition-opacity">
      <span className="text-xs text-muted-foreground">Helpful?</span>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleFeedback(true)}
        disabled={feedbackGiven !== null || isSubmitting}
        className={`h-6 w-6 p-0 ${
          feedbackGiven === true 
            ? 'text-green-600 bg-green-50' 
            : 'hover:text-green-600 hover:bg-green-50'
        }`}
      >
        <ThumbsUp className="h-3 w-3" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleFeedback(false)}
        disabled={feedbackGiven !== null || isSubmitting}
        className={`h-6 w-6 p-0 ${
          feedbackGiven === false 
            ? 'text-red-600 bg-red-50' 
            : 'hover:text-red-600 hover:bg-red-50'
        }`}
      >
        <ThumbsDown className="h-3 w-3" />
      </Button>

      {feedbackGiven !== null && (
        <span className="text-xs text-muted-foreground ml-1">
          Thanks for the feedback!
        </span>
      )}
    </div>
  );
};
