/**
 * Adaptive Growth Service - Main orchestrator for agent-driven growth system
 * Integrates OpenAI agents with blueprint embeddings for continuous program evolution
 */

import { openAIAgentOrchestrator } from './openai-agent-orchestrator';
import { blueprintEmbeddingService } from './blueprint-embedding-service';
import { supabase } from '@/integrations/supabase/client';
import { LayeredBlueprint } from '@/types/personality-modules';
import { LifeDomain, GrowthProgram, ProgramType, ProgramStatus, BlueprintParams, ProgressMetrics, SessionSchedule } from '@/types/growth-program';

interface FeedbackSignal {
  type: 'explicit' | 'behavioral' | 'temporal';
  action: string;
  value: any;
  confidence: number;
  timestamp: string;
  context?: any;
}

interface AdaptiveGrowthProgram extends GrowthProgram {
  adaptation_history: any[];
  feedback_signals: FeedbackSignal[];
  blueprint_alignment_score: number;
  evolution_trajectory: any;
}

export class AdaptiveGrowthService {
  // Core Growth Loop Functions
  async generateAdaptiveProgram(
    userId: string,
    domain: LifeDomain,
    blueprint: LayeredBlueprint,
    currentState?: any
  ): Promise<AdaptiveGrowthProgram> {
    console.log('🌱 Generating adaptive growth program with AI agents');

    // Check for existing active program to prevent duplicates
    const existingProgram = await this.getCurrentPrograms(userId);
    if (existingProgram.length > 0 && existingProgram.some(p => p.status === 'active' && p.domain === domain)) {
      console.log('⚠️ Active program already exists for this domain, returning existing');
      return this.getAdaptiveProgram(existingProgram[0].id) as Promise<AdaptiveGrowthProgram>;
    }

    try {
      // 1. Process blueprint into dual memory format
      await blueprintEmbeddingService.processAndStoreBlueprintMemory(userId, blueprint);

      // 2. Gather relevant context for planning
      const planningContext = await this.gatherPlanningContext(userId, domain, blueprint);

      // 3. Use agent orchestrator to generate program
      const agentResult = await openAIAgentOrchestrator.orchestrateGrowthPlan(
        userId,
        domain,
        blueprint,
        planningContext.currentState,
        planningContext.pastFeedback
      );

  // 4. Create adaptive program structure
    const adaptiveProgram: AdaptiveGrowthProgram = {
      id: crypto.randomUUID(),
      user_id: userId,
      program_type: this.determineAdaptiveProgramType(agentResult.plan) as ProgramType,
        domain,
        current_week: 1,
        total_weeks: this.extractProgramDuration(agentResult.plan),
        status: 'active',
        started_at: new Date().toISOString(),
        expected_completion: this.calculateExpectedCompletion(agentResult.plan),
        actual_completion: null,
        blueprint_params: this.extractBlueprintParams(agentResult.plan),
        progress_metrics: this.initializeProgressMetrics(),
        session_schedule: this.extractSessionSchedule(agentResult.plan),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        
        // Adaptive extensions
        adaptation_history: [{
          timestamp: new Date().toISOString(),
          reason: 'initial_generation',
          changes: 'program_created',
          agent_reasoning: agentResult.reasoning
        }],
        feedback_signals: [],
        blueprint_alignment_score: this.calculateAlignmentScore(agentResult, blueprint),
        evolution_trajectory: agentResult.plan
      };

      // 5. Store the program
      await this.storeAdaptiveProgram(adaptiveProgram);

      console.log('✅ Adaptive growth program generated successfully');
      return adaptiveProgram;

    } catch (error) {
      console.error('❌ Adaptive program generation failed:', error);
      throw error;
    }
  }

  // Continuous Adaptation Functions
  async processFeedbackAndAdapt(
    programId: string,
    userId: string,
    feedbackSignals: FeedbackSignal[]
  ): Promise<void> {
    console.log('🔄 Processing feedback signals for program adaptation');

    try {
      // 1. Load current program
      const program = await this.getAdaptiveProgram(programId);
      if (!program) throw new Error('Program not found');

      // 2. Analyze feedback signals
      const feedbackAnalysis = await this.analyzeFeedbackSignals(
        feedbackSignals,
        program.feedback_signals
      );

      // 3. Check if adaptation is needed
      if (feedbackAnalysis.adaptation_needed) {
        console.log('🎯 Adaptation triggered:', feedbackAnalysis.reason);

        // 4. Get current blueprint context
        const blueprint = await this.getUserBlueprint(userId);
        const relevantContext = await blueprintEmbeddingService.retrieveRelevantBlueprintContext(
          userId,
          feedbackAnalysis.adaptation_reason,
          5
        );

        // 5. Use agents to adapt the program
        const adaptationResult = await this.orchestrateAdaptation(
          program,
          feedbackAnalysis,
          relevantContext,
          blueprint
        );

        // 6. Apply adaptations
        await this.applyAdaptations(program, adaptationResult, feedbackSignals);

        console.log('✅ Program adapted successfully');
      } else {
        // Just store the feedback signals for future analysis
        await this.storeFeedbackSignals(programId, feedbackSignals);
        console.log('📊 Feedback signals stored, no adaptation needed');
      }

    } catch (error) {
      console.error('❌ Feedback processing failed:', error);
      throw error;
    }
  }

  // Blueprint Drift Detection
  async detectBlueprintDrift(
    userId: string,
    recentBehavior: any[]
  ): Promise<{ driftDetected: boolean; driftAreas: string[]; recommendations: string[] }> {
    console.log('🧭 Detecting blueprint drift from recent behavior');

    try {
      // 1. Get current blueprint memory
      const currentBlueprint = await this.getUserBlueprint(userId);
      const blueprintContext = await blueprintEmbeddingService.retrieveRelevantBlueprintContext(
        userId,
        'recent behavior and preference changes',
        3
      );

      // 2. Analyze behavior against blueprint
      const driftAnalysis = await openAIAgentOrchestrator.runAgent('reflector', [
        {
          role: 'user',
          content: `Analyze if recent behavior shows drift from established blueprint:
          
          Blueprint context: ${JSON.stringify(blueprintContext.structured_context, null, 2)}
          Recent behavior: ${JSON.stringify(recentBehavior, null, 2)}
          
          Identify:
          1. Areas of divergence from natural patterns
          2. Possible evolution vs temporary deviation
          3. Recommendations for gentle realignment`
        }
      ]);

      // 3. Parse analysis results
      const parsed = this.parseDriftAnalysis(driftAnalysis);

      if (parsed.driftDetected) {
        console.log('⚠️ Blueprint drift detected in areas:', parsed.driftAreas);
        
        // 4. Generate gentle realignment suggestions
        const realignmentSuggestions = await this.generateRealignmentSuggestions(
          userId,
          parsed.driftAreas,
          currentBlueprint
        );

        return {
          ...parsed,
          recommendations: realignmentSuggestions
        };
      }

      console.log('✅ No significant blueprint drift detected');
      return parsed;

    } catch (error) {
      console.error('❌ Blueprint drift detection failed:', error);
      return { driftDetected: false, driftAreas: [], recommendations: [] };
    }
  }

  // Weekly Program Evolution
  async evolveWeeklyProgram(
    programId: string,
    userId: string,
    weekProgress: any
  ): Promise<any> {
    console.log('📈 Evolving weekly program based on progress');

    try {
      // 1. Load program and analyze week's progress
      const program = await this.getAdaptiveProgram(programId);
      if (!program) throw new Error('Program not found');

      const progressAnalysis = await this.analyzeWeeklyProgress(weekProgress, program);

      // 2. Get relevant blueprint context for next week planning
      const blueprintContext = await blueprintEmbeddingService.retrieveRelevantBlueprintContext(
        userId,
        `planning next week based on progress: ${JSON.stringify(progressAnalysis.summary, null, 2)}`,
        4
      );

      // 3. Generate next week's evolved program
      const nextWeekPlan = await openAIAgentOrchestrator.runAgent('planner', [
        {
          role: 'user',
          content: `Generate next week's growth activities based on this week's progress:
          
          Week progress: ${JSON.stringify(progressAnalysis, null, 2)}
          Blueprint context: ${JSON.stringify(blueprintContext, null, 2)}
          Current program: ${JSON.stringify(program.evolution_trajectory, null, 2)}
          
          Focus on:
          1. Building on successes
          2. Addressing challenges revealed
          3. Maintaining sustainable pace
          4. Honor natural rhythm and preferences`
        }
      ]);

      // 4. Format and validate the plan
      const formattedPlan = await openAIAgentOrchestrator.runAgent('delivery', [
        {
          role: 'user',
          content: `Format this weekly plan for user delivery: ${nextWeekPlan}`
        }
      ]);

      // 5. Update program with evolution
      await this.updateProgramEvolution(program, {
        week_plan: formattedPlan,
        evolution_reason: progressAnalysis.summary,
        timestamp: new Date().toISOString()
      });

      console.log('✅ Weekly program evolved successfully');
      return {
        week_plan: formattedPlan,
        evolution_summary: progressAnalysis.summary,
        adaptation_confidence: progressAnalysis.confidence
      };

    } catch (error) {
      console.error('❌ Weekly program evolution failed:', error);
      throw error;
    }
  }

  // Proactive Insight Generation (PIE Enhancement)
  async generateProactiveInsights(
    userId: string,
    currentContext: any
  ): Promise<any[]> {
    console.log('💡 Generating proactive insights using enhanced PIE');

    try {
      // 1. Get relevant blueprint context
      const blueprintContext = await blueprintEmbeddingService.retrieveRelevantBlueprintContext(
        userId,
        `current situation and potential insights: ${JSON.stringify(currentContext, null, 2)}`,
        3
      );

      // 2. Analyze current state for insight opportunities
      const insightAnalysis = await openAIAgentOrchestrator.runAgent('reflector', [
        {
          role: 'user',
          content: `Analyze current context for proactive insight opportunities:
          
          Current context: ${JSON.stringify(currentContext, null, 2)}
          Blueprint context: ${JSON.stringify(blueprintContext, null, 2)}
          
          Generate insights about:
          1. Hidden patterns in their behavior
          2. Opportunities they might be missing
          3. Potential challenges before they become problems
          4. Alignment with their natural design`
        }
      ]);

      // 3. Format insights for delivery
      const formattedInsights = await openAIAgentOrchestrator.runAgent('delivery', [
        {
          role: 'user',
          content: `Format these insights for personalized delivery: ${insightAnalysis}`
        }
      ]);

      // 4. Parse into structured insights
      const insights = this.parseProactiveInsights(formattedInsights);

      console.log('✅ Generated', insights.length, 'proactive insights');
      return insights;

    } catch (error) {
      console.error('❌ Proactive insight generation failed:', error);
      return [];
    }
  }

  // Helper Functions
  private async gatherPlanningContext(
    userId: string,
    domain: LifeDomain,
    blueprint: LayeredBlueprint
  ): Promise<any> {
    // Gather all relevant context for planning
    const [currentPrograms, pastFeedback, userActivities] = await Promise.all([
      this.getCurrentPrograms(userId),
      this.getPastFeedback(userId),
      this.getRecentActivities(userId)
    ]);

    return {
      currentState: {
        domain,
        existing_programs: currentPrograms,
        recent_activities: userActivities
      },
      pastFeedback: pastFeedback || []
    };
  }

  private async analyzeFeedbackSignals(
    newSignals: FeedbackSignal[],
    historicalSignals: FeedbackSignal[]
  ): Promise<any> {
    // Analyze if adaptation is needed based on feedback patterns
    const allSignals = [...historicalSignals, ...newSignals];
    
    // Simple analysis - could be enhanced with ML
    const negativeSignals = allSignals.filter(s => 
      s.action.includes('skip') || 
      s.action.includes('modify') || 
      s.type === 'behavioral' && s.confidence < 0.5
    );

    return {
      adaptation_needed: negativeSignals.length > 3,
      reason: negativeSignals.length > 3 ? 'negative_feedback_pattern' : 'stable',
      adaptation_reason: 'User showing resistance or modification patterns',
      signal_summary: {
        total_signals: allSignals.length,
        negative_signals: negativeSignals.length,
        confidence: Math.max(0, 1 - (negativeSignals.length / Math.max(allSignals.length, 1)))
      }
    };
  }

  private async orchestrateAdaptation(
    program: AdaptiveGrowthProgram,
    feedbackAnalysis: any,
    blueprintContext: any,
    blueprint: LayeredBlueprint
  ): Promise<any> {
    // Use agent orchestrator to adapt the program
    return await openAIAgentOrchestrator.runAgent('planner', [
      {
        role: 'user',
        content: `Adapt this growth program based on feedback analysis:
        
        Current program: ${JSON.stringify(program.evolution_trajectory, null, 2)}
        Feedback analysis: ${JSON.stringify(feedbackAnalysis, null, 2)}
        Blueprint context: ${JSON.stringify(blueprintContext, null, 2)}
        
        Provide specific adaptations that honor the user's feedback while maintaining growth momentum.`
      }
    ]);
  }

  // Storage and Retrieval
  private async storeAdaptiveProgram(program: AdaptiveGrowthProgram): Promise<void> {
    // Extract base GrowthProgram properties and handle extended properties
    const {
      feedback_signals,
      blueprint_alignment_score,
      evolution_trajectory,
      ...baseProgram
    } = program;

    // Embed extended properties in appropriate JSON fields
    const enhancedProgressMetrics = {
      ...program.progress_metrics,
      blueprint_alignment_score
    };

    const enhancedAdaptationHistory = [
      ...program.adaptation_history,
      ...(feedback_signals.length > 0 ? [{
        timestamp: new Date().toISOString(),
        adaptation_type: 'feedback_signals',
        changes_made: { feedback_signals },
        agent_reasoning: 'Stored feedback signals'
      }] : []),
      ...(evolution_trajectory && Object.keys(evolution_trajectory).length > 0 ? [{
        timestamp: new Date().toISOString(),
        adaptation_type: 'evolution_trajectory',
        changes_made: { evolution_trajectory },
        agent_reasoning: 'Stored evolution trajectory'
      }] : [])
    ];

    const { error } = await supabase
      .from('growth_programs')
      .insert({
        ...baseProgram,
        blueprint_params: baseProgram.blueprint_params as any,
        progress_metrics: enhancedProgressMetrics as any,
        session_schedule: baseProgram.session_schedule as any,
        adaptation_history: enhancedAdaptationHistory as any
      });

    if (error) throw error;
  }

  private async getAdaptiveProgram(programId: string): Promise<AdaptiveGrowthProgram | null> {
    const { data, error } = await supabase
      .from('growth_programs')
      .select('*')
      .eq('id', programId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    
    // Reconstruct extended properties from JSON fields
    const progressMetrics = data.progress_metrics as unknown as ProgressMetrics & { blueprint_alignment_score?: number };
    const adaptationHistory = data.adaptation_history as any[] || [];
    
    // Extract feedback signals and evolution trajectory from adaptation history
    const feedbackSignalsEntry = adaptationHistory.find(entry => entry.adaptation_type === 'feedback_signals');
    const evolutionTrajectoryEntry = adaptationHistory.find(entry => entry.adaptation_type === 'evolution_trajectory');
    
    const feedback_signals = feedbackSignalsEntry?.changes_made?.feedback_signals || [];
    const evolution_trajectory = evolutionTrajectoryEntry?.changes_made?.evolution_trajectory || {};
    const blueprint_alignment_score = progressMetrics.blueprint_alignment_score || 0.8;
    
    // Filter out stored extended properties from adaptation history
    const cleanedAdaptationHistory = adaptationHistory.filter(entry => 
      !['feedback_signals', 'evolution_trajectory'].includes(entry.adaptation_type)
    );
    
    // Transform database record to adaptive program
    return {
      ...data,
      program_type: data.program_type as ProgramType,
      domain: data.domain as LifeDomain,
      status: data.status as ProgramStatus,
      blueprint_params: data.blueprint_params as unknown as BlueprintParams,
      progress_metrics: data.progress_metrics as unknown as ProgressMetrics,
      session_schedule: data.session_schedule as unknown as SessionSchedule,
      adaptation_history: cleanedAdaptationHistory,
      feedback_signals,
      blueprint_alignment_score,
      evolution_trajectory
    };
  }

  private async getUserBlueprint(userId: string): Promise<LayeredBlueprint> {
    const { data, error } = await supabase
      .from('blueprints')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('No active blueprint found');
    
    // Transform database blueprint to LayeredBlueprint
    const cognitiveData = data.cognition_mbti as any;
    const energyData = data.energy_strategy_human_design as any;
    const basharData = data.bashar_suite as any;
    const valuesData = data.values_life_path as any;
    const westernData = data.archetype_western as any;
    const chineseData = data.archetype_chinese as any;
    const timingData = data.timing_overlays as any;
    
    return {
      cognitiveTemperamental: {
        mbtiType: cognitiveData?.type || 'Unknown',
        functions: cognitiveData?.functions || [],
        dominantFunction: cognitiveData?.dominantFunction || '',
        auxiliaryFunction: cognitiveData?.auxiliaryFunction || '',
        cognitiveStack: cognitiveData?.cognitiveStack || [],
        taskApproach: cognitiveData?.taskApproach || '',
        communicationStyle: cognitiveData?.communicationStyle || '',
        decisionMaking: cognitiveData?.decisionMaking || '',
        informationProcessing: cognitiveData?.informationProcessing || '',
        coreKeywords: cognitiveData?.coreKeywords || []
      },
      energyDecisionStrategy: {
        humanDesignType: energyData?.type || 'Unknown',
        authority: energyData?.authority || 'Unknown',
        decisionStyle: energyData?.decisionStyle || '',
        pacing: energyData?.pacing || '',
        energyType: energyData?.energyType || '',
        strategy: energyData?.strategy || '',
        profile: energyData?.profile || '',
        centers: energyData?.centers || [],
        gates: energyData?.gates || [],
        channels: energyData?.channels || []
      },
      motivationBeliefEngine: {
        mindset: basharData?.mindset || '',
        motivation: basharData?.motivation || [],
        stateManagement: basharData?.stateManagement || '',
        coreBeliefs: basharData?.coreBeliefs || [],
        drivingForces: basharData?.drivingForces || [],
        excitementCompass: basharData?.excitementCompass || '',
        frequencyAlignment: basharData?.frequencyAlignment || '',
        beliefInterface: basharData?.beliefInterface || [],
        resistancePatterns: basharData?.resistancePatterns || []
      },
      coreValuesNarrative: {
        lifePath: valuesData?.lifePath || 'Unknown',
        lifePathKeyword: valuesData?.lifePathKeyword,
        expressionNumber: valuesData?.expressionNumber,
        expressionKeyword: valuesData?.expressionKeyword,
        soulUrgeNumber: valuesData?.soulUrgeNumber,
        soulUrgeKeyword: valuesData?.soulUrgeKeyword,
        personalityNumber: valuesData?.personalityNumber,
        personalityKeyword: valuesData?.personalityKeyword,
        birthdayNumber: valuesData?.birthdayNumber,
        birthdayKeyword: valuesData?.birthdayKeyword,
        meaningfulAreas: valuesData?.meaningfulAreas || [],
        anchoringVision: valuesData?.anchoringVision || '',
        lifeThemes: valuesData?.lifeThemes || [],
        valueSystem: valuesData?.valueSystem || '',
        northStar: valuesData?.northStar || '',
        missionStatement: valuesData?.missionStatement || '',
        purposeAlignment: valuesData?.purposeAlignment || '',
        core_values: valuesData?.core_values || []
      },
      publicArchetype: {
        sunSign: westernData?.sunSign || 'Unknown',
        moonSign: westernData?.moonSign,
        risingSign: westernData?.risingSign,
        socialStyle: westernData?.socialStyle || '',
        publicVibe: westernData?.publicVibe || '',
        publicPersona: westernData?.publicPersona || '',
        leadershipStyle: westernData?.leadershipStyle || '',
        socialMask: westernData?.socialMask || '',
        externalExpression: westernData?.externalExpression || ''
      },
      generationalCode: {
        chineseZodiac: chineseData?.chineseZodiac || 'Unknown',
        element: chineseData?.element || '',
        cohortTint: chineseData?.cohortTint || '',
        generationalThemes: chineseData?.generationalThemes || [],
        collectiveInfluence: chineseData?.collectiveInfluence || ''
      },
      surfaceExpression: {
        observableStyle: '',
        realWorldImpact: '',
        behavioralSignatures: [],
        externalManifestations: []
      },
      marketingArchetype: {
        messagingStyle: '',
        socialHooks: [],
        brandPersonality: '',
        communicationPatterns: [],
        influenceStyle: ''
      },
      goalPersona: {
        currentMode: 'coach',
        serviceRole: '',
        coachingTone: '',
        nudgeStyle: '',
        motivationApproach: ''
      },
      interactionPreferences: {
        rapportStyle: '',
        storyPreference: '',
        empathyLevel: '',
        conflictStyle: '',
        collaborationStyle: '',
        feedbackStyle: '',
        learningStyle: ''
      },
      timingOverlays: {
        currentTransits: timingData?.currentTransits || [],
        seasonalInfluences: timingData?.seasonalInfluences || [],
        cyclicalPatterns: timingData?.cyclicalPatterns || [],
        optimalTimings: timingData?.optimalTimings || [],
        energyWeather: timingData?.energyWeather || ''
      },
      proactiveContext: {
        nudgeHistory: [],
        taskGraph: data.task_graph || {},
        streaks: {},
        moodLog: [],
        recentPatterns: [],
        triggerEvents: []
      },
      user_meta: data.user_meta as any,
      humorProfile: {
        primaryStyle: 'warm-nurturer',
        intensity: 'moderate',
        appropriatenessLevel: 'balanced',
        contextualAdaptation: {
          coaching: 'warm-nurturer',
          guidance: 'gentle-empath',
          casual: 'playful-storyteller'
        },
        avoidancePatterns: [],
        signatureElements: []
      },
      voiceTokens: {
        pacing: {
          sentenceLength: 'medium',
          pauseFrequency: 'thoughtful',
          rhythmPattern: 'varied'
        },
        expressiveness: {
          emojiFrequency: 'occasional',
          emphasisStyle: 'subtle',
          exclamationTendency: 'balanced'
        },
        vocabulary: {
          formalityLevel: 'conversational',
          metaphorUsage: 'occasional',
          technicalDepth: 'balanced'
        },
        conversationStyle: {
          questionAsking: 'supportive',
          responseLength: 'thorough',
          personalSharing: 'warm'
        },
        signaturePhrases: [],
        greetingStyles: [],
        transitionWords: []
      }
    };
  }

  // Utility Functions
  private determineAdaptiveProgramType(plan: any): ProgramType {
    return 'standard';
  }

  private extractProgramDuration(plan: any): number {
    return 8; // Default 8 weeks, could be extracted from plan
  }

  private calculateExpectedCompletion(plan: any): string {
    const now = new Date();
    now.setWeeks(now.getWeeks() + 8);
    return now.toISOString();
  }

  private extractBlueprintParams(plan: any): BlueprintParams {
    return {
      time_horizon: 'flexible',
      support_style: 4,
      primary_goal: 'deep_change',
      user_confidence: 'medium',
      goal_depth: 'moderate',
      preferred_pace: 'weekly'
    };
  }

  private initializeProgressMetrics(): ProgressMetrics {
    return {
      completed_sessions: 0,
      mood_entries: 0,
      reflection_entries: 0,
      insight_entries: 0,
      micro_actions_completed: 0,
      belief_shifts_tracked: 0,
      excitement_ratings: [],
      domain_progress_score: 0
    };
  }

  private extractSessionSchedule(plan: any): SessionSchedule {
    return {
      sessions_per_week: 3,
      session_duration_minutes: 25,
      reminder_frequency: 'weekly'
    };
  }

  private calculateAlignmentScore(agentResult: any, blueprint: LayeredBlueprint): number {
    return 0.85; // Placeholder - would calculate based on alignment
  }

  private parseDriftAnalysis(analysis: string): any {
    // Parse agent response into structured drift analysis
    return {
      driftDetected: analysis.includes('drift') || analysis.includes('divergence'),
      driftAreas: ['placeholder'], // Would extract from analysis
      confidence: 0.7
    };
  }

  private async generateRealignmentSuggestions(
    userId: string,
    driftAreas: string[],
    blueprint: LayeredBlueprint
  ): Promise<string[]> {
    // Generate gentle realignment suggestions
    return ['Gentle suggestion placeholder'];
  }

  private async analyzeWeeklyProgress(weekProgress: any, program: AdaptiveGrowthProgram): Promise<any> {
    return {
      summary: 'Week completed with positive progress',
      confidence: 0.8,
      recommendations: ['Continue current approach']
    };
  }

  private parseProactiveInsights(formattedInsights: string): any[] {
    // Parse formatted insights into structured format
    return [{
      title: 'Sample Insight',
      content: formattedInsights.substring(0, 100) + '...',
      confidence: 0.8,
      category: 'growth_opportunity'
    }];
  }

  private async getCurrentPrograms(userId: string): Promise<any[]> {
    const { data } = await supabase
      .from('growth_programs')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');
    
    return data || [];
  }

  private async getPastFeedback(userId: string): Promise<any[]> {
    // Get past feedback from conversation memory or feedback tables
    return [];
  }

  private async getRecentActivities(userId: string): Promise<any[]> {
    const { data } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    
    return data || [];
  }

  private async storeFeedbackSignals(programId: string, signals: FeedbackSignal[]): Promise<void> {
    // Store feedback signals for future analysis
    console.log('📊 Storing feedback signals for program:', programId);
  }

  private async applyAdaptations(
    program: AdaptiveGrowthProgram,
    adaptationResult: any,
    feedbackSignals: FeedbackSignal[]
  ): Promise<void> {
    // Apply the adaptations to the program
    program.adaptation_history.push({
      timestamp: new Date().toISOString(),
      reason: 'feedback_driven_adaptation',
      changes: adaptationResult,
      signals_processed: feedbackSignals.length
    });

    await this.storeAdaptiveProgram(program);
  }

  private async updateProgramEvolution(program: AdaptiveGrowthProgram, evolution: any): Promise<void> {
    program.evolution_trajectory = evolution;
    program.updated_at = new Date().toISOString();
    await this.storeAdaptiveProgram(program);
  }
}

// Extend Date prototype for convenience
declare global {
  interface Date {
    setWeeks(weeks: number): void;
    getWeeks(): number;
  }
}

Date.prototype.setWeeks = function(weeks: number) {
  this.setDate(this.getDate() + (weeks * 7));
};

Date.prototype.getWeeks = function() {
  const onejan = new Date(this.getFullYear(), 0, 1);
  return Math.ceil((((this.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
};

export const adaptiveGrowthService = new AdaptiveGrowthService();