
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Target,
  Loader2,
  Database,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { enhancedMemoryService } from '@/services/enhanced-memory-service';

interface SearchTest {
  id: string;
  query: string;
  expectedStrategy: 'exact' | 'fuzzy' | 'context';
  actualStrategy?: string;
  memoryCount: number;
  executionTime: number;
  accuracy: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  timestamp: string;
}

interface SearchAccuracyMetrics {
  totalTests: number;
  successfulTests: number;
  averageExecutionTime: number;
  strategyDistribution: Record<string, number>;
  accuracyScore: number;
}

export const MemorySearchAccuracyTester: React.FC = () => {
  const [searchTests, setSearchTests] = useState<SearchTest[]>([]);
  const [customQuery, setCustomQuery] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [metrics, setMetrics] = useState<SearchAccuracyMetrics>({
    totalTests: 0,
    successfulTests: 0,
    averageExecutionTime: 0,
    strategyDistribution: {},
    accuracyScore: 0
  });

  useEffect(() => {
    initializeSearchTester();
  }, []);

  const initializeSearchTester = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        console.log('🔍 Memory Search Accuracy Tester initialized for user:', user.id);
      }
    } catch (error) {
      console.error('❌ Error initializing search tester:', error);
    }
  };

  const predefinedTestQueries = [
    { query: 'stuck on decision', expectedStrategy: 'exact' as const },
    { query: 'career change guidance', expectedStrategy: 'fuzzy' as const },
    { query: 'feeling overwhelmed', expectedStrategy: 'exact' as const },
    { query: 'personal growth journey', expectedStrategy: 'context' as const },
    { query: 'relationship advice', expectedStrategy: 'fuzzy' as const },
    { query: 'productivity tips', expectedStrategy: 'context' as const },
    { query: 'mindfulness practice', expectedStrategy: 'fuzzy' as const },
    { query: 'goal setting', expectedStrategy: 'exact' as const }
  ];

  const runComprehensiveSearchTest = async () => {
    if (!userId) {
      console.error('❌ No authenticated user for search testing');
      return;
    }

    setIsRunning(true);
    const testResults: SearchTest[] = [];

    console.log('🚀 Starting comprehensive memory search accuracy test');

    try {
      for (const testQuery of predefinedTestQueries) {
        const testId = `search_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const newTest: SearchTest = {
          id: testId,
          query: testQuery.query,
          expectedStrategy: testQuery.expectedStrategy,
          memoryCount: 0,
          executionTime: 0,
          accuracy: 0,
          status: 'running',
          timestamp: new Date().toISOString()
        };

        setSearchTests(prev => [...prev, newTest]);

        try {
          // Execute progressive search test
          const searchResult = await enhancedMemoryService.performProgressiveSearch(
            testQuery.query,
            10
          );

          const accuracy = calculateSearchAccuracy(
            searchResult,
            testQuery.expectedStrategy,
            testQuery.query
          );

          const completedTest: SearchTest = {
            ...newTest,
            actualStrategy: searchResult.searchStrategy,
            memoryCount: searchResult.matchCount,
            executionTime: searchResult.executionTime,
            accuracy,
            status: 'completed'
          };

          testResults.push(completedTest);
          
          setSearchTests(prev => 
            prev.map(test => test.id === testId ? completedTest : test)
          );

          console.log(`✅ Search test completed: ${testQuery.query}`, {
            strategy: searchResult.searchStrategy,
            matches: searchResult.matchCount,
            time: searchResult.executionTime,
            accuracy
          });

          // Small delay between tests to avoid overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
          console.error(`❌ Search test failed for query: ${testQuery.query}`, error);
          
          const failedTest: SearchTest = {
            ...newTest,
            status: 'failed',
            accuracy: 0
          };

          setSearchTests(prev => 
            prev.map(test => test.id === testId ? failedTest : test)
          );
        }
      }

      // Calculate overall metrics
      const overallMetrics = calculateOverallMetrics(testResults);
      setMetrics(overallMetrics);

      console.log('🎯 Comprehensive search test completed:', overallMetrics);

    } catch (error) {
      console.error('❌ Error in comprehensive search test:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runCustomSearchTest = async () => {
    if (!customQuery.trim() || !userId) return;

    const testId = `custom_search_${Date.now()}`;
    const newTest: SearchTest = {
      id: testId,
      query: customQuery,
      expectedStrategy: 'context', // Default for custom tests
      memoryCount: 0,
      executionTime: 0,
      accuracy: 0,
      status: 'running',
      timestamp: new Date().toISOString()
    };

    setSearchTests(prev => [...prev, newTest]);

    try {
      const searchResult = await enhancedMemoryService.performProgressiveSearch(
        customQuery,
        10
      );

      const accuracy = calculateSearchAccuracy(
        searchResult,
        'context',
        customQuery
      );

      const completedTest: SearchTest = {
        ...newTest,
        actualStrategy: searchResult.searchStrategy,
        memoryCount: searchResult.matchCount,
        executionTime: searchResult.executionTime,
        accuracy,
        status: 'completed'
      };

      setSearchTests(prev => 
        prev.map(test => test.id === testId ? completedTest : test)
      );

      console.log('✅ Custom search test completed:', completedTest);
      setCustomQuery('');

    } catch (error) {
      console.error('❌ Custom search test failed:', error);
      setSearchTests(prev => 
        prev.map(test => 
          test.id === testId ? { ...test, status: 'failed' } : test
        )
      );
    }
  };

  const calculateSearchAccuracy = (
    searchResult: any,
    expectedStrategy: string,
    query: string
  ): number => {
    let accuracy = 50; // Base score
    
    // Strategy alignment bonus
    if (searchResult.searchStrategy === expectedStrategy) {
      accuracy += 30;
    } else if (searchResult.searchStrategy !== 'context') {
      // Partial credit for non-fallback strategies
      accuracy += 15;
    }
    
    // Results quality bonus
    if (searchResult.matchCount > 0) {
      accuracy += 20;
    }
    
    // Performance bonus
    if (searchResult.executionTime < 1000) {
      accuracy += 10;
    } else if (searchResult.executionTime < 2000) {
      accuracy += 5;
    }
    
    // Query relevance check (basic keyword matching)
    const queryWords = query.toLowerCase().split(' ');
    const hasRelevantResults = searchResult.memories?.some((memory: any) => {
      const memoryContent = JSON.stringify(memory).toLowerCase();
      return queryWords.some(word => memoryContent.includes(word));
    });
    
    if (hasRelevantResults) {
      accuracy += 10;
    }
    
    return Math.min(100, accuracy);
  };

  const calculateOverallMetrics = (tests: SearchTest[]): SearchAccuracyMetrics => {
    const completedTests = tests.filter(test => test.status === 'completed');
    const successfulTests = completedTests.filter(test => test.accuracy >= 70);
    
    const strategyDistribution = completedTests.reduce((acc, test) => {
      const strategy = test.actualStrategy || 'unknown';
      acc[strategy] = (acc[strategy] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const totalExecutionTime = completedTests.reduce((sum, test) => sum + test.executionTime, 0);
    const totalAccuracy = completedTests.reduce((sum, test) => sum + test.accuracy, 0);
    
    return {
      totalTests: tests.length,
      successfulTests: successfulTests.length,
      averageExecutionTime: completedTests.length > 0 ? Math.round(totalExecutionTime / completedTests.length) : 0,
      strategyDistribution,
      accuracyScore: completedTests.length > 0 ? Math.round(totalAccuracy / completedTests.length) : 0
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 80) return 'text-green-600';
    if (accuracy >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Memory Search Accuracy Tester
          </CardTitle>
          <p className="text-sm text-gray-600">
            Test progressive search strategies (exact → fuzzy → context) with real memory data
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Control Panel */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={runComprehensiveSearchTest}
                disabled={isRunning || !userId}
                className="flex items-center gap-2"
              >
                {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
                Run Comprehensive Test
              </Button>
              
              <div className="flex gap-2 flex-1">
                <Input
                  placeholder="Enter custom search query..."
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && runCustomSearchTest()}
                />
                <Button 
                  onClick={runCustomSearchTest}
                  disabled={!customQuery.trim() || !userId}
                  variant="outline"
                >
                  <Zap className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Metrics Dashboard */}
            {metrics.totalTests > 0 && (
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{metrics.totalTests}</div>
                      <div className="text-sm text-gray-600">Total Tests</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{metrics.successfulTests}</div>
                      <div className="text-sm text-gray-600">Successful</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{metrics.averageExecutionTime}ms</div>
                      <div className="text-sm text-gray-600">Avg Time</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getAccuracyColor(metrics.accuracyScore)}`}>
                        {metrics.accuracyScore}%
                      </div>
                      <div className="text-sm text-gray-600">Accuracy</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search Test Results */}
            <div className="space-y-3">
              {searchTests.map((test) => (
                <Card key={test.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(test.status)}
                        <span className="font-medium">{test.query}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {test.actualStrategy || test.expectedStrategy}
                        </Badge>
                        {test.status === 'completed' && (
                          <Badge className={getAccuracyColor(test.accuracy)}>
                            {test.accuracy}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {test.status === 'completed' && (
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Memories Found:</span>
                          <span className="ml-2 font-medium">{test.memoryCount}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Execution Time:</span>
                          <span className="ml-2 font-medium">{test.executionTime}ms</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Strategy:</span>
                          <span className="ml-2 font-medium capitalize">{test.actualStrategy}</span>
                        </div>
                      </div>
                    )}
                    
                    {test.status === 'completed' && (
                      <div className="mt-3">
                        <Progress value={test.accuracy} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {searchTests.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No search tests run yet. Click "Run Comprehensive Test" to begin.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
