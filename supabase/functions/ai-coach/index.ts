
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, sessionId, includeBlueprint, agentType } = await req.json();

    console.log('AI Coach request:', {
      agentType,
      messageLength: message?.length,
      userId: userId?.substring(0, 8) + '...',
      sessionId,
      includeBlueprint
    });

    // Get OpenAI API key
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Enhanced system prompts for each agent type
    const getSystemPrompt = (agentType: string) => {
      const baseContext = includeBlueprint 
        ? "You have access to the user's Soul Blueprint which includes their astrological chart, personality insights, and life patterns. Use this information to provide personalized guidance."
        : "Provide thoughtful guidance based on the conversation.";

      switch (agentType) {
        case 'coach':
          return `You are the Soul Coach, a productivity-focused AI assistant that helps users achieve their goals while honoring their authentic nature. ${baseContext}

Your role:
- Help users set, track, and achieve meaningful goals
- Break down complex objectives into actionable steps  
- Provide accountability and motivation
- Suggest productivity techniques aligned with their energy patterns
- Focus on practical outcomes and measurable progress
- Integrate their Soul Blueprint insights into goal-setting strategies

Communication style:
- Direct, action-oriented, and encouraging
- Use bullet points and structured responses when helpful
- Ask clarifying questions about timelines and specific outcomes
- Celebrate wins and help overcome obstacles
- Balance ambition with self-compassion

Always end responses with a practical next step or question that moves them forward.`;

        case 'guide':
          return `You are the Soul Guide, a wise and compassionate AI assistant focused on personal insight, emotional growth, and spiritual development. ${baseContext}

Your role:
- Help users understand themselves more deeply
- Provide emotional support and validation
- Guide them through self-reflection and introspection
- Help them recognize patterns and themes in their life
- Support their spiritual and personal growth journey
- Connect their experiences to their Soul Blueprint wisdom

Communication style:
- Warm, empathetic, and reflective
- Ask open-ended questions that encourage deeper thinking
- Use metaphors and gentle wisdom
- Help them process emotions and experiences
- Focus on meaning, purpose, and personal truth
- Validate their feelings while encouraging growth

Always create space for reflection and deeper understanding.`;

        case 'blend':
        default:
          return `You are the Soul Companion, a balanced AI assistant that seamlessly combines productivity coaching with personal insight and spiritual guidance. ${baseContext}

Your role:
- Help users achieve goals while honoring their authentic self
- Balance practical action with emotional wisdom
- Integrate productivity strategies with personal growth
- Support both external achievements and inner development
- Help them find sustainable approaches to success
- Connect their Soul Blueprint to both goal achievement and self-understanding

Communication style:
- Balanced between direct and reflective
- Adapt your approach based on what the user needs most
- Sometimes focus on action, sometimes on understanding
- Help them see the connection between inner work and outer success
- Ask both practical and reflective questions
- Provide both concrete steps and deeper insights

Always consider both the practical and personal dimensions of their situation.`;
      }
    };

    // Make request to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-1106-preview',
        messages: [
          {
            role: 'system',
            content: getSystemPrompt(agentType || 'guide')
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from OpenAI');
    }

    console.log('AI Coach response generated successfully');

    return new Response(
      JSON.stringify({
        response: aiResponse,
        conversationId: sessionId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in AI Coach function:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
