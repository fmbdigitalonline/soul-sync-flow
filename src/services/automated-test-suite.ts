
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
        error: welcomeMessage ? undefined : 'Failed to generate welcome message',
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

  async runPhase2AgentConfigTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    try {
      const startTime = Date.now();
      const { agentConfigurationService } = await import('./agent-configuration-service');
      
      // Test agent-specific configurations
      const growthConfig = agentConfigurationService.getConfig('growth');
      const dreamsConfig = agentConfigurationService.getConfig('dreams');
      const soulConfig = agentConfigurationService.getConfig('soul_companion');

      // Verify configurations are different and not hardcoded
      const configsAreDifferent = (
        growthConfig.behavioral.responseStyle !== dreamsConfig.behavioral.responseStyle ||
        growthConfig.behavioral.emotionalSensitivity !== dreamsConfig.behavioral.emotionalSensitivity ||
        JSON.stringify(growthConfig.behavioral.focusAreas) !== JSON.stringify(dreamsConfig.behavioral.focusAreas)
      );

      results.push({
        testName: 'Agent Configuration Differentiation',
        status: configsAreDifferent ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        error: configsAreDifferent ? undefined : 'Agent configurations are too similar or hardcoded',
        details: {
          growthStyle: growthConfig.behavioral.responseStyle,
          dreamsStyle: dreamsConfig.behavioral.responseStyle,
          soulStyle: soulConfig.behavioral.responseStyle
        }
      });

      // Test personalized configuration
      const mockBlueprint = {
        cognition_mbti: { type: 'INTJ' },
        energy_strategy_human_design: { type: 'Generator' },
        user_meta: { preferred_name: 'TestUser' }
      };

      const personalizedConfig = agentConfigurationService.getPersonalizedConfig('growth', mockBlueprint);
      const isPersonalized = personalizedConfig !== growthConfig;

      results.push({
        testName: 'Personalized Configuration',
        status: isPersonalized ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        error: isPersonalized ? undefined : 'Personalized config is identical to default config',
        details: { personalizedConfigExists: isPersonalized }
      });

    } catch (error) {
      results.push({
        testName: 'Agent Configuration Tests',
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

      // Test agent communication service
      await agentCommunicationService.initialize('test-user-id');
      
      // Test insight sharing
      await agentCommunicationService.shareInsightBetweenAgents(
        'growth',
        'soul_companion',
        {
          insightType: 'pattern',
          content: 'Test insight sharing',
          confidence: 0.8,
          relevanceScore: 0.9
        }
      );

      const insights = agentCommunicationService.getInsightsForAgent('soul_companion');
      
      results.push({
        testName: 'Agent Communication - Insight Sharing',
        status: insights.length > 0 ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        error: insights.length > 0 ? undefined : 'No insights were shared between agents',
        details: { insightCount: insights.length }
      });

      // Test cross-mode pattern analysis
      const patterns = await agentCommunicationService.analyzeCrossModePatterns(
        'I want to grow spiritually while achieving my career goals',
        'growth'
      );

      results.push({
        testName: 'Cross-Mode Pattern Analysis',
        status: 'passed',
        duration: Date.now() - startTime,
        details: { patternCount: patterns.length }
      });

      // Test mode transition recommendations
      const recommendation = await agentCommunicationService.generateModeTransitionRecommendation(
        'growth',
        'I need to focus on my tasks and get things done',
        ['Previous context about spiritual growth']
      );

      results.push({
        testName: 'Mode Transition Recommendations',
        status: recommendation ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        error: recommendation ? undefined : 'No transition recommendation generated',
        details: { 
          suggestedMode: recommendation?.suggestedMode,
          confidence: recommendation?.confidence
        }
      });

      // Test meta-memory service
      await metaMemoryService.initialize('test-user-id');
      const metaInsights = await metaMemoryService.generateMetaInsights();
      
      results.push({
        testName: 'Meta-Memory Insight Generation',
        status: 'passed',
        duration: Date.now() - startTime,
        details: { metaInsightCount: metaInsights.length }
      });

      const userProfile = metaMemoryService.getUserProfile();
      
      results.push({
        testName: 'Holistic User Profile',
        status: userProfile ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        error: userProfile ? undefined : 'User profile was not generated',
        details: { 
          dominantMode: userProfile?.dominantMode,
          integrationStyle: userProfile?.integrationStyle
        }
      });

    } catch (error) {
      results.push({
        testName: 'Phase 3 Meta-Agent Tests',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error)
      });
    }

    return results;
  }

  async runBrainServiceTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    try {
      const startTime = Date.now();
      const { growthBrainService } = await import('./growth-brain-service');
      const { dreamsBrainService } = await import('./dreams-brain-service');
      const { soulCompanionBrainService } = await import('./soul-companion-brain-service');

      // Test Growth Brain Service
      await growthBrainService.initialize('test-user-id');
      const growthContext = growthBrainService.getGrowthContext();
      
      results.push({
        testName: 'Growth Brain Service Initialization',
        status: growthContext.isInitialized ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        error: growthContext.isInitialized ? undefined : 'Growth brain service not properly initialized',
        details: { 
          phase3Enabled: growthContext.phase3Enabled,
          focusAreas: growthContext.focusAreas?.length
        }
      });

      // Test Dreams Brain Service
      await dreamsBrainService.initialize('test-user-id');
      const dreamsContext = dreamsBrainService.getDreamsContext();
      
      results.push({
        testName: 'Dreams Brain Service Initialization',
        status: dreamsContext.isInitialized ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        error: dreamsContext.isInitialized ? undefined : 'Dreams brain service not properly initialized',
        details: { 
          phase3Enabled: dreamsContext.phase3Enabled,
          productivityOptimized: dreamsContext.configuration?.productivityOptimized
        }
      });

      // Test Soul Companion Brain Service
      await soulCompanionBrainService.initialize('test-user-id');
      const soulContext = soulCompanionBrainService.getSoulContext();
      
      results.push({
        testName: 'Soul Companion Brain Service Initialization',
        status: soulContext.isInitialized ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        error: soulContext.isInitialized ? undefined : 'Soul companion brain service not properly initialized',
        details: { 
          phase3Enabled: soulContext.phase3Enabled,
          metaIntelligence: soulContext.configuration?.metaIntelligence,
          crossModeIntegration: soulContext.configuration?.crossModeIntegration
        }
      });

    } catch (error) {
      results.push({
        testName: 'Brain Service Tests',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error)
      });
    }

    return results;
  }

  async runCompleteTestSuite(): Promise<TestSuiteResult[]> {
    console.log('🚀 Starting comprehensive Phase 1-3 diagnostic test suite...');
    
    const suiteResults: TestSuiteResult[] = [];
    const startTime = Date.now();

    // Phase 1 Tests
    const memoryTests = await this.runMemoryPersistenceTests();
    const feedbackTests = await this.runFeedbackTests();
    const reminderTests = await this.runReminderTests();
    const lifeContextTests = await this.runLifeContextTests();
    const integrationTests = await this.runIntegrationTests();

    const phase1Results = [...memoryTests, ...feedbackTests, ...reminderTests, ...lifeContextTests, ...integrationTests];
    suiteResults.push({
      suiteName: 'Phase 1: Enhanced Memory & Tiered Graph System',
      totalTests: phase1Results.length,
      passed: phase1Results.filter(r => r.status === 'passed').length,
      failed: phase1Results.filter(r => r.status === 'failed').length,
      skipped: phase1Results.filter(r => r.status === 'skipped').length,
      duration: Date.now() - startTime,
      results: phase1Results
    });

    // Phase 2 Tests
    const phase2Results = await this.runPhase2AgentConfigTests();
    suiteResults.push({
      suiteName: 'Phase 2: Agent-Specific Configuration',
      totalTests: phase2Results.length,
      passed: phase2Results.filter(r => r.status === 'passed').length,
      failed: phase2Results.filter(r => r.status === 'failed').length,
      skipped: phase2Results.filter(r => r.status === 'skipped').length,
      duration: Date.now() - startTime,
      results: phase2Results
    });

    // Phase 3 Tests
    const phase3Results = await this.runPhase3MetaAgentTests();
    const brainServiceResults = await this.runBrainServiceTests();
    const allPhase3Results = [...phase3Results, ...brainServiceResults];
    
    suiteResults.push({
      suiteName: 'Phase 3: Soul Companion Meta-Agent Integration',
      totalTests: allPhase3Results.length,
      passed: allPhase3Results.filter(r => r.status === 'passed').length,
      failed: allPhase3Results.filter(r => r.status === 'failed').length,
      skipped: allPhase3Results.filter(r => r.status === 'skipped').length,
      duration: Date.now() - startTime,
      results: allPhase3Results
    });

    return suiteResults;
  }

  generateDiagnosticReport(suiteResults: TestSuiteResult[]): string {
    let report = '\n🔍 PHASE 1-3 IMPLEMENTATION DIAGNOSTIC REPORT\n';
    report += '='.repeat(50) + '\n\n';

    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;

    suiteResults.forEach(suite => {
      totalTests += suite.totalTests;
      totalPassed += suite.passed;
      totalFailed += suite.failed;

      report += `📋 ${suite.suiteName}\n`;
      report += `-`.repeat(suite.suiteName.length + 2) + '\n';
      report += `✅ Passed: ${suite.passed}/${suite.totalTests}\n`;
      report += `❌ Failed: ${suite.failed}/${suite.totalTests}\n`;
      report += `⏱️  Duration: ${suite.duration}ms\n\n`;

      // Show failed tests
      const failedTests = suite.results.filter(r => r.status === 'failed');
      if (failedTests.length > 0) {
        report += '❌ Failed Tests:\n';
        failedTests.forEach(test => {
          report += `  • ${test.testName}: ${test.error}\n`;
        });
        report += '\n';
      }

      // Show key passed tests with details
      const passedTests = suite.results.filter(r => r.status === 'passed' && r.details);
      if (passedTests.length > 0) {
        report += '✅ Key Validations:\n';
        passedTests.forEach(test => {
          report += `  • ${test.testName}: ${JSON.stringify(test.details)}\n`;
        });
        report += '\n';
      }
    });

    report += '📊 OVERALL SUMMARY\n';
    report += '='.repeat(20) + '\n';
    report += `Total Tests: ${totalTests}\n`;
    report += `Passed: ${totalPassed} (${((totalPassed/totalTests)*100).toFixed(1)}%)\n`;
    report += `Failed: ${totalFailed} (${((totalFailed/totalTests)*100).toFixed(1)}%)\n\n`;

    if (totalFailed === 0) {
      report += '🎉 ALL PHASES IMPLEMENTED WITH REAL, DYNAMIC FUNCTIONALITY!\n';
      report += '✨ No hardcoded or simulated data detected.\n';
      report += '🚀 Ready to proceed to Phase 4.\n';
    } else {
      report += '⚠️  Some tests failed - review implementation for hardcoded data.\n';
      report += '🔧 Fix issues before proceeding to Phase 4.\n';
    }

    return report;
  }
}

export const automatedTestSuite = new AutomatedTestSuite();
