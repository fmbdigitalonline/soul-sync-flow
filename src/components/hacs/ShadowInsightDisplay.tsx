import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Eye, 
  Shield, 
  Target,
  Clock,
  CheckCircle,
  X,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ShadowPattern } from '@/services/conversation-shadow-detector';

interface ShadowInsightDisplayProps {
  pattern: ShadowPattern | null;
  hermeticAdvice: string | null;
  confidence: number;
  processingTime: number;
  onAcknowledge: () => void;
  onDismiss: () => void;
  position?: 'bottom-right' | 'top-center';
}

const getPatternIcon = (type: ShadowPattern['type']) => {
  switch (type) {
    case 'emotional_trigger': return Target;
    case 'projection': return Eye;
    case 'resistance': return Shield;
    case 'blind_spot': return AlertTriangle;
    default: return Brain;
  }
};

const getPatternColor = (type: ShadowPattern['type']) => {
  switch (type) {
    case 'emotional_trigger': return 'text-red-400';
    case 'projection': return 'text-blue-400';
    case 'resistance': return 'text-yellow-400';
    case 'blind_spot': return 'text-orange-400';
    default: return 'text-gray-400';
  }
};

export const ShadowInsightDisplay: React.FC<ShadowInsightDisplayProps> = ({
  pattern,
  hermeticAdvice,
  confidence,
  processingTime,
  onAcknowledge,
  onDismiss,
  position = 'bottom-right'
}) => {
  if (!pattern || !hermeticAdvice) return null;

  const PatternIcon = getPatternIcon(pattern.type);
  const patternColor = getPatternColor(pattern.type);

  const positionClasses = position === 'top-center' 
    ? 'top-4 left-1/2 transform -translate-x-1/2'
    : 'bottom-20 right-4';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className={cn(
          "fixed z-[60] w-80 bg-card border border-border rounded-lg shadow-2xl",
          "backdrop-blur-sm bg-opacity-95",
          positionClasses
        )}
      >
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <PatternIcon className={cn("h-5 w-5", patternColor)} />
              <Badge variant="secondary" className="text-xs">
                Shadow Pattern
              </Badge>
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{processingTime}ms</span>
            </div>
          </div>

          {/* Pattern Details */}
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium capitalize">
                {pattern.type.replace('_', ' ')} Pattern
              </p>
              <p className="text-xs text-muted-foreground">
                Confidence: {Math.round(confidence)}%
              </p>
            </div>

            {/* User Quote */}
            <div className="bg-muted/30 rounded-md p-2">
              <p className="text-xs italic">
                "{pattern.userQuote}"
              </p>
            </div>

            {/* Hermetic Advice */}
            <div className="bg-primary/10 rounded-md p-3 border-l-2 border-primary">
              <p className="text-sm text-foreground">
                {hermeticAdvice}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-2">
            <Button
              onClick={onAcknowledge}
              size="sm"
              className="flex-1 h-8"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Integrate
            </Button>
            <Button
              onClick={onDismiss}
              variant="outline"
              size="sm"
              className="h-8 px-3"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};