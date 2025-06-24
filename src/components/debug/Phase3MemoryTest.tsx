
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  MessageSquare, 
  Clock, 
  Star, 
  CheckCircle, 
  AlertCircle,
  Bell,
  Moon,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { memoryService, SessionMemory, SessionFeedback, MicroActionReminder } from '@/services/memory-service';
import { toast } from 'sonner';
import { format, addHours, addDays } from 'date-fns';

interface TestResults {
  memory_persistence: 'pending' | 'success' | 'failed';
  session_feedback: 'pending' | 'success' | 'failed';
  micro_action_reminders: 'pending' | 'success' | 'failed';
  bedtime_action_retrieval: 'pending' | 'success' | 'failed';
  life_context_management: 'pending' | 'success' | 'failed';
  error_details: string[];
}

export const Phase3MemoryTest: React.FC = () => {
  const [sessionId] = useState(() => `test-session-${Date.now()}`);
  const [testResults, setTestResults] = useState<TestResults>({
    memory_persistence: 'pending',
    session_feedback: 'pending',
    micro_action_reminders: 'pending',
    bedtime_action_retrieval: 'pending',
    life_context_management: 'pending',
    error_details: []
  });

  // Real-time data states
  const [recentMemories, setRecentMemories] = useState<SessionMemory[]>([]);
  const [activeReminders, setActiveReminders] = useState<MicroActionReminder[]>([]);
  const [bedtimeAction, setBedtimeAction] = useState<MicroActionReminder | null>(null);
  const [feedbackHistory, setFeedbackHistory] = useState<SessionFeedback[]>([]);
  const [loading, setLoading] = useState(false);

  // Test data inputs
  const [memoryInput, setMemoryInput] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDescription, setReminderDescription] = useState('');

  const updateTestResult = (test: keyof TestResults, status: 'success' | 'failed', error?: string) => {
    setTestResults(prev => ({
      ...prev,
      [test]: status,
      error_details: error ? [...prev.error_details, `${test}: ${error}`] : prev.error_details
    }));
  };

  const loadRealTimeData = async () => {
    try {
      console.log('🔄 Loading real-time memory data...');
      
      const [memories, reminders, bedtime, feedback] = await Promise.allSettled([
        memoryService.getRecentMemories(10),
        memoryService.getActiveReminders(),
        memoryService.getNextBedtimeAction(),
        memoryService.getFeedbackHistory(5)
      ]);

      if (memories.status === 'fulfilled') {
        setRecentMemories(memories.value);
        console.log(`✅ Loaded ${memories.value.length} recent memories`);
      }

      if (reminders.status === 'fulfilled') {
        setActiveReminders(reminders.value);
        console.log(`✅ Loaded ${reminders.value.length} active reminders`);
      }

      if (bedtime.status === 'fulfilled') {
        setBedtimeAction(bedtime.value);
        console.log(`✅ Bedtime action: ${bedtime.value ? bedtime.value.action_title : 'None found'}`);
      }

      if (feedback.status === 'fulfilled') {
        setFeedbackHistory(feedback.value);
        console.log(`✅ Loaded ${feedback.value.length} feedback entries`);
      }

    } catch (error) {
      console.error('❌ Error loading real-time data:', error);
      toast.error('Failed to load real-time data');
    }
  };

  useEffect(() => {
    loadRealTimeData();
    
    // Set up real-time polling every 30 seconds
    const interval = setInterval(loadRealTimeData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const testMemoryPersistence = async () => {
    try {
      console.log('🧠 Testing memory persistence...');
      
      if (!memoryInput.trim()) {
        throw new Error('Memory input is required');
      }

      const testMemory = await memoryService.saveMemory({
        user_id: '',
        session_id: sessionId,
        memory_type: 'interaction',
        memory_data: {
          test_content: memoryInput,
          test_timestamp: new Date().toISOString(),
          test_type: 'phase3_memory_test'
        },
        context_summary: `Phase 3 test: ${memoryInput.substring(0, 50)}`,
        importance_score: 8
      });

      if (testMemory) {
        console.log('✅ Memory saved successfully:', testMemory.id);
        updateTestResult('memory_persistence', 'success');
        await loadRealTimeData(); // Refresh data
        toast.success('Memory persistence test passed!');
      } else {
        throw new Error('Memory save returned null');
      }
    } catch (error) {
      console.error('❌ Memory persistence test failed:', error);
      updateTestResult('memory_persistence', 'failed', String(error));
      toast.error('Memory persistence test failed');
    }
  };

  const testSessionFeedback = async () => {
    try {
      console.log('📝 Testing session feedback...');
      
      if (!feedbackText.trim()) {
        throw new Error('Feedback text is required');
      }

      const success = await memoryService.saveFeedback({
        user_id: '',
        session_id: sessionId,
        rating: feedbackRating,
        feedback_text: feedbackText,
        session_summary: `Phase 3 test session - ${new Date().toISOString()}`,
        improvement_suggestions: ['Test suggestion 1', 'Test suggestion 2']
      });

      if (success) {
        console.log('✅ Feedback saved successfully');
        updateTestResult('session_feedback', 'success');
        await loadRealTimeData(); // Refresh data
        toast.success('Session feedback test passed!');
      } else {
        throw new Error('Feedback save returned false');
      }
    } catch (error) {
      console.error('❌ Session feedback test failed:', error);
      updateTestResult('session_feedback', 'failed', String(error));
      toast.error('Session feedback test failed');
    }
  };

  const testMicroActionReminders = async () => {
    try {
      console.log('⏰ Testing micro-action reminders...');
      
      if (!reminderTitle.trim()) {
        throw new Error('Reminder title is required');
      }

      const scheduledFor = addHours(new Date(), 1); // Schedule for 1 hour from now
      
      const reminder = await memoryService.createReminder({
        user_id: '',
        session_id: sessionId,
        action_title: reminderTitle,
        action_description: reminderDescription || undefined,
        reminder_type: 'in_app',
        scheduled_for: scheduledFor.toISOString(),
        status: 'pending'
      });

      if (reminder) {
        console.log('✅ Reminder created successfully:', reminder.id);
        updateTestResult('micro_action_reminders', 'success');
        await loadRealTimeData(); // Refresh data
        toast.success('Micro-action reminder test passed!');
      } else {
        throw new Error('Reminder creation returned null');
      }
    } catch (error) {
      console.error('❌ Micro-action reminder test failed:', error);
      updateTestResult('micro_action_reminders', 'failed', String(error));
      toast.error('Micro-action reminder test failed');
    }
  };

  const testBedtimeActionRetrieval = async () => {
    try {
      console.log('🌙 Testing bedtime action retrieval...');
      
      // First create a bedtime-related reminder if none exists
      const currentBedtimeAction = await memoryService.getNextBedtimeAction();
      
      if (!currentBedtimeAction) {
        console.log('No existing bedtime action, creating test bedtime reminder...');
        
        const bedtimeReminder = await memoryService.createReminder({
          user_id: '',
          session_id: sessionId,
          action_title: 'Bedtime meditation practice',
          action_description: 'Take 10 minutes to practice mindful breathing before sleep',
          reminder_type: 'in_app',
          scheduled_for: addHours(new Date(), 2).toISOString(),
          status: 'pending'
        });

        if (!bedtimeReminder) {
          throw new Error('Failed to create test bedtime reminder');
        }

        console.log('✅ Test bedtime reminder created:', bedtimeReminder.id);
      }

      // Now test retrieval
      const retrievedBedtimeAction = await memoryService.getNextBedtimeAction();
      
      if (retrievedBedtimeAction) {
        console.log('✅ Bedtime action retrieved successfully:', retrievedBedtimeAction.action_title);
        setBedtimeAction(retrievedBedtimeAction);
        updateTestResult('bedtime_action_retrieval', 'success');
        toast.success('Bedtime action retrieval test passed!');
      } else {
        throw new Error('No bedtime action found after creation');
      }
      
      await loadRealTimeData(); // Refresh all data
    } catch (error) {
      console.error('❌ Bedtime action retrieval test failed:', error);
      updateTestResult('bedtime_action_retrieval', 'failed', String(error));
      toast.error('Bedtime action retrieval test failed');
    }
  };

  const testLifeContextManagement = async () => {
    try {
      console.log('🌱 Testing life context management...');
      
      const testContext = {
        user_id: '',
        context_category: 'growth' as const,
        current_focus: 'Phase 3 memory system testing',
        recent_progress: [
          {
            description: 'Implemented comprehensive memory persistence',
            timestamp: new Date().toISOString(),
            impact: 'high'
          }
        ],
        ongoing_challenges: [
          {
            description: 'Ensuring real-time data synchronization',
            priority: 'medium'
          }
        ],
        celebration_moments: [
          {
            description: 'Successfully completed Phase 3 testing framework',
            timestamp: new Date().toISOString()
          }
        ],
        next_steps: [
          {
            description: 'Validate bedtime action integration',
            priority: 'high'
          }
        ],
        last_updated: new Date().toISOString()
      };

      const success = await memoryService.updateLifeContext(testContext);
      
      if (success) {
        console.log('✅ Life context updated successfully');
        updateTestResult('life_context_management', 'success');
        toast.success('Life context management test passed!');
      } else {
        throw new Error('Life context update returned false');
      }
    } catch (error) {
      console.error('❌ Life context management test failed:', error);
      updateTestResult('life_context_management', 'failed', String(error));
      toast.error('Life context management test failed');
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    toast.info('Running comprehensive Phase 3 memory tests...');
    
    try {
      await testMemoryPersistence();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause between tests
      
      await testSessionFeedback();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testMicroActionReminders();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testBedtimeActionRetrieval();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testLifeContextManagement();
      
      toast.success('All Phase 3 tests completed!');
    } catch (error) {
      console.error('❌ Test suite error:', error);
      toast.error('Test suite encountered an error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'failed') => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: 'pending' | 'success' | 'failed') => {
    switch (status) {
      case 'success': return <Badge className="bg-green-100 text-green-800">Passed</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      default: return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Phase 3: Memory & Life-Long Personalization Test Suite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="flex items-center gap-2">
              {getStatusIcon(testResults.memory_persistence)}
              <span className="font-medium">Memory Persistence</span>
              {getStatusBadge(testResults.memory_persistence)}
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(testResults.session_feedback)}
              <span className="font-medium">Session Feedback</span>
              {getStatusBadge(testResults.session_feedback)}
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(testResults.micro_action_reminders)}
              <span className="font-medium">Micro-Actions</span>
              {getStatusBadge(testResults.micro_action_reminders)}
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(testResults.bedtime_action_retrieval)}
              <span className="font-medium">Bedtime Actions</span>
              {getStatusBadge(testResults.bedtime_action_retrieval)}
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(testResults.life_context_management)}
              <span className="font-medium">Life Context</span>
              {getStatusBadge(testResults.life_context_management)}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={runAllTests} disabled={loading} className="flex-1">
              {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
              Run All Tests
            </Button>
            <Button onClick={loadRealTimeData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Individual Test Controls */}
        <div className="space-y-4">
          {/* Memory Persistence Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="h-5 w-5" />
                Memory Persistence Test
                {getStatusBadge(testResults.memory_persistence)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Enter test memory content..."
                value={memoryInput}
                onChange={(e) => setMemoryInput(e.target.value)}
                rows={3}
              />
              <Button onClick={testMemoryPersistence} className="w-full">
                Test Memory Save
              </Button>
            </CardContent>
          </Card>

          {/* Session Feedback Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5" />
                Session Feedback Test
                {getStatusBadge(testResults.session_feedback)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <span>Rating:</span>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={feedbackRating}
                  onChange={(e) => setFeedbackRating(Number(e.target.value))}
                  className="w-20"
                />
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${star <= feedbackRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
              <Textarea
                placeholder="Enter feedback text..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={2}
              />
              <Button onClick={testSessionFeedback} className="w-full">
                Test Feedback Save
              </Button>
            </CardContent>
          </Card>

          {/* Micro-Action Reminders Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5" />
                Micro-Action Reminders Test
                {getStatusBadge(testResults.micro_action_reminders)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Reminder title..."
                value={reminderTitle}
                onChange={(e) => setReminderTitle(e.target.value)}
              />
              <Textarea
                placeholder="Reminder description (optional)..."
                value={reminderDescription}
                onChange={(e) => setReminderDescription(e.target.value)}
                rows={2}
              />
              <Button onClick={testMicroActionReminders} className="w-full">
                Test Reminder Creation
              </Button>
            </CardContent>
          </Card>

          {/* Bedtime Action Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Moon className="h-5 w-5" />
                Bedtime Action Retrieval Test
                {getStatusBadge(testResults.bedtime_action_retrieval)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                Tests creation and retrieval of bedtime-specific actions
              </p>
              <Button onClick={testBedtimeActionRetrieval} className="w-full">
                Test Bedtime Action System
              </Button>
            </CardContent>
          </Card>

          {/* Life Context Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Life Context Management Test
                {getStatusBadge(testResults.life_context_management)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                Tests life context tracking and updates
              </p>
              <Button onClick={testLifeContextManagement} className="w-full">
                Test Life Context Update
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Real-Time Data Display */}
        <div className="space-y-4">
          {/* Recent Memories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="h-5 w-5" />
                Recent Memories ({recentMemories.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentMemories.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No memories found</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {recentMemories.map((memory) => (
                    <div key={memory.id} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="font-medium">{memory.context_summary}</div>
                      <div className="text-xs text-gray-500">
                        {memory.memory_type} • Score: {memory.importance_score} • 
                        {format(new Date(memory.created_at), 'MMM dd, HH:mm')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5" />
                Active Reminders ({activeReminders.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeReminders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No active reminders</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {activeReminders.map((reminder) => (
                    <div key={reminder.id} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="font-medium">{reminder.action_title}</div>
                      <div className="text-xs text-gray-500">
                        {reminder.status} • {format(new Date(reminder.scheduled_for), 'MMM dd, HH:mm')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bedtime Action Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Moon className="h-5 w-5" />
                Next Bedtime Action
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!bedtimeAction ? (
                <p className="text-gray-500 text-center py-4">No bedtime action scheduled</p>
              ) : (
                <div className="p-3 bg-indigo-50 rounded">
                  <div className="font-medium text-indigo-900">{bedtimeAction.action_title}</div>
                  {bedtimeAction.action_description && (
                    <div className="text-sm text-indigo-700 mt-1">
                      {bedtimeAction.action_description}
                    </div>
                  )}
                  <div className="text-xs text-indigo-600 mt-2">
                    Scheduled: {format(new Date(bedtimeAction.scheduled_for), 'MMM dd, yyyy h:mm a')}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feedback History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5" />
                Recent Feedback ({feedbackHistory.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {feedbackHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No feedback history</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {feedbackHistory.map((feedback) => (
                    <div key={feedback.id} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${star <= feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {format(new Date(feedback.created_at), 'MMM dd, HH:mm')}
                        </span>
                      </div>
                      {feedback.feedback_text && (
                        <div className="text-xs text-gray-600 mt-1">{feedback.feedback_text}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error Details */}
          {testResults.error_details.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  Test Errors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {testResults.error_details.map((error, index) => (
                    <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Phase3MemoryTest;
