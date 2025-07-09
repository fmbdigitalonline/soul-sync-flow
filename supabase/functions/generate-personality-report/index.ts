
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
      console.error('❌ Missing required parameters:', { hasBlueprint: !!blueprint, hasUserId: !!userId });
      throw new Error('Blueprint and userId are required');
    }

    console.log('🎭 Generating comprehensive personality report and quotes for user:', userId);
    console.log('📋 Received blueprint structure:', {
      hasId: !!blueprint.id,
      blueprintId: blueprint.id,
      hasUserMeta: !!blueprint.user_meta,
      hasCognitionMbti: !!blueprint.cognition_mbti,
      hasEnergyStrategy: !!blueprint.energy_strategy_human_design,
      hasArchetypeWestern: !!blueprint.archetype_western,
      hasValuesLifePath: !!blueprint.values_life_path,
      hasArchetypeChinese: !!blueprint.archetype_chinese,
      hasBasharSuite: !!blueprint.bashar_suite
    });

    // Extract comprehensive blueprint data for detailed analysis
    const userMeta = blueprint.user_meta || {};
    const personality = userMeta.personality || {};
    const bigFive = personality.bigFive || {};
    const confidence = personality.confidence || {};
    const mbtiProbs = personality.mbtiProbabilities || {};
    
    const mbti = blueprint.cognition_mbti || blueprint.mbti || {};
    const humanDesign = blueprint.energy_strategy_human_design || blueprint.human_design || {};
    const astrology = blueprint.archetype_western || blueprint.astrology || {};
    const numerology = blueprint.values_life_path || blueprint.numerology || {};
    const chineseAstrology = blueprint.archetype_chinese || {};
    const bashar = blueprint.bashar_suite || {};
    const goalStack = blueprint.goal_stack || {};

    console.log('🔍 Comprehensive data extraction:', {
      userName: userMeta.preferred_name || userMeta.full_name || 'User',
      bigFiveOpenness: bigFive.openness,
      likelyMBTI: personality.likelyType,
      mbtiTopProbability: Object.entries(mbtiProbs).sort((a, b) => b[1] - a[1]).slice(0, 1)[0],
      humanDesignType: humanDesign.type,
      lifePathNumber: numerology.life_path_number,
      chineseSign: chineseAstrology.animal,
      chineseElement: chineseAstrology.element,
      sunSign: astrology.sun_sign,
      blueprintId: blueprint.id,
      consciousGates: humanDesign.gates?.conscious_personality?.length || 0,
      unconsciousGates: humanDesign.gates?.unconscious_design?.length || 0
    });

    const systemPrompt = `You are a master Human Design and personality analyst with deep expertise in Chinese astrology, Big Five psychology, and numerology. Your specialty is creating comprehensive personality readings that integrate ALL available data sources.

CRITICAL INSTRUCTION: You MUST analyze and reference ALL provided data including Chinese astrology, Big Five scores, MBTI probabilities, and EVERY SINGLE GATE from both conscious and unconscious arrays.

USER PROFILE:
Name: ${userMeta.preferred_name || userMeta.full_name || 'User'}
Birth Date: ${userMeta.birth_date || 'Unknown'}
Birth Location: ${userMeta.birth_location || 'Unknown'}

==== BIG FIVE PERSONALITY SCORES ====
- Openness: ${bigFive.openness || 'N/A'} (Confidence: ${confidence.openness || 'N/A'})
- Extraversion: ${bigFive.extraversion || 'N/A'} (Confidence: ${confidence.extraversion || 'N/A'})
- Agreeableness: ${bigFive.agreeableness || 'N/A'} (Confidence: ${confidence.agreeableness || 'N/A'})  
- Conscientiousness: ${bigFive.conscientiousness || 'N/A'} (Confidence: ${confidence.conscientiousness || 'N/A'})
- Neuroticism: ${bigFive.neuroticism || 'N/A'} (Confidence: ${confidence.neuroticism || 'N/A'})

==== MBTI PROBABILITY ANALYSIS ====
Most Likely Type: ${personality.likelyType || 'Unknown'}
Top 5 Type Probabilities:
${Object.entries(mbtiProbs).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([type, prob]) => `- ${type}: ${(prob * 100).toFixed(1)}%`).join('\n') || 'Not available'}

==== CHINESE ASTROLOGY PROFILE ====
Animal: ${chineseAstrology.animal || 'Unknown'} 
Element: ${chineseAstrology.element || 'Unknown'}
Yin/Yang: ${chineseAstrology.yin_yang || 'Unknown'}
Keyword: ${chineseAstrology.keyword || 'Unknown'}

CRITICAL: You MUST integrate Chinese astrology insights throughout your analysis. The ${chineseAstrology.animal || 'Unknown'} ${chineseAstrology.element || 'Unknown'} combination provides crucial personality insights.

==== HUMAN DESIGN BLUEPRINT ====

BASIC DESIGN:
- Type: ${humanDesign.type || 'Unknown'} 
- Profile: ${humanDesign.profile || 'Unknown'}
- Strategy: ${humanDesign.strategy || 'Unknown'}
- Authority: ${humanDesign.authority || 'Unknown'}
- Definition: ${humanDesign.definition || 'Unknown'}

DEFINED ENERGY CENTERS:
${Object.entries(humanDesign.centers || {}).map(([center, data]) => {
  if (data.defined) {
    return `✓ ${center.toUpperCase()} CENTER - DEFINED
   Gates: ${data.gates?.join(', ') || 'None'}
   Channels: ${data.channels?.map(ch => `${ch[0]}-${ch[1]}`).join(', ') || 'None'}`;
  }
}).filter(Boolean).join('\n\n') || 'None specified'}

UNDEFINED/OPEN CENTERS:
${Object.entries(humanDesign.centers || {}).map(([center, data]) => {
  if (!data.defined) {
    return `○ ${center.toUpperCase()} CENTER - OPEN/UNDEFINED
   Hanging Gates: ${data.gates?.join(', ') || 'None'}`;
  }
}).filter(Boolean).join('\n\n') || 'None specified'}

==== CRITICAL: ANALYZE ALL GATES ====

CONSCIOUS PERSONALITY GATES (${humanDesign.gates?.conscious_personality?.length || 0} gates - analyze EVERY ONE):
${humanDesign.gates?.conscious_personality?.map(gate => {
  const gateNum = gate.split('.')[0];
  return `🔸 GATE ${gate}: Gate ${gateNum} activation in conscious personality`;
}).join('\n') || 'Not specified'}

UNCONSCIOUS DESIGN GATES (${humanDesign.gates?.unconscious_design?.length || 0} gates - analyze EVERY ONE):
${humanDesign.gates?.unconscious_design?.map(gate => {
  const gateNum = gate.split('.')[0];
  return `🔹 GATE ${gate}: Gate ${gateNum} activation in unconscious design`;
}).join('\n') || 'Not specified'}

==== NUMEROLOGY COMPLETE PROFILE ====
- Life Path: ${numerology.life_path_number || 'Unknown'} (${numerology.life_path_keyword || ''})
- Soul Urge: ${numerology.soul_urge_number || 'Unknown'} (${numerology.soul_urge_keyword || ''})
- Expression: ${numerology.expression_number || 'Unknown'} (${numerology.expression_keyword || ''})
- Personality: ${numerology.personality_number || 'Unknown'} (${numerology.personality_keyword || ''})
- Birthday: ${numerology.birthday_number || 'Unknown'} (${numerology.birthday_keyword || ''})

==== WESTERN ASTROLOGY ====
- Sun: ${astrology.sun_sign || 'Unknown'} - Core identity and ego expression
- Moon: ${astrology.moon_sign || 'Unknown'} - Emotional nature and inner self
- Rising: ${astrology.rising_sign || 'Unknown'} - Public persona and first impressions

==== REQUIRED REPORT STRUCTURE ====

Create exactly these 6 sections with comprehensive integration of ALL data sources:

1. CORE PERSONALITY ARCHITECTURE (400+ words)
Integrate Big Five scores, MBTI probabilities, Chinese astrology animal/element, Human Design type, and specific gate activations. Reference actual scores and probabilities.

2. DECISION-MAKING & COGNITIVE STYLE (350+ words)  
Focus on Authority (${humanDesign.authority || 'Unknown'}), MBTI cognitive functions from probability analysis, and Chinese astrology decision-making traits.

3. RELATIONSHIP & SOCIAL DYNAMICS (350+ words)
Analyze Profile (${humanDesign.profile || 'Unknown'}), Extraversion score, Chinese astrology compatibility patterns, and specific gate influences on relationships.

4. LIFE PURPOSE & SPIRITUAL PATH (400+ words)
Connect Human Design strategy, numerology Life Path/Soul Urge/Expression numbers, Chinese astrology life themes, and gate activations to purpose.

5. ENERGY PATTERNS & TIMING (300+ words)
Analyze defined vs undefined centers, Chinese astrology energy cycles, and how gates create energy patterns.

6. INTEGRATED BLUEPRINT SYNTHESIS (300+ words)
Weave together ALL systems showing how Big Five + MBTI + Chinese astrology + Human Design + Numerology create a unique personality.

THEN create EXACTLY 10 warm, inspiring, personalized quotes that reflect their unique combination of traits.

Format quotes as:
1. "Quote text here" - Category: inspiration - Why it resonates: Brief explanation of how it connects to their personality blend
2. "Quote text here" - Category: growth - Why it resonates: Brief explanation
[continue for all 10 quotes]

CRITICAL REQUIREMENTS:
- Use actual Big Five scores (Openness: ${bigFive.openness}, etc.)
- Reference Chinese astrology extensively (${chineseAstrology.animal} ${chineseAstrology.element})
- Include MBTI probability insights, not just "Unknown"
- Analyze gates from both conscious and unconscious arrays
- Generate EXACTLY 10 quotes
- Write in second person with specific data integration throughout`;

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
            content: `Generate a comprehensive personality reading for ${userMeta.preferred_name || 'this person'} that integrates ALL their blueprint data: Big Five scores, MBTI probabilities, Chinese astrology (${chineseAstrology.animal} ${chineseAstrology.element}), Human Design gates, and numerology. Include 10 warm, inspiring quotes that reflect their unique personality blend.` 
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!openAIResponse.ok) {
      console.error('❌ OpenAI API error:', openAIResponse.status, openAIResponse.statusText);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const generatedContent = openAIData.choices[0].message.content;

    console.log('🔍 Generated content length:', generatedContent.length);
    console.log('🔍 Content preview:', generatedContent.substring(0, 300));

    // Split content into report sections and quotes
    const [reportPart, quotesPart] = generatedContent.split('PERSONALIZED QUOTES:');
    
    console.log('🔍 Report part length:', reportPart?.length || 0);
    console.log('🔍 Quotes part length:', quotesPart?.length || 0);
    
    // Parse the report sections - improved logic
    const sectionPattern = /(\d+)\.\s*([A-Z\s&]+)[\s\S]*?(?=\d+\.\s*[A-Z\s&]+|$)/gi;
    const sectionMatches = [...reportPart.matchAll(sectionPattern)];
    
    console.log('🔍 Found section matches:', sectionMatches.length);
    sectionMatches.forEach((match, index) => {
      console.log(`🔍 Section ${index + 1}:`, match[2]?.trim(), 'Content length:', match[0]?.length);
    });
    
    // Extract content for each section with better parsing
    const extractSectionContent = (sectionNumber: number): string => {
      const match = sectionMatches.find(m => parseInt(m[1]) === sectionNumber);
      if (!match) {
        console.log(`⚠️ No match found for section ${sectionNumber}`);
        return 'Content unavailable';
      }
      
      // Remove the section number and title from the beginning
      const content = match[0].replace(/^\d+\.\s*[A-Z\s&]+\s*/, '').trim();
      console.log(`✅ Extracted section ${sectionNumber} content length:`, content.length);
      return content || 'Content unavailable';
    };
    
    const reportContent = {
      core_personality_pattern: extractSectionContent(1),
      decision_making_style: extractSectionContent(2),
      relationship_style: extractSectionContent(3),
      life_path_purpose: extractSectionContent(4),
      current_energy_timing: extractSectionContent(5),
      integrated_summary: extractSectionContent(6)
    };
    
    console.log('📊 Final report content summary:', {
      core_personality_pattern: reportContent.core_personality_pattern.length,
      decision_making_style: reportContent.decision_making_style.length,
      relationship_style: reportContent.relationship_style.length,
      life_path_purpose: reportContent.life_path_purpose.length,
      current_energy_timing: reportContent.current_energy_timing.length,
      integrated_summary: reportContent.integrated_summary.length
    });

    // Parse quotes with improved pattern matching
    const quotes = [];
    if (quotesPart) {
      console.log('🔍 Processing quotes part...');
      
      // Try multiple quote parsing patterns
      const quotePatterns = [
        /"([^"]+)"\s*-\s*Category:\s*([^-]+)\s*-\s*Why it resonates:\s*(.+?)(?=\d+\.|$)/g,
        /\d+\.\s*"([^"]+)"\s*-\s*Category:\s*([^-]+)\s*-\s*Why it resonates:\s*(.+?)(?=\d+\.|$)/g,
        /"([^"]+)"\s*-\s*Category:\s*([^-]+)\s*-\s*(.+?)(?=\d+\.|$)/g
      ];
      
      for (const pattern of quotePatterns) {
        const matches = [...quotesPart.matchAll(pattern)];
        if (matches.length > 0) {
          console.log(`✅ Found ${matches.length} quotes with pattern`);
          for (const match of matches) {
            quotes.push({
              quote_text: match[1].trim(),
              category: (match[2] || 'inspiration').trim().toLowerCase(),
              personality_alignment: {
                explanation: (match[3] || match[2] || 'Resonates with your unique personality blend').trim(),
                mbti_connection: personality.likelyType || null,
                hd_connection: humanDesign.type || null,
                astro_connection: `${chineseAstrology.animal} ${chineseAstrology.element}` || astrology.sun_sign || null
              }
            });
          }
          break; // Use the first pattern that works
        }
      }
      
      // If no quotes found with patterns, try simple line-by-line parsing
      if (quotes.length === 0) {
        console.log('⚠️ Pattern matching failed, trying line-by-line parsing');
        const lines = quotesPart.split('\n').filter(line => line.trim().includes('"'));
        for (const line of lines.slice(0, 10)) { // Limit to 10 quotes
          const quoteMatch = line.match(/"([^"]+)"/);
          if (quoteMatch) {
            quotes.push({
              quote_text: quoteMatch[1].trim(),
              category: 'inspiration',
              personality_alignment: {
                explanation: 'Personalized for your unique blueprint combination',
                mbti_connection: personality.likelyType || null,
                hd_connection: humanDesign.type || null,
                astro_connection: `${chineseAstrology.animal} ${chineseAstrology.element}` || astrology.sun_sign || null
              }
            });
          }
        }
      }
    }

    console.log(`📝 Parsed ${quotes.length} quotes`);
    quotes.forEach((quote, index) => {
      console.log(`Quote ${index + 1}:`, quote.quote_text.substring(0, 50) + '...');
    });

    // Generate a valid UUID for blueprint_id if missing
    const blueprintId = blueprint.id || crypto.randomUUID();
    
    console.log('💾 Storing report with blueprint_id:', blueprintId);

    // Store the report in the database
    const { data: reportData, error: insertError } = await supabaseClient
      .from('personality_reports')
      .insert({
        user_id: userId,
        blueprint_id: blueprintId,
        report_content: reportContent,
        blueprint_version: '1.0'
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Database error inserting report:', insertError);
      throw new Error(`Database error: ${insertError.message}`);
    }

    console.log('✅ Report stored successfully:', reportData.id);

    // Store the quotes in the database
    const quotesToInsert = quotes.map(quote => ({
      user_id: userId,
      personality_report_id: reportData.id,
      quote_text: quote.quote_text,
      category: quote.category,
      personality_alignment: quote.personality_alignment
    }));

    if (quotesToInsert.length > 0) {
      const { error: quotesError } = await supabaseClient
        .from('personality_quotes')
        .insert(quotesToInsert);

      if (quotesError) {
        console.error('❌ Error storing quotes:', quotesError);
        // Don't fail the whole operation if quotes fail
      } else {
        console.log(`✅ ${quotesToInsert.length} personalized quotes stored successfully`);
      }
    }

    console.log('✅ Personality report and quotes generated successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      report: reportData,
      quotes: quotesToInsert
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Error generating personality report:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
