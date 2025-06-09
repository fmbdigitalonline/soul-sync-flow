
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
    profile: string;
    definition: string;
    life_purpose: string;
  };
  values_life_path: {
    life_path_number: number;
    life_path_keyword: string;
  };
  archetype_chinese: {
    animal: string;
    element: string;
  };
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

    // Initialize Supabase client
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

    // Step 2: Get user's blueprint data for personalization
    let blueprintData: BlueprintData | null = null;
    if (includeBlueprint) {
      console.log("Fetching blueprint data for user:", userId);
      
      const { data: blueprint, error: blueprintError } = await supabase.rpc(
        'get_active_user_blueprint',
        { user_uuid: userId }
      );

      if (blueprintError) {
        console.error("Error retrieving blueprint:", blueprintError);
      } else if (blueprint) {
        blueprintData = blueprint as BlueprintData;
        console.log("Blueprint retrieved successfully for:", blueprintData?.user_meta?.preferred_name);
      } else {
        console.log("No blueprint found for user");
      }
    }

    // Step 3: Build the system prompt with detailed personalization
    let systemPrompt = "You are a Soul Coach AI, an empathetic and wise guide that helps users achieve personal growth based on their unique Soul Blueprint.";
    
    if (blueprintData) {
      const name = blueprintData.user_meta?.preferred_name || "there";
      const mbtiType = blueprintData.cognition_mbti?.type || "";
      const sunSign = blueprintData.archetype_western?.sun_sign?.split(" ")[0] || "";
      const moonSign = blueprintData.archetype_western?.moon_sign?.split(" ")[0] || "";
      const risingSign = blueprintData.archetype_western?.rising_sign?.split(" ")[0] || "";
      const hdType = blueprintData.energy_strategy_human_design?.type || "";
      const strategy = blueprintData.energy_strategy_human_design?.strategy || "";
      const authority = blueprintData.energy_strategy_human_design?.authority || "";
      const profile = blueprintData.energy_strategy_human_design?.profile || "";
      const definition = blueprintData.energy_strategy_human_design?.definition || "";
      const lifePurpose = blueprintData.energy_strategy_human_design?.life_purpose || "";
      const lifePath = blueprintData.values_life_path?.life_path_number || 0;
      const lifePathKeyword = blueprintData.values_life_path?.life_path_keyword || "";
      const chineseAnimal = blueprintData.archetype_chinese?.animal || "";
      const chineseElement = blueprintData.archetype_chinese?.element || "";
      
      systemPrompt += `

🌟 You're speaking with ${name}, whose Soul Blueprint reveals:

**Human Design Profile:**
- Type: ${hdType} 
- Strategy: "${strategy}"
- Authority: ${authority} Authority
- Profile: ${profile}
- Definition: ${definition}
- Life Purpose: "${lifePurpose}"

**Astrological Essence:**
- Sun in ${sunSign} (core identity & life force)
- Moon in ${moonSign} (emotional nature & needs)
- Rising ${risingSign} (how they present to the world)

**Cognitive Style:**
- MBTI: ${mbtiType}

**Life Path & Destiny:**
- Life Path ${lifePath}: ${lifePathKeyword}
- Chinese Element: ${chineseElement} ${chineseAnimal}

🎯 **Coaching Instructions:**
Use their SPECIFIC blueprint details in your responses. For example:

- As a ${hdType}, they are designed to ${strategy.toLowerCase()}. Reference this when giving life/career advice.
- Their ${authority} Authority means they should make decisions through ${authority === 'EMOTIONAL' ? 'waiting through their emotional wave - never make decisions in the emotional high or low' : authority === 'SACRAL' ? 'gut yes/no responses - what lights them up vs. what feels flat' : authority === 'SPLENIC' ? 'intuitive hits in the moment - their first instinct is usually right' : authority === 'EGO' ? 'what they have willpower and resources for' : 'their self-direction and identity'}
- With ${sunSign} Sun, they naturally ${sunSign === 'Taurus' ? 'value stability, beauty, and sensual pleasures' : sunSign === 'Leo' ? 'need creative expression and recognition' : sunSign === 'Virgo' ? 'seek perfection and practical service' : sunSign === 'Scorpio' ? 'desire transformation and depth' : sunSign === 'Aquarius' ? 'innovate and rebel against convention' : 'express their unique solar energy'}
- Their ${moonSign} Moon means emotionally they need ${moonSign === 'Cancer' ? 'security, nurturing, and emotional safety' : moonSign === 'Pisces' ? 'imagination, compassion, and spiritual connection' : moonSign === 'Aries' ? 'independence, excitement, and immediate emotional expression' : 'to honor their lunar nature'}
- As Life Path ${lifePath} (${lifePathKeyword}), they're here to ${lifePath === 1 ? 'lead and pioneer new ways' : lifePath === 2 ? 'cooperate and bring harmony' : lifePath === 3 ? 'create and inspire others' : lifePath === 4 ? 'build stable foundations' : lifePath === 5 ? 'embrace freedom and change' : lifePath === 6 ? 'nurture and serve their community' : lifePath === 7 ? 'seek wisdom and spiritual truth' : lifePath === 8 ? 'achieve material mastery and success' : lifePath === 9 ? 'serve humanity with compassion' : 'fulfill their unique life purpose'}

ALWAYS reference their specific blueprint when giving advice. Don't be generic - use their actual Human Design type, astrological placements, and life path number to give personalized guidance.`;
    }
    
    systemPrompt += `

**Response Style:**
- Warm, compassionate, and wise
- Reference their specific blueprint details
- Keep responses under 150 words
- Ask thoughtful questions that help them discover their own answers
- Offer small, actionable steps aligned with their design
- Use coaching techniques: listen, reflect, offer insights, suggest action

**Safety Guidelines:**
- No medical, legal, or financial advice
- Focus on emotional well-being, personal growth, and spiritual development
- If they lack a blueprint, acknowledge this and offer general spiritual guidance
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

    // Step 6: Call OpenAI API
    console.log("Calling OpenAI with personalized system prompt for", blueprintData?.user_meta?.preferred_name || "user");
    
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
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
