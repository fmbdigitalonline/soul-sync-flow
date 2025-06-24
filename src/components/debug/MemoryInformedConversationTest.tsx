
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  MessageCircle, 
  Clock, 
  TrendingUp, 
  Search,
  Database,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { memoryInformedConversationService, MemoryContext } from '@/services/memory-informed-conversation-service';
import { enhancedAICoachService } from '@/services/enhanced-ai-coach-service';
import { enhancedMemoryService } from '@/services/enhanced-memory-service';
import { memoryService } from '@/services/memory-service';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  testName: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message: string;
  duration?: number;
  data?: any;
}

interface ConversationTestMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  memoryContext?: MemoryContext;
}

export const MemoryInformedConversationTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testConversation, setTestConversation] = useState<ConversationTestMessage[]>([]);
  const [currentTestMessage, setCurrentTestMessage] = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [memoryStats, setMemoryStats] = useState<any>(null);
  const [isConversationMode, setIsConversationMode] = useState(false);

  useEffect(() => {
    initializeTestSession();
  }, []);

  const initializeTestSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const newSessionId = `memory_test_${Date.now()}`;
        setSessionId(newSessionId);
        await enhancedAICoachService.setCurrentUser(user.id);
      }
    } catch (error) {
      console.error('Error initializing test session:', error);
    }
  };

  const updateTestResult = (testName: string, status: TestResult['status'], message: string, duration?: number, data?: any) => {
    setTestResults(prev => {
      const existing = prev.find(t => t.testName === testName);
      const newResult: TestResult = {
        testName,
        status,
        message,
        duration,
        data
      };
      
      if (existing) {
        return prev.map(t => t.testName === testName ? newResult : t);
      } else {
        return [...prev, newResult];
      }
    });
  };

  const runMemoryContextTest = async (): Promise<void> => {
    const testName = 'Memory Context Building';
    updateTestResult(testName, 'running', 'Building memory context...');
    
    const startTime = Date.now();
    try {
      const testMessage = "I'm feeling tired and need help with my creative projects";
      const memoryContext = await memoryInformedConversationService.buildMemoryContext(
        testMessage,
        sessionId,
        userId
      );
      
      const duration = Date.now() - startTime;
      
      if (memoryContext.relevantMemories.length > 0) {
        updateTestResult(testName, 'passed', 
          `Found ${memoryContext.relevantMemories.length} relevant memories in ${duration}ms`, 
          duration, 
          memoryContext
        );
      } else {
        updateTestResult(testName, 'passed', 
          `No memories found (expected for new user) in ${duration}ms`, 
          duration, 
          memoryContext
        );
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestResult(testName, 'failed', 
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        duration
      );
    }
  };

  const runMemoryEnhancedConversationTest = async (): Promise<void> => {
    const testName = 'Memory-Enhanced Conversation';
    updateTestResult(testName, 'running', 'Testing memory-enhanced AI conversation...');
    
    const startTime = Date.now();
    try {
      // First, create some test memories
      await memoryService.saveMemory({
        user_id: userId,
        session_id: sessionId,
        memory_type: 'conversation',
        memory_data: {
          topic: 'fatigue_management',
          content: 'User mentioned feeling tired and wanting help with creative projects',
          context: 'User is a Projector type who needs to wait for invitations and manage energy carefully'
        },
        context_summary: 'Discussion about fatigue and energy management for Projector type',
        importance_score: 8
      });

      // Wait for memory to be saved
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Now test memory-enhanced conversation
      const testMessage = "Can you help me understand why I'm feeling so tired lately?";
      const response = await enhancedAICoachService.sendMessage(
        testMessage,
        sessionId,
        true, // Use persona with memory
        'guide',
        'en'
      );
      
      const duration = Date.now() - startTime;
      
      // Check if response shows memory awareness
      const responseContent = response.response.toLowerCase();
      const hasMemoryAwareness = responseContent.includes('projector') || 
                                 responseContent.includes('energy') || 
                                 responseContent.includes('fatigue') ||
                                 responseContent.includes('previous') ||
                                 responseContent.includes('discussed');
      
      if (hasMemoryAwareness) {
        updateTestResult(testName, 'passed', 
          `AI showed memory awareness in response (${duration}ms)`, 
          duration, 
          { response: response.response.substring(0, 200) + '...' }
        );
      } else {
        updateTestResult(testName, 'failed', 
          `AI response didn't show memory awareness (${duration}ms)`, 
          duration, 
          { response: response.response.substring(0, 200) + '...' }
        );
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestResult(testName, 'failed', 
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        duration
      );
    }
  };

  const runProgressiveMemoryTest = async (): Promise<void> => {
    const testName = 'Progressive Memory Search';
    updateTestResult(testName, 'running', 'Testing progressive memory search...');
    
    const startTime = Date.now();
    try {
      const searchResult = await enhancedMemoryService.performProgressiveSearch(
        'fatigue energy creative projects',
        5
      );
      
      const duration = Date.now() - startTime;
      
      updateTestResult(testName, 'passed', 
        `Found ${searchResult.matchCount} memories using ${searchResult.searchStrategy} strategy in ${duration}ms`, 
        duration, 
        searchResult
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestResult(testName, 'failed', 
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        duration
      );
    }
  };

  const runCrossSessionContextTest = async (): Promise<void> => {
    const testName = 'Cross-Session Context';
    updateTestResult(testName, 'running', 'Testing cross-session memory context...');
    
    const startTime = Date.now();
    try {
      const crossSessionMemories = await memoryInformedConversationService.getCrossSessionContext(
        userId,
        sessionId,
        5
      );
      
      const duration = Date.now() - startTime;
      
      updateTestResult(testName, 'passed', 
        `Retrieved ${crossSessionMemories.length} cross-session memories in ${duration}ms`, 
        duration, 
        { count: crossSessionMemories.length }
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestResult(testName, 'failed', 
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        duration
      );
    }
  };

  const runAllTests = async () => {
    if (!userId) {
      alert('Please sign in to run tests');
      return;
    }

    setIsRunning(true);
    setTestResults([]);
    
    try {
      await runMemoryContextTest();
      await runProgressiveMemoryTest();
      await runMemoryEnhancedConversationTest();
      await runCrossSessionContextTest();
    } finally {
      setIsRunning(false);
    }
  };

  const sendTestMessage = async () => {
    if (!currentTestMessage.trim() || !userId) return;
    
    const userMessage: ConversationTestMessage = {
      id: `user_${Date.now()}`,
      content: currentTestMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setTestConversation(prev => [...prev, userMessage]);
    setCurrentTestMessage('');
    
    try {
      // Build memory context first
      const memoryContext = await memoryInformedConversationService.buildMemoryContext(
        currentTestMessage,
        sessionId,
        userId
      );
      
      // Send message with memory-enhanced AI
      const response = await enhancedAICoachService.sendMessage(
        currentTestMessage,
        sessionId,
        true, // Use persona with memory
        'guide',
        'en'
      );
      
      const assistantMessage: ConversationTestMessage = {
        id: `assistant_${Date.now()}`,
        content: response.response,
        sender: 'assistant',
        timestamp: new Date(),
        memoryContext
      };
      
      setTestConversation(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Error sending test message:', error);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Memory-Informed Conversation Testing
          </CardTitle>
          <p className="text-sm text-gray-600">
            Test the enhanced AI system with real-time memory integration, contextual awareness, and progressive conversation building.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning || !userId}
              className="flex items-center gap-2"
            >
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Run All Memory Tests
            </Button>
            <Button 
              variant="outline"
              onClick={() => setIsConversationMode(!isConversationMode)}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              {isConversationMode ? 'Hide' : 'Show'} Live Test Chat
            </Button>
          </div>

          {!userId && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
              <p className="text-amber-800 text-sm">
                Please sign in to run memory-informed conversation tests.
              </p>
            </div>
          )}

          {/* Test Results */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Test Results</h3>
            {testResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.testName}</span>
                  </div>
                  <Badge className={getStatusColor(result.status)}>
                    {result.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                {result.duration && (
                  <p className="text-xs text-gray-500">Duration: {result.duration}ms</p>
                )}
                {result.data && (
                  <details className="mt-2">
                    <summary className="text-xs text-blue-600 cursor-pointer">View Test Data</summary>
                    <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>

          {/* Live Test Chat */}
          {isConversationMode && (
            <div className="mt-6 border-t pt-6">
              <h3 className="font-semibold text-lg mb-4">Live Memory-Enhanced Chat Test</h3>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                  {testConversation.length === 0 ? (
                    <p className="text-gray-500 text-center">Start a conversation to test memory integration...</p>
                  ) : (
                    testConversation.map((message, index) => (
                      <div key={message.id} className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        <div className={`inline-block p-3 rounded-lg max-w-xs ${
                          message.sender === 'user' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        {message.memoryContext && (
                          <div className="mt-2 text-xs text-gray-500">
                            Memory Context: {message.memoryContext.relevantMemories.length} memories used
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={currentTestMessage}
                    onChange={(e) => setCurrentTestMessage(e.target.value)}
                    placeholder="Type a message to test memory-enhanced conversation..."
                    onKeyPress={(e) => e.key === 'Enter' && sendTestMessage()}
                  />
                  <Button onClick={sendTestMessage} disabled={!currentTestMessage.trim()}>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
