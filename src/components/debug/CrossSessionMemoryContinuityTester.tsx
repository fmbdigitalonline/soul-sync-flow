
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Users,
  Clock,
  MessageSquare,
  Database
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { memoryInformedConversationService } from '@/services/memory-informed-conversation-service';
import { enhancedMemoryService } from '@/services/enhanced-memory-service';

interface SessionContinuityTest {
  id: string;
  sessionId: string;
  previousSessions: string[];
  testMessage: string;
  crossSessionMemories: number;
  contextIntegration: number;
  continuityScore: number;
  timestamp: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

interface ContinuityMetrics {
  totalTests: number;
  averageContinuityScore: number;
  crossSessionEffectiveness: number;
  memoryPersistence: number;
  contextCoherence: number;
}

export const CrossSessionMemoryContinuityTester: React.FC = () => {
  const [continuityTests, setContinuityTests] = useState<SessionContinuityTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [metrics, setMetrics] = useState<ContinuityMetrics>({
    totalTests: 0,
    averageContinuityScore: 0,
    crossSessionEffectiveness: 0,
    memoryPersistence: 0,
    contextCoherence: 0
  });

  useEffect(() => {
    initializeContinuityTester();
  }, []);

  const initializeContinuityTester = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        console.log('🔄 Cross-Session Memory Continuity Tester initialized for user:', user.id);
      }
    } catch (error) {
      console.error('❌ Error initializing continuity tester:', error);
    }
  };

  const testScenarios = [
    {
      message: "I'm still working on that project we discussed before",
      expectedContinuity: 'high'
    },
    {
      message: "How's my progress on the goals I mentioned last time?",
      expectedContinuity: 'high'
    },
    {
      message: "I want to revisit that advice you gave me earlier",
      expectedContinuity: 'medium'
    },
    {
      message: "Can you help me understand my patterns better?",
      expectedContinuity: 'medium'
    },
    {
      message: "What should I focus on next in my journey?",
      expectedContinuity: 'low'
    }
  ];

  const runCrossSessionContinuityTest = async () => {
    if (!userId) {
      console.error('❌ No authenticated user for continuity testing');
      return;
    }

    setIsRunning(true);
    const testResults: SessionContinuityTest[] = [];

    console.log('🚀 Starting cross-session memory continuity test');

    try {
      // Get existing user sessions to test continuity
      const existingSessions = await getUserSessions();
      
      if (existingSessions.length < 2) {
        console.log('⚠️ Insufficient session history for cross-session testing');
        // Create some test sessions first
        await createTestSessions();
      }

      for (const scenario of testScenarios) {
        const testId = `continuity_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newSessionId = `test_session_${Date.now()}`;
        
        const newTest: SessionContinuityTest = {
          id: testId,
          sessionId: newSessionId,
          previousSessions: existingSessions.slice(0, 3), // Use last 3 sessions
          testMessage: scenario.message,
          crossSessionMemories: 0,
          contextIntegration: 0,
          continuityScore: 0,
          timestamp: new Date().toISOString(),
          status: 'running'
        };

        setContinuityTests(prev => [...prev, newTest]);

        try {
          // Test cross-session memory retrieval
          const crossSessionMemories = await memoryInformedConversationService.getCrossSessionContext(
            userId,
            newSessionId,
            5
          );

          console.log('🔄 Cross-session memories retrieved:', crossSessionMemories.length);

          // Build memory context including cross-session data
          const memoryContext = await memoryInformedConversationService.buildMemoryContext(
            scenario.message,
            newSessionId,
            userId
          );

          // Calculate continuity metrics
          const continuityScore = calculateContinuityScore(
            crossSessionMemories,
            memoryContext,
            scenario.message,
            scenario.expectedContinuity
          );

          const contextIntegration = calculateContextIntegration(memoryContext, crossSessionMemories);

          const completedTest: SessionContinuityTest = {
            ...newTest,
            crossSessionMemories: crossSessionMemories.length,
            contextIntegration,
            continuityScore,
            status: 'completed'
          };

          testResults.push(completedTest);
          
          setContinuityTests(prev => 
            prev.map(test => test.id === testId ? completedTest : test)
          );

          console.log(`✅ Continuity test completed for: ${scenario.message.substring(0, 50)}...`, {
            crossSessionMemories: crossSessionMemories.length,
            continuityScore,
            contextIntegration
          });

          // Delay between tests
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`❌ Continuity test failed for: ${scenario.message}`, error);
          
          setContinuityTests(prev => 
            prev.map(test => 
              test.id === testId ? { ...test, status: 'failed' } : test
            )
          );
        }
      }

      // Calculate overall metrics
      const overallMetrics = calculateOverallMetrics(testResults);
      setMetrics(overallMetrics);

      console.log('🎯 Cross-session continuity test completed:', overallMetrics);

    } catch (error) {
      console.error('❌ Error in cross-session continuity test:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getUserSessions = async (): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('user_session_memory')
        .select('session_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const uniqueSessions = [...new Set(data?.map(record => record.session_id) || [])];
      console.log('📊 Found existing sessions:', uniqueSessions.length);
      return uniqueSessions;
    } catch (error) {
      console.error('❌ Error getting user sessions:', error);
      return [];
    }
  };

  const createTestSessions = async () => {
    const testSessions = [
      { sessionId: 'test_session_1', message: "I'm working on improving my productivity habits" },
      { sessionId: 'test_session_2', message: "I've been feeling stuck on some personal goals" },
      { sessionId: 'test_session_3', message: "Can you help me with my career development plans?" }
    ];

    for (const session of testSessions) {
      try {
        await memoryInformedConversationService.buildMemoryContext(
          session.message,
          session.sessionId,
          userId
        );
        console.log(`✅ Created test session: ${session.sessionId}`);
      } catch (error) {
        console.error(`❌ Error creating test session ${session.sessionId}:`, error);
      }
    }
  };

  const calculateContinuityScore = (
    crossSessionMemories: any[],
    memoryContext: any,
    message: string,
    expectedContinuity: string
  ): number => {
    let score = 40; // Base score

    // Cross-session memory availability bonus
    if (crossSessionMemories.length > 0) {
      score += 25;
      if (crossSessionMemories.length >= 3) score += 10;
    }

    // Memory integration bonus
    if (memoryContext.relevantMemories.length > 0) {
      score += 15;
    }

    // Context continuity bonus
    const contextWords = message.toLowerCase().split(' ');
    const hasContextualReferences = contextWords.some(word => 
      ['before', 'last', 'previous', 'earlier', 'discussed', 'mentioned'].includes(word)
    );
    
    if (hasContextualReferences && crossSessionMemories.length > 0) {
      score += 15;
    }

    // Expected continuity alignment
    const continuityMultiplier = expectedContinuity === 'high' ? 1.1 : 
                                expectedContinuity === 'medium' ? 1.0 : 0.9;
    
    score = Math.round(score * continuityMultiplier);

    return Math.min(100, score);
  };

  const calculateContextIntegration = (memoryContext: any, crossSessionMemories: any[]): number => {
    if (crossSessionMemories.length === 0) return 0;

    let integration = 30; // Base integration

    // Context summary quality
    if (memoryContext.contextSummary && memoryContext.contextSummary.length > 50) {
      integration += 25;
    }

    // Memory relevance
    const totalMemories = memoryContext.relevantMemories.length;
    const crossSessionCount = crossSessionMemories.length;
    
    if (totalMemories > 0) {
      const crossSessionRatio = crossSessionCount / totalMemories;
      integration += Math.round(crossSessionRatio * 30);
    }

    // Recency factor
    const recentMemories = crossSessionMemories.filter(memory => {
      const memoryDate = new Date(memory.created_at);
      const daysDiff = (Date.now() - memoryDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7; // Within last week
    });

    if (recentMemories.length > 0) {
      integration += 15;
    }

    return Math.min(100, integration);
  };

  const calculateOverallMetrics = (tests: SessionContinuityTest[]): ContinuityMetrics => {
    const completedTests = tests.filter(test => test.status === 'completed');
    
    if (completedTests.length === 0) {
      return {
        totalTests: tests.length,
        averageContinuityScore: 0,
        crossSessionEffectiveness: 0,
        memoryPersistence: 0,
        contextCoherence: 0
      };
    }

    const totalContinuityScore = completedTests.reduce((sum, test) => sum + test.continuityScore, 0);
    const totalContextIntegration = completedTests.reduce((sum, test) => sum + test.contextIntegration, 0);
    const totalCrossSessionMemories = completedTests.reduce((sum, test) => sum + test.crossSessionMemories, 0);
    
    const testsWithMemories = completedTests.filter(test => test.crossSessionMemories > 0);
    
    return {
      totalTests: tests.length,
      averageContinuityScore: Math.round(totalContinuityScore / completedTests.length),
      crossSessionEffectiveness: Math.round(totalContextIntegration / completedTests.length),
      memoryPersistence: Math.round((testsWithMemories.length / completedTests.length) * 100),
      contextCoherence: Math.round(totalCrossSessionMemories / completedTests.length)
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Cross-Session Memory Continuity Tester
          </CardTitle>
          <p className="text-sm text-gray-600">
            Test memory application across multiple user sessions with real conversation history
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Control Panel */}
            <Button 
              onClick={runCrossSessionContinuityTest}
              disabled={isRunning || !userId}
              className="flex items-center gap-2"
            >
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
              Run Cross-Session Continuity Test
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
                      <div className={`text-2xl font-bold ${getScoreColor(metrics.averageContinuityScore)}`}>
                        {metrics.averageContinuityScore}%
                      </div>
                      <div className="text-sm text-gray-600">Continuity</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(metrics.crossSessionEffectiveness)}`}>
                        {metrics.crossSessionEffectiveness}%
                      </div>
                      <div className="text-sm text-gray-600">Effectiveness</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(metrics.memoryPersistence)}`}>
                        {metrics.memoryPersistence}%
                      </div>
                      <div className="text-sm text-gray-600">Persistence</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{metrics.contextCoherence}</div>
                      <div className="text-sm text-gray-600">Avg Memories</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Test Results */}
            <div className="space-y-3">
              {continuityTests.map((test) => (
                <Card key={test.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-2 flex-1">
                        {getStatusIcon(test.status)}
                        <div className="flex-1">
                          <p className="font-medium text-sm mb-1">{test.testMessage}</p>
                          <p className="text-xs text-gray-600">
                            Session: {test.sessionId} | Previous: {test.previousSessions.length} sessions
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {test.crossSessionMemories} memories
                        </Badge>
                        {test.status === 'completed' && (
                          <Badge className={getScoreColor(test.continuityScore)}>
                            {test.continuityScore}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {test.status === 'completed' && (
                      <>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">Context Integration:</span>
                            <span className={`ml-2 font-medium ${getScoreColor(test.contextIntegration)}`}>
                              {test.contextIntegration}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Sessions Used:</span>
                            <span className="ml-2 font-medium">{test.previousSessions.length}</span>
                          </div>
                        </div>
                        
                        <Progress value={test.continuityScore} className="h-2" />
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {continuityTests.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No continuity tests run yet. Click "Run Cross-Session Continuity Test" to begin.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
