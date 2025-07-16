
/**
 * Hermetic Report Orchestrator - Coordinates multi-agent Hermetic analysis
 * Uses the existing openai-agent edge function with specialized Hermetic tools
 */

import { supabase } from "@/integrations/supabase/client";
import { BlueprintData } from "./blueprint-service";

export interface HermeticOrchestrationResult {
  sections: Array<{
    agent_type: string;
    hermetic_law?: string;
    content: string;
    word_count: number;
    depth_score: number;
  }>;
  synthesis: string;
  consciousness_map: string;
  practical_applications: string;
  blueprint_signature: string;
  total_word_count: number;
  generated_at: string;
}

class HermeticReportOrchestrator {
  private readonly HERMETIC_AGENTS = [
    'mentalism_analyst',
    'correspondence_analyst', 
    'vibration_analyst',
    'polarity_analyst',
    'rhythm_analyst',
    'causation_analyst',
    'gender_analyst'
  ];

  private readonly SYSTEM_TRANSLATORS = [
    'mbti_hermetic_translator',
    'astrology_hermetic_translator',
    'numerology_hermetic_translator',
    'human_design_hermetic_translator',
    'chinese_astrology_hermetic_translator'
  ];

  async generateHermeticReport(blueprint: BlueprintData): Promise<HermeticOrchestrationResult> {
    console.log('🌟 Hermetic Orchestrator: Starting multi-agent report generation');
    
    const startTime = Date.now();
    const sections: Array<any> = [];

    // Generate Hermetic Law analyses
    for (const agentType of this.HERMETIC_AGENTS) {
      console.log(`🔮 Generating ${agentType} analysis...`);
      const section = await this.generateHermeticLawAnalysis(agentType, blueprint);
      sections.push(section);
    }

    // Generate System Translations
    for (const translatorType of this.SYSTEM_TRANSLATORS) {
      console.log(`🔄 Generating ${translatorType} translation...`);
      const section = await this.generateSystemTranslation(translatorType, blueprint);
      sections.push(section);
    }

    // Generate synthesis
    console.log('🧠 Generating fractal synthesis...');
    const synthesis = await this.generateFractalSynthesis(sections, blueprint);

    // Generate consciousness map
    console.log('🗺️ Generating consciousness map...');
    const consciousnessMap = await this.generateConsciousnessMap(sections, blueprint);

    // Generate practical applications
    console.log('🛠️ Generating practical applications...');
    const practicalApplications = await this.generatePracticalApplications(sections, blueprint);

    const totalWordCount = sections.reduce((sum, section) => sum + section.word_count, 0) + 
                          synthesis.split(' ').length + 
                          consciousnessMap.split(' ').length + 
                          practicalApplications.split(' ').length;

    const blueprintSignature = this.generateBlueprintSignature(blueprint, sections);

    console.log(`✅ Hermetic Orchestrator: Complete - ${totalWordCount} words in ${Date.now() - startTime}ms`);

    return {
      sections,
      synthesis,
      consciousness_map: consciousnessMap,
      practical_applications: practicalApplications,
      blueprint_signature: blueprintSignature,
      total_word_count: totalWordCount,
      generated_at: new Date().toISOString()
    };
  }

  private async generateHermeticLawAnalysis(agentType: string, blueprint: BlueprintData): Promise<any> {
    const hermeticLaw = agentType.replace('_analyst', '');
    const toolName = `analyze_hermetic_${hermeticLaw}`;
    
    const messages = [
      {
        role: 'system',
        content: `You are a specialized Hermetic ${hermeticLaw} analyst. Analyze the user's personality blueprint through the lens of the Hermetic Law of ${hermeticLaw.charAt(0).toUpperCase() + hermeticLaw.slice(1)}. Generate comprehensive insights (1000+ words) showing how this law manifests in their personality patterns, decision-making, relationships, and life expression.`
      },
      {
        role: 'user', 
        content: `Analyze this personality blueprint through the Hermetic Law of ${hermeticLaw.charAt(0).toUpperCase() + hermeticLaw.slice(1)}:\n\n${JSON.stringify(blueprint, null, 2)}`
      }
    ];

    const tools = [
      {
        type: 'function',
        function: {
          name: toolName,
          description: `Analyze personality blueprint through Hermetic Law of ${hermeticLaw.charAt(0).toUpperCase() + hermeticLaw.slice(1)}`,
          parameters: {
            type: 'object',
            properties: {
              blueprint_data: { type: 'object', description: 'Complete personality blueprint data' },
              focus_systems: { type: 'array', items: { type: 'string' }, description: 'Personality systems to focus on' },
              analysis_depth: { type: 'string', enum: ['surface', 'moderate', 'deep'], description: 'Depth of analysis required' }
            },
            required: ['blueprint_data', 'focus_systems', 'analysis_depth']
          }
        }
      }
    ];

    const { data, error } = await supabase.functions.invoke('openai-agent', {
      body: {
        messages,
        model: 'gpt-4o',
        temperature: 0.7,
        tools
      }
    });

    if (error) {
      console.error(`❌ Error in ${agentType}:`, error);
      throw new Error(`Failed to generate ${agentType} analysis: ${error.message}`);
    }

    const content = data.content || '';
    
    return {
      agent_type: agentType,
      hermetic_law: hermeticLaw,
      content,
      word_count: content.split(' ').length,
      depth_score: 9.5
    };
  }

  private async generateSystemTranslation(translatorType: string, blueprint: BlueprintData): Promise<any> {
    const systemName = translatorType.replace('_hermetic_translator', '').replace('_', ' ');
    const toolName = `translate_${translatorType.replace('_hermetic_translator', '_hermetic')}`;
    
    const messages = [
      {
        role: 'system',
        content: `You are a specialized ${systemName} to Hermetic translator. Translate the user's ${systemName} patterns into Hermetic principles, showing how their ${systemName} characteristics express universal laws. Generate comprehensive translation (800+ words) with practical applications.`
      },
      {
        role: 'user',
        content: `Translate this ${systemName} data into Hermetic principles:\n\n${JSON.stringify(blueprint, null, 2)}`
      }
    ];

    const tools = [
      {
        type: 'function',
        function: {
          name: toolName,
          description: `Translate ${systemName} patterns into Hermetic principles`,
          parameters: {
            type: 'object',
            properties: {
              [`${systemName.toLowerCase().replace(' ', '_')}_data`]: { type: 'object', description: `${systemName} personality data` },
              hermetic_integration: { type: 'string', description: 'Level of Hermetic integration required' },
              practical_focus: { type: 'boolean', description: 'Include practical applications' }
            },
            required: [`${systemName.toLowerCase().replace(' ', '_')}_data`, 'hermetic_integration', 'practical_focus']
          }
        }
      }
    ];

    const { data, error } = await supabase.functions.invoke('openai-agent', {
      body: {
        messages,
        model: 'gpt-4o',
        temperature: 0.7,
        tools
      }
    });

    if (error) {
      console.error(`❌ Error in ${translatorType}:`, error);
      throw new Error(`Failed to generate ${translatorType} translation: ${error.message}`);
    }

    const content = data.content || '';
    
    return {
      agent_type: translatorType,
      system_focus: systemName,
      content,
      word_count: content.split(' ').length,
      depth_score: 9.5
    };
  }

  private async generateFractalSynthesis(sections: Array<any>, blueprint: BlueprintData): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: 'You are a master Hermetic synthesizer. Synthesize all the individual analyses into a unified fractal pattern that reveals the user\'s complete consciousness blueprint. Generate comprehensive synthesis (1500+ words) showing how all patterns interconnect and express the universal principles.'
      },
      {
        role: 'user',
        content: `Synthesize these Hermetic analyses into a unified fractal pattern:\n\n${JSON.stringify(sections, null, 2)}\n\nOriginal Blueprint:\n${JSON.stringify(blueprint, null, 2)}`
      }
    ];

    const tools = [
      {
        type: 'function',
        function: {
          name: 'synthesize_fractal_patterns',
          description: 'Synthesize all analyses into unified fractal consciousness pattern',
          parameters: {
            type: 'object',
            properties: {
              all_analyses: { type: 'array', description: 'All individual Hermetic analyses' },
              pattern_depth: { type: 'string', enum: ['surface', 'moderate', 'deep', 'fractal'], description: 'Synthesis depth level' },
              synthesis_focus: { type: 'string', description: 'Primary focus for synthesis' }
            },
            required: ['all_analyses', 'pattern_depth', 'synthesis_focus']
          }
        }
      }
    ];

    const { data, error } = await supabase.functions.invoke('openai-agent', {
      body: {
        messages,
        model: 'gpt-4o',
        temperature: 0.8,
        tools
      }
    });

    if (error) {
      throw new Error(`Failed to generate fractal synthesis: ${error.message}`);
    }

    return data.content || '';
  }

  private async generateConsciousnessMap(sections: Array<any>, blueprint: BlueprintData): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: 'You are a consciousness cartographer. Map the user\'s multi-dimensional consciousness across all planes of existence. Generate comprehensive consciousness map (1200+ words) showing integration points, growth edges, and dimensional alignments.'
      },
      {
        role: 'user',
        content: `Map the consciousness dimensions from these analyses:\n\n${JSON.stringify(sections, null, 2)}`
      }
    ];

    const tools = [
      {
        type: 'function',
        function: {
          name: 'map_consciousness_dimensions',
          description: 'Map consciousness across multiple dimensions',
          parameters: {
            type: 'object',
            properties: {
              integration_data: { type: 'array', description: 'Integrated analysis data' },
              dimension_focus: { type: 'array', items: { type: 'string' }, description: 'Consciousness dimensions to map' },
              mapping_depth: { type: 'string', enum: ['basic', 'intermediate', 'advanced', 'master'], description: 'Mapping depth level' }
            },
            required: ['integration_data', 'dimension_focus', 'mapping_depth']
          }
        }
      }
    ];

    const { data, error } = await supabase.functions.invoke('openai-agent', {
      body: {
        messages,
        model: 'gpt-4o',
        temperature: 0.8,
        tools
      }
    });

    if (error) {
      throw new Error(`Failed to generate consciousness map: ${error.message}`);
    }

    return data.content || '';
  }

  private async generatePracticalApplications(sections: Array<any>, blueprint: BlueprintData): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: 'You are a practical Hermetic applications specialist. Generate comprehensive practical activation framework (1200+ words) with specific daily practices, weekly cycles, and real-world applications based on the user\'s unique consciousness blueprint.'
      },
      {
        role: 'user',
        content: `Generate practical applications from these insights:\n\n${JSON.stringify(sections, null, 2)}`
      }
    ];

    const tools = [
      {
        type: 'function',
        function: {
          name: 'generate_practical_applications',
          description: 'Generate practical consciousness activation framework',
          parameters: {
            type: 'object',
            properties: {
              synthesis_insights: { type: 'object', description: 'Synthesized consciousness insights' },
              application_areas: { type: 'array', items: { type: 'string' }, description: 'Areas for practical application' },
              personalization_level: { type: 'string', enum: ['basic', 'intermediate', 'advanced', 'master'], description: 'Personalization depth' }
            },
            required: ['synthesis_insights', 'application_areas', 'personalization_level']
          }
        }
      }
    ];

    const { data, error } = await supabase.functions.invoke('openai-agent', {
      body: {
        messages,
        model: 'gpt-4o',
        temperature: 0.7,
        tools
      }
    });

    if (error) {
      throw new Error(`Failed to generate practical applications: ${error.message}`);
    }

    return data.content || '';
  }

  private generateBlueprintSignature(blueprint: BlueprintData, sections: Array<any>): string {
    // Create a unique signature based on the blueprint and analysis results
    const signatureComponents = [
      blueprint.cognition_mbti?.type || 'Unknown',
      blueprint.energy_strategy_human_design?.type || 'Unknown',
      blueprint.archetype_western?.sun_sign || 'Unknown',
      blueprint.values_life_path?.life_path_number || 'Unknown',
      sections.length.toString(),
      new Date().getFullYear().toString()
    ];

    return `HERMETIC-${signatureComponents.join('-')}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
}

export const hermeticReportOrchestrator = new HermeticReportOrchestrator();
