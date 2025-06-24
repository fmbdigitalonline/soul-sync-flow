
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shuffle,
  ArrowRightLeft,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Users,
  Compass,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PersonalityEngine } from '@/services/personality-engine';
import { LayeredBlueprint, AgentMode } from '@/types/personality-modules';

interface ModeSwitchTest {
  id: string;
  fromMode: AgentMode;
  toMode: AgentMode;
  userContext: string;
  coherenceScore: number;
  transitionSmoothhess: number;
  personalityConsistency: number;
  contextPreservation: number;
  responseVariation: {
    tone: number;
    approach: number;
    content: number;
  };
  timestamp: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

interface ModeSwitchMetrics {
  totalTests: number;
  averageCoherence: number;
  averageTransition: number;
  personalityStability: number;
  contextPreservationRate: number;
}

export const ModeSwitchingCoherenceTester: React.FC = () => {
  const [switchTests, setSwitchTests] = useState<ModeSwitchTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [personalityEngine, setPersonalityEngine] = useState<PersonalityEngine | null>(null);
  const [metrics, setMetrics] = useState<ModeSwitchMetrics>({
    totalTests: 0,
    averageCoherence: 0,
    averageTransition: 0,
    personalityStability: 0,
    contextPreservationRate: 0
  });

  useEffect(() => {
    initializeModeSwitchTester();
  }, []);

  const initializeModeSwitchTester = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // Initialize personality engine
        const engine = new PersonalityEngine();
        
        // Load user blueprint
        const { data: blueprintData } = await supabase
          .from('user_blueprints')
          .select('blueprint')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();

        if (blueprintData && blueprintData.blueprint) {
          const blueprint = blueprintData.blueprint as unknown as Partial<LayeredBlueprint>;
          engine.updateBlueprint(blueprint);
        }
        
        setPersonalityEngine(engine);
        console.log('🔄 Mode Switching Coherence Tester initialized for user:', user.id);
      }
    } catch (error) {
      console.error('❌ Error initializing mode switch tester:', error);
    }
  };

  const modeSwitchScenarios = [
    {
      fromMode: 'coach' as AgentMode,
      toMode: 'guide' as AgentMode,
      context: "Help me organize my daily tasks and then explore my deeper life purpose"
    },
    {
      fromMode: 'guide' as AgentMode,
      toMode: 'coach' as AgentMode,
      context: "I've been reflecting on my values, now I need concrete steps to act on them"
    },
    {
      fromMode: 'coach' as AgentMode,
      toMode: 'blend' as AgentMode,
      context: "I need both practical advice and deeper insight about my career transition"
    },
    {
      fromMode: 'guide' as AgentMode,
      toMode: 'blend' as AgentMode,
      context: "After some self-reflection, I want balanced support for my next steps"
    },
    {
      fromMode: 'blend' as AgentMode,
      toMode: 'coach' as AgentMode,
      context: "I've explored different perspectives, now I need focused action planning"
    }
  ];

  const runModeSwitchingCoherenceTest = async () => {
    if (!userId || !personalityEngine) {
      console.error('❌ No authenticated user or personality engine for mode switch testing');
      return;
    }

    setIsRunning(true);
    const testResults: ModeSwitchTest[] = [];

    console.log('🚀 Starting Mode Switching Coherence test');

    try {
      for (const scenario of modeSwitchScenarios) {
        const testId = `mode_switch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const newTest: ModeSwitchTest = {
          id: testId,
          fromMode: scenario.fromMode,
          toMode: scenario.toMode,
          userContext: scenario.context,
          coherenceScore: 0,
          transitionSmoothhess: 0,
          personalityConsistency: 0,
          contextPreservation: 0,
          responseVariation: {
            tone: 0,
            approach: 0,
            content: 0
          },
          timestamp: new Date().toISOString(),
          status: 'running'
        };

        setSwitchTests(prev => [...prev, newTest]);

        try {
          // Generate system prompts for both modes
          const fromPrompt = personalityEngine.generateSystemPrompt(scenario.fromMode, scenario.context);
          const toPrompt = personalityEngine.generateSystemPrompt(scenario.toMode, scenario.context);
          
          console.log(`🔄 Generated mode switch prompts: ${scenario.fromMode} -> ${scenario.toMode}`);
          console.log(`From prompt length: ${fromPrompt.length}, To prompt length: ${toPrompt.length}`);
          
          // Analyze transition smoothness
          const transitionSmoothhess = analyzeTransitionSmoothness(fromPrompt, toPrompt);
          
          // Calculate personality consistency
          const personalityConsistency = calculatePersonalityConsistency(fromPrompt, toPrompt);
          
          // Calculate context preservation
          const contextPreservation = calculateContextPreservation(
            fromPrompt,
            toPrompt,
            scenario.context
          );
          
          // Analyze response variation
          const responseVariation = analyzeResponseVariation(fromPrompt, toPrompt);
          
          // Calculate overall coherence
          const coherenceScore = calculateOverallCoherence(
            transitionSmoothhess,
            personalityConsistency,
            contextPreservation,
            responseVariation
          );

          const completedTest: ModeSwitchTest = {
            ...newTest,
            coherenceScore,
            transitionSmoothhess,
            personalityConsistency,
            contextPreservation,
            responseVariation,
            status: 'completed'
          };

          testResults.push(completedTest);
          
          setSwitchTests(prev => 
            prev.map(test => test.id === testId ? completedTest : test)
          );

          console.log(`✅ Mode switch test completed: ${scenario.fromMode} -> ${scenario.toMode}`, {
            coherenceScore,
            transitionSmoothhess,
            personalityConsistency
          });

          // Delay between tests
          await new Promise(resolve => setTimeout(resolve, 800));

        } catch (error) {
          console.error(`❌ Mode switch test failed: ${scenario.fromMode} -> ${scenario.toMode}`, error);
          
          setSwitchTests(prev => 
            prev.map(test => 
              test.id === testId ? { ...test, status: 'failed' } : test
            )
          );
        }
      }

      // Calculate overall metrics
      const overallMetrics = calculateOverallMetrics(testResults);
      setMetrics(overallMetrics);

      console.log('🎯 Mode Switching Coherence test completed:', overallMetrics);

    } catch (error) {
      console.error('❌ Error in mode switching coherence test:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const analyzeTransitionSmoothness = (fromPrompt: string, toPrompt: string): number => {
    let smoothness = 50; // Base smoothness
    
    // Check for common personality elements preserved
    const fromWords = fromPrompt.toLowerCase().split(' ');
    const toWords = toPrompt.toLowerCase().split(' ');
    
    const personalityKeywords = ['personality', 'mbti', 'human design', 'unique', 'strengths', 'preferences'];
    const preservedKeywords = personalityKeywords.filter(keyword => 
      fromPrompt.toLowerCase().includes(keyword) && toPrompt.toLowerCase().includes(keyword)
    );
    
    smoothness += preservedKeywords.length * 8;
    
    // Check for similar tone indicators
    const toneWords = ['supportive', 'encouraging', 'gentle', 'understanding', 'caring'];
    const commonToneWords = toneWords.filter(word => 
      fromPrompt.toLowerCase().includes(word) && toPrompt.toLowerCase().includes(word)
    );
    
    smoothness += commonToneWords.length * 6;
    
    return Math.min(100, smoothness);
  };

  const calculatePersonalityConsistency = (fromPrompt: string, toPrompt: string): number => {
    let consistency = 60; // Base consistency
    
    // Core personality elements that should remain consistent
    const personalityMarkers = [
      'your unique', 'your personality', 'your strengths', 'who you are',
      'mbti', 'human design', 'natural tendencies', 'authentic'
    ];
    
    const fromMarkers = personalityMarkers.filter(marker => 
      fromPrompt.toLowerCase().includes(marker)
    );
    const toMarkers = personalityMarkers.filter(marker => 
      toPrompt.toLowerCase().includes(marker)
    );
    
    // Calculate consistency based on preserved markers
    const totalMarkers = new Set([...fromMarkers, ...toMarkers]).size;
    const preservedMarkers = fromMarkers.filter(marker => toMarkers.includes(marker)).length;
    
    if (totalMarkers > 0) {
      const preservationRatio = preservedMarkers / totalMarkers;
      consistency += preservationRatio * 30;
    }
    
    return Math.min(100, Math.round(consistency));
  };

  const calculateContextPreservation = (fromPrompt: string, toPrompt: string, context: string): number => {
    let preservation = 40; // Base preservation
    
    // Extract key context words
    const contextWords = context.toLowerCase().split(' ').filter(word => word.length > 3);
    
    const fromContextWords = contextWords.filter(word => 
      fromPrompt.toLowerCase().includes(word)
    );
    const toContextWords = contextWords.filter(word => 
      toPrompt.toLowerCase().includes(word)
    );
    
    // Calculate context preservation ratio
    if (contextWords.length > 0) {
      const fromRatio = fromContextWords.length / contextWords.length;
      const toRatio = toContextWords.length / contextWords.length;
      const avgPreservation = (fromRatio + toRatio) / 2;
      
      preservation += avgPreservation * 50;
    }
    
    return Math.min(100, Math.round(preservation));
  };

  const analyzeResponseVariation = (fromPrompt: string, toPrompt: string): ModeSwitchTest['responseVariation'] => {
    // Analyze tone variation
    const toneWords = ['gentle', 'direct', 'supportive', 'challenging', 'encouraging'];
    const fromTone = toneWords.filter(word => fromPrompt.toLowerCase().includes(word));
    const toTone = toneWords.filter(word => toPrompt.toLowerCase().includes(word));
    const toneVariation = Math.abs(fromTone.length - toTone.length) * 20;
    
    // Analyze approach variation
    const approachWords = ['practical', 'reflective', 'action', 'exploration', 'guidance'];
    const fromApproach = approachWords.filter(word => fromPrompt.toLowerCase().includes(word));
    const toApproach = approachWords.filter(word => toPrompt.toLowerCase().includes(word));
    const approachVariation = Math.abs(fromApproach.length - toApproach.length) * 25;
    
    // Analyze content variation (length difference)
    const lengthDiff = Math.abs(fromPrompt.length - toPrompt.length);
    const contentVariation = Math.min(100, (lengthDiff / Math.max(fromPrompt.length, toPrompt.length)) * 100);
    
    return {
      tone: Math.min(100, toneVariation),
      approach: Math.min(100, approachVariation),
      content: Math.min(100, contentVariation)
    };
  };

  const calculateOverallCoherence = (
    transition: number,
    personality: number,
    context: number,
    variation: ModeSwitchTest['responseVariation']
  ): number => {
    // Weighted calculation
    const coherence = (
      transition * 0.25 +           // 25% weight on transition smoothness
      personality * 0.35 +          // 35% weight on personality consistency
      context * 0.25 +              // 25% weight on context preservation
      ((100 - variation.tone) * 0.05) + // 5% weight on tone consistency
      ((100 - variation.approach) * 0.05) + // 5% weight on approach consistency
      ((100 - variation.content) * 0.05)    // 5% weight on content consistency
    );
    
    return Math.min(100, Math.round(coherence));
  };

  const calculateOverallMetrics = (tests: ModeSwitchTest[]): ModeSwitchMetrics => {
    const completedTests = tests.filter(test => test.status === 'completed');
    
    if (completedTests.length === 0) {
      return {
        totalTests: tests.length,
        averageCoherence: 0,
        averageTransition: 0,
        personalityStability: 0,
        contextPreservationRate: 0
      };
    }

    const totalCoherence = completedTests.reduce((sum, test) => sum + test.coherenceScore, 0);
    const totalTransition = completedTests.reduce((sum, test) => sum + test.transitionSmoothhess, 0);
    const totalPersonality = completedTests.reduce((sum, test) => sum + test.personalityConsistency, 0);
    const totalContext = completedTests.reduce((sum, test) => sum + test.contextPreservation, 0);
    
    return {
      totalTests: tests.length,
      averageCoherence: Math.round(totalCoherence / completedTests.length),
      averageTransition: Math.round(totalTransition / completedTests.length),
      personalityStability: Math.round(totalPersonality / completedTests.length),
      contextPreservationRate: Math.round(totalContext / completedTests.length)
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Shuffle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getModeIcon = (mode: AgentMode) => {
    switch (mode) {
      case 'coach': return <Users className="h-4 w-4" />;
      case 'guide': return <Compass className="h-4 w-4" />;
      case 'blend': return <Sparkles className="h-4 w-4" />;
      default: return <Shuffle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shuffle className="h-5 w-5" />
            Mode Switching Coherence Tester
          </CardTitle>
          <p className="text-sm text-gray-600">
            Test personality consistency and context preservation across coach mode transitions
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Control Panel */}
            <Button 
              onClick={runModeSwitchingCoherenceTest}
              disabled={isRunning || !userId || !personalityEngine}
              className="flex items-center gap-2"
            >
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRightLeft className="h-4 w-4" />}
              Run Mode Switching Coherence Test
            </Button>

            {/* Metrics Dashboard */}
            {metrics.totalTests > 0 && (
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{metrics.totalTests}</div>
                      <div className="text-sm text-gray-600">Total Tests</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(metrics.averageCoherence)}`}>
                        {metrics.averageCoherence}%
                      </div>
                      <div className="text-sm text-gray-600">Coherence</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(metrics.averageTransition)}`}>
                        {metrics.averageTransition}%
                      </div>
                      <div className="text-sm text-gray-600">Transition</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(metrics.personalityStability)}`}>
                        {metrics.personalityStability}%
                      </div>
                      <div className="text-sm text-gray-600">Personality</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(metrics.contextPreservationRate)}`}>
                        {metrics.contextPreservationRate}%
                      </div>
                      <div className="text-sm text-gray-600">Context</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Test Results */}
            <div className="space-y-3">
              {switchTests.map((test) => (
                <Card key={test.id} className="relative border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-2 flex-1">
                        {getStatusIcon(test.status)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1">
                              {getModeIcon(test.fromMode)}
                              <span className="text-sm font-medium">{test.fromMode}</span>
                            </div>
                            <ArrowRightLeft className="h-4 w-4 text-gray-400" />
                            <div className="flex items-center gap-1">
                              {getModeIcon(test.toMode)}
                              <span className="text-sm font-medium">{test.toMode}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{test.userContext}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {test.status === 'completed' && (
                          <Badge className={getScoreColor(test.coherenceScore)}>
                            {test.coherenceScore}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {test.status === 'completed' && (
                      <>
                        <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">Transition:</span>
                            <span className={`ml-2 font-medium ${getScoreColor(test.transitionSmoothhess)}`}>
                              {test.transitionSmoothhess}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Personality:</span>
                            <span className={`ml-2 font-medium ${getScoreColor(test.personalityConsistency)}`}>
                              {test.personalityConsistency}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Context:</span>
                            <span className={`ml-2 font-medium ${getScoreColor(test.contextPreservation)}`}>
                              {test.contextPreservation}%
                            </span>
                          </div>
                        </div>
                        
                        <Progress value={test.coherenceScore} className="h-2" />
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {switchTests.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <ArrowRightLeft className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No mode switching tests run yet. Click "Run Mode Switching Coherence Test" to begin.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
