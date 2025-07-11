import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { userId } = await req.json();
    
    if (!userId) {
      throw new Error('UserId is required');
    }

    console.log('🔄 Regenerating quotes for user:', userId);

    // Get the user's latest personality report and blueprint
    const { data: reportData, error: reportError } = await supabaseClient
      .from('personality_reports')
      .select('*, blueprints(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (reportError || !reportData) {
      throw new Error('No personality report found for user');
    }

    console.log('📋 Found personality report:', reportData.id);

    // Get blueprint data
    const { data: blueprintData, error: blueprintError } = await supabaseClient
      .from('blueprints')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (blueprintError || !blueprintData) {
      throw new Error('No active blueprint found for user');
    }

    console.log('🎭 Found blueprint data');

    // Extract personality data for quote generation
    const userMeta = blueprintData.user_meta || {};
    const personality = userMeta.personality || {};
    const mbti = blueprintData.cognition_mbti || {};
    const humanDesign = blueprintData.energy_strategy_human_design || {};
    const astrology = blueprintData.archetype_western || {};
    const chineseAstrology = blueprintData.archetype_chinese || {};
    const numerology = blueprintData.values_life_path || {};

    // Generate 10 personalized quotes using OpenAI
    const systemPrompt = `You are a master personality analyst creating personalized inspirational quotes. Generate exactly 10 unique, meaningful quotes that resonate with this person's specific personality blend.

USER PROFILE:
- MBTI: ${personality.likelyType || 'Unknown'}
- Human Design: ${humanDesign.type} ${humanDesign.profile} (${humanDesign.strategy}, ${humanDesign.authority})
- Chinese Astrology: ${chineseAstrology.animal} ${chineseAstrology.element}
- Life Path: ${numerology.life_path_number}
- Sun Sign: ${astrology.sun_sign}

QUOTE CATEGORIES to include (vary these):
- inspiration, growth, resilience, life_path, energy, timing, relationships, motivation, wisdom, authenticity

FORMAT REQUIRED - exactly like this:
1. "Quote text here" - Category: inspiration - Why it resonates: Brief explanation
2. "Quote text here" - Category: growth - Why it resonates: Brief explanation
[Continue for exactly 10 quotes]

REQUIREMENTS:
- Each quote must be unique and meaningful
- Vary the categories across all 10 quotes
- Make quotes specific to their personality blend
- Keep quotes inspiring but authentic to their traits
- Each quote should be 8-20 words long`;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Generate 10 personalized quotes for this ${personality.likelyType || 'unique'} ${humanDesign.type} ${chineseAstrology.animal} personality. Make them inspiring but specific to their traits.` 
          }
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const generatedContent = openAIData.choices[0].message.content;

    console.log('🎯 Generated quotes content preview:', generatedContent.substring(0, 200));

    // Parse the quotes
    const quotes = [];
    const quotePattern = /\d+\.\s*"([^"]+)"\s*-\s*Category:\s*([^-]+)\s*-\s*Why it resonates:\s*(.+?)(?=\d+\.|$)/g;
    
    let match;
    while ((match = quotePattern.exec(generatedContent)) !== null && quotes.length < 10) {
      quotes.push({
        quote_text: match[1].trim(),
        category: match[2].trim().toLowerCase(),
        personality_alignment: {
          explanation: match[3].trim(),
          mbti_connection: personality.likelyType || null,
          hd_connection: humanDesign.type || null,
          astro_connection: `${chineseAstrology.animal} ${chineseAstrology.element}` || astrology.sun_sign || null
        }
      });
    }

    console.log(`📝 Parsed ${quotes.length} quotes from generation`);

    if (quotes.length === 0) {
      throw new Error('Failed to parse any quotes from generated content');
    }

    // Delete existing quotes for this user
    const { error: deleteError } = await supabaseClient
      .from('personality_quotes')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('⚠️ Error deleting old quotes:', deleteError);
    }

    // Insert new quotes
    const quotesToInsert = quotes.map(quote => ({
      user_id: userId,
      personality_report_id: reportData.id,
      quote_text: quote.quote_text,
      category: quote.category,
      personality_alignment: quote.personality_alignment
    }));

    const { error: insertError } = await supabaseClient
      .from('personality_quotes')
      .insert(quotesToInsert);

    if (insertError) {
      throw new Error(`Database error inserting quotes: ${insertError.message}`);
    }

    console.log(`✅ Successfully regenerated ${quotesToInsert.length} personalized quotes`);

    return new Response(JSON.stringify({ 
      success: true, 
      quotesGenerated: quotesToInsert.length,
      quotes: quotesToInsert
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Error regenerating quotes:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});