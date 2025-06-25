
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Zap, 
  Activity, 
  AlertTriangle,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { memoryService } from '@/services/memory-service';
import { enhancedMemoryService } from '@/services/enhanced-memory-service';
import { holisticCoachService } from '@/services/holistic-coach-service';

interface LoadTestMetrics {
  concurrentUsers: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  successRate: number;
  totalRequests: number;
  failedRequests: number;
  throughput: number;
  startTime: number;
  endTime: number;
}

interface LoadTestResult {
  testName: string;
  metrics: LoadTestMetrics;
  status: 'running' | 'completed' | 'failed';
  error?: string;
}

export const ResponseTimeLoadTester: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<LoadTestResult | null>(null);
  const [testHistory, setTestHistory] = useState<LoadTestResult[]>([]);
  const [progress, setProgress] = useState(0);

  const performLoadTest = async (concurrentUsers: number, duration: number): Promise<LoadTestMetrics> => {
    const startTime = Date.now();
    const responses: number[] = [];
    let failedRequests = 0;
    let totalRequests = 0;

    console.log(`🔥 ResponseTimeLoadTester: Starting load test with ${concurrentUsers} concurrent users for ${duration}ms`);

    // Create concurrent user simulations
    const userPromises = Array.from({ length: concurrentUsers }, async (_, userIndex) => {
      const userResponses: number[] = [];
      const endTime = startTime + duration;
      
      while (Date.now() < endTime) {
        try {
          const operationStart = Date.now();
          
          // Simulate real user operations with actual services
          const operations = [
            () => memoryService.getRecentMemories(10),
            () => enhancedMemoryService.performProgressiveSearch(`test-${userIndex}-${Date.now()}`, 5),
            () => memoryService.getActiveReminders(),
            () => memoryService.getLifeContext(),
            () => holisticCoachService.generateSystemPrompt(`User ${userIndex} test message`),
          ];
          
          // Execute random operation
          const randomOperation = operations[Math.floor(Math.random() * operations.length)];
          await randomOperation();
          
          const responseTime = Date.now() - operationStart;
          userResponses.push(responseTime);
          totalRequests++;
          
          // Small delay to prevent overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
        } catch (error) {
          failedRequests++;
          totalRequests++;
          console.error(`❌ Load test operation failed for user ${userIndex}:`, error);
        }
      }
      
      return userResponses;
    });

    // Wait for all user simulations to complete
    const allUserResponses = await Promise.all(userPromises);
    
    // Flatten all responses
    allUserResponses.forEach(userResponses => {
      responses.push(...userResponses);
    });

    const endTime = Date.now();
    const testDuration = endTime - startTime;
    
    // Calculate metrics
    const sortedResponses = responses.sort((a, b) => a - b);
    const averageResponseTime = responses.length > 0 
      ? responses.reduce((sum, time) => sum + time, 0) / responses.length 
      : 0;
    
    const p95Index = Math.floor(sortedResponses.length * 0.95);
    const p95ResponseTime = sortedResponses.length > 0 ? sortedResponses[p95Index] || 0 : 0;
    
    const successRate = totalRequests > 0 ? ((totalRequests - failedRequests) / totalRequests) * 100 : 0;
    const throughput = totalRequests > 0 ? (totalRequests / testDuration) * 1000 : 0; // requests per second

    return {
      concurrentUsers,
      averageResponseTime: Math.round(averageResponseTime),
      p95ResponseTime: Math.round(p95ResponseTime),
      successRate: Math.round(successRate * 100) / 100,
      totalRequests,
      failedRequests,
      throughput: Math.round(throughput * 100) / 100,
      startTime,
      endTime
    };
  };

  const runLoadTest = async (concurrentUsers: number, duration: number) => {
    setIsRunning(true);
    setProgress(0);
    
    const testResult: LoadTestResult = {
      testName: `Load Test - ${concurrentUsers} Users`,
      metrics: {
        concurrentUsers,
        averageResponseTime: 0,
        p95ResponseTime: 0,
        successRate: 0,
        totalRequests: 0,
        failedRequests: 0,
        throughput: 0,
        startTime: Date.now(),
        endTime: 0
      },
      status: 'running'
    };
    
    setCurrentTest(testResult);

    // Progress tracking
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, duration / 10);

    try {
      const metrics = await performLoadTest(concurrentUsers, duration);
      
      const completedTest: LoadTestResult = {
        ...testResult,
        metrics,
        status: 'completed'
      };
      
      setCurrentTest(completedTest);
      setTestHistory(prev => [completedTest, ...prev.slice(0, 4)]);
      setProgress(100);
      
      console.log('✅ Load test completed:', metrics);
    } catch (error) {
      const failedTest: LoadTestResult = {
        ...testResult,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      setCurrentTest(failedTest);
      console.error('❌ Load test failed:', error);
    } finally {
      clearInterval(progressInterval);
      setIsRunning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running': return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      case 'completed': return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatThroughput = (throughput: number) => {
    return `${throughput.toFixed(2)} req/s`;
  };

  return (
    <div className="space-y-6">
      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Response Time Load Tester
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Button
              onClick={() => runLoadTest(5, 10000)}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
              Light Load (5 users)
            </Button>
            
            <Button
              onClick={() => runLoadTest(15, 15000)}
              disabled={isRunning}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
              Medium Load (15 users)
            </Button>
            
            <Button
              onClick={() => runLoadTest(30, 20000)}
              disabled={isRunning}
              variant="destructive"
              className="flex items-center gap-2"
            >
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
              Heavy Load (30 users)
            </Button>
          </div>
          
          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Test Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Test Results */}
      {currentTest && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {currentTest.testName}
              </div>
              {getStatusBadge(currentTest.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentTest.status === 'failed' ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
                <strong>Test Failed:</strong> {currentTest.error}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {currentTest.metrics.averageResponseTime}ms
                  </div>
                  <div className="text-sm text-gray-600">Avg Response</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {currentTest.metrics.p95ResponseTime}ms
                  </div>
                  <div className="text-sm text-gray-600">95th Percentile</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {currentTest.metrics.successRate}%
                  </div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatThroughput(currentTest.metrics.throughput)}
                  </div>
                  <div className="text-sm text-gray-600">Throughput</div>
                </div>
              </div>
            )}
            
            {currentTest.status === 'completed' && (
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Requests:</span>
                  <span className="ml-2 font-medium">{currentTest.metrics.totalRequests}</span>
                </div>
                <div>
                  <span className="text-gray-600">Failed Requests:</span>
                  <span className="ml-2 font-medium">{currentTest.metrics.failedRequests}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Test History */}
      {testHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Load Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testHistory.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium">{test.testName}</div>
                      <div className="text-sm text-gray-600">
                        {test.metrics.concurrentUsers} users • {test.metrics.totalRequests} requests
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium">{test.metrics.averageResponseTime}ms</div>
                      <div className="text-gray-600">Avg</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{test.metrics.successRate}%</div>
                      <div className="text-gray-600">Success</div>
                    </div>
                    {getStatusBadge(test.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResponseTimeLoadTester;
