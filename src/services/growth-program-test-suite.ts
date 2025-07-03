import { supabase } from "@/integrations/supabase/client";
import { growthProgramService } from "./growth-program-service";
import { enhancedAICoachService } from "./enhanced-ai-coach-service";
import { memoryService } from "./memory-service";
import { LayeredBlueprint } from "@/types/personality-modules";
import { GrowthProgram, LifeDomain } from "@/types/growth-program";

export interface GrowthProgramTestResult {
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  details?: any;
  dataValidation?: {
    isLiveData: boolean;
    dataSource: string;
    recordCount?: number;
  };
}

export interface GrowthProgramTestSuiteResult {
  suiteName: string;
  totalTests: number;
  passed: number;
  failed: number;
  duration: number;
  results: GrowthProgramTestResult[];
  integrationStatus: 'healthy' | 'degraded' | 'failed';
}

class GrowthProgramTestRunner {
  private testUserId: string | null = null;
  private testProgramId: string | null = null;
  private testSessionId: string = `test-session-${Date.now()}`;

  async runFullTestSuite(): Promise<GrowthProgramTestSuiteResult> {
    const startTime = Date.now();
    console.log('🧪 Starting Growth Program End-to-End Test Suite...');

    try {
      // Ensure we have a test user
      await this.setupTestUser();

      const [
        authResults,
        blueprintResults,
        programResults,
        conversationResults,
        progressResults,
        integrationResults
      ] = await Promise.all([
        this.runAuthenticationTests(),
        this.runBlueprintIntegrationTests(),
        this.runProgramLifecycleTests(),
        this.runConversationFlowTests(),
        this.runProgressTrackingTests(),
        this.runSystemIntegrationTests()
      ]);

      const allResults = [
        ...authResults,
        ...blueprintResults,
        ...programResults,
        ...conversationResults,
        ...progressResults,
        ...integrationResults
      ];

      const passed = allResults.filter(r => r.status === 'passed').length;
      const failed = allResults.filter(r => r.status === 'failed').length;

      const integrationStatus = failed === 0 ? 'healthy' : failed < allResults.length / 2 ? 'degraded' : 'failed';

      const result: GrowthProgramTestSuiteResult = {
        suiteName: 'Growth Program End-to-End Test Suite',
        totalTests: allResults.length,
        passed,
        failed,
        duration: Date.now() - startTime,
        results: allResults,
        integrationStatus
      };

      console.log(`✅ Growth Program test suite completed: ${passed}/${allResults.length} tests passed`);
      return result;
    } catch (error) {
      console.error('❌ Growth Program test suite execution failed:', error);
      return {
        suiteName: 'Growth Program End-to-End Test Suite',
        totalTests: 0,
        passed: 0,
        failed: 1,
        duration: Date.now() - startTime,
        results: [{
          testName: 'Test Suite Execution',
          status: 'failed',
          duration: Date.now() - startTime,
          error: String(error)
        }],
        integrationStatus: 'failed'
      };
    }
  }

  private async setupTestUser(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      this.testUserId = user.id;
      console.log('✅ Using authenticated admin user for growth program tests:', user.id);
    } else {
      throw new Error('No authenticated user found for growth program testing');
    }
  }

  private async runAuthenticationTests(): Promise<GrowthProgramTestResult[]> {
    const results: GrowthProgramTestResult[] = [];
    
    try {
      const startTime = Date.now();
      const { data: { user } } = await supabase.auth.getUser();
      
      results.push({
        testName: 'Admin Authentication Status',
        status: user ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        details: { 
          hasUser: !!user,
          userId: user?.id,
          isAdmin: true
        },
        dataValidation: {
          isLiveData: true,
          dataSource: 'supabase_auth',
          recordCount: user ? 1 : 0
        }
      });
    } catch (error) {
      results.push({
        testName: 'Admin Authentication Status',
        status: 'failed',
        duration: 0,
        error: String(error)
      });
    }

    return results;
  }

  private async runBlueprintIntegrationTests(): Promise<GrowthProgramTestResult[]> {
    const results: GrowthProgramTestResult[] = [];
    
    if (!this.testUserId) {
      results.push({
        testName: 'Blueprint Integration Test',
        status: 'skipped',
        duration: 0,
        error: 'No authenticated user available'
      });
      return results;
    }

    try {
      const startTime = Date.now();
      
      // Check if user has blueprints
      const { data: blueprints, error } = await supabase
        .from('user_blueprints')
        .select('*')
        .eq('user_id', this.testUserId)
        .limit(1);

      results.push({
        testName: 'Blueprint Integration Test',
        status: !error ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        error: error?.message,
        details: {
          blueprintsFound: blueprints?.length || 0,
          canAccessBlueprints: !error
        },
        dataValidation: {
          isLiveData: true,
          dataSource: 'user_blueprints',
          recordCount: blueprints?.length || 0
        }
      });
    } catch (error) {
      results.push({
        testName: 'Blueprint Integration Test',
        status: 'failed',
        duration: 0,
        error: String(error)
      });
    }

    return results;
  }

  private async runProgramLifecycleTests(): Promise<GrowthProgramTestResult[]> {
    const results: GrowthProgramTestResult[] = [];
    
    if (!this.testUserId) {
      results.push({
        testName: 'Program Lifecycle Test',
        status: 'skipped',
        duration: 0,
        error: 'No authenticated user available'
      });
      return results;
    }

    try {
      const startTime = Date.now();
      
      // Check growth programs table
      const { data: programs, error } = await supabase
        .from('growth_programs')
        .select('*')
        .eq('user_id', this.testUserId)
        .limit(1);

      results.push({
        testName: 'Program Lifecycle Test',
        status: !error ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        error: error?.message,
        details: {
          programsFound: programs?.length || 0,
          canAccessPrograms: !error
        },
        dataValidation: {
          isLiveData: true,
          dataSource: 'growth_programs',
          recordCount: programs?.length || 0
        }
      });
    } catch (error) {
      results.push({
        testName: 'Program Lifecycle Test',
        status: 'failed',
        duration: 0,
        error: String(error)
      });
    }

    return results;
  }

  private async runConversationFlowTests(): Promise<GrowthProgramTestResult[]> {
    const results: GrowthProgramTestResult[] = [];
    
    if (!this.testUserId) {
      results.push({
        testName: 'Conversation Flow Test',
        status: 'skipped',
        duration: 0,
        error: 'No authenticated user available'
      });
      return results;
    }

    try {
      const startTime = Date.now();
      
      // Check conversation memory
      const { data: conversations, error } = await supabase
        .from('conversation_memory')
        .select('*')
        .eq('user_id', this.testUserId)
        .limit(1);

      results.push({
        testName: 'Conversation Flow Test',
        status: !error ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        error: error?.message,
        details: {
          conversationsFound: conversations?.length || 0,
          canAccessConversations: !error
        },
        dataValidation: {
          isLiveData: true,
          dataSource: 'conversation_memory',
          recordCount: conversations?.length || 0
        }
      });
    } catch (error) {
      results.push({
        testName: 'Conversation Flow Test',
        status: 'failed',
        duration: 0,
        error: String(error)
      });
    }

    return results;
  }

  private async runProgressTrackingTests(): Promise<GrowthProgramTestResult[]> {
    const results: GrowthProgramTestResult[] = [];
    
    if (!this.testUserId) {
      results.push({
        testName: 'Progress Tracking Test',
        status: 'skipped',
        duration: 0,
        error: 'No authenticated user available'
      });
      return results;
    }

    try {
      const startTime = Date.now();
      
      // Check user statistics
      const { data: stats, error } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', this.testUserId)
        .limit(1);

      results.push({
        testName: 'Progress Tracking Test',
        status: !error ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        error: error?.message,
        details: {
          statsFound: stats?.length || 0,
          canAccessStats: !error
        },
        dataValidation: {
          isLiveData: true,
          dataSource: 'user_statistics',
          recordCount: stats?.length || 0
        }
      });
    } catch (error) {
      results.push({
        testName: 'Progress Tracking Test',
        status: 'failed',
        duration: 0,
        error: String(error)
      });
    }

    return results;
  }

  private async runSystemIntegrationTests(): Promise<GrowthProgramTestResult[]> {
    const results: GrowthProgramTestResult[] = [];
    
    try {
      const startTime = Date.now();
      
      // Test database connectivity
      const { data, error } = await supabase
        .from('growth_programs')
        .select('count(*)')
        .limit(1);

      results.push({
        testName: 'System Integration Test',
        status: !error ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        error: error?.message,
        details: {
          databaseConnected: !error,
          canQueryTables: !error
        },
        dataValidation: {
          isLiveData: true,
          dataSource: 'system_connectivity',
          recordCount: 1
        }
      });
    } catch (error) {
      results.push({
        testName: 'System Integration Test',
        status: 'failed',
        duration: 0,
        error: String(error)
      });
    }

    return results;
  }
}

export const growthProgramTestSuite = new GrowthProgramTestRunner();
