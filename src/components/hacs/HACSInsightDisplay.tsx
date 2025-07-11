import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Lightbulb, 
  TrendingUp, 
  Brain, 
  Target, 
  CheckCircle, 
  X, 
  Eye,
  BarChart3
} from 'lucide-react';
import { HACSInsight } from '@/hooks/use-hacs-insights';

interface HACSInsightDisplayProps {
  insight: HACSInsight;
  onAcknowledge: () => void;
  onDismiss: () => void;
  position?: 'bottom-right' | 'top-center';
}

export const HACSInsightDisplay: React.FC<HACSInsightDisplayProps> = ({
  insight,
  onAcknowledge,
  onDismiss,
  position = 'bottom-right'
}) => {
  const [showEvidence, setShowEvidence] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'productivity': return TrendingUp;
      case 'behavioral': return Target;
      case 'growth': return Brain;
      case 'learning': return Lightbulb;
      default: return Lightbulb;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'productivity': return 'text-blue-400';
      case 'behavioral': return 'text-purple-400';
      case 'growth': return 'text-green-400';
      case 'learning': return 'text-orange-400';
      default: return 'text-primary';
    }
  };

  const getModuleColor = (module: string) => {
    const colors: Record<string, string> = {
      PIE: 'text-blue-400',
      CNR: 'text-red-400',
      TMG: 'text-purple-400',
      DPEM: 'text-green-400',
      ACS: 'text-orange-400',
      VFP: 'text-cyan-400',
      NIK: 'text-pink-400',
      CPSR: 'text-yellow-400',
      TWS: 'text-indigo-400',
      HFME: 'text-emerald-400',
      BPSC: 'text-rose-400'
    };
    return colors[module] || 'text-primary';
  };

  const positionClasses = position === 'bottom-right' 
    ? 'fixed bottom-20 right-6 z-40' 
    : 'fixed top-20 left-1/2 transform -translate-x-1/2 z-40';

  const TypeIcon = getTypeIcon(insight.type);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className={`${positionClasses} w-80 max-w-sm`}
      >
        <Card className="p-4 shadow-lg border-l-4 border-l-primary bg-background/95 backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-primary/10">
                <TypeIcon className={`h-4 w-4 ${getTypeColor(insight.type)}`} />
              </div>
              <div>
                <h4 className="font-semibold text-sm">HACS Insight</h4>
                <p className={`text-xs font-medium ${getModuleColor(insight.module)}`}>
                  {insight.module} • {insight.type}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onDismiss}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Confidence Indicator */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Confidence</span>
              <span>{Math.round(insight.confidence * 100)}%</span>
            </div>
            <Progress value={insight.confidence * 100} className="h-1" />
          </div>

          {/* Insight Text */}
          <div className="mb-4">
            <p className="text-sm leading-relaxed">{insight.text}</p>
          </div>

          {/* Evidence Toggle */}
          {insight.evidence.length > 0 && (
            <div className="mb-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 text-xs"
                onClick={() => setShowEvidence(!showEvidence)}
              >
                <Eye className="h-3 w-3 mr-1" />
                {showEvidence ? 'Hide' : 'Show'} Evidence
              </Button>
              
              <AnimatePresence>
                {showEvidence && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2"
                  >
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      {insight.evidence.map((evidence, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <BarChart3 className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>{evidence}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onDismiss}
              className="flex-1 h-8 text-xs"
            >
              Dismiss
            </Button>
            <Button
              size="sm"
              onClick={onAcknowledge}
              className="flex-1 h-8 text-xs"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Got It
            </Button>
          </div>

          {/* Timestamp */}
          <div className="mt-2 text-xs text-muted-foreground text-center">
            Generated {insight.timestamp.toLocaleTimeString()}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};