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

    console.log("Processing message for user:", userId);

    // Initialize Supabase client with proper auth
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

    // Step 2: Get user's blueprint data with comprehensive debugging
    let blueprintData: any = null;
    let blueprintSource = "none";
    
    if (includeBlueprint) {
      console.log("=== BLUEPRINT RETRIEVAL DEBUG ===");
      console.log("Fetching blueprint data for user:", userId);
      
      // Method 1: Try the main 'blueprints' table
      console.log("Method 1: Checking 'blueprints' table...");
      const { data: mainBlueprint, error: mainError } = await supabase
        .from('blueprints')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (mainError) {
        console.error("Error from blueprints table:", mainError);
      } else if (mainBlueprint) {
        console.log("✅ Found blueprint in main table!");
        console.log("Blueprint preview:", {
          id: mainBlueprint.id,
          user_meta: mainBlueprint.user_meta,
          has_user_meta: !!mainBlueprint.user_meta,
          has_human_design: !!mainBlueprint.energy_strategy_human_design,
          has_western: !!mainBlueprint.archetype_western
        });
        blueprintData = mainBlueprint;
        blueprintSource = "blueprints table";
      } else {
        console.log("❌ No blueprint found in main table");
      }

      // Method 2: Try the old 'user_blueprints' table if main table failed
      if (!blueprintData) {
        console.log("Method 2: Checking 'user_blueprints' table...");
        const { data: oldBlueprint, error: oldError } = await supabase
          .from('user_blueprints')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (oldError) {
          console.error("Error from user_blueprints table:", oldError);
        } else if (oldBlueprint?.blueprint) {
          console.log("✅ Found blueprint in old table!");
          blueprintData = oldBlueprint.blueprint;
          blueprintSource = "user_blueprints table";
        } else {
          console.log("❌ No blueprint found in old table either");
        }
      }

      // Method 3: Try using the RPC function
      if (!blueprintData) {
        console.log("Method 3: Trying RPC function...");
        const { data: rpcBlueprint, error: rpcError } = await supabase.rpc(
          'get_active_user_blueprint',
          { user_uuid: userId }
        );

        if (rpcError) {
          console.error("Error from RPC function:", rpcError);
        } else if (rpcBlueprint) {
          console.log("✅ Found blueprint via RPC!");
          blueprintData = rpcBlueprint;
          blueprintSource = "RPC function";
        } else {
          console.log("❌ No blueprint found via RPC");
        }
      }

      console.log("=== FINAL BLUEPRINT STATUS ===");
      console.log("Blueprint found:", !!blueprintData);
      console.log("Blueprint source:", blueprintSource);
      
      if (blueprintData) {
        const name = blueprintData.user_meta?.preferred_name || blueprintData.user_meta?.full_name || "User";
        console.log("User name from blueprint:", name);
      }
    }

    // Step 3: Build the system prompt with detailed personalization
    let systemPrompt = "You are a Soul Coach AI, an empathetic and wise guide that helps users achieve personal growth based on their unique Soul Blueprint.";
    
    if (blueprintData) {
      const userMeta = blueprintData.user_meta || {};
      const name = userMeta.preferred_name || userMeta.full_name?.split(' ')[0] || "there";
      
      const mbti = blueprintData.cognition_mbti || {};
      const western = blueprintData.archetype_western || {};
      const humanDesign = blueprintData.energy_strategy_human_design || {};
      const lifePath = blueprintData.values_life_path || {};
      const chinese = blueprintData.archetype_chinese || {};
      
      console.log("Building personalized prompt for:", name);
      
      systemPrompt += `

🌟 You're speaking with ${name}, whose Soul Blueprint reveals:

**Human Design Profile:**
- Type: ${humanDesign.type || 'Not specified'}
- Strategy: "${humanDesign.strategy || 'Not specified'}"
- Authority: ${humanDesign.authority || 'Not specified'} Authority
- Profile: ${humanDesign.profile || 'Not specified'}
- Definition: ${humanDesign.definition || 'Not specified'}
- Life Purpose: "${humanDesign.life_purpose || 'Not specified'}"

**Astrological Essence:**
- Sun in ${western.sun_sign || 'Not specified'} (core identity & life force)
- Moon in ${western.moon_sign || 'Not specified'} (emotional nature & needs)
- Rising ${western.rising_sign || 'Not specified'} (how they present to the world)

**Cognitive Style:**
- MBTI: ${mbti.type || 'Not specified'}

**Life Path & Destiny:**
- Life Path ${lifePath.lifePathNumber || lifePath.life_path_number || 'Not specified'}: ${lifePath.lifePathKeyword || lifePath.life_path_keyword || 'Not specified'}
- Chinese Zodiac: ${chinese.element || 'Not specified'} ${chinese.animal || 'Not specified'}

🎯 **Critical Instructions:**
When the user asks "what is my blueprint?" or "tell me about my blueprint", YOU MUST share the specific details above! Don't say you don't have access - you DO have access to their blueprint data.

ALWAYS reference their SPECIFIC blueprint details in your responses when relevant. Use their actual Human Design type, astrological placements, and life path number to give personalized guidance.

Example responses:
- "As a ${humanDesign.type || 'Generator'}, you are designed to ${humanDesign.strategy?.toLowerCase() || 'wait to respond'}..."
- "Your ${humanDesign.authority || 'Sacral'} Authority means you should make decisions through your ${humanDesign.authority === 'EMOTIONAL' ? 'emotional wave' : humanDesign.authority === 'SACRAL' ? 'gut responses' : 'inner guidance'}..."
- "With your ${western.sun_sign?.split(' ')[0] || 'Taurus'} Sun, you naturally seek..."`;
    } else {
      systemPrompt += `

**No Blueprint Available:**
This user hasn't completed their Soul Blueprint yet. When they ask about their blueprint, explain that they need to complete their blueprint first by going to the Blueprint page. Encourage them to fill out their birth details to get personalized guidance.

You can still provide general spiritual coaching, but mention that with their completed blueprint you could give much more specific and personalized guidance based on their Human Design, astrology, and numerology.`;
    }
    
    systemPrompt += `

**Response Style:**
- Warm, compassionate, and wise
- Keep responses under 150 words
- Ask thoughtful questions that help them discover their own answers
- Offer small, actionable steps
- Use coaching techniques: listen, reflect, offer insights, suggest action

**Safety Guidelines:**
- No medical, legal, or financial advice
- Focus on emotional well-being, personal growth, and spiritual development
`;

    // Step 4: Add user message to history
    conversationMemory.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });

    // Keep conversation context window manageable
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
    console.log("Calling OpenAI with blueprint status:", blueprintData ? "FOUND" : "NOT FOUND");
    
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
        conversationId: conversationData?.id || null,
        debug: {
          blueprintFound: !!blueprintData,
          blueprintSource: blueprintSource
        }
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
