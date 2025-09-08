
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

// Tool implementation functions
async function generatePlanBranches(args: any): Promise<any> {
  const { domain, timeline, blueprint_context, current_state } = args;
  
  // Generate multiple plan approaches based on the context
  return {
    branches: [
      {
        id: 'branch_1',
        strategy: `Gradual ${domain} development with ${timeline} timeline`,
        confidence: 0.85,
        advantages: ['Sustainable pace', 'Lower resistance', 'Better integration'],
        challenges: ['Slower visible progress', 'Requires patience']
      },
      {
        id: 'branch_2', 
        strategy: `Intensive ${domain} transformation accelerated approach`,
        confidence: 0.75,
        advantages: ['Rapid results', 'High momentum', 'Clear commitment'],
        challenges: ['Higher stress', 'Burnout risk', 'Sustainability concerns']
      },
      {
        id: 'branch_3',
        strategy: `Balanced ${domain} integration with rhythm-based cycles`,
        confidence: 0.90,
        advantages: ['Honors natural rhythms', 'Personalized approach', 'Sustainable growth'],
        challenges: ['Complex planning', 'Requires deep self-awareness']
      }
    ],
    context_integration: {
      blueprint_alignment: 'High - incorporates personal energy patterns',
      timeline_feasibility: 'Good - realistic expectations set',
      current_state_consideration: 'Excellent - builds on existing foundation'
    }
  };
}

async function evaluatePlanAlignment(args: any): Promise<any> {
  const { plan, blueprint, past_feedback, evaluation_criteria } = args;
  
  return {
    alignment_score: 8.5,
    breakdown: {
      blueprint_alignment: 9.0,
      sustainability: 8.0,
      personalization: 9.5,
      growth_potential: 8.0
    },
    recommendations: [
      'Increase sustainability by adding more recovery periods',
      'Enhance personalization with specific blueprint adaptations',
      'Add milestone celebrations to maintain motivation'
    ],
    confidence: 0.87,
    summary: 'Plan shows excellent alignment with user blueprint and demonstrates strong personalization. Consider minor adjustments for long-term sustainability.'
  };
}

async function updateUserMemory(args: any): Promise<any> {
  const { user_id, feedback_data, behavioral_signals, memory_type } = args;
  
  console.log(`💾 Updating memory for user ${user_id} with type: ${memory_type}`);
  
  return {
    memory_updated: true,
    patterns_detected: [
      'Preference for gradual change over rapid transformation',
      'High engagement with blueprint-aligned activities',
      'Strong response to personalized explanations'
    ],
    updated_preferences: {
      communication_style: 'detailed_explanations',
      pacing_preference: 'moderate',
      feedback_frequency: 'weekly'
    },
    next_recommendations: [
      'Continue blueprint-based personalization',
      'Maintain current pacing strategy',
      'Add more context-rich explanations'
    ]
  };
}

async function formatPersonalizedDelivery(args: any): Promise<any> {
  const { content, blueprint, delivery_context, urgency_level } = args;
  
  return {
    formatted_content: {
      introduction: 'Based on your unique blueprint and current journey...',
      main_content: content,
      personalization_notes: [
        'Adapted for your cognitive preferences',
        'Aligned with your energy patterns',
        'Considers your current life context'
      ],
      next_steps: [
        'Review the plan at your own pace',
        'Notice what resonates most strongly',
        'Start with the smallest comfortable step'
      ]
    },
    communication_style: blueprint?.cognition_mbti?.type?.includes('T') ? 'logical_systematic' : 'values_personal',
    delivery_tone: urgency_level === 'high' ? 'focused_direct' : 'gentle_supportive'
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
  const { blueprint_data, life_domains, correspondence_depth } = args;
  console.log('🪞 Analyzing through Law of Correspondence');
  
  return {
    hermetic_law: 'Correspondence',
    analysis_focus: 'Inner-outer pattern mirroring',
    blueprint_integration: 'Mapping how internal traits manifest externally',
    practical_applications: [
      'Pattern recognition exercises',
      'Inner-outer alignment practices',
      'Environmental harmony techniques'
    ],
    depth_score: 9.5
  };
}

async function analyzeHermeticVibration(args: any): Promise<any> {
  const { blueprint_data, energy_domains, vibration_analysis } = args;
  console.log('🌊 Analyzing through Law of Vibration');
  
  return {
    hermetic_law: 'Vibration',
    analysis_focus: 'Energetic frequencies and patterns',
    blueprint_integration: 'Understanding personal vibrational signature',
    practical_applications: [
      'Frequency alignment practices',
      'Energy management techniques',
      'Vibrational state awareness'
    ],
    depth_score: 9.5
  };
}

async function analyzeHermeticPolarity(args: any): Promise<any> {
  const { blueprint_data, polarity_focus, integration_approach } = args;
  console.log('⚖️ Analyzing through Law of Polarity');
  
  return {
    hermetic_law: 'Polarity',
    analysis_focus: 'Opposite forces and shadow integration',
    blueprint_integration: 'Balancing complementary traits and shadow work',
    practical_applications: [
      'Shadow integration exercises',
      'Polarity balancing practices',
      'Opposite force recognition'
    ],
    depth_score: 9.5
  };
}

async function analyzeHermeticRhythm(args: any): Promise<any> {
  const { blueprint_data, cycle_types, timing_focus } = args;
  console.log('🌙 Analyzing through Law of Rhythm');
  
  return {
    hermetic_law: 'Rhythm',
    analysis_focus: 'Natural cycles and timing patterns',
    blueprint_integration: 'Optimizing alignment with natural rhythms',
    practical_applications: [
      'Cycle awareness practices',
      'Timing optimization techniques',
      'Rhythm alignment exercises'
    ],
    depth_score: 9.5
  };
}

async function analyzeHermeticCausation(args: any): Promise<any> {
  const { blueprint_data, causation_domains, intervention_focus } = args;
  console.log('🎯 Analyzing through Law of Cause & Effect');
  
  return {
    hermetic_law: 'Causation',
    analysis_focus: 'Cause-effect chains and conscious creation',
    blueprint_integration: 'Understanding how traits create life patterns',
    practical_applications: [
      'Conscious creation practices',
      'Pattern intervention techniques',
      'Cause-effect awareness exercises'
    ],
    depth_score: 9.5
  };
}

async function analyzeHermeticGender(args: any): Promise<any> {
  const { blueprint_data, energy_balance, integration_approach } = args;
  console.log('⚡ Analyzing through Law of Gender');
  
  return {
    hermetic_law: 'Gender',
    analysis_focus: 'Masculine and feminine energy balance',
    blueprint_integration: 'Optimizing creative force and receptive wisdom',
    practical_applications: [
      'Energy balance practices',
      'Creative force cultivation',
      'Receptive wisdom development'
    ],
    depth_score: 9.5
  };
}

async function translateMBTIHermetic(args: any): Promise<any> {
  const { mbti_data, hermetic_integration, practical_focus } = args;
  console.log('🧩 Translating MBTI through Hermetic Laws');
  
  return {
    system_focus: 'MBTI',
    hermetic_translation: 'Complete MBTI analysis through all seven laws',
    integration_depth: 'Cognitive functions as expressions of universal principles',
    practical_applications: [
      'Function-law alignment practices',
      'Type-specific Hermetic exercises',
      'Cognitive rhythm optimization'
    ],
    depth_score: 9.5
  };
}

async function translateAstrologyHermetic(args: any): Promise<any> {
  const { astrology_data, hermetic_integration, chart_focus } = args;
  console.log('⭐ Translating Astrology through Hermetic Laws');
  
  return {
    system_focus: 'Astrology',
    hermetic_translation: 'Planetary energies as Hermetic principle expressions',
    integration_depth: 'Cosmic patterns reflecting personal consciousness',
    practical_applications: [
      'Planetary-law alignment practices',
      'Astrological timing optimization',
      'Cosmic consciousness exercises'
    ],
    depth_score: 9.5
  };
}

async function translateNumerologyHermetic(args: any): Promise<any> {
  const { numerology_data, hermetic_integration, number_focus } = args;
  console.log('🔢 Translating Numerology through Hermetic Laws');
  
  return {
    system_focus: 'Numerology',
    hermetic_translation: 'Number vibrations as universal principle frequencies',
    integration_depth: 'Numerical consciousness patterns and life timing',
    practical_applications: [
      'Number-law alignment practices',
      'Numerical timing optimization',
      'Vibrational number exercises'
    ],
    depth_score: 9.5
  };
}

async function translateHumanDesignHermetic(args: any): Promise<any> {
  const { human_design_data, hermetic_integration, energy_focus } = args;
  console.log('⚡ Translating Human Design through Hermetic Laws');
  
  return {
    system_focus: 'Human Design',
    hermetic_translation: 'Energy mechanics as Hermetic principle expressions',
    integration_depth: 'Centers and gates reflecting universal laws',
    practical_applications: [
      'Energy-law alignment practices',
      'Authority-principle integration',
      'Gate wisdom activation'
    ],
    depth_score: 9.5
  };
}

async function translateChineseAstrologyHermetic(args: any): Promise<any> {
  const { chinese_astrology_data, hermetic_integration, archetype_focus } = args;
  console.log('🐉 Translating Chinese Astrology through Hermetic Laws');
  
  return {
    system_focus: 'Chinese Astrology',
    hermetic_translation: 'Animal archetypes as Hermetic principle embodiments',
    integration_depth: 'Eastern wisdom patterns through universal laws',
    practical_applications: [
      'Archetype-law alignment practices',
      'Element-principle integration',
      'Yin-yang balance exercises'
    ],
    depth_score: 9.5
  };
}

async function synthesizeFractalPatterns(args: any): Promise<any> {
  const { all_analyses, pattern_depth, synthesis_focus } = args;
  console.log('🌀 Synthesizing fractal patterns across all analyses');
  
  return {
    synthesis_type: 'Fractal Pattern Recognition',
    pattern_integration: 'Unified consciousness blueprint revealed',
    fractal_insights: 'Each part contains and reflects the whole pattern',
    meta_patterns: [
      'Recursive consciousness themes',
      'Universal principle embodiment',
      'Integrated blueprint signature'
    ],
    depth_score: 10
  };
}

async function mapConsciousnessDimensions(args: any): Promise<any> {
  const { integration_data, dimension_focus, mapping_depth } = args;
  console.log('🗺️ Mapping consciousness across dimensions');
  
  return {
    mapping_type: 'Multi-Dimensional Consciousness',
    dimensions_mapped: ['Mental', 'Emotional', 'Physical', 'Spiritual'],
    integration_points: 'Cross-dimensional harmony and balance',
    growth_edges: [
      'Mental-emotional integration',
      'Physical-spiritual alignment',
      'Multi-dimensional coherence'
    ],
    depth_score: 10
  };
}

async function generatePracticalApplications(args: any): Promise<any> {
  const { synthesis_insights, application_areas, personalization_level } = args;
  console.log('🛠️ Generating practical applications');
  
  return {
    application_type: 'Consciousness Activation Framework',
    personalization_level: 'Blueprint-specific practices',
    daily_practices: 'Hermetic law-aligned daily rituals',
    weekly_cycles: 'Consciousness integration reviews',
    implementation_strategy: [
      'Progressive practice introduction',
      'Blueprint-aligned customization',
      'Real-world application focus'
    ],
    depth_score: 10
  };
}

// NEW: Gate-specific analysis functions for comprehensive reports
async function analyzeGateThroughHermeticLaws(args: any): Promise<any> {
  const { gate_number, gate_data, blueprint_context, analysis_depth } = args;
  console.log(`🚪 Analyzing Gate ${gate_number} through all 7 Hermetic Laws`);
  
  return {
    gate_focus: `Gate ${gate_number}`,
    hermetic_analysis: {
      mentalism: `Gate ${gate_number} mental patterns and thought structures`,
      correspondence: `Gate ${gate_number} inner-outer manifestation patterns`,
      vibration: `Gate ${gate_number} energetic frequency and resonance`,
      polarity: `Gate ${gate_number} shadow integration and balance points`,
      rhythm: `Gate ${gate_number} timing cycles and natural rhythms`,
      causation: `Gate ${gate_number} cause-effect patterns and conscious creation`,
      gender: `Gate ${gate_number} creative-receptive energy balance`
    },
    integration_depth: 'Comprehensive gate wisdom through universal principles',
    practical_applications: [
      `Gate ${gate_number}-specific daily practices`,
      `Hermetic law activation through gate energy`,
      `Conscious gate expression techniques`
    ],
    word_count_target: 1200,
    depth_score: 10
  };
}

async function analyzeProfileGateIntegration(args: any): Promise<any> {
  const { profile_data, gates_data, integration_focus } = args;
  console.log('👥 Analyzing Profile-Gate Integration patterns');
  
  return {
    analysis_type: 'Profile-Gate Integration',
    integration_patterns: 'How profile lines express through each active gate',
    conscious_design_interplay: 'Personality-Design gate relationships',
    practical_applications: [
      'Profile-specific gate activation practices',
      'Line-gate wisdom integration',
      'Personality-Design harmony techniques'
    ],
    word_count_target: 2000,
    depth_score: 10
  };
}

async function analyzeAuthorityGateExpression(args: any): Promise<any> {
  const { authority_type, gates_data, expression_patterns } = args;
  console.log('⚡ Analyzing Authority-Gate Expression patterns');
  
  return {
    analysis_type: 'Authority-Gate Expression',
    authority_patterns: 'How decision-making authority flows through active gates',
    gate_authority_activation: 'Conscious decision-making through gate wisdom',
    practical_applications: [
      'Authority-gate alignment practices',
      'Decision-making through gate energy',
      'Gate-informed choice techniques'
    ],
    word_count_target: 1800,
    depth_score: 10
  };
}

async function analyzeConsciousUnconsciousGates(args: any): Promise<any> {
  const { conscious_gates, unconscious_gates, integration_approach } = args;
  console.log('🌗 Analyzing Conscious-Unconscious Gate dynamics');
  
  return {
    analysis_type: 'Conscious-Unconscious Gate Integration',
    personality_design_bridge: 'Bridging conscious awareness and unconscious design',
    integration_opportunities: 'Bringing unconscious patterns into conscious expression',
    practical_applications: [
      'Consciousness bridge practices',
      'Shadow gate integration work',
      'Personality-Design unity techniques'
    ],
    word_count_target: 2200,
    depth_score: 10
  };
}

async function analyzeCenterGateHarmony(args: any): Promise<any> {
  const { centers_data, gates_data, harmony_focus } = args;
  console.log('🎯 Analyzing Center-Gate Harmony patterns');
  
  return {
    analysis_type: 'Center-Gate Harmony',
    energy_flow_patterns: 'How gates create center definitions and energy flows',
    defined_undefined_dynamics: 'Balancing defined centers with open gate wisdom',
    practical_applications: [
      'Center-gate energy practices',
      'Defined-undefined balance work',
      'Energy flow optimization techniques'
    ],
    word_count_target: 1600,
    depth_score: 10
  };
}

// Main agent conversation handler with tool support
async function executeAgentConversation(messages: any[], model: string, temperature: number, tools?: any[]): Promise<any> {
  console.log('🎭 Starting agent conversation with tool support');
  
  let conversationMessages = [...messages];
  let maxIterations = 5; // Prevent infinite loops
  let iteration = 0;
  
  while (iteration < maxIterations) {
    iteration++;
    console.log(`🔄 Agent conversation iteration ${iteration}`);
    
    const requestBody: any = {
      model,
      messages: conversationMessages,
      temperature,
      max_tokens: 4000
    };

    if (tools && Array.isArray(tools)) {
      requestBody.tools = tools;
    }

    console.log('📤 Sending request to OpenAI:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📥 OpenAI response structure:', JSON.stringify(data, null, 2));
    
    if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      console.error('❌ Invalid OpenAI response structure - no choices:', data);
      throw new Error('Invalid response structure from OpenAI');
    }
    
    const message = data.choices[0]?.message;
    if (!message) {
      console.error('❌ Invalid OpenAI response structure - no message:', data.choices[0]);
      throw new Error('Invalid message structure from OpenAI');
    }

    // Add the assistant's response to conversation
    conversationMessages.push(message);

    // Check if the assistant wants to use tools
    if (message.tool_calls && message.tool_calls.length > 0) {
      console.log('🔧 Processing tool calls:', message.tool_calls.length);
      
      // Execute each tool call
      for (const toolCall of message.tool_calls) {
        const toolResult = await executeTool(toolCall);
        
        // Add tool result to conversation
        conversationMessages.push({
          role: 'tool',
          content: JSON.stringify(toolResult),
          tool_call_id: toolCall.id
        });
        
        console.log('✅ Tool result added to conversation');
      }
      
      // Continue the conversation to get final response
      continue;
    }

    // If no tool calls, we have the final response
    const content = message.content || '';
    console.log('✅ Agent conversation completed');
    console.log('📝 Final content length:', content.length);
    console.log('📝 Final content preview:', content.substring(0, 200) + (content.length > 200 ? '...' : ''));

    return { 
      content,
      usage: data.usage,
      model: data.model,
      iterations: iteration,
      tool_calls_executed: conversationMessages.filter(m => m.role === 'tool').length
    };
  }
  
  // If we hit max iterations, return what we have
  const lastMessage = conversationMessages[conversationMessages.length - 1];
  return {
    content: lastMessage?.content || 'Max iterations reached',
    usage: {},
    model: model,
    iterations: maxIterations,
    warning: 'Conversation reached maximum iterations'
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const requestData = await req.json();
    console.log('📨 Received request data:', JSON.stringify(requestData, null, 2));
    
    const { messages, model = 'gpt-4.1-mini-2025-04-14', temperature = 0.7, tools } = requestData;

    if (!messages || !Array.isArray(messages)) {
      console.error('❌ Invalid messages array:', messages);
      throw new Error('Messages array is required');
    }

    console.log('🤖 Running OpenAI agent with model:', model);
    console.log('📝 Messages count:', messages.length);
    console.log('🔧 Tools provided:', tools ? tools.length : 0);

    // Execute agent conversation with tool handling
    const finalResponse = await executeAgentConversation(messages, model, temperature, tools);
    
    return new Response(JSON.stringify(finalResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in openai-agent function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to run agent' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
