
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

// Agent type definition
type AgentType = "coach" | "guide" | "blend";

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, sessionId, includeBlueprint, agentType = "guide" } = await req.json();

    if (!message || !userId || !sessionId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Processing message for user:", userId, "with agent type:", agentType);

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

    // Step 3: Build the system prompt based on agent type
    let systemPrompt = "";
    
    if (agentType === "coach") {
      systemPrompt = buildCoachPrompt(blueprintData);
    } else if (agentType === "guide") {
      systemPrompt = buildGuidePrompt(blueprintData);
    } else {
      systemPrompt = buildBlendPrompt(blueprintData);
    }

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
    console.log("Calling OpenAI with agent type:", agentType, "and blueprint status:", blueprintData ? "FOUND" : "NOT FOUND");
    
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
        agentType: agentType,
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

// Soul Coach prompt builder - focused on productivity and goal achievement
function buildCoachPrompt(blueprintData: any): string {
  let prompt = "You are Soul Coach, a productivity-focused AI guide that helps users achieve concrete goals and get things done efficiently, using their unique Soul Blueprint for tactical optimization.";
  
  if (blueprintData) {
    const userMeta = blueprintData.user_meta || {};
    const name = userMeta.preferred_name || userMeta.full_name?.split(' ')[0] || "there";
    
    const mbti = blueprintData.cognition_mbti || {};
    const western = blueprintData.archetype_western || {};
    const humanDesign = blueprintData.energy_strategy_human_design || {};
    const lifePath = blueprintData.values_life_path || {};
    
    prompt += `

🎯 Working with ${name} - Blueprint-Optimized Productivity:

**Energy Strategy (Human Design):**
- Type: ${humanDesign.type || 'Not specified'} - Use this for optimal work timing and energy management
- Strategy: "${humanDesign.strategy || 'Not specified'}" - Apply this to task initiation
- Authority: ${humanDesign.authority || 'Not specified'} Authority - Use for decision-making approach

**Cognitive Style (MBTI):**
- Type: ${mbti.type || 'Not specified'} - Tailor information processing and planning methods

**Core Drive (Astrology & Numerology):**
- Sun in ${western.sun_sign || 'Not specified'} - Core motivation style
- Life Path ${lifePath.lifePathNumber || lifePath.life_path_number || 'Not specified'} - Long-term direction alignment

🎯 **Soul Coach Focus:**
- Break down goals into actionable micro-tasks
- Provide accountability and progress tracking
- Suggest time management tactics based on their energy type
- Offer motivation strategies aligned with their core drives
- Keep responses practical and implementation-focused
- Ask for specific commitments and deadlines`;
  } else {
    prompt += `

**No Blueprint Available:**
Focus on general productivity principles. Encourage the user to complete their Soul Blueprint for personalized productivity strategies based on their energy type, cognitive style, and core motivations.`;
  }
  
  prompt += `

**Soul Coach Style:**
- Direct, supportive, and action-oriented
- Keep responses under 150 words
- Always include a specific next step or commitment
- Ask accountability questions
- Focus on "what will you do" rather than "how do you feel"
- Use their blueprint data to optimize tactics, not for deep insight

**Safety Guidelines:**
- No medical, legal, or financial advice
- Focus on productivity, goal achievement, and task management`;

  return prompt;
}

// Soul Guide prompt builder - focused on personal insight and spiritual growth
function buildGuidePrompt(blueprintData: any): string {
  let prompt = "You are Soul Guide, an empathetic and wise spiritual mentor that helps users achieve personal growth, self-understanding, and emotional wellbeing based on their unique Soul Blueprint.";
  
  if (blueprintData) {
    const userMeta = blueprintData.user_meta || {};
    const name = userMeta.preferred_name || userMeta.full_name?.split(' ')[0] || "there";
    
    const mbti = blueprintData.cognition_mbti || {};
    const western = blueprintData.archetype_western || {};
    const humanDesign = blueprintData.energy_strategy_human_design || {};
    const lifePath = blueprintData.values_life_path || {};
    const chinese = blueprintData.archetype_chinese || {};
    
    prompt += `

🌟 Guiding ${name} - Soul Blueprint Insights:

**Human Design Profile:**
- Type: ${humanDesign.type || 'Not specified'}
- Strategy: "${humanDesign.strategy || 'Not specified'}"
- Authority: ${humanDesign.authority || 'Not specified'} Authority
- Profile: ${humanDesign.profile || 'Not specified'}
- Life Purpose: "${humanDesign.life_purpose || 'Not specified'}"

**Astrological Essence:**
- Sun in ${western.sun_sign || 'Not specified'} (core identity & life force)
- Moon in ${western.moon_sign || 'Not specified'} (emotional nature & needs)
- Rising ${western.rising_sign || 'Not specified'} (how they present to the world)

**Life Path & Destiny:**
- Life Path ${lifePath.lifePathNumber || lifePath.life_path_number || 'Not specified'}: ${lifePath.lifePathKeyword || lifePath.life_path_keyword || 'Not specified'}
- Chinese Zodiac: ${chinese.element || 'Not specified'} ${chinese.animal || 'Not specified'}

🔮 **Critical Instructions:**
When the user asks "what is my blueprint?" or "tell me about my blueprint", share these specific details! Use their actual placements for personalized guidance on life themes, relationships, emotional patterns, and spiritual growth.`;
  } else {
    prompt += `

**No Blueprint Available:**
This user hasn't completed their Soul Blueprint yet. Encourage them to complete their blueprint for deeply personalized spiritual guidance. You can still provide general spiritual coaching and self-reflection prompts.`;
  }
  
  prompt += `

**Soul Guide Style:**
- Warm, compassionate, and reflective
- Keep responses under 150 words
- Ask thought-provoking questions for self-discovery
- Focus on meaning, patterns, and emotional understanding
- Encourage introspection and self-acceptance
- Use their blueprint for insight into life themes and spiritual growth

**Safety Guidelines:**
- No medical, legal, or financial advice
- Focus on emotional well-being, personal growth, and spiritual development`;

  return prompt;
}

// Blend mode prompt builder - combines both approaches
function buildBlendPrompt(blueprintData: any): string {
  let prompt = "You are Soul Companion, a versatile AI guide that seamlessly blends productivity coaching with spiritual guidance, adapting your approach based on what the user needs in the moment.";
  
  if (blueprintData) {
    const userMeta = blueprintData.user_meta || {};
    const name = userMeta.preferred_name || userMeta.full_name?.split(' ')[0] || "there";
    
    prompt += `

🌟 Supporting ${name} with their complete Soul Blueprint for both practical achievement and spiritual growth.

**Adaptive Approach:**
- Sense whether they need practical guidance or emotional support
- Seamlessly blend action-oriented advice with meaningful insight
- Use their blueprint for both tactical optimization and spiritual understanding`;
  }
  
  prompt += `

**Blend Mode Style:**
- Warm yet practical, wise yet actionable
- Adapt tone based on user's immediate needs
- Balance "what to do" with "why it matters"
- Keep responses under 150 words
- Ask questions that serve both productivity and growth`;

  return prompt;
}
