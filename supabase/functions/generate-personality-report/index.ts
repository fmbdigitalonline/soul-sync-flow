
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

    const { blueprint, userId } = await req.json();
    
    if (!blueprint || !userId) {
      throw new Error('Blueprint and userId are required');
    }

    console.log('🎭 Generating comprehensive personality report for user:', userId);

    // Extract key blueprint data for the AI prompt
    const mbti = blueprint.cognition_mbti || {};
    const humanDesign = blueprint.energy_strategy_human_design || {};
    const astrology = blueprint.archetype_western || {};
    const numerology = blueprint.values_life_path || {};
    const bashar = blueprint.bashar_suite || {};
    const userMeta = blueprint.user_meta || {};

    const systemPrompt = `You are an expert personality analyst who creates comprehensive, personalized readings by synthesizing multiple psychological and spiritual systems. Create a detailed personality report that feels personal, insightful, and actionable.

USER PROFILE:
Name: ${userMeta.preferred_name || userMeta.full_name || 'User'}
Birth Date: ${userMeta.birth_date || 'Unknown'}

BLUEPRINT DATA:
- MBTI: ${mbti.type || 'Unknown'} (${mbti.dominant_function || ''} → ${mbti.auxiliary_function || ''})
- Human Design: ${humanDesign.type || 'Unknown'} ${humanDesign.profile || ''}, Authority: ${humanDesign.authority || 'Unknown'}
- Astrology: Sun ${astrology.sun_sign || 'Unknown'}, Moon ${astrology.moon_sign || 'Unknown'}, Rising ${astrology.rising_sign || 'Unknown'}
- Life Path: ${numerology.lifePathNumber || 'Unknown'} (${numerology.lifePathKeyword || ''})
- Bashar Excitement: ${bashar.excitement_compass?.principle || 'Follow your highest excitement'}

Create 5 detailed sections (each 200-300 words) plus a shorter integrated summary:
1. Core Personality Pattern - How all these systems paint a picture of who they are
2. Decision Making Style - How they process information and make choices
3. Relationship Style - How they connect with others
4. Life Path & Purpose - Their spiritual direction and calling
5. Current Energy & Timing - Present moment guidance
6. Integrated Summary - A cohesive overview (100-150 words)

Write in second person ("You are..."), be specific about how the systems interact, and make it feel like a personalized reading from an expert who deeply understands them.`;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Generate a comprehensive personality reading for ${userMeta.preferred_name || 'this person'} based on their complete blueprint data. Make it feel personal and insightful.` 
          }
        ],
        temperature: 0.7,
        max_tokens: 2500,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const generatedContent = openAIData.choices[0].message.content;

    // Parse the AI response into sections (simplified parsing)
    const sections = generatedContent.split(/\d+\.\s*/).slice(1);
    
    const reportContent = {
      core_personality_pattern: sections[0]?.replace(/^[^:]*:?\s*/, '').trim() || 'Content unavailable',
      decision_making_style: sections[1]?.replace(/^[^:]*:?\s*/, '').trim() || 'Content unavailable',
      relationship_style: sections[2]?.replace(/^[^:]*:?\s*/, '').trim() || 'Content unavailable',
      life_path_purpose: sections[3]?.replace(/^[^:]*:?\s*/, '').trim() || 'Content unavailable',
      current_energy_timing: sections[4]?.replace(/^[^:]*:?\s*/, '').trim() || 'Content unavailable',
      integrated_summary: sections[5]?.replace(/^[^:]*:?\s*/, '').trim() || generatedContent.slice(-500) // Fallback to last part
    };

    // Store the report in the database
    const { data: reportData, error: insertError } = await supabaseClient
      .from('personality_reports')
      .insert({
        user_id: userId,
        blueprint_id: blueprint.id || 'unknown',
        report_content: reportContent,
        blueprint_version: '1.0'
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Database error: ${insertError.message}`);
    }

    console.log('✅ Personality report generated and stored successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      report: reportData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating personality report:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
