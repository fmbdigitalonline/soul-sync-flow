
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize OpenAI API key from environment variable
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY environment variable");
}

// Define conversation memory interface
interface ConversationMemory {
  id?: string;
  user_id: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  created_at?: string;
  updated_at: string;
  session_id: string;
}

interface BlueprintData {
  user_meta: {
    preferred_name: string;
  };
  cognition_mbti: {
    type: string;
  };
  archetype_western: {
    sun_sign: string;
    moon_sign: string;
    rising_sign: string;
  };
  energy_strategy_human_design: {
    type: string;
    authority: string;
    strategy: string;
  };
  values_life_path: {
    life_path_number: number;
    life_path_keyword: string;
  };
  // Add other fields as needed
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, sessionId, includeBlueprint } = await req.json();

    if (!message || !userId || !sessionId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client - Using v2 with proper Deno configuration
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://qxaajirrqrcnmvtowjbg.supabase.co';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Step 1: Retrieve conversation history
    const { data: conversationData, error: conversationError } = await supabase
      .from('conversation_memory')
      .select('*')
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .maybeSingle();

    if (conversationError && conversationError.code !== 'PGRST116') {
      console.error("Error retrieving conversation:", conversationError);
      return new Response(
        JSON.stringify({ error: "Failed to retrieve conversation history" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize conversation if it doesn't exist
    let conversationMemory: ConversationMemory;
    if (!conversationData) {
      conversationMemory = {
        user_id: userId,
        messages: [],
        updated_at: new Date().toISOString(),
        session_id: sessionId
      };
    } else {
      conversationMemory = conversationData as ConversationMemory;
    }

    // Step 2: Get user's blueprint data for personalization if requested
    let blueprintData: BlueprintData | null = null;
    if (includeBlueprint) {
      const { data: blueprint, error: blueprintError } = await supabase.rpc(
        'get_active_user_blueprint',
        { user_uuid: userId }
      );

      if (blueprintError) {
        console.error("Error retrieving blueprint:", blueprintError);
      } else if (blueprint) {
        blueprintData = blueprint as BlueprintData;
      }
    }

    // Step 3: Build the system prompt with personalization from blueprint
    let systemPrompt = "You are a Soul Coach AI, an empathetic and wise guide that helps users achieve personal growth.";
    
    if (blueprintData) {
      const name = blueprintData.user_meta?.preferred_name || "there";
      const mbtiType = blueprintData.cognition_mbti?.type || "INFJ";
      const sunSign = blueprintData.archetype_western?.sun_sign?.split(" ")[0] || "Taurus";
      const moonSign = blueprintData.archetype_western?.moon_sign?.split(" ")[0] || "Cancer";
      const risingSign = blueprintData.archetype_western?.rising_sign?.split(" ")[0] || "Virgo";
      const hdType = blueprintData.energy_strategy_human_design?.type || "Projector";
      const strategy = blueprintData.energy_strategy_human_design?.strategy || "Wait for invitation";
      const authority = blueprintData.energy_strategy_human_design?.authority || "Emotional";
      const lifePath = blueprintData.values_life_path?.life_path_number || 7;
      const lifePathKeyword = blueprintData.values_life_path?.life_path_keyword || "Seeker";
      
      systemPrompt += `
You're speaking with ${name}, who has the following Soul Blueprint:
- MBTI: ${mbtiType}
- Astrology: ${sunSign} Sun, ${moonSign} Moon, ${risingSign} Rising
- Human Design: ${hdType} type with ${authority} Authority
- Life Strategy: "${strategy}"
- Life Path: ${lifePath} (${lifePathKeyword})

Tailor your advice to their spiritual design. For example:
- As a ${mbtiType}, they ${mbtiType.includes('N') ? 'prefer big picture concepts' : 'appreciate practical details'}
- With ${sunSign} Sun, they value ${sunSign === 'Taurus' ? 'stability and comfort' : sunSign === 'Leo' ? 'creative expression' : 'personal growth'}
- Their ${authority} Authority means decisions should be made through ${authority === 'Emotional' ? 'waiting through their emotional wave' : authority === 'Sacral' ? 'gut responses' : 'intuitive hits'}
- As a ${hdType}, they thrive when ${hdType === 'Projector' ? 'waiting for recognition and invitation' : hdType === 'Generator' ? 'responding to what excites them' : 'initiating what feels right'}
- Life Path ${lifePath} indicates they're here to ${lifePathKeyword === 'Seeker' ? 'pursue wisdom and truth' : lifePathKeyword === 'Humanitarian' ? 'help others' : 'forge their own path'}

Make your advice specific to their design, not generic. Invoke their specific blueprint details when relevant.
`;
    }
    
    systemPrompt += `
Respond in a warm, compassionate voice. Keep responses concise (under 150 words). Use a coaching approach:
1. Listen and reflect what you hear
2. Ask thoughtful questions
3. Offer insights based on their Soul Blueprint
4. Suggest small, actionable steps

Safety Note: Avoid giving medical, legal, or financial advice. Focus on emotional well-being, personal growth, and spiritual development aligned with their blueprint.
`;

    // Step 4: Add user message to history
    conversationMemory.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });

    // Keep conversation context window manageable (last 10 messages)
    if (conversationMemory.messages.length > 20) {
      conversationMemory.messages = conversationMemory.messages.slice(-20);
    }

    // Step 5: Build messages array for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history
    conversationMemory.messages.forEach(msg => {
      messages.push({ role: msg.role, content: msg.content });
    });

    // Step 6: Call OpenAI API with content moderation
    console.log("Calling OpenAI with messages:", JSON.stringify(messages.slice(0, 2))); // Log only system message for brevity
    
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",  // Updated to use GPT-4.1-mini model
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0.2,
        presence_penalty: 0.2
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error("OpenAI API error:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to get response from AI service" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await openaiResponse.json();
    const aiMessage = data.choices[0].message.content;

    // Step 7: Add AI response to conversation memory
    conversationMemory.messages.push({
      role: 'assistant',
      content: aiMessage,
      timestamp: new Date().toISOString()
    });
    
    conversationMemory.updated_at = new Date().toISOString();

    // Step 8: Save updated conversation to database
    if (conversationData) {
      // Update existing conversation
      const { error: updateError } = await supabase
        .from('conversation_memory')
        .update({
          messages: conversationMemory.messages,
          updated_at: conversationMemory.updated_at
        })
        .eq('id', conversationData.id);

      if (updateError) {
        console.error("Error updating conversation:", updateError);
      }
    } else {
      // Insert new conversation
      const { error: insertError } = await supabase
        .from('conversation_memory')
        .insert(conversationMemory);

      if (insertError) {
        console.error("Error inserting conversation:", insertError);
      }
    }

    // Step 9: Return AI response to client
    return new Response(
      JSON.stringify({
        response: aiMessage,
        conversationId: conversationData?.id || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error in AI Coach function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
