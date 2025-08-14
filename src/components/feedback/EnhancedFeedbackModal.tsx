import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Brain, Settings } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DetailedFeedback } from '@/hooks/use-enhanced-feedback-system';
import { cn } from '@/lib/utils';

interface EnhancedFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: DetailedFeedback) => Promise<boolean>;
  messageId: string;
  feedbackType: 'insight' | 'question' | 'conversation';
  initialQuickRating?: 'positive' | 'negative';
}

export const EnhancedFeedbackModal: React.FC<EnhancedFeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  messageId,
  feedbackType,
  initialQuickRating
}) => {
  const [feedback, setFeedback] = useState<Partial<DetailedFeedback>>({
    messageId,
    feedbackType,
    quickRating: initialQuickRating
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'rating' | 'preferences' | 'notes'>('rating');
  
  const { language, t } = useLanguage();
  const isDutch = language === 'nl';

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const success = await onSubmit(feedback as DetailedFeedback);
      if (success) {
        onClose();
        // Reset for next time
        setFeedback({
          messageId,
          feedbackType,
          quickRating: initialQuickRating
        });
        setCurrentStep('rating');
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value?: number; 
    onChange: (rating: 1 | 2 | 3 | 4 | 5) => void; 
    label: string;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star as 1 | 2 | 3 | 4 | 5)}
            className={cn(
              "p-1 hover:scale-110 transition-transform",
              value && star <= value ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Star className="w-6 h-6 fill-current" />
          </button>
        ))}
      </div>
    </div>
  );

  const getStepTitle = () => {
    if (currentStep === 'rating') {
      return isDutch ? 'Hoe vond je dit?' : 'How was this for you?';
    } else if (currentStep === 'preferences') {
      return isDutch ? 'Voorkeuren aanpassen' : 'Adjust preferences';
    } else {
      return isDutch ? 'Aanvullende notities' : 'Additional notes';
    }
  };

  const getStepIcon = () => {
    if (currentStep === 'rating') return <Star className="w-5 h-5" />;
    if (currentStep === 'preferences') return <Settings className="w-5 h-5" />;
    return <MessageSquare className="w-5 h-5" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStepIcon()}
            {getStepTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step indicators */}
          <div className="flex justify-center gap-2">
            {['rating', 'preferences', 'notes'].map((step, index) => (
              <div 
                key={step}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  currentStep === step ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>

          {currentStep === 'rating' && (
            <div className="space-y-4">
              {/* Quick rating */}
              <div className="flex justify-center gap-4">
                <Button
                  variant={feedback.quickRating === 'positive' ? 'default' : 'outline'}
                  onClick={() => setFeedback(prev => ({ ...prev, quickRating: 'positive' }))}
                  className="flex items-center gap-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  {isDutch ? 'Goed' : 'Good'}
                </Button>
                <Button
                  variant={feedback.quickRating === 'negative' ? 'destructive' : 'outline'}
                  onClick={() => setFeedback(prev => ({ ...prev, quickRating: 'negative' }))}
                  className="flex items-center gap-2"
                >
                  <ThumbsDown className="w-4 h-4" />
                  {isDutch ? 'Niet goed' : 'Not good'}
                </Button>
              </div>

              {/* Detailed ratings */}
              <Card>
                <CardContent className="pt-4 space-y-4">
                  <StarRating
                    value={feedback.detailedRating}
                    onChange={(rating) => setFeedback(prev => ({ ...prev, detailedRating: rating }))}
                    label={isDutch ? 'Algemene kwaliteit' : 'Overall quality'}
                  />
                  
                  <StarRating
                    value={feedback.relevanceRating}
                    onChange={(rating) => setFeedback(prev => ({ ...prev, relevanceRating: rating }))}
                    label={isDutch ? 'Relevantie voor jou' : 'Relevance to you'}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 'preferences' && (
            <div className="space-y-4">
              {/* Communication style preference */}
              <div className="space-y-3">
                <Label>{isDutch ? 'Communicatiestijl voorkeur' : 'Communication style preference'}</Label>
                <RadioGroup
                  value={feedback.communicationStylePreference || 'just_right'}
                  onValueChange={(value) => setFeedback(prev => ({ 
                    ...prev, 
                    communicationStylePreference: value as any 
                  }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="more_formal" id="more_formal" />
                    <Label htmlFor="more_formal">{isDutch ? 'Formeler' : 'More formal'}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="less_formal" id="less_formal" />
                    <Label htmlFor="less_formal">{isDutch ? 'Minder formeel' : 'Less formal'}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="more_analytical" id="more_analytical" />
                    <Label htmlFor="more_analytical">{isDutch ? 'Meer analytisch' : 'More analytical'}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="more_intuitive" id="more_intuitive" />
                    <Label htmlFor="more_intuitive">{isDutch ? 'Meer intuïtief' : 'More intuitive'}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="just_right" id="just_right" />
                    <Label htmlFor="just_right">{isDutch ? 'Precies goed zo' : 'Just right'}</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Frequency preference */}
              <div className="space-y-3">
                <Label>{isDutch ? 'Frequentie voorkeur' : 'Frequency preference'}</Label>
                <RadioGroup
                  value={feedback.preferredFrequency || 'current'}
                  onValueChange={(value) => setFeedback(prev => ({ 
                    ...prev, 
                    preferredFrequency: value as any 
                  }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="more_frequent" id="more_frequent" />
                    <Label htmlFor="more_frequent">{isDutch ? 'Vaker' : 'More frequent'}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="current" id="current" />
                    <Label htmlFor="current">{isDutch ? 'Huidige frequentie' : 'Current frequency'}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="less_frequent" id="less_frequent" />
                    <Label htmlFor="less_frequent">{isDutch ? 'Minder vaak' : 'Less frequent'}</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {currentStep === 'notes' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">
                  {isDutch ? 'Aanvullende opmerkingen (optioneel)' : 'Additional notes (optional)'}
                </Label>
                <Textarea
                  id="notes"
                  placeholder={isDutch 
                    ? 'Vertel me meer over wat je zou willen verbeteren...'
                    : 'Tell me more about what you\'d like to improve...'
                  }
                  value={feedback.additionalNotes || ''}
                  onChange={(e) => setFeedback(prev => ({ 
                    ...prev, 
                    additionalNotes: e.target.value 
                  }))}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                if (currentStep === 'rating') {
                  onClose();
                } else if (currentStep === 'preferences') {
                  setCurrentStep('rating');
                } else {
                  setCurrentStep('preferences');
                }
              }}
            >
              {currentStep === 'rating' 
                ? (isDutch ? 'Annuleren' : 'Cancel')
                : (isDutch ? 'Terug' : 'Back')
              }
            </Button>

            <Button 
              onClick={() => {
                if (currentStep === 'rating') {
                  setCurrentStep('preferences');
                } else if (currentStep === 'preferences') {
                  setCurrentStep('notes');
                } else {
                  handleSubmit();
                }
              }}
              disabled={isSubmitting}
            >
              {currentStep === 'notes' 
                ? (isDutch ? 'Versturen' : 'Submit')
                : (isDutch ? 'Volgende' : 'Next')
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};