import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Brain, CheckCircle, X, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface HACSQuestion {
  id: string;
  text: string;
  module: string;
  type: 'foundational' | 'validation' | 'philosophical';
}

interface HACSMicroLearningProps {
  isOpen: boolean;
  onClose: () => void;
  question?: HACSQuestion;
  intelligenceLevel: number;
  onLearningComplete?: (growth: number) => void;
}

export const HACSMicroLearning: React.FC<HACSMicroLearningProps> = ({
  isOpen,
  onClose,
  question,
  intelligenceLevel,
  onLearningComplete
}) => {
  const [userResponse, setUserResponse] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [stage, setStage] = useState<'question' | 'analyzing' | 'result'>('question');
  const [sessionId] = useState(`micro_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmitResponse = async () => {
    if (!userResponse.trim() || !question || !user) return;

    setIsAnalyzing(true);
    setStage('analyzing');

    try {
      // Submit response for analysis
      const { data, error } = await supabase.functions.invoke('hacs-response-analysis', {
        body: {
          questionId: question.id,
          userResponse: userResponse.trim(),
          questionText: question.text,
          questionModule: question.module,
          questionType: question.type,
          userId: user.id,
          sessionId
        }
      });

      if (error) throw error;

      setAnalysisResult(data);
      setStage('result');

      // Show growth notification if learning was validated
      if (data.analysis.validatedLearning && data.analysis.intelligenceGrowth > 0) {
        toast({
          title: "🧠 Learning Validated!",
          description: `Your ${question.module} intelligence grew by ${data.analysis.intelligenceGrowth.toFixed(1)}%`,
          duration: 3000,
        });
        
        onLearningComplete?.(data.analysis.intelligenceGrowth);
      } else {
        toast({
          title: "Response Recorded",
          description: "Keep exploring to unlock new insights!",
          duration: 2000,
        });
      }

    } catch (error) {
      console.error('Error analyzing response:', error);
      toast({
        title: "Analysis Error",
        description: "Could not analyze your response. Please try again.",
        variant: "destructive",
      });
      setStage('question');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClose = () => {
    setUserResponse('');
    setAnalysisResult(null);
    setStage('question');
    onClose();
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

  if (!isOpen || !question) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="w-full max-w-md"
        >
          <Card className="p-6 relative">
            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{t('system.soulLearningSession')}</h3>
                <p className={`text-sm font-medium ${getModuleColor(question.module)}`}>
                  {question.module} Module • {question.type}
                </p>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{t('hacs.microLearning.progress.question')}</span>
                <span>{t('hacs.microLearning.progress.response')}</span>
                <span>{t('hacs.microLearning.progress.analysis')}</span>
              </div>
              <Progress 
                value={stage === 'question' ? 33 : stage === 'analyzing' ? 66 : 100} 
                className="h-1"
              />
            </div>

            {/* Question Stage */}
            {stage === 'question' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="font-medium mb-2">{t('hacs.microLearning.interface.questionLabel')}</p>
                  <p className="text-sm">{question.text}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('hacs.microLearning.interface.yourResponse')}</label>
                  <Textarea
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                    placeholder={t('hacs.microLearning.placeholder')}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('hacs.microLearning.helperText')}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleClose} className="flex-1">
                    {t('hacs.microLearning.interface.skipForNow')}
                  </Button>
                  <Button 
                    onClick={handleSubmitResponse}
                    disabled={!userResponse.trim()}
                    className="flex-1"
                  >
                    {t('common.submit')} <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Analyzing Stage */}
            {stage === 'analyzing' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4 text-center"
              >
                <div className="p-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 mx-auto mb-4"
                  >
                    <Brain className="h-12 w-12 text-primary" />
                  </motion.div>
                  <h4 className="font-semibold mb-2">Analyzing Your Response</h4>
                  <p className="text-sm text-muted-foreground">
                    HACS is evaluating your insights for comprehension and learning evidence...
                  </p>
                </div>
              </motion.div>
            )}

            {/* Result Stage */}
            {stage === 'result' && analysisResult && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="text-center mb-4">
                  {analysisResult.analysis.validatedLearning ? (
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <h4 className="font-semibold text-green-700 dark:text-green-400">
                        Learning Validated!
                      </h4>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Your response shows genuine understanding
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                      <Brain className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                      <h4 className="font-semibold text-orange-700 dark:text-orange-400">
                        {t('learning.responseRecorded')}
                      </h4>
                      <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                        {t('learning.keepExploring')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Analysis Details */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Comprehension Score:</span>
                    <span className="font-medium">{analysisResult.analysis.comprehensionScore}%</span>
                  </div>
                  
                  {analysisResult.analysis.intelligenceGrowth > 0 && (
                    <div className="flex justify-between">
                      <span>Intelligence Growth:</span>
                      <span className="font-medium text-green-600">
                        +{analysisResult.analysis.intelligenceGrowth.toFixed(1)}%
                      </span>
                    </div>
                  )}

                  {analysisResult.analysis.learningEvidence.length > 0 && (
                    <div>
                      <p className="font-medium mb-1">Learning Evidence:</p>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        {analysisResult.analysis.learningEvidence.map((evidence: string, idx: number) => (
                          <li key={idx}>• {evidence}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <Button onClick={handleClose} className="w-full">
                  Continue Learning
                </Button>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};