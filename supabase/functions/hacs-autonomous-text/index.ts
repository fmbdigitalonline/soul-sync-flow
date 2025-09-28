import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
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

  try {
    const { 
      hacsModule, 
      interventionType, 
      userContext, 
      userId,
      messageType = 'quick_bubble' // quick_bubble, intervention_prompt, deep_conversation
    } = await req.json();

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user blueprint for personalization
    const { data: blueprint } = await supabase
      .from('blueprints')
      .select('user_meta, cognition_mbti, archetype_western')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    // Get HACS intelligence for context
    const { data: hacsData } = await supabase
      .from('hacs_intelligence')
      .select('intelligence_level, module_scores')
      .eq('user_id', userId)
      .single();

    // Build personality context
    const personalityContext = blueprint ? {
      name: blueprint.user_meta?.preferred_name || 'there',
      mbti: blueprint.cognition_mbti?.type || 'ENFP',
      sunSign: blueprint.archetype_western?.sun_sign || 'Aquarius'
    } : { name: 'there', mbti: 'ENFP', sunSign: 'Aquarius' };

    // Define word limits and tones by message type
    const messageSpecs: Record<string, { maxWords: number; tone: string }> = {
      quick_bubble: { maxWords: 25, tone: 'brief and encouraging' },
      intervention_prompt: { maxWords: 50, tone: 'supportive and actionable' },
      deep_conversation: { maxWords: 100, tone: 'thoughtful and conversational' }
    };

    const spec = messageSpecs[messageType as keyof typeof messageSpecs] || messageSpecs.quick_bubble;
    const intelligenceLevel = hacsData?.intelligence_level || 50;

    // Create system prompt based on HACS module and personality
    const systemPrompt = `You are HACS (Holistic Adaptive Cognitive System), ${personalityContext.name}'s AI companion. 

Personality: ${personalityContext.mbti} ${personalityContext.sunSign}
Intelligence Level: ${intelligenceLevel}%
Module: ${hacsModule}
Intervention: ${interventionType}

Generate a ${spec.tone} message in EXACTLY ${spec.maxWords} words or less. Use their personality traits to personalize the tone. Be warm, insightful, and helpful.`;

    const userPrompt = `Context: ${userContext}

Generate a personalized HACS message for this situation.`;

    console.log('Generating HACS text:', { hacsModule, interventionType, messageType, userId });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: Math.min(100, spec.maxWords * 2),
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const generatedText = data.choices[0]?.message?.content?.trim() || 'I\'m here to help guide your journey.';

    // Log the generated message for learning
    await supabase.from('dream_activity_logs').insert({
      user_id: userId,
      activity_type: 'hacs_autonomous_text',
      activity_data: {
        hacs_module: hacsModule,
        intervention_type: interventionType,
        message_type: messageType,
        generated_text: generatedText,
        word_count: generatedText.split(' ').length
      },
      session_id: `hacs_${Date.now()}`
    });

    return new Response(JSON.stringify({ 
      generatedText,
      hacsModule,
      interventionType,
      messageType 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in hacs-autonomous-text function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error),
      generatedText: 'I\'m here to support your growth journey.' // Fallback message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});