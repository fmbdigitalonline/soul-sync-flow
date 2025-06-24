
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Network, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap,
  RefreshCw,
  Send
} from 'lucide-react';
import { memoryService } from '@/services/memory-service';
import { toast } from 'sonner';

interface IntegrationTest {
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  result?: string;
  duration?: number;
}

export const IntegrationTestPanel: React.FC = () => {
  const [tests, setTests] = useState<IntegrationTest[]>([
    {
      name: 'Memory-to-Reminder Flow',
      description: 'Test creating a memory that generates a follow-up reminder',
      status: 'pending'
    },
    {
      name: 'Context-Aware Welcome Message',
      description: 'Test welcome message generation with existing user context',
      status: 'pending'
    },
    {
      name: 'Cross-Session Memory Persistence',
      description: 'Test memory persistence across different session IDs',
      status: 'pending'
    },
    {
      name: 'Feedback-to-Memory Integration',
      description: 'Test feedback saving and memory creation integration',
      status: 'pending'
    }
  ]);

  const [customMemoryText, setCustomMemoryText] = useState('');
  const [customReminderTitle, setCustomReminderTitle] = useState('');
  const [testSessionId] = useState(`integration-test-${Date.now()}`);

  const updateTestStatus = (index: number, status: IntegrationTest['status'], result?: string, duration?: number) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, result, duration } : test
    ));
  };

  const runMemoryToReminderTest = async (index: number) => {
    updateTestStatus(index, 'running');
    const startTime = Date.now();

    try {
      // Step 1: Create a memory that suggests follow-up action
      const memory = await memoryService.saveMemory({
        user_id: '',
        session_id: testSessionId,
        memory_type: 'interaction',
        memory_data: {
          content: 'User expressed interest in learning meditation',
          follow_up_needed: true,
          priority: 'high'
        },
        context_summary: 'Integration test: User wants to learn meditation',
        importance_score: 8
      });

      if (!memory) {
        throw new Error('Failed to create initial memory');
      }

      // Step 2: Create related reminder
      const reminder = await memoryService.createReminder({
        user_id: '',
        session_id: testSessionId,
        action_title: 'Send meditation resources',
        action_description: `Follow up on user's interest in meditation (Memory ID: ${memory.id})`,
        reminder_type: 'in_app',
        scheduled_for: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        status: 'pending'
      });

      if (!reminder) {
        throw new Error('Failed to create follow-up reminder');
      }

      updateTestStatus(
        index, 
        'passed', 
        `Successfully created memory ${memory.id} and reminder ${reminder.id}`,
        Date.now() - startTime
      );
      toast.success('Memory-to-Reminder flow test passed!');
    } catch (error) {
      updateTestStatus(
        index, 
        'failed', 
        String(error),
        Date.now() - startTime
      );
      toast.error('Memory-to-Reminder flow test failed');
    }
  };

  const runWelcomeMessageTest = async (index: number) => {
    updateTestStatus(index, 'running');
    const startTime = Date.now();

    try {
      // First create some context
      await memoryService.saveMemory({
        user_id: '',
        session_id: testSessionId,
        memory_type: 'interaction',
        memory_data: {
          topic: 'productivity planning',
          user_mood: 'motivated'
        },
        context_summary: 'User discussed productivity planning strategies',
        importance_score: 7
      });

      await memoryService.updateLifeContext({
        user_id: '',
        context_category: 'growth',
        current_focus: 'Improving daily productivity',
        recent_progress: [{
          description: 'Completed morning routine optimization',
          timestamp: new Date().toISOString(),
          impact: 'medium'
        }],
        ongoing_challenges: [],
        celebration_moments: [],
        next_steps: [{
          description: 'Test new time-blocking technique',
          priority: 'high'
        }],
        last_updated: new Date().toISOString()
      });

      // Generate welcome message with context
      const welcomeMessage = await memoryService.generateWelcomeMessage('TestUser');

      if (!welcomeMessage || welcomeMessage.length < 10) {
        throw new Error('Welcome message generation failed or returned empty result');
      }

      updateTestStatus(
        index, 
        'passed', 
        `Generated contextual welcome message: "${welcomeMessage.substring(0, 100)}..."`,
        Date.now() - startTime
      );
      toast.success('Welcome message test passed!');
    } catch (error) {
      updateTestStatus(
        index, 
        'failed', 
        String(error),
        Date.now() - startTime
      );
      toast.error('Welcome message test failed');
    }
  };

  const runCrossSessionTest = async (index: number) => {
    updateTestStatus(index, 'running');
    const startTime = Date.now();

    try {
      const session1 = `${testSessionId}-session1`;
      const session2 = `${testSessionId}-session2`;

      // Create memory in session 1
      const memory1 = await memoryService.saveMemory({
        user_id: '',
        session_id: session1,
        memory_type: 'interaction',
        memory_data: {
          content: 'Session 1 memory content',
          session_marker: 'session1'
        },
        context_summary: 'Cross-session test memory from session 1',
        importance_score: 6
      });

      // Create memory in session 2
      const memory2 = await memoryService.saveMemory({
        user_id: '',
        session_id: session2,
        memory_type: 'interaction',
        memory_data: {
          content: 'Session 2 memory content',
          session_marker: 'session2'
        },
        context_summary: 'Cross-session test memory from session 2',
        importance_score: 6
      });

      if (!memory1 || !memory2) {
        throw new Error('Failed to create memories in different sessions');
      }

      // Retrieve memories from both sessions
      const allMemories = await memoryService.getRecentMemories(20);
      const session1Memories = allMemories.filter(m => m.session_id === session1);
      const session2Memories = allMemories.filter(m => m.session_id === session2);

      if (session1Memories.length === 0 || session2Memories.length === 0) {
        throw new Error('Failed to retrieve memories from both sessions');
      }

      updateTestStatus(
        index, 
        'passed', 
        `Successfully persisted and retrieved memories across sessions (${session1Memories.length} + ${session2Memories.length} memories)`,
        Date.now() - startTime
      );
      toast.success('Cross-session persistence test passed!');
    } catch (error) {
      updateTestStatus(
        index, 
        'failed', 
        String(error),
        Date.now() - startTime
      );
      toast.error('Cross-session persistence test failed');
    }
  };

  const runFeedbackIntegrationTest = async (index: number) => {
    updateTestStatus(index, 'running');
    const startTime = Date.now();

    try {
      // Save feedback which should also create a memory
      const feedbackSaved = await memoryService.saveFeedback({
        user_id: '',
        session_id: testSessionId,
        rating: 4,
        feedback_text: 'Integration test feedback - the system is working well but could use UI improvements',
        session_summary: 'Integration testing session',
        improvement_suggestions: ['Improve UI responsiveness', 'Add more visual feedback']
      });

      if (!feedbackSaved) {
        throw new Error('Failed to save feedback');
      }

      // Wait a moment for memory creation
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if feedback memory was created
      const recentMemories = await memoryService.getRecentMemories(10);
      const feedbackMemory = recentMemories.find(m => 
        m.memory_data?.type === 'session_feedback' &&
        m.memory_data?.rating === 4
      );

      if (!feedbackMemory) {
        throw new Error('Feedback memory integration failed - no memory created');
      }

      updateTestStatus(
        index, 
        'passed', 
        `Feedback saved and memory created successfully (Memory ID: ${feedbackMemory.id})`,
        Date.now() - startTime
      );
      toast.success('Feedback integration test passed!');
    } catch (error) {
      updateTestStatus(
        index, 
        'failed', 
        String(error),
        Date.now() - startTime
      );
      toast.error('Feedback integration test failed');
    }
  };

  const runTest = async (index: number) => {
    const test = tests[index];
    
    switch (test.name) {
      case 'Memory-to-Reminder Flow':
        await runMemoryToReminderTest(index);
        break;
      case 'Context-Aware Welcome Message':
        await runWelcomeMessageTest(index);
        break;
      case 'Cross-Session Memory Persistence':
        await runCrossSessionTest(index);
        break;
      case 'Feedback-to-Memory Integration':
        await runFeedbackIntegrationTest(index);
        break;
    }
  };

  const runAllTests = async () => {
    toast.info('Running all integration tests...');
    
    for (let i = 0; i < tests.length; i++) {
      await runTest(i);
      // Add small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const passedTests = tests.filter(t => t.status === 'passed').length;
    toast.success(`Integration tests completed: ${passedTests}/${tests.length} passed`);
  };

  const testCustomFlow = async () => {
    if (!customMemoryText.trim() || !customReminderTitle.trim()) {
      toast.error('Please fill in both memory text and reminder title');
      return;
    }

    try {
      // Create custom memory
      const memory = await memoryService.saveMemory({
        user_id: '',
        session_id: testSessionId,
        memory_type: 'interaction',
        memory_data: {
          content: customMemoryText,
          custom_test: true
        },
        context_summary: `Custom integration test: ${customMemoryText.substring(0, 50)}`,
        importance_score: 7
      });

      if (!memory) {
        throw new Error('Failed to create custom memory');
      }

      // Create custom reminder
      const reminder = await memoryService.createReminder({
        user_id: '',
        session_id: testSessionId,
        action_title: customReminderTitle,
        action_description: `Custom test reminder related to: ${customMemoryText.substring(0, 50)}`,
        reminder_type: 'in_app',
        scheduled_for: new Date(Date.now() + 1800000).toISOString(), // 30 minutes from now
        status: 'pending'
      });

      if (!reminder) {
        throw new Error('Failed to create custom reminder');
      }

      toast.success(`Custom flow test passed! Memory: ${memory.id}, Reminder: ${reminder.id}`);
      setCustomMemoryText('');
      setCustomReminderTitle('');
    } catch (error) {
      toast.error(`Custom flow test failed: ${error}`);
    }
  };

  const getStatusIcon = (status: IntegrationTest['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: IntegrationTest['status']) => {
    switch (status) {
      case 'passed': return <Badge className="bg-green-100 text-green-800">Passed</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      case 'running': return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      default: return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Integration Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-6 w-6" />
            Integration Test Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={runAllTests} className="flex-1">
              <Zap className="h-4 w-4 mr-2" />
              Run All Integration Tests
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            Session ID: <code className="bg-gray-100 px-2 py-1 rounded">{testSessionId}</code>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tests.map((test, index) => (
              <div key={index} className="border rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(test.status)}
                    <span className="font-medium">{test.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(test.status)}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runTest(index)}
                      disabled={test.status === 'running'}
                    >
                      Run Test
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                
                {test.result && (
                  <div className={`text-sm p-2 rounded ${
                    test.status === 'passed' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}>
                    {test.result}
                  </div>
                )}
                
                {test.duration && (
                  <div className="text-xs text-gray-500 mt-1">
                    Duration: {test.duration}ms
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Flow Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Flow Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Memory Content</label>
              <Textarea
                placeholder="Enter memory content to test with..."
                value={customMemoryText}
                onChange={(e) => setCustomMemoryText(e.target.value)}
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Related Reminder Title</label>
              <Input
                placeholder="Enter reminder title..."
                value={customReminderTitle}
                onChange={(e) => setCustomReminderTitle(e.target.value)}
              />
            </div>
            
            <Button onClick={testCustomFlow} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Test Custom Memory-Reminder Flow
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationTestPanel;
