
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, sessionId, includeBlueprint, agentType, systemPrompt } = await req.json();

    console.log('AI Coach request:', {
      agentType,
      messageLength: message?.length,
      userId: userId?.substring(0, 8) + '...',
      sessionId,
      includeBlueprint,
      hasCustomPrompt: !!systemPrompt
    });

    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Use custom system prompt if provided, otherwise fall back to default
    const getSystemPrompt = (agentType: string) => {
      if (systemPrompt) {
        return systemPrompt;
      }

      // Fallback to basic prompts if no custom prompt provided
      const baseContext = includeBlueprint 
        ? "You have access to the user's Soul Blueprint which includes their astrological chart, personality insights, and life patterns. Use this information to provide personalized guidance."
        : "Provide thoughtful guidance based on the conversation.";

      switch (agentType) {
        case 'coach':
          return `You are the Soul Coach, focused EXCLUSIVELY on productivity and goal achievement. ${baseContext}

DOMAIN: Productivity, goals, accountability, action planning, time management.
STYLE: Direct, structured, action-oriented. Always end with concrete next steps.
BOUNDARIES: Do NOT venture into relationships, emotions, or spiritual topics.`;

        case 'guide':
          return `You are the Soul Guide, focused EXCLUSIVELY on personal growth and life wisdom. ${baseContext}

DOMAIN: Self-understanding, emotions, relationships, life meaning, spiritual growth.
STYLE: Reflective, validating, wisdom-focused. Create space for deeper exploration.
BOUNDARIES: Do NOT give productivity advice or goal-setting strategies.`;

        case 'blend':
        default:
          return `You are the Soul Companion, seamlessly integrating ALL aspects of life. ${baseContext}

APPROACH: No domain separation. Treat productivity as spiritual practice. Connect goals with meaning.
STYLE: Fluidly blend action-oriented coaching with reflective guidance.
INTEGRATION: Help users achieve goals while staying authentic to their inner wisdom.`;
      }
    };

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
