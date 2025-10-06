import { supabase } from '@/integrations/supabase/client';
import { hermeticIntelligenceService } from './hermetic-intelligence-service';
import { hermeticReportAccessService } from './hermetic-report-access-service';
import type { HermeticStructuredIntelligence } from '@/types/hermetic-intelligence';

export interface SoulGeneratedGoal {
  id: string;
  title: string;
  description: string;
  category: string;
  timeframe: string;
  target_completion: string;
  created_at: string;
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    target_date: string;
    completed: boolean;
    completion_criteria: string[];
    blueprint_alignment?: any;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    milestone_id: string;
    completed: boolean;
    estimated_duration: string;
    energy_level_required: string;
    category: string;
    optimal_timing?: string;
    blueprint_reasoning?: string;
    prerequisites?: string[];
  }>;
  blueprint_insights: string[];
  personalization_notes: string;
}

class SoulGoalDecompositionService {
  async decomposeGoalWithSoul(
    title: string,
    description: string,
    timeframe: string,
    category: string,
    blueprintData: any,
    whyItMatters?: string
  ): Promise<SoulGeneratedGoal> {
    console.log('🎯 Soul Goal Decomposition Service - Starting razor-aligned decomposition:', {
      title,
      description,
      timeframe,
      category,
      hasBlueprintData: !!blueprintData
    });

    try {
      // STEP 1: Fetch deep personality data with fallback hierarchy
      console.log('🧬 HERMETIC INTEGRATION: Fetching deep personality context...');
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const personalityContext = await this.fetchPersonalityDataWithFallback(userId!, blueprintData);
      
      console.log('✅ PERSONALITY CONTEXT:', {
        dataSource: personalityContext.dataSource,
        depth: personalityContext.depth,
        hasHermetic2: !!personalityContext.hermetic2,
        hasHermetic1: !!personalityContext.hermetic1Report,
        hasBlueprintSections: Object.keys(personalityContext.blueprintSections || {}).length
      });

      // STEP 2: Build comprehensive AI prompt with all available context
      const comprehensivePrompt = this.buildComprehensiveDecompositionPrompt(
        title,
        description,
        whyItMatters || '',
        category,
        timeframe,
        personalityContext
      );

      console.log('📝 PROMPT BUILT:', { 
        length: comprehensivePrompt.length,
        dataSource: personalityContext.dataSource 
      });

      // STEP 3: Call AI Coach with enhanced prompt
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          message: comprehensivePrompt,
          context: 'razor_aligned_goal_decomposition',
          contextDepth: 'deep',
          blueprintData
        }
      });

      if (error) {
        console.error('❌ AI Coach function error:', error);
        throw new Error(`AI Coach service error: ${error.message}`);
      }

      if (!data?.response) {
        console.error('❌ No response from AI Coach service');
        throw new Error('No response from AI Coach service');
      }

      console.log('✅ AI RESPONSE RECEIVED:', { length: data.response.length });

      // STEP 4: Parse and validate AI response
      const parsedGoal = await this.parseAIResponseWithValidation(data.response, title, category);
      
      console.log('✅ VALIDATION PASSED:', {
        milestones: parsedGoal.milestones.length,
        tasks: parsedGoal.tasks.length,
        isGoalSpecific: parsedGoal.isGoalSpecific
      });

      // STEP 5: Create structured goal
      const goalId = `goal_${Date.now()}`;
      const targetDate = this.calculateTargetDate(timeframe);

      const soulGoal: SoulGeneratedGoal = {
        id: goalId,
        title,
        description,
        category,
        timeframe,
        target_completion: targetDate,
        created_at: new Date().toISOString(),
        milestones: parsedGoal.milestones,
        tasks: parsedGoal.tasks,
        blueprint_insights: parsedGoal.blueprint_insights || [],
        personalization_notes: `Razor-aligned journey created using ${personalityContext.dataSource} with ${parsedGoal.milestones.length} goal-specific milestones and ${parsedGoal.tasks.length} actionable tasks.`
      };

      console.log('✅ RAZOR-ALIGNED GOAL COMPLETED:', {
        milestones: parsedGoal.milestones.length,
        tasks: parsedGoal.tasks.length,
        goalId: soulGoal.id,
        dataSource: personalityContext.dataSource
      });

      // Save to database with hermetic alignment context
      await this.saveGoalWithHermeticContext(soulGoal, personalityContext);
      
      return soulGoal;

    } catch (error) {
      console.error('❌ Soul Goal Decomposition Service error:', error);
      throw error;
    }
  }

  // ============================================
  // HERMETIC INTELLIGENCE INTEGRATION
  // ============================================

  private async fetchPersonalityDataWithFallback(userId: string, blueprintData: any): Promise<{
    dataSource: 'Hermetic 2.0' | 'Hermetic 1.0 Report' | 'Rich Blueprint' | 'Basic Blueprint';
    depth: number;
    hermetic2?: HermeticStructuredIntelligence;
    hermetic1Report?: string;
    blueprintSections?: any;
  }> {
    // Try Hermetic 2.0 first
    try {
      const h2Result = await hermeticIntelligenceService.getStructuredIntelligence(userId);
      if (h2Result.success && h2Result.intelligence) {
        console.log('🧬 Using Hermetic 2.0 structured intelligence');
        return {
          dataSource: 'Hermetic 2.0',
          depth: 100,
          hermetic2: h2Result.intelligence,
          blueprintSections: this.extractRichBlueprintSections(blueprintData)
        };
      }
    } catch (error) {
      console.warn('⚠️ Hermetic 2.0 not available:', error);
    }

    // Try Hermetic 1.0 Report
    try {
      const h1Sections = await hermeticReportAccessService.getRelevantSections(userId, {
        maxTokens: 15000,
        prioritySections: [
          'identity_constructs',
          'execution_bias',
          'behavioral_triggers',
          'temporal_biology',
          'career_vocational'
        ]
      });

      if (h1Sections && Object.keys(h1Sections).length > 0) {
        console.log('📊 Using Hermetic 1.0 Report sections:', Object.keys(h1Sections));
        const reportText = Object.entries(h1Sections)
          .map(([section, data]: [string, any]) => `## ${section}\n${data.content}`)
          .join('\n\n');
        
        return {
          dataSource: 'Hermetic 1.0 Report',
          depth: 80,
          hermetic1Report: reportText,
          blueprintSections: this.extractRichBlueprintSections(blueprintData)
        };
      }
    } catch (error) {
      console.warn('⚠️ Hermetic 1.0 Report not available:', error);
    }

    // Fallback to Rich Blueprint Data
    const blueprintSections = this.extractRichBlueprintSections(blueprintData);
    const sectionCount = Object.keys(blueprintSections).length;
    
    if (sectionCount > 2) {
      console.log('🎨 Using Rich Blueprint Data:', Object.keys(blueprintSections));
      return {
        dataSource: 'Rich Blueprint',
        depth: 60,
        blueprintSections
      };
    }

    // Last resort: Basic blueprint
    console.log('⚠️ Using Basic Blueprint data only');
    return {
      dataSource: 'Basic Blueprint',
      depth: 30,
      blueprintSections: { basic: blueprintData }
    };
  }

  private extractRichBlueprintSections(blueprintData: any) {
    const sections: any = {};

    // MBTI/Cognition
    if (blueprintData?.cognition_mbti) {
      sections.cognition = {
        type: blueprintData.cognition_mbti.type,
        cognitive_stack: blueprintData.cognition_mbti.cognitive_stack || [],
        dominant_function: blueprintData.cognition_mbti.cognitive_stack?.[0],
        decision_making: blueprintData.cognition_mbti.preferences
      };
    }

    // Human Design
    if (blueprintData?.energy_strategy_human_design) {
      sections.human_design = {
        type: blueprintData.energy_strategy_human_design.type,
        strategy: blueprintData.energy_strategy_human_design.strategy,
        authority: blueprintData.energy_strategy_human_design.authority,
        profile: blueprintData.energy_strategy_human_design.profile,
        centers: blueprintData.energy_strategy_human_design.centers || [],
        gates: blueprintData.energy_strategy_human_design.gates || [],
        channels: blueprintData.energy_strategy_human_design.channels || []
      };
    }

    // Western Astrology
    if (blueprintData?.archetype_western) {
      sections.western_astrology = {
        sun_sign: blueprintData.archetype_western.sun_sign,
        moon_sign: blueprintData.archetype_western.moon_sign,
        rising_sign: blueprintData.archetype_western.rising_sign,
        aspects: blueprintData.archetype_western.aspects || [],
        houses: blueprintData.archetype_western.houses || {}
      };
    }

    // Numerology
    if (blueprintData?.values_life_path) {
      sections.numerology = {
        life_path: blueprintData.values_life_path.life_path_number,
        calculations: blueprintData.values_life_path.calculations || {},
        core_values: blueprintData.values_life_path.core_values || []
      };
    }

    // Chinese Astrology
    if (blueprintData?.archetype_chinese) {
      sections.chinese_astrology = {
        animal: blueprintData.archetype_chinese.animal,
        element: blueprintData.archetype_chinese.element,
        four_pillars: blueprintData.archetype_chinese.four_pillars || {}
      };
    }

    return sections;
  }

  // ============================================
  // AI PROMPT CONSTRUCTION
  // ============================================

  private buildComprehensiveDecompositionPrompt(
    title: string,
    description: string,
    whyItMatters: string,
    category: string,
    timeframe: string,
    personalityContext: any
  ): string {
    const { dataSource, hermetic2, hermetic1Report, blueprintSections } = personalityContext;

    let personalitySection = '';

    // Build personality context based on available data
    if (hermetic2) {
      personalitySection = this.buildHermetic2Context(hermetic2);
    } else if (hermetic1Report) {
      personalitySection = `🧬 HERMETIC 1.0 REPORT INSIGHTS:\n\n${hermetic1Report}\n\n`;
    } else if (blueprintSections) {
      personalitySection = this.buildRichBlueprintContext(blueprintSections);
    }

    return `You are an expert journey architect creating a SPECIFIC, HIGHLY PERSONALIZED plan.

🎯 DREAM DETAILS:
- Title: "${title}"
- Description: ${description}
- Why it matters: ${whyItMatters}
- Category: ${category}
- Timeframe: ${timeframe}

${personalitySection}

🎯 YOUR TASK:

Create a RAZOR-ALIGNED journey plan with 5-6 milestones that are DIRECTLY RELATED to "${title}".

**CRITICAL: DO NOT USE GENERIC TEMPLATES**

Every milestone and task must be SPECIFIC to the dream domain. For example:
- If dream is "10000 euro per maand verdienen met 1 app":
  ✅ Milestone 1: "Validate App Idea & Dutch Market Fit"
  ✅ Task: "Research top 20 revenue-generating apps in Dutch market"
  ❌ NOT "Discovery & Vision" or "Conduct research"

**PERSONALIZATION REQUIREMENTS:**
1. Reference their execution style in task phrasing
2. Align task timing with their energy patterns
3. Address specific avoidance patterns proactively
4. Use their momentum triggers
5. Leverage their cognitive strengths
6. Honor their decision-making authority

Return as JSON:
{
  "milestones": [
    {
      "id": "milestone_1",
      "title": "SPECIFIC milestone for ${title}",
      "description": "Detailed explanation of HOW this achieves ${title}",
      "target_date": "2025-11-06",
      "completed": false,
      "completion_criteria": ["Measurable", "specific", "criteria"],
      "blueprint_alignment": {
        "addresses_patterns": ["Which patterns this milestone helps with"],
        "leverages_strengths": ["Which strengths this uses"],
        "optimal_timing": "Based on energy patterns"
      }
    }
  ],
  "tasks": [
    {
      "id": "task_1",
      "title": "Concrete actionable task for ${title}",
      "description": "Step-by-step instructions",
      "milestone_id": "milestone_1",
      "completed": false,
      "estimated_duration": "2-3 hours",
      "energy_level_required": "medium",
      "category": "execution",
      "optimal_timing": "Best time based on patterns",
      "blueprint_reasoning": "Why this task aligns with their nature",
      "prerequisites": ["Previous tasks if any"]
    }
  ],
  "blueprint_insights": [
    "How this journey aligns with their unique nature"
  ]
}`;
  }

  private buildHermetic2Context(hermetic: HermeticStructuredIntelligence): string {
    return `🧬 HERMETIC 2.0 DEEP PERSONALITY CONTEXT:

IDENTITY & NARRATIVES:
${hermetic.identity_constructs?.core_narratives?.slice(0, 5).map(n => `- ${n}`).join('\n') || 'N/A'}

EXECUTION STYLE:
- Preferred Style: ${hermetic.execution_bias?.preferred_style || 'N/A'}
- Completion Patterns: ${hermetic.execution_bias?.completion_patterns || 'N/A'}
- Momentum Triggers: ${hermetic.execution_bias?.momentum_triggers?.join(', ') || 'N/A'}

BEHAVIORAL TRIGGERS:
- Energy Dips: ${hermetic.behavioral_triggers?.energy_dips?.join(', ') || 'N/A'}
- Avoidance Patterns: ${hermetic.behavioral_triggers?.avoidance_patterns?.join(', ') || 'N/A'}
- Activation Rituals: ${hermetic.behavioral_triggers?.activation_rituals?.join(', ') || 'N/A'}

TEMPORAL BIOLOGY:
- Peak Times: ${hermetic.temporal_biology?.cognitive_peaks?.join(', ') || 'N/A'}
- Vulnerable Times: ${hermetic.temporal_biology?.vulnerable_times?.join(', ') || 'N/A'}

CAREER ARCHETYPES:
${hermetic.career_vocational?.work_archetypes?.slice(0, 3).map(a => `- ${a}`).join('\n') || 'N/A'}

FINANCIAL PATTERNS:
- Money Relationship: ${hermetic.financial_archetypes?.money_relationship || 'N/A'}
- Abundance Blocks: ${hermetic.financial_archetypes?.abundance_blocks?.join(', ') || 'N/A'}

`;
  }

  private buildRichBlueprintContext(sections: any): string {
    let context = '🎨 RICH BLUEPRINT CONTEXT:\n\n';

    if (sections.cognition) {
      context += `COGNITION (${sections.cognition.type}):\n`;
      context += `- Dominant Function: ${sections.cognition.dominant_function}\n`;
      context += `- Cognitive Stack: ${sections.cognition.cognitive_stack?.join(' → ')}\n\n`;
    }

    if (sections.human_design) {
      context += `HUMAN DESIGN:\n`;
      context += `- Type: ${sections.human_design.type}\n`;
      context += `- Strategy: ${sections.human_design.strategy}\n`;
      context += `- Authority: ${sections.human_design.authority}\n`;
      context += `- Profile: ${sections.human_design.profile}\n`;
      context += `- Defined Centers: ${sections.human_design.centers?.join(', ')}\n\n`;
    }

    if (sections.western_astrology) {
      context += `WESTERN ASTROLOGY:\n`;
      context += `- Sun: ${sections.western_astrology.sun_sign}\n`;
      context += `- Moon: ${sections.western_astrology.moon_sign}\n`;
      context += `- Rising: ${sections.western_astrology.rising_sign}\n\n`;
    }

    if (sections.numerology) {
      context += `NUMEROLOGY:\n`;
      context += `- Life Path: ${sections.numerology.life_path}\n`;
      context += `- Core Values: ${sections.numerology.core_values?.join(', ')}\n\n`;
    }

    if (sections.chinese_astrology) {
      context += `CHINESE ASTROLOGY:\n`;
      context += `- Animal: ${sections.chinese_astrology.animal}\n`;
      context += `- Element: ${sections.chinese_astrology.element}\n\n`;
    }

    return context;
  }

  // ============================================
  // AI RESPONSE PARSING & VALIDATION
  // ============================================

  private async parseAIResponseWithValidation(
    aiResponse: string,
    goalTitle: string,
    category: string
  ): Promise<{
    milestones: any[];
    tasks: any[];
    blueprint_insights?: string[];
    isGoalSpecific: boolean;
  }> {
    try {
      // Extract JSON from AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ No JSON found in AI response');
        throw new Error('AI response missing JSON structure');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // VALIDATION: Check for generic milestones
      const genericTerms = [
        'Discovery & Vision',
        'Foundation & Planning',
        'Initial Implementation',
        'Expansion & Growth',
        'Mastery & Integration',
        'Achievement & Celebration'
      ];

      const hasGenericMilestones = parsed.milestones?.some((m: any) =>
        genericTerms.some(term => m.title?.includes(term))
      );

      if (hasGenericMilestones) {
        console.warn('⚠️ VALIDATION WARNING: AI returned generic milestone templates');
      }

      // VALIDATION: Check if milestones reference the goal
      const goalKeywords = goalTitle.toLowerCase().split(' ').filter(w => w.length > 3);
      const milestonesReferenceGoal = parsed.milestones?.some((m: any) => {
        const milestoneText = `${m.title} ${m.description}`.toLowerCase();
        return goalKeywords.some(keyword => milestoneText.includes(keyword));
      });

      if (!milestonesReferenceGoal) {
        console.warn('⚠️ VALIDATION WARNING: Milestones may not be goal-specific');
      }

      // Ensure all required fields exist
      const validatedMilestones = (parsed.milestones || []).map((m: any, index: number) => ({
        id: m.id || `milestone_${index + 1}_${Date.now()}`,
        title: m.title || `Milestone ${index + 1}`,
        description: m.description || '',
        target_date: m.target_date || new Date().toISOString().split('T')[0],
        completed: false,
        completion_criteria: m.completion_criteria || [],
        blueprint_alignment: m.blueprint_alignment || {}
      }));

      const validatedTasks = (parsed.tasks || []).map((t: any, index: number) => ({
        id: t.id || `task_${index + 1}_${Date.now()}`,
        title: t.title || `Task ${index + 1}`,
        description: t.description || '',
        milestone_id: t.milestone_id || validatedMilestones[0]?.id,
        completed: false,
        estimated_duration: t.estimated_duration || '1-2 hours',
        energy_level_required: t.energy_level_required || 'medium',
        category: t.category || 'execution',
        optimal_timing: t.optimal_timing,
        blueprint_reasoning: t.blueprint_reasoning,
        prerequisites: t.prerequisites || []
      }));

      console.log('✅ PARSING COMPLETED:', {
        milestones: validatedMilestones.length,
        tasks: validatedTasks.length,
        hasGeneric: hasGenericMilestones,
        isGoalSpecific: milestonesReferenceGoal
      });

      return {
        milestones: validatedMilestones,
        tasks: validatedTasks,
        blueprint_insights: parsed.blueprint_insights || [],
        isGoalSpecific: milestonesReferenceGoal && !hasGenericMilestones
      };
    } catch (error) {
      console.error('❌ PARSING ERROR:', error);
      throw new Error(`Failed to parse AI response: ${error}`);
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  private calculateTargetDate(timeframe: string): string {
    const date = new Date();

    if (timeframe.includes('month')) {
      const months = parseInt(timeframe) || 3;
      date.setMonth(date.getMonth() + months);
    } else if (timeframe.includes('week')) {
      const weeks = parseInt(timeframe) || 12;
      date.setDate(date.getDate() + weeks * 7);
    } else if (timeframe.includes('year')) {
      const years = parseInt(timeframe) || 1;
      date.setFullYear(date.getFullYear() + years);
    } else {
      date.setMonth(date.getMonth() + 3);
    }

    return date.toISOString().split('T')[0];
  }

  // ============================================
  // DATABASE OPERATIONS
  // ============================================

  private async saveGoalWithHermeticContext(goal: SoulGeneratedGoal, personalityContext: any): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Save to productivity_journey table
      const { error: journeyError } = await supabase
        .from('productivity_journey')
        .insert({
          user_id: user.id,
          goal_title: goal.title,
          goal_description: goal.description,
          category: goal.category,
          timeframe: goal.timeframe,
          target_completion: goal.target_completion,
          milestones: goal.milestones,
          tasks: goal.tasks,
          blueprint_insights: goal.blueprint_insights,
          personalization_notes: goal.personalization_notes,
          hermetic_alignment_context: {
            data_source: personalityContext.dataSource,
            depth: personalityContext.depth,
            created_at: new Date().toISOString()
          },
          personalization_depth_score: personalityContext.depth
        });

      if (journeyError) {
        console.error('❌ Error saving journey:', journeyError);
        throw journeyError;
      }

      console.log('✅ SAVED TO DATABASE with hermetic context');
    } catch (error) {
      console.error('❌ Database save error:', error);
      throw error;
    }
  }

  // Legacy method for backward compatibility - not used in new implementation
  private async saveEnhancedGoalToDatabase(goal: SoulGeneratedGoal, causalAnalysis: any): Promise<void> {
    return this.saveGoalWithHermeticContext(goal, { dataSource: 'Basic Blueprint', depth: 30 });
  }
}

export const soulGoalDecompositionService = new SoulGoalDecompositionService();
