import { supabase } from "@/integrations/supabase/client";
import { BlueprintData } from "./blueprint-service";

export interface HermeticAnalysisSection {
  agent_type: string;
  content: string;
  word_count: number;
  hermetic_law?: string;
  gate_number?: number;
}

export interface HermeticReportResult {
  sections: HermeticAnalysisSection[];
  synthesis: string;
  consciousness_map: string;
  practical_applications: string;
  blueprint_signature: string;
  total_word_count: number;
  generated_at: string;
}

const HERMETIC_AGENTS = [
  'mentalism_analyst',
  'correspondence_analyst', 
  'vibration_analyst',
  'polarity_analyst',
  'rhythm_analyst',
  'causation_analyst',
  'gender_analyst'
];

const SYSTEM_TRANSLATORS = [
  'mbti_hermetic_translator',
  'astrology_hermetic_translator',
  'numerology_hermetic_translator', 
  'human_design_hermetic_translator',
  'chinese_astrology_hermetic_translator'
];

class HermeticReportOrchestrator {
  private safeExtractContent(data: any, context: string = ''): string {
    if (!data) {
      console.warn(`⚠️ No data received for ${context}`);
      return 'No content returned.';
    }

    let content = data.content || data;
    
    if (typeof content === 'object' && content !== null) {
      console.log(`🔍 Object content detected for ${context}:`, content);
      return JSON.stringify(content, null, 2);
    }
    
    if (typeof content !== 'string') {
      console.warn(`⚠️ Non-string content for ${context}:`, typeof content, content);
      return String(content || 'No content available');
    }
    
    return content;
  }

  private extractHumanDesignGates(blueprint: BlueprintData): number[] {
    console.log('🔍 Extracting Human Design gates from blueprint...');
    
    const gates: number[] = [];
    const hdData = blueprint.energy_strategy_human_design;
    
    if (!hdData) {
      console.warn('⚠️ No Human Design data found in blueprint');
      return [];
    }

    // Check for gates in various possible locations
    if (hdData.gates && Array.isArray(hdData.gates)) {
      gates.push(...hdData.gates.map(g => typeof g === 'object' ? g.gate : g).filter(Boolean));
    }
    
    if (hdData.personality_gates && Array.isArray(hdData.personality_gates)) {
      gates.push(...hdData.personality_gates.map(g => typeof g === 'object' ? g.gate : g).filter(Boolean));
    }
    
    if (hdData.design_gates && Array.isArray(hdData.design_gates)) {
      gates.push(...hdData.design_gates.map(g => typeof g === 'object' ? g.gate : g).filter(Boolean));
    }

    // Check for gates in centers data
    if (hdData.centers) {
      Object.values(hdData.centers).forEach((center: any) => {
        if (center && center.gates && Array.isArray(center.gates)) {
          gates.push(...center.gates.map(g => typeof g === 'object' ? g.gate : g).filter(Boolean));
        }
      });
    }

    // Remove duplicates and sort
    const uniqueGates = [...new Set(gates)].sort((a, b) => a - b);
    console.log(`🚪 Found ${uniqueGates.length} unique gates:`, uniqueGates);
    
    return uniqueGates;
  }

  private async generateGateAnalysis(blueprint: BlueprintData, gates: number[]): Promise<HermeticAnalysisSection[]> {
    console.log('🚪 Starting Gate-by-Gate Analysis phase...');
    const sections: HermeticAnalysisSection[] = [];
    
    for (const gateNumber of gates) {
      console.log(`🔍 Analyzing Gate ${gateNumber} through all 7 Hermetic Laws...`);
      
      try {
        const { data, error } = await supabase.functions.invoke('openai-agent', {
          body: {
            messages: [
              {
                role: 'system',
                content: `You are the Gate Hermetic Analyst. Analyze Human Design Gate ${gateNumber} through all 7 Hermetic Laws.

Generate 1,200+ words analyzing Gate ${gateNumber} through:
1. Mentalism - Mental patterns and thought structures
2. Correspondence - Inner-outer manifestation patterns  
3. Vibration - Energetic frequency and resonance
4. Polarity - Shadow integration and balance points
5. Rhythm - Timing cycles and natural rhythms
6. Causation - Cause-effect patterns and conscious creation
7. Gender - Creative-receptive energy balance

Include practical applications for activating Gate ${gateNumber} wisdom.`
              },
              {
                role: 'user',
                content: `Analyze Gate ${gateNumber} through all 7 Hermetic Laws for this blueprint:

Blueprint Data: ${JSON.stringify(blueprint, null, 2)}

Focus on Gate ${gateNumber} specifically and how it expresses through each Hermetic Law. Provide detailed analysis with practical applications.`
              }
            ],
            model: 'gpt-4o-mini',
            temperature: 0.7,
            tools: [
              {
                type: 'function',
                function: {
                  name: 'analyze_gate_through_hermetic_laws',
                  description: 'Analyze specific Human Design gate through all 7 Hermetic Laws',
                  parameters: {
                    type: 'object',
                    properties: {
                      gate_number: { type: 'number' },
                      gate_data: { type: 'object' },
                      blueprint_context: { type: 'object' },
                      analysis_depth: { type: 'string' }
                    },
                    required: ['gate_number', 'blueprint_context']
                  }
                }
              }
            ]
          }
        });

        if (error) {
          console.error(`❌ Error analyzing Gate ${gateNumber}:`, error);
          continue;
        }

        const content = this.safeExtractContent(data, `Gate ${gateNumber} Analysis`);
        
        sections.push({
          agent_type: 'gate_hermetic_analyst',
          content: content,
          word_count: content.length,
          gate_number: gateNumber
        });

        console.log(`✅ Gate ${gateNumber} analysis complete (${content.length} chars)`);
        
      } catch (error) {
        console.error(`❌ Failed to analyze Gate ${gateNumber}:`, error);
      }
    }

    console.log(`🚪 Gate-by-Gate Analysis complete: ${sections.length} gates analyzed`);
    return sections;
  }

  async generateHermeticReport(blueprint: BlueprintData): Promise<HermeticReportResult> {
    console.log('🌟 Starting comprehensive Hermetic Report generation...');
    const startTime = Date.now();
    const sections: HermeticAnalysisSection[] = [];

    try {
      // Phase 1: System Integration (2,000+ words)
      console.log('📋 Phase 1: System Integration Analysis...');
      const systemSections = await this.generateSystemTranslation(blueprint);
      sections.push(...systemSections);

      // Phase 2: Enhanced Hermetic Laws (1,500+ words each = 10,500+ words)
      console.log('🔮 Phase 2: Enhanced Hermetic Law Analysis...');
      const hermeticSections = await this.generateHermeticLawAnalysis(blueprint);
      sections.push(...hermeticSections);

      // Phase 3: Gate-by-Gate Analysis (NEW - 8,000+ words)
      console.log('🚪 Phase 3: Gate-by-Gate Hermetic Analysis...');
      const gates = this.extractHumanDesignGates(blueprint);
      
      if (gates.length > 0) {
        const gateSections = await this.generateGateAnalysis(blueprint, gates);
        sections.push(...gateSections);
      } else {
        console.warn('⚠️ No gates found for analysis - skipping gate phase');
      }

      // Phase 4: Synthesis & Integration (4,500+ words)
      console.log('🌀 Phase 4: Synthesis and Integration...');
      const synthesis = await this.generateFractalSynthesis(blueprint, sections);
      const consciousnessMap = await this.generateConsciousnessMap(blueprint, sections);
      const practicalApplications = await this.generatePracticalApplications(blueprint, sections);

      const totalWordCount = sections.reduce((total, section) => total + section.word_count, 0) +
                           synthesis.length + consciousnessMap.length + practicalApplications.length;

      console.log(`✅ Hermetic Report complete: ${totalWordCount} total characters`);

      return {
        sections,
        synthesis,
        consciousness_map: consciousnessMap,
        practical_applications: practicalApplications,
        blueprint_signature: this.generateBlueprintSignature(blueprint),
        total_word_count: Math.floor(totalWordCount / 5), // Rough word estimate
        generated_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Hermetic report generation failed:', error);
      throw error;
    }
  }

  private async generateHermeticLawAnalysis(blueprint: BlueprintData): Promise<HermeticAnalysisSection[]> {
    console.log('🔮 Generating enhanced Hermetic Law analysis...');
    const sections: HermeticAnalysisSection[] = [];

    for (const agent of HERMETIC_AGENTS) {
      try {
        const { data, error } = await supabase.functions.invoke('openai-agent', {
          body: {
            messages: [
              {
                role: 'system',
                content: `You are the ${agent}. Generate 1,500+ words analyzing the blueprint through your specific Hermetic Law. Focus on deep insights, practical applications, and consciousness activation techniques.`
              },
              {
                role: 'user',
                content: `Analyze this blueprint through your Hermetic Law expertise:

${JSON.stringify(blueprint, null, 2)}

Generate comprehensive analysis with practical applications.`
              }
            ],
            model: 'gpt-4o-mini',
            temperature: 0.7
          }
        });

        if (error) {
          console.error(`❌ Error with ${agent}:`, error);
          continue;
        }

        const content = this.safeExtractContent(data, agent);
        
        sections.push({
          agent_type: agent,
          content: content,
          word_count: content.length,
          hermetic_law: agent.replace('_analyst', '')
        });

      } catch (error) {
        console.error(`❌ Failed to generate ${agent}:`, error);
      }
    }

    return sections;
  }

  private async generateSystemTranslation(blueprint: BlueprintData): Promise<HermeticAnalysisSection[]> {
    console.log('🔄 Generating system translations...');
    const sections: HermeticAnalysisSection[] = [];

    for (const translator of SYSTEM_TRANSLATORS) {
      try {
        const { data, error } = await supabase.functions.invoke('openai-agent', {
          body: {
            messages: [
              {
                role: 'system',
                content: `You are the ${translator}. Translate the personality system through all 7 Hermetic Laws. Generate 400+ words of integration analysis.`
              },
              {
                role: 'user',
                content: `Translate this system through Hermetic Laws:

${JSON.stringify(blueprint, null, 2)}

Focus on your specific system expertise.`
              }
            ],
            model: 'gpt-4o-mini',
            temperature: 0.6
          }
        });

        if (error) {
          console.error(`❌ Error with ${translator}:`, error);
          continue;
        }

        const content = this.safeExtractContent(data, translator);
        
        sections.push({
          agent_type: translator,
          content: content,
          word_count: content.length
        });

      } catch (error) {
        console.error(`❌ Failed to generate ${translator}:`, error);
      }
    }

    return sections;
  }

  private async generateFractalSynthesis(blueprint: BlueprintData, sections: HermeticAnalysisSection[]): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('openai-agent', {
        body: {
          messages: [
            {
              role: 'system',
              content: 'You are the Fractal Synthesizer. Create 1,500+ words synthesizing all analyses into unified fractal patterns.'
            },
            {
              role: 'user',
              content: `Synthesize these analyses into fractal patterns:

${sections.map(s => `${s.agent_type}: ${s.content.substring(0, 500)}...`).join('\n\n')}`
            }
          ],
          model: 'gpt-4o-mini',
          temperature: 0.6
        }
      });

      if (error) throw error;
      return this.safeExtractContent(data, 'Fractal Synthesis');
      
    } catch (error) {
      console.error('❌ Synthesis generation failed:', error);
      return 'Synthesis generation failed';
    }
  }

  private async generateConsciousnessMap(blueprint: BlueprintData, sections: HermeticAnalysisSection[]): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('openai-agent', {
        body: {
          messages: [
            {
              role: 'system',
              content: 'You are the Consciousness Mapper. Generate 1,500+ words mapping consciousness across dimensions.'
            },
            {
              role: 'user',
              content: `Map consciousness dimensions from these analyses:

${sections.map(s => `${s.agent_type}: ${s.content.substring(0, 300)}...`).join('\n\n')}`
            }
          ],
          model: 'gpt-4o-mini',
          temperature: 0.6
        }
      });

      if (error) throw error;
      return this.safeExtractContent(data, 'Consciousness Map');
      
    } catch (error) {
      console.error('❌ Consciousness mapping failed:', error);
      return 'Consciousness mapping failed';
    }
  }

  private async generatePracticalApplications(blueprint: BlueprintData, sections: HermeticAnalysisSection[]): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('openai-agent', {
        body: {
          messages: [
            {
              role: 'system',
              content: 'You are the Practical Application Generator. Generate 1,500+ words of actionable practices and applications.'
            },
            {
              role: 'user',
              content: `Generate practical applications from these insights:

${sections.map(s => `${s.agent_type}: ${s.content.substring(0, 300)}...`).join('\n\n')}`
            }
          ],
          model: 'gpt-4o-mini',
          temperature: 0.6
        }
      });

      if (error) throw error;
      return this.safeExtractContent(data, 'Practical Applications');
      
    } catch (error) {
      console.error('❌ Practical applications generation failed:', error);
      return 'Practical applications generation failed';
    }
  }

  private generateBlueprintSignature(blueprint: BlueprintData): string {
    const elements = [
      blueprint.cognition_mbti?.type || 'Unknown',
      blueprint.energy_strategy_human_design?.type || 'Unknown',
      blueprint.archetype_western?.sun_sign || 'Unknown',
      blueprint.values_life_path?.lifePathNumber || 'Unknown'
    ];
    
    return elements.join('-');
  }
}

export const hermeticReportOrchestrator = new HermeticReportOrchestrator();
