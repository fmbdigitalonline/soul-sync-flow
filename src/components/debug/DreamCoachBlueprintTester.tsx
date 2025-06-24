
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles,
  Moon,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Star,
  Zap,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PersonalityEngine } from '@/services/personality-engine';
import { LayeredBlueprint } from '@/types/personality-modules';

interface DreamCoachTest {
  id: string;
  dreamGoal: string;
  blueprintAlignment: number;
  creativityScore: number;
  visionaryElements: {
    imagination: boolean;
    possibility: boolean;
    inspiration: boolean;
    transformation: boolean;
  };
  personalityIntegration: number;
  dreamCoherence: number;
  timestamp: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

interface DreamCoachMetrics {
  totalTests: number;
  averageAlignment: number;
  averageCreativity: number;
  visionaryElementsRate: number;
  dreamCoherenceAvg: number;
}

export const DreamCoachBlueprintTester: React.FC = () => {
  const [dreamTests, setDreamTests] = useState<DreamCoachTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [personalityEngine, setPersonalityEngine] = useState<PersonalityEngine | null>(null);
  const [metrics, setMetrics] = useState<DreamCoachMetrics>({
    totalTests: 0,
    averageAlignment: 0,
    averageCreativity: 0,
    visionaryElementsRate: 0,
    dreamCoherenceAvg: 0
  });

  useEffect(() => {
    initializeDreamCoachTester();
  }, []);

  const initializeDreamCoachTester = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // Initialize personality engine for dream mode testing
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
        console.log('✨ Dream Coach Blueprint Tester initialized for user:', user.id);
      }
    } catch (error) {
      console.error('❌ Error initializing dream coach tester:', error);
    }
  };

  const dreamTestScenarios = [
    {
      goal: "I want to build a creative business that combines art and technology",
      expectedElements: ['imagination', 'possibility', 'transformation']
    },
    {
      goal: "My dream is to travel the world and write a book about cultural connections",
      expectedElements: ['imagination', 'inspiration', 'transformation']
    },
    {
      goal: "I envision creating a sustainable community garden that brings people together",
      expectedElements: ['possibility', 'inspiration', 'transformation']
    },
    {
      goal: "I want to develop my artistic skills and eventually showcase my work internationally",
      expectedElements: ['imagination', 'possibility', 'inspiration']
    },
    {
      goal: "My vision is to become a mentor who helps others discover their unique potential",
      expectedElements: ['inspiration', 'transformation', 'possibility']
    }
  ];

  const runDreamCoachBlueprintTest = async () => {
    if (!userId || !personalityEngine) {
      console.error('❌ No authenticated user or personality engine for dream coach testing');
      return;
    }

    setIsRunning(true);
    const testResults: DreamCoachTest[] = [];

    console.log('🚀 Starting Dream Coach Blueprint integration test');

    try {
      for (const scenario of dreamTestScenarios) {
        const testId = `dream_coach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const newTest: DreamCoachTest = {
          id: testId,
          dreamGoal: scenario.goal,
          blueprintAlignment: 0,
          creativityScore: 0,
          visionaryElements: {
            imagination: false,
            possibility: false,
            inspiration: false,
            transformation: false
          },
          personalityIntegration: 0,
          dreamCoherence: 0,
          timestamp: new Date().toISOString(),
          status: 'running'
        };

        setDreamTests(prev => [...prev, newTest]);

        try {
          // Generate dream-focused system prompt using 'guide' mode
          const systemPrompt = personalityEngine.generateSystemPrompt('guide', scenario.goal);
          
          console.log('✨ Generated dream coach system prompt length:', systemPrompt.length);
          
          // Analyze visionary elements
          const visionaryElements = analyzeVisionaryElements(systemPrompt);
          
          // Calculate creativity score
          const creativityScore = calculateCreativityScore(systemPrompt);
          
          // Calculate blueprint alignment
          const blueprintAlignment = calculateBlueprintAlignment(
            systemPrompt, 
            personalityEngine
          );
          
          // Calculate personality integration
          const personalityIntegration = calculatePersonalityIntegration(
            systemPrompt
          );
          
          // Calculate dream coherence
          const dreamCoherence = calculateDreamCoherence(
            visionaryElements,
            creativityScore,
            blueprintAlignment,
            scenario.expectedElements
          );

          const completedTest: DreamCoachTest = {
            ...newTest,
            blueprintAlignment,
            creativityScore,
            visionaryElements,
            personalityIntegration,
            dreamCoherence,
            status: 'completed'
          };

          testResults.push(completedTest);
          
          setDreamTests(prev => 
            prev.map(test => test.id === testId ? completedTest : test)
          );

          console.log(`✅ Dream coach test completed for: ${scenario.goal.substring(0, 50)}...`, {
            blueprintAlignment,
            creativityScore,
            visionaryElements,
            dreamCoherence
          });

          // Delay between tests
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`❌ Dream coach test failed for: ${scenario.goal}`, error);
          
          setDreamTests(prev => 
            prev.map(test => 
              test.id === testId ? { ...test, status: 'failed' } : test
            )
          );
        }
      }

      // Calculate overall metrics
      const overallMetrics = calculateOverallMetrics(testResults);
      setMetrics(overallMetrics);

      console.log('🎯 Dream Coach Blueprint test completed:', overallMetrics);

    } catch (error) {
      console.error('❌ Error in dream coach blueprint test:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const analyzeVisionaryElements = (systemPrompt: string): DreamCoachTest['visionaryElements'] => {
    const prompt = systemPrompt.toLowerCase();
    
    return {
      imagination: prompt.includes('imagine') || prompt.includes('creative') || prompt.includes('envision'),
      possibility: prompt.includes('possible') || prompt.includes('potential') || prompt.includes('opportunity'),
      inspiration: prompt.includes('inspire') || prompt.includes('motivate') || prompt.includes('passion'),
      transformation: prompt.includes('transform') || prompt.includes('change') || prompt.includes('growth')
    };
  };

  const calculateCreativityScore = (systemPrompt: string): number => {
    const prompt = systemPrompt.toLowerCase();
    let creativity = 40; // Base creativity
    
    // Creative language indicators
    const creativeWords = [
      'creative', 'innovative', 'original', 'unique', 'artistic', 
      'imaginative', 'visionary', 'inspired', 'breakthrough', 'revolutionary'
    ];
    
    const foundCreativeWords = creativeWords.filter(word => prompt.includes(word));
    creativity += foundCreativeWords.length * 6;
    
    // Dream-specific indicators
    if (prompt.includes('dream') || prompt.includes('vision')) creativity += 15;
    if (prompt.includes('possibilities') || prompt.includes('potential')) creativity += 10;
    if (prompt.includes('imagine') || prompt.includes('envision')) creativity += 10;
    
    return Math.min(100, creativity);
  };

  const calculateBlueprintAlignment = (systemPrompt: string, engine: PersonalityEngine): number => {
    let alignment = 50; // Base alignment
    const prompt = systemPrompt.toLowerCase();
    
    // Check for personality-aligned guidance
    if (prompt.includes('your unique') || prompt.includes('your strengths')) {
      alignment += 15;
    }
    
    if (prompt.includes('natural tendencies') || prompt.includes('personality type')) {
      alignment += 15;
    }
    
    if (prompt.includes('aligned with who you are')) {
      alignment += 10;
    }
    
    // Bonus for holistic approach
    if (prompt.includes('holistic') || prompt.includes('whole person')) {
      alignment += 10;
    }
    
    return Math.min(100, alignment);
  };

  const calculatePersonalityIntegration = (systemPrompt: string): number => {
    let integration = 45; // Base integration
    const prompt = systemPrompt.toLowerCase();
    
    // Personality system mentions
    if (prompt.includes('mbti') || prompt.includes('myers-briggs')) integration += 15;
    if (prompt.includes('human design') || prompt.includes('energy type')) integration += 15;
    if (prompt.includes('astrology') || prompt.includes('zodiac')) integration += 10;
    if (prompt.includes('enneagram') || prompt.includes('type')) integration += 10;
    
    // Personal reference indicators
    if (prompt.includes('your personality') || prompt.includes('who you are')) integration += 5;
    
    return Math.min(100, integration);
  };

  const calculateDreamCoherence = (
    visionaryElements: DreamCoachTest['visionaryElements'],
    creativityScore: number,
    blueprintAlignment: number,
    expectedElements: string[]
  ): number => {
    let coherence = 30; // Base score
    
    // Visionary elements alignment (30%)
    const visionaryKeys = Object.entries(visionaryElements)
      .filter(([_, present]) => present)
      .map(([key, _]) => key);
    
    const expectedPresent = expectedElements.filter(element => 
      visionaryKeys.includes(element)
    );
    
    if (expectedElements.length > 0) {
      const alignmentRatio = expectedPresent.length / expectedElements.length;
      coherence += alignmentRatio * 30;
    }
    
    // Creativity weight (25%)
    coherence += (creativityScore * 0.25);
    
    // Blueprint alignment weight (15%)
    coherence += (blueprintAlignment * 0.15);
    
    return Math.min(100, Math.round(coherence));
  };

  const calculateOverallMetrics = (tests: DreamCoachTest[]): DreamCoachMetrics => {
    const completedTests = tests.filter(test => test.status === 'completed');
    
    if (completedTests.length === 0) {
      return {
        totalTests: tests.length,
        averageAlignment: 0,
        averageCreativity: 0,
        visionaryElementsRate: 0,
        dreamCoherenceAvg: 0
      };
    }

    const totalAlignment = completedTests.reduce((sum, test) => sum + test.blueprintAlignment, 0);
    const totalCreativity = completedTests.reduce((sum, test) => sum + test.creativityScore, 0);
    const totalCoherence = completedTests.reduce((sum, test) => sum + test.dreamCoherence, 0);
    
    const totalVisionaryElements = completedTests.reduce((sum, test) => {
      const elementCount = Object.values(test.visionaryElements).filter(Boolean).length;
      return sum + elementCount;
    }, 0);
    
    const maxPossibleElements = completedTests.length * 4; // 4 elements per test
    
    return {
      totalTests: tests.length,
      averageAlignment: Math.round(totalAlignment / completedTests.length),
      averageCreativity: Math.round(totalCreativity / completedTests.length),
      visionaryElementsRate: Math.round((totalVisionaryElements / maxPossibleElements) * 100),
      dreamCoherenceAvg: Math.round(totalCoherence / completedTests.length)
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Sparkles className="h-4 w-4 text-gray-400" />;
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getVisionaryBadges = (visionaryElements: DreamCoachTest['visionaryElements']) => {
    return Object.entries(visionaryElements)
      .filter(([_, present]) => present)
      .map(([element, _]) => (
        <Badge key={element} variant="secondary" className="text-xs">
          {element}
        </Badge>
      ));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Dream Coach Blueprint Integration Tester
          </CardTitle>
          <p className="text-sm text-gray-600">
            Test dream-focused coaching with personality blueprint integration and visionary guidance
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Control Panel */}
            <Button 
              onClick={runDreamCoachBlueprintTest}
              disabled={isRunning || !userId || !personalityEngine}
              className="flex items-center gap-2"
            >
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
              Run Dream Coach Blueprint Test
            </Button>

            {/* Metrics Dashboard */}
            {metrics.totalTests > 0 && (
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{metrics.totalTests}</div>
                      <div className="text-sm text-gray-600">Total Tests</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(metrics.averageAlignment)}`}>
                        {metrics.averageAlignment}%
                      </div>
                      <div className="text-sm text-gray-600">Blueprint Alignment</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(metrics.averageCreativity)}`}>
                        {metrics.averageCreativity}%
                      </div>
                      <div className="text-sm text-gray-600">Creativity</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(metrics.visionaryElementsRate)}`}>
                        {metrics.visionaryElementsRate}%
                      </div>
                      <div className="text-sm text-gray-600">Visionary Rate</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(metrics.dreamCoherenceAvg)}`}>
                        {metrics.dreamCoherenceAvg}%
                      </div>
                      <div className="text-sm text-gray-600">Dream Coherence</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Test Results */}
            <div className="space-y-3">
              {dreamTests.map((test) => (
                <Card key={test.id} className="relative border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-2 flex-1">
                        {getStatusIcon(test.status)}
                        <div className="flex-1">
                          <p className="font-medium text-sm mb-1">{test.dreamGoal}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {test.status === 'completed' && (
                          <>
                            <Badge className={getScoreColor(test.dreamCoherence)}>
                              {test.dreamCoherence}%
                            </Badge>
                            <Badge className={getScoreColor(test.creativityScore)}>
                              Creative: {test.creativityScore}%
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {test.status === 'completed' && (
                      <>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {getVisionaryBadges(test.visionaryElements)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">Blueprint Alignment:</span>
                            <span className={`ml-2 font-medium ${getScoreColor(test.blueprintAlignment)}`}>
                              {test.blueprintAlignment}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Personality Integration:</span>
                            <span className={`ml-2 font-medium ${getScoreColor(test.personalityIntegration)}`}>
                              {test.personalityIntegration}%
                            </span>
                          </div>
                        </div>
                        
                        <Progress value={test.dreamCoherence} className="h-2" />
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {dreamTests.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Moon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No dream coach tests run yet. Click "Run Dream Coach Blueprint Test" to begin.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
