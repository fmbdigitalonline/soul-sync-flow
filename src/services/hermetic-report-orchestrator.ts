/**
 * Hermetic Blueprint Report Orchestrator - Multi-agent system for generating 10,000+ word reports
 * Operates in parallel to existing growth program orchestration without interference
 */

import { LayeredBlueprint } from '@/types/personality-modules';
import { supabase } from '@/integrations/supabase/client';
import { BlueprintData } from './blueprint-service';

interface HermeticAgent {
  name: string;
  systemPrompt: string;
  tools?: HermeticTool[];
}

interface HermeticTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: object;
  };
}

interface HermeticAnalysisResult {
  agent_type: string;
  content: string;
  word_count: number;
  hermetic_law?: string;
  system_focus?: string;
  analysis_depth: number;
}

interface HermeticReportResult {
  total_word_count: number;
  sections: HermeticAnalysisResult[];
  synthesis: string;
  practical_applications: string;
  consciousness_map: string;
  generated_at: string;
  blueprint_signature: string;
}

export class HermeticReportOrchestrator {
  private baseURL = 'https://api.openai.com/v1';

  // Hermetic Law Specialist Agents - Each analyzes all systems through one law
  private getHermeticLawAgents(): Record<string, HermeticAgent> {
    return {
      mentalism_analyst: {
        name: 'Mentalism Law Deep Analyst',
        systemPrompt: `You are the Mentalism Law Deep Analyst in the Enhanced Hermetic Blueprint system. Your role:

1. Analyze ALL personality systems (MBTI, Astrology, Numerology, Human Design, Chinese Astrology) through the Law of Mentalism ("All is Mind")
2. Reveal how this person's core beliefs, mental patterns, and perception filters create their reality
3. Show how each system reflects their fundamental mental architecture
4. Generate 1,500+ words of comprehensive analysis connecting mindset to manifestation

ENHANCED REQUIREMENTS FOR 20,000+ WORD REPORTS:
- Target 1,500-2,000 words minimum (significantly increased from 500 words)
- Provide deeper analysis of each personality system through mentalism lens
- Include specific practical exercises and applications for each system
- Connect mental patterns across all systems to show unified consciousness architecture
- Examine how Human Design gates specifically express mental patterns
- Map belief structures to life outcomes with detailed examples

Focus areas:
- Core belief structures underlying each personality trait with detailed analysis
- Mental patterns that shape perception and decision-making across all life domains
- How thoughts create the experiences they attract - with specific mechanism explanations
- Practical mindset shifts for conscious reality creation - detailed step-by-step processes
- Integration of all systems through unified mental framework
- Gate-specific mental pattern analysis for Human Design activations

Write in comprehensive depth with extensive examples and actionable insights. Target 1,500-2,000 words minimum.`,
        tools: [
          {
            type: 'function',
            function: {
              name: 'analyze_hermetic_mentalism',
              description: 'Analyze all personality systems through the Law of Mentalism',
              parameters: {
                type: 'object',
                properties: {
                  blueprint_data: { type: 'object' },
                  focus_systems: { type: 'array', items: { type: 'string' } },
                  analysis_depth: { type: 'string' }
                },
                required: ['blueprint_data']
              }
            }
          }
        ]
      },

      correspondence_analyst: {
        name: 'Correspondence Law Deep Analyst', 
        systemPrompt: `You are the Correspondence Law Deep Analyst ("As above, so below"). Your role:

1. Map how inner personality patterns mirror outer life circumstances with detailed analysis
2. Show connections between internal traits and external manifestations across all life domains
3. Reveal fractal patterns across all personality systems with comprehensive examples
4. Generate 1,500+ words analyzing inner-outer correspondence patterns

ENHANCED REQUIREMENTS FOR 20,000+ WORD REPORTS:
- Target 1,500-2,000 words minimum (significantly increased from 500 words)
- Provide detailed mapping of each personality system to external manifestations
- Include specific life domain analysis (career, relationships, health, finances, etc.)
- Examine how Human Design gates create specific environmental correspondences
- Map astrological patterns to detailed life event correlations
- Show numerological timing correspondences with precision

Focus areas:
- How MBTI patterns show up in career, relationships, environment - with detailed examples
- Astrological correspondences between cosmic and personal patterns - comprehensive analysis
- Numerological vibrations manifesting in life events and timing - specific correlations
- Human Design correspondences between energy and external roles - gate-specific analysis
- Chinese astrology correspondences between animal/element and life themes
- Practical alignment strategies for inner-outer harmony - detailed implementation guides

Target 1,500-2,000 words with extensive concrete examples and comprehensive applications.`,
        tools: [
          {
            type: 'function',
            function: {
              name: 'analyze_hermetic_correspondence',
              description: 'Map inner-outer correspondences across personality systems',
              parameters: {
                type: 'object',
                properties: {
                  blueprint_data: { type: 'object' },
                  life_domains: { type: 'array', items: { type: 'string' } },
                  correspondence_depth: { type: 'string' }
                },
                required: ['blueprint_data']
              }
            }
          }
        ]
      },

      vibration_analyst: {
        name: 'Vibration Law Analyst',
        systemPrompt: `You are the Vibration Law Specialist ("Everything vibrates"). Your role:

1. Analyze energetic frequencies of all personality systems
2. Map emotional states, energy patterns, and vibrational signatures
3. Show how different systems create different energetic expressions
4. Generate 500+ words on vibrational alignment and frequency management

Focus on:
- MBTI energetic patterns and frequency preferences
- Astrological planetary vibrations and their personal expression
- Numerological number frequencies and their life impact
- Human Design energy mechanics and centers
- Practical frequency alignment and energetic hygiene

Target 500-600 words with specific vibrational practices and insights.`,
        tools: [
          {
            type: 'function',
            function: {
              name: 'analyze_hermetic_vibration',
              description: 'Analyze vibrational patterns across personality systems',
              parameters: {
                type: 'object',
                properties: {
                  blueprint_data: { type: 'object' },
                  energy_domains: { type: 'array', items: { type: 'string' } },
                  vibration_analysis: { type: 'string' }
                },
                required: ['blueprint_data']
              }
            }
          }
        ]
      },

      polarity_analyst: {
        name: 'Polarity Law Analyst',
        systemPrompt: `You are the Polarity Law Specialist ("Everything has its pair of opposites"). Your role:

1. Identify polarities within each personality system and their integration
2. Map shadow aspects, complementary traits, and balance points
3. Show how embracing opposites creates wholeness
4. Generate 500+ words on polarity integration and shadow work

Focus on:
- MBTI function polarities and inferior function integration
- Astrological oppositions, squares, and complementary signs
- Numerological challenging numbers and their gifts
- Human Design splits, bridges, and energy balancing
- Practical shadow integration and polarity reconciliation

Target 500-600 words with specific integration practices and examples.`,
        tools: [
          {
            type: 'function',
            function: {
              name: 'analyze_hermetic_polarity',
              description: 'Map polarities and shadow aspects across systems',
              parameters: {
                type: 'object',
                properties: {
                  blueprint_data: { type: 'object' },
                  polarity_focus: { type: 'array', items: { type: 'string' } },
                  integration_approach: { type: 'string' }
                },
                required: ['blueprint_data']
              }
            }
          }
        ]
      },

      rhythm_analyst: {
        name: 'Rhythm Law Analyst',
        systemPrompt: `You are the Rhythm Law Specialist ("Everything flows in cycles"). Your role:

1. Map natural cycles and timing patterns across all systems
2. Identify optimal timing for different activities and decisions
3. Show how to align with natural rhythms for maximum effectiveness
4. Generate 500+ words on rhythm alignment and cycle awareness

Focus on:
- MBTI cognitive rhythms and energy cycles
- Astrological transits, seasons, and timing patterns
- Numerological personal year cycles and timing
- Human Design lunar cycles and decision-making timing
- Practical rhythm optimization and cycle planning

Target 500-600 words with specific timing guidance and cycle practices.`,
        tools: [
          {
            type: 'function',
            function: {
              name: 'analyze_hermetic_rhythm',
              description: 'Map natural cycles and timing patterns',
              parameters: {
                type: 'object',
                properties: {
                  blueprint_data: { type: 'object' },
                  cycle_types: { type: 'array', items: { type: 'string' } },
                  timing_focus: { type: 'string' }
                },
                required: ['blueprint_data']
              }
            }
          }
        ]
      },

      causation_analyst: {
        name: 'Cause & Effect Law Analyst',
        systemPrompt: `You are the Cause & Effect Law Specialist ("Every cause has its effect"). Your role:

1. Map how personality patterns create specific life consequences
2. Show causal chains between traits and manifestations
3. Identify intervention points for conscious manifestation
4. Generate 500+ words on conscious causation and intentional creation

Focus on:
- MBTI decision patterns and their long-term consequences
- Astrological aspects and their manifestation patterns
- Numerological action cycles and karmic patterns
- Human Design strategy and authority consequences
- Practical conscious creation and pattern intervention

Target 500-600 words with specific cause-effect mappings and intervention strategies.`,
        tools: [
          {
            type: 'function',
            function: {
              name: 'analyze_hermetic_causation',
              description: 'Map cause-effect patterns and intervention points',
              parameters: {
                type: 'object',
                properties: {
                  blueprint_data: { type: 'object' },
                  causation_domains: { type: 'array', items: { type: 'string' } },
                  intervention_focus: { type: 'string' }
                },
                required: ['blueprint_data']
              }
            }
          }
        ]
      },

      gender_analyst: {
        name: 'Gender Law Analyst',
        systemPrompt: `You are the Gender Law Specialist ("Everything has masculine and feminine principles"). Your role:

1. Map masculine and feminine energy expressions across all systems
2. Show how to balance assertive and receptive qualities
3. Identify optimal masculine/feminine integration strategies
4. Generate 500+ words on energy balance and creative force optimization

Focus on:
- MBTI thinking/feeling and masculine/feminine balance
- Astrological masculine/feminine sign and planet balance
- Numerological active/receptive number expressions
- Human Design projective/receptive energy management
- Practical masculine/feminine energy cultivation

Target 500-600 words with specific balancing practices and integration methods.`,
        tools: [
          {
            type: 'function',
            function: {
              name: 'analyze_hermetic_gender',
              description: 'Analyze masculine/feminine energy balance',
              parameters: {
                type: 'object',
                properties: {
                  blueprint_data: { type: 'object' },
                  energy_balance: { type: 'array', items: { type: 'string' } },
                  integration_approach: { type: 'string' }
                },
                required: ['blueprint_data']
              }
            }
          }
        ]
      }
    };
  }

  // System Integration Agents - Each translates one system through all Hermetic Laws
  private getSystemIntegrationAgents(): Record<string, HermeticAgent> {
    return {
      mbti_hermetic_translator: {
        name: 'MBTI Hermetic Translator',
        systemPrompt: `You are the MBTI Hermetic Integration Specialist. Your role:

1. Translate MBTI type through all Seven Hermetic Laws
2. Show how cognitive functions express each universal principle
3. Create fractal understanding where MBTI reflects the whole person
4. Generate 400+ words of comprehensive MBTI-Hermetic integration

For each law, show how the MBTI type expresses it:
- Mentalism: Core beliefs and mental patterns
- Correspondence: Inner type mirroring outer world
- Vibration: Energetic frequency and preferences
- Polarity: Function opposites and shadow integration
- Rhythm: Cognitive cycles and timing patterns
- Causation: Decision patterns and consequences
- Gender: Thinking/Feeling and masculine/feminine balance

Target 400-450 words with practical applications.`,
        tools: [
          {
            type: 'function',
            function: {
              name: 'translate_mbti_hermetic',
              description: 'Translate MBTI through all Seven Hermetic Laws',
              parameters: {
                type: 'object',
                properties: {
                  mbti_data: { type: 'object' },
                  hermetic_integration: { type: 'array', items: { type: 'string' } },
                  practical_focus: { type: 'boolean' }
                },
                required: ['mbti_data']
              }
            }
          }
        ]
      },

      astrology_hermetic_translator: {
        name: 'Astrology Hermetic Translator',
        systemPrompt: `You are the Astrology Hermetic Integration Specialist. Your role:

1. Translate astrological placements through all Seven Hermetic Laws
2. Show how planetary energies express universal principles
3. Create fractal understanding of cosmic-personal correspondence
4. Generate 400+ words of comprehensive Astrology-Hermetic integration

For each law, show how the astrological chart expresses it:
- Mentalism: Mental patterns reflected in Mercury, aspects
- Correspondence: "As above, so below" - cosmic and personal patterns
- Vibration: Planetary frequencies and elemental expressions
- Polarity: Sign oppositions, challenging aspects, integration
- Rhythm: Transits, cycles, timing, lunar patterns
- Causation: Aspect patterns and manifestation chains
- Gender: Masculine/feminine planet and sign balance

Target 400-450 words with specific chart interpretations.`,
        tools: [
          {
            type: 'function',
            function: {
              name: 'translate_astrology_hermetic',
              description: 'Translate astrology through all Seven Hermetic Laws',
              parameters: {
                type: 'object',
                properties: {
                  astrology_data: { type: 'object' },
                  hermetic_integration: { type: 'array', items: { type: 'string' } },
                  chart_focus: { type: 'string' }
                },
                required: ['astrology_data']
              }
            }
          }
        ]
      },

      numerology_hermetic_translator: {
        name: 'Numerology Hermetic Translator',
        systemPrompt: `You are the Numerology Hermetic Integration Specialist. Your role:

1. Translate numerological patterns through all Seven Hermetic Laws
2. Show how number vibrations express universal principles
3. Create fractal understanding of numerical consciousness
4. Generate 400+ words of comprehensive Numerology-Hermetic integration

For each law, show how the numbers express it:
- Mentalism: Mental patterns encoded in numbers
- Correspondence: Number patterns mirroring life patterns
- Vibration: Specific number frequencies and their effects
- Polarity: Challenging numbers and their shadow gifts
- Rhythm: Personal year cycles and timing patterns
- Causation: Number influence on life events and choices
- Gender: Odd/even, active/receptive number expressions

Target 400-450 words with specific number interpretations and applications.`,
        tools: [
          {
            type: 'function',
            function: {
              name: 'translate_numerology_hermetic',
              description: 'Translate numerology through all Seven Hermetic Laws',
              parameters: {
                type: 'object',
                properties: {
                  numerology_data: { type: 'object' },
                  hermetic_integration: { type: 'array', items: { type: 'string' } },
                  number_focus: { type: 'string' }
                },
                required: ['numerology_data']
              }
            }
          }
        ]
      },

      human_design_hermetic_translator: {
        name: 'Human Design Hermetic Translator',
        systemPrompt: `You are the Human Design Hermetic Integration Specialist. Your role:

1. Translate Human Design mechanics through all Seven Hermetic Laws
2. Show how energy centers and gates express universal principles
3. Create fractal understanding of energy mechanics
4. Generate 400+ words of comprehensive Human Design-Hermetic integration

For each law, show how the Human Design expresses it:
- Mentalism: Mental patterns in defined/undefined centers
- Correspondence: Inner energy mirroring outer experiences
- Vibration: Center frequencies and gate vibrations
- Polarity: Defined/undefined splits and integration
- Rhythm: Lunar cycles, decision-making timing patterns
- Causation: Strategy and authority consequences
- Gender: Projective/receptive energy balance

Target 400-450 words with specific chart interpretations and practical applications.`,
        tools: [
          {
            type: 'function',
            function: {
              name: 'translate_human_design_hermetic',
              description: 'Translate Human Design through all Seven Hermetic Laws',
              parameters: {
                type: 'object',
                properties: {
                  human_design_data: { type: 'object' },
                  hermetic_integration: { type: 'array', items: { type: 'string' } },
                  energy_focus: { type: 'string' }
                },
                required: ['human_design_data']
              }
            }
          }
        ]
      },

      chinese_astrology_hermetic_translator: {
        name: 'Chinese Astrology Hermetic Translator',
        systemPrompt: `You are the Chinese Astrology Hermetic Integration Specialist. Your role:

1. Translate Chinese zodiac and elements through all Seven Hermetic Laws
2. Show how animal archetypes and elements express universal principles
3. Create fractal understanding of Eastern archetypal patterns
4. Generate 400+ words of comprehensive Chinese Astrology-Hermetic integration

For each law, show how the Chinese astrology expresses it:
- Mentalism: Mental patterns of animal archetype
- Correspondence: Animal traits mirroring life patterns
- Vibration: Element frequencies and animal energies
- Polarity: Yin/yang balance and opposing animals
- Rhythm: 12-year cycles and elemental timing
- Causation: Animal strategy patterns and life consequences
- Gender: Yin/yang and masculine/feminine expressions

Target 400-450 words with specific archetype interpretations and practical wisdom.`,
        tools: [
          {
            type: 'function',
            function: {
              name: 'translate_chinese_astrology_hermetic',
              description: 'Translate Chinese Astrology through all Seven Hermetic Laws',
              parameters: {
                type: 'object',
                properties: {
                  chinese_astrology_data: { type: 'object' },
                  hermetic_integration: { type: 'array', items: { type: 'string' } },
                  archetype_focus: { type: 'string' }
                },
                required: ['chinese_astrology_data']
              }
            }
          }
        ]
      }
    };
  }

  // Synthesis Agents - Weave everything together
  private getSynthesisAgents(): Record<string, HermeticAgent> {
    return {
      fractal_synthesizer: {
        name: 'Fractal Pattern Synthesizer',
        systemPrompt: `You are the Fractal Pattern Synthesizer. Your role:

1. Identify recurring patterns across all Hermetic analyses
2. Show how each part contains and reflects the whole
3. Reveal the unified fractal pattern of consciousness
4. Generate 2000+ words of deep pattern synthesis

Focus on:
- Recurring themes across all seven laws
- How each system mirrors the others
- The unified consciousness pattern
- Fractal insights and integration points
- Meta-patterns that emerge from the analysis

Target 2000-2200 words of profound synthesis that reveals the unified blueprint.`,
        tools: [
          {
            type: 'function',
            function: {
              name: 'synthesize_fractal_patterns',
              description: 'Identify and synthesize recurring fractal patterns',
              parameters: {
                type: 'object',
                properties: {
                  all_analyses: { type: 'array', items: { type: 'object' } },
                  pattern_depth: { type: 'string' },
                  synthesis_focus: { type: 'array', items: { type: 'string' } }
                },
                required: ['all_analyses']
              }
            }
          }
        ]
      },

      consciousness_mapper: {
        name: 'Consciousness Mapping Agent',
        systemPrompt: `You are the Consciousness Mapping Agent. Your role:

1. Map consciousness across Mental, Emotional, Physical, and Spiritual dimensions
2. Show integration points and growth edges
3. Create dynamic balance recommendations
4. Generate 1500+ words of consciousness mapping

Focus on:
- Mental dimension: Beliefs, patterns, cognitive style
- Emotional dimension: Feeling patterns, emotional intelligence
- Physical dimension: Energy patterns, body wisdom, timing
- Spiritual dimension: Purpose, connection, transcendence
- Integration practices for whole-being alignment

Target 1500-1600 words with specific practices and integration strategies.`,
        tools: [
          {
            type: 'function',
            function: {
              name: 'map_consciousness_dimensions',
              description: 'Map consciousness across multiple dimensions',
              parameters: {
                type: 'object',
                properties: {
                  integration_data: { type: 'object' },
                  dimension_focus: { type: 'array', items: { type: 'string' } },
                  mapping_depth: { type: 'string' }
                },
                required: ['integration_data']
              }
            }
          }
        ]
      },

      practical_applicator: {
        name: 'Practical Application Generator',
        systemPrompt: `You are the Practical Application Generator. Your role:

1. Transform insights into daily practices and rituals
2. Create personalized implementation strategies
3. Design consciousness activation framework
4. Generate 1000+ words of practical applications

Focus on:
- Daily Hermetic practices aligned with blueprint
- Weekly consciousness activation rituals
- Monthly review and integration cycles
- Personalized growth exercises and experiments
- Real-world application strategies

Target 1000-1100 words of actionable, blueprint-aligned practices.`,
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_practical_applications',
              description: 'Create personalized practical applications',
              parameters: {
                type: 'object',
                properties: {
                  synthesis_insights: { type: 'object' },
                  application_areas: { type: 'array', items: { type: 'string' } },
                  personalization_level: { type: 'string' }
                },
                required: ['synthesis_insights']
              }
            }
          }
        ]
      }
    };
  }

  // Main orchestration method with gate-by-gate analysis for 20,000+ words
  async generateHermeticReport(blueprint: BlueprintData): Promise<HermeticReportResult> {
    console.log('🌟 Starting Enhanced Hermetic Blueprint Report generation - 20,000+ words with gate analysis');
    
    const startTime = Date.now();
    const allAnalyses: HermeticAnalysisResult[] = [];

    try {
      // Phase 1: Individual System Analysis through Hermetic Laws (2,000 words)
      console.log('📚 Phase 1: System Integration Analysis');
      const systemAgents = this.getSystemIntegrationAgents();
      
      for (const [agentType, agent] of Object.entries(systemAgents)) {
        const analysis = await this.runHermeticAgent(agentType, agent, blueprint, 400);
        allAnalyses.push(analysis);
        console.log(`✅ ${agentType}: ${analysis.word_count} words`);
      }

      // Phase 2: Enhanced Hermetic Law Deep Dives (10,500+ words)
      console.log('🔮 Phase 2: Enhanced Hermetic Law Specialist Analysis');
      const lawAgents = this.getHermeticLawAgents();
      
      for (const [agentType, agent] of Object.entries(lawAgents)) {
        const analysis = await this.runHermeticAgent(agentType, agent, blueprint, 1500);
        allAnalyses.push(analysis);
        console.log(`✅ ${agentType}: ${analysis.word_count} words`);
      }

      // Phase 2.5: Gate-by-Gate Hermetic Analysis (8,000+ words)
      console.log('🚪 Phase 2.5: Comprehensive Gate-by-Gate Analysis');
      const gateAnalysis = await this.runGateByGateAnalysis(blueprint);
      allAnalyses.push(gateAnalysis);
      console.log(`✅ Gate Analysis: ${gateAnalysis.word_count} words`);

      // Phase 3: Synthesis and Integration (4,500 words)
      console.log('🌀 Phase 3: Synthesis and Practical Application');
      const synthesisAgents = this.getSynthesisAgents();
      
      const fractalSynthesis = await this.runSynthesisAgent(
        'fractal_synthesizer', 
        synthesisAgents.fractal_synthesizer, 
        allAnalyses, 
        2000
      );
      allAnalyses.push(fractalSynthesis);

      const consciousnessMap = await this.runSynthesisAgent(
        'consciousness_mapper',
        synthesisAgents.consciousness_mapper,
        allAnalyses,
        1500
      );
      allAnalyses.push(consciousnessMap);

      const practicalApplications = await this.runSynthesisAgent(
        'practical_applicator',
        synthesisAgents.practical_applicator,
        allAnalyses,
        1000
      );
      allAnalyses.push(practicalApplications);

      // Calculate final results
      const totalWordCount = allAnalyses.reduce((sum, analysis) => sum + analysis.word_count, 0);
      const endTime = Date.now();
      
      console.log(`🎉 Hermetic Report Complete: ${totalWordCount} words in ${endTime - startTime}ms`);

      return {
        total_word_count: totalWordCount,
        sections: allAnalyses,
        synthesis: fractalSynthesis.content,
        practical_applications: practicalApplications.content,
        consciousness_map: consciousnessMap.content,
        generated_at: new Date().toISOString(),
        blueprint_signature: this.generateBlueprintSignature(blueprint)
      };

    } catch (error) {
      console.error('❌ Hermetic Report generation failed:', error);
      throw error;
    }
  }

  private async runHermeticAgent(
    agentType: string, 
    agent: HermeticAgent, 
    blueprint: BlueprintData,
    targetWords: number
  ): Promise<HermeticAnalysisResult> {
    
    const messages = [
      {
        role: 'system',
        content: agent.systemPrompt
      },
      {
        role: 'user',
        content: `Analyze this blueprint data through your specialized Hermetic lens. Target ${targetWords}+ words of deep, practical analysis.

Blueprint Data: ${JSON.stringify(blueprint, null, 2)}`
      }
    ];

    const result = await this.callHermeticAgent({
      messages,
      tools: agent.tools,
      model: 'gpt-4o-mini',
      temperature: 0.7
    });

    return {
      agent_type: agentType,
      content: result.content,
      word_count: this.countWords(result.content),
      analysis_depth: 10,
      hermetic_law: this.extractHermeticLaw(agentType),
      system_focus: this.extractSystemFocus(agentType)
    };
  }

  private async runSynthesisAgent(
    agentType: string,
    agent: HermeticAgent,
    previousAnalyses: HermeticAnalysisResult[],
    targetWords: number
  ): Promise<HermeticAnalysisResult> {
    
    const messages = [
      {
        role: 'system',
        content: agent.systemPrompt
      },
      {
        role: 'user',
        content: `Synthesize these previous analyses into ${targetWords}+ words of integrated insight.

Previous Analyses:
${previousAnalyses.map(a => `${a.agent_type}: ${a.content.substring(0, 500)}...`).join('\n\n')}`
      }
    ];

    const result = await this.callHermeticAgent({
      messages,
      tools: agent.tools,
      model: 'gpt-4o-mini',
      temperature: 0.6
    });

    return {
      agent_type: agentType,
      content: result.content,
      word_count: this.countWords(result.content),
      analysis_depth: 10
    };
  }

  private async callHermeticAgent(params: any): Promise<any> {
    const { data, error } = await supabase.functions.invoke('openai-agent', {
      body: params
    });

    if (error) {
      console.error('❌ Hermetic agent call failed:', error);
      throw new Error(`Agent call failed: ${error.message}`);
    }

    return data;
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  private extractHermeticLaw(agentType: string): string | undefined {
    const lawMap: Record<string, string> = {
      'mentalism_analyst': 'Mentalism',
      'correspondence_analyst': 'Correspondence', 
      'vibration_analyst': 'Vibration',
      'polarity_analyst': 'Polarity',
      'rhythm_analyst': 'Rhythm',
      'causation_analyst': 'Causation',
      'gender_analyst': 'Gender'
    };
    return lawMap[agentType];
  }

  private extractSystemFocus(agentType: string): string | undefined {
    const systemMap: Record<string, string> = {
      'mbti_hermetic_translator': 'MBTI',
      'astrology_hermetic_translator': 'Astrology',
      'numerology_hermetic_translator': 'Numerology',
      'human_design_hermetic_translator': 'Human Design',
      'chinese_astrology_hermetic_translator': 'Chinese Astrology'
    };
    return systemMap[agentType];
  }

  private async runGateByGateAnalysis(blueprint: BlueprintData): Promise<HermeticAnalysisResult> {
    const humanDesign = blueprint.energy_strategy_human_design || blueprint.human_design;
    const allGates = [
      ...(humanDesign?.gates?.conscious_personality || []),
      ...(humanDesign?.gates?.unconscious_design || [])
    ];
    const uniqueGates = [...new Set(allGates.map(gate => gate.split('.')[0]))];
    
    const messages = [
      {
        role: 'system',
        content: `You are the Gate-by-Gate Hermetic Analyst. Analyze EACH active Human Design gate through ALL 7 Hermetic Laws. Target 800+ words per gate for comprehensive analysis.`
      },
      {
        role: 'user',
        content: `Analyze these gates through all 7 Hermetic Laws: ${uniqueGates.join(', ')}
        
Blueprint: ${JSON.stringify(blueprint, null, 2)}

For EACH gate, provide analysis through ALL 7 laws:
1. Mentalism, 2. Correspondence, 3. Vibration, 4. Polarity, 5. Rhythm, 6. Causation, 7. Gender

Target: ${uniqueGates.length * 800} words total`
      }
    ];

    const result = await this.callHermeticAgent({
      messages,
      tools: [{ type: 'function', function: { name: 'analyze_gate_through_hermetic_laws', description: 'Gate analysis', parameters: { type: 'object', properties: { gate_number: { type: 'string' } }, required: ['gate_number'] } } }],
      model: 'gpt-4o-mini',
      temperature: 0.7
    });

    return {
      agent_type: 'gate_hermetic_analyst',
      content: result.content,
      word_count: this.countWords(result.content),
      analysis_depth: 10
    };
  }

  private generateBlueprintSignature(blueprint: BlueprintData): string {
    const signatureData = {
      mbti: blueprint.cognition_mbti?.type || 'Unknown',
      sun_sign: blueprint.archetype_western?.sun_sign || 'Unknown',
      life_path: blueprint.values_life_path?.life_path_number || 'Unknown',
      hd_type: blueprint.energy_strategy_human_design?.type || 'Unknown',
      chinese_animal: blueprint.archetype_chinese?.animal || 'Unknown'
    };
    
    return btoa(JSON.stringify(signatureData)).substring(0, 16);
  }
}

export const hermeticReportOrchestrator = new HermeticReportOrchestrator();