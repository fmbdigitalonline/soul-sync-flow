
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain,
  Layers,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Target,
  Zap,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { holisticCoachService } from '@/services/holistic-coach-service';

interface GrowthModeTest {
  id: string;
  userMessage: string;
  layerIntegration: {
    neural: boolean;
    traits: boolean;
    motivation: boolean;
    energy: boolean;
    archetypal: boolean;
    shadow: boolean;
    expression: boolean;
  };
  promptComplexity: number;
  adaptationScore: number;
  coherenceScore: number;
  timestamp: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

interface GrowthModeMetrics {
  totalTests: number;
  averageAdaptation: number;
  averageCoherence: number;
  layerIntegrationRate: number;
  promptComplexityAvg: number;
}

export const GrowthMode7LayerTester: React.FC = () => {
  const [growthTests, setGrowthTests] = useState<GrowthModeTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [metrics, setMetrics] = useState<GrowthModeMetrics>({
    totalTests: 0,
    averageAdaptation: 0,
    averageCoherence: 0,
    layerIntegrationRate: 0,
    promptComplexityAvg: 0
  });

  useEffect(() => {
    initializeGrowthModeTester();
  }, []);

  const initializeGrowthModeTester = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        holisticCoachService.setCurrentUser(user.id);
        holisticCoachService.setMode('growth');
        console.log('🧠 Growth Mode 7-Layer Tester initialized for user:', user.id);
      }
    } catch (error) {
      console.error('❌ Error initializing growth mode tester:', error);
    }
  };

  const testScenarios = [
    {
      message: "I'm feeling overwhelmed with my career transition and need guidance",
      expectedLayers: ['neural', 'traits', 'motivation', 'energy', 'shadow']
    },
    {
      message: "I want to understand my patterns of procrastination and transform them",
      expectedLayers: ['neural', 'traits', 'motivation', 'shadow', 'expression']
    },
    {
      message: "Help me align my daily actions with my deeper purpose and values",
      expectedLayers: ['motivation', 'energy', 'archetypal', 'expression']
    },
    {
      message: "I'm struggling with self-doubt and need to build confidence",
      expectedLayers: ['neural', 'traits', 'shadow', 'expression']
    },
    {
      message: "How can I better manage my energy and decision-making processes?",
      expectedLayers: ['neural', 'energy', 'motivation', 'expression']
    }
  ];

  const runGrowthMode7LayerTest = async () => {
    if (!userId) {
      console.error('❌ No authenticated user for growth mode testing');
      return;
    }

    setIsRunning(true);
    const testResults: GrowthModeTest[] = [];

    console.log('🚀 Starting Growth Mode 7-Layer integration test');

    try {
      // Ensure holistic coach service has current blueprint
      const { data: blueprintData } = await supabase
        .from('user_blueprints')
        .select('blueprint')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (!blueprintData) {
        console.error('❌ No active blueprint found for user');
        return;
      }

      // Update holistic coach service with blueprint
      holisticCoachService.updateBlueprint(blueprintData.blueprint);

      for (const scenario of testScenarios) {
        const testId = `growth_7layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const newTest: GrowthModeTest = {
          id: testId,
          userMessage: scenario.message,
          layerIntegration: {
            neural: false,
            traits: false,
            motivation: false,
            energy: false,
            archetypal: false,
            shadow: false,
            expression: false
          },
          promptComplexity: 0,
          adaptationScore: 0,
          coherenceScore: 0,
          timestamp: new Date().toISOString(),
          status: 'running'
        };

        setGrowthTests(prev => [...prev, newTest]);

        try {
          // Test advanced holistic system prompt generation
          const systemPrompt = holisticCoachService.generateSystemPrompt(scenario.message);
          
          console.log('📝 Generated system prompt length:', systemPrompt.length);
          
          // Analyze layer integration in the prompt
          const layerIntegration = analyzeLayerIntegration(systemPrompt);
          
          // Calculate prompt complexity
          const promptComplexity = calculatePromptComplexity(systemPrompt);
          
          // Test personality insights
          const personalityInsights = holisticCoachService.getPersonalityInsights();
          
          // Calculate adaptation and coherence scores
          const adaptationScore = calculateAdaptationScore(
            systemPrompt, 
            scenario.message, 
            personalityInsights
          );
          
          const coherenceScore = calculateCoherenceScore(
            layerIntegration, 
            scenario.expectedLayers,
            personalityInsights
          );

          const completedTest: GrowthModeTest = {
            ...newTest,
            layerIntegration,
            promptComplexity,
            adaptationScore,
            coherenceScore,
            status: 'completed'
          };

          testResults.push(completedTest);
          
          setGrowthTests(prev => 
            prev.map(test => test.id === testId ? completedTest : test)
          );

          console.log(`✅ Growth mode test completed for: ${scenario.message.substring(0, 50)}...`, {
            layerIntegration,
            promptComplexity,
            adaptationScore,
            coherenceScore
          });

          // Delay between tests
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`❌ Growth mode test failed for: ${scenario.message}`, error);
          
          setGrowthTests(prev => 
            prev.map(test => 
              test.id === testId ? { ...test, status: 'failed' } : test
            )
          );
        }
      }

      // Calculate overall metrics
      const overallMetrics = calculateOverallMetrics(testResults);
      setMetrics(overallMetrics);

      console.log('🎯 Growth Mode 7-Layer test completed:', overallMetrics);

    } catch (error) {
      console.error('❌ Error in growth mode 7-layer test:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const analyzeLayerIntegration = (systemPrompt: string): GrowthModeTest['layerIntegration'] => {
    const prompt = systemPrompt.toLowerCase();
    
    return {
      neural: prompt.includes('cognitive') || prompt.includes('neural') || prompt.includes('brain'),
      traits: prompt.includes('personality') || prompt.includes('trait') || prompt.includes('mbti'),
      motivation: prompt.includes('motivation') || prompt.includes('drive') || prompt.includes('purpose'),
      energy: prompt.includes('energy') || prompt.includes('human design') || prompt.includes('strategy'),
      archetypal: prompt.includes('archetype') || prompt.includes('zodiac') || prompt.includes('astrology'),
      shadow: prompt.includes('shadow') || prompt.includes('hidden') || prompt.includes('unconscious'),
      expression: prompt.includes('expression') || prompt.includes('communication') || prompt.includes('style')
    };
  };

  const calculatePromptComplexity = (systemPrompt: string): number => {
    const wordCount = systemPrompt.split(/\s+/).length;
    const sentenceCount = systemPrompt.split(/[.!?]+/).length;
    const avgSentenceLength = wordCount / sentenceCount;
    
    // Complexity based on length, structure, and keywords
    let complexity = 40; // Base complexity
    
    if (wordCount > 500) complexity += 20;
    if (wordCount > 1000) complexity += 20;
    if (avgSentenceLength > 20) complexity += 10;
    
    // Bonus for advanced concepts
    const advancedKeywords = ['archetypal', 'shadow', 'integration', 'holistic', 'multidimensional'];
    const keywordCount = advancedKeywords.filter(keyword => 
      systemPrompt.toLowerCase().includes(keyword)
    ).length;
    
    complexity += keywordCount * 5;
    
    return Math.min(100, complexity);
  };

  const calculateAdaptationScore = (
    systemPrompt: string, 
    userMessage: string, 
    insights: any
  ): number => {
    let score = 50; // Base score
    
    // Check for message-specific adaptation
    const messageWords = userMessage.toLowerCase().split(' ');
    const promptText = systemPrompt.toLowerCase();
    
    // Contextual adaptation bonus
    const contextualWords = messageWords.filter(word => 
      word.length > 3 && promptText.includes(word)
    );
    
    if (contextualWords.length > 0) {
      score += Math.min(25, contextualWords.length * 5);
    }
    
    // Personality-specific adaptation
    if (insights && insights.layers) {
      const layerCount = Object.keys(insights.layers).length;
      score += Math.min(15, layerCount * 2);
    }
    
    // Advanced integration bonus
    if (promptText.includes('multifaceted') || promptText.includes('holistic')) {
      score += 10;
    }
    
    return Math.min(100, score);
  };

  const calculateCoherenceScore = (
    layerIntegration: GrowthModeTest['layerIntegration'],
    expectedLayers: string[],
    insights: any
  ): number => {
    let score = 30; // Base score
    
    // Layer alignment with expectations
    const integratedLayers = Object.entries(layerIntegration)
      .filter(([_, integrated]) => integrated)
      .map(([layer, _]) => layer);
    
    const expectedIntegrated = expectedLayers.filter(layer => 
      integratedLayers.includes(layer)
    );
    
    if (expectedLayers.length > 0) {
      const alignmentRatio = expectedIntegrated.length / expectedLayers.length;
      score += alignmentRatio * 40;
    }
    
    // Overall integration breadth
    const totalIntegrated = integratedLayers.length;
    score += Math.min(20, totalIntegrated * 3);
    
    // Personality coherence bonus
    if (insights && insights.mode === 'growth') {
      score += 10;
    }
    
    return Math.min(100, score);
  };

  const calculateOverallMetrics = (tests: GrowthModeTest[]): GrowthModeMetrics => {
    const completedTests = tests.filter(test => test.status === 'completed');
    
    if (completedTests.length === 0) {
      return {
        totalTests: tests.length,
        averageAdaptation: 0,
        averageCoherence: 0,
        layerIntegrationRate: 0,
        promptComplexityAvg: 0
      };
    }

    const totalAdaptation = completedTests.reduce((sum, test) => sum + test.adaptationScore, 0);
    const totalCoherence = completedTests.reduce((sum, test) => sum + test.coherenceScore, 0);
    const totalComplexity = completedTests.reduce((sum, test) => sum + test.promptComplexity, 0);
    
    const totalLayerIntegrations = completedTests.reduce((sum, test) => {
      const integratedCount = Object.values(test.layerIntegration).filter(Boolean).length;
      return sum + integratedCount;
    }, 0);
    
    const maxPossibleIntegrations = completedTests.length * 7; // 7 layers per test
    
    return {
      totalTests: tests.length,
      averageAdaptation: Math.round(totalAdaptation / completedTests.length),
      averageCoherence: Math.round(totalCoherence / completedTests.length),
      layerIntegrationRate: Math.round((totalLayerIntegrations / maxPossibleIntegrations) * 100),
      promptComplexityAvg: Math.round(totalComplexity / completedTests.length)
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Brain className="h-4 w-4 text-gray-400" />;
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLayerBadges = (layerIntegration: GrowthModeTest['layerIntegration']) => {
    return Object.entries(layerIntegration)
      .filter(([_, integrated]) => integrated)
      .map(([layer, _]) => (
        <Badge key={layer} variant="secondary" className="text-xs">
          {layer}
        </Badge>
      ));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Growth Mode 7-Layer Integration Tester
          </CardTitle>
          <p className="text-sm text-gray-600">
            Test advanced holistic prompt generation with real blueprint data
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Control Panel */}
            <Button 
              onClick={runGrowthMode7LayerTest}
              disabled={isRunning || !userId}
              className="flex items-center gap-2"
            >
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
              Run Growth Mode 7-Layer Test
            </Button>

            {/* Metrics Dashboard */}
            {metrics.totalTests > 0 && (
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{metrics.totalTests}</div>
                      <div className="text-sm text-gray-600">Total Tests</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(metrics.averageAdaptation)}`}>
                        {metrics.averageAdaptation}%
                      </div>
                      <div className="text-sm text-gray-600">Adaptation</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(metrics.averageCoherence)}`}>
                        {metrics.averageCoherence}%
                      </div>
                      <div className="text-sm text-gray-600">Coherence</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(metrics.layerIntegrationRate)}`}>
                        {metrics.layerIntegrationRate}%
                      </div>
                      <div className="text-sm text-gray-600">Layer Integration</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{metrics.promptComplexityAvg}</div>
                      <div className="text-sm text-gray-600">Complexity</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Test Results */}
            <div className="space-y-3">
              {growthTests.map((test) => (
                <Card key={test.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-2 flex-1">
                        {getStatusIcon(test.status)}
                        <div className="flex-1">
                          <p className="font-medium text-sm mb-1">{test.userMessage}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {test.status === 'completed' && (
                          <>
                            <Badge className={getScoreColor(test.adaptationScore)}>
                              Adapt: {test.adaptationScore}%
                            </Badge>
                            <Badge className={getScoreColor(test.coherenceScore)}>
                              Coher: {test.coherenceScore}%
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {test.status === 'completed' && (
                      <>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {getLayerBadges(test.layerIntegration)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">Complexity:</span>
                            <span className="ml-2 font-medium">{test.promptComplexity}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Layers Integrated:</span>
                            <span className="ml-2 font-medium">
                              {Object.values(test.layerIntegration).filter(Boolean).length}/7
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

            {growthTests.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No growth mode tests run yet. Click "Run Growth Mode 7-Layer Test" to begin.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
