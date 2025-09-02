import { supabase } from '@/integrations/supabase/client';

export interface IntelligenceAnalyst {
  name: string;
  dimension: string;
  generateReport(hermeticChunk: string, previousInsights: string, blueprintContext: any): Promise<string>;
}

export interface IntelligenceReport {
  identity_constructs: string;
  behavioral_triggers: string;
  execution_bias: string;
  internal_conflicts: string;
  spiritual_dimension: string;
  adaptive_feedback: string;
  temporal_biology: string;
  metacognitive_biases: string;
  attachment_style: string;
  goal_archetypes: string;
  crisis_handling: string;
  identity_flexibility: string;
  linguistic_fingerprint: string;
}

class IdentityConstructsAnalyst implements IntelligenceAnalyst {
  name = "Identity Constructs Analyst";
  dimension = "identity_constructs";

  async generateReport(hermeticChunk: string, previousInsights: string, blueprintContext: any): Promise<string> {
    const prompt = `
As the Identity Constructs Analyst, analyze the identity formation patterns and self-concept structures from this hermetic analysis:

HERMETIC ANALYSIS INPUT:
${hermeticChunk}

PREVIOUS INTELLIGENCE INSIGHTS:
${previousInsights}

BLUEPRINT CONTEXT:
- MBTI Type: ${blueprintContext.cognition_mbti?.type || 'Unknown'}
- Human Design Type: ${blueprintContext.energy_strategy_human_design?.type || 'Unknown'}
- Life Path: ${blueprintContext.values_life_path?.lifePathNumber || 'Unknown'}

ANALYSIS REQUIREMENTS:
Generate a comprehensive 3,000-4,000 word analysis covering:

1. CORE IDENTITY ARCHITECTURE (800-1000 words)
   - Fundamental self-concept structures
   - Identity anchors and core beliefs about self
   - How identity was formed and what maintains it
   - Conscious vs unconscious identity elements

2. IDENTITY DEFENSE MECHANISMS (700-900 words)
   - Protective strategies around identity threats
   - How the person maintains consistent self-image
   - Ego defense patterns and identity preservation tactics
   - Areas where identity feels most/least secure

3. IDENTITY EVOLUTION PATTERNS (700-900 words)
   - How identity has shifted over time
   - Growth edges in identity development
   - Resistance patterns to identity expansion
   - Future identity potential and transformation pathways

4. IDENTITY INTEGRATION OPPORTUNITIES (800-1000 words)
   - Shadow aspects of identity waiting for integration
   - Rejected or denied parts of self
   - How to expand identity in healthy ways
   - Specific practices for identity wholeness

5. PRACTICAL IDENTITY RECOMMENDATIONS (200-400 words)
   - Concrete steps for healthy identity development
   - Warning signs of identity rigidity or fragmentation
   - Daily practices for authentic self-expression

Write in a profound, insightful tone that reveals deep psychological patterns. Use "you" throughout. Connect insights to the hermetic analysis and previous intelligence findings.
`;

    const { data, error } = await supabase.functions.invoke('identity-constructs-analyst', {
      body: {
        hermeticChunk,
        previousInsights,
        blueprintContext
      }
    });
    
    if (error) throw new Error(`Identity Constructs Analyst failed: ${error.message}`);
    return data.content;
  }
}

class BehavioralTriggersAnalyst implements IntelligenceAnalyst {
  name = "Behavioral Triggers Analyst";
  dimension = "behavioral_triggers";

  async generateReport(hermeticChunk: string, previousInsights: string, blueprintContext: any): Promise<string> {
    const prompt = `
As the Behavioral Triggers Analyst, analyze the automatic behavioral patterns and response mechanisms from this hermetic analysis:

HERMETIC ANALYSIS INPUT:
${hermeticChunk}

PREVIOUS INTELLIGENCE INSIGHTS:
${previousInsights}

BLUEPRINT CONTEXT:
- MBTI Type: ${blueprintContext.cognition_mbti?.type || 'Unknown'}
- Human Design Authority: ${blueprintContext.energy_strategy_human_design?.authority || 'Unknown'}

ANALYSIS REQUIREMENTS:
Generate a comprehensive 3,000-4,000 word analysis covering:

1. TRIGGER IDENTIFICATION & MAPPING (800-1000 words)
   - Primary emotional and behavioral triggers
   - Environmental, relational, and internal triggers
   - Trigger intensity levels and response patterns
   - How triggers connect to core wounds and fears

2. AUTOMATIC RESPONSE SYSTEMS (700-900 words)
   - Default behavioral patterns when triggered
   - Fight/flight/freeze/fawn responses
   - Coping mechanisms and survival strategies
   - How responses serve vs sabotage growth

3. TRIGGER TRANSFORMATION PATHWAYS (700-900 words)
   - How triggers can become gateways to growth
   - Healing opportunities within trigger patterns
   - Conscious response development strategies
   - Integration of triggered aspects

4. BEHAVIORAL RECALIBRATION METHODS (800-1000 words)
   - Specific techniques for trigger awareness
   - Pause-and-choose response practices
   - How to develop new behavioral pathways
   - Somatic and energetic approaches to trigger healing

5. MASTERY PRACTICES & IMPLEMENTATIONS (200-400 words)
   - Daily trigger awareness exercises
   - Emergency protocols for intense triggers
   - Long-term behavioral transformation goals

Connect all insights to the hermetic analysis and identity constructs findings. Write with depth and practical wisdom.
`;

    const { data, error } = await supabase.functions.invoke('behavioral-triggers-analyst', {
      body: {
        hermeticChunk,
        previousInsights,
        blueprintContext
      }
    });
    
    if (error) throw new Error(`Behavioral Triggers Analyst failed: ${error.message}`);
    return data.content;
  }
}

class ExecutionBiasAnalyst implements IntelligenceAnalyst {
  name = "Execution Bias Analyst";
  dimension = "execution_bias";

  async generateReport(hermeticChunk: string, previousInsights: string, blueprintContext: any): Promise<string> {
    const prompt = `
As the Execution Bias Analyst, analyze the decision-making patterns and action-taking biases from this hermetic analysis:

HERMETIC ANALYSIS INPUT:
${hermeticChunk}

PREVIOUS INTELLIGENCE INSIGHTS:
${previousInsights}

BLUEPRINT CONTEXT:
- Human Design Type: ${blueprintContext.energy_strategy_human_design?.type || 'Unknown'}
- Decision-Making Authority: ${blueprintContext.energy_strategy_human_design?.authority || 'Unknown'}

ANALYSIS REQUIREMENTS:
Generate a comprehensive 3,000-4,000 word analysis covering:

1. DECISION-MAKING ARCHITECTURE (800-1000 words)
   - Core decision-making patterns and biases
   - How decisions are filtered through personality structure
   - Conscious vs unconscious decision factors
   - Decision-making strengths and blind spots

2. ACTION-TAKING PATTERNS (700-900 words)
   - Execution styles and implementation approaches
   - Procrastination vs action triggers
   - How energy moves through decision to action
   - Completion patterns and follow-through tendencies

3. COGNITIVE & EMOTIONAL BIASES (700-900 words)
   - Specific biases that influence choices
   - How past experiences shape current decisions
   - Emotional decision-making vs rational analysis
   - Bias awareness and correction strategies

4. EXECUTION OPTIMIZATION STRATEGIES (800-1000 words)
   - How to align decisions with authentic design
   - Improving decision quality and speed
   - Creating supportive execution environments
   - Leveraging natural decision-making gifts

5. IMPLEMENTATION PROTOCOLS (200-400 words)
   - Daily decision-making practices
   - How to catch and correct biased thinking
   - Execution accountability systems

Integrate insights from identity constructs and behavioral triggers analysis. Write with analytical depth and practical application focus.
`;

    const { data, error } = await supabase.functions.invoke('execution-bias-analyst', {
      body: {
        hermeticChunk,
        previousInsights,
        blueprintContext
      }
    });
    
    if (error) throw new Error(`Execution Bias Analyst failed: ${error.message}`);
    return data.content;
  }
}

class InternalConflictsAnalyst implements IntelligenceAnalyst {
  name = "Internal Conflicts Analyst";
  dimension = "internal_conflicts";

  async generateReport(hermeticChunk: string, previousInsights: string, blueprintContext: any): Promise<string> {
    const prompt = `
As the Internal Conflicts Analyst, analyze the internal contradictions and psychological tensions:

HERMETIC ANALYSIS INPUT: ${hermeticChunk}
PREVIOUS INSIGHTS: ${previousInsights}
BLUEPRINT CONTEXT: ${JSON.stringify(blueprintContext, null, 2)}

Generate a comprehensive 3,000-4,000 word analysis covering belief contradictions, emotional double binds, and identity splits that create internal tension and resistance patterns.
`;

    const { data, error } = await supabase.functions.invoke('internal-conflicts-analyst', {
      body: {
        hermeticChunk,
        previousInsights,
        blueprintContext
      }
    });
    
    if (error) throw new Error(`Internal Conflicts Analyst failed: ${error.message}`);
    return data.content;
  }
}

class SpiritualDimensionAnalyst implements IntelligenceAnalyst {
  name = "Spiritual Dimension Analyst";
  dimension = "spiritual_dimension";

  async generateReport(hermeticChunk: string, previousInsights: string, blueprintContext: any): Promise<string> {
    const prompt = `
As the Spiritual Dimension Analyst, analyze the philosophical filters, life meaning themes, and faith integration:

HERMETIC ANALYSIS INPUT: ${hermeticChunk}
PREVIOUS INSIGHTS: ${previousInsights}
BLUEPRINT CONTEXT: ${JSON.stringify(blueprintContext, null, 2)}

Generate a comprehensive 3,000-4,000 word analysis covering philosophical frameworks, meaning-making patterns, spiritual beliefs, and integration practices.
`;

    const { data, error } = await supabase.functions.invoke('spiritual-dimension-analyst', {
      body: {
        hermeticChunk,
        previousInsights,
        blueprintContext
      }
    });
    
    if (error) throw new Error(`Spiritual Dimension Analyst failed: ${error.message}`);
    return data.content;
  }
}

class AdaptiveFeedbackAnalyst implements IntelligenceAnalyst {
  name = "Adaptive Feedback Analyst";
  dimension = "adaptive_feedback";

  async generateReport(hermeticChunk: string, previousInsights: string, blueprintContext: any): Promise<string> {
    const prompt = `
As the Adaptive Feedback Analyst, analyze reflection patterns, feedback receptivity, and change adaptation:

HERMETIC ANALYSIS INPUT: ${hermeticChunk}
PREVIOUS INSIGHTS: ${previousInsights}
BLUEPRINT CONTEXT: ${JSON.stringify(blueprintContext, null, 2)}

Generate a comprehensive 3,000-4,000 word analysis covering learning styles, feedback integration patterns, and adaptive capacity for growth and change.
`;

    const { data, error } = await supabase.functions.invoke('adaptive-feedback-analyst', {
      body: {
        hermeticChunk,
        previousInsights,
        blueprintContext
      }
    });
    
    if (error) throw new Error(`Adaptive Feedback Analyst failed: ${error.message}`);
    return data.content;
  }
}

class TemporalBiologyAnalyst implements IntelligenceAnalyst {
  name = "Temporal Biology Analyst";
  dimension = "temporal_biology";

  async generateReport(hermeticChunk: string, previousInsights: string, blueprintContext: any): Promise<string> {
    const prompt = `
As the Temporal Biology Analyst, analyze biological rhythms, cognitive peaks, and temporal patterns:

HERMETIC ANALYSIS INPUT: ${hermeticChunk}
PREVIOUS INSIGHTS: ${previousInsights}
BLUEPRINT CONTEXT: ${JSON.stringify(blueprintContext, null, 2)}

Generate a comprehensive 3,000-4,000 word analysis covering natural energy cycles, optimal performance windows, and chronobiological patterns.
`;

    const { data, error } = await supabase.functions.invoke('temporal-biology-analyst', {
      body: {
        hermeticChunk,
        previousInsights,
        blueprintContext
      }
    });
    
    if (error) throw new Error(`Temporal Biology Analyst failed: ${error.message}`);
    return data.content;
  }
}

class MetacognitiveBiasesAnalyst implements IntelligenceAnalyst {
  name = "Metacognitive Biases Analyst";
  dimension = "metacognitive_biases";

  async generateReport(hermeticChunk: string, previousInsights: string, blueprintContext: any): Promise<string> {
    const prompt = `
As the Metacognitive Biases Analyst, analyze thinking patterns, cognitive biases, and self-judgment systems:

HERMETIC ANALYSIS INPUT: ${hermeticChunk}
PREVIOUS INSIGHTS: ${previousInsights}
BLUEPRINT CONTEXT: ${JSON.stringify(blueprintContext, null, 2)}

Generate a comprehensive 3,000-4,000 word analysis covering cognitive biases, perception filters, and metacognitive awareness patterns.
`;

    const { data, error } = await supabase.functions.invoke('metacognitive-biases-analyst', {
      body: {
        hermeticChunk,
        previousInsights,
        blueprintContext
      }
    });
    
    if (error) throw new Error(`Metacognitive Biases Analyst failed: ${error.message}`);
    return data.content;
  }
}

class AttachmentStyleAnalyst implements IntelligenceAnalyst {
  name = "Attachment Style Analyst";
  dimension = "attachment_style";

  async generateReport(hermeticChunk: string, previousInsights: string, blueprintContext: any): Promise<string> {
    const prompt = `
As the Attachment Style Analyst, analyze relational patterns, repair tendencies, and authority relationships:

HERMETIC ANALYSIS INPUT: ${hermeticChunk}
PREVIOUS INSIGHTS: ${previousInsights}
BLUEPRINT CONTEXT: ${JSON.stringify(blueprintContext, null, 2)}

Generate a comprehensive 3,000-4,000 word analysis covering attachment patterns, relationship dynamics, and authority archetype interactions.
`;

    const { data, error } = await supabase.functions.invoke('attachment-style-analyst', {
      body: {
        hermeticChunk,
        previousInsights,
        blueprintContext
      }
    });
    
    if (error) throw new Error(`Attachment Style Analyst failed: ${error.message}`);
    return data.content;
  }
}

class GoalArchetypesAnalyst implements IntelligenceAnalyst {
  name = "Goal Archetypes Analyst";
  dimension = "goal_archetypes";

  async generateReport(hermeticChunk: string, previousInsights: string, blueprintContext: any): Promise<string> {
    const prompt = `
As the Goal Archetypes Analyst, analyze motivation structures, achievement orientations, and goal-setting patterns:

HERMETIC ANALYSIS INPUT: ${hermeticChunk}
PREVIOUS INSIGHTS: ${previousInsights}
BLUEPRINT CONTEXT: ${JSON.stringify(blueprintContext, null, 2)}

Generate a comprehensive 3,000-4,000 word analysis covering goal orientation patterns, motivation structures, and achievement friction points.
`;

    const { data, error } = await supabase.functions.invoke('goal-archetypes-analyst', {
      body: {
        hermeticChunk,
        previousInsights,
        blueprintContext
      }
    });
    
    if (error) throw new Error(`Goal Archetypes Analyst failed: ${error.message}`);
    return data.content;
  }
}

class CrisisHandlingAnalyst implements IntelligenceAnalyst {
  name = "Crisis Handling Analyst";
  dimension = "crisis_handling";

  async generateReport(hermeticChunk: string, previousInsights: string, blueprintContext: any): Promise<string> {
    const prompt = `
As the Crisis Handling Analyst, analyze stress responses, resilience patterns, and recovery mechanisms:

HERMETIC ANALYSIS INPUT: ${hermeticChunk}
PREVIOUS INSIGHTS: ${previousInsights}
BLUEPRINT CONTEXT: ${JSON.stringify(blueprintContext, null, 2)}

Generate a comprehensive 3,000-4,000 word analysis covering crisis response patterns, resilience mechanisms, and stress recovery strategies.
`;

    const { data, error } = await supabase.functions.invoke('crisis-handling-analyst', {
      body: {
        hermeticChunk,
        previousInsights,
        blueprintContext
      }
    });
    
    if (error) throw new Error(`Crisis Handling Analyst failed: ${error.message}`);
    return data.content;
  }
}

class IdentityFlexibilityAnalyst implements IntelligenceAnalyst {
  name = "Identity Flexibility Analyst";
  dimension = "identity_flexibility";

  async generateReport(hermeticChunk: string, previousInsights: string, blueprintContext: any): Promise<string> {
    const prompt = `
As the Identity Flexibility Analyst, analyze narrative adaptability, reinvention patterns, and identity coherence:

HERMETIC ANALYSIS INPUT: ${hermeticChunk}
PREVIOUS INSIGHTS: ${previousInsights}
BLUEPRINT CONTEXT: ${JSON.stringify(blueprintContext, null, 2)}

Generate a comprehensive 3,000-4,000 word analysis covering identity adaptability, narrative flexibility, and reinvention capacity.
`;

    const { data, error } = await supabase.functions.invoke('identity-flexibility-analyst', {
      body: {
        hermeticChunk,
        previousInsights,
        blueprintContext
      }
    });
    
    if (error) throw new Error(`Identity Flexibility Analyst failed: ${error.message}`);
    return data.content;
  }
}

class LinguisticFingerprintAnalyst implements IntelligenceAnalyst {
  name = "Linguistic Fingerprint Analyst";
  dimension = "linguistic_fingerprint";

  async generateReport(hermeticChunk: string, previousInsights: string, blueprintContext: any): Promise<string> {
    const prompt = `
As the Linguistic Fingerprint Analyst, analyze language patterns, metaphor usage, and communication style:

HERMETIC ANALYSIS INPUT: ${hermeticChunk}
PREVIOUS INSIGHTS: ${previousInsights}
BLUEPRINT CONTEXT: ${JSON.stringify(blueprintContext, null, 2)}

Generate a comprehensive 3,000-4,000 word analysis covering signature metaphors, motivational language patterns, and emotional communication syntax.
`;

    const { data, error } = await supabase.functions.invoke('linguistic-fingerprint-analyst', {
      body: {
        hermeticChunk,
        previousInsights,
        blueprintContext
      }
    });
    
    if (error) throw new Error(`Linguistic Fingerprint Analyst failed: ${error.message}`);
    return data.content;
  }
}

export class IntelligenceReportOrchestrator {
  private analysts: IntelligenceAnalyst[] = [
    new IdentityConstructsAnalyst(),
    new BehavioralTriggersAnalyst(),
    new ExecutionBiasAnalyst(),
    new InternalConflictsAnalyst(),
    new SpiritualDimensionAnalyst(),
    new AdaptiveFeedbackAnalyst(),
    new TemporalBiologyAnalyst(),
    new MetacognitiveBiasesAnalyst(),
    new AttachmentStyleAnalyst(),
    new GoalArchetypesAnalyst(),
    new CrisisHandlingAnalyst(),
    new IdentityFlexibilityAnalyst(),
    new LinguisticFingerprintAnalyst(),
  ];

  async generateIntelligenceReport(
    userId: string,
    hermeticReport: any,
    blueprintData: any
  ): Promise<IntelligenceReport> {
    console.log('🧠 Starting Intelligence Report Generation for user:', userId);
    
    const report: Partial<IntelligenceReport> = {};
    let cumulativeInsights = "";

    // Sequential processing through all analysts
    for (const analyst of this.analysts) {
      try {
        console.log(`🔍 Processing ${analyst.name}...`);
        
        // Extract relevant hermetic chunk for this analyst
        const hermeticChunk = this.extractRelevantHermeticChunk(hermeticReport, analyst.dimension);
        
        // Generate analysis with cumulative insights
        const analysisReport = await analyst.generateReport(
          hermeticChunk,
          cumulativeInsights,
          blueprintData
        );

        // Store in report
        report[analyst.dimension as keyof IntelligenceReport] = analysisReport;
        
        // Add key insights to cumulative knowledge for next analyst
        cumulativeInsights += `\n\n${analyst.name} Key Insights:\n${this.extractKeyInsights(analysisReport)}`;
        
        console.log(`✅ Completed ${analyst.name} - ${analysisReport.length} words`);
        
      } catch (error) {
        console.error(`❌ Error in ${analyst.name}:`, error);
        report[analyst.dimension as keyof IntelligenceReport] = `Error generating ${analyst.name} analysis: ${error.message}`;
      }
    }

    // Store complete intelligence report
    await this.storeIntelligenceReport(userId, report as IntelligenceReport);
    
    console.log('🎉 Intelligence Report Generation Complete');
    return report as IntelligenceReport;
  }

  private extractRelevantHermeticChunk(hermeticReport: any, dimension: string): string {
    // Extract relevant sections from hermetic report for each dimension
    const relevantSections = {
      identity_constructs: [hermeticReport.core_personality_pattern, hermeticReport.integrated_summary],
      behavioral_triggers: [hermeticReport.decision_making_style, hermeticReport.relationship_style],
      execution_bias: [hermeticReport.decision_making_style, hermeticReport.life_path_purpose],
      internal_conflicts: [hermeticReport.shadow_work_integration, hermeticReport.core_personality_pattern],
      spiritual_dimension: [hermeticReport.life_path_purpose, hermeticReport.integrated_summary],
      adaptive_feedback: [hermeticReport.consciousness_integration_map, hermeticReport.practical_activation_framework],
      temporal_biology: [hermeticReport.current_energy_timing, hermeticReport.hermetic_fractal_analysis],
      metacognitive_biases: [hermeticReport.decision_making_style, hermeticReport.consciousness_integration_map],
      attachment_style: [hermeticReport.relationship_style, hermeticReport.shadow_work_integration],
      goal_archetypes: [hermeticReport.life_path_purpose, hermeticReport.practical_activation_framework],
      crisis_handling: [hermeticReport.shadow_work_integration, hermeticReport.relationship_style],
      identity_flexibility: [hermeticReport.core_personality_pattern, hermeticReport.hermetic_fractal_analysis],
      linguistic_fingerprint: [hermeticReport.integrated_summary, hermeticReport.core_personality_pattern]
    };

    const sections = relevantSections[dimension as keyof typeof relevantSections] || [hermeticReport.integrated_summary];
    return sections.filter(Boolean).join('\n\n');
  }

  private extractKeyInsights(analysisReport: string): string {
    // Extract first paragraph and key points from each section
    const paragraphs = analysisReport.split('\n\n').slice(0, 3);
    return paragraphs.join('\n').substring(0, 500) + '...';
  }

  private async storeIntelligenceReport(userId: string, report: IntelligenceReport): Promise<void> {
    try {
      // Store in user_activities for now since intelligence_reports table doesn't exist yet
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          activity_type: 'intelligence_report_generated',
          activity_data: {
            report_content: report as any,
            generated_at: new Date().toISOString(),
            report_version: '1.0'
          }
        });

      if (error) {
        console.error('❌ Error storing intelligence report:', error);
        throw error;
      }

      console.log('✅ Intelligence report stored successfully');
    } catch (error) {
      console.error('❌ Failed to store intelligence report:', error);
      throw error;
    }
  }
}

export const intelligenceReportOrchestrator = new IntelligenceReportOrchestrator();