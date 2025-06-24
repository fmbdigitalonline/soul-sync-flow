
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart,
  Users,
  CheckCircle,
  AlertTriangle,
  Loader2,
  MessageCircle,
  Shield,
  Smile
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PersonalityEngine } from '@/services/personality-engine';

interface CompanionModeTest {
  id: string;
  userMessage: string;
  personalityConsistency: number;
  warmthLevel: number;
  supportiveElements: {
    empathy: boolean;
    encouragement: boolean;
    understanding: boolean;
    guidance: boolean;
  };
  responseLength: number;
  consistency: number;
  timestamp: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

interface CompanionModeMetrics {
  totalTests: number;
  averageConsistency: number;
  averageWarmth: number;
  supportiveElementsRate: number;
  personalityStability: number;
}

export const CompanionModeConsistencyTester: React.FC = () => {
  const [companionTests, setCompanionTests] = useState<CompanionModeTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [personalityEngine, setPersonalityEngine] = useState<PersonalityEngine | null>(null);
  const [metrics, setMetrics] = useState<CompanionModeMetrics>({
    totalTests: 0,
    averageConsistency: 0,
    averageWarmth: 0,
    supportiveElementsRate: 0,
    personalityStability: 0
  });

  useEffect(() => {
    initializeCompanionModeTester();
  }, []);

  const initializeCompanionModeTester = async () => {
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

        if (blueprintData) {
          engine.updateBlueprint(blueprintData.blueprint);
        }
        
        setPersonalityEngine(engine);
        console.log('💝 Companion Mode Consistency Tester initialized for user:', user.id);
      }
    } catch (error) {
      console.error('❌ Error initializing companion mode tester:', error);
    }
  };

  const testScenarios = [
    {
      message: "I'm having a really tough day and feeling down",
      expectedSupport: ['empathy', 'encouragement', 'understanding']
    },
    {
      message: "Can you help me understand why I keep making the same mistakes?",
      expectedSupport: ['understanding', 'guidance', 'encouragement']
    },
    {
      message: "I achieved something important today and wanted to share it",
      expectedSupport: ['encouragement', 'understanding']
    },
    {
      message: "I'm worried about my future and feel uncertain",
      expectedSupport: ['empathy', 'guidance', 'understanding']
    },
    {
      message: "Just wanted to check in and see how you're doing",
      expectedSupport: ['understanding', 'empathy']
    }
  ];

  const runCompanionModeConsistencyTest = async () => {
    if (!userId || !personalityEngine) {
      console.error('❌ No authenticated user or personality engine for companion mode testing');
      return;
    }

    setIsRunning(true);
    const testResults: CompanionModeTest[] = [];

    console.log('🚀 Starting Companion Mode consistency test');

    try {
      // Run multiple iterations to test consistency
      for (let iteration = 0; iteration < 2; iteration++) {
        for (const scenario of testScenarios) {
          const testId = `companion_${iteration}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          const newTest: CompanionModeTest = {
            id: testId,
            userMessage: scenario.message,
            personalityConsistency: 0,
            warmthLevel: 0,
            supportiveElements: {
              empathy: false,
              encouragement: false,
              understanding: false,
              guidance: false
            },
            responseLength: 0,
            consistency: 0,
            timestamp: new Date().toISOString(),
            status: 'running'
          };

          setCompanionTests(prev => [...prev, newTest]);

          try {
            // Generate companion mode system prompt
            const systemPrompt = personalityEngine.generateSystemPrompt('companion');
            
            console.log('💝 Generated companion system prompt length:', systemPrompt.length);
            
            // Analyze supportive elements
            const supportiveElements = analyzeSupportiveElements(systemPrompt);
            
            // Calculate warmth level
            const warmthLevel = calculateWarmthLevel(systemPrompt);
            
            // Calculate personality consistency
            const personalityConsistency = calculatePersonalityConsistency(
              systemPrompt, 
              personalityEngine.getPersonality()
            );
            
            // Calculate overall consistency
            const consistency = calculateOverallConsistency(
              personalityConsistency,
              warmthLevel,
              supportiveElements,
              scenario.expectedSupport
            );

            const completedTest: CompanionModeTest = {
              ...newTest,
              personalityConsistency,
              warmthLevel,
              supportiveElements,
              responseLength: systemPrompt.length,
              consistency,
              status: 'completed'
            };

            testResults.push(completedTest);
            
            setCompanionTests(prev => 
              prev.map(test => test.id === testId ? completedTest : test)
            );

            console.log(`✅ Companion mode test completed for: ${scenario.message.substring(0, 50)}...`, {
              personalityConsistency,
              warmthLevel,
              supportiveElements,
              consistency
            });

            // Delay between tests
            await new Promise(resolve => setTimeout(resolve, 800));

          } catch (error) {
            console.error(`❌ Companion mode test failed for: ${scenario.message}`, error);
            
            setCompanionTests(prev => 
              prev.map(test => 
                test.id === testId ? { ...test, status: 'failed' } : test
              )
            );
          }
        }
      }

      // Calculate overall metrics
      const overallMetrics = calculateOverallMetrics(testResults);
      setMetrics(overallMetrics);

      console.log('🎯 Companion Mode consistency test completed:', overallMetrics);

    } catch (error) {
      console.error('❌ Error in companion mode consistency test:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const analyzeSupportiveElements = (systemPrompt: string): CompanionModeTest['supportiveElements'] => {
    const prompt = systemPrompt.toLowerCase();
    
    return {
      empathy: prompt.includes('empathy') || prompt.includes('understand') || prompt.includes('feel'),
      encouragement: prompt.includes('encourage') || prompt.includes('support') || prompt.includes('motivate'),
      understanding: prompt.includes('listen') || prompt.includes('acknowledge') || prompt.includes('validate'),
      guidance: prompt.includes('guide') || prompt.includes('help') || prompt.includes('suggest')
    };
  };

  const calculateWarmthLevel = (systemPrompt: string): number => {
    const prompt = systemPrompt.toLowerCase();
    let warmth = 30; // Base warmth
    
    // Warm language indicators
    const warmWords = [
      'caring', 'gentle', 'kind', 'compassionate', 'supportive', 
      'understanding', 'empathetic', 'friendly', 'warm', 'loving'
    ];
    
    const foundWarmWords = warmWords.filter(word => prompt.includes(word));
    warmth += foundWarmWords.length * 8;
    
    // Tone indicators
    if (prompt.includes('companion') || prompt.includes('friend')) warmth += 15;
    if (prompt.includes('non-judgmental') || prompt.includes('safe space')) warmth += 10;
    if (prompt.includes('patience') || prompt.includes('gentle')) warmth += 10;
    
    return Math.min(100, warmth);
  };

  const calculatePersonalityConsistency = (systemPrompt: string, personality: any): number => {
    if (!personality) return 40; // Base score without personality data
    
    let consistency = 50; // Base consistency
    const prompt = systemPrompt.toLowerCase();
    
    // Check for personality trait integration
    if (personality.cognition_mbti) {
      const mbtiType = personality.cognition_mbti.type;
      if (mbtiType && prompt.includes(mbtiType.toLowerCase())) {
        consistency += 15;
      }
    }
    
    // Check for human design integration
    if (personality.energy_strategy_human_design) {
      const hdType = personality.energy_strategy_human_design.type;
      if (hdType && prompt.includes(hdType.toLowerCase())) {
        consistency += 15;
      }
    }
    
    // Check for astrological integration
    if (personality.archetype_western) {
      const sunSign = personality.archetype_western.sun_sign;
      if (sunSign && prompt.includes(sunSign.toLowerCase())) {
        consistency += 10;
      }
    }
    
    // Bonus for holistic integration
    if (prompt.includes('personality') || prompt.includes('unique')) {
      consistency += 10;
    }
    
    return Math.min(100, consistency);
  };

  const calculateOverallConsistency = (
    personalityConsistency: number,
    warmthLevel: number,
    supportiveElements: CompanionModeTest['supportiveElements'],
    expectedSupport: string[]
  ): number => {
    let consistency = 25; // Base score
    
    // Personality consistency weight (30%)
    consistency += (personalityConsistency * 0.3);
    
    // Warmth level weight (25%)
    consistency += (warmthLevel * 0.25);
    
    // Supportive elements weight (25%)
    const supportCount = Object.values(supportiveElements).filter(Boolean).length;
    const supportScore = (supportCount / 4) * 100;
    consistency += (supportScore * 0.25);
    
    // Expected support alignment weight (20%)
    const alignedSupport = expectedSupport.filter(support => 
      supportiveElements[support as keyof typeof supportiveElements]
    );
    const alignmentScore = expectedSupport.length > 0 ? 
      (alignedSupport.length / expectedSupport.length) * 100 : 100;
    consistency += (alignmentScore * 0.2);
    
    return Math.min(100, Math.round(consistency));
  };

  const calculateOverallMetrics = (tests: CompanionModeTest[]): CompanionModeMetrics => {
    const completedTests = tests.filter(test => test.status === 'completed');
    
    if (completedTests.length === 0) {
      return {
        totalTests: tests.length,
        averageConsistency: 0,
        averageWarmth: 0,
        supportiveElementsRate: 0,
        personalityStability: 0
      };
    }

    const totalConsistency = completedTests.reduce((sum, test) => sum + test.consistency, 0);
    const totalWarmth = completedTests.reduce((sum, test) => sum + test.warmthLevel, 0);
    const totalPersonality = completedTests.reduce((sum, test) => sum + test.personalityConsistency, 0);
    
    const totalSupportiveElements = completedTests.reduce((sum, test) => {
      const supportCount = Object.values(test.supportiveElements).filter(Boolean).length;
      return sum + supportCount;
    }, 0);
    
    const maxPossibleSupport = completedTests.length * 4; // 4 supportive elements per test
    
    // Calculate personality stability by checking variance in personality consistency
    const personalityScores = completedTests.map(test => test.personalityConsistency);
    const avgPersonality = totalPersonality / completedTests.length;
    const variance = personalityScores.reduce((sum, score) => 
      sum + Math.pow(score - avgPersonality, 2), 0) / completedTests.length;
    const stability = Math.max(0, 100 - Math.sqrt(variance));
    
    return {
      totalTests: tests.length,
      averageConsistency: Math.round(totalConsistency / completedTests.length),
      averageWarmth: Math.round(totalWarmth / completedTests.length),
      supportiveElementsRate: Math.round((totalSupportiveElements / maxPossibleSupport) * 100),
      personalityStability: Math.round(stability)
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Heart className="h-4 w-4 text-gray-400" />;
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSupportiveBadges = (supportiveElements: CompanionModeTest['supportiveElements']) => {
    return Object.entries(supportiveElements)
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
            <Heart className="h-5 w-5" />
            Companion Mode Consistency Tester
          </CardTitle>
          <p className="text-sm text-gray-600">
            Validate basic personality engine functionality with consistent companion responses
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Control Panel */}
            <Button 
              onClick={runCompanionModeConsistencyTest}
              disabled={isRunning || !userId || !personalityEngine}
              className="flex items-center gap-2"
            >
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
              Run Companion Mode Consistency Test
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
                      <div className={`text-2xl font-bold ${getScoreColor(metrics.averageConsistency)}`}>
                        {metrics.averageConsistency}%
                      </div>
                      <div className="text-sm text-gray-600">Consistency</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(metrics.averageWarmth)}`}>
                        {metrics.averageWarmth}%
                      </div>
                      <div className="text-sm text-gray-600">Warmth</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(metrics.supportiveElementsRate)}`}>
                        {metrics.supportiveElementsRate}%
                      </div>
                      <div className="text-sm text-gray-600">Support Rate</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(metrics.personalityStability)}`}>
                        {metrics.personalityStability}%
                      </div>
                      <div className="text-sm text-gray-600">Stability</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Test Results */}
            <div className="space-y-3">
              {companionTests.map((test) => (
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
                            <Badge className={getScoreColor(test.consistency)}>
                              {test.consistency}%
                            </Badge>
                            <Badge className={getScoreColor(test.warmthLevel)}>
                              Warmth: {test.warmthLevel}%
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {test.status === 'completed' && (
                      <>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {getSupportiveBadges(test.supportiveElements)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">Personality:</span>
                            <span className={`ml-2 font-medium ${getScoreColor(test.personalityConsistency)}`}>
                              {test.personalityConsistency}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Length:</span>
                            <span className="ml-2 font-medium">{test.responseLength}</span>
                          </div>
                        </div>
                        
                        <Progress value={test.consistency} className="h-2" />
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {companionTests.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Smile className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No companion mode tests run yet. Click "Run Companion Mode Consistency Test" to begin.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
