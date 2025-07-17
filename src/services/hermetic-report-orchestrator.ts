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
    console.log('🔍 Full blueprint structure:', JSON.stringify(blueprint, null, 2));
    
    const gates: number[] = [];
    const hdData = blueprint.energy_strategy_human_design;
    
    if (!hdData) {
      console.warn('⚠️ No Human Design data found in blueprint');
      return [];
    }

    console.log('🔍 Human Design data structure:', JSON.stringify(hdData, null, 2));

    // Enhanced gate extraction - check all possible structures comprehensively
    // Check for gates in the main gates object
    if (hdData.gates) {
      console.log('🔍 Found gates object:', hdData.gates);
      
      // Check conscious personality gates
      if (hdData.gates.conscious_personality && Array.isArray(hdData.gates.conscious_personality)) {
        console.log('🔍 Found conscious_personality gates:', hdData.gates.conscious_personality);
        hdData.gates.conscious_personality.forEach((gateData: any) => {
          if (gateData && gateData.gate && typeof gateData.gate === 'number') {
            gates.push(gateData.gate);
            console.log(`🚪 Added conscious personality gate: ${gateData.gate}`);
          }
        });
      }
      
      // Check unconscious personality gates (often missed)
      if (hdData.gates.unconscious_personality && Array.isArray(hdData.gates.unconscious_personality)) {
        console.log('🔍 Found unconscious_personality gates:', hdData.gates.unconscious_personality);
        hdData.gates.unconscious_personality.forEach((gateData: any) => {
          if (gateData && gateData.gate && typeof gateData.gate === 'number') {
            gates.push(gateData.gate);
            console.log(`🚪 Added unconscious personality gate: ${gateData.gate}`);
          }
        });
      }
      
      // Check conscious design gates
      if (hdData.gates.conscious_design && Array.isArray(hdData.gates.conscious_design)) {
        console.log('🔍 Found conscious_design gates:', hdData.gates.conscious_design);
        hdData.gates.conscious_design.forEach((gateData: any) => {
          if (gateData && gateData.gate && typeof gateData.gate === 'number') {
            gates.push(gateData.gate);
            console.log(`🚪 Added conscious design gate: ${gateData.gate}`);
          }
        });
      }
      
      // Check unconscious design gates
      if (hdData.gates.unconscious_design && Array.isArray(hdData.gates.unconscious_design)) {
        console.log('🔍 Found unconscious_design gates:', hdData.gates.unconscious_design);
        hdData.gates.unconscious_design.forEach((gateData: any) => {
          if (gateData && gateData.gate && typeof gateData.gate === 'number') {
            gates.push(gateData.gate);
            console.log(`🚪 Added unconscious design gate: ${gateData.gate}`);
          }
        });
      }
    }

    // Also check direct gate arrays (fallback for different data structures)
    if (hdData.personality_gates && Array.isArray(hdData.personality_gates)) {
      console.log('🔍 Found personality_gates array:', hdData.personality_gates);
      hdData.personality_gates.forEach((gateData: any) => {
        const gateNum = typeof gateData === 'object' ? gateData.gate : gateData;
        if (typeof gateNum === 'number') {
          gates.push(gateNum);
          console.log(`🚪 Added personality gate: ${gateNum}`);
        }
      });
    }
    
    if (hdData.design_gates && Array.isArray(hdData.design_gates)) {
      console.log('🔍 Found design_gates array:', hdData.design_gates);
      hdData.design_gates.forEach((gateData: any) => {
        const gateNum = typeof gateData === 'object' ? gateData.gate : gateData;
        if (typeof gateNum === 'number') {
          gates.push(gateNum);
          console.log(`🚪 Added design gate: ${gateNum}`);
        }
      });
    }

    // Check for gates in centers data
    if (hdData.centers) {
      console.log('🔍 Checking centers for gates:', Object.keys(hdData.centers));
      Object.values(hdData.centers).forEach((center: any) => {
        if (center && center.gates && Array.isArray(center.gates)) {
          center.gates.forEach((gateData: any) => {
            const gateNum = typeof gateData === 'object' ? gateData.gate : gateData;
            if (typeof gateNum === 'number') {
              gates.push(gateNum);
              console.log(`🚪 Added center gate: ${gateNum}`);
            }
          });
        }
      });
    }

    // Check for planets with gates (astrology mapping)
    if (hdData.planets) {
      console.log('🔍 Checking planets for gates:', Object.keys(hdData.planets));
      Object.values(hdData.planets).forEach((planet: any) => {
        if (planet && planet.gate && typeof planet.gate === 'number') {
          gates.push(planet.gate);
          console.log(`🚪 Added planet gate: ${planet.gate}`);
        }
      });
    }

    // Check for channels data which contains gates
    if (hdData.channels) {
      console.log('🔍 Checking channels for gates:', hdData.channels);
      hdData.channels.forEach((channel: any) => {
        if (channel && channel.gates && Array.isArray(channel.gates)) {
          channel.gates.forEach((gateNum: any) => {
            if (typeof gateNum === 'number') {
              gates.push(gateNum);
              console.log(`🚪 Added channel gate: ${gateNum}`);
            }
          });
        }
      });
    }

    // Check for any other gate properties in the HD data
    Object.keys(hdData).forEach(key => {
      if (key.toLowerCase().includes('gate') && Array.isArray(hdData[key])) {
        console.log(`🔍 Found additional gate array: ${key}`, hdData[key]);
        hdData[key].forEach((gateData: any) => {
          const gateNum = typeof gateData === 'object' ? gateData.gate : gateData;
          if (typeof gateNum === 'number') {
            gates.push(gateNum);
            console.log(`🚪 Added ${key} gate: ${gateNum}`);
          }
        });
      }
    });

    // Remove duplicates and sort
    const uniqueGates = [...new Set(gates)].sort((a, b) => a - b);
    console.log(`🚪 Final extracted gates (${uniqueGates.length} unique):`, uniqueGates);
    
    // Note: Human Design charts typically have 19-20 unique activated gates, not 26
    // The initial 26 count includes duplicates from conscious/unconscious and personality/design
    console.log(`✅ Successfully extracted ${uniqueGates.length} unique gates for analysis`);
    
    return uniqueGates;
  }

  private async generateGateAnalysis(blueprint: BlueprintData, gates: number[]): Promise<HermeticAnalysisSection[]> {
    console.log(`🚪 Starting Gate-by-Gate Analysis phase for ${gates.length} gates...`);
    const sections: HermeticAnalysisSection[] = [];
    
    for (const gateNumber of gates) {
      console.log(`🔍 Analyzing Gate ${gateNumber} through all 7 Hermetic Laws...`);
      
      try {
        const { data, error } = await supabase.functions.invoke('openai-agent', {
          body: {
            messages: [
              {
                role: 'system',
                content: `You are the Gate Hermetic Analyst. You specialize in analyzing specific Human Design gates through the lens of the 7 Hermetic Laws with deep shadow work integration.

Your task is to provide a comprehensive 1,500+ word analysis of Gate ${gateNumber} through all 7 Hermetic Laws with shadow integration:

1. MENTALISM - How this gate influences mental patterns, thoughts, and consciousness
   - Include shadow mental patterns and unconscious programming
   - Light aspect: conscious mental mastery
   
2. CORRESPONDENCE - How this gate manifests "as above, so below" - inner and outer reflections
   - Shadow correspondence: how inner wounds reflect in outer reality
   - Light correspondence: how inner mastery creates external harmony
   
3. VIBRATION - The energetic frequency and vibrational qualities of this gate
   - Low vibration shadow expressions and triggers
   - High vibration light expressions and elevating practices
   
4. POLARITY - The opposing forces and shadow/light aspects of this gate
   - Deep exploration of the shadow side and its gifts
   - Integration practices for balancing polarities
   
5. RHYTHM - The natural cycles, timing, and rhythmic patterns of this gate
   - Shadow rhythm disruptions and when energy goes awry
   - Sacred timing and natural flow states
   
6. CAUSATION - The cause-and-effect patterns and how conscious choice activates this gate
   - Unconscious reactive patterns and their consequences
   - Conscious response patterns and their transformative effects
   
7. GENDER - The creative/receptive, active/passive energy dynamics of this gate
   - Shadow expressions of masculine/feminine imbalances
   - Integrated gender energy expressions

Include practical shadow work techniques and conscious activation practices for Gate ${gateNumber}.

Generate a comprehensive, flowing analysis that integrates all 7 laws with deep shadow work naturally.`
              },
              {
                role: 'user',
                content: `Analyze Gate ${gateNumber} through all 7 Hermetic Laws for this individual's blueprint:

Blueprint Context: ${JSON.stringify(blueprint, null, 2)}

Focus specifically on Gate ${gateNumber} and how it expresses through each Hermetic Law in this person's unique configuration. Provide detailed analysis with practical applications for conscious gate activation.

Generate 1,200+ words of deep, integrated analysis.`
              }
            ],
            model: 'gpt-4o-mini',
            temperature: 0.7
          }
        });

        if (error) {
          console.error(`❌ Error analyzing Gate ${gateNumber}:`, error);
          continue;
        }

        const content = this.safeExtractContent(data, `Gate ${gateNumber} Analysis`);
        
        const section: HermeticAnalysisSection = {
          agent_type: 'gate_hermetic_analyst',
          content: content,
          word_count: content.length,
          gate_number: gateNumber
        };
        
        sections.push(section);
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
      console.log(`📋 Phase 1 complete: ${systemSections.length} sections added`);

      // Phase 2: Enhanced Hermetic Laws (1,500+ words each = 10,500+ words)
      console.log('🔮 Phase 2: Enhanced Hermetic Law Analysis...');
      const hermeticSections = await this.generateHermeticLawAnalysis(blueprint);
      sections.push(...hermeticSections);
      console.log(`🔮 Phase 2 complete: ${hermeticSections.length} sections added`);

      // Phase 3: Gate-by-Gate Analysis (NEW - 25,000+ words)
      console.log('🚪 Phase 3: Gate-by-Gate Hermetic Analysis...');
      const gates = this.extractHumanDesignGates(blueprint);
      
      if (gates.length > 0) {
        console.log(`🚪 Found ${gates.length} gates to analyze:`, gates);
        const gateSections = await this.generateGateAnalysis(blueprint, gates);
        sections.push(...gateSections);
        console.log(`🚪 Phase 3 complete: ${gateSections.length} gate sections added`);
      } else {
        console.warn('⚠️ No gates found for analysis - skipping gate phase');
        console.log('⚠️ Blueprint HD data:', blueprint.energy_strategy_human_design);
      }

      // Phase 4: Synthesis & Integration (4,500+ words)
      console.log('🌀 Phase 4: Synthesis and Integration...');
      const synthesis = await this.generateFractalSynthesis(blueprint, sections);
      const consciousnessMap = await this.generateConsciousnessMap(blueprint, sections);
      const practicalApplications = await this.generatePracticalApplications(blueprint, sections);

      const totalCharCount = sections.reduce((total, section) => total + section.word_count, 0) +
                           synthesis.length + consciousnessMap.length + practicalApplications.length;

      const endTime = Date.now();
      console.log(`✅ Hermetic Report complete: ${totalCharCount} total characters in ${endTime - startTime}ms`);
      console.log(`📊 Report breakdown: ${sections.length} sections, ${sections.filter(s => s.gate_number).length} gate analyses`);

      return {
        sections,
        synthesis,
        consciousness_map: consciousnessMap,
        practical_applications: practicalApplications,
        blueprint_signature: this.generateBlueprintSignature(blueprint),
        total_word_count: Math.floor(totalCharCount / 5), // Rough word estimate
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
                content: `You are the ${agent}. Generate 1,500+ words analyzing the blueprint through your specific Hermetic Law with comprehensive shadow work integration. Focus on:

1. Light and shadow expressions of this law in the person's blueprint
2. Unconscious patterns and shadow projections related to this law
3. Practical shadow work techniques for integration
4. Conscious activation practices for embodying the light aspect
5. How this law's shadow shows up in relationships and life patterns
6. Transformative practices for mastering both polarities

Provide deep insights that help the person understand both their unconscious programming (shadow) and their conscious potential (light) through this Hermetic Law.`
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
                content: `You are the ${translator}. Translate the personality system through all 7 Hermetic Laws with shadow work integration. Generate 500+ words analyzing:

1. How this personality system expresses through each Hermetic Law
2. Shadow patterns and unconscious expressions of this system
3. Light expressions and conscious mastery potential
4. Integration techniques for balancing shadow and light aspects
5. How this system's energies can be consciously directed

Focus on practical shadow work and conscious activation through your specific system expertise.`
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
              content: 'You are the Fractal Synthesizer. Create 1,500+ words synthesizing all analyses into unified fractal patterns with deep shadow integration. Show how shadow and light patterns repeat across all systems and gates, creating a comprehensive map for conscious transformation.'
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
              content: 'You are the Consciousness Mapper. Generate 1,500+ words mapping consciousness across dimensions with shadow integration. Create a comprehensive map showing how to navigate from unconscious shadow patterns to conscious light mastery across all analyzed systems and gates.'
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
              content: 'You are the Practical Application Generator. Generate 1,500+ words of actionable shadow work practices and conscious activation techniques. Provide specific daily practices, meditation techniques, journaling prompts, and integration exercises for transforming shadow patterns into light mastery.'
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
