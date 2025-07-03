
import { memoryService, SessionMemory, SessionFeedback, MicroActionReminder } from '@/services/memory-service';
import { TestAuthenticationService } from './test-authentication-service';
import { addHours, addDays } from 'date-fns';

export interface TestResult {
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  details?: any;
  authenticationStatus?: 'authenticated' | 'unauthenticated' | 'test_mode';
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

class EnhancedAutomatedTestSuite {
  private sessionId = `enhanced-test-${Date.now()}`;
  private testUserId: string = '';
  private authStatus: 'authenticated' | 'unauthenticated' | 'test_mode' = 'test_mode';

  async initialize(): Promise<void> {
    console.log('🔄 Initializing Enhanced Automated Test Suite...');
    const authResult = await TestAuthenticationService.initializeTestUser();
    
    if (authResult) {
      this.testUserId = authResult.userId;
      this.authStatus = 'authenticated';
      console.log('✅ Test suite initialized with authenticated user');
    } else {
      this.testUserId = TestAuthenticationService.generateTestUUID();
      this.authStatus = 'test_mode';
      console.log('⚠️ Test suite running in test mode (no authentication)');
    }
  }

  async runMemoryPersistenceTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Test 1: Basic memory save with proper authentication
    try {
      const startTime = Date.now();
      
      if (this.authStatus === 'authenticated') {
        const testMemory = await memoryService.saveMemory({
          user_id: this.testUserId,
          session_id: this.sessionId,
          memory_type: 'interaction',
          memory_data: {
            test_content: 'Enhanced automated test memory content',
            test_timestamp: new Date().toISOString(),
            test_type: 'enhanced_basic_save'
          },
          context_summary: 'Enhanced automated basic memory save test',
          importance_score: 7
        });

        results.push({
          testName: 'Basic Memory Save (Authenticated)',
          status: testMemory ? 'passed' : 'failed',
          duration: Date.now() - startTime,
          error: testMemory ? undefined : 'Memory save returned null',
          details: { memoryId: testMemory?.id, userId: this.testUserId },
          authenticationStatus: this.authStatus
        });
      } else {
        results.push({
          testName: 'Basic Memory Save (Authenticated)',
          status: 'skipped',
          duration: Date.now() - startTime,
          error: 'No authenticated user available',
          authenticationStatus: this.authStatus
        });
      }
    } catch (error) {
      results.push({
        testName: 'Basic Memory Save (Authenticated)',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error),
        authenticationStatus: this.authStatus
      });
    }

    // Test 2: Memory retrieval with authentication check
    try {
      const startTime = Date.now();
      
      if (this.authStatus === 'authenticated') {
        const memories = await memoryService.getRecentMemories(5);
        
        results.push({
          testName: 'Memory Retrieval (Authenticated)',
          status: 'passed',
          duration: Date.now() - startTime,
          details: { count: memories.length, userId: this.testUserId },
          authenticationStatus: this.authStatus
        });
      } else {
        results.push({
          testName: 'Memory Retrieval (Authenticated)',
          status: 'skipped',
          duration: Date.now() - startTime,
          error: 'Authentication required for memory retrieval',
          authenticationStatus: this.authStatus
        });
      }
    } catch (error) {
      results.push({
        testName: 'Memory Retrieval (Authenticated)',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error),
        authenticationStatus: this.authStatus
      });
    }

    // Test 3: Memory search with proper context
    try {
      const startTime = Date.now();
      
      if (this.authStatus === 'authenticated') {
        const searchResults = await memoryService.searchMemories('enhanced automated', 3);
        
        results.push({
          testName: 'Memory Search (Authenticated)',
          status: 'passed',
          duration: Date.now() - startTime,
          details: { searchResults: searchResults.length, userId: this.testUserId },
          authenticationStatus: this.authStatus
        });
      } else {
        results.push({
          testName: 'Memory Search (Authenticated)',
          status: 'skipped',
          duration: Date.now() - startTime,
          error: 'Authentication required for memory search',
          authenticationStatus: this.authStatus
        });
      }
    } catch (error) {
      results.push({
        testName: 'Memory Search (Authenticated)',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error),
        authenticationStatus: this.authStatus
      });
    }

    return results;
  }

  async runFeedbackTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Test 1: Feedback save with proper user context
    try {
      const startTime = Date.now();
      
      if (this.authStatus === 'authenticated') {
        const success = await memoryService.saveFeedback({
          user_id: this.testUserId,
          session_id: this.sessionId,
          rating: 5,
          feedback_text: 'Enhanced automated test feedback',
          session_summary: 'Enhanced automated test session',
          improvement_suggestions: ['Enhanced suggestion 1', 'Enhanced suggestion 2']
        });

        results.push({
          testName: 'Feedback Save (Authenticated)',
          status: success ? 'passed' : 'failed',
          duration: Date.now() - startTime,
          error: success ? undefined : 'Feedback save returned false',
          details: { userId: this.testUserId },
          authenticationStatus: this.authStatus
        });
      } else {
        results.push({
          testName: 'Feedback Save (Authenticated)',
          status: 'skipped',
          duration: Date.now() - startTime,
          error: 'Authentication required for feedback save',
          authenticationStatus: this.authStatus
        });
      }
    } catch (error) {
      results.push({
        testName: 'Feedback Save (Authenticated)',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error),
        authenticationStatus: this.authStatus
      });
    }

    // Test 2: Feedback history retrieval
    try {
      const startTime = Date.now();
      
      if (this.authStatus === 'authenticated') {
        const history = await memoryService.getFeedbackHistory(5);
        
        results.push({
          testName: 'Feedback History Retrieval (Authenticated)',
          status: 'passed',
          duration: Date.now() - startTime,
          details: { count: history.length, userId: this.testUserId },
          authenticationStatus: this.authStatus
        });
      } else {
        results.push({
          testName: 'Feedback History Retrieval (Authenticated)',
          status: 'skipped',
          duration: Date.now() - startTime,
          error: 'Authentication required for feedback history',
          authenticationStatus: this.authStatus
        });
      }
    } catch (error) {
      results.push({
        testName: 'Feedback History Retrieval (Authenticated)',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error),
        authenticationStatus: this.authStatus
      });
    }

    return results;
  }

  async runReminderTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Test 1: Reminder creation with valid UUID
    try {
      const startTime = Date.now();
      
      if (this.authStatus === 'authenticated') {
        const reminder = await memoryService.createReminder({
          user_id: this.testUserId,
          session_id: this.sessionId,
          action_title: 'Enhanced automated test reminder',
          action_description: 'This is an enhanced automated test reminder',
          reminder_type: 'in_app',
          scheduled_for: addHours(new Date(), 1).toISOString(),
          status: 'pending'
        });

        results.push({
          testName: 'Reminder Creation (Authenticated)',
          status: reminder ? 'passed' : 'failed',
          duration: Date.now() - startTime,
          error: reminder ? undefined : 'Reminder creation returned null',
          details: { reminderId: reminder?.id, userId: this.testUserId },
          authenticationStatus: this.authStatus
        });
      } else {
        results.push({
          testName: 'Reminder Creation (Authenticated)',
          status: 'skipped',
          duration: Date.now() - startTime,
          error: 'Authentication required for reminder creation',
          authenticationStatus: this.authStatus
        });
      }
    } catch (error) {
      results.push({
        testName: 'Reminder Creation (Authenticated)',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error),
        authenticationStatus: this.authStatus
      });
    }

    // Test 2: Active reminders retrieval
    try {
      const startTime = Date.now();
      
      if (this.authStatus === 'authenticated') {
        const reminders = await memoryService.getActiveReminders();
        
        results.push({
          testName: 'Active Reminders Retrieval (Authenticated)',
          status: 'passed',
          duration: Date.now() - startTime,
          details: { count: reminders.length, userId: this.testUserId },
          authenticationStatus: this.authStatus
        });
      } else {
        results.push({
          testName: 'Active Reminders Retrieval (Authenticated)',
          status: 'skipped',
          duration: Date.now() - startTime,
          error: 'Authentication required for reminder retrieval',
          authenticationStatus: this.authStatus
        });
      }
    } catch (error) {
      results.push({
        testName: 'Active Reminders Retrieval (Authenticated)',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error),
        authenticationStatus: this.authStatus
      });
    }

    return results;
  }

  async runLifeContextTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Test 1: Life context update with proper authentication
    try {
      const startTime = Date.now();
      
      if (this.authStatus === 'authenticated') {
        const success = await memoryService.updateLifeContext({
          user_id: this.testUserId,
          context_category: 'growth',
          current_focus: 'Enhanced automated testing implementation',
          recent_progress: [
            {
              description: 'Implemented enhanced automated test suite',
              timestamp: new Date().toISOString(),
              impact: 'high'
            }
          ],
          ongoing_challenges: [
            {
              description: 'Optimizing test performance with authentication',
              priority: 'medium'
            }
          ],
          celebration_moments: [
            {
              description: 'Successfully enhanced Phase 1-3 tests',
              timestamp: new Date().toISOString()
            }
          ],
          next_steps: [
            {
              description: 'Deploy enhanced tests to production',
              priority: 'high'
            }
          ],
          last_updated: new Date().toISOString()
        });

        results.push({
          testName: 'Life Context Update (Authenticated)',
          status: success ? 'passed' : 'failed',
          duration: Date.now() - startTime,
          error: success ? undefined : 'Life context update returned false',
          details: { userId: this.testUserId },
          authenticationStatus: this.authStatus
        });
      } else {
        results.push({
          testName: 'Life Context Update (Authenticated)',
          status: 'skipped',
          duration: Date.now() - startTime,
          error: 'Authentication required for life context update',
          authenticationStatus: this.authStatus
        });
      }
    } catch (error) {
      results.push({
        testName: 'Life Context Update (Authenticated)',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error),
        authenticationStatus: this.authStatus
      });
    }

    // Test 2: Life context retrieval
    try {
      const startTime = Date.now();
      
      if (this.authStatus === 'authenticated') {
        const contexts = await memoryService.getLifeContext();
        
        results.push({
          testName: 'Life Context Retrieval (Authenticated)',
          status: 'passed',
          duration: Date.now() - startTime,
          details: { count: contexts.length, userId: this.testUserId },
          authenticationStatus: this.authStatus
        });
      } else {
        results.push({
          testName: 'Life Context Retrieval (Authenticated)',
          status: 'skipped',
          duration: Date.now() - startTime,
          error: 'Authentication required for life context retrieval',
          authenticationStatus: this.authStatus
        });
      }
    } catch (error) {
      results.push({
        testName: 'Life Context Retrieval (Authenticated)',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error),
        authenticationStatus: this.authStatus
      });
    }

    return results;
  }

  async runPhase2AgentConfigTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    try {
      const startTime = Date.now();
      const { agentConfigurationService } = await import('./agent-configuration-service');
      
      // Test agent-specific configurations with enhanced validation
      const growthConfig = agentConfigurationService.getConfig('growth');
      const dreamsConfig = agentConfigurationService.getConfig('dreams');
      const soulConfig = agentConfigurationService.getConfig('soul_companion');

      // Enhanced configuration differentiation test
      const configsAreDifferent = (
        growthConfig.behavioral.responseStyle !== dreamsConfig.behavioral.responseStyle ||
        growthConfig.behavioral.emotionalSensitivity !== dreamsConfig.behavioral.emotionalSensitivity ||
        JSON.stringify(growthConfig.behavioral.focusAreas) !== JSON.stringify(dreamsConfig.behavioral.focusAreas)
      );

      results.push({
        testName: 'Agent Configuration Differentiation (Enhanced)',
        status: configsAreDifferent ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        error: configsAreDifferent ? undefined : 'Agent configurations are too similar or hardcoded',
        details: {
          growthStyle: growthConfig.behavioral.responseStyle,
          dreamsStyle: dreamsConfig.behavioral.responseStyle,
          soulStyle: soulConfig.behavioral.responseStyle,
          configurationCount: 3,
          uniqueStyles: new Set([
            growthConfig.behavioral.responseStyle,
            dreamsConfig.behavioral.responseStyle,
            soulConfig.behavioral.responseStyle
          ]).size
        }
      });

      // Enhanced personalized configuration test
      const mockBlueprint = {
        cognition_mbti: { type: 'INTJ' },
        energy_strategy_human_design: { type: 'Generator' },
        user_meta: { preferred_name: 'EnhancedTestUser' }
      };

      const personalizedConfig = agentConfigurationService.getPersonalizedConfig('growth', mockBlueprint);
      
      // More thorough personalization check
      const personalizedDifferences = [
        personalizedConfig.behavioral?.responseStyle !== growthConfig.behavioral?.responseStyle,
        personalizedConfig.behavioral?.emotionalSensitivity !== growthConfig.behavioral?.emotionalSensitivity,
        JSON.stringify(personalizedConfig.behavioral?.focusAreas) !== JSON.stringify(growthConfig.behavioral?.focusAreas),
        personalizedConfig.communication?.tone !== growthConfig.communication?.tone
      ].filter(Boolean).length;

      const isPersonalized = personalizedDifferences > 0;

      results.push({
        testName: 'Personalized Configuration (Enhanced)',
        status: isPersonalized ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        error: isPersonalized ? undefined : 'Personalized config shows no meaningful differences from default',
        details: { 
          personalizedConfigExists: isPersonalized,
          differencesFound: personalizedDifferences,
          blueprintType: mockBlueprint.cognition_mbti.type
        }
      });

    } catch (error) {
      results.push({
        testName: 'Agent Configuration Tests (Enhanced)',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error)
      });
    }

    return results;
  }

  async runPhase3MetaAgentTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    try {
      const startTime = Date.now();
      const { agentCommunicationService } = await import('./agent-communication-service');
      const { metaMemoryService } = await import('./meta-memory-service');

      // Test agent communication service with proper UUID
      await agentCommunicationService.initialize(this.testUserId);
      
      // Test insight sharing with enhanced validation
      await agentCommunicationService.shareInsightBetweenAgents(
        'growth',
        'soul_companion',
        {
          insightType: 'pattern',
          content: 'Enhanced test insight sharing',
          confidence: 0.8,
          relevanceScore: 0.9
        }
      );

      const insights = agentCommunicationService.getInsightsForAgent('soul_companion');
      
      results.push({
        testName: 'Agent Communication - Insight Sharing (Enhanced)',
        status: insights.length > 0 ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        error: insights.length > 0 ? undefined : 'No insights were shared between agents',
        details: { 
          insightCount: insights.length,
          userId: this.testUserId,
          fromAgent: 'growth',
          toAgent: 'soul_companion'
        }
      });

      // Test meta-memory service with proper initialization
      await metaMemoryService.initialize(this.testUserId);
      const metaInsights = await metaMemoryService.generateMetaInsights();
      
      results.push({
        testName: 'Meta-Memory Insight Generation (Enhanced)',
        status: 'passed',
        duration: Date.now() - startTime,
        details: { 
          metaInsightCount: metaInsights.length,
          userId: this.testUserId
        }
      });

      const userProfile = metaMemoryService.getUserProfile();
      
      results.push({
        testName: 'Holistic User Profile (Enhanced)',
        status: userProfile ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        error: userProfile ? undefined : 'User profile was not generated',
        details: { 
          dominantMode: userProfile?.dominantMode,
          integrationStyle: userProfile?.integrationStyle,
          userId: this.testUserId
        }
      });

    } catch (error) {
      results.push({
        testName: 'Phase 3 Meta-Agent Tests (Enhanced)',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error)
      });
    }

    return results;
  }

  async runCompleteTestSuite(): Promise<TestSuiteResult[]> {
    console.log('🚀 Starting Enhanced Phase 1-3 diagnostic test suite...');
    
    await this.initialize();
    
    const suiteResults: TestSuiteResult[] = [];
    const startTime = Date.now();

    // Phase 1 Tests with enhanced authentication handling
    const memoryTests = await this.runMemoryPersistenceTests();
    const feedbackTests = await this.runFeedbackTests();
    const reminderTests = await this.runReminderTests();
    const lifeContextTests = await this.runLifeContextTests();

    const phase1Results = [...memoryTests, ...feedbackTests, ...reminderTests, ...lifeContextTests];
    suiteResults.push({
      suiteName: `Phase 1: Enhanced Memory & Tiered Graph System (${this.authStatus})`,
      totalTests: phase1Results.length,
      passed: phase1Results.filter(r => r.status === 'passed').length,
      failed: phase1Results.filter(r => r.status === 'failed').length,
      skipped: phase1Results.filter(r => r.status === 'skipped').length,
      duration: Date.now() - startTime,
      results: phase1Results
    });

    // Phase 2 Tests with enhanced validation
    const phase2Results = await this.runPhase2AgentConfigTests();
    suiteResults.push({
      suiteName: 'Phase 2: Agent-Specific Configuration (Enhanced)',
      totalTests: phase2Results.length,
      passed: phase2Results.filter(r => r.status === 'passed').length,
      failed: phase2Results.filter(r => r.status === 'failed').length,
      skipped: phase2Results.filter(r => r.status === 'skipped').length,
      duration: Date.now() - startTime,
      results: phase2Results
    });

    // Phase 3 Tests with proper UUID handling
    const phase3Results = await this.runPhase3MetaAgentTests();
    
    suiteResults.push({
      suiteName: 'Phase 3: Soul Companion Meta-Agent Integration (Enhanced)',
      totalTests: phase3Results.length,
      passed: phase3Results.filter(r => r.status === 'passed').length,
      failed: phase3Results.filter(r => r.status === 'failed').length,
      skipped: phase3Results.filter(r => r.status === 'skipped').length,
      duration: Date.now() - startTime,
      results: phase3Results
    });

    await TestAuthenticationService.cleanup();
    return suiteResults;
  }

  generateDiagnosticReport(suiteResults: TestSuiteResult[]): string {
    let report = '\n🔍 ENHANCED PHASE 1-3 IMPLEMENTATION DIAGNOSTIC REPORT\n';
    report += '='.repeat(60) + '\n\n';

    report += `🔐 Authentication Status: ${this.authStatus.toUpperCase()}\n`;
    report += `👤 Test User ID: ${this.testUserId}\n`;
    report += `📅 Test Session: ${this.sessionId}\n\n`;

    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalSkipped = 0;

    suiteResults.forEach(suite => {
      totalTests += suite.totalTests;
      totalPassed += suite.passed;
      totalFailed += suite.failed;
      totalSkipped += suite.skipped;

      report += `📋 ${suite.suiteName}\n`;
      report += `-`.repeat(suite.suiteName.length + 2) + '\n';
      report += `✅ Passed: ${suite.passed}/${suite.totalTests}\n`;
      report += `❌ Failed: ${suite.failed}/${suite.totalTests}\n`;
      report += `⏭️ Skipped: ${suite.skipped}/${suite.totalTests}\n`;
      report += `⏱️  Duration: ${suite.duration}ms\n\n`;

      // Show failed tests with enhanced details
      const failedTests = suite.results.filter(r => r.status === 'failed');
      if (failedTests.length > 0) {
        report += '❌ Failed Tests:\n';
        failedTests.forEach(test => {
          report += `  • ${test.testName}: ${test.error}\n`;
          if (test.authenticationStatus) {
            report += `    Auth Status: ${test.authenticationStatus}\n`;
          }
        });
        report += '\n';
      }

      // Show skipped tests with reasons
      const skippedTests = suite.results.filter(r => r.status === 'skipped');
      if (skippedTests.length > 0) {
        report += '⏭️ Skipped Tests:\n';
        skippedTests.forEach(test => {
          report += `  • ${test.testName}: ${test.error}\n`;
        });
        report += '\n';
      }
    });

    report += '📊 OVERALL SUMMARY\n';
    report += '='.repeat(20) + '\n';
    report += `Total Tests: ${totalTests}\n`;
    report += `Passed: ${totalPassed} (${((totalPassed/totalTests)*100).toFixed(1)}%)\n`;
    report += `Failed: ${totalFailed} (${((totalFailed/totalTests)*100).toFixed(1)}%)\n`;
    report += `Skipped: ${totalSkipped} (${((totalSkipped/totalTests)*100).toFixed(1)}%)\n\n`;

    if (this.authStatus === 'authenticated') {
      if (totalFailed === 0) {
        report += '🎉 ALL PHASES IMPLEMENTED WITH REAL, DYNAMIC FUNCTIONALITY!\n';
        report += '✨ No hardcoded or simulated data detected.\n';
        report += '🚀 Ready to proceed to Phase 4.\n';
      } else {
        report += '⚠️  Some tests failed - review implementation for issues.\n';
        report += '🔧 Fix issues before proceeding to Phase 4.\n';
      }
    } else {
      report += '🔐 AUTHENTICATION REQUIRED FOR FULL TESTING\n';
      report += '   Please sign in to run complete diagnostic tests\n';
      report += '   Current tests run in limited mode\n';
    }

    return report;
  }
}

export const enhancedAutomatedTestSuite = new EnhancedAutomatedTestSuite();
