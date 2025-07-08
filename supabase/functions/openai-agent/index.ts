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
    
    const { messages, model = 'gpt-4o', temperature = 0.7, tools } = requestData;

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