
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Star,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Target,
  Zap,
  Award
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { memoryInformedConversationService } from '@/services/memory-informed-conversation-service';

interface ImportanceTest {
  id: string;
  userMessage: string;
  calculatedImportance: number;
  expectedImportance: number;
  importanceFactors: {
    emotional: boolean;
    problem: boolean;
    goal: boolean;
    length: boolean;
  };
  accuracy: number;
  timestamp: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

interface ImportanceMetrics {
  totalTests: number;
  averageAccuracy: number;
  emotionalDetection: number;
  problemDetection: number;
  goalDetection: number;
  lengthConsideration: number;
}

export const MemoryImportanceScoringTester: React.FC = () => {
  const [importanceTests, setImportanceTests] = useState<ImportanceTest[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [expectedScore, setExpectedScore] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [metrics, setMetrics] = useState<ImportanceMetrics>({
    totalTests: 0,
    averageAccuracy: 0,
    emotionalDetection: 0,
    problemDetection: 0,
    goalDetection: 0,
    lengthConsideration: 0
  });

  useEffect(() => {
    initializeImportanceTester();
  }, []);

  const initializeImportanceTester = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        console.log('⭐ Memory Importance Scoring Tester initialized for user:', user.id);
      }
    } catch (error) {
      console.error('❌ Error initializing importance tester:', error);
    }
  };

  const testMessages = [
    {
      message: "I'm feeling really stuck and frustrated with my career right now",
      expectedImportance: 8,
      category: 'high_emotional_problem'
    },
    {
      message: "My dream is to start my own business and help people",
      expectedImportance: 7,
      category: 'goal_oriented'
    },
    {
      message: "I've been struggling with anxiety and it's affecting my relationships",
      expectedImportance: 9,
      category: 'high_emotional_personal'
    },
    {
      message: "What's the weather like today?",
      expectedImportance: 3,
      category: 'low_casual'
    },
    {
      message: "I just had an amazing breakthrough in therapy and finally understand my patterns. This feels like a turning point in my life where I can start making real changes.",
      expectedImportance: 9,
      category: 'high_breakthrough_long'
    },
    {
      message: "Thanks for the help",
      expectedImportance: 4,
      category: 'low_gratitude'
    },
    {
      message: "I keep procrastinating on important tasks and it's causing me stress",
      expectedImportance: 7,
      category: 'medium_behavioral_problem'
    },
    {
      message: "I want to improve my work-life balance this year",
      expectedImportance: 6,
      category: 'medium_goal'
    }
  ];

  const runImportanceScoringTest = async () => {
    if (!userId) {
      console.error('❌ No authenticated user for importance testing');
      return;
    }

    setIsRunning(true);
    const testResults: ImportanceTest[] = [];

    console.log('🚀 Starting memory importance scoring test');

    try {
      for (const testMessage of testMessages) {
        const testId = `importance_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const newTest: ImportanceTest = {
          id: testId,
          userMessage: testMessage.message,
          calculatedImportance: 0,
          expectedImportance: testMessage.expectedImportance,
          importanceFactors: {
            emotional: false,
            problem: false,
            goal: false,
            length: false
          },
          accuracy: 0,
          timestamp: new Date().toISOString(),
          status: 'running'
        };

        setImportanceTests(prev => [...prev, newTest]);

        try {
          // Use the actual importance calculation from memoryInformedConversationService
          const calculatedImportance = await calculateMessageImportance(testMessage.message);
          const importanceFactors = analyzeImportanceFactors(testMessage.message);
          const accuracy = calculateAccuracy(calculatedImportance, testMessage.expectedImportance);

          const completedTest: ImportanceTest = {
            ...newTest,
            calculatedImportance,
            importanceFactors,
            accuracy,
            status: 'completed'
          };

          testResults.push(completedTest);
          
          setImportanceTests(prev => 
            prev.map(test => test.id === testId ? completedTest : test)
          );

          console.log(`✅ Importance test completed for: ${testMessage.message.substring(0, 50)}...`, {
            calculated: calculatedImportance,
            expected: testMessage.expectedImportance,
            accuracy
          });

          // Small delay between tests
          await new Promise(resolve => setTimeout(resolve, 300));

        } catch (error) {
          console.error(`❌ Importance test failed for: ${testMessage.message}`, error);
          
          setImportanceTests(prev => 
            prev.map(test => 
              test.id === testId ? { ...test, status: 'failed' } : test
            )
          );
        }
      }

      // Calculate overall metrics
      const overallMetrics = calculateOverallMetrics(testResults);
      setMetrics(overallMetrics);

      console.log('🎯 Importance scoring test completed:', overallMetrics);

    } catch (error) {
      console.error('❌ Error in importance scoring test:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runCustomImportanceTest = async () => {
    if (!customMessage.trim() || !userId) return;

    const testId = `custom_importance_${Date.now()}`;
    const newTest: ImportanceTest = {
      id: testId,
      userMessage: customMessage,
      calculatedImportance: 0,
      expectedImportance: expectedScore,
      importanceFactors: {
        emotional: false,
        problem: false,
        goal: false,
        length: false
      },
      accuracy: 0,
      timestamp: new Date().toISOString(),
      status: 'running'
    };

    setImportanceTests(prev => [...prev, newTest]);

    try {
      const calculatedImportance = await calculateMessageImportance(customMessage);
      const importanceFactors = analyzeImportanceFactors(customMessage);
      const accuracy = calculateAccuracy(calculatedImportance, expectedScore);

      const completedTest: ImportanceTest = {
        ...newTest,
        calculatedImportance,
        importanceFactors,
        accuracy,
        status: 'completed'
      };

      setImportanceTests(prev => 
        prev.map(test => test.id === testId ? completedTest : test)
      );

      console.log('✅ Custom importance test completed:', completedTest);
      setCustomMessage('');

    } catch (error) {
      console.error('❌ Custom importance test failed:', error);
      setImportanceTests(prev => 
        prev.map(test => 
          test.id === testId ? { ...test, status: 'failed' } : test
        )
      );
    }
  };

  const calculateMessageImportance = async (message: string): Promise<number> => {
    // Replicate the actual importance calculation logic from memoryInformedConversationService
    let score = 5; // base score
    
    const emotionalWords = ['stuck', 'frustrated', 'excited', 'happy', 'sad', 'angry', 'worried', 'grateful', 'anxiety', 'breakthrough'];
    const problemWords = ['problem', 'issue', 'challenge', 'difficulty', 'struggle', 'stuck', 'frustrated'];
    const goalWords = ['goal', 'dream', 'aspiration', 'want', 'wish', 'hope', 'plan', 'improve'];
    
    const lowerMessage = message.toLowerCase();
    
    if (emotionalWords.some(word => lowerMessage.includes(word))) score += 2;
    if (problemWords.some(word => lowerMessage.includes(word))) score += 3;
    if (goalWords.some(word => lowerMessage.includes(word))) score += 2;
    if (message.length > 100) score += 1; // longer messages often more important
    
    return Math.min(score, 10); // cap at 10
  };

  const analyzeImportanceFactors = (message: string): ImportanceTest['importanceFactors'] => {
    const lowerMessage = message.toLowerCase();
    
    return {
      emotional: ['stuck', 'frustrated', 'excited', 'happy', 'sad', 'angry', 'worried', 'grateful', 'anxiety', 'breakthrough'].some(word => lowerMessage.includes(word)),
      problem: ['problem', 'issue', 'challenge', 'difficulty', 'struggle', 'stuck', 'frustrated'].some(word => lowerMessage.includes(word)),
      goal: ['goal', 'dream', 'aspiration', 'want', 'wish', 'hope', 'plan', 'improve'].some(word => lowerMessage.includes(word)),
      length: message.length > 100
    };
  };

  const calculateAccuracy = (calculated: number, expected: number): number => {
    const difference = Math.abs(calculated - expected);
    const maxDifference = 7; // Max possible difference (10 - 3)
    const accuracy = Math.max(0, (1 - (difference / maxDifference)) * 100);
    return Math.round(accuracy);
  };

  const calculateOverallMetrics = (tests: ImportanceTest[]): ImportanceMetrics => {
    const completedTests = tests.filter(test => test.status === 'completed');
    
    if (completedTests.length === 0) {
      return {
        totalTests: tests.length,
        averageAccuracy: 0,
        emotionalDetection: 0,
        problemDetection: 0,
        goalDetection: 0,
        lengthConsideration: 0
      };
    }

    const totalAccuracy = completedTests.reduce((sum, test) => sum + test.accuracy, 0);
    
    const emotionalTests = completedTests.filter(test => 
      test.userMessage.toLowerCase().includes('stuck') || 
      test.userMessage.toLowerCase().includes('frustrated') ||
      test.userMessage.toLowerCase().includes('anxiety') ||
      test.userMessage.toLowerCase().includes('breakthrough')
    );
    const emotionalCorrect = emotionalTests.filter(test => test.importanceFactors.emotional).length;
    
    const problemTests = completedTests.filter(test => 
      test.userMessage.toLowerCase().includes('problem') ||
      test.userMessage.toLowerCase().includes('struggle') ||
      test.userMessage.toLowerCase().includes('difficulty')
    );
    const problemCorrect = problemTests.filter(test => test.importanceFactors.problem).length;
    
    const goalTests = completedTests.filter(test => 
      test.userMessage.toLowerCase().includes('goal') ||
      test.userMessage.toLowerCase().includes('dream') ||
      test.userMessage.toLowerCase().includes('improve')
    );
    const goalCorrect = goalTests.filter(test => test.importanceFactors.goal).length;
    
    const longTests = completedTests.filter(test => test.userMessage.length > 100);
    const lengthCorrect = longTests.filter(test => test.importanceFactors.length).length;

    return {
      totalTests: tests.length,
      averageAccuracy: Math.round(totalAccuracy / completedTests.length),
      emotionalDetection: emotionalTests.length > 0 ? Math.round((emotionalCorrect / emotionalTests.length) * 100) : 0,
      problemDetection: problemTests.length > 0 ? Math.round((problemCorrect / problemTests.length) * 100) : 0,
      goalDetection: goalTests.length > 0 ? Math.round((goalCorrect / goalTests.length) * 100) : 0,
      lengthConsideration: longTests.length > 0 ? Math.round((lengthCorrect / longTests.length) * 100) : 0
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Star className="h-4 w-4 text-gray-400" />;
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImportanceColor = (importance: number): string => {
    if (importance >= 8) return 'text-red-600';
    if (importance >= 6) return 'text-yellow-600';
    if (importance >= 4) return 'text-blue-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Memory Importance Scoring Tester
          </CardTitle>
          <p className="text-sm text-gray-600">
            Validate automatic importance calculation using actual conversation patterns
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Control Panel */}
            <div className="flex flex-col gap-4">
              <Button 
                onClick={runImportanceScoringTest}
                disabled={isRunning || !userId}
                className="flex items-center gap-2"
              >
                {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
                Run Importance Scoring Test
              </Button>
              
              <div className="space-y-2">
                <Textarea
                  placeholder="Enter a custom message to test importance scoring..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2 items-center">
                  <label className="text-sm font-medium">Expected Score (1-10):</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={expectedScore}
                    onChange={(e) => setExpectedScore(Number(e.target.value))}
                    className="w-16 px-2 py-1 border rounded text-sm"
                  />
                  <Button 
                    onClick={runCustomImportanceTest}
                    disabled={!customMessage.trim() || !userId}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    Test Custom Message
                  </Button>
                </div>
              </div>
            </div>

            {/* Metrics Dashboard */}
            {metrics.totalTests > 0 && (
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{metrics.totalTests}</div>
                      <div className="text-sm text-gray-600">Total Tests</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(metrics.averageAccuracy)}`}>
                        {metrics.averageAccuracy}%
                      </div>
                      <div className="text-sm text-gray-600">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(metrics.emotionalDetection)}`}>
                        {metrics.emotionalDetection}%
                      </div>
                      <div className="text-sm text-gray-600">Emotional</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(metrics.problemDetection)}`}>
                        {metrics.problemDetection}%
                      </div>
                      <div className="text-sm text-gray-600">Problem</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(metrics.goalDetection)}`}>
                        {metrics.goalDetection}%
                      </div>
                      <div className="text-sm text-gray-600">Goal</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(metrics.lengthConsideration)}`}>
                        {metrics.lengthConsideration}%
                      </div>
                      <div className="text-sm text-gray-600">Length</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Test Results */}
            <div className="space-y-3">
              {importanceTests.map((test) => (
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
                            <Badge className={getImportanceColor(test.calculatedImportance)}>
                              Calc: {test.calculatedImportance}
                            </Badge>
                            <Badge variant="outline">
                              Exp: {test.expectedImportance}
                            </Badge>
                            <Badge className={getScoreColor(test.accuracy)}>
                              {test.accuracy}%
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {test.status === 'completed' && (
                      <>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {test.importanceFactors.emotional && (
                            <Badge variant="secondary" className="text-xs">
                              Emotional
                            </Badge>
                          )}
                          {test.importanceFactors.problem && (
                            <Badge variant="secondary" className="text-xs">
                              Problem
                            </Badge>
                          )}
                          {test.importanceFactors.goal && (
                            <Badge variant="secondary" className="text-xs">
                              Goal
                            </Badge>
                          )}
                          {test.importanceFactors.length && (
                            <Badge variant="secondary" className="text-xs">
                              Long
                            </Badge>
                          )}
                        </div>
                        
                        <Progress value={test.accuracy} className="h-2" />
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {importanceTests.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No importance tests run yet. Click "Run Importance Scoring Test" to begin.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
