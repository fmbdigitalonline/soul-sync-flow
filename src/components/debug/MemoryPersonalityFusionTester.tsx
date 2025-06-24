
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain,
  MessageCircle,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Zap,
  Users,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { memoryInformedConversationService } from '@/services/memory-informed-conversation-service';
import { enhancedAICoachService } from '@/services/enhanced-ai-coach-service';

interface FusionTest {
  id: string;
  userMessage: string;
  memoriesUsed: number;
  memoryContextSummary: string;
  aiResponse: string;
  fusionScore: number;
  personalityInfluence: number;
  memoryInfluence: number;
  coherencyScore: number;
  timestamp: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

interface FusionMetrics {
  totalTests: number;
  averageFusionScore: number;
  averageMemoryUsage: number;
  personalityConsistency: number;
  memoryRelevance: number;
}

export const MemoryPersonalityFusionTester: React.FC = () => {
  const [fusionTests, setFusionTests] = useState<FusionTest[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [sessionId] = useState(`fusion_test_${Date.now()}`);
  const [metrics, setMetrics] = useState<FusionMetrics>({
    totalTests: 0,
    averageFusionScore: 0,
    averageMemoryUsage: 0,
    personalityConsistency: 0,
    memoryRelevance: 0
  });

  useEffect(() => {
    initializeFusionTester();
  }, []);

  const initializeFusionTester = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await enhancedAICoachService.setCurrentUser(user.id);
        console.log('🧠 Memory-Personality Fusion Tester initialized for user:', user.id);
      }
    } catch (error) {
      console.error('❌ Error initializing fusion tester:', error);
    }
  };

  const testScenarios = [
    "I'm feeling stuck on a major life decision and need guidance on moving forward",
    "Can you help me understand why I keep procrastinating on important tasks?",
    "I want to improve my relationships but I'm not sure where to start",
    "I'm dealing with a lot of stress lately and could use some coping strategies",
    "What should I focus on for my personal growth journey this year?",
    "I keep having the same conflicts with my colleagues, what might be causing this?",
    "I feel disconnected from my purpose and passion, how can I reconnect?",
    "I'm struggling to maintain work-life balance, any advice?"
  ];

  const runComprehensiveFusionTest = async () => {
    if (!userId) {
      console.error('❌ No authenticated user for fusion testing');
      return;
    }

    setIsRunning(true);
    const testResults: FusionTest[] = [];

    console.log('🚀 Starting comprehensive memory-personality fusion test');

    try {
      for (const message of testScenarios) {
        const testId = `fusion_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const newTest: FusionTest = {
          id: testId,
          userMessage: message,
          memoriesUsed: 0,
          memoryContextSummary: '',
          aiResponse: '',
          fusionScore: 0,
          personalityInfluence: 0,
          memoryInfluence: 0,
          coherencyScore: 0,
          timestamp: new Date().toISOString(),
          status: 'running'
        };

        setFusionTests(prev => [...prev, newTest]);

        try {
          // Step 1: Build memory context
          const memoryContext = await memoryInformedConversationService.buildMemoryContext(
            message,
            sessionId,
            userId
          );

          console.log('🧠 Memory context built:', {
            memoriesCount: memoryContext.relevantMemories.length,
            searchQuery: memoryContext.memorySearchQuery
          });

          // Step 2: Generate AI response with memory-enhanced context
          const response = await enhancedAICoachService.sendMessage(
            message,
            sessionId,
            true, // Use blueprint
            'guide',
            'en'
          );

          // Step 3: Track memory application
          await memoryInformedConversationService.trackMemoryApplication(
            sessionId,
            memoryContext,
            message,
            response.response
          );

          // Step 4: Calculate fusion scores
          const fusionScore = calculateFusionScore(
            memoryContext,
            response.response,
            message
          );

          const personalityInfluence = calculatePersonalityInfluence(response.response);
          const memoryInfluence = calculateMemoryInfluence(memoryContext, response.response);
          const coherencyScore = calculateCoherencyScore(memoryContext, response.response);

          const completedTest: FusionTest = {
            ...newTest,
            memoriesUsed: memoryContext.relevantMemories.length,
            memoryContextSummary: memoryContext.contextSummary,
            aiResponse: response.response.substring(0, 200) + '...', // Truncate for display
            fusionScore,
            personalityInfluence,
            memoryInfluence,
            coherencyScore,
            status: 'completed'
          };

          testResults.push(completedTest);
          
          setFusionTests(prev => 
            prev.map(test => test.id === testId ? completedTest : test)
          );

          console.log(`✅ Fusion test completed for message: ${message.substring(0, 50)}...`, {
            fusionScore,
            memoriesUsed: memoryContext.relevantMemories.length,
            personalityInfluence,
            memoryInfluence
          });

          // Delay between tests
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`❌ Fusion test failed for message: ${message}`, error);
          
          setFusionTests(prev => 
            prev.map(test => 
              test.id === testId ? { ...test, status: 'failed' } : test
            )
          );
        }
      }

      // Calculate overall metrics
      const overallMetrics = calculateOverallMetrics(testResults);
      setMetrics(overallMetrics);

      console.log('🎯 Comprehensive fusion test completed:', overallMetrics);

    } catch (error) {
      console.error('❌ Error in comprehensive fusion test:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runCustomFusionTest = async () => {
    if (!customMessage.trim() || !userId) return;

    const testId = `custom_fusion_${Date.now()}`;
    const newTest: FusionTest = {
      id: testId,
      userMessage: customMessage,
      memoriesUsed: 0,
      memoryContextSummary: '',
      aiResponse: '',
      fusionScore: 0,
      personalityInfluence: 0,
      memoryInfluence: 0,
      coherencyScore: 0,
      timestamp: new Date().toISOString(),
      status: 'running'
    };

    setFusionTests(prev => [...prev, newTest]);

    try {
      const memoryContext = await memoryInformedConversationService.buildMemoryContext(
        customMessage,
        sessionId,
        userId
      );

      const response = await enhancedAICoachService.sendMessage(
        customMessage,
        sessionId,
        true,
        'guide',
        'en'
      );

      const fusionScore = calculateFusionScore(memoryContext, response.response, customMessage);
      const personalityInfluence = calculatePersonalityInfluence(response.response);
      const memoryInfluence = calculateMemoryInfluence(memoryContext, response.response);
      const coherencyScore = calculateCoherencyScore(memoryContext, response.response);

      const completedTest: FusionTest = {
        ...newTest,
        memoriesUsed: memoryContext.relevantMemories.length,
        memoryContextSummary: memoryContext.contextSummary,
        aiResponse: response.response.substring(0, 200) + '...',
        fusionScore,
        personalityInfluence,
        memoryInfluence,
        coherencyScore,
        status: 'completed'
      };

      setFusionTests(prev => 
        prev.map(test => test.id === testId ? completedTest : test)
      );

      console.log('✅ Custom fusion test completed:', completedTest);
      setCustomMessage('');

    } catch (error) {
      console.error('❌ Custom fusion test failed:', error);
      setFusionTests(prev => 
        prev.map(test => 
          test.id === testId ? { ...test, status: 'failed' } : test
        )
      );
    }
  };

  const calculateFusionScore = (memoryContext: any, aiResponse: string, userMessage: string): number => {
    let score = 40; // Base score
    
    // Memory utilization bonus
    if (memoryContext.relevantMemories.length > 0) {
      score += 20;
      if (memoryContext.relevantMemories.length >= 3) score += 10;
    }
    
    // Context integration bonus
    if (aiResponse.toLowerCase().includes('remember') || 
        aiResponse.toLowerCase().includes('previously') || 
        aiResponse.toLowerCase().includes('before')) {
      score += 15;
    }
    
    // Response length and depth bonus
    if (aiResponse.length > 300) score += 10;
    if (aiResponse.length > 600) score += 5;
    
    // Relevance check
    const userWords = userMessage.toLowerCase().split(' ');
    const responseWords = aiResponse.toLowerCase();
    const relevantWords = userWords.filter(word => 
      word.length > 3 && responseWords.includes(word)
    ).length;
    
    if (relevantWords >= 2) score += 10;
    
    return Math.min(100, score);
  };

  const calculatePersonalityInfluence = (aiResponse: string): number => {
    let influence = 30; // Base personality influence
    
    // Check for personality-specific language patterns
    const personalityIndicators = [
      'your personality', 'your type', 'natural tendency', 'your style',
      'your strengths', 'your patterns', 'your approach', 'your nature'
    ];
    
    const responseText = aiResponse.toLowerCase();
    const indicatorCount = personalityIndicators.filter(indicator => 
      responseText.includes(indicator)
    ).length;
    
    influence += indicatorCount * 15;
    
    // Check for personalized advice
    if (responseText.includes('you') && responseText.length > 200) {
      influence += 20;
    }
    
    return Math.min(100, influence);
  };

  const calculateMemoryInfluence = (memoryContext: any, aiResponse: string): number => {
    if (memoryContext.relevantMemories.length === 0) return 0;
    
    let influence = 25; // Base memory influence
    
    // Memory count bonus
    influence += Math.min(30, memoryContext.relevantMemories.length * 7);
    
    // Context summary integration
    const contextWords = memoryContext.contextSummary.toLowerCase().split(' ');
    const responseText = aiResponse.toLowerCase();
    const matchingWords = contextWords.filter(word => 
      word.length > 4 && responseText.includes(word)
    ).length;
    
    influence += Math.min(25, matchingWords * 5);
    
    // Temporal reference bonus
    if (responseText.includes('last time') || 
        responseText.includes('previously') || 
        responseText.includes('earlier')) {
      influence += 20;
    }
    
    return Math.min(100, influence);
  };

  const calculateCoherencyScore = (memoryContext: any, aiResponse: string): number => {
    let coherency = 50; // Base coherency
    
    // Response structure bonus
    if (aiResponse.includes('\n') || aiResponse.includes('.')) coherency += 10;
    
    // Memory-response alignment
    if (memoryContext.relevantMemories.length > 0 && 
        aiResponse.length > 100) {
      coherency += 20;
    }
    
    // Consistency check (basic)
    const sentences = aiResponse.split('.').filter(s => s.trim().length > 10);
    if (sentences.length >= 3) coherency += 15;
    
    // Avoid contradictions (basic check)
    const contradictoryPhrases = ['but also', 'however', 'on the other hand'];
    const contradictions = contradictoryPhrases.filter(phrase => 
      aiResponse.toLowerCase().includes(phrase)
    ).length;
    
    if (contradictions === 0) coherency += 5;
    else if (contradictions > 2) coherency -= 10;
    
    return Math.min(100, coherency);
  };

  const calculateOverallMetrics = (tests: FusionTest[]): FusionMetrics => {
    const completedTests = tests.filter(test => test.status === 'completed');
    
    if (completedTests.length === 0) {
      return {
        totalTests: tests.length,
        averageFusionScore: 0,
        averageMemoryUsage: 0,
        personalityConsistency: 0,
        memoryRelevance: 0
      };
    }
    
    const totalFusionScore = completedTests.reduce((sum, test) => sum + test.fusionScore, 0);
    const totalMemoryUsage = completedTests.reduce((sum, test) => sum + test.memoriesUsed, 0);
    const totalPersonalityInfluence = completedTests.reduce((sum, test) => sum + test.personalityInfluence, 0);
    const totalMemoryInfluence = completedTests.reduce((sum, test) => sum + test.memoryInfluence, 0);
    
    return {
      totalTests: tests.length,
      averageFusionScore: Math.round(totalFusionScore / completedTests.length),
      averageMemoryUsage: Math.round(totalMemoryUsage / completedTests.length),
      personalityConsistency: Math.round(totalPersonalityInfluence / completedTests.length),
      memoryRelevance: Math.round(totalMemoryInfluence / completedTests.length)
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <MessageCircle className="h-4 w-4 text-gray-400" />;
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
            <Brain className="h-5 w-5" />
            Memory-Personality Fusion Tester
          </CardTitle>
          <p className="text-sm text-gray-600">
            Test how retrieved memories enhance personality-driven AI responses
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Control Panel */}
            <div className="flex flex-col gap-4">
              <Button 
                onClick={runComprehensiveFusionTest}
                disabled={isRunning || !userId}
                className="flex items-center gap-2"
              >
                {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
                Run Comprehensive Fusion Test
              </Button>
              
              <div className="space-y-2">
                <Textarea
                  placeholder="Enter a custom message to test memory-personality fusion..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={3}
                />
                <Button 
                  onClick={runCustomFusionTest}
                  disabled={!customMessage.trim() || !userId}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Test Custom Message
                </Button>
              </div>
            </div>

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
                      <div className={`text-2xl font-bold ${getScoreColor(metrics.averageFusionScore)}`}>
                        {metrics.averageFusionScore}%
                      </div>
                      <div className="text-sm text-gray-600">Fusion Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{metrics.averageMemoryUsage}</div>
                      <div className="text-sm text-gray-600">Avg Memories</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(metrics.personalityConsistency)}`}>
                        {metrics.personalityConsistency}%
                      </div>
                      <div className="text-sm text-gray-600">Personality</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(metrics.memoryRelevance)}`}>
                        {metrics.memoryRelevance}%
                      </div>
                      <div className="text-sm text-gray-600">Memory Rel.</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Fusion Test Results */}
            <div className="space-y-3">
              {fusionTests.map((test) => (
                <Card key={test.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-2 flex-1">
                        {getStatusIcon(test.status)}
                        <div className="flex-1">
                          <p className="font-medium text-sm mb-1">{test.userMessage}</p>
                          {test.status === 'completed' && (
                            <p className="text-xs text-gray-600 mb-2">{test.memoryContextSummary}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {test.memoriesUsed} memories
                        </Badge>
                        {test.status === 'completed' && (
                          <Badge className={getScoreColor(test.fusionScore)}>
                            {test.fusionScore}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {test.status === 'completed' && (
                      <>
                        <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">Personality:</span>
                            <span className={`ml-2 font-medium ${getScoreColor(test.personalityInfluence)}`}>
                              {test.personalityInfluence}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Memory:</span>
                            <span className={`ml-2 font-medium ${getScoreColor(test.memoryInfluence)}`}>
                              {test.memoryInfluence}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Coherency:</span>
                            <span className={`ml-2 font-medium ${getScoreColor(test.coherencyScore)}`}>
                              {test.coherencyScore}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Progress value={test.fusionScore} className="h-2" />
                          <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            <strong>AI Response:</strong> {test.aiResponse}
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {fusionTests.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No fusion tests run yet. Click "Run Comprehensive Fusion Test" to begin.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
