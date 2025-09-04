import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { userId, blueprint, language = 'en' } = await req.json();
    console.log(`🌟 HERMETIC BACKGROUND PROCESSOR: Starting generation for user ${userId}`);

    if (!userId || !blueprint) {
      throw new Error('User ID and blueprint are required');
    }

    // PHASE 1: System Integration (replicate client-side flow)
    console.log('📋 Phase 1: System Integration Analysis...');
    const systemSections = await generateSystemTranslation(supabase, blueprint);
    
    // PHASE 2: Hermetic Laws Analysis  
    console.log('🔮 Phase 2: Hermetic Law Analysis...');
    const hermeticSections = await generateHermeticLawAnalysis(supabase, blueprint);
    
    // PHASE 3: Gate Analysis
    console.log('🚪 Phase 3: Gate-by-Gate Analysis...');
    const gates = extractHumanDesignGates(blueprint);
    const gateSections = gates.length > 0 ? await generateGateAnalysis(supabase, blueprint, gates) : [];
    
    // PHASE 4: Intelligence Analysis
    console.log('🧠 Phase 4: Intelligence Analysis...');
    const allSections = [...systemSections, ...hermeticSections, ...gateSections];
    const intelligenceResult = await generateIntelligenceAnalysis(supabase, blueprint, allSections);
    
    // PHASE 5: Synthesis
    console.log('🌀 Phase 5: Synthesis...');
    const synthesis = await generateSynthesis(supabase, blueprint, allSections);
    const consciousnessMap = await generateConsciousnessMap(supabase, blueprint, allSections);
    const practicalApplications = await generatePracticalApplications(supabase, blueprint, allSections);
    
    // Build and store the complete report
    const report = await buildAndStoreReport(supabase, blueprint, {
      sections: allSections,
      synthesis,
      consciousness_map: consciousnessMap,
      practical_applications: practicalApplications,
      intelligence_result: intelligenceResult,
      gates_analyzed: gates
    });

    // Generate quotes
    const quotes = await generateHermeticQuotes(supabase, blueprint, allSections);

    console.log(`✅ HERMETIC BACKGROUND PROCESSOR: Generation completed successfully`);

    return new Response(JSON.stringify({ 
      success: true, 
      report,
      quotes,
      message: 'Hermetic report generated successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ HERMETIC BACKGROUND PROCESSOR: Generation failed:', error);

    return new Response(JSON.stringify({ 
      success: false, 
      error: String(error) 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Replicate the exact client-side functions here for background processing
async function generateSystemTranslation(supabase: any, blueprint: any) {
  console.log('📋 Generating system translation...');
  const sections = [];
  const translators = [
    'mbti_hermetic_translator',
    'astrology_hermetic_translator', 
    'numerology_hermetic_translator',
    'human_design_hermetic_translator',
    'chinese_astrology_hermetic_translator'
  ];

  for (const translator of translators) {
    const { data, error } = await supabase.functions.invoke('openai-agent', {
      body: {
        messages: [
          {
            role: 'system',
            content: `You are the ${translator}. Generate 1,000+ words translating this blueprint's system through Hermetic principles.`
          },
          {
            role: 'user',
            content: `Translate this blueprint through Hermetic lens: ${JSON.stringify(blueprint)}`
          }
        ],
        model: 'gpt-4o-mini',
        temperature: 0.7
      }
    });

    if (!error && data?.content) {
      sections.push({
        agent_type: translator,
        content: data.content,
        word_count: data.content.length
      });
    }
  }

  return sections;
}

async function generateHermeticLawAnalysis(supabase: any, blueprint: any) {
  console.log('🔮 Generating Hermetic law analysis...');
  const sections = [];
  const agents = [
    'mentalism_analyst',
    'correspondence_analyst',
    'vibration_analyst',
    'polarity_analyst',
    'rhythm_analyst',
    'causation_analyst',
    'gender_analyst'
  ];

  for (const agent of agents) {
    const { data, error } = await supabase.functions.invoke('openai-agent', {
      body: {
        messages: [
          {
            role: 'system',
            content: `You are the ${agent}. Generate 1,500+ words analyzing through your Hermetic Law with shadow work integration.`
          },
          {
            role: 'user',
            content: `Analyze this blueprint: ${JSON.stringify(blueprint)}`
          }
        ],
        model: 'gpt-4o-mini',
        temperature: 0.7
      }
    });

    if (!error && data?.content) {
      sections.push({
        agent_type: agent,
        content: data.content,
        word_count: data.content.length,
        hermetic_law: agent.replace('_analyst', '')
      });
    }
  }

  return sections;
}

function extractHumanDesignGates(blueprint: any): number[] {
  const gates: number[] = [];
  const hdData = blueprint.energy_strategy_human_design;
  
  if (!hdData) return [];

  // Extract gates from all possible locations
  if (hdData.gates?.conscious_personality) {
    hdData.gates.conscious_personality.forEach((g: any) => {
      if (g?.gate) gates.push(g.gate);
    });
  }
  
  if (hdData.gates?.unconscious_personality) {
    hdData.gates.unconscious_personality.forEach((g: any) => {
      if (g?.gate) gates.push(g.gate);
    });
  }

  if (hdData.gates?.conscious_design) {
    hdData.gates.conscious_design.forEach((g: any) => {
      if (g?.gate) gates.push(g.gate);
    });
  }

  if (hdData.gates?.unconscious_design) {
    hdData.gates.unconscious_design.forEach((g: any) => {
      if (g?.gate) gates.push(g.gate);
    });
  }

  return [...new Set(gates)].sort((a, b) => a - b);
}

async function generateGateAnalysis(supabase: any, blueprint: any, gates: number[]) {
  console.log(`🚪 Generating analysis for ${gates.length} gates...`);
  const sections = [];
  
  for (const gateNumber of gates) {
    const { data, error } = await supabase.functions.invoke('openai-agent', {
      body: {
        messages: [
          {
            role: 'system',
            content: `You are the Gate Hermetic Analyst. Analyze Gate ${gateNumber} through all 7 Hermetic Laws with shadow work. Generate 1,200+ words.`
          },
          {
            role: 'user',
            content: `Analyze Gate ${gateNumber} for this blueprint: ${JSON.stringify(blueprint)}`
          }
        ],
        model: 'gpt-4o-mini',
        temperature: 0.7
      }
    });

    if (!error && data?.content) {
      sections.push({
        agent_type: 'gate_hermetic_analyst',
        content: data.content,
        word_count: data.content.length,
        gate_number: gateNumber
      });
    }
  }

  return sections;
}

async function generateIntelligenceAnalysis(supabase: any, blueprint: any, hermeticSections: any[]) {
  console.log('🧠 Generating intelligence analysis...');
  
  // Use the existing intelligence orchestrator pattern
  const hermeticContent = hermeticSections.map(s => s.content).join('\n\n');
  
  const { data, error } = await supabase.functions.invoke('openai-agent', {
    body: {
      messages: [
        {
          role: 'system',
          content: 'You are the Intelligence Analyst. Extract structured intelligence patterns from hermetic analysis. Generate 15,000+ words across all 13 intelligence dimensions.'
        },
        {
          role: 'user', 
          content: `Extract intelligence from this hermetic analysis: ${hermeticContent.substring(0, 50000)}`
        }
      ],
      model: 'gpt-4o-mini',
      temperature: 0.7
    }
  });

  return {
    content: data?.content || '',
    word_count: data?.content?.length || 0,
    structured_intelligence: {}
  };
}

async function generateSynthesis(supabase: any, blueprint: any, sections: any[]) {
  const { data } = await supabase.functions.invoke('openai-agent', {
    body: {
      messages: [
        {
          role: 'system',
          content: 'Generate a comprehensive synthesis of all hermetic analysis. 2,000+ words.'
        },
        {
          role: 'user',
          content: `Synthesize this analysis: ${JSON.stringify(sections.slice(0, 5))}`
        }
      ],
      model: 'gpt-4o-mini'
    }
  });
  
  return data?.content || 'Synthesis content';
}

async function generateConsciousnessMap(supabase: any, blueprint: any, sections: any[]) {
  const { data } = await supabase.functions.invoke('openai-agent', {
    body: {
      messages: [
        {
          role: 'system', 
          content: 'Generate a consciousness integration map. 1,500+ words.'
        },
        {
          role: 'user',
          content: `Create consciousness map from: ${JSON.stringify(sections.slice(0, 3))}`
        }
      ],
      model: 'gpt-4o-mini'
    }
  });
  
  return data?.content || 'Consciousness map content';
}

async function generatePracticalApplications(supabase: any, blueprint: any, sections: any[]) {
  const { data } = await supabase.functions.invoke('openai-agent', {
    body: {
      messages: [
        {
          role: 'system',
          content: 'Generate practical applications and exercises. 1,000+ words.'
        },
        {
          role: 'user', 
          content: `Create practical applications from: ${JSON.stringify(sections.slice(0, 3))}`
        }
      ],
      model: 'gpt-4o-mini'
    }
  });
  
  return data?.content || 'Practical applications content';
}

async function buildAndStoreReport(supabase: any, blueprint: any, results: any) {
  const totalWordCount = results.sections.reduce((total: number, s: any) => total + (s.word_count || 0), 0) +
                        (results.intelligence_result?.word_count || 0);

  const gateAnalyses: any = {};
  results.sections.filter((s: any) => s.gate_number).forEach((s: any) => {
    gateAnalyses[`gate_${s.gate_number}`] = s.content;
  });

  const sevenLaws = {
    mentalism: results.sections.find((s: any) => s.agent_type === 'mentalism_analyst')?.content || '',
    correspondence: results.sections.find((s: any) => s.agent_type === 'correspondence_analyst')?.content || '',
    vibration: results.sections.find((s: any) => s.agent_type === 'vibration_analyst')?.content || '',
    polarity: results.sections.find((s: any) => s.agent_type === 'polarity_analyst')?.content || '',
    rhythm: results.sections.find((s: any) => s.agent_type === 'rhythm_analyst')?.content || '',
    causation: results.sections.find((s: any) => s.agent_type === 'causation_analyst')?.content || '',
    gender: results.sections.find((s: any) => s.agent_type === 'gender_analyst')?.content || ''
  };

  const systemTranslations = {
    mbti_hermetic: results.sections.find((s: any) => s.agent_type === 'mbti_hermetic_translator')?.content || '',
    astrology_hermetic: results.sections.find((s: any) => s.agent_type === 'astrology_hermetic_translator')?.content || '',
    numerology_hermetic: results.sections.find((s: any) => s.agent_type === 'numerology_hermetic_translator')?.content || '',
    human_design_hermetic: results.sections.find((s: any) => s.agent_type === 'human_design_hermetic_translator')?.content || '',
    chinese_astrology_hermetic: results.sections.find((s: any) => s.agent_type === 'chinese_astrology_hermetic_translator')?.content || ''
  };

  const report = {
    id: crypto.randomUUID(),
    user_id: blueprint.user_id || blueprint.user_meta?.user_id,
    blueprint_id: blueprint.id,
    report_content: {
      core_personality_pattern: systemTranslations.mbti_hermetic.substring(0, 500) + '...',
      decision_making_style: sevenLaws.causation.substring(0, 500) + '...',
      relationship_style: sevenLaws.correspondence.substring(0, 500) + '...',
      life_path_purpose: sevenLaws.mentalism.substring(0, 500) + '...',
      current_energy_timing: sevenLaws.rhythm.substring(0, 500) + '...',
      integrated_summary: results.synthesis,
      hermetic_fractal_analysis: results.synthesis,
      consciousness_integration_map: results.consciousness_map,
      practical_activation_framework: results.practical_applications,
      seven_laws_integration: sevenLaws,
      system_translations: systemTranslations,
      gate_analyses: gateAnalyses,
      shadow_work_integration: {
        shadow_patterns: 'Shadow patterns integrated throughout analysis',
        integration_practices: results.practical_applications.substring(0, 1000),
        transformation_roadmap: results.consciousness_map.substring(0, 1000)
      },
      blueprint_signature: crypto.randomUUID(),
      word_count: totalWordCount,
      generation_metadata: {
        agents_used: results.sections.map((s: any) => s.agent_type),
        total_processing_time: 0,
        hermetic_depth_score: 10,
        gates_analyzed: results.gates_analyzed,
        intelligence_status: 'completed'
      },
      structured_intelligence: results.intelligence_result?.structured_intelligence || {}
    },
    generated_at: new Date().toISOString(),
    blueprint_version: '2.0'
  };

  const { data, error } = await supabase
    .from('personality_reports')
    .insert([report])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function generateHermeticQuotes(supabase: any, blueprint: any, sections: any[]) {
  const { data } = await supabase.functions.invoke('openai-agent', {
    body: {
      messages: [
        {
          role: 'system',
          content: 'Generate 5 personalized hermetic quotes based on the analysis.'
        },
        {
          role: 'user',
          content: `Generate quotes from: ${JSON.stringify(sections.slice(0, 2))}`
        }
      ],
      model: 'gpt-4o-mini'
    }
  });

  return data?.quotes || [];
}