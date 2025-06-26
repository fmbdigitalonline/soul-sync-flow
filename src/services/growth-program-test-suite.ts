
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
      console.log('🔧 Using authenticated user for tests:', user.id);
    } else {
      throw new Error('No authenticated user found for testing');
    }
  }

  private async runAuthenticationTests(): Promise<GrowthProgramTestResult[]> {
    const results: GrowthProgramTestResult[] = [];

    // Test 1: User Authentication Status
    try {
      const startTime = Date.now();
      const { data: { session } } = await supabase.auth.getSession();
      
      results.push({
        testName: 'User Authentication Status',
        status: session ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        details: { hasSession: !!session, userId: session?.user?.id },
        dataValidation: {
          isLiveData: true,
          dataSource: 'supabase.auth'
        }
      });
    } catch (error) {
      results.push({
        testName: 'User Authentication Status',
        status: 'failed',
        duration: 0,
        error: String(error)
      });
    }

    // Test 2: User Profile Access
    try {
      const startTime = Date.now();
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', this.testUserId!)
        .maybeSingle();

      results.push({
        testName: 'User Profile Access',
        status: !error ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        error: error?.message,
        details: { hasProfile: !!profile },
        dataValidation: {
          isLiveData: true,
          dataSource: 'user_profiles table'
        }
      });
    } catch (error) {
      results.push({
        testName: 'User Profile Access',
        status: 'failed',
        duration: 0,
        error: String(error)
      });
    }

    return results;
  }

  private async runBlueprintIntegrationTests(): Promise<GrowthProgramTestResult[]> {
    const results: GrowthProgramTestResult[] = [];

    // Test 1: Blueprint Data Retrieval
    try {
      const startTime = Date.now();
      const { data: blueprint, error } = await supabase
        .from('user_blueprints')
        .select('*')
        .eq('user_id', this.testUserId!)
        .eq('is_active', true)
        .maybeSingle();

      results.push({
        testName: 'Blueprint Data Retrieval',
        status: !error && blueprint ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        error: error?.message,
        details: { 
          hasBlueprint: !!blueprint,
          blueprintId: blueprint?.id,
          hasBlueprintData: !!blueprint?.blueprint
        },
        dataValidation: {
          isLiveData: true,
          dataSource: 'user_blueprints table',
          recordCount: blueprint ? 1 : 0
        }
      });

      // Test 2: Blueprint Parameter Extraction
      if (blueprint) {
        try {
          const extractStartTime = Date.now();
          const testBlueprint = blueprint.blueprint as unknown as LayeredBlueprint;
          
          // Test the actual extraction logic
          const mbtiType = testBlueprint?.cognitiveTemperamental?.mbtiType;
          const hdType = testBlueprint?.energyDecisionStrategy?.humanDesignType;
          const lifePath = testBlueprint?.coreValuesNarrative?.lifePath;

          results.push({
            testName: 'Blueprint Parameter Extraction',
            status: (mbtiType && hdType && lifePath) ? 'passed' : 'failed',
            duration: Date.now() - extractStartTime,
            details: {
              extractedParams: { mbtiType, hdType, lifePath },
              hasRequiredData: !!(mbtiType && hdType && lifePath)
            },
            dataValidation: {
              isLiveData: true,
              dataSource: 'blueprint.blueprint field'
            }
          });
        } catch (extractError) {
          results.push({
            testName: 'Blueprint Parameter Extraction',
            status: 'failed',
            duration: 0,
            error: String(extractError)
          });
        }
      }
    } catch (error) {
      results.push({
        testName: 'Blueprint Data Retrieval',
        status: 'failed',
        duration: 0,
        error: String(error)
      });
    }

    return results;
  }

  private async runProgramLifecycleTests(): Promise<GrowthProgramTestResult[]> {
    const results: GrowthProgramTestResult[] = [];

    // Test 1: Program Creation with Live Blueprint Data
    try {
      const startTime = Date.now();
      
      // Get real blueprint data
      const { data: blueprintRecord } = await supabase
        .from('user_blueprints')
        .select('blueprint')
        .eq('user_id', this.testUserId!)
        .eq('is_active', true)
        .single();

      if (!blueprintRecord?.blueprint) {
        throw new Error('No blueprint data found for user');
      }

      const blueprint = blueprintRecord.blueprint as unknown as LayeredBlueprint;
      const domain: LifeDomain = 'career';
      
      const program = await growthProgramService.createProgram(
        this.testUserId!,
        domain,
        blueprint
      );

      this.testProgramId = program.id;

      results.push({
        testName: 'Program Creation with Live Blueprint Data',
        status: 'passed',
        duration: Date.now() - startTime,
        details: {
          programId: program.id,
          programType: program.program_type,
          domain: program.domain,
          totalWeeks: program.total_weeks,
          blueprintParams: program.blueprint_params
        },
        dataValidation: {
          isLiveData: true,
          dataSource: 'real blueprint + growth_programs table'
        }
      });
    } catch (error) {
      results.push({
        testName: 'Program Creation with Live Blueprint Data',
        status: 'failed',
        duration: 0,
        error: String(error)
      });
    }

    // Test 2: Program State Management
    if (this.testProgramId) {
      try {
        const startTime = Date.now();
        
        // Test program activation
        await growthProgramService.updateProgramProgress(this.testProgramId, {
          status: 'active',
          current_week: 2
        });

        // Verify update
        const program = await growthProgramService.getCurrentProgram(this.testUserId!);
        
        results.push({
          testName: 'Program State Management',
          status: (program?.status === 'active' && program?.current_week === 2) ? 'passed' : 'failed',
          duration: Date.now() - startTime,
          details: {
            updatedStatus: program?.status,
            updatedWeek: program?.current_week
          },
          dataValidation: {
            isLiveData: true,
            dataSource: 'growth_programs table updates'
          }
        });
      } catch (error) {
        results.push({
          testName: 'Program State Management',
          status: 'failed',
          duration: 0,
          error: String(error)
        });
      }
    }

    return results;
  }

  private async runConversationFlowTests(): Promise<GrowthProgramTestResult[]> {
    const results: GrowthProgramTestResult[] = [];

    // Test 1: AI Coach Integration with Growth Program Context
    try {
      const startTime = Date.now();
      
      const response = await enhancedAICoachService.sendMessage(
        `I'm starting week 2 of my growth program focused on career. Can you help me explore my beliefs about success?`,
        this.testSessionId,
        true, // Use blueprint personalization
        'guide',
        'en'
      );

      results.push({
        testName: 'AI Coach Integration with Growth Program Context',
        status: response.response ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        details: {
          responseLength: response.response?.length || 0,
          conversationId: response.conversationId,
          contextAware: response.response?.includes('career') || response.response?.includes('belief')
        },
        dataValidation: {
          isLiveData: true,
          dataSource: 'enhanced-ai-coach-service + real conversation'
        }
      });
    } catch (error) {
      results.push({
        testName: 'AI Coach Integration with Growth Program Context',
        status: 'failed',
        duration: 0,
        error: String(error)
      });
    }

    // Test 2: Memory Service Integration
    try {
      const startTime = Date.now();
      
      // Save a program-related memory with a valid memory type
      const memory = await memoryService.saveMemory({
        user_id: this.testUserId!,
        session_id: this.testSessionId,
        memory_type: 'interaction', // Using valid type from the schema
        memory_data: {
          program_week: 2,
          domain: 'career',
          insight: 'Discovered limiting belief about needing to be perfect at work',
          excitement_level: 7,
          context: 'growth_program'
        },
        context_summary: 'Growth program week 2 belief exploration',
        importance_score: 8
      });

      results.push({
        testName: 'Memory Service Integration',
        status: memory ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        details: {
          memoryId: memory?.id,
          memoryType: memory?.memory_type
        },
        dataValidation: {
          isLiveData: true,
          dataSource: 'user_session_memory table'
        }
      });
    } catch (error) {
      results.push({
        testName: 'Memory Service Integration',
        status: 'failed',
        duration: 0,
        error: String(error)
      });
    }

    return results;
  }

  private async runProgressTrackingTests(): Promise<GrowthProgramTestResult[]> {
    const results: GrowthProgramTestResult[] = [];

    // Test 1: Progress Metrics Update
    if (this.testProgramId) {
      try {
        const startTime = Date.now();
        
        // Update progress metrics
        const currentProgram = await growthProgramService.getCurrentProgram(this.testUserId!);
        if (currentProgram) {
          const updatedMetrics = {
            ...currentProgram.progress_metrics,
            completed_sessions: currentProgram.progress_metrics.completed_sessions + 1,
            insight_entries: currentProgram.progress_metrics.insight_entries + 1,
            excitement_ratings: [...currentProgram.progress_metrics.excitement_ratings, 7]
          };

          await growthProgramService.updateProgramProgress(this.testProgramId, {
            progress_metrics: updatedMetrics
          });

          // Verify update
          const updatedProgram = await growthProgramService.getCurrentProgram(this.testUserId!);
          
          results.push({
            testName: 'Progress Metrics Update',
            status: (updatedProgram?.progress_metrics.completed_sessions === updatedMetrics.completed_sessions) ? 'passed' : 'failed',
            duration: Date.now() - startTime,
            details: {
              originalSessions: currentProgram.progress_metrics.completed_sessions,
              updatedSessions: updatedProgram?.progress_metrics.completed_sessions,
              excitementRatings: updatedProgram?.progress_metrics.excitement_ratings
            },
            dataValidation: {
              isLiveData: true,
              dataSource: 'growth_programs.progress_metrics updates'
            }
          });
        }
      } catch (error) {
        results.push({
          testName: 'Progress Metrics Update',
          status: 'failed',
          duration: 0,
          error: String(error)
        });
      }
    }

    // Test 2: Cross-Domain Data Integration
    try {
      const startTime = Date.now();
      
      // Test journey tracking integration
      const { data: growthJourney, error } = await supabase
        .from('growth_journey')
        .select('*')
        .eq('user_id', this.testUserId!)
        .maybeSingle();

      if (!growthJourney && !error) {
        // Create growth journey record if it doesn't exist
        const { data: newJourney, error: createError } = await supabase
          .from('growth_journey')
          .insert({
            user_id: this.testUserId!,
            current_position: 'week_2_belief_exploration',
            mood_entries: [{ mood: 'curious', energy: 'high', timestamp: new Date().toISOString() }]
          })
          .select()
          .single();

        results.push({
          testName: 'Cross-Domain Data Integration',
          status: !createError ? 'passed' : 'failed',
          duration: Date.now() - startTime,
          error: createError?.message,
          details: {
            journeyId: newJourney?.id,
            currentPosition: newJourney?.current_position
          },
          dataValidation: {
            isLiveData: true,
            dataSource: 'growth_journey table integration'
          }
        });
      } else {
        results.push({
          testName: 'Cross-Domain Data Integration',
          status: !error ? 'passed' : 'failed',
          duration: Date.now() - startTime,
          error: error?.message,
          details: {
            existingJourney: !!growthJourney,
            journeyPosition: growthJourney?.current_position
          },
          dataValidation: {
            isLiveData: true,
            dataSource: 'growth_journey table'
          }
        });
      }
    } catch (error) {
      results.push({
        testName: 'Cross-Domain Data Integration',
        status: 'failed',
        duration: 0,
        error: String(error)
      });
    }

    return results;
  }

  private async runSystemIntegrationTests(): Promise<GrowthProgramTestResult[]> {
    const results: GrowthProgramTestResult[] = [];

    // Test 1: End-to-End Program Week Completion
    if (this.testProgramId) {
      try {
        const startTime = Date.now();
        
        // Simulate completing a week
        const program = await growthProgramService.getCurrentProgram(this.testUserId!);
        if (program) {
          const weeks = await growthProgramService.generateWeeklyProgram(program);
          const currentWeek = weeks.find(w => w.week_number === program.current_week);
          
          if (currentWeek) {
            // Mark week as completed and advance
            await growthProgramService.updateProgramProgress(this.testProgramId, {
              current_week: program.current_week + 1,
              progress_metrics: {
                ...program.progress_metrics,
                completed_sessions: program.progress_metrics.completed_sessions + 3,
                domain_progress_score: program.progress_metrics.domain_progress_score + 15
              }
            });

            // Verify progression
            const updatedProgram = await growthProgramService.getCurrentProgram(this.testUserId!);
            
            results.push({
              testName: 'End-to-End Program Week Completion',
              status: (updatedProgram?.current_week === program.current_week + 1) ? 'passed' : 'failed',
              duration: Date.now() - startTime,
              details: {
                originalWeek: program.current_week,
                updatedWeek: updatedProgram?.current_week,
                progressScore: updatedProgram?.progress_metrics.domain_progress_score
              },
              dataValidation: {
                isLiveData: true,
                dataSource: 'complete program flow with real state updates'
              }
            });
          }
        }
      } catch (error) {
        results.push({
          testName: 'End-to-End Program Week Completion',
          status: 'failed',
          duration: 0,
          error: String(error)
        });
      }
    }

    // Test 2: Multi-Service Data Consistency
    try {
      const startTime = Date.now();
      
      // Check data consistency across services
      const [program, memories, conversations] = await Promise.all([
        growthProgramService.getCurrentProgram(this.testUserId!),
        memoryService.getRecentMemories(5),
        supabase.from('conversation_memory')
          .select('*')
          .eq('user_id', this.testUserId!)
          .limit(5)
      ]);

      const hasConsistentData = !!(
        program && 
        memories.length > 0 && 
        conversations.data && 
        conversations.data.length > 0
      );

      results.push({
        testName: 'Multi-Service Data Consistency',
        status: hasConsistentData ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        details: {
          programExists: !!program,
          memoriesCount: memories.length,
          conversationsCount: conversations.data?.length || 0,
          dataConsistent: hasConsistentData
        },
        dataValidation: {
          isLiveData: true,
          dataSource: 'cross-service data verification'
        }
      });
    } catch (error) {
      results.push({
        testName: 'Multi-Service Data Consistency',
        status: 'failed',
        duration: 0,
        error: String(error)
      });
    }

    return results;
  }
}

export const growthProgramTestSuite = new GrowthProgramTestRunner();
