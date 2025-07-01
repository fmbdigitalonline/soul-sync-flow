
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Send, ArrowLeft, Brain, Sparkles } from 'lucide-react';
import { LifeDomain } from '@/types/growth-program';
import { GuideInterface } from '@/components/coach/GuideInterface';
import { useProgramAwareCoach } from '@/hooks/use-program-aware-coach';
import { useConversationRecovery } from '@/hooks/use-conversation-recovery';
import { ConversationRecoveryBanner } from '@/components/growth/ConversationRecoveryBanner';
import { RootCauseConfirmation } from './RootCauseConfirmation';
import { growthIntelligenceFusionService, RootCauseCandidate, DepthAnalysis } from '@/services/growth-intelligence-fusion-service';
import { useAuth } from '@/contexts/AuthContext';

interface GrowthBeliefDrillingProps {
  domain: LifeDomain;
  onComplete: (beliefData: any) => void;
  beliefData: any;
}

export const GrowthBeliefDrilling: React.FC<GrowthBeliefDrillingProps> = ({
  domain,
  onComplete,
  beliefData
}) => {
  const { user } = useAuth();
  const { messages, isLoading, sendMessage, initializeBeliefDrilling, recoverConversation } = useProgramAwareCoach();
  const { availableRecoveries, loadAvailableRecoveries, deleteConversation } = useConversationRecovery();
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [showRecoveryBanner, setShowRecoveryBanner] = useState(true);
  const [fusionInitialized, setFusionInitialized] = useState(false);
  const [currentDepthAnalysis, setCurrentDepthAnalysis] = useState<DepthAnalysis | null>(null);
  const [rootCauseCandidates, setRootCauseCandidates] = useState<RootCauseCandidate[]>([]);
  const [showRootCauseConfirmation, setShowRootCauseConfirmation] = useState(false);
  const [confirmedRootCause, setConfirmedRootCause] = useState<RootCauseCandidate | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(`belief_drilling_${domain}_${Date.now()}`);

  const domainEmoji = {
    career: '🏢',
    relationships: '💕',
    wellbeing: '🌱',
    finances: '💰',
    creativity: '🎨',
    spirituality: '✨',
    home_family: '🏠'
  };

  const domainTitle = {
    career: 'Career & Purpose',
    relationships: 'Relationships & Love',
    wellbeing: 'Health & Wellbeing',
    finances: 'Money & Abundance',
    creativity: 'Creativity & Expression',
    spirituality: 'Spirituality & Meaning',
    home_family: 'Home & Family'
  };

  // Initialize intelligence fusion service
  useEffect(() => {
    const initializeFusion = async () => {
      if (!user?.id || fusionInitialized) return;

      try {
        console.log('🧠 Initializing Growth Intelligence Fusion');
        await growthIntelligenceFusionService.initialize(user.id, domain);
        setFusionInitialized(true);
        console.log('✅ Growth Intelligence Fusion initialized');
      } catch (error) {
        console.error('❌ Failed to initialize fusion service:', error);
      }
    };

    initializeFusion();
  }, [user, domain, fusionInitialized]);

  // Load available recoveries when component mounts
  useEffect(() => {
    loadAvailableRecoveries(domain);
  }, [domain, loadAvailableRecoveries]);

  // Initialize fresh conversation only if no recoveries and not initialized
  useEffect(() => {
    if (!isInitialized && availableRecoveries.length === 0 && messages.length === 0) {
      console.log('🔍 Initializing fresh belief drilling for domain:', domain);
      setIsInitialized(true);
      initializeBeliefDrilling(domain);
    }
  }, [domain, isInitialized, initializeBeliefDrilling, availableRecoveries.length, messages.length]);

  // Analyze conversation depth after each message exchange
  useEffect(() => {
    const analyzeDepth = async () => {
      if (!fusionInitialized || messages.length < 4) return;

      try {
        console.log('📊 Analyzing conversation depth...');
        const depthAnalysis = await growthIntelligenceFusionService.analyzeConversationDepth(sessionId.current);
        setCurrentDepthAnalysis(depthAnalysis);

        // If ready for root cause identification, get candidates
        if (depthAnalysis.readyForProgram && !showRootCauseConfirmation) {
          console.log('🎯 Ready for root cause identification');
          const candidates = await growthIntelligenceFusionService.identifyRootCauseCandidates(sessionId.current);
          setRootCauseCandidates(candidates);
          
          if (candidates.length > 0) {
            setShowRootCauseConfirmation(true);
          }
        }
      } catch (error) {
        console.error('❌ Error analyzing depth:', error);
      }
    };

    // Debounce the analysis
    const timer = setTimeout(analyzeDepth, 2000);
    return () => clearTimeout(timer);
  }, [messages.length, fusionInitialized, showRootCauseConfirmation]);

  const handleSendMessage = async (message: string) => {
    console.log('📤 Sending belief drilling response:', message);
    sendMessage(message);
  };

  const handleRecoverConversation = async (sessionId: string) => {
    console.log('🔄 Recovering conversation:', sessionId);
    await recoverConversation(sessionId);
    setShowRecoveryBanner(false);
    setIsInitialized(true);
  };

  const handleDismissRecovery = async (sessionId: string) => {
    await deleteConversation(sessionId);
    setShowRecoveryBanner(false);
    
    // Start fresh conversation if not already initialized
    if (!isInitialized && messages.length === 0) {
      setIsInitialized(true);
      initializeBeliefDrilling(domain);
    }
  };

  const handleRootCauseConfirm = (rootCause: RootCauseCandidate) => {
    console.log('✅ Root cause confirmed:', rootCause.description);
    setConfirmedRootCause(rootCause);
    handleContinue();
  };

  const handleRootCauseReject = (rootCauseId: string) => {
    console.log('❌ Root cause rejected:', rootCauseId);
    setRootCauseCandidates(prev => prev.filter(c => c.id !== rootCauseId));
    
    // If no candidates left, continue drilling
    if (rootCauseCandidates.length <= 1) {
      setShowRootCauseConfirmation(false);
    }
  };

  const handleContinueDrilling = () => {
    console.log('🔄 Continuing deeper drilling...');
    setShowRootCauseConfirmation(false);
    setRootCauseCandidates([]);
  };

  const handleContinue = () => {
    console.log('✅ Belief drilling complete, extracting data from', messages.length, 'messages');
    
    // Extract comprehensive belief data using fusion intelligence
    const extractedBeliefs = {
      domain,
      conversations: messages,
      depthAnalysis: currentDepthAnalysis,
      confirmedRootCause: confirmedRootCause,
      keyInsights: extractKeyInsights(messages),
      coreChallenges: extractCoreChallenges(messages),
      rootCauses: confirmedRootCause ? [confirmedRootCause.description] : extractRootCauses(messages),
      emotionalResonance: confirmedRootCause?.emotionalResonance || 0.5,
      patternStrength: confirmedRootCause?.patternStrength || 0.5,
      beliefMappingScore: confirmedRootCause?.beliefMappingScore || 0.5,
      intelligenceFusionUsed: true
    };
    
    console.log('📊 Extracted comprehensive belief data:', extractedBeliefs);
    onComplete(extractedBeliefs);
  };

  // Enhanced extraction methods
  function extractKeyInsights(msgs: any[]) {
    return msgs
      .filter(m => m.sender === 'user')
      .map(m => m.content)
      .slice(-5); // Get more insights with fusion
  }

  function extractCoreChallenges(msgs: any[]) {
    const challenges = [];
    const userMessages = msgs.filter(m => m.sender === 'user');
    
    for (const msg of userMessages) {
      const content = msg.content.toLowerCase();
      if (content.includes('struggle') || content.includes('difficult') || 
          content.includes('challenge') || content.includes('fear') ||
          content.includes('stuck') || content.includes('overwhelmed')) {
        challenges.push(msg.content);
      }
    }
    
    return challenges.slice(0, 5); // More challenges with better detection
  }

  function extractRootCauses(msgs: any[]) {
    const patterns = [];
    const userMessages = msgs.filter(m => m.sender === 'user');
    
    for (const msg of userMessages) {
      const content = msg.content.toLowerCase();
      if (content.includes('because') || content.includes('always') || 
          content.includes('never') || content.includes('believe') ||
          content.includes('think') || content.includes('feel like')) {
        patterns.push(msg.content);
      }
    }
    
    return patterns.slice(0, 5); // Better pattern extraction
  }

  if (showRootCauseConfirmation && currentDepthAnalysis) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b bg-gradient-to-r from-soul-purple/5 to-soul-teal/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">{domainEmoji[domain]}</div>
              <div>
                <h2 className="text-xl font-bold">Root Cause Identification - {domainTitle[domain]}</h2>
                <p className="text-sm text-muted-foreground">
                  AI-powered deep analysis complete
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRootCauseConfirmation(false)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Conversation
            </Button>
          </div>
        </div>

        {/* Root Cause Confirmation */}
        <div className="flex-1 p-6 overflow-y-auto">
          <RootCauseConfirmation
            candidates={rootCauseCandidates}
            depthAnalysis={currentDepthAnalysis}
            onConfirm={handleRootCauseConfirm}
            onReject={handleRootCauseReject}
            onContinueDrilling={handleContinueDrilling}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b bg-gradient-to-r from-soul-purple/5 to-soul-teal/5">
        <div className="flex items-center space-x-4">
          <div className="text-3xl">{domainEmoji[domain]}</div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">Exploring {domainTitle[domain]}</h2>
            <p className="text-sm text-muted-foreground">
              AI-powered deep dive into your motivations and beliefs
            </p>
          </div>
          
          {/* Intelligence Status */}
          {fusionInitialized && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 px-2 py-1 bg-purple-100 rounded-full">
                <Brain className="w-3 h-3 text-purple-600" />
                <span className="text-xs text-purple-800">AI Fusion Active</span>
              </div>
              {currentDepthAnalysis && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 rounded-full">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  <span className="text-xs text-blue-800">
                    {Math.round(currentDepthAnalysis.overallDepth * 100)}% Depth
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Conversation Recovery Banner */}
      {showRecoveryBanner && availableRecoveries.length > 0 && (
        <div className="flex-shrink-0 p-4">
          <ConversationRecoveryBanner
            recoveries={availableRecoveries}
            onRecover={handleRecoverConversation}
            onDismiss={handleDismissRecovery}
            onClose={() => setShowRecoveryBanner(false)}
          />
        </div>
      )}

      {/* Chat Interface */}
      <div className="flex-1 min-h-0">
        <GuideInterface
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          messagesEndRef={messagesEndRef}
        />
      </div>

      {/* Enhanced Action Bar */}
      {currentDepthAnalysis && (
        <div className="flex-shrink-0 p-4 border-t bg-gray-50">
          <div className="max-w-4xl mx-auto">
            {currentDepthAnalysis.readyForProgram ? (
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Deep insights discovered! Ready for root cause identification.
                    </span>
                  </div>
                </div>
                <Button 
                  onClick={() => setShowRootCauseConfirmation(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Identify Root Causes
                </Button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Depth Progress:</span> {Math.round(currentDepthAnalysis.overallDepth * 100)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {currentDepthAnalysis.nextRecommendedAction}
                  </div>
                </div>
                {messages.length >= 8 && (
                  <Button 
                    variant="outline"
                    onClick={handleContinue}
                    className="text-sm"
                  >
                    Generate Program Anyway
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fallback Action Bar (if fusion not ready) */}
      {!currentDepthAnalysis && messages.length >= 6 && (
        <div className="flex-shrink-0 p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center max-w-2xl mx-auto">
            <p className="text-sm text-muted-foreground">
              Ready to create your personalized growth program?
            </p>
            <Button 
              onClick={handleContinue}
              className="bg-soul-purple hover:bg-soul-purple/90"
            >
              Generate My Program
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
