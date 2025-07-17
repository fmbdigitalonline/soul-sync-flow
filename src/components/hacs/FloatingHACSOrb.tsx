import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IntelligentSoulOrb } from '@/components/ui/intelligent-soul-orb';
import { SpeechBubble } from '@/components/ui/speech-bubble';
import { useHacsIntelligence } from '@/hooks/use-hacs-intelligence';
import { useHACSMicroLearning } from '@/hooks/use-hacs-micro-learning';
import { useHACSInsights } from '@/hooks/use-hacs-insights';
import { useAutonomousOrchestration } from '@/hooks/use-autonomous-orchestration';
import { usePersonalityEngine } from '@/hooks/use-personality-engine';
import { useStewardIntroduction } from '@/hooks/use-steward-introduction';
import { VoiceTokenGenerator } from '@/services/voice-token-generator';
import { HACSMicroLearning } from './HACSMicroLearning';
import { HACSChatOverlay } from './HACSChatOverlay';
import { HACSInsightDisplay } from './HACSInsightDisplay';
import { cn } from '@/lib/utils';

interface FloatingHACSProps {
  className?: string;
}

export const FloatingHACSOrb: React.FC<FloatingHACSProps> = ({ className }) => {
  const [showBubble, setShowBubble] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showMicroLearning, setShowMicroLearning] = useState(false);
  const [orbStage, setOrbStage] = useState<"welcome" | "collecting" | "generating" | "complete">("welcome");
  const [activeModule, setActiveModule] = useState<string | undefined>();
  const [moduleActivity, setModuleActivity] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  
  const { intelligence, loading, refreshIntelligence } = useHacsIntelligence();
  const {
    currentQuestion,
    isGenerating,
    generateMicroQuestion,
    clearCurrentQuestion,
    triggerMicroLearning
  } = useHACSMicroLearning();
  const {
    currentInsight,
    isGenerating: isGeneratingInsight,
    acknowledgeInsight,
    dismissInsight,
    triggerInsightCheck
  } = useHACSInsights();
  
  // NEW: Add autonomous orchestration
  const { triggerIntelligentIntervention, generatePersonalizedInsight } = useAutonomousOrchestration();
  const { generateOraclePrompt, getOptimalTimingPreferences } = usePersonalityEngine();
  
  // Introduction system integration
  const {
    introductionState,
    isGeneratingReport,
    startIntroduction,
    continueIntroduction,
    completeIntroductionWithReport,
    shouldStartIntroduction
  } = useStewardIntroduction();

  console.log('FloatingHACSOrb render:', { loading, intelligence, currentQuestion, currentInsight, isGenerating, isGeneratingInsight });

  const intelligenceLevel = intelligence?.intelligence_level || 0;

  // Update orb stage based on authentic HACS state
  useEffect(() => {
    if (isGenerating || isGeneratingInsight) {
      setOrbStage("generating");
    } else if (currentQuestion) {
      setOrbStage("collecting");
    } else if (currentInsight) {
      setOrbStage("complete");
    } else if (intelligenceLevel > 70) {
      setOrbStage("complete");
    } else if (intelligenceLevel > 0) {
      setOrbStage("welcome");
    } else {
      setOrbStage("welcome");
    }
  }, [isGenerating, isGeneratingInsight, currentQuestion, currentInsight, intelligenceLevel]);

  // Show speech bubble for questions or insights
  useEffect(() => {
    if (currentQuestion) {
      setShowBubble(true);
      // Auto-dismiss bubble after 15 seconds for questions
      const timer = setTimeout(() => {
        setShowBubble(false);
        clearCurrentQuestion();
      }, 15000);
      return () => clearTimeout(timer);
    } else if (currentInsight && !currentInsight.acknowledged) {
      // Insights show in their own display component, no bubble needed
      setShowBubble(false);
    } else {
      setShowBubble(false);
    }
  }, [currentQuestion, currentInsight, clearCurrentQuestion]);

  // Check for steward introduction on mount for new users
  useEffect(() => {
    const checkForIntroduction = async () => {
      if (!loading) {
        console.log('🎭 Checking if steward introduction should start...');
        const shouldStart = await shouldStartIntroduction();
        if (shouldStart) {
          console.log('🎭 Triggering Steward Introduction...');
          startIntroduction();
        } else {
          console.log('✅ Steward Introduction already completed or not needed.');
        }
      }
    };

    checkForIntroduction();
  }, [loading, shouldStartIntroduction, startIntroduction]);

  // Authentic triggers for both learning and insights
  useEffect(() => {
    // Gate autonomous behaviors during introduction
    if (introductionState.isActive || isGeneratingReport) {
      return;
    }

    const activityTimer = setTimeout(() => {
      if (!currentQuestion && !currentInsight && !loading && !isGenerating && !isGeneratingInsight) {
        // Trigger thinking state before generating content
        setIsThinking(true);
        setActiveModule('NIK');
        setModuleActivity(true);
        
        setTimeout(async () => {
          // Balanced choice between learning and insight generation
          const shouldGenerateInsight = Math.random() < 0.6; // 60% chance for insight
          
          if (shouldGenerateInsight) {
            await triggerInsightCheck('periodic_activity', { source: 'autonomous_trigger' });
            // Refresh intelligence after insight generation
            await refreshIntelligence();
          } else {
            await triggerMicroLearning();
            // Refresh intelligence after micro-learning
            await refreshIntelligence();
          }
          
          setIsThinking(false);
          setModuleActivity(false);
        }, 1500);
      }
    }, 2000); // Every 2 seconds check for triggers
    return () => clearTimeout(activityTimer);
  }, [introductionState.isActive, isGeneratingReport, currentQuestion, currentInsight, loading, isGenerating, isGeneratingInsight, triggerMicroLearning, triggerInsightCheck]);

  // Periodic analytics check (every 60 seconds when active)
  useEffect(() => {
    if (intelligence && intelligence.interaction_count > 0) {
      const analyticsTimer = setInterval(async () => {
        if (!currentInsight && !isGeneratingInsight) {
          console.log('🔍 Triggering periodic analytics insight check...');
          await triggerInsightCheck('intelligence_check', { 
            trigger: 'periodic_analytics',
            intelligence_level: intelligence.intelligence_level 
          });
        }
      }, 60000); // Every 60 seconds
      
      return () => clearInterval(analyticsTimer);
    }
  }, [intelligence, currentInsight, isGeneratingInsight, triggerInsightCheck]);

  // Module activity based on current question or insight
  useEffect(() => {
    if (currentQuestion) {
      setActiveModule(currentQuestion.module);
      setModuleActivity(true);
      
      const clearTimer = setTimeout(() => {
        setModuleActivity(false);
        setActiveModule(undefined);
      }, 3000);
      
      return () => clearTimeout(clearTimer);
    } else if (currentInsight) {
      setActiveModule(currentInsight.module);
      setModuleActivity(true);
      
      const clearTimer = setTimeout(() => {
        setModuleActivity(false);
        setActiveModule(undefined);
      }, 3000);
      
      return () => clearTimeout(clearTimer);
    }
  }, [currentQuestion, currentInsight]);

  const handleOrbClick = () => {
    if (currentQuestion) {
      setShowMicroLearning(true);
      setShowBubble(false);
    } else {
      setShowChat(true);
    }
  };

  const handleBubbleClick = () => {
    if (currentQuestion) {
      setShowMicroLearning(true);
      setShowBubble(false);
    }
  };

  const handleCloseChat = () => {
    setShowChat(false);
  };

  const handleCloseMicroLearning = () => {
    setShowMicroLearning(false);
    setShowBubble(false);
    clearCurrentQuestion();
  };

  const handleLearningComplete = async (growth: number) => {
    // CRITICAL: Refresh intelligence data to show updated levels in real-time
    console.log('🎯 Learning completed, refreshing intelligence for visual update...');
    await refreshIntelligence();
    
    // Show module activity based on growth
    if (growth > 0) {
      setModuleActivity(true);
      setTimeout(() => setModuleActivity(false), 2000);
    }
  };

  console.log('FloatingHACSOrb state:', { loading, intelligence, currentQuestion, currentInsight, showBubble, showChat, showMicroLearning });
  
  // Show a visible debug version when loading
  if (loading) {
    return (
      <div className="fixed bottom-6 right-6 z-50 p-4 bg-red-500 text-white rounded">
        HACS Loading...
      </div>
    );
  }

  return (
    <>
      {/* Fixed positioning container */}
      <div className={cn(
        "fixed top-32 right-4 z-50 pointer-events-none",
        className
      )}>
        <div className="relative pointer-events-auto">
          {/* Speech Bubble */}
          <AnimatePresence>
            {showBubble && currentQuestion && (
              <div 
                className="mb-3 cursor-pointer hover:scale-105 transition-transform"
                onClick={handleBubbleClick}
              >
                <SpeechBubble
                  position="top"
                  isVisible={true}
                >
                <div className="text-sm">
                  <div className="font-medium text-primary mb-1">
                    {currentQuestion.module} Learning
                  </div>
                  <div>{currentQuestion.text}</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Click to answer • Quick learning session
                  </div>
                </div>
                </SpeechBubble>
              </div>
            )}
          </AnimatePresence>

          {/* Floating Orb */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer"
          >
            <IntelligentSoulOrb
              size="sm"
              stage={orbStage}
              speaking={isGenerating || isGeneratingInsight}
              intelligenceLevel={intelligenceLevel}
              showProgressRing={intelligenceLevel > 0}
              showIntelligenceTooltip={false}
              isThinking={isThinking}
              activeModule={activeModule}
              moduleActivity={moduleActivity || isGeneratingInsight}
              onClick={handleOrbClick}
              className="shadow-lg hover:shadow-xl transition-shadow"
            />
          </motion.div>

          {/* Pulse indicator for new questions or insights */}
          {(currentQuestion || (currentInsight && !currentInsight.acknowledged)) && (
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </div>
      </div>

      {/* Insight Display */}
      {currentInsight && !currentInsight.acknowledged && (
        <HACSInsightDisplay
          insight={currentInsight}
          onAcknowledge={() => acknowledgeInsight(currentInsight.id)}
          onDismiss={dismissInsight}
          position="bottom-right"
        />
      )}

      {/* Micro Learning Modal */}
      <HACSMicroLearning
        isOpen={showMicroLearning}
        onClose={handleCloseMicroLearning}
        question={currentQuestion || undefined}
        intelligenceLevel={intelligenceLevel}
        onLearningComplete={handleLearningComplete}
      />

      {/* Chat Overlay */}
      <HACSChatOverlay
        isOpen={showChat}
        onClose={handleCloseChat}
        currentMessage={null}
        intelligenceLevel={intelligenceLevel}
      />

      {/* Steward Introduction Modal */}
      {introductionState.isActive && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card/95 backdrop-blur border border-border rounded-lg shadow-2xl max-w-md w-full mx-4"
          >
            <div className="p-6 text-center">
              <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2 text-card-foreground">HACS Companion</h1>
                <p className="text-sm text-muted-foreground mb-4">Holistic Adaptive Cognitive System</p>
                
                {/* Current step content */}
                {introductionState.steps && introductionState.steps[introductionState.currentStep] && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-3 text-card-foreground">
                      {introductionState.steps[introductionState.currentStep].title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {introductionState.steps[introductionState.currentStep].message}
                    </p>
                  </div>
                )}

                <p className="text-sm text-muted-foreground mb-6">
                  Your HACS companion is ready to assist with insights and guidance.
                </p>
                <p className="text-xs text-muted-foreground">
                  Intelligence Level: 0%
                </p>
              </div>

              {/* Continue button */}
              {introductionState.steps && 
               introductionState.steps[introductionState.currentStep] && 
               introductionState.steps[introductionState.currentStep].showContinue && (
                <button
                  onClick={async () => {
                    // Handle final step - trigger report generation
                    if (introductionState.currentStep === introductionState.steps.length - 1) {
                      await completeIntroductionWithReport();
                    } else {
                      continueIntroduction();
                    }
                  }}
                  disabled={isGeneratingReport}
                  className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isGeneratingReport ? 'Activating Steward...' : 'Continue'}
                </button>
              )}

              {/* Step indicator */}
              {introductionState.steps && introductionState.steps.length > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  {introductionState.steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === introductionState.currentStep 
                          ? 'bg-primary' 
                          : index < introductionState.currentStep 
                            ? 'bg-primary/50' 
                            : 'bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};
