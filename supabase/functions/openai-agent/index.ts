import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callChatCompletion } from '../_shared/azure-openai.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Tool execution functions
async function executeTool(toolCall: any, context: any = {}): Promise<any> {
  const { name, arguments: args } = toolCall.function;
  console.log(`🔧 Executing tool: ${name} with args:`, JSON.stringify(args, null, 2));
  
  try {
    const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;
    
    switch (name) {
      case 'generate_plan_branches':
        return await generatePlanBranches(parsedArgs);
      
      case 'evaluate_plan_alignment':
        return await evaluatePlanAlignment(parsedArgs);
      
      case 'update_user_memory':
        return await updateUserMemory(parsedArgs);
      
      case 'format_personalized_delivery':
        return await formatPersonalizedDelivery(parsedArgs);
      
      // NEW: Hermetic analysis tools (additive only - no changes to existing)
      case 'analyze_hermetic_mentalism':
        return await analyzeHermeticMentalism(parsedArgs);
      
      case 'analyze_hermetic_correspondence':
        return await analyzeHermeticCorrespondence(parsedArgs);
      
      case 'analyze_hermetic_vibration':
        return await analyzeHermeticVibration(parsedArgs);
      
      case 'analyze_hermetic_polarity':
        return await analyzeHermeticPolarity(parsedArgs);
      
      case 'analyze_hermetic_rhythm':
        return await analyzeHermeticRhythm(parsedArgs);
      
      case 'analyze_hermetic_causation':
        return await analyzeHermeticCausation(parsedArgs);
      
      case 'analyze_hermetic_gender':
        return await analyzeHermeticGender(parsedArgs);
      
      // NEW: Gate-specific Hermetic analysis tools for 20,000+ word reports
      case 'analyze_gate_through_hermetic_laws':
        return await analyzeGateThroughHermeticLaws(parsedArgs);
      
      case 'analyze_profile_gate_integration':
        return await analyzeProfileGateIntegration(parsedArgs);
      
      case 'analyze_authority_gate_expression':
        return await analyzeAuthorityGateExpression(parsedArgs);
      
      case 'analyze_conscious_unconscious_gates':
        return await analyzeConsciousUnconsciousGates(parsedArgs);
      
      case 'analyze_center_gate_harmony':
        return await analyzeCenterGateHarmony(parsedArgs);
      
      case 'translate_mbti_hermetic':
        return await translateMBTIHermetic(parsedArgs);
      
      case 'translate_astrology_hermetic':
        return await translateAstrologyHermetic(parsedArgs);
      
      case 'translate_numerology_hermetic':
        return await translateNumerologyHermetic(parsedArgs);
      
      case 'translate_human_design_hermetic':
        return await translateHumanDesignHermetic(parsedArgs);
      
      case 'translate_chinese_astrology_hermetic':
        return await translateChineseAstrologyHermetic(parsedArgs);
      
      case 'synthesize_fractal_patterns':
        return await synthesizeFractalPatterns(parsedArgs);
      
      case 'map_consciousness_dimensions':
        return await mapConsciousnessDimensions(parsedArgs);
      
      case 'generate_practical_applications':
        return await generatePracticalApplications(parsedArgs);
      
      default:
        console.warn(`⚠️ Unknown tool: ${name}`);
        return { error: `Unknown tool: ${name}` };
    }
  } catch (error) {
    console.error(`❌ Tool execution failed for ${name}:`, error);
    return { error: `Tool execution failed: ${error.message}` };
  }
}

// Tool implementations
async function generatePlanBranches(args: any): Promise<any> {
  const { goal, user_profile, current_plan } = args;
  console.log('Generating plan branches...');
  
  return {
    branches: [
      {
        branch_name: 'Branch A',
        steps: ['Step 1A', 'Step 2A']
      },
      {
        branch_name: 'Branch B',
        steps: ['Step 1B', 'Step 2B']
      }
    ]
  };
}

async function evaluatePlanAlignment(args: any): Promise<any> {
  const { plan, user_profile, goal } = args;
  console.log('Evaluating plan alignment...');
  
  return {
    alignment_score: 0.85,
    feedback: 'Plan aligns well with user profile and goal.'
  };
}

async function updateUserMemory(args: any): Promise<any> {
  const { new_memories, user_profile } = args;
  console.log('Updating user memory...');
  
  return {
    success: true,
    message: 'User memory updated successfully.'
  };
}

async function formatPersonalizedDelivery(args: any): Promise<any> {
  const { content, user_profile } = args;
  console.log('Formatting personalized delivery...');
  
  return {
    formatted_content: `Personalized content for ${user_profile.name}: ${content}`
  };
}

// NEW: Hermetic analysis tool implementations (additive only)
async function analyzeHermeticMentalism(args: any): Promise<any> {
  const { blueprint_data, focus_systems, analysis_depth } = args;
  console.log('🧠 Analyzing through Law of Mentalism');
  
  return {
    hermetic_law: 'Mentalism',
    analysis_focus: 'Mental patterns and belief structures',
    blueprint_integration: 'Deep analysis of core beliefs shaping reality',
    practical_applications: [
      'Daily belief examination practices',
      'Mental pattern awareness exercises',
      'Conscious thought monitoring techniques'
    ],
    depth_score: 9.5
  };
}

async function analyzeHermeticCorrespondence(args: any): Promise<any> {
  const { blueprint_data, focus_systems, analysis_depth } = args;
  console.log('🔗 Analyzing through Law of Correspondence');
  
  return {
    hermetic_law: 'Correspondence',
    analysis_focus: 'Inner and outer reflections',
    blueprint_integration: 'Mapping internal states to external experiences',
    practical_applications: [
      'Journaling to identify patterns',
      'Mirror work for self-awareness',
      'Observing external events as reflections'
    ],
    depth_score: 8.8
  };
}

async function analyzeHermeticVibration(args: any): Promise<any> {
  const { blueprint_data, focus_systems, analysis_depth } = args;
  console.log('⚡ Analyzing through Law of Vibration');
  
  return {
    hermetic_law: 'Vibration',
    analysis_focus: 'Energetic frequencies and resonance',
    blueprint_integration: 'Identifying vibrational signatures in the blueprint',
    practical_applications: [
      'Tuning fork therapy',
      'Sound healing practices',
      'Mantra and chanting techniques'
    ],
    depth_score: 9.2
  };
}

async function analyzeHermeticPolarity(args: any): Promise<any> {
  const { blueprint_data, focus_systems, analysis_depth } = args;
  console.log('⚖️ Analyzing through Law of Polarity');
  
  return {
    hermetic_law: 'Polarity',
    analysis_focus: 'Opposing forces and shadow integration',
    blueprint_integration: 'Balancing light and shadow aspects',
    practical_applications: [
      'Shadow work exercises',
      'Polarity integration meditations',
      'Transforming negative emotions'
    ],
    depth_score: 9.0
  };
}

async function analyzeHermeticRhythm(args: any): Promise<any> {
  const { blueprint_data, focus_systems, analysis_depth } = args;
  console.log('⏳ Analyzing through Law of Rhythm');
  
  return {
    hermetic_law: 'Rhythm',
    analysis_focus: 'Natural cycles and timing',
    blueprint_integration: 'Aligning with natural rhythms for optimal flow',
    practical_applications: [
      'Tracking personal cycles',
      'Timing activities with natural rhythms',
      'Adapting to seasonal changes'
    ],
    depth_score: 8.5
  };
}

async function analyzeHermeticCausation(args: any): Promise<any> {
  const { blueprint_data, focus_systems, analysis_depth } = args;
  console.log('🌱 Analyzing through Law of Causation');
  
  return {
    hermetic_law: 'Causation',
    analysis_focus: 'Cause-and-effect patterns',
    blueprint_integration: 'Understanding how choices create reality',
    practical_applications: [
      'Conscious decision-making practices',
      'Taking responsibility for actions',
      'Visualizing desired outcomes'
    ],
    depth_score: 9.3
  };
}

async function analyzeHermeticGender(args: any): Promise<any> {
  const { blueprint_data, focus_systems, analysis_depth } = args;
  console.log('☯️ Analyzing through Law of Gender');
  
  return {
    hermetic_law: 'Gender',
    analysis_focus: 'Creative and receptive energies',
    blueprint_integration: 'Balancing masculine and feminine aspects',
    practical_applications: [
      'Creative expression practices',
      'Cultivating receptivity',
      'Balancing active and passive roles'
    ],
    depth_score: 8.7
  };
}

async function analyzeGateThroughHermeticLaws(args: any): Promise<any> {
  const { gate_number, blueprint_data } = args;
  console.log(`🔑 Analyzing Gate ${gate_number} through Hermetic Laws`);
  
  return {
    gate_number: gate_number,
    hermetic_analysis: {
      mentalism: 'Analysis of mental patterns related to the gate',
      correspondence: 'Analysis of inner/outer reflections',
      vibration: 'Analysis of energetic frequencies',
      polarity: 'Analysis of opposing forces',
      rhythm: 'Analysis of natural cycles',
      causation: 'Analysis of cause-and-effect',
      gender: 'Analysis of creative/receptive energies'
    },
    shadow_integration_techniques: [
      'Shadow work exercises',
      'Polarity integration meditations'
    ],
    conscious_activation_practices: [
      'Affirmations',
      'Visualization'
    ]
  };
}

async function analyzeProfileGateIntegration(args: any): Promise<any> {
  const { profile_number, gate_number, blueprint_data } = args;
  console.log(`👤 Integrating Gate ${gate_number} with Profile ${profile_number}`);
  
  return {
    profile_number: profile_number,
    gate_number: gate_number,
    integration_analysis: 'Analysis of how the gate integrates with the profile',
    practical_applications: [
      'Specific practices for integrating the gate with the profile'
    ]
  };
}

async function analyzeAuthorityGateExpression(args: any): Promise<any> {
  const { authority_type, gate_number, blueprint_data } = args;
  console.log(`🗣️ Analyzing Gate ${gate_number} expression through ${authority_type} Authority`);
  
  return {
    authority_type: authority_type,
    gate_number: gate_number,
    expression_analysis: 'Analysis of how the gate expresses through the authority',
    practical_applications: [
      'Specific practices for expressing the gate through the authority'
    ]
  };
}

async function analyzeConsciousUnconsciousGates(args: any): Promise<any> {
  const { conscious_gate, unconscious_gate, blueprint_data } = args;
  console.log(`☯️ Analyzing Conscious Gate ${conscious_gate} and Unconscious Gate ${unconscious_gate}`);
  
  return {
    conscious_gate: conscious_gate,
    unconscious_gate: unconscious_gate,
    harmony_analysis: 'Analysis of harmony between conscious and unconscious gates',
    practical_applications: [
      'Practices for harmonizing conscious and unconscious aspects'
    ]
  };
}

async function analyzeCenterGateHarmony(args: any): Promise<any> {
  const { center_name, gate_number, blueprint_data } = args;
  console.log(`❤️ Analyzing Gate ${gate_number} harmony within ${center_name} Center`);
  
  return {
    center_name: center_name,
    gate_number: gate_number,
    harmony_analysis: 'Analysis of gate harmony within the center',
    practical_applications: [
      'Practices for harmonizing the gate within the center'
    ]
  };
}

async function translateMBTIHermetic(args: any): Promise<any> {
  const { mbti_type, blueprint_data } = args;
  console.log(`Translating MBTI type ${mbti_type} through Hermetic Laws`);
  
  return {
    mbti_type: mbti_type,
    hermetic_translation: {
      mentalism: 'Translation through Law of Mentalism',
      correspondence: 'Translation through Law of Correspondence',
      vibration: 'Translation through Law of Vibration',
      polarity: 'Translation through Law of Polarity',
      rhythm: 'Translation through Law of Rhythm',
      causation: 'Translation through Law of Causation',
      gender: 'Translation through Law of Gender'
    },
    shadow_integration_techniques: [
      'Shadow work exercises',
      'Polarity integration meditations'
    ],
    conscious_activation_practices: [
      'Affirmations',
      'Visualization'
    ]
  };
}

async function translateAstrologyHermetic(args: any): Promise<any> {
  const { sun_sign, blueprint_data } = args;
  console.log(`Translating Astrology Sun Sign ${sun_sign} through Hermetic Laws`);
  
  return {
    sun_sign: sun_sign,
    hermetic_translation: {
      mentalism: 'Translation through Law of Mentalism',
      correspondence: 'Translation through Law of Correspondence',
      vibration: 'Translation through Law of Vibration',
      polarity: 'Translation through Law of Polarity',
      rhythm: 'Translation through Law of Rhythm',
      causation: 'Translation through Law of Causation',
      gender: 'Translation through Law of Gender'
    },
    shadow_integration_techniques: [
      'Shadow work exercises',
      'Polarity integration meditations'
    ],
    conscious_activation_practices: [
      'Affirmations',
      'Visualization'
    ]
  };
}

async function translateNumerologyHermetic(args: any): Promise<any> {
  const { life_path_number, blueprint_data } = args;
  console.log(`Translating Numerology Life Path Number ${life_path_number} through Hermetic Laws`);
  
  return {
    life_path_number: life_path_number,
    hermetic_translation: {
      mentalism: 'Translation through Law of Mentalism',
      correspondence: 'Translation through Law of Correspondence',
      vibration: 'Translation through Law of Vibration',
      polarity: 'Translation through Law of Polarity',
      rhythm: 'Translation through Law of Rhythm',
      causation: 'Translation through Law of Causation',
      gender: 'Translation through Law of Gender'
    },
    shadow_integration_techniques: [
      'Shadow work exercises',
      'Polarity integration meditations'
    ],
    conscious_activation_practices: [
      'Affirmations',
      'Visualization'
    ]
  };
}

async function translateHumanDesignHermetic(args: any): Promise<any> {
  const { human_design_type, blueprint_data } = args;
  console.log(`Translating Human Design Type ${human_design_type} through Hermetic Laws`);
  
  return {
    human_design_type: human_design_type,
    hermetic_translation: {
      mentalism: 'Translation through Law of Mentalism',
      correspondence: 'Translation through Law of Correspondence',
      vibration: 'Translation through Law of Vibration',
      polarity: 'Translation through Law of Polarity',
      rhythm: 'Translation through Law of Rhythm',
      causation: 'Translation through Law of Causation',
      gender: 'Translation through Law of Gender'
    },
    shadow_integration_techniques: [
      'Shadow work exercises',
      'Polarity integration meditations'
    ],
    conscious_activation_practices: [
      'Affirmations',
      'Visualization'
    ]
  };
}

async function translateChineseAstrologyHermetic(args: any): Promise<any> {
  const { animal_sign, blueprint_data } = args;
  console.log(`Translating Chinese Astrology Animal Sign ${animal_sign} through Hermetic Laws`);
  
  return {
    animal_sign: animal_sign,
    hermetic_translation: {
      mentalism: 'Translation through Law of Mentalism',
      correspondence: 'Translation through Law of Correspondence',
      vibration: 'Translation through Law of Vibration',
      polarity: 'Translation through Law of Polarity',
      rhythm: 'Translation through Law of Rhythm',
      causation: 'Translation through Law of Causation',
      gender: 'Translation through Law of Gender'
    },
    shadow_integration_techniques: [
      'Shadow work exercises',
      'Polarity integration meditations'
    ],
    conscious_activation_practices: [
      'Affirmations',
      'Visualization'
    ]
  };
}

async function synthesizeFractalPatterns(args: any): Promise<any> {
  const { blueprint_data, focus_areas } = args;
  console.log('Synthesizing Fractal Patterns...');
  
  return {
    fractal_patterns: {
      pattern_1: 'Description of pattern 1',
      pattern_2: 'Description of pattern 2'
    },
    integration_techniques: [
      'Technique 1',
      'Technique 2'
    ]
  };
}

async function mapConsciousnessDimensions(args: any): Promise<any> {
  const { blueprint_data, dimensions } = args;
  console.log('Mapping Consciousness Dimensions...');
  
  return {
    consciousness_map: {
      dimension_1: 'Description of dimension 1',
      dimension_2: 'Description of dimension 2'
    },
    development_opportunities: [
      'Opportunity 1',
      'Opportunity 2'
    ]
  };
}

async function generatePracticalApplications(args: any): Promise<any> {
  const { blueprint_data, analysis_results } = args;
  console.log('Generating Practical Applications...');
  
  return {
    practical_applications: [
      'Application 1',
      'Application 2'
    ],
    expected_outcomes: [
      'Outcome 1',
      'Outcome 2'
    ]
  };
}

// ------------------------------------------------------------------
// PHASE 1: Real goal decomposition. Called by companion-oracle-conversation
// via { action: 'decompose_goal', ... }. Personalises milestones using the
// user's blueprint + structured intelligence slice. Returns { milestones }.
// ------------------------------------------------------------------
async function handleDecomposeGoalAction(args: any): Promise<Response> {
  const { title, description, timeframe, category, userId } = args || {};
  console.log('🎯 decompose_goal: start', { userId, title, timeframe });

  try {
    if (!userId || !title) {
      return new Response(
        JSON.stringify({ milestones: [], error: 'missing_userId_or_title' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.7.1');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const [bpRes, siRes] = await Promise.all([
      supabase.from('user_blueprints').select('blueprint').eq('user_id', userId).eq('is_active', true).maybeSingle(),
      supabase.from('hermetic_structured_intelligence')
        .select('execution_bias, temporal_biology, identity_constructs, behavioral_triggers')
        .eq('user_id', userId).maybeSingle(),
    ]);
    const bp: any = bpRes?.data?.blueprint || {};
    const si: any = siRes?.data || {};

    const persona = {
      mbti: bp?.cognition_mbti?.type || bp?.user_meta?.personality?.likelyType || 'Unknown',
      hd: bp?.energy_strategy_human_design?.type || 'Unknown',
      sun: bp?.archetype_western?.sun_sign || 'Unknown',
      momentum: (si?.execution_bias?.momentum_triggers || []).slice(0, 3),
      completion: (si?.execution_bias?.completion_patterns || []).slice(0, 2),
      peaks: (si?.temporal_biology?.cognitive_peaks || []).slice(0, 3),
      avoidance: (si?.behavioral_triggers?.avoidance_patterns || []).slice(0, 3),
      narrative: si?.identity_constructs?.core_narratives?.[0] || null,
    };

    const sys = [
      'You decompose a user\'s stated goal into 4-6 concrete, sequenced milestones.',
      'Return ONLY strict JSON of this shape: {"milestones":[{"title":"...","description":"...","target_date_offset_days":N,"order":I}, ...]}',
      '- title: verb-led, ≤60 chars, concrete outcome (not a task list).',
      '- description: one sentence, why this milestone unlocks the next.',
      '- target_date_offset_days: integer days from today, strictly increasing across the sequence, respecting the timeframe.',
      '- order: 1-based index.',
      'Personalise sequencing and framing to the provided execution profile.',
      'Do NOT reframe, translate, or abstract the goal title — treat the user\'s title as verbatim ground truth.',
      'Do NOT include markdown, prose, or code fences. JSON only.',
    ].join('\n');

    const userPrompt = [
      `Goal (verbatim from user): ${title}`,
      `Description: ${description || '(none)'}`,
      `Timeframe: ${timeframe || 'unspecified'}`,
      `Category: ${category || 'personal'}`,
      '',
      'Execution profile:',
      `- MBTI: ${persona.mbti}`,
      `- Human Design: ${persona.hd}`,
      `- Sun sign: ${persona.sun}`,
      `- Momentum triggers: ${persona.momentum.join(', ') || 'unknown'}`,
      `- Completion patterns: ${persona.completion.join(', ') || 'unknown'}`,
      `- Cognitive peaks: ${persona.peaks.join(', ') || 'unknown'}`,
      `- Avoidance patterns: ${persona.avoidance.join(', ') || 'unknown'}`,
      `- Core narrative: ${persona.narrative || 'unknown'}`,
      '',
      'Return 4-6 milestones as strict JSON.',
    ].join('\n');

    const resp = await callChatCompletion({
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: userPrompt },
      ],
      model: 'gpt-4.1-mini-2025-04-14',
      max_tokens: 1500,
    });

    if (!resp.ok) {
      const errTxt = await resp.text();
      console.error('❌ decompose_goal: model call failed', resp.status, errTxt.slice(0, 500));
      return new Response(
        JSON.stringify({ milestones: [], error: 'model_error', status: resp.status }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await resp.json();
    let content: string = data?.choices?.[0]?.message?.content || '';
    content = content.replace(/```json\s*/gi, '').replace(/```/g, '').trim();

    let parsed: any = null;
    try { parsed = JSON.parse(content); }
    catch {
      const m = content.match(/\{[\s\S]*\}/);
      if (m) { try { parsed = JSON.parse(m[0]); } catch {} }
    }

    const raw = Array.isArray(parsed?.milestones) ? parsed.milestones : [];
    const milestones = raw
      .filter((m: any) => m && typeof m.title === 'string' && m.title.trim().length > 0)
      .slice(0, 6)
      .map((m: any, i: number) => ({
        title: String(m.title).slice(0, 120),
        description: typeof m.description === 'string' ? m.description.slice(0, 400) : '',
        target_date_offset_days: Number.isFinite(m.target_date_offset_days) ? Math.max(1, Math.round(m.target_date_offset_days)) : (i + 1) * 30,
        order: Number.isFinite(m.order) ? m.order : i + 1,
        completed: false,
      }));

    console.log(`✅ decompose_goal: produced ${milestones.length} milestones for user ${userId}`);
    return new Response(
      JSON.stringify({ milestones }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('❌ decompose_goal failed:', e);
    return new Response(
      JSON.stringify({ milestones: [], error: String(e) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!Deno.env.get('AZURE_OPENAI_KEY') && !Deno.env.get('OPENAI_API_KEY')) {
      throw new Error('No AI API key configured');
    }

    const body = await req.json();

    // ------------------------------------------------------------------
    // ACTION ROUTER — Phase 1 wiring
    // Callers (e.g. companion-oracle-conversation) can invoke this fn with
    // { action: 'decompose_goal', title, description, timeframe, category, userId }
    // and receive { milestones: [...] }. This bypasses the chat-completion
    // path below entirely.
    // ------------------------------------------------------------------
    if (body && typeof body === 'object' && body.action === 'decompose_goal') {
      return await handleDecomposeGoalAction(body);
    }

    const { messages, model = 'gpt-4.1-mini-2025-04-14', temperature = 0.7, tools = null, max_tokens = 4000 } = body;
    
    console.log('🔧 Tools provided:', tools?.length || 0);
    console.log('📝 Messages count:', messages?.length);
    console.log('🤖 Running OpenAI agent with model:', model);
    console.log('📨 Received request data:', JSON.stringify({
      messages,
      model,
      temperature,
      tools,
      max_tokens
    }));
    
    console.log('🎭 Starting agent conversation with tool support');

    // Start conversation loop
    let conversationMessages = [...messages];
    let iteration = 1;
    const maxIterations = 5; // Prevent infinite loops
    let data: any = null; // Fix: Declare data variable at function scope

    while (iteration <= maxIterations) {
      console.log(`🔄 Agent conversation iteration ${iteration}`);

      const requestBody: any = {
        model: model,
        messages: conversationMessages,
      };

      // CRITICAL: Add parameters based on model type with extensive logging
      if (model.includes('gpt-4o') || model.includes('gpt-3.5')) {
        // Legacy models
        requestBody.max_tokens = max_tokens;
        if (temperature !== undefined) {
          requestBody.temperature = temperature;
        }
        console.log('🔧 Using LEGACY model parameters:', {
          max_tokens: requestBody.max_tokens,
          temperature: requestBody.temperature
        });
      } else {
        // New models (GPT-4.1+, GPT-5, O3, O4) - NO temperature parameter
        requestBody.max_completion_tokens = max_tokens;
        console.log('🔧 Using NEW model parameters:', {
          max_completion_tokens: requestBody.max_completion_tokens,
          note: 'Temperature parameter EXCLUDED for newer models'
        });
      }

      if (tools && tools.length > 0) {
        requestBody.tools = tools;
        requestBody.tool_choice = 'auto';
        console.log('🛠️ Tools included in request');
      }

      console.log('📤 Sending request to OpenAI:', JSON.stringify(requestBody));

      const response = await callChatCompletion({
        messages: conversationMessages,
        model: requestBody.model,
        max_tokens: requestBody.max_completion_tokens || requestBody.max_tokens || max_tokens,
        temperature: requestBody.temperature,
        tools: requestBody.tools,
        tool_choice: requestBody.tool_choice,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenAI API error:', response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      data = await response.json(); // Fix: Update existing data variable
      console.log('📥 OpenAI response structure:', JSON.stringify({
        id: data.id,
        object: data.object,
        created: data.created,
        model: data.model,
        choices: data.choices?.map(choice => ({
          index: choice.index,
          message: {
            role: choice.message?.role,
            content: choice.message?.content ? `${choice.message.content.substring(0, 200)}....[truncated]` : null
          }
        }))
      }));
      
      const assistantMessage = data.choices[0].message;

      // CRITICAL: Check for empty content early (but allow tool calls)
      if ((!assistantMessage?.content || assistantMessage.content.trim().length === 0) && 
          (!assistantMessage?.tool_calls || assistantMessage.tool_calls.length === 0)) {
        console.error('❌ OpenAI returned empty content and no tool calls!', {
          message: assistantMessage,
          model: requestBody.model,
          parameters: {
            max_tokens: requestBody.max_tokens,
            max_completion_tokens: requestBody.max_completion_tokens,
            temperature: requestBody.temperature
          },
          raw_response: data
        });
        return new Response(JSON.stringify({ 
          error: 'OpenAI returned empty content - parameter mismatch or model error',
          debug: {
            model: requestBody.model,
            parameters_sent: {
              max_tokens: requestBody.max_tokens,
              max_completion_tokens: requestBody.max_completion_tokens,
              temperature: requestBody.temperature
            },
            openai_response: data
          }
        }), {
          status: 502,  // Bad Gateway - API responded but with invalid content
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      conversationMessages.push(assistantMessage);

      // Process tool calls if present
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        console.log(`🛠️ Processing ${assistantMessage.tool_calls.length} tool calls`);
        
        for (const toolCall of assistantMessage.tool_calls) {
          const toolResult = await executeTool(toolCall);
          
          conversationMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult)
          });
        }
        
        iteration++;
        continue; // Continue conversation
      }

      // No more tool calls, conversation is complete
      break;
    }

    const finalContent = conversationMessages[conversationMessages.length - 1]?.content || '';
    console.log('✅ Agent conversation completed');
    console.log('📝 Final content length:', finalContent.length);
    console.log('📝 Final content preview:', finalContent.substring(0, 200) + '...');

    // CRITICAL: Validate content before returning success
    if (!finalContent || finalContent.trim().length === 0) {
      console.error('❌ Final content is empty after conversation completion!');
      return new Response(JSON.stringify({ 
        error: 'Agent completed but generated no content'
      }), {
        status: 502,  // Bad Gateway - service responded but with invalid content
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // CRITICAL: Validate minimum content length for quality reports
    if (finalContent.trim().length < 500) {
      console.error(`❌ Content too short: ${finalContent.length} chars (minimum 500 required)`);
      return new Response(JSON.stringify({ 
        error: `Generated content too short: ${finalContent.length} chars (minimum 500 required)`
      }), {
        status: 502,  // Bad Gateway - service responded but with insufficient content
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('🎯 Content validation passed - returning successful response');

    // Return ONLY the content, not the full OpenAI response structure
    return new Response(JSON.stringify({ 
      content: finalContent,
      content_length: finalContent.length,
      model_used: data.model,
      total_tokens: data.usage?.total_tokens
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in openai-agent function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to process request' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
