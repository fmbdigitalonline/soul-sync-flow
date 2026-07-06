import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
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

// ────────────────────────────────────────────────────────────────────
// PHASE 1 (item 1): REAL goal decomposition. Loads the user's blueprint
// slice + hermetic structured intelligence, asks the model for 4-6
// concrete, time-bounded, personalised milestones as strict JSON.
// NOTE: generatePlanBranches remains an untouched stub — multi-branch
// generation is deferred to Phase 3 (orchestrator plan chain).
// ────────────────────────────────────────────────────────────────────
function trimStr(v: unknown, max: number): string {
  const s = typeof v === 'string' ? v : (v == null ? '' : String(v));
  return s.length > max ? s.slice(0, max) + '…' : s;
}

async function decomposeGoalReal(params: {
  title: string;
  description?: string;
  timeframe?: string;
  category?: string;
  userId: string;
}): Promise<{ milestones: any[] }> {
  const { title, description = '', timeframe = '', category = '', userId } = params;
  if (!title || !userId) throw new Error('decompose_goal requires title and userId');

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // 1. Blueprint + structured-intelligence slice (fail-soft: decomposition
  //    still runs unpersonalised if either row is missing).
  const [hsiRes, bpRes] = await Promise.all([
    supabase
      .from('hermetic_structured_intelligence')
      .select('execution_bias, temporal_biology, identity_constructs')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('user_blueprints')
      .select('blueprint')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle()
  ]);

  const hsi = hsiRes?.data || null;
  const bp = bpRes?.data?.blueprint || null;

  const sliceLines: string[] = [];
  if (bp) {
    const mbti = bp.user_meta?.personality?.likelyType || bp.cognition_mbti?.type;
    const hd = bp.energy_strategy_human_design?.type;
    if (mbti) sliceLines.push(`- Thinking style (MBTI): ${trimStr(mbti, 40)}`);
    if (hd) sliceLines.push(`- Energy strategy (Human Design): ${trimStr(hd, 40)}`);
  }
  if (hsi) {
    const eb = hsi.execution_bias || {};
    if (eb.preferred_style) sliceLines.push(`- Execution style: ${trimStr(eb.preferred_style, 160)}`);
    if (eb.completion_patterns) sliceLines.push(`- Completion pattern: ${trimStr(eb.completion_patterns, 160)}`);
    const peaks = hsi.temporal_biology?.cognitive_peaks;
    if (Array.isArray(peaks) && peaks.length > 0) sliceLines.push(`- Cognitive peaks: ${trimStr(peaks.slice(0, 3).join('; '), 160)}`);
    const narratives = hsi.identity_constructs?.core_narratives;
    if (Array.isArray(narratives) && narratives.length > 0) sliceLines.push(`- Core narrative: ${trimStr(narratives[0], 160)}`);
  }
  const blueprintSlice = sliceLines.length > 0 ? sliceLines.join('\n') : '(no blueprint slice available — decompose generically but concretely)';

  console.log('🧩 DECOMPOSE_GOAL: Inputs ready', {
    userId: userId.substring(0, 8),
    title: title.substring(0, 60),
    hasHsi: !!hsi,
    hasBlueprint: !!bp,
    sliceLines: sliceLines.length
  });

  // 2. Strict-JSON decomposition call via the shared Azure helper.
  const systemPrompt =
    'You are a goal decomposition engine. Return ONLY valid JSON — no markdown fences, no commentary — with this exact shape:\n' +
    '{"milestones":[{"title":"string","description":"string","target_date_offset_days":number,"order":number}]}\n' +
    'Rules:\n' +
    '- 4 to 6 milestones, ordered 1..n, sequenced toward the user\'s stated goal VERBATIM (never rename or reframe the goal).\n' +
    '- Each milestone concrete and time-bounded: target_date_offset_days is days from today, consistent with the stated timeframe.\n' +
    '- Personalise HOW each milestone is approached using the blueprint slice provided (execution style, energy strategy, cognitive peaks) — the WHAT stays true to the goal.\n' +
    '- Milestone titles: max 8 words, action-first. Descriptions: one sentence, specific and measurable.';

  const userPrompt =
    `GOAL (verbatim, do not alter): ${title}\n` +
    (description ? `DESCRIPTION: ${description}\n` : '') +
    (timeframe ? `TIMEFRAME: ${timeframe}\n` : '') +
    (category ? `CATEGORY: ${category}\n` : '') +
    `BLUEPRINT SLICE:\n${blueprintSlice}`;

  const resp = await callChatCompletion({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    model: 'gpt-4.1-mini-2025-04-14',
    max_tokens: 1200
  });

  const respText = await resp.text();
  if (!resp.ok) {
    throw new Error(`decompose_goal AI call failed: HTTP ${resp.status} — ${respText.substring(0, 300)}`);
  }

  const raw = JSON.parse(respText)?.choices?.[0]?.message?.content || '';
  const cleaned = raw.replace(/```json|```/g, '').trim();
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error('decompose_goal returned non-JSON content: ' + cleaned.substring(0, 200));
  }

  // 3. Shape validation — surface failure, never fabricate.
  const milestones = Array.isArray(parsed?.milestones) ? parsed.milestones : [];
  const valid = milestones
    .filter((m: any) => m && typeof m.title === 'string' && m.title.trim().length > 0)
    .slice(0, 6)
    .map((m: any, i: number) => ({
      title: trimStr(m.title, 120),
      description: trimStr(m.description || '', 240),
      target_date_offset_days: Number.isFinite(Number(m.target_date_offset_days)) ? Math.max(1, Math.round(Number(m.target_date_offset_days))) : (i + 1) * 30,
      order: Number.isFinite(Number(m.order)) ? Number(m.order) : i + 1,
      completed: false
    }));

  console.log('🧩 DECOMPOSE_GOAL: Decomposition complete', {
    requested: milestones.length,
    valid: valid.length,
    titles: valid.map((m: any) => m.title.substring(0, 40))
  });

  return { milestones: valid };
}

async function handleDecomposeGoal(body: any): Promise<Response> {
  const startTime = Date.now();
  try {
    const result = await decomposeGoalReal({
      title: body.title,
      description: body.description,
      timeframe: body.timeframe,
      category: body.category,
      userId: body.userId
    });
    console.log('✅ DECOMPOSE_GOAL: Returning', { milestoneCount: result.milestones.length, ms: Date.now() - startTime });
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    // Return 200 with empty milestones + error so the oracle's fail-path
    // (milestones.length < 3 → no card) handles it without an invoke throw.
    console.error('❌ DECOMPOSE_GOAL failed:', error instanceof Error ? error.message : error);
    return new Response(JSON.stringify({ milestones: [], error: error instanceof Error ? error.message : String(error) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
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

    // ── PHASE 1 ACTION ROUTER: direct actions bypass the chat-completion path.
    // The companion oracle invokes { action: 'decompose_goal', ... }; before
    // this branch existed the destructure below silently ignored it and the
    // caller received null → empty DreamCards. Existing chat-completion
    // callers are untouched: no `action` field → falls through unchanged.
    if (body?.action === 'decompose_goal') {
      return await handleDecomposeGoal(body);
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
