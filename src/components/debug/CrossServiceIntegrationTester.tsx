
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Network, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBlueprintCache } from '@/contexts/BlueprintCacheContext';
import { blueprintAIIntegrationService } from '@/services/blueprint-ai-integration-service';
import { enhancedMemoryService } from '@/services/enhanced-memory-service';
import { holisticCoachService } from '@/services/holistic-coach-service';
import { memoryInformedConversationService } from '@/services/memory-informed-conversation-service';

interface IntegrationTest {
  name: string;
  description: string;
  status: 'pending' | 'testing' | 'passed' | 'failed';
  details?: string;
  executionTime?: number;
  dataFlow: string[];
}

export const CrossServiceIntegrationTester: React.FC = () => {
  const [tests, setTests] = useState<IntegrationTest[]>([
    {
      name: 'Blueprint → AI Integration Flow',
      description: 'Test complete flow from blueprint data to AI persona generation',
      status: 'pending',
      dataFlow: ['Blueprint Service', 'AI Integration Service', 'Holistic Coach Service']
    },
    {
      name: 'Memory → Conversation Integration',
      description: 'Test memory system integration with conversation context',
      status: 'pending',
      dataFlow: ['Memory Service', 'Memory Informed Conversation', 'AI Coach']
    },
    {
      name: 'Auth → Blueprint → Memory Chain',
      description: 'Test complete user authentication to personalized memory flow',
      status: 'pending',
      dataFlow: ['Auth Context', 'Blueprint Cache', 'Memory Service', 'Conversation']
    },
    {
      name: 'Real-time Data Synchronization',
      description: 'Test real-time sync between all personality and memory systems',
      status: 'pending',
      dataFlow: ['Blueprint Updates', 'Cache Invalidation', 'Memory Updates', 'AI Updates']
    },
    {
      name: 'End-to-End Conversation Flow',
      description: 'Test complete conversation flow with all integrations active',
      status: 'pending',
      dataFlow: ['User Input', 'Memory Context', 'Blueprint Persona', 'AI Response', 'Memory Storage']
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [integrationHealth, setIntegrationHealth] = useState<{
    overallScore: number;
    successfulIntegrations: number;
    failedIntegrations: number;
    averageResponseTime: number;
  }>({ overallScore: 0, successfulIntegrations: 0, failedIntegrations: 0, averageResponseTime: 0 });

  const { user } = useAuth();
  const { blueprintData, hasBlueprint } = useBlueprintCache();

  const runIntegrationTests = async () => {
    if (!user) {
      console.log('❌ No authenticated user for integration testing');
      return;
    }

    setIsRunning(true);
    console.log('🔗 Starting cross-service integration tests');

    const updatedTests = [...tests];
    const responseTimes: number[] = [];
    let successfulIntegrations = 0;
    let failedIntegrations = 0;

    for (let i = 0; i < updatedTests.length; i++) {
      updatedTests[i].status = 'testing';
      setTests([...updatedTests]);

      try {
        const startTime = Date.now();
        let testResult = false;
        let details = '';

        switch (updatedTests[i].name) {
          case 'Blueprint → AI Integration Flow':
            testResult = await testBlueprintAIIntegration();
            details = testResult ? 'Blueprint to AI integration working properly' : 'Blueprint to AI integration failed';
            break;

          case 'Memory → Conversation Integration':
            testResult = await testMemoryConversationIntegration();
            details = testResult ? 'Memory and conversation systems integrated successfully' : 'Memory conversation integration failed';
            break;

          case 'Auth → Blueprint → Memory Chain':
            testResult = await testAuthBlueprintMemoryChain();
            details = testResult ? 'Complete auth to memory chain working' : 'Auth to memory chain broken';
            break;

          case 'Real-time Data Synchronization':
            testResult = await testRealTimeDataSync();
            details = testResult ? 'Real-time synchronization working' : 'Real-time sync issues detected';
            break;

          case 'End-to-End Conversation Flow':
            testResult = await testEndToEndConversationFlow();
            details = testResult ? 'Complete conversation flow functional' : 'End-to-end flow has issues';
            break;
        }

        const executionTime = Date.now() - startTime;
        responseTimes.push(executionTime);
        
        updatedTests[i].status = testResult ? 'passed' : 'failed';
        updatedTests[i].details = details;
        updatedTests[i].executionTime = executionTime;

        if (testResult) successfulIntegrations++;
        else failedIntegrations++;

      } catch (error) {
        console.error(`❌ Integration test failed: ${updatedTests[i].name}`, error);
        updatedTests[i].status = 'failed';
        updatedTests[i].details = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        updatedTests[i].executionTime = Date.now();
        failedIntegrations++;
      }

      setTests([...updatedTests]);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Calculate integration health metrics
    const totalTests = updatedTests.length;
    const overallScore = Math.round((successfulIntegrations / totalTests) * 100);
    const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

    setIntegrationHealth({
      overallScore,
      successfulIntegrations,
      failedIntegrations,
      averageResponseTime: Math.round(averageResponseTime)
    });

    setIsRunning(false);
    console.log('✅ Cross-service integration tests completed');
  };

  const testBlueprintAIIntegration = async (): Promise<boolean> => {
    try {
      console.log('🧪 Testing Blueprint → AI integration');
      
      // Test blueprint sync
      const syncResult = await blueprintAIIntegrationService.performBlueprintSync();
      if (!syncResult.success) return false;

      // Test integration report generation
      const integrationReport = await blueprintAIIntegrationService.generateIntegrationReport();
      if (!integrationReport.blueprintLoaded) return false;

      // Test holistic coach service with blueprint
      const systemPrompt = holisticCoachService.generateSystemPrompt("Test integration message");
      
      return systemPrompt.length > 0 && integrationReport.integrationScore > 0;
    } catch (error) {
      console.error('Blueprint AI integration test error:', error);
      return false;
    }
  };

  const testMemoryConversationIntegration = async (): Promise<boolean> => {
    try {
      console.log('🧪 Testing Memory → Conversation integration');
      
      const testSessionId = `integration-test-${Date.now()}`;
      const testMessage = "Testing memory conversation integration";

      // Build memory context
      const memoryContext = await memoryInformedConversationService.buildMemoryContext(
        testMessage,
        testSessionId,
        user!.id
      );

      // Test memory flow
      const memoryFlowTest = await enhancedMemoryService.testMemoryFlow();
      
      // Test consistency report
      const consistencyReport = await enhancedMemoryService.generateConsistencyReport();

      return memoryContext.relevantMemories !== undefined && 
             (memoryFlowTest.creationTest || memoryFlowTest.retrievalTest) &&
             consistencyReport.consistencyScore >= 0;
    } catch (error) {
      console.error('Memory conversation integration test error:', error);
      return false;
    }
  };

  const testAuthBlueprintMemoryChain = async (): Promise<boolean> => {
    try {
      console.log('🧪 Testing Auth → Blueprint → Memory chain');
      
      // Test auth state
      if (!user || !user.id) return false;

      // Test blueprint availability
      const blueprintAvailable = hasBlueprint && blueprintData !== null;

      // Test memory system with auth
      const consistencyReport = await enhancedMemoryService.generateConsistencyReport();
      const authWorking = consistencyReport.userId !== 'not_authenticated';

      // Test memory creation with auth
      const memoryFlowTest = await enhancedMemoryService.testMemoryFlow();

      return blueprintAvailable && authWorking && 
             (memoryFlowTest.creationTest || memoryFlowTest.retrievalTest);
    } catch (error) {
      console.error('Auth blueprint memory chain test error:', error);
      return false;
    }
  };

  const testRealTimeDataSync = async (): Promise<boolean> => {
    try {
      console.log('🧪 Testing real-time data synchronization');
      
      const startTime = Date.now();
      
      // Force blueprint sync
      const syncResult = await blueprintAIIntegrationService.forceBlueprintSync();
      
      // Check memory consistency after sync
      const consistencyReport = await enhancedMemoryService.generateConsistencyReport();
      
      // Test progressive memory search
      const searchResult = await enhancedMemoryService.performProgressiveSearch('test sync', 1);
      
      const syncTime = Date.now() - startTime;
      
      return syncResult.success && 
             consistencyReport.consistencyScore >= 0 && 
             searchResult.executionTime < 5000 &&
             syncTime < 10000;
    } catch (error) {
      console.error('Real-time data sync test error:', error);
      return false;
    }
  };

  const testEndToEndConversationFlow = async (): Promise<boolean> => {
    try {
      console.log('🧪 Testing end-to-end conversation flow');
      
      const testSessionId = `e2e-test-${Date.now()}`;
      const testMessage = "Test end-to-end conversation flow with full integration";

      // Step 1: Build memory context
      const memoryContext = await memoryInformedConversationService.buildMemoryContext(
        testMessage,
        testSessionId,
        user!.id
      );

      // Step 2: Generate system prompt with blueprint
      const systemPrompt = holisticCoachService.generateSystemPrompt(testMessage);

      // Step 3: Enhance prompt with memory
      const enhancedPrompt = await memoryInformedConversationService.enhanceSystemPromptWithMemory(
        systemPrompt,
        memoryContext,
        testMessage
      );

      // Step 4: Test memory tracking
      await memoryInformedConversationService.trackMemoryApplication(
        testSessionId,
        memoryContext,
        testMessage,
        "Test AI response for integration"
      );

      return enhancedPrompt.length > systemPrompt.length && 
             memoryContext.contextSummary.length > 0;
    } catch (error) {
      console.error('End-to-end conversation flow test error:', error);
      return false;
    }
  };

  const resetTests = () => {
    setTests(tests.map(test => ({ 
      ...test, 
      status: 'pending', 
      details: undefined, 
      executionTime: undefined 
    })));
    setIntegrationHealth({ 
      overallScore: 0, 
      successfulIntegrations: 0, 
      failedIntegrations: 0, 
      averageResponseTime: 0 
    });
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Cross-Service Integration Testing
          </CardTitle>
          <div className="flex gap-4 text-sm">
            <span>Passed: <Badge className="bg-green-100 text-green-800">{passedTests}/{totalTests}</Badge></span>
            <span>Failed: <Badge className="bg-red-100 text-red-800">{failedTests}/{totalTests}</Badge></span>
            <span>Integration Health: <Badge>{integrationHealth.overallScore}%</Badge></span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={runIntegrationTests} 
              disabled={isRunning || !user}
              className="flex items-center gap-2"
            >
              {isRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
              {isRunning ? 'Testing Integrations...' : 'Run Integration Tests'}
            </Button>
            <Button variant="outline" onClick={resetTests} disabled={isRunning}>
              Reset Tests
            </Button>
          </div>

          {integrationHealth.overallScore > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Integration Health Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{integrationHealth.overallScore}%</div>
                    <div className="text-sm text-gray-600">Overall Health</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{integrationHealth.successfulIntegrations}</div>
                    <div className="text-sm text-gray-600">Successful</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{integrationHealth.failedIntegrations}</div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{integrationHealth.averageResponseTime}ms</div>
                    <div className="text-sm text-gray-600">Avg Response</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {tests.map((test, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(test.status)}
                    <span className="font-medium">{test.name}</span>
                    {test.executionTime && (
                      <Badge variant="outline">{test.executionTime}ms</Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                <div className="flex gap-1 mb-2">
                  {test.dataFlow.map((flow, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {flow}
                    </Badge>
                  ))}
                </div>
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
    </div>
  );
};
