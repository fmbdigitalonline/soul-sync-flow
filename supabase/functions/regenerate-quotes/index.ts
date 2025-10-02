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

    const { userId, language = 'en' } = await req.json();
    
    if (!userId) {
      throw new Error('UserId is required');
    }

    console.log('🔄 Regenerating quotes for user:', userId, 'in language:', language);

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

    // Extract user's first name
    const userName = userMeta?.preferred_name ||
                     userMeta?.full_name?.split(' ')[0] ||
                     'Friend';

    console.log('👤 User name for quotes:', userName);

    // Blueprint-to-Human Translation Function (NO JARGON)
    const translateToHumanLanguage = (blueprint: any) => {
      const hdType = blueprint.energy_strategy_human_design?.type || '';
      const hdAuthority = blueprint.energy_strategy_human_design?.authority || '';
      const mbtiType = blueprint.cognition_mbti?.type || '';
      
      const typeTranslations: Record<string, string> = {
        'Projector': 'natural guide who sees what others miss',
        'Manifestor': 'initiator who sparks change',
        'Generator': 'powerhouse of sustained energy',
        'Manifesting Generator': 'multi-passionate creator',
        'Reflector': 'mirror who senses the truth of any space',
      };
      
      const authorityTranslations: Record<string, string> = {
        'Splenic': 'instant gut knowing',
        'Emotional': 'clarity through feeling over time',
        'Sacral': "body's yes/no wisdom",
        'Ego': 'heart-centered willpower',
        'Self-Projected': 'truth in your own voice',
        'Mental': 'clarity through discussion',
        'Lunar': 'wisdom through full moon cycles',
      };
      
      const mbtiTranslations: Record<string, string> = {
        'INFJ': 'visionary who feels deeply',
        'INTJ': 'strategic thinker with bold vision',
        'INFP': 'idealist with authentic heart',
        'INTP': 'logical explorer of ideas',
        'ENFJ': 'natural leader who inspires others',
        'ENTJ': 'decisive commander of change',
        'ENFP': 'enthusiastic innovator',
        'ENTP': 'clever debater and inventor',
        'ISFJ': 'caring protector of traditions',
        'ISTJ': 'reliable guardian of order',
        'ISFP': 'gentle artist of the moment',
        'ISTP': 'practical problem-solver',
        'ESFJ': 'warm host who brings people together',
        'ESTJ': 'organized manager of results',
        'ESFP': 'spontaneous entertainer',
        'ESTP': 'bold action-taker',
      };
      
      return {
        coreGift: typeTranslations[hdType] || 'unique way of being',
        decisionWisdom: authorityTranslations[hdAuthority] || 'inner knowing',
        thinkingStyle: mbtiTranslations[mbtiType] || 'perspective',
      };
    };

    const humanTraits = translateToHumanLanguage(blueprintData);

    // Extract deep insights from personality report
    const reportContent = reportData.report_content || {};
    const corePattern = reportContent.core_personality_pattern || '';
    const decisionStyle = reportContent.decision_making_style || '';
    const relationshipStyle = reportContent.relationship_style || '';
    const energyTiming = reportContent.current_energy_timing || '';
    const integratedSummary = reportContent.integrated_summary || '';

    // Generate 25 personalized quotes using OpenAI with deep context
    const languageInstruction = language === 'nl' ? 
      'Write ALL quotes in DUTCH (Nederlands). Use natural, flowing Dutch that feels warm and personal.' :
      'Write ALL quotes in English.';
    
    const systemPrompt = `You are a wise mentor creating 25 deeply personal, empowering quotes for ${userName}.

LANGUAGE REQUIREMENT: ${languageInstruction}

${userName}'S CORE STRENGTHS:
- ${userName} is a ${humanTraits.coreGift}
- Makes best decisions through ${humanTraits.decisionWisdom}
- Natural ${humanTraits.thinkingStyle}

KEY INSIGHTS FROM THEIR JOURNEY:
${integratedSummary}

CONCRETE PATTERNS TO HONOR:
- ${corePattern}
- ${decisionStyle}
- ${relationshipStyle}
- ${energyTiming}

CRITICAL RULES:
1. Use ${userName}'s name in 40% of quotes naturally
2. NEVER use jargon: No "Projector", "INFJ", "Splenic Authority", "Life Path", "Generator", "Manifestor", etc.
3. Write in everyday empowering language a best friend would use
4. Each quote must be concrete, actionable, and deeply personal
5. 10-25 words per quote
6. Make ${userName} feel SEEN and EMPOWERED

EXAMPLES OF GOOD QUOTES:
- "${userName}, your ability to sense what's off in a room? That's not anxiety—that's wisdom. Trust it."
- "You don't need to force momentum. Your energy works in bursts of brilliance. Honor the rhythm."
- "When everyone else is rushing, you pause. That's not hesitation—that's your superpower of timing."

SPECIALIZED QUOTE CATEGORIES (blend these naturally):
- visionary_grounding, intuitive_wisdom, energy_mastery, decision_trust, creative_expression, meaningful_connections, practical_magic, harmonious_flow, growth_grace, authentic_leadership

FORMAT REQUIRED:
1. "Quote text here" - Category: visionary_grounding - Why: Personal connection to their traits
2. "Quote text here" - Category: intuitive_wisdom - Why: Personal connection to their traits
[Continue for exactly 25 quotes]`;

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
            content: `Generate 25 personalized quotes for ${userName}. Make them deeply personal, empowering, and speak directly to who ${userName} is. Use their name naturally in 40% of quotes.` 
          }
        ],
        temperature: 0.8,
        max_tokens: 4000,
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
    const quotePattern = /\d+\.\s*"([^"]+)"\s*-\s*Category:\s*([^-]+)\s*-\s*Why:\s*(.+?)(?=\d+\.|$)/gs;
    
    let match;
    while ((match = quotePattern.exec(generatedContent)) !== null && quotes.length < 25) {
      quotes.push({
        quote_text: match[1].trim(),
        category: match[2].trim().toLowerCase(),
        personality_alignment: {
          user_name: userName,
          explanation: match[3].trim(),
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