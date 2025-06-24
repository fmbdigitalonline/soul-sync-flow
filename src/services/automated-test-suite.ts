
import { memoryService, SessionMemory, SessionFeedback, MicroActionReminder } from '@/services/memory-service';
import { addHours, addDays } from 'date-fns';

export interface TestResult {
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  details?: any;
}

export interface TestSuiteResult {
  suiteName: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  results: TestResult[];
}

class AutomatedTestSuite {
  private sessionId = `automated-test-${Date.now()}`;

  async runMemoryPersistenceTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Test 1: Basic memory save
    try {
      const startTime = Date.now();
      const testMemory = await memoryService.saveMemory({
        user_id: '',
        session_id: this.sessionId,
        memory_type: 'interaction',
        memory_data: {
          test_content: 'Automated test memory content',
          test_timestamp: new Date().toISOString(),
          test_type: 'automated_basic_save'
        },
        context_summary: 'Automated basic memory save test',
        importance_score: 7
      });

      results.push({
        testName: 'Basic Memory Save',
        status: testMemory ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        error: testMemory ? undefined : 'Memory save returned null',
        details: { memoryId: testMemory?.id }
      });
    } catch (error) {
      results.push({
        testName: 'Basic Memory Save',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error)
      });
    }

    // Test 2: Memory retrieval
    try {
      const startTime = Date.now();
      const memories = await memoryService.getRecentMemories(5);
      
      results.push({
        testName: 'Memory Retrieval',
        status: 'passed',
        duration: Date.now() - startTime,
        details: { count: memories.length }
      });
    } catch (error) {
      results.push({
        testName: 'Memory Retrieval',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error)
      });
    }

    // Test 3: Memory search
    try {
      const startTime = Date.now();
      const searchResults = await memoryService.searchMemories('automated', 3);
      
      results.push({
        testName: 'Memory Search',
        status: 'passed',
        duration: Date.now() - startTime,
        details: { searchResults: searchResults.length }
      });
    } catch (error) {
      results.push({
        testName: 'Memory Search',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error)
      });
    }

    return results;
  }

  async runFeedbackTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Test 1: Feedback save
    try {
      const startTime = Date.now();
      const success = await memoryService.saveFeedback({
        user_id: '',
        session_id: this.sessionId,
        rating: 5,
        feedback_text: 'Automated test feedback',
        session_summary: 'Automated test session',
        improvement_suggestions: ['Automated suggestion 1', 'Automated suggestion 2']
      });

      results.push({
        testName: 'Feedback Save',
        status: success ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        error: success ? undefined : 'Feedback save returned false'
      });
    } catch (error) {
      results.push({
        testName: 'Feedback Save',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error)
      });
    }

    // Test 2: Feedback history retrieval
    try {
      const startTime = Date.now();
      const history = await memoryService.getFeedbackHistory(5);
      
      results.push({
        testName: 'Feedback History Retrieval',
        status: 'passed',
        duration: Date.now() - startTime,
        details: { count: history.length }
      });
    } catch (error) {
      results.push({
        testName: 'Feedback History Retrieval',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error)
      });
    }

    return results;
  }

  async runReminderTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Test 1: Reminder creation
    try {
      const startTime = Date.now();
      const reminder = await memoryService.createReminder({
        user_id: '',
        session_id: this.sessionId,
        action_title: 'Automated test reminder',
        action_description: 'This is an automated test reminder',
        reminder_type: 'in_app',
        scheduled_for: addHours(new Date(), 1).toISOString(),
        status: 'pending'
      });

      results.push({
        testName: 'Reminder Creation',
        status: reminder ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        error: reminder ? undefined : 'Reminder creation returned null',
        details: { reminderId: reminder?.id }
      });
    } catch (error) {
      results.push({
        testName: 'Reminder Creation',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error)
      });
    }

    // Test 2: Active reminders retrieval
    try {
      const startTime = Date.now();
      const reminders = await memoryService.getActiveReminders();
      
      results.push({
        testName: 'Active Reminders Retrieval',
        status: 'passed',
        duration: Date.now() - startTime,
        details: { count: reminders.length }
      });
    } catch (error) {
      results.push({
        testName: 'Active Reminders Retrieval',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error)
      });
    }

    // Test 3: Bedtime action retrieval
    try {
      const startTime = Date.now();
      const bedtimeAction = await memoryService.getNextBedtimeAction();
      
      results.push({
        testName: 'Bedtime Action Retrieval',
        status: 'passed',
        duration: Date.now() - startTime,
        details: { hasBedtimeAction: !!bedtimeAction }
      });
    } catch (error) {
      results.push({
        testName: 'Bedtime Action Retrieval',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error)
      });
    }

    return results;
  }

  async runLifeContextTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Test 1: Life context update
    try {
      const startTime = Date.now();
      const success = await memoryService.updateLifeContext({
        user_id: '',
        context_category: 'growth',
        current_focus: 'Automated testing implementation',
        recent_progress: [
          {
            description: 'Implemented automated test suite',
            timestamp: new Date().toISOString(),
            impact: 'high'
          }
        ],
        ongoing_challenges: [
          {
            description: 'Optimizing test performance',
            priority: 'medium'
          }
        ],
        celebration_moments: [
          {
            description: 'Successfully automated Phase 3 tests',
            timestamp: new Date().toISOString()
          }
        ],
        next_steps: [
          {
            description: 'Deploy to production environment',
            priority: 'high'
          }
        ],
        last_updated: new Date().toISOString()
      });

      results.push({
        testName: 'Life Context Update',
        status: success ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        error: success ? undefined : 'Life context update returned false'
      });
    } catch (error) {
      results.push({
        testName: 'Life Context Update',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error)
      });
    }

    // Test 2: Life context retrieval
    try {
      const startTime = Date.now();
      const contexts = await memoryService.getLifeContext();
      
      results.push({
        testName: 'Life Context Retrieval',
        status: 'passed',
        duration: Date.now() - startTime,
        details: { count: contexts.length }
      });
    } catch (error) {
      results.push({
        testName: 'Life Context Retrieval',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error)
      });
    }

    return results;
  }

  async runIntegrationTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Test 1: Cross-service memory integration
    try {
      const startTime = Date.now();
      
      // Create a memory, then create a related reminder
      const memory = await memoryService.saveMemory({
        user_id: '',
        session_id: this.sessionId,
        memory_type: 'interaction',
        memory_data: {
          action_needed: 'Follow up on integration test',
          priority: 'high'
        },
        context_summary: 'Integration test requiring follow-up',
        importance_score: 8
      });

      if (memory) {
        const reminder = await memoryService.createReminder({
          user_id: '',
          session_id: this.sessionId,
          action_title: 'Follow up on integration test',
          action_description: `Related to memory: ${memory.id}`,
          reminder_type: 'in_app',
          scheduled_for: addHours(new Date(), 2).toISOString(),
          status: 'pending'
        });

        results.push({
          testName: 'Cross-Service Integration',
          status: reminder ? 'passed' : 'failed',
          duration: Date.now() - startTime,
          error: reminder ? undefined : 'Failed to create follow-up reminder',
          details: { memoryId: memory.id, reminderId: reminder?.id }
        });
      } else {
        results.push({
          testName: 'Cross-Service Integration',
          status: 'failed',
          duration: Date.now() - startTime,
          error: 'Failed to create initial memory'
        });
      }
    } catch (error) {
      results.push({
        testName: 'Cross-Service Integration',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error)
      });
    }

    // Test 2: Welcome message generation
    try {
      const startTime = Date.now();
      const welcomeMessage = await memoryService.generateWelcomeMessage('TestUser');
      
      results.push({
        testName: 'Welcome Message Generation',
        status: welcomeMessage ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        error: welcomeMessage ? undefined : 'Welcome message generation failed',
        details: { messageLength: welcomeMessage?.length }
      });
    } catch (error) {
      results.push({
        testName: 'Welcome Message Generation',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error)
      });
    }

    return results;
  }

  async runPerformanceTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Test 1: Bulk memory operations
    try {
      const startTime = Date.now();
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        promises.push(memoryService.saveMemory({
          user_id: '',
          session_id: this.sessionId,
          memory_type: 'interaction',
          memory_data: {
            test_batch: i,
            content: `Performance test memory ${i}`
          },
          context_summary: `Performance test memory ${i}`,
          importance_score: 5
        }));
      }

      const results_batch = await Promise.all(promises);
      const successCount = results_batch.filter(r => r !== null).length;
      
      results.push({
        testName: 'Bulk Memory Operations',
        status: successCount === 10 ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        error: successCount === 10 ? undefined : `Only ${successCount}/10 operations succeeded`,
        details: { successCount, totalOperations: 10 }
      });
    } catch (error) {
      results.push({
        testName: 'Bulk Memory Operations',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error)
      });
    }

    // Test 2: Query performance
    try {
      const startTime = Date.now();
      const [memories, reminders, contexts] = await Promise.all([
        memoryService.getRecentMemories(20),
        memoryService.getActiveReminders(),
        memoryService.getLifeContext()
      ]);
      
      const duration = Date.now() - startTime;
      
      results.push({
        testName: 'Concurrent Query Performance',
        status: duration < 2000 ? 'passed' : 'failed', // Should complete in under 2 seconds
        duration,
        error: duration < 2000 ? undefined : 'Queries took too long to complete',
        details: { 
          memoriesCount: memories.length, 
          remindersCount: reminders.length, 
          contextsCount: contexts.length 
        }
      });
    } catch (error) {
      results.push({
        testName: 'Concurrent Query Performance',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error)
      });
    }

    return results;
  }

  async runFullTestSuite(): Promise<TestSuiteResult> {
    const startTime = Date.now();
    console.log('🧪 Starting automated test suite execution...');

    try {
      const [
        memoryResults,
        feedbackResults,
        reminderResults,
        lifeContextResults,
        integrationResults,
        performanceResults
      ] = await Promise.all([
        this.runMemoryPersistenceTests(),
        this.runFeedbackTests(),
        this.runReminderTests(),
        this.runLifeContextTests(),
        this.runIntegrationTests(),
        this.runPerformanceTests()
      ]);

      const allResults = [
        ...memoryResults,
        ...feedbackResults,
        ...reminderResults,
        ...lifeContextResults,
        ...integrationResults,
        ...performanceResults
      ];

      const passed = allResults.filter(r => r.status === 'passed').length;
      const failed = allResults.filter(r => r.status === 'failed').length;
      const skipped = allResults.filter(r => r.status === 'skipped').length;

      const result: TestSuiteResult = {
        suiteName: 'Phase 3 Memory System Automated Tests',
        totalTests: allResults.length,
        passed,
        failed,
        skipped,
        duration: Date.now() - startTime,
        results: allResults
      };

      console.log(`✅ Test suite completed: ${passed}/${allResults.length} tests passed`);
      return result;
    } catch (error) {
      console.error('❌ Test suite execution failed:', error);
      return {
        suiteName: 'Phase 3 Memory System Automated Tests',
        totalTests: 0,
        passed: 0,
        failed: 1,
        skipped: 0,
        duration: Date.now() - startTime,
        results: [{
          testName: 'Test Suite Execution',
          status: 'failed',
          duration: Date.now() - startTime,
          error: String(error)
        }]
      };
    }
  }
}

export const automatedTestSuite = new AutomatedTestSuite();
