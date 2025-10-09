import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  calculateIntelligenceTrend, 
  calculateLearningStreak, 
  getRecentPerformanceScore,
  analyzePeakLearningTimes,
  calculateActivityFrequency,
  analyzeModulePerformance,
  getMemoryAccessPatterns,
  trackQuestionDifficulty
} from '@/utils/insight-analytics';
import { useHacsIntelligence } from './use-hacs-intelligence';
import { translateAnalyticsToOracle, PersonalityContext } from '@/utils/oracle-insight-translator';
import { usePersonalityEngine } from './use-personality-engine';
import { useStewardIntroduction } from './use-steward-introduction';
// Phase 1: Enhanced Intelligence Services Integration
import { SmartInsightController } from '@/services/smart-insight-controller';
import { enhancedMemoryIntelligence } from '@/services/enhanced-memory-intelligence';
import { behavioralPatternIntelligence } from '@/services/behavioral-pattern-intelligence';
import { unifiedBrainContext } from '@/services/unified-brain-context';
import { hermeticInsightExtractor } from '@/services/hermetic-insight-extractor';
import { useHermeticReportStatus } from './use-hermetic-report-status';

export interface HACSInsight {
  id: string;
  text: string;
  module: string;
  type: 'productivity' | 'behavioral' | 'growth' | 'learning' | 'intelligence_trend' | 'learning_streak' | 'performance_trend' | 'peak_times' | 'activity_frequency' | 'module_performance' | 'memory_patterns' | 'difficulty_progression' | 'steward_introduction' | 'memory_enhanced' | 'behavioral_enhanced' | 'predictive' | 'conversation_shadow' | 'conversation_nullification' | 'hermetic_progress';
  confidence: number;
  evidence: string[];
  timestamp: Date;
  acknowledged: boolean;
  showContinue?: boolean;
  personalizedMessage?: string;
  onContinue?: () => void;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export const useHACSInsights = () => {
  const { user } = useAuth();
  const { intelligence } = useHacsIntelligence();
  const { generateOraclePrompt } = usePersonalityEngine();
  const { 
    introductionState, 
    isGeneratingReport, 
    continueIntroduction, 
    completeIntroductionWithReport,
    shouldStartIntroduction,
    startIntroduction 
  } = useStewardIntroduction();
  const { hasReport: hasHermeticReport } = useHermeticReportStatus();
  
  // Phase 1: Insight Queue System (max 3 insights)
  const [insightQueue, setInsightQueue] = useState<HACSInsight[]>([]);
  const [currentInsightIndex, setCurrentInsightIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [insightHistory, setInsightHistory] = useState<HACSInsight[]>([]);
  const [lastInsightTime, setLastInsightTime] = useState<number>(0);
  
  // Computed current insight from queue
  const currentInsight = insightQueue.length > 0 ? insightQueue[currentInsightIndex] : null;
  
  // Phase 1: Queue Management Functions
  const addInsightToQueue = useCallback((insight: HACSInsight) => {
    setInsightQueue(prev => {
      // Remove duplicates and limit to 3 insights
      const filtered = prev.filter(existing => existing.id !== insight.id);
      const newQueue = [insight, ...filtered].slice(0, 3);
      
      // Reset index if needed
      if (newQueue.length > 0) {
        setCurrentInsightIndex(0);
      }
      
      console.log('📋 Added insight to queue:', { 
        insightId: insight.id, 
        queueLength: newQueue.length, 
        type: insight.type 
      });
      
      return newQueue;
    });
  }, []);
  
  const nextInsight = useCallback(() => {
    if (insightQueue.length > 1) {
      setCurrentInsightIndex(prev => 
        prev < insightQueue.length - 1 ? prev + 1 : 0
      );
    }
  }, [insightQueue.length]);
  
  const previousInsight = useCallback(() => {
    if (insightQueue.length > 1) {
      setCurrentInsightIndex(prev => 
        prev > 0 ? prev - 1 : insightQueue.length - 1
      );
    }
  }, [insightQueue.length]);
  
  const removeCurrentInsight = useCallback(() => {
    if (insightQueue.length > 0) {
      const currentId = insightQueue[currentInsightIndex]?.id;
      setInsightQueue(prev => prev.filter(insight => insight.id !== currentId));
      
      // Adjust index if needed
      setCurrentInsightIndex(prev => {
        const newLength = insightQueue.length - 1;
        if (newLength === 0) return 0;
        if (prev >= newLength) return newLength - 1;
        return prev;
      });
    }
  }, [insightQueue, currentInsightIndex]);

  // Step 1: Load Historical Database Insights
  const loadHistoricalInsights = useCallback(async (): Promise<HACSInsight[]> => {
    if (!user) return [];
    
    console.log('📚 Loading historical insights from database...');
    
    try {
      const { data: historicalInsights, error } = await supabase
        .from('hacs_module_insights')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
        .gte('confidence_score', 0.7) // Only high-confidence insights
        .order('confidence_score', { ascending: false })
        .limit(5);

      if (error) {
        console.error('🚨 Error loading historical insights:', error);
        return [];
      }

      if (!historicalInsights || historicalInsights.length === 0) {
        console.log('📚 No historical insights found');
        return [];
      }

      console.log('📚 Historical insights loaded:', historicalInsights.length);

      // Convert database format to HACSInsight format
      const convertedInsights: HACSInsight[] = historicalInsights.map(dbInsight => {
        // Parse insight_data as JSON
        const insightData = typeof dbInsight.insight_data === 'string' 
          ? JSON.parse(dbInsight.insight_data) 
          : dbInsight.insight_data;
          
        return {
          id: `historical_${dbInsight.id}`,
          text: insightData?.insight_text || 'Historical insight',
          module: dbInsight.hacs_module || 'Historical',
          type: dbInsight.insight_type === 'behavioral' ? 'behavioral' : 'productivity',
          confidence: dbInsight.confidence_score || 0.8,
          evidence: Array.isArray(insightData?.evidence) ? insightData.evidence : [],
          timestamp: new Date(dbInsight.created_at),
          acknowledged: false,
          priority: dbInsight.confidence_score > 0.9 ? 'high' : 'medium'
        };
      });

      console.log('📚 Converted historical insights:', convertedInsights.length);
      return convertedInsights;
    } catch (error) {
      console.error('🚨 Error in loadHistoricalInsights:', error);
      return [];
    }
  }, [user]);

  // Track user activity for insight generation
  const trackActivity = useCallback(async (activityType: string, activityData?: any) => {
    if (!user) return;

    try {
      await supabase.from('dream_activity_logs').insert({
        user_id: user.id,
        activity_type: activityType,
        activity_data: activityData || {},
        session_id: `activity_${Date.now()}`
      });
      
      // Also track with smart insight controller
      if (activityType.includes('conversation')) {
        SmartInsightController.trackUserActivity(user.id, 'conversation');
      }
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }, [user]);

  // Generate conversation-derived insights (priority)
  const generateConversationInsights = useCallback(async (): Promise<HACSInsight[]> => {
    if (!user) {
      console.log('🎯 generateConversationInsights: No user available');
      return [];
    }

    try {
      console.log('🎯 Generating conversation-derived insights for user:', user.id);
      const conversationInsights = await SmartInsightController.generateConversationInsights(user.id);
      
      console.log('🎯 Generated conversation insights:', {
        count: conversationInsights.length,
        types: conversationInsights.map(i => i.type)
      });
      
      const formattedInsights: HACSInsight[] = conversationInsights.map(insight => ({
        id: insight.id,
        text: `${insight.message}\n\nActionable steps:\n${insight.actionableSteps.map(step => `• ${step}`).join('\n')}`,
        module: 'Conversation',
        type: (insight.type === 'shadow_work' ? 'conversation_shadow' : 'conversation_nullification') as HACSInsight['type'],
        confidence: insight.confidence,
        evidence: [insight.conversationContext, `Pattern frequency: ${insight.shadowPattern.frequency}`],
        timestamp: new Date(),
        acknowledged: false,
        priority: insight.priority
      }));
      
      // Add insights to queue
      if (formattedInsights.length > 0) {
        console.log('🎯 Adding conversation insights to queue:', formattedInsights.length);
        formattedInsights.forEach(insight => addInsightToQueue(insight));
        
        // Record delivery
        SmartInsightController.recordInsightDelivery(user.id, 'conversation');
      } else {
        console.log('🎯 No conversation insights to add to queue');
      }
      
      return formattedInsights;
    } catch (error) {
      console.error('🚨 Error generating conversation insights:', error);
      return [];
    }
  }, [user, addInsightToQueue]);

  // Generate analytics-based insights using real user data (secondary priority)
  const generateAnalyticsInsight = useCallback(async (personalityContext?: PersonalityContext): Promise<HACSInsight | null> => {
    if (!user || !intelligence) return null;

    // Check if we can deliver analytical insights (max 1 per day)
    if (!SmartInsightController.canDeliverAnalyticalInsight(user.id)) {
      console.log('📊 Analytics insight delivery limit reached');
      return null;
    }

    // Check if there's sufficient data
    const hasSufficientData = await SmartInsightController.hasSufficientDataForAnalytics(user.id);
    if (!hasSufficientData) {
      console.log('📊 Insufficient data for analytics insights');
      return null;
    }

    try {
      // Get user blueprint for personality-aware insights
      const { data: blueprint } = await supabase
        .from('user_blueprints')
        .select('blueprint')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      const personalityCtx: PersonalityContext = {
        blueprint: blueprint?.blueprint || null,
        communicationStyle: personalityContext?.communicationStyle || 'mystical',
        preferredTone: personalityContext?.preferredTone || 'supportive',
        timingPattern: personalityContext?.timingPattern || 'immediate'
      };
      // Try different analytics in order of complexity (low hanging fruit first)
      
      // 1. Intelligence trend analysis
      const intelligenceTrend = await calculateIntelligenceTrend(user.id, 168); // 7 days
      if (intelligenceTrend && intelligenceTrend.direction !== 'stable') {
        const rawInsight: HACSInsight = {
          id: `trend_${Date.now()}`,
          text: `Your intelligence has been ${intelligenceTrend.direction} by ${intelligenceTrend.changePercent.toFixed(1)}% over the past week. Current level: ${intelligenceTrend.currentLevel}%`,
          module: 'Analytics',
          type: 'intelligence_trend',
          confidence: 0.9,
          evidence: [`Previous level: ${intelligenceTrend.previousLevel}%`, `Current level: ${intelligenceTrend.currentLevel}%`],
          timestamp: new Date(),
          acknowledged: false
        };
        return translateAnalyticsToOracle(rawInsight, personalityCtx);
      }

      // 2. Learning streak analysis
      const learningStreak = await calculateLearningStreak(user.id);
      if (learningStreak && learningStreak.currentStreak > 1) {
        const rawInsight: HACSInsight = {
          id: `streak_${Date.now()}`,
          text: `You're on a ${learningStreak.currentStreak}-day learning streak! Your longest streak was ${learningStreak.longestStreak} days.`,
          module: 'Analytics',
          type: 'learning_streak',
          confidence: 0.95,
          evidence: [`Current streak: ${learningStreak.currentStreak} days`, `Personal best: ${learningStreak.longestStreak} days`],
          timestamp: new Date(),
          acknowledged: false
        };
        return translateAnalyticsToOracle(rawInsight, personalityCtx);
      }

      // 3. Performance trend analysis
      const performanceScore = await getRecentPerformanceScore(user.id, 72); // 3 days
      if (performanceScore && performanceScore.trend !== 'stable' && performanceScore.sampleSize >= 3) {
        const rawInsight: HACSInsight = {
          id: `performance_${Date.now()}`,
          text: `Your response quality has been ${performanceScore.trend} with an average score of ${performanceScore.averageScore.toFixed(1)} over ${performanceScore.sampleSize} interactions.`,
          module: 'Analytics',
          type: 'performance_trend',
          confidence: 0.8,
          evidence: [`Average score: ${performanceScore.averageScore.toFixed(1)}`, `Sample size: ${performanceScore.sampleSize} interactions`],
          timestamp: new Date(),
          acknowledged: false
        };
        return translateAnalyticsToOracle(rawInsight, personalityCtx);
      }

      // 4. Module performance analysis
      const modulePerformance = analyzeModulePerformance(intelligence);
      const topModule = modulePerformance[0];
      const bottomModule = modulePerformance[modulePerformance.length - 1];
      
      if (topModule && bottomModule && topModule.currentScore - bottomModule.currentScore > 10) {
        const rawInsight: HACSInsight = {
          id: `modules_${Date.now()}`,
          text: `Your strongest module is ${topModule.moduleName} (${topModule.currentScore}%), while ${bottomModule.moduleName} (${bottomModule.currentScore}%) could use more attention.`,
          module: 'Analytics',
          type: 'module_performance',
          confidence: 0.85,
          evidence: [`Strongest: ${topModule.moduleName} (${topModule.currentScore}%)`, `Developing: ${bottomModule.moduleName} (${bottomModule.currentScore}%)`],
          timestamp: new Date(),
          acknowledged: false
        };
        return translateAnalyticsToOracle(rawInsight, personalityCtx);
      }

      // 5. Peak learning times analysis
      const peakTimes = await analyzePeakLearningTimes(user.id);
      if (peakTimes.length > 0) {
        const topTime = peakTimes[0];
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const timeStr = `${topTime.hour}:00`;
        
        const rawInsight: HACSInsight = {
          id: `peak_${Date.now()}`,
          text: `Your peak learning time is ${days[topTime.dayOfWeek]} at ${timeStr} with ${topTime.activityCount} activities and ${(topTime.averagePerformance * 100).toFixed(0)}% average performance.`,
          module: 'Analytics',
          type: 'peak_times',
          confidence: 0.8,
          evidence: [`${topTime.activityCount} activities`, `${(topTime.averagePerformance * 100).toFixed(0)}% performance`],
          timestamp: new Date(),
          acknowledged: false
        };
        return translateAnalyticsToOracle(rawInsight, personalityCtx);
      }

      // 6. Activity frequency patterns
      const activityFreqs = await calculateActivityFrequency(user.id);
      if (activityFreqs.length > 0) {
        const topActivity = activityFreqs[0];
        
        const rawInsight: HACSInsight = {
          id: `activity_${Date.now()}`,
          text: `Your most frequent activity is "${topActivity.activityType}" with ${topActivity.count} occurrences. This happens ${topActivity.frequency}.`,
          module: 'Analytics',
          type: 'activity_frequency',
          confidence: 0.75,
          evidence: [`${topActivity.count} occurrences`, `${topActivity.frequency} frequency`],
          timestamp: new Date(),
          acknowledged: false
        };
        return translateAnalyticsToOracle(rawInsight, personalityCtx);
      }

      // 7. Memory access patterns
      const memoryPatterns = await getMemoryAccessPatterns(user.id);
      if (memoryPatterns.length > 0) {
        const topTier = memoryPatterns[0];
        
        const rawInsight: HACSInsight = {
          id: `memory_${Date.now()}`,
          text: `Your most accessed memory tier is "${topTier.tier}" with ${topTier.accessCount} accesses and ${topTier.averageLatency.toFixed(0)}ms average latency.`,
          module: 'Analytics',
          type: 'memory_patterns',
          confidence: 0.7,
          evidence: [`${topTier.accessCount} accesses`, `${topTier.averageLatency.toFixed(0)}ms latency`],
          timestamp: new Date(),
          acknowledged: false
        };
        return translateAnalyticsToOracle(rawInsight, personalityCtx);
      }

      // 8. Question difficulty progression
      const difficultyProgress = await trackQuestionDifficulty(user.id);
      if (difficultyProgress && Math.abs(difficultyProgress.progressionRate) > 5) {
        const direction = difficultyProgress.progressionRate > 0 ? 'increasing' : 'decreasing';
        
        const rawInsight: HACSInsight = {
          id: `difficulty_${Date.now()}`,
          text: `Your question difficulty is ${direction} with an average difficulty of ${difficultyProgress.averageDifficulty.toFixed(1)} and a progression rate of ${Math.abs(difficultyProgress.progressionRate).toFixed(1)}.`,
          module: 'Analytics',
          type: 'difficulty_progression',
          confidence: 0.8,
          evidence: [`Average difficulty: ${difficultyProgress.averageDifficulty.toFixed(1)}`, `${direction} progression`],
          timestamp: new Date(),
          acknowledged: false
        };
        return translateAnalyticsToOracle(rawInsight, personalityCtx);
      }

      return null;
    } catch (error) {
      console.error('Error generating analytics insight:', error);
      return null;
    }
  }, [user, intelligence]);

  // Phase 1: Generate Enhanced Intelligence Insights using Rich Intelligence Bridge
  const generateEnhancedInsights = useCallback(async (): Promise<HACSInsight[]> => {
    if (!user) {
      console.log('🧠 No user available for enhanced insights');
      return [];
    }
    
    console.log('🧠 Starting Enhanced Intelligence Pipeline with conversation insights...');
    const insights: HACSInsight[] = [];
    
    try {
      // PRIORITY 1: Conversation-Derived Insights (highest priority, no daily limit)
      console.log('🎯 Phase 1: Generating conversation-derived insights...');
      try {
        const conversationInsights = await generateConversationInsights();
        console.log('🎯 Conversation insights result:', { 
          count: conversationInsights?.length || 0,
          types: conversationInsights?.map(i => i.type) || []
        });
        insights.push(...(conversationInsights || []));
      } catch (conversationError) {
        console.error('🚨 Conversation insights error:', conversationError);
      }

      // PRIORITY 2: Rich Intelligence Bridge - Warm Personalized Insights
      console.log('🌟 Phase 2: Calling Rich Intelligence Bridge for warm insights...');
      const { RichIntelligenceBridge } = await import('@/services/rich-intelligence-bridge');
      // 1. Rich Intelligence Bridge - Warm Personalized Insights
      try {
        const warmInsights = await RichIntelligenceBridge.generateWarmInsights(user.id);
        console.log('🌟 Warm insights result:', { 
          count: warmInsights?.length || 0,
          types: warmInsights?.map(i => i.type) || []
        });
        
        insights.push(...(warmInsights || []));
      } catch (warmError) {
        console.error('🚨 Rich Intelligence Bridge error:', warmError);
      }
      
      // PRIORITY 3: Memory-Enhanced Insights (fallback)
      console.log('🧠 Phase 3: Calling enhanced memory intelligence service...');
      try {
        const memoryInsights = await enhancedMemoryIntelligence.generateMemoryInsights(user.id);
        console.log('🧠 Memory insights result:', { 
          count: memoryInsights?.length || 0,
          insights: memoryInsights?.map(i => ({ theme: i.pattern.theme, confidence: i.confidence })) || []
        });
        
        for (const memoryInsight of memoryInsights || []) {
          insights.push({
            id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            text: memoryInsight.insight,
            module: 'Enhanced Memory',
            type: 'memory_enhanced',
            confidence: memoryInsight.confidence || 0.8,
            evidence: [memoryInsight.pattern.theme, `Frequency: ${memoryInsight.pattern.frequency}`],
            timestamp: new Date(),
            acknowledged: false,
            priority: memoryInsight.personalityAlignment > 0.8 ? 'high' : 'medium'
          });
        }
      } catch (memoryError) {
        console.error('🚨 Memory intelligence service error:', memoryError);
      }
      
      // PRIORITY 4: Behavioral Pattern Insights (fallback)  
      console.log('🧠 Phase 4: Calling behavioral pattern intelligence service...');
      try {
        const behavioralInsights = await behavioralPatternIntelligence.generateBehavioralInsights(user.id);
        console.log('🧠 Behavioral insights result:', { 
          count: behavioralInsights?.length || 0,
          insights: behavioralInsights?.map(i => ({ type: i.pattern.patternType, confidence: i.confidence })) || []
        });
        
        for (const behavioralInsight of behavioralInsights || []) {
          insights.push({
            id: `behavioral_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            text: behavioralInsight.insight,
            module: 'Behavioral Intelligence',
            type: 'behavioral_enhanced',
            confidence: behavioralInsight.confidence || 0.75,
            evidence: [
              behavioralInsight.pattern.patternType,
              `Strength: ${behavioralInsight.pattern.strength.toFixed(1)}`
            ],
            timestamp: new Date(),
            acknowledged: false,
            priority: behavioralInsight.personalityAlignment > 0.8 ? 'high' : 'medium'
          });
        }
      } catch (behavioralError) {
        console.error('🚨 Behavioral intelligence service error:', behavioralError);
      }
      
      // 3. Predictive Insights (Future enhancement)
      // const predictiveInsights = await predictiveIntelligence.generatePredictiveInsights(user.id);
      
      // Sort insights by priority: conversation > intelligence > memory > behavioral
      const priorityOrder = {
        'conversation_shadow': 1,
        'conversation_nullification': 2,
        'predictive': 3,
        'memory_enhanced': 4,
        'behavioral_enhanced': 5
      };

      insights.sort((a, b) => {
        const aPriority = priorityOrder[a.type as keyof typeof priorityOrder] || 10;
        const bPriority = priorityOrder[b.type as keyof typeof priorityOrder] || 10;
        if (aPriority !== bPriority) return aPriority - bPriority;
        return b.confidence - a.confidence; // Higher confidence first within same priority
      });

      console.log('🧠 Enhanced insights generation complete:', {
        totalGenerated: insights.length,
        conversationInsights: insights.filter(i => i.type.includes('conversation')).length,
        memoryInsights: insights.filter(i => i.type === 'memory_enhanced').length,
        behavioralInsights: insights.filter(i => i.type === 'behavioral_enhanced').length,
        priorityOrder: insights.map(i => ({ type: i.type, confidence: i.confidence }))
      });
      
      return insights;
    } catch (error) {
      console.error('🚨 Critical error in generateEnhancedInsights:', error);
      return [];
    }
  }, [user]);

  // Generate insights from completed hermetic report
  const generateHermeticReportInsights = useCallback(async (): Promise<HACSInsight[]> => {
    if (!user || !hasHermeticReport) {
      console.log('📄 No hermetic report available for insights');
      return [];
    }

    console.log('🔮 Generating insights from hermetic report...');
    try {
      const hermeticInsights = await hermeticInsightExtractor.generateHermeticReportInsights(user.id);
      console.log('✨ Hermetic insights generated:', hermeticInsights.length);
      return hermeticInsights;
    } catch (error) {
      console.error('🚨 Error generating hermetic insights:', error);
      return [];
    }
  }, [user, hasHermeticReport]);

  // Create steward introduction insight
  const createStewardIntroductionInsight = useCallback(() => {
    if (!introductionState.isActive || !introductionState.steps[introductionState.currentStep]) {
      return null;
    }

    const currentStep = introductionState.steps[introductionState.currentStep];
    const isLastStep = introductionState.currentStep === introductionState.steps.length - 1;

    const insight: HACSInsight = {
      id: `steward_intro_${currentStep.id}`,
      text: currentStep.message,
      module: 'Steward',
      type: 'steward_introduction',
      confidence: 1.0,
      evidence: [currentStep.title],
      timestamp: new Date(),
      acknowledged: false,
      showContinue: true,
      onContinue: isLastStep ? completeIntroductionWithReport : continueIntroduction
    };

    return insight;
  }, [introductionState, continueIntroduction, completeIntroductionWithReport]);

  // Generate authentic insights based on real user data (enhanced with personality)
  const generateInsight = useCallback(async (currentContext?: string, personalityContext?: any) => {
    if (!user || isGenerating) return null;

    // Check for steward introduction first
    if (introductionState.isActive) {
      const introInsight = createStewardIntroductionInsight();
      if (introInsight) {
        addInsightToQueue(introInsight);
        setInsightHistory(prev => [introInsight, ...prev].slice(0, 20));
        console.log('✅ Steward introduction insight created:', introInsight.text);
        return introInsight;
      }
    }

    // Prevent too frequent insight generation (minimum 30 seconds between insights)
    const now = Date.now();
    if (now - lastInsightTime < 30 * 1000) {
      console.log('🔍 Too soon for next insight, waiting...');
      return null;
    }

    console.log('🔍 Generating HACS insight...');
    setIsGenerating(true);
    
    try {
      // PRIORITY 1: Hermetic report insights (immediate after completion)
      if (hasHermeticReport) {
        console.log('🔮 Prioritizing hermetic report insights...');
        const hermeticInsights = await generateHermeticReportInsights();
        
        if (hermeticInsights && hermeticInsights.length > 0) {
          // Sort by priority and confidence
          const sortedInsights = hermeticInsights.sort((a, b) => {
            const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
            const aPriority = priorityWeight[a.priority || 'medium'];
            const bPriority = priorityWeight[b.priority || 'medium'];
            
            if (aPriority !== bPriority) return bPriority - aPriority;
            return b.confidence - a.confidence;
          });
          
          // Add the best hermetic insight to queue
          const insight = sortedInsights[0];
          addInsightToQueue(insight);
          
          // Store in history
          setInsightHistory(prev => [insight, ...prev].slice(0, 20));
          setLastInsightTime(now);
          
          console.log('✅ Hermetic insight generated:', insight.type);
          return insight;
        }
      }

      // Step 1: Load historical insights on first run (if queue is empty)
      if (insightQueue.length === 0) {
        console.log('🔍 Queue empty, loading historical insights...');
        const historicalInsights = await loadHistoricalInsights();
        if (historicalInsights.length > 0) {
          for (const insight of historicalInsights.slice(0, 2)) { // Max 2 historical insights
            addInsightToQueue(insight);
            setInsightHistory(prev => [insight, ...prev].slice(0, 20));
          }
          console.log('✅ Historical insights loaded into queue:', historicalInsights.length);
        }
      }
      
      // PRIORITY 2: Enhanced intelligence services (rich, personalized)
      const enhancedInsights = await generateEnhancedInsights();
      if (enhancedInsights.length > 0) {
        // Add all enhanced insights to queue, prioritizing by confidence
        const sortedInsights = enhancedInsights.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
        
        for (const insight of sortedInsights.slice(0, 2)) { // Max 2 enhanced insights
          addInsightToQueue(insight);
          setInsightHistory(prev => [insight, ...prev].slice(0, 20));
        }
        
        setLastInsightTime(now);
        console.log('✅ Enhanced intelligence insights generated:', enhancedInsights.length);
        return sortedInsights[0];
      }
      
      // PRIORITY 3: Analytics-based insights (fast, local analysis)
      const analyticsInsight = await generateAnalyticsInsight();
      if (analyticsInsight) {
        addInsightToQueue(analyticsInsight);
        setInsightHistory(prev => [analyticsInsight, ...prev].slice(0, 20));
        setLastInsightTime(now);
        
        console.log('✅ Analytics insight generated:', analyticsInsight.type);
        return analyticsInsight;
      }

      // Fall back to edge function for complex analysis (enhanced with personality)
      const { data, error } = await supabase.functions.invoke('hacs-authentic-insights', {
        body: {
          userId: user.id,
          sessionId: `insight_${Date.now()}`,
          currentContext: currentContext || 'general_usage',
          personalityContext: personalityContext || null // NEW: Include personality context
        }
      });

      console.log('🔍 Insight edge function response:', { data, error });

      if (error) {
        console.error('🔍 Insight edge function error:', error);
        throw error;
      }

      if (data?.insight) {
        const insight: HACSInsight = {
          id: data.insight.id || `insight_${Date.now()}`,
          text: data.insight.text || data.insight.message,
          module: data.insight.module || data.insight.hacs_module || 'NIK',
          type: data.insight.type || data.insight.insight_type || 'learning',
          confidence: data.insight.confidence || 0.7,
          evidence: data.insight.evidence || [],
          timestamp: new Date(),
          acknowledged: false
        };

        addInsightToQueue(insight);
        setInsightHistory(prev => [insight, ...prev].slice(0, 20)); // Keep last 20 insights
        setLastInsightTime(now);

        console.log('✅ Insight generated successfully:', {
          module: insight.module,
          type: insight.type,
          confidence: insight.confidence,
          dataAnalyzed: data.dataAnalyzed
        });

        return insight;
      } else {
        console.log('❌ No insight in response:', data?.reason, data?.message);
        return null;
      }

    } catch (error) {
      console.error('❌ Error generating insight:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [user, isGenerating, lastInsightTime, generateAnalyticsInsight, generateEnhancedInsights, generateHermeticReportInsights, hasHermeticReport, addInsightToQueue, setInsightHistory, setLastInsightTime, introductionState, createStewardIntroductionInsight, loadHistoricalInsights, insightQueue, currentInsightIndex]);

  // CRITICAL FIX: Acknowledge an insight and properly clear it from current display
  const acknowledgeInsight = useCallback((insightId: string) => {
    console.log('🎯 Acknowledging insight:', insightId);
    
    // Update both queue and history to mark as acknowledged
    setInsightQueue(prev => 
      prev.map(insight => 
        insight.id === insightId ? { ...insight, acknowledged: true } : insight
      )
    );
    setInsightHistory(prev => 
      prev.map(insight => 
        insight.id === insightId ? { ...insight, acknowledged: true } : insight
      )
    );
    
    // CRITICAL FIX: Clear the current insight by removing from queue
    setInsightQueue(prevQueue => {
      if (prevQueue.length > 0 && prevQueue[currentInsightIndex]?.id === insightId) {
        console.log('🎯 Clearing current acknowledged insight from queue');
        const newQueue = prevQueue.filter(insight => insight.id !== insightId);
        // Adjust current index if needed
        if (currentInsightIndex >= newQueue.length && newQueue.length > 0) {
          setCurrentInsightIndex(0);
        }
        return newQueue;
      }
      return prevQueue;
    });
  }, []);

  // Dismiss current insight (without acknowledging - user wants it gone)
  const dismissInsight = useCallback(() => {
    if (currentInsight) {
      console.log('🚫 User dismissed insight:', currentInsight.id);
      removeCurrentInsight();
    }
  }, [currentInsight, removeCurrentInsight]);

  // Smart insight triggers based on real activity patterns
  const triggerInsightCheck = useCallback(async (activityType: string, context?: any) => {
    console.log('🔍 triggerInsightCheck called:', { 
      activityType, 
      currentInsight: !!currentInsight, 
      isGenerating,
      context 
    });
    
    // Track the activity first
    await trackActivity(activityType, context);

    // Check for steward introduction trigger first
    if (activityType === 'check_steward_introduction') {
      console.log('🎭 Checking if steward introduction should start...');
      const shouldStart = await shouldStartIntroduction();
      console.log('🎭 Should start introduction:', shouldStart);
      
      if (shouldStart) {
        console.log('🎭 Starting steward introduction...');
        await startIntroduction();
        
        // Small delay to allow introduction state to update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const introInsight = createStewardIntroductionInsight();
        console.log('🎭 Created introduction insight:', !!introInsight);
        
        if (introInsight) {
          addInsightToQueue(introInsight);
          setInsightHistory(prev => [introInsight, ...prev].slice(0, 20));
          console.log('✅ Steward introduction triggered successfully');
          return introInsight;
        } else {
          console.log('❌ Failed to create steward introduction insight');
        }
      } else {
        console.log('🎭 Steward introduction not needed or already completed');
      }
      return null;
    }

    // Check for conversation insights first (highest priority)
    if (activityType === 'conversation_ended') {
      console.log('💬 Conversation ended - checking for conversation insights');
      try {
        const conversationInsights = await generateConversationInsights();
        if (conversationInsights.length > 0) {
          console.log('✅ Generated and queued conversation insights:', conversationInsights.length);
          return conversationInsights[0]; // Return first insight
        } else {
          console.log('💬 No conversation insights available');
        }
      } catch (error) {
        console.error('🚨 Error generating conversation insights:', error);
      }
    }

    // Only generate insights for meaningful activities
    const meaningfulActivities = [
      'blueprint_completed',
      'learning_session_completed',
      'conversation_ended',
      'task_completed',
      'pattern_detected',
      'periodic_activity', // Add periodic activity as meaningful
      'intelligence_check', // New analytics trigger
      'performance_review', // New analytics trigger
      'check_steward_introduction' // Steward introduction check
    ];

    if (meaningfulActivities.includes(activityType)) {
      // Higher probability for analytics-based insights (80% for meaningful activities)
      const shouldGenerate = Math.random() < 0.8;
      
      console.log('🔍 Should generate insight?', shouldGenerate, 'Activity:', activityType);
      
      if (shouldGenerate && !currentInsight) {
        console.log('🔍 Triggering insight generation...');
        const insight = await generateInsight(activityType);
        console.log('🔍 Insight generation result:', insight ? 'SUCCESS' : 'FAILED');
        return insight;
      }
    }

    console.log('🔍 No insight generated for activity:', activityType);
    return null;
  }, [trackActivity, generateInsight, generateConversationInsights, currentInsight, shouldStartIntroduction, startIntroduction, createStewardIntroductionInsight, addInsightToQueue, setInsightHistory]);

  // Removed auto-dismiss timer - let user control dismissal

  return {
    currentInsight,
    insightHistory,
    isGenerating: isGenerating || isGeneratingReport,
    generateInsight,
    generateAnalyticsInsight,
    generateHermeticReportInsights,
    acknowledgeInsight,
    dismissInsight,
    triggerInsightCheck,
    trackActivity,
    // Phase 1: Queue Management API
    insightQueue,
    currentInsightIndex,
    nextInsight,
    previousInsight,
    removeCurrentInsight,
    addInsightToQueue,
    // Steward introduction state
    introductionState,
    isGeneratingReport,
    // Step 1: Historical insights loader
    loadHistoricalInsights
  };
};