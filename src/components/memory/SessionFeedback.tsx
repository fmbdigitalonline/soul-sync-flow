
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, MessageSquare, TrendingUp } from 'lucide-react';
import { memoryService } from '@/services/memory-service';
import { toast } from 'sonner';

interface SessionFeedbackProps {
  sessionId: string;
  sessionSummary?: string;
  onFeedbackSubmitted?: () => void;
}

export const SessionFeedback: React.FC<SessionFeedbackProps> = ({
  sessionId,
  sessionSummary,
  onFeedbackSubmitted
}) => {
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating);
    console.log('⭐ User selected rating:', selectedRating);
  };

  const handleSuggestionToggle = (suggestion: string) => {
    setSuggestions(prev => 
      prev.includes(suggestion) 
        ? prev.filter(s => s !== suggestion)
        : [...prev, suggestion]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating before submitting');
      return;
    }

    setIsSubmitting(true);
    console.log('📝 Submitting session feedback:', { rating, feedback, suggestions });

    try {
      const success = await memoryService.saveFeedback({
        session_id: sessionId,
        rating,
        feedback_text: feedback.trim() || undefined,
        session_summary: sessionSummary,
        improvement_suggestions: suggestions
      });

      if (success) {
        setIsSubmitted(true);
        toast.success('Thank you for your feedback!');
        onFeedbackSubmitted?.();
        
        // Save feedback as memory for future reference
        await memoryService.saveMemory({
          user_id: '', // Will be set by the service
          session_id: sessionId,
          memory_type: 'interaction',
          memory_data: {
            type: 'session_feedback',
            rating,
            feedback_text: feedback,
            suggestions
          },
          context_summary: `Session rated ${rating}/5 stars`,
          importance_score: rating >= 4 ? 8 : 6
        });
      } else {
        toast.error('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <ThumbsUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Thank you for your feedback!
            </h3>
            <p className="text-green-700">
              Your input helps me provide better support in our future sessions.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const suggestionOptions = [
    'More specific action steps',
    'Better understanding of my situation',
    'More encouraging tone',
    'Faster response time',
    'More personalized advice',
    'Better follow-up questions'
  ];

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          How was this session?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating */}
        <div>
          <p className="text-sm font-medium mb-3">Rate this session (1-5 stars)</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRatingClick(star)}
                className={`p-2 rounded-lg transition-colors ${
                  star <= rating
                    ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                    : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-50'
                }`}
              >
                <Star 
                  className="h-6 w-6" 
                  fill={star <= rating ? 'currentColor' : 'none'} 
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              {rating === 1 && "Sorry to hear that. What can I improve?"}
              {rating === 2 && "I'd like to do better. What would help?"}
              {rating === 3 && "Good session. Any suggestions for improvement?"}
              {rating === 4 && "Great session! What made it helpful?"}
              {rating === 5 && "Excellent! I'm glad I could help effectively."}
            </p>
          )}
        </div>

        {/* Feedback Text */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Share your thoughts (optional)
          </label>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="What was most helpful? What could be improved? Any specific insights you gained?"
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Improvement Suggestions */}
        <div>
          <p className="text-sm font-medium mb-3">
            What would make our sessions even better? (select any that apply)
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestionOptions.map((suggestion) => (
              <Badge
                key={suggestion}
                variant={suggestions.includes(suggestion) ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  suggestions.includes(suggestion)
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => handleSuggestionToggle(suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <TrendingUp className="h-4 w-4 mr-2 animate-spin" />
              Submitting Feedback...
            </>
          ) : (
            'Submit Feedback'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SessionFeedback;
