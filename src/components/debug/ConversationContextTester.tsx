
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { memoryInformedConversationService } from '@/services/memory-informed-conversation-service';

interface ContextTest {
  name: string;
  description: string;
  status: 'pending' | 'testing' | 'passed' | 'failed';
  details?: string;
  contextScore?: number;
}

const ConversationContextTester: React.FC = () => {
  const [tests, setTests] = useState<ContextTest[]>([
    {
      name: 'Memory Context Building',
      description: 'Test memory context building for conversations',
      status: 'pending'
    },
    {
      name: 'Context Relevance Scoring',
      description: 'Test relevance scoring of conversation context',
      status: 'pending'
    },
    {
      name: 'System Prompt Enhancement',
      description: 'Test system prompt enhancement with memory context',
      status: 'pending'
    },
    {
      name: 'Memory Application Tracking',
      description: 'Test tracking of memory application in conversations',
      status: 'pending'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const { user } = useAuth();

  const runContextTests = async () => {
    if (!user) {
      console.log('❌ No authenticated user for conversation context testing');
      return;
    }

    setIsRunning(true);
    console.log('💬 Starting conversation context tests');

    const updatedTests = [...tests];

    for (let i = 0; i < updatedTests.length; i++) {
      updatedTests[i].status = 'testing';
      setTests([...updatedTests]);

      try {
        let testResult = false;
        let details = '';
        let contextScore = 0;

        switch (updatedTests[i].name) {
          case 'Memory Context Building':
            const contextResult = await testMemoryContextBuilding();
            testResult = contextResult.success;
            details = contextResult.details;
            contextScore = contextResult.score;
            break;
          case 'Context Relevance Scoring':
            const relevanceResult = await testContextRelevanceScoring();
            testResult = relevanceResult.success;
            details = relevanceResult.details;
            contextScore = relevanceResult.score;
            break;
          case 'System Prompt Enhancement':
            const enhancementResult = await testSystemPromptEnhancement();
            testResult = enhancementResult.success;
            details = enhancementResult.details;
            contextScore = enhancementResult.score;
            break;
          case 'Memory Application Tracking':
            const trackingResult = await testMemoryApplicationTracking();
            testResult = trackingResult.success;
            details = trackingResult.details;
            contextScore = trackingResult.score;
            break;
        }

        updatedTests[i].status = testResult ? 'passed' : 'failed';
        updatedTests[i].details = details;
        updatedTests[i].contextScore = contextScore;

      } catch (error) {
        console.error(`❌ Context test failed: ${updatedTests[i].name}`, error);
        updatedTests[i].status = 'failed';
        updatedTests[i].details = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }

      setTests([...updatedTests]);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
    console.log('✅ Conversation context tests completed');
  };

  const testMemoryContextBuilding = async () => {
    try {
      const testSessionId = `context-test-${Date.now()}`;
      const testMessage = 'Test message for context building validation';

      const memoryContext = await memoryInformedConversationService.buildMemoryContext(
        testMessage,
        testSessionId,
        user!.id
      );

      const contextQuality = memoryContext.contextSummary.length > 0 ? 100 : 50;

      return {
        success: memoryContext.relevantMemories !== undefined,
        details: `Built context with ${memoryContext.relevantMemories?.length || 0} relevant memories`,
        score: contextQuality
      };
    } catch (error) {
      return {
        success: false,
        details: `Memory context building failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        score: 0
      };
    }
  };

  const testContextRelevanceScoring = async () => {
    try {
      const testSessionId = `relevance-test-${Date.now()}`;
      const testMessage = 'Test message for relevance scoring validation';

      const memoryContext = await memoryInformedConversationService.buildMemoryContext(
        testMessage,
        testSessionId,
        user!.id
      );

      const relevantMemories = memoryContext.relevantMemories || [];
      const hasRelevanceScores = relevantMemories.every(memory => 
        memory.relevance_score !== undefined && memory.relevance_score >= 0
      );

      return {
        success: hasRelevanceScores,
        details: `Scored ${relevantMemories.length} memories for relevance`,
        score: hasRelevanceScores ? 100 : 0
      };
    } catch (error) {
      return {
        success: false,
        details: `Context relevance scoring failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        score: 0
      };
    }
  };

  const testSystemPromptEnhancement = async () => {
    try {
      const testSessionId = `enhancement-test-${Date.now()}`;
      const testMessage = 'Test message for system prompt enhancement';
      const basePrompt = 'You are a helpful AI assistant.';

      const memoryContext = await memoryInformedConversationService.buildMemoryContext(
        testMessage,
        testSessionId,
        user!.id
      );

      const enhancedPrompt = await memoryInformedConversationService.enhanceSystemPromptWithMemory(
        basePrompt,
        memoryContext,
        testMessage
      );

      const enhancementQuality = enhancedPrompt.length > basePrompt.length ? 100 : 50;

      return {
        success: enhancedPrompt.length > basePrompt.length,
        details: `Enhanced prompt from ${basePrompt.length} to ${enhancedPrompt.length} characters`,
        score: enhancementQuality
      };
    } catch (error) {
      return {
        success: false,
        details: `System prompt enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        score: 0
      };
    }
  };

  const testMemoryApplicationTracking = async () => {
    try {
      const testSessionId = `tracking-test-${Date.now()}`;
      const testMessage = 'Test message for memory application tracking';

      const memoryContext = await memoryInformedConversationService.buildMemoryContext(
        testMessage,
        testSessionId,
        user!.id
      );

      await memoryInformedConversationService.trackMemoryApplication(
        testSessionId,
        memoryContext,
        testMessage,
        'Test AI response for tracking validation'
      );

      return {
        success: true,
        details: 'Memory application tracking completed successfully',
        score: 100
      };
    } catch (error) {
      return {
        success: false,
        details: `Memory application tracking failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        score: 0
      };
    }
  };

  const resetTests = () => {
    setTests(tests.map(test => ({ 
      ...test, 
      status: 'pending', 
      details: undefined, 
      contextScore: undefined 
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
    .filter(t => t.contextScore !== undefined)
    .reduce((sum, t) => sum + (t.contextScore || 0), 0) / tests.filter(t => t.contextScore !== undefined).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Conversation Context Testing
        </CardTitle>
        <div className="flex gap-4 text-sm">
          <span>Passed: <Badge className="bg-green-100 text-green-800">{passedTests}/{totalTests}</Badge></span>
          <span>Failed: <Badge className="bg-red-100 text-red-800">{failedTests}/{totalTests}</Badge></span>
          {averageScore > 0 && (
            <span>Context Score: <Badge>{Math.round(averageScore)}%</Badge></span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runContextTests} 
            disabled={isRunning || !user}
            className="flex items-center gap-2"
          >
            {isRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
            {isRunning ? 'Testing Context...' : 'Run Context Tests'}
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
                  {test.contextScore !== undefined && (
                    <Badge variant="outline">{test.contextScore}%</Badge>
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

export default ConversationContextTester;
