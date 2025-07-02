import { supabase } from "@/integrations/supabase/client";
import { growthProgramService } from "./growth-program-service";
import { programAwareCoachService } from "./program-aware-coach-service";
import { enhancedAICoachService } from "./enhanced-ai-coach-service";
import { memoryService } from "./memory-service";
import { memoryInformedConversationService } from "./memory-informed-conversation-service";
import { enhancedMemoryService } from "./enhanced-memory-service";
import { LayeredBlueprint } from "@/types/personality-modules";
import { GrowthProgram, LifeDomain, ProgramWeek } from "@/types/growth-program";

export interface GrowthModeTestResult {
  testName: string;
  category: 'program' | 'coach' | 'memory' | 'conversation' | 'integration' | 'ui';
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  details?: any;
  dataValidation?: {
    isLiveData: boolean;
    dataSource: string;
    recordCount?: number;
  };
  performanceMetrics?: {
    responseTime: number;
    memoryUsage?: number;
    apiCalls: number;
  };
}

export interface GrowthModeTestSuiteResult {
  suiteName: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  results: GrowthModeTestResult[];
  categoryBreakdown: Record<string, { passed: number; total: number }>;
  integrationStatus: 'healthy' | 'degraded' | 'failed';
}

class GrowthModeComprehensiveTestSuite {
  private testUserId: string | null = null;
  private testSessionId: string = `growth-mode-test-${Date.now()}`;
  private testProgramId: string | null = null;
  private programAwareCoach = programAwareCoachService;

  private mockBlueprint: LayeredBlueprint = {
    cognitiveTemperamental: {
      mbtiType: 'ENFP',
      functions: ['Ne', 'Fi', 'Te', 'Si'],
      dominantFunction: 'Ne',
      auxiliaryFunction: 'Fi',
      cognitiveStack: ['Ne', 'Fi', 'Te', 'Si'],
      taskApproach: 'flexible',
      communicationStyle: 'enthusiastic',
      decisionMaking: 'value-based',
      informationProcessing: 'perceiving',
      coreKeywords: ['creative', 'flexible', 'enthusiastic']
    },
    energyDecisionStrategy: {
      humanDesignType: 'Projector',
      authority: 'Splenic',
      decisionStyle: 'intuitive',
      pacing: 'adaptive',
      energyType: 'non-sacral',
      strategy: 'wait_for_invitation',
      profile: '2/4',
      centers: ['Spleen', 'G-Center'],
      gates: ['32', '57'],
      channels: ['32-54']
    },
    motivationBeliefEngine: {
      coreBeliefs: ['I am creative', 'Growth is possible'],
      motivationalDrivers: ['creativity', 'authenticity', 'growth'],
      beliefPatterns: ['emotional_awareness'],
      motivationTriggers: ['self-expression', 'helping others'],
      resistancePoints: ['perfectionism', 'self_doubt'],
      empowermentSources: ['creative_projects']
    },
    coreValuesNarrative: {
      lifePath: 3,
      lifePathKeyword: 'creative_expression',
      expressionNumber: 11,
      expressionKeyword: 'spiritual_insight',
      soulUrgeNumber: 8,
      soulUrgeKeyword: 'material_success',
      meaningfulAreas: ['creativity', 'spirituality', 'career'],
      anchoringVision: 'creative_fulfillment',
      lifeThemes: ['self_expression', 'spiritual_growth'],
      valueSystem: 'authenticity_based',
      northStar: 'creative_contribution',
      missionStatement: 'Express creativity authentically',
      purposeAlignment: 'high',
      core_values: ['creativity', 'authenticity', 'growth']
    },
    publicArchetype: {
      sunSign: 'Aquarius',
      moonSign: 'Pisces',
      risingSign: 'Gemini',
      socialStyle: 'innovative',
      publicVibe: 'inspiring',
      publicPersona: 'visionary',
      leadershipStyle: 'collaborative',
      socialMask: 'friendly_innovator',
      externalExpression: 'creative_authenticity'
    },
    generationalCode: {
      chineseZodiac: 'Horse',
      element: 'Earth',
      cohortTint: 'practical_idealism',
      generationalThemes: ['technology', 'authenticity'],
      collectiveInfluence: 'balanced_innovation'
    },
    surfaceExpression: {
      observableStyle: 'creative_authentic',
      realWorldImpact: 'inspiring_others',
      behavioralSignatures: ['enthusiasm', 'creativity', 'authenticity'],
      externalManifestations: ['creative_projects', 'helping_others']
    },
    marketingArchetype: {
      messagingStyle: 'inspiring',
      socialHooks: ['creativity', 'authenticity', 'growth'],
      brandPersonality: 'creative_guide',
      communicationPatterns: ['storytelling', 'inspiration'],
      influenceStyle: 'authentic_inspiration'
    },
    goalPersona: {
      currentMode: 'coach',
      serviceRole: 'creative_guide',
      coachingTone: 'supportive',
      nudgeStyle: 'gentle_encouragement',
      motivationApproach: 'intrinsic_motivation'
    },
    interactionPreferences: {
      rapportStyle: 'warm_authentic',
      storyPreference: 'metaphorical',
      empathyLevel: 'high',
      conflictStyle: 'collaborative',
      collaborationStyle: 'co_creative',
      feedbackStyle: 'constructive',
      learningStyle: 'experiential'
    },
    timingOverlays: {
      currentTransits: ['creativity_focus'],
      seasonalInfluences: ['spring_energy'],
      cyclicalPatterns: ['creative_cycles'],
      optimalTimings: ['morning_creativity'],
      energyWeather: 'high_creative_energy'
    },
    proactiveContext: {
      nudgeHistory: [],
      taskGraph: {},
      streaks: {},
      moodLog: [],
      recentPatterns: [],
      triggerEvents: []
    },
    user_meta: {
      preferred_name: 'TestUser',
      full_name: 'Test User'
    },
    humorProfile: {
      primaryStyle: 'playful-storyteller',
      intensity: 'moderate',
      appropriatenessLevel: 'balanced',
      contextualAdaptation: {
        coaching: 'warm-nurturer',
        guidance: 'philosophical-sage',
        casual: 'spontaneous-entertainer'
      },
      avoidancePatterns: ['sarcasm', 'dark_humor'],
      signatureElements: ['wordplay', 'gentle_teasing']
    },
    voiceTokens: {
      pacing: {
        sentenceLength: 'medium',
        pauseFrequency: 'thoughtful',
        rhythmPattern: 'varied'
      },
      expressiveness: {
        emojiFrequency: 'occasional',
        emphasisStyle: 'italic',
        exclamationTendency: 'balanced'
      },
      vocabulary: {
        formalityLevel: 'conversational',
        metaphorUsage: 'frequent',
        technicalDepth: 'balanced'
      },
      conversationStyle: {
        questionAsking: 'exploratory',
        responseLength: 'thorough',
        personalSharing: 'warm'
      },
      signaturePhrases: ['Let\'s explore this together', 'What feels true for you?'],
      greetingStyles: ['Warm and welcoming', 'Curious and inviting'],
      transitionWords: ['So', 'Now', 'Let\'s see']
    }
  };

  async runFullTestSuite(): Promise<GrowthModeTestSuiteResult> {
    const startTime = Date.now();
    console.log('🧪 Starting Growth Mode Comprehensive Test Suite...');

    try {
      await this.setupTestEnvironment();

      const [
        programTests,
        coachTests,
        memoryTests,
        conversationTests,
        integrationTests,
        uiTests,
        performanceTests
      ] = await Promise.all([
        this.runProgramLifecycleTests(),
        this.runCoachIntelligenceTests(),
        this.runMemorySystemTests(),
        this.runConversationFlowTests(),
        this.runSystemIntegrationTests(),
        this.runUIInteractionTests(),
        this.runPerformanceTests()
      ]);

      const allResults = [
        ...programTests,
        ...coachTests,
        ...memoryTests,
        ...conversationTests,
        ...integrationTests,
        ...uiTests,
        ...performanceTests
      ];

      const categoryBreakdown = this.calculateCategoryBreakdown(allResults);
      const passed = allResults.filter(r => r.status === 'passed').length;
      const failed = allResults.filter(r => r.status === 'failed').length;
      const skipped = allResults.filter(r => r.status === 'skipped').length;

      const integrationStatus = failed === 0 ? 'healthy' : failed < allResults.length / 2 ? 'degraded' : 'failed';

      return {
        suiteName: 'Growth Mode Comprehensive Test Suite',
        totalTests: allResults.length,
        passed,
        failed,
        skipped,
        duration: Date.now() - startTime,
        results: allResults,
        categoryBreakdown,
        integrationStatus
      };
    } catch (error) {
      console.error('❌ Growth Mode test suite execution failed:', error);
      return {
        suiteName: 'Growth Mode Comprehensive Test Suite',
        totalTests: 0,
        passed: 0,
        failed: 1,
        skipped: 0,
        duration: Date.now() - startTime,
        results: [{
          testName: 'Test Suite Execution',
          category: 'integration',
          status: 'failed',
          duration: Date.now() - startTime,
          error: String(error)
        }],
        categoryBreakdown: {},
        integrationStatus: 'failed'
      };
    }
  }

  private async setupTestEnvironment(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      this.testUserId = user.id;
      await enhancedAICoachService.setCurrentUser(user.id);
      await programAwareCoachService.initializeForUser(user.id);
    } else {
      throw new Error('No authenticated user found for testing');
    }
  }

  private async runProgramLifecycleTests(): Promise<GrowthModeTestResult[]> {
    const results: GrowthModeTestResult[] = [];

    // Test 1: Program Creation with Blueprint Integration
    try {
      const startTime = Date.now();
      const program = await growthProgramService.createProgram(
        this.testUserId!,
        'career' as LifeDomain,
        this.mockBlueprint
      );
      
      this.testProgramId = program.id;
      
      results.push({
        testName: 'Program Creation with Blueprint',
        category: 'program',
        status: program ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        details: { programId: program.id, domain: program.domain },
        dataValidation: { isLiveData: true, dataSource: 'growth_programs table' }
      });
    } catch (error) {
      results.push({
        testName: 'Program Creation with Blueprint',
        category: 'program',
        status: 'failed',
        duration: 0,
        error: String(error)
      });
    }

    // Test 2: Weekly Program Generation
    try {
      const startTime = Date.now();
      if (this.testProgramId) {
        const program = await growthProgramService.getCurrentProgram(this.testUserId!);
        const weeks = await growthProgramService.generateWeeklyProgram(program!);
        
        results.push({
          testName: 'Weekly Program Generation',
          category: 'program',
          status: weeks.length > 0 ? 'passed' : 'failed',
          duration: Date.now() - startTime,
          details: { weekCount: weeks.length, themes: weeks.map(w => w.theme) },
          dataValidation: { isLiveData: true, dataSource: 'generated program structure' }
        });
      }
    } catch (error) {
      results.push({
        testName: 'Weekly Program Generation',
        category: 'program',
        status: 'failed',
        duration: 0,
        error: String(error)
      });
    }

    // Test 3: Program Progress Tracking
    try {
      const startTime = Date.now();
      if (this.testProgramId) {
        await growthProgramService.updateProgramProgress(this.testProgramId, {
          current_week: 2,
          status: 'active'
        });
        
        // Verify the update was successful
        const updatedProgram = await growthProgramService.getCurrentProgram(this.testUserId!);
        const updateSuccess = updatedProgram && updatedProgram.current_week === 2;
        
        results.push({
          testName: 'Program Progress Tracking',
          category: 'program',
          status: updateSuccess ? 'passed' : 'failed',
          duration: Date.now() - startTime,
          dataValidation: { isLiveData: true, dataSource: 'growth_programs table' }
        });
      }
    } catch (error) {
      results.push({
        testName: 'Program Progress Tracking',
        category: 'program',
        status: 'failed',
        duration: 0,
        error: String(error)
      });
    }

    return results;
  }

  private async runCoachIntelligenceTests(): Promise<GrowthModeTestResult[]> {
    const results: GrowthModeTestResult[] = [];

    // Test 1: Coach Context Awareness
    try {
      const startTime = Date.now();
      const context = programAwareCoachService.getCurrentContext();
      
      results.push({
        testName: 'Coach Context Awareness',
        category: 'coach',
        status: context.hasContext ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        details: { hasProgram: !!context.program, hasWeek: !!context.week, stage: context.stage }
      });
    } catch (error) {
      results.push({
        testName: 'Coach Context Awareness',
        category: 'coach',
        status: 'failed',
        duration: 0,
        error: String(error)
      });
    }

    // Test 2: Adaptive Message Generation
    try {
      const startTime = Date.now();
      const response = await programAwareCoachService.sendProgramAwareMessage(
        "I'm feeling uncertain about starting this program",
        this.testSessionId
      );
      
      // Check if response is adaptive (not information dumping)
      const isAdaptive = response.response.length < 500 && 
                        response.response.includes('?') && 
                        !response.response.includes('IMPORTANT GUIDANCE PRINCIPLES');
      
      results.push({
        testName: 'Adaptive Message Generation',
        category: 'coach',
        status: isAdaptive ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        details: { 
          responseLength: response.response.length, 
          hasQuestion: response.response.includes('?'),
          isNonPrescriptive: !response.response.includes('IMPORTANT')
        },
        performanceMetrics: { responseTime: Date.now() - startTime, apiCalls: 1 }
      });
    } catch (error) {
      results.push({
        testName: 'Adaptive Message Generation',
        category: 'coach',
        status: 'failed',
        duration: 0,
        error: String(error)
      });
    }

    // Test 3: Readiness Detection - Fix Promise handling
    try {
      const startTime = Date.now();
      const prompts = await programAwareCoachService.getReadinessPrompts();
      
      results.push({
        testName: 'Readiness Detection',
        category: 'coach',
        status: prompts.length > 0 ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        details: { promptCount: prompts.length, prompts: prompts.slice(0, 2) }
      });
    } catch (error) {
      results.push({
        testName: 'Readiness Detection',
        category: 'coach',
        status: 'failed',
        duration: 0,
        error: String(error)
      });
    }

    // Test 4: Conversation Stage Management
    try {
      const startTime = Date.now();
      programAwareCoachService.updateConversationStage("I don't know what I want");
      const context = programAwareCoachService.getCurrentContext();
      
      results.push({
        testName: 'Conversation Stage Management',
        category: 'coach',
        status: context.stage === 'domain_exploration' ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        details: { stage: context.stage }
      });
    } catch (error) {
      results.push({
        testName: 'Conversation Stage Management',
        category: 'coach',
        status: 'failed',
        duration: 0,
        error: String(error)
      });
    }

    return results;
  }

  private async runMemorySystemTests(): Promise<GrowthModeTestResult[]> {
    const results: GrowthModeTestResult[] = [];

    // Test 1: Growth Journey Memory Storage
    try {
      const startTime = Date.now();
      const memory = await memoryService.saveMemory({
        user_id: this.testUserId!,
        session_id: this.testSessionId,
        memory_type: 'interaction',
        memory_data: {
          growth_domain: 'career',
          week: 1,
          insight: 'Starting to understand my career beliefs',
          emotional_state: 'curious but uncertain'
        },
        context_summary: 'Growth program week 1 reflection',
        importance_score: 8
      });
      
      results.push({
        testName: 'Growth Journey Memory Storage',
        category: 'memory',
        status: memory ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        details: { memoryId: memory?.id },
        dataValidation: { isLiveData: true, dataSource: 'session_memories table' }
      });
    } catch (error) {
      results.push({
        testName: 'Growth Journey Memory Storage',
        category: 'memory',
        status: 'failed',
        duration: 0,
        error: String(error)
      });
    }

    // Test 2: Progressive Memory Search
    try {
      const startTime = Date.now();
      const searchResult = await enhancedMemoryService.performProgressiveSearch(
        'career growth beliefs uncertainty',
        5
      );
      
      results.push({
        testName: 'Progressive Memory Search',
        category: 'memory',
        status: 'passed',
        duration: Date.now() - startTime,
        details: { 
          matchCount: searchResult.matchCount, 
          strategy: searchResult.searchStrategy 
        },
        performanceMetrics: { responseTime: Date.now() - startTime, apiCalls: 1 }
      });
    } catch (error) {
      results.push({
        testName: 'Progressive Memory Search',
        category: 'memory',
        status: 'failed',
        duration: 0,
        error: String(error)
      });
    }

    // Test 3: Cross-Session Context Building
    try {
      const startTime = Date.now();
      const crossSessionMemories = await memoryInformedConversationService.getCrossSessionContext(
        this.testUserId!,
        this.testSessionId,
        5
      );
      
      results.push({
        testName: 'Cross-Session Context Building',
        category: 'memory',
        status: 'passed',
        duration: Date.now() - startTime,
        details: { crossSessionCount: crossSessionMemories.length }
      });
    } catch (error) {
      results.push({
        testName: 'Cross-Session Context Building',
        category: 'memory',
        status: 'failed',
        duration: 0,
        error: String(error)
      });
    }

    return results;
  }

  private async runConversationFlowTests(): Promise<GrowthModeTestResult[]> {
    const results: GrowthModeTestResult[] = [];

    // Test 1: Memory-Informed Conversation
    try {
      const startTime = Date.now();
      const memoryContext = await memoryInformedConversationService.buildMemoryContext(
        "I'm struggling with career direction",
        this.testSessionId,
        this.testUserId!
      );
      
      results.push({
        testName: 'Memory-Informed Conversation',
        category: 'conversation',
        status: 'passed',
        duration: Date.now() - startTime,
        details: { 
          relevantMemories: memoryContext.relevantMemories.length
        }
      });
    } catch (error) {
      results.push({
        testName: 'Memory-Informed Conversation',
        category: 'conversation',
        status: 'failed',
        duration: 0,
        error: String(error)
      });
    }

    // Test 2: Enhanced AI Coach Integration
    try {
      const startTime = Date.now();
      const response = await enhancedAICoachService.sendMessage(
        "Help me understand my career growth challenges",
        this.testSessionId,
        true,
        'guide',
        'en'
      );
      
      const hasPersonalizedResponse = response.response.length > 50 && 
                                     !response.response.includes('I apologize');
      
      results.push({
        testName: 'Enhanced AI Coach Integration',
        category: 'conversation',
        status: hasPersonalizedResponse ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        details: { responseLength: response.response.length },
        performanceMetrics: { responseTime: Date.now() - startTime, apiCalls: 1 }
      });
    } catch (error) {
      results.push({
        testName: 'Enhanced AI Coach Integration',
        category: 'conversation',
        status: 'failed',
        duration: 0,
        error: String(error)
      });
    }

    return results;
  }

  private async runSystemIntegrationTests(): Promise<GrowthModeTestResult[]> {
    const results: GrowthModeTestResult[] = [];

    // Test 1: Blueprint-Program-Coach Integration
    try {
      const startTime = Date.now();
      
      // Check if coach is aware of blueprint and program
      const context = programAwareCoachService.getCurrentContext();
      const hasFullIntegration = context.hasContext && context.program && context.week;
      
      results.push({
        testName: 'Blueprint-Program-Coach Integration',
        category: 'integration',
        status: hasFullIntegration ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        details: { 
          hasProgram: !!context.program,
          hasWeek: !!context.week,
          hasContext: context.hasContext
        }
      });
    } catch (error) {
      results.push({
        testName: 'Blueprint-Program-Coach Integration',
        category: 'integration',
        status: 'failed',
        duration: 0,
        error: String(error)
      });
    }

    // Test 2: End-to-End Growth Flow
    try {
      const startTime = Date.now();
      
      // Simulate complete flow: message -> memory -> AI response -> storage
      const userMessage = "I need guidance on my career week 2";
      const response = await programAwareCoachService.sendProgramAwareMessage(
        userMessage,
        this.testSessionId
      );
      
      // Check if response is contextual
      const isContextual = response.response.includes('week') || 
                          response.response.includes('career') ||
                          response.response.includes('program');
      
      results.push({
        testName: 'End-to-End Growth Flow',
        category: 'integration',
        status: isContextual ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        details: { hasContext: isContextual },
        performanceMetrics: { responseTime: Date.now() - startTime, apiCalls: 2 }
      });
    } catch (error) {
      results.push({
        testName: 'End-to-End Growth Flow',
        category: 'integration',
        status: 'failed',
        duration: 0,
        error: String(error)
      });
    }

    return results;
  }

  private async runUIInteractionTests(): Promise<GrowthModeTestResult[]> {
    const results: GrowthModeTestResult[] = [];

    // Test 1: Program Interface State Management
    try {
      const startTime = Date.now();
      
      // Test if we can retrieve current program for UI
      const currentProgram = await growthProgramService.getCurrentProgram(this.testUserId!);
      const hasValidUIState = currentProgram && currentProgram.id && currentProgram.domain;
      
      results.push({
        testName: 'Program Interface State Management',
        category: 'ui',
        status: hasValidUIState ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        details: { 
          hasProgram: !!currentProgram,
          programId: currentProgram?.id,
          domain: currentProgram?.domain
        }
      });
    } catch (error) {
      results.push({
        testName: 'Program Interface State Management',
        category: 'ui',
        status: 'failed',
        duration: 0,
        error: String(error)
      });
    }

    // Test 2: Coach Interface Responsiveness
    try {
      const startTime = Date.now();
      
      // Test coach response time for UI
      const quickResponse = await programAwareCoachService.sendProgramAwareMessage(
        "Quick test",
        this.testSessionId
      );
      
      const isResponsive = (Date.now() - startTime) < 3000; // Under 3 seconds
      
      results.push({
        testName: 'Coach Interface Responsiveness',
        category: 'ui',
        status: isResponsive ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        performanceMetrics: { responseTime: Date.now() - startTime, apiCalls: 1 }
      });
    } catch (error) {
      results.push({
        testName: 'Coach Interface Responsiveness',
        category: 'ui',
        status: 'failed',
        duration: 0,
        error: String(error)
      });
    }

    return results;
  }

  private async runPerformanceTests(): Promise<GrowthModeTestResult[]> {
    const results: GrowthModeTestResult[] = [];

    // Test 1: Concurrent Operations Performance
    try {
      const startTime = Date.now();
      
      const promises = [
        programAwareCoachService.sendProgramAwareMessage("Test 1", this.testSessionId),
        memoryService.getRecentMemories(5),
        growthProgramService.getCurrentProgram(this.testUserId!)
      ];
      
      await Promise.all(promises);
      const duration = Date.now() - startTime;
      
      results.push({
        testName: 'Concurrent Operations Performance',
        category: 'integration',
        status: duration < 5000 ? 'passed' : 'failed',
        duration,
        performanceMetrics: { responseTime: duration, apiCalls: 3 }
      });
    } catch (error) {
      results.push({
        testName: 'Concurrent Operations Performance',
        category: 'integration',
        status: 'failed',
        duration: 0,
        error: String(error)
      });
    }

    // Test 2: Memory Load Testing
    try {
      const startTime = Date.now();
      
      // Create multiple memories quickly
      const memoryPromises = Array.from({ length: 5 }, (_, i) => 
        memoryService.saveMemory({
          user_id: this.testUserId!,
          session_id: this.testSessionId,
          memory_type: 'interaction',
          memory_data: { test_memory: i, content: `Performance test memory ${i}` },
          context_summary: `Performance test ${i}`,
          importance_score: 5
        })
      );
      
      const memories = await Promise.all(memoryPromises);
      const successCount = memories.filter(m => m !== null).length;
      
      results.push({
        testName: 'Memory Load Testing',
        category: 'memory',
        status: successCount === 5 ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        details: { successCount, totalOperations: 5 },
        performanceMetrics: { responseTime: Date.now() - startTime, apiCalls: 5 }
      });
    } catch (error) {
      results.push({
        testName: 'Memory Load Testing',
        category: 'memory',
        status: 'failed',
        duration: 0,
        error: String(error)
      });
    }

    return results;
  }

  private calculateCategoryBreakdown(results: GrowthModeTestResult[]): Record<string, { passed: number; total: number }> {
    const breakdown: Record<string, { passed: number; total: number }> = {};
    
    results.forEach(result => {
      if (!breakdown[result.category]) {
        breakdown[result.category] = { passed: 0, total: 0 };
      }
      breakdown[result.category].total++;
      if (result.status === 'passed') {
        breakdown[result.category].passed++;
      }
    });
    
    return breakdown;
  }

  private async createTestBlueprint(): Promise<LayeredBlueprint> {
    return {
      cognitiveTemperamental: {
        mbtiType: 'ENFP',
        functions: ['Ne', 'Fi', 'Te', 'Si'],
        dominantFunction: 'Ne',
        auxiliaryFunction: 'Fi',
        cognitiveStack: ['Ne', 'Fi', 'Te', 'Si'],
        taskApproach: 'flexible',
        communicationStyle: 'enthusiastic',
        decisionMaking: 'value-based',
        informationProcessing: 'perceiving',
        coreKeywords: ['creative', 'flexible', 'enthusiastic']
      },
      energyDecisionStrategy: {
        humanDesignType: 'Projector',
        authority: 'Splenic',
        decisionStyle: 'intuitive',
        pacing: 'adaptive',
        energyType: 'non-sacral',
        strategy: 'wait_for_invitation',
        profile: '2/4',
        centers: ['Spleen', 'G-Center'],
        gates: ['32', '57'],
        channels: ['32-54']
      },
      motivationBeliefEngine: {
        coreBeliefs: ['I am creative', 'Growth is possible'],
        motivationalDrivers: ['creativity', 'authenticity', 'growth'],
        beliefPatterns: ['emotional_awareness'],
        motivationTriggers: ['self-expression', 'helping others'],
        resistancePoints: ['perfectionism', 'self_doubt'],
        empowermentSources: ['creative_projects']
      },
      coreValuesNarrative: {
        lifePath: 3,
        lifePathKeyword: 'creative_expression',
        expressionNumber: 11,
        expressionKeyword: 'spiritual_insight',
        soulUrgeNumber: 8,
        soulUrgeKeyword: 'material_success',
        meaningfulAreas: ['creativity', 'spirituality', 'career'],
        anchoringVision: 'creative_fulfillment',
        lifeThemes: ['self_expression', 'spiritual_growth'],
        valueSystem: 'authenticity_based',
        northStar: 'creative_contribution',
        missionStatement: 'Express creativity authentically',
        purposeAlignment: 'high',
        core_values: ['creativity', 'authenticity', 'growth']
      },
      publicArchetype: {
        sunSign: 'Aquarius',
        moonSign: 'Pisces',
        risingSign: 'Gemini',
        socialStyle: 'innovative',
        publicVibe: 'inspiring',
        publicPersona: 'visionary',
        leadershipStyle: 'collaborative',
        socialMask: 'friendly_innovator',
        externalExpression: 'creative_authenticity'
      },
      generationalCode: {
        chineseZodiac: 'Horse',
        element: 'Earth',
        cohortTint: 'practical_idealism',
        generationalThemes: ['technology', 'authenticity'],
        collectiveInfluence: 'balanced_innovation'
      },
      surfaceExpression: {
        observableStyle: 'creative_authentic',
        realWorldImpact: 'inspiring_others',
        behavioralSignatures: ['enthusiasm', 'creativity', 'authenticity'],
        externalManifestations: ['creative_projects', 'helping_others']
      },
      marketingArchetype: {
        messagingStyle: 'inspiring',
        socialHooks: ['creativity', 'authenticity', 'growth'],
        brandPersonality: 'creative_guide',
        communicationPatterns: ['storytelling', 'inspiration'],
        influenceStyle: 'authentic_inspiration'
      },
      goalPersona: {
        currentMode: 'coach',
        serviceRole: 'creative_guide',
        coachingTone: 'supportive',
        nudgeStyle: 'gentle_encouragement',
        motivationApproach: 'intrinsic_motivation'
      },
      interactionPreferences: {
        rapportStyle: 'warm_authentic',
        storyPreference: 'metaphorical',
        empathyLevel: 'high',
        conflictStyle: 'collaborative',
        collaborationStyle: 'co_creative',
        feedbackStyle: 'constructive',
        learningStyle: 'experiential'
      },
      timingOverlays: {
        currentTransits: ['creativity_focus'],
        seasonalInfluences: ['spring_energy'],
        cyclicalPatterns: ['creative_cycles'],
        optimalTimings: ['morning_creativity'],
        energyWeather: 'high_creative_energy'
      },
      proactiveContext: {
        nudgeHistory: [],
        taskGraph: {},
        streaks: {},
        moodLog: [],
        recentPatterns: [],
        triggerEvents: []
      },
      user_meta: {
        preferred_name: 'TestUser',
        full_name: 'Test User'
      },
      humorProfile: {
        primaryStyle: 'playful-storyteller',
        intensity: 'moderate',
        appropriatenessLevel: 'balanced',
        contextualAdaptation: {
          coaching: 'warm-nurturer',
          guidance: 'philosophical-sage',
          casual: 'spontaneous-entertainer'
        },
        avoidancePatterns: ['sarcasm', 'dark_humor'],
        signatureElements: ['wordplay', 'gentle_teasing']
      },
      voiceTokens: {
        pacing: {
          sentenceLength: 'medium',
          pauseFrequency: 'thoughtful',
          rhythmPattern: 'varied'
        },
        expressiveness: {
          emojiFrequency: 'occasional',
          emphasisStyle: 'italic',
          exclamationTendency: 'balanced'
        },
        vocabulary: {
          formalityLevel: 'conversational',
          metaphorUsage: 'frequent',
          technicalDepth: 'balanced'
        },
        conversationStyle: {
          questionAsking: 'exploratory',
          responseLength: 'thorough',
          personalSharing: 'warm'
        },
        signaturePhrases: ['Let\'s explore this together', 'What feels true for you?'],
        greetingStyles: ['Warm and welcoming', 'Curious and inviting'],
        transitionWords: ['So', 'Now', 'Let\'s see']
      }
    };
  }

  async testProgramAwareInitialization(): Promise<{ success: boolean; details: any }> {
    try {
      console.log('🔄 Testing program-aware initialization...');
      
      const testUserId = 'test-user-id';
      await this.programAwareCoach.initializeForUser(testUserId);
      
      const context = this.programAwareCoach.getCurrentContext();
      
      return {
        success: context.hasContext && 
                context.program === 'spiritual-growth' && 
                context.week >= 1 && 
                context.stage === 'exploration',
        details: {
          context,
          hasContext: context.hasContext,
          program: context.program,
          week: context.week
        }
      };
    } catch (error) {
      return {
        success: false,
        details: { error: String(error) }
      };
    }
  }

  async testProgramAwareMessaging(): Promise<{ success: boolean; details: any }> {
    try {
      console.log('🔄 Testing program-aware messaging...');
      
      const response = await this.programAwareCoach.sendProgramAwareMessage(
        'How can I improve my meditation practice?',
        'test-session-id'
      );
      
      return {
        success: typeof response.response === 'string' && response.response.length > 0,
        details: {
          responseLength: response.response.length,
          hasConversationId: !!response.conversationId
        }
      };
    } catch (error) {
      return {
        success: false,
        details: { error: String(error) }
      };
    }
  }

  async testReadinessPrompts(): Promise<{ success: boolean; details: any }> {
    try {
      console.log('🔄 Testing readiness prompts...');
      
      const prompts = await this.programAwareCoach.getReadinessPrompts();
      
      return {
        success: Array.isArray(prompts) && prompts.length > 0,
        details: {
          promptCount: Array.isArray(prompts) ? prompts.length : 0,
          samplePrompt: Array.isArray(prompts) && prompts.length > 0 ? prompts[0] : null
        }
      };
    } catch (error) {
      return {
        success: false,
        details: { error: String(error) }
      };
    }
  }

  async testConversationStageUpdates(): Promise<{ success: boolean; details: any }> {
    try {
      console.log('🔄 Testing conversation stage updates...');
      
      await this.programAwareCoach.updateConversationStage('deep_work');
      const context = this.programAwareCoach.getCurrentContext();
      
      return {
        success: context.stage === 'deep_work',
        details: {
          currentStage: context.stage,
          expectedStage: 'deep_work'
        }
      };
    } catch (error) {
      return {
        success: false,
        details: { error: String(error) }
      };
    }
  }

  async testFullGrowthModeConversationFlow(): Promise<{ success: boolean; details: any }> {
    try {
      console.log('🔄 Testing full growth mode conversation flow...');
      
      // Initialize user
      const testUserId = 'test-user-growth-flow';
      await this.programAwareCoach.initializeForUser(testUserId);
      
      // Check initial context
      const initialContext = this.programAwareCoach.getCurrentContext();
      if (!initialContext.hasContext || initialContext.program !== 'spiritual-growth') {
        throw new Error('Initial context not properly set');
      }
      
      console.log('✅ Initial context validated:', {
        program: initialContext.program,
        week: initialContext.week,
        hasContext: initialContext.hasContext
      });
      
      // Test message exchange
      const response = await this.programAwareCoach.sendProgramAwareMessage(
        'I want to work on my self-awareness',
        'test-session-growth-flow'
      );
      
      if (!response.response || response.response.length === 0) {
        throw new Error('Empty response from program-aware messaging');
      }
      
      return {
        success: true,
        details: {
          initialContext,
          responseReceived: true,
          responseLength: response.response.length
        }
      };
    } catch (error) {
      return {
        success: false,
        details: { error: String(error) }
      };
    }
  }

  async testAdvancedGrowthModeInteractions(): Promise<{ success: boolean; details: any }> {
    try {
      console.log('🔄 Testing advanced growth mode interactions...');
      
      // Test multiple message exchanges
      const messages = [
        'I want to understand my limiting beliefs',
        'How can I develop better self-compassion?',
        'What practices would help me stay consistent?'
      ];
      
      const responses = [];
      for (const message of messages) {
        const response = await this.programAwareCoach.sendProgramAwareMessage(
          message,
          'test-session-advanced-growth'
        );
        responses.push(response);
      }
      
      return {
        success: responses.every(r => r.response && r.response.length > 0),
        details: {
          totalMessages: messages.length,
          successfulResponses: responses.filter(r => r.response && r.response.length > 0).length,
          averageResponseLength: responses.reduce((acc, r) => acc + (r.response?.length || 0), 0) / responses.length
        }
      };
    } catch (error) {
      return {
        success: false,
        details: { error: String(error) }
      };
    }
  }
}

export const growthModeComprehensiveTestSuite = new GrowthModeComprehensiveTestSuite();
