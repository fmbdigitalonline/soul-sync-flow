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
  somatic_markers: string;
  relational_dynamics: string;
  consciousness_integration: string;
  shadow_work_integration: string;
  hermetic_fractal_analysis: string;
  transformation_phases: string;
  polarity_integration: string;
  gate_analysis: string;
  spiritual_psychology: string;
  metamorphosis_patterns: string;
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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

// Continue with remaining analysts...
class SomaticMarkersAnalyst implements IntelligenceAnalyst {
  name = "Somatic Markers Analyst";
  dimension = "somatic_markers";

  async generateReport(hermeticChunk: string, previousInsights: string, blueprintContext: any): Promise<string> {
    const prompt = `
As the Somatic Markers Analyst, analyze the body wisdom and embodied intelligence patterns:

HERMETIC ANALYSIS INPUT: ${hermeticChunk}
PREVIOUS INSIGHTS: ${previousInsights}
BLUEPRINT CONTEXT: ${JSON.stringify(blueprintContext, null, 2)}

Generate a comprehensive 3,000-4,000 word analysis of body intelligence, somatic patterns, physical manifestations of psychological states, and embodiment practices. Focus on how the body communicates wisdom and guidance through sensations, tensions, and energy flow patterns.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

export class IntelligenceReportOrchestrator {
  private analysts: IntelligenceAnalyst[] = [
    new IdentityConstructsAnalyst(),
    new BehavioralTriggersAnalyst(),
    new ExecutionBiasAnalyst(),
    new SomaticMarkersAnalyst(),
    // Additional 9 analysts will be created in subsequent iterations
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
      somatic_markers: [hermeticReport.current_energy_timing, hermeticReport.core_personality_pattern]
    };

    const sections = relevantSections[dimension as keyof typeof relevantSections] || [hermeticReport.integrated_summary];
    return sections.join('\n\n');
  }

  private extractKeyInsights(analysisReport: string): string {
    // Extract first paragraph and key points from each section
    const paragraphs = analysisReport.split('\n\n').slice(0, 3);
    return paragraphs.join('\n').substring(0, 500) + '...';
  }

  private async storeIntelligenceReport(userId: string, report: IntelligenceReport): Promise<void> {
    try {
      const { error } = await supabase
        .from('intelligence_reports')
        .insert({
          user_id: userId,
          report_content: report,
          generated_at: new Date().toISOString(),
          report_version: '1.0'
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