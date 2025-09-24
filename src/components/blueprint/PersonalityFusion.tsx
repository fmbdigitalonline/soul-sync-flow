import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { motion } from "@/lib/framer-motion";
import { Sparkles, User, Home, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PersonalityFusionProps {
  value: any;
  onChange: (value: any) => void;
  onComplete?: () => void; // Add callback for completion
  seedData?: {
    sunSign?: string;
    moonSign?: string;
    risingSign?: string;
    humanDesignType?: string;
    lifePath?: number;
  };
}

interface MicroAnswer {
  key: string;
  value: number; // -1 to 1 scale
}

interface PersonalityEstimate {
  bigFive: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  confidence: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  mbtiProbabilities: Record<string, number>;
  likelyType: string;
  description: string;
}

export const PersonalityFusion: React.FC<PersonalityFusionProps> = ({ 
  value, 
  onChange, 
  onComplete,
  seedData 
}) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<MicroAnswer[]>([]);
  const [confidenceRating, setConfidenceRating] = useState([3]);
  const [personalityEstimate, setPersonalityEstimate] = useState<PersonalityEstimate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Micro-interaction steps with translations
  const steps = [
    {
      id: "energy_source",
      title: t('personality.energySource'),
      icon: <User className="h-5 w-5" />,
      leftOption: { label: t('personality.beingAlone'), value: -1, trait: "extraversion" },
      rightOption: { label: t('personality.beingWithPeople'), value: 1, trait: "extraversion" }
    },
    {
      id: "workspace_style",
      title: t('personality.workspaceStyle'),
      icon: <Home className="h-5 w-5" />,
      leftOption: { label: t('personality.tidyOrganized'), value: 1, trait: "conscientiousness" },
      rightOption: { label: t('personality.creativeChaos'), value: -1, trait: "conscientiousness" }
    },
    {
      id: "planning_style",
      title: t('personality.planningStyle'),
      icon: <Calendar className="h-5 w-5" />,
      leftOption: { label: t('personality.bookInAdvance'), value: 1, trait: "conscientiousness" },
      rightOption: { label: t('personality.seeWhatHappens'), value: -1, trait: "conscientiousness" }
    }
  ];

  // Generate seed estimate from astrological data
  const generateSeedEstimate = (): PersonalityEstimate => {
    const base = {
      openness: 0.5,
      conscientiousness: 0.5,
      extraversion: 0.5,
      agreeableness: 0.5,
      neuroticism: 0.5
    };

    const confidence = {
      openness: 0.3,
      conscientiousness: 0.3,
      extraversion: 0.3,
      agreeableness: 0.3,
      neuroticism: 0.3
    };

    if (seedData?.sunSign) {
      // Fire signs: Aries, Leo, Sagittarius
      if (['Aries', 'Leo', 'Sagittarius'].includes(seedData.sunSign)) {
        base.extraversion += 0.2;
        base.openness += 0.15;
        confidence.extraversion = 0.5;
      }
      // Earth signs: Taurus, Virgo, Capricorn
      else if (['Taurus', 'Virgo', 'Capricorn'].includes(seedData.sunSign)) {
        base.conscientiousness += 0.2;
        base.extraversion -= 0.1;
        confidence.conscientiousness = 0.5;
      }
      // Air signs: Gemini, Libra, Aquarius
      else if (['Gemini', 'Libra', 'Aquarius'].includes(seedData.sunSign)) {
        base.openness += 0.2;
        base.agreeableness += 0.1;
        confidence.openness = 0.5;
      }
      // Water signs: Cancer, Scorpio, Pisces
      else if (['Cancer', 'Scorpio', 'Pisces'].includes(seedData.sunSign)) {
        base.neuroticism += 0.15;
        base.agreeableness += 0.15;
        confidence.neuroticism = 0.4;
      }
    }

    // Human Design adjustments
    if (seedData?.humanDesignType) {
      if (seedData.humanDesignType === 'Projector') {
        base.extraversion -= 0.15;
        base.openness += 0.1;
      } else if (seedData.humanDesignType === 'Manifestor') {
        base.extraversion += 0.15;
        base.conscientiousness += 0.1;
      }
    }

    // Life Path number adjustments
    if (seedData?.lifePath) {
      if ([3, 5, 7].includes(seedData.lifePath)) {
        base.openness += 0.1;
      }
      if ([4, 8, 22].includes(seedData.lifePath)) {
        base.conscientiousness += 0.1;
      }
    }

    // Ensure values stay in 0-1 range
    Object.keys(base).forEach(key => {
      base[key as keyof typeof base] = Math.max(0, Math.min(1, base[key as keyof typeof base]));
    });

    // Generate MBTI probabilities
    const mbtiProbabilities = generateMBTIProbabilities(base);
    const likelyType = Object.keys(mbtiProbabilities).reduce((a, b) => 
      mbtiProbabilities[a] > mbtiProbabilities[b] ? a : b
    );

    return {
      bigFive: base,
      confidence,
      mbtiProbabilities,
      likelyType,
      description: generateDescription(likelyType, base)
    };
  };

  const generateMBTIProbabilities = (bigFive: any): Record<string, number> => {
    const types = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 
                  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];
    
    const probs: Record<string, number> = {};
    
    types.forEach(type => {
      let prob = 0.0625; // Base probability (1/16)
      
      // E/I
      if (type[0] === 'E' && bigFive.extraversion > 0.5) prob *= 2;
      if (type[0] === 'I' && bigFive.extraversion <= 0.5) prob *= 2;
      
      // S/N
      if (type[1] === 'N' && bigFive.openness > 0.5) prob *= 1.8;
      if (type[1] === 'S' && bigFive.openness <= 0.5) prob *= 1.8;
      
      // T/F
      if (type[2] === 'F' && bigFive.agreeableness > 0.5) prob *= 1.6;
      if (type[2] === 'T' && bigFive.agreeableness <= 0.5) prob *= 1.6;
      
      // J/P
      if (type[3] === 'J' && bigFive.conscientiousness > 0.5) prob *= 1.7;
      if (type[3] === 'P' && bigFive.conscientiousness <= 0.5) prob *= 1.7;
      
      probs[type] = prob;
    });
    
    // Normalize probabilities
    const total = Object.values(probs).reduce((sum, p) => sum + p, 0);
    Object.keys(probs).forEach(type => {
      probs[type] = probs[type] / total;
    });
    
    return probs;
  };

  const generateDescription = (type: string, bigFive: any): string => {
    const descriptions: Record<string, string> = (t('personality.mbtiDescriptions') as any) || {};
    return descriptions[type] || 'You have a unique personality that combines various traits in interesting ways.';
  };

  const handleSwipeChoice = (stepIndex: number, choice: 'left' | 'right') => {
    const step = steps[stepIndex];
    const option = choice === 'left' ? step.leftOption : step.rightOption;
    
    const newAnswer: MicroAnswer = {
      key: `${step.id}_${choice}`,
      value: option.value
    };
    
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    
    if (stepIndex < steps.length - 1) {
      setCurrentStep(stepIndex + 1);
    } else {
      // Generate final estimate
      const estimate = generateFinalEstimate(updatedAnswers);
      setPersonalityEstimate(estimate);
      setCurrentStep(steps.length); // Move to confidence rating
    }
  };

  const generateFinalEstimate = (microAnswers: MicroAnswer[]): PersonalityEstimate => {
    const seedEstimate = generateSeedEstimate();
    
    // Apply micro-answer adjustments
    microAnswers.forEach(answer => {
      if (answer.key.includes('energy_source')) {
        seedEstimate.bigFive.extraversion += answer.value * 0.3;
        seedEstimate.confidence.extraversion = Math.max(0.7, seedEstimate.confidence.extraversion);
      } else if (answer.key.includes('workspace_style') || answer.key.includes('planning_style')) {
        seedEstimate.bigFive.conscientiousness += answer.value * 0.25;
        seedEstimate.confidence.conscientiousness = Math.max(0.7, seedEstimate.confidence.conscientiousness);
      }
    });
    
    // Ensure values stay in bounds
    Object.keys(seedEstimate.bigFive).forEach(key => {
      seedEstimate.bigFive[key as keyof typeof seedEstimate.bigFive] = 
        Math.max(0, Math.min(1, seedEstimate.bigFive[key as keyof typeof seedEstimate.bigFive]));
    });
    
    // Regenerate MBTI probabilities and description
    seedEstimate.mbtiProbabilities = generateMBTIProbabilities(seedEstimate.bigFive);
    seedEstimate.likelyType = Object.keys(seedEstimate.mbtiProbabilities).reduce((a, b) => 
      seedEstimate.mbtiProbabilities[a] > seedEstimate.mbtiProbabilities[b] ? a : b
    );
    seedEstimate.description = generateDescription(seedEstimate.likelyType, seedEstimate.bigFive);
    
    return seedEstimate;
  };

  const handleConfidenceSubmit = async () => {
    // Prevent multiple submissions
    if (isSubmitting) {
      console.log("Already submitting, ignoring duplicate click");
      return;
    }

    if (!personalityEstimate) {
      console.error("No personality estimate available");
      return;
    }

    console.log("Starting confidence submit...");
    setIsSubmitting(true);

    try {
      const finalResult = {
        ...personalityEstimate,
        userConfidence: confidenceRating[0] / 5,
        microAnswers: answers,
        timestamp: new Date().toISOString()
      };
      
      console.log("Calling onChange with final result:", finalResult);
      onChange(finalResult);
      
      // Call onComplete callback to trigger next step
      if (onComplete) {
        console.log("Calling onComplete to trigger next step");
        onComplete();
      }
      
      console.log("Personality fusion completed successfully");
    } catch (error) {
      console.error("Error in handleConfidenceSubmit:", error);
      setIsSubmitting(false);
    }
  };

  // Initialize with seed estimate
  React.useEffect(() => {
    if (!personalityEstimate && currentStep === 0) {
      const seed = generateSeedEstimate();
      // Don't set as final estimate yet, just show preview
    }
  }, [seedData]);

  if (currentStep < steps.length) {
    const step = steps[currentStep];
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            {step.icon}
            <h3 className="text-lg font-medium">{step.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Quick question {currentStep + 1} of {steps.length}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card 
              className="cursor-pointer border-2 hover:border-soul-purple/50 transition-colors h-full"
              onClick={() => handleSwipeChoice(currentStep, 'left')}
            >
              <CardContent className="flex items-center justify-center p-6 text-center h-full">
                <span className="text-sm font-medium">{step.leftOption.label}</span>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card 
              className="cursor-pointer border-2 hover:border-soul-purple/50 transition-colors h-full"
              onClick={() => handleSwipeChoice(currentStep, 'right')}
            >
              <CardContent className="flex items-center justify-center p-6 text-center h-full">
                <span className="text-sm font-medium">{step.rightOption.label}</span>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        {/* Progress indicator */}
        <div className="flex justify-center gap-2">
          {steps.map((_, index) => (
            <div 
              key={index}
              className={`w-2 h-2 rounded-full ${
                index <= currentStep ? 'bg-soul-purple' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (currentStep === steps.length && personalityEstimate) {
    const confidence = Math.round(
      Object.values(personalityEstimate.confidence).reduce((sum, c) => sum + c, 0) / 5 * 100
    );
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-soul-purple" />
            <h3 className="text-lg font-medium">{t('personality.yourPersonalityProfile')}</h3>
          </div>
        </div>
        
        <Card className="border-soul-purple/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {t('personality.likelyStyle')} {personalityEstimate.likelyType}
              </CardTitle>
              <Badge variant="secondary">{t('common.confidence')}: {confidence}%</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {personalityEstimate.description}
            </p>
            
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">
                <strong>{t('personality.topMbtiMatches')}</strong>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(personalityEstimate.mbtiProbabilities)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)
                  .map(([type, prob]) => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {type} ({Math.round(prob * 100)}%)
                    </Badge>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <div className="text-center">
            <label className="text-sm font-medium">{t('personality.howAccurate')}</label>
            <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
              <span>{t('personality.notQuiteRight')}</span>
              <span>•</span>
              <span>{t('personality.spotOn')}</span>
            </div>
          </div>
          
          <Slider
            value={confidenceRating}
            onValueChange={setConfidenceRating}
            max={5}
            min={1}
            step={1}
            className="w-full"
            disabled={isSubmitting}
          />
          
          <div className="flex justify-center">
            <div className="text-center">
              <div className="text-2xl mb-1">
                {['😕', '😐', '🙂', '😊', '🤩'][confidenceRating[0] - 1]}
              </div>
              <div className="text-xs text-muted-foreground">
                {confidenceRating[0]} out of 5 stars
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleConfidenceSubmit}
            disabled={isSubmitting}
            className="w-full bg-soul-purple hover:bg-soul-purple/90 text-white font-medium py-3 rounded-lg"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t('personality.processing')}
              </div>
            ) : (
              t('personality.continueWithProfile')
            )}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            {t('personality.keepRefining')}
          </p>
        </div>
      </div>
    );
  }

  return null;
};
