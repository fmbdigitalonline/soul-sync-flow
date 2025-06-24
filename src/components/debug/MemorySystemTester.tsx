
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { enhancedMemoryService } from '@/services/enhanced-memory-service';

interface MemoryTest {
  name: string;
  description: string;
  status: 'pending' | 'testing' | 'passed' | 'failed';
  details?: string;
  performanceScore?: number;
}

const MemorySystemTester: React.FC = () => {
  const [tests, setTests] = useState<MemoryTest[]>([
    {
      name: 'Memory Creation and Storage',
      description: 'Test memory creation and storage functionality',
      status: 'pending'
    },
    {
      name: 'Memory Retrieval Performance',
      description: 'Test memory retrieval speed and accuracy',
      status: 'pending'
    },
    {
      name: 'Progressive Memory Search',
      description: 'Test progressive memory search capabilities',
      status: 'pending'
    },
    {
      name: 'Memory Consistency Check',
      description: 'Validate memory consistency and integrity',
      status: 'pending'
    },
    {
      name: 'Memory Flow Integration',
      description: 'Test complete memory flow integration',
      status: 'pending'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const { user } = useAuth();

  const runMemoryTests = async () => {
    if (!user) {
      console.log('❌ No authenticated user for memory testing');
      return;
    }

    setIsRunning(true);
    console.log('🧠 Starting memory system tests');

    const updatedTests = [...tests];

    for (let i = 0; i < updatedTests.length; i++) {
      updatedTests[i].status = 'testing';
      setTests([...updatedTests]);

      try {
        let testResult = false;
        let details = '';
        let performanceScore = 0;

        switch (updatedTests[i].name) {
          case 'Memory Creation and Storage':
            const creationResult = await testMemoryCreation();
            testResult = creationResult.success;
            details = creationResult.details;
            performanceScore = creationResult.score;
            break;
          case 'Memory Retrieval Performance':
            const retrievalResult = await testMemoryRetrieval();
            testResult = retrievalResult.success;
            details = retrievalResult.details;
            performanceScore = retrievalResult.score;
            break;
          case 'Progressive Memory Search':
            const searchResult = await testProgressiveSearch();
            testResult = searchResult.success;
            details = searchResult.details;
            performanceScore = searchResult.score;
            break;
          case 'Memory Consistency Check':
            const consistencyResult = await testMemoryConsistency();
            testResult = consistencyResult.success;
            details = consistencyResult.details;
            performanceScore = consistencyResult.score;
            break;
          case 'Memory Flow Integration':
            const flowResult = await testMemoryFlow();
            testResult = flowResult.success;
            details = flowResult.details;
            performanceScore = flowResult.score;
            break;
        }

        updatedTests[i].status = testResult ? 'passed' : 'failed';
        updatedTests[i].details = details;
        updatedTests[i].performanceScore = performanceScore;

      } catch (error) {
        console.error(`❌ Memory test failed: ${updatedTests[i].name}`, error);
        updatedTests[i].status = 'failed';
        updatedTests[i].details = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }

      setTests([...updatedTests]);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
    console.log('✅ Memory system tests completed');
  };

  const testMemoryCreation = async () => {
    try {
      const testMemory = await enhancedMemoryService.createMemory({
        userId: user!.id,
        content: 'Test memory creation for system validation',
        sessionId: `test-session-${Date.now()}`,
        memoryType: 'conversation',
        importance: 0.8,
        emotional_tone: 'neutral',
        tags: ['test', 'validation']
      });

      return {
        success: testMemory.success,
        details: testMemory.success ? 'Memory creation successful' : 'Memory creation failed',
        score: testMemory.success ? 100 : 0
      };
    } catch (error) {
      return {
        success: false,
        details: `Memory creation test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        score: 0
      };
    }
  };

  const testMemoryRetrieval = async () => {
    try {
      const startTime = Date.now();
      const memories = await enhancedMemoryService.retrieveRecentMemories(user!.id, 5);
      const retrievalTime = Date.now() - startTime;

      const performanceScore = retrievalTime < 1000 ? 100 : Math.max(0, 100 - (retrievalTime - 1000) / 10);

      return {
        success: memories.length >= 0,
        details: `Retrieved ${memories.length} memories in ${retrievalTime}ms`,
        score: Math.round(performanceScore)
      };
    } catch (error) {
      return {
        success: false,
        details: `Memory retrieval test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        score: 0
      };
    }
  };

  const testProgressiveSearch = async () => {
    try {
      const searchResult = await enhancedMemoryService.performProgressiveSearch('test', 3);

      return {
        success: searchResult.memories.length >= 0,
        details: `Progressive search returned ${searchResult.memories.length} results in ${searchResult.executionTime}ms`,
        score: searchResult.executionTime < 2000 ? 100 : Math.max(0, 100 - (searchResult.executionTime - 2000) / 20)
      };
    } catch (error) {
      return {
        success: false,
        details: `Progressive search test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        score: 0
      };
    }
  };

  const testMemoryConsistency = async () => {
    try {
      const consistencyReport = await enhancedMemoryService.generateConsistencyReport();

      return {
        success: consistencyReport.consistencyScore >= 70,
        details: `Memory consistency score: ${consistencyReport.consistencyScore}%`,
        score: consistencyReport.consistencyScore
      };
    } catch (error) {
      return {
        success: false,
        details: `Memory consistency test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        score: 0
      };
    }
  };

  const testMemoryFlow = async () => {
    try {
      const flowTest = await enhancedMemoryService.testMemoryFlow();

      const overallScore = (
        (flowTest.creationTest ? 25 : 0) +
        (flowTest.retrievalTest ? 25 : 0) +
        (flowTest.searchTest ? 25 : 0) +
        (flowTest.consistencyTest ? 25 : 0)
      );

      return {
        success: overallScore >= 75,
        details: `Memory flow test score: ${overallScore}%`,
        score: overallScore
      };
    } catch (error) {
      return {
        success: false,
        details: `Memory flow test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        score: 0
      };
    }
  };

  const resetTests = () => {
    setTests(tests.map(test => ({ 
      ...test, 
      status: 'pending', 
      details: undefined, 
      performanceScore: undefined 
    })));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'testing': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const passedTests = tests.filter(t => t.status === 'passed').length;
  const failedTests = tests.filter(t => t.status === 'failed').length;
  const totalTests = tests.length;
  const averageScore = tests
    .filter(t => t.performanceScore !== undefined)
    .reduce((sum, t) => sum + (t.performanceScore || 0), 0) / tests.filter(t => t.performanceScore !== undefined).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Memory System Testing
        </CardTitle>
        <div className="flex gap-4 text-sm">
          <span>Passed: <Badge className="bg-green-100 text-green-800">{passedTests}/{totalTests}</Badge></span>
          <span>Failed: <Badge className="bg-red-100 text-red-800">{failedTests}/{totalTests}</Badge></span>
          {averageScore > 0 && (
            <span>Performance: <Badge>{Math.round(averageScore)}%</Badge></span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runMemoryTests} 
            disabled={isRunning || !user}
            className="flex items-center gap-2"
          >
            {isRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
            {isRunning ? 'Testing Memory...' : 'Run Memory Tests'}
          </Button>
          <Button variant="outline" onClick={resetTests} disabled={isRunning}>
            Reset
          </Button>
        </div>

        <div className="space-y-3">
          {tests.map((test, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(test.status)}
                  <span className="font-medium">{test.name}</span>
                  {test.performanceScore !== undefined && (
                    <Badge variant="outline">{test.performanceScore}%</Badge>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{test.description}</p>
              {test.details && (
                <p className="text-xs bg-gray-50 p-2 rounded">
                  {test.details}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MemorySystemTester;
