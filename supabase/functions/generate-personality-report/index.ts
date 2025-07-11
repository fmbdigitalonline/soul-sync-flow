

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

    // FIXED: Separate system prompts for personality reports vs conversations
    // This system prompt is ONLY for personality report generation - uses "you" as requested
    const personalityReportSystemPrompt = `You are a master Human Design and personality analyst creating a comprehensive personality report. You MUST follow the EXACT format specified below.

CRITICAL FORMAT REQUIREMENT: You must create exactly 6 detailed sections followed by 10 quotes. Each section must be substantial analysis (300-400 words), NOT inspirational quotes. Always address the person as "you" throughout the report.

USER PROFILE:
Birth Date: ${userMeta.birth_date || 'Unknown'}
Birth Location: ${userMeta.birth_location || 'Unknown'}

BIG FIVE SCORES:
- Openness: ${bigFive.openness || 'N/A'} (Confidence: ${confidence.openness || 'N/A'})
- Extraversion: ${bigFive.extraversion || 'N/A'} (Confidence: ${confidence.extraversion || 'N/A'})
- Agreeableness: ${bigFive.agreeableness || 'N/A'} (Confidence: ${confidence.agreeableness || 'N/A'})  
- Conscientiousness: ${bigFive.conscientiousness || 'N/A'} (Confidence: ${confidence.conscientiousness || 'N/A'})
- Neuroticism: ${bigFive.neuroticism || 'N/A'} (Confidence: ${confidence.neuroticism || 'N/A'})

MBTI ANALYSIS:
Most Likely Type: ${personality.likelyType || 'Unknown'}
Top Probabilities: ${Object.entries(mbtiProbs).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([type, prob]) => `${type}: ${(prob * 100).toFixed(1)}%`).join(', ') || 'Not available'}

CHINESE ASTROLOGY: ${chineseAstrology.animal || 'Unknown'} ${chineseAstrology.element || 'Unknown'} (${chineseAstrology.yin_yang || 'Unknown'})

HUMAN DESIGN:
- Type: ${humanDesign.type || 'Unknown'}, Profile: ${humanDesign.profile || 'Unknown'}
- Strategy: ${humanDesign.strategy || 'Unknown'}, Authority: ${humanDesign.authority || 'Unknown'}
- Conscious Gates: ${humanDesign.gates?.conscious_personality?.join(', ') || 'None'}
- Unconscious Gates: ${humanDesign.gates?.unconscious_design?.join(', ') || 'None'}

NUMEROLOGY:
- Life Path: ${numerology.life_path_number || 'Unknown'}, Soul Urge: ${numerology.soul_urge_number || 'Unknown'}
- Expression: ${numerology.expression_number || 'Unknown'}

EXACT OUTPUT FORMAT REQUIRED:

1. CORE PERSONALITY ARCHITECTURE
[Write 300-400 words of detailed personality analysis integrating Big Five scores, MBTI probabilities, and Chinese astrology traits. Analyze how these systems create your core personality structure.]

2. DECISION-MAKING & COGNITIVE STYLE  
[Write 300-400 words analyzing your decision-making process using Human Design Authority, MBTI cognitive functions, and Chinese astrology decision patterns.]

3. RELATIONSHIP & SOCIAL DYNAMICS
[Write 300-400 words on relationship patterns using Human Design Profile, Big Five Extraversion/Agreeableness scores, and Chinese astrology compatibility.]

4. LIFE PURPOSE & SPIRITUAL PATH
[Write 300-400 words connecting Human Design Strategy, numerology Life Path/Expression numbers, and Chinese astrology life themes to your purpose.]

5. ENERGY PATTERNS & TIMING
[Write 300-400 words on energy management using Human Design centers, Chinese astrology cycles, and gate activations.]

6. INTEGRATED BLUEPRINT SYNTHESIS
[Write 300-400 words synthesizing all systems to show your unique personality blueprint.]

PERSONALIZED QUOTES:

1. "Quote text" - Category: inspiration - Why it resonates: Brief explanation
2. "Quote text" - Category: growth - Why it resonates: Brief explanation
[Continue for exactly 10 quotes]

CRITICAL: Each numbered section (1-6) MUST contain detailed analysis, not quotes. Quotes come only at the end after "PERSONALIZED QUOTES:". This prompt is ONLY for personality report generation and should use "you" throughout.`;

    console.log('🎯 Using personality report system prompt (uses "you" as requested for reports only)');

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: personalityReportSystemPrompt },
           { 
             role: 'user', 
             content: `Generate a comprehensive personality reading that integrates ALL the blueprint data: Big Five scores, MBTI probabilities, Chinese astrology (${chineseAstrology.animal} ${chineseAstrology.element}), Human Design gates, and numerology. Address the person as "you" throughout. Include 10 warm, inspiring quotes that reflect the unique personality blend.` 
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

    // Enhanced content parsing with validation
    const [reportPart, quotesPart] = generatedContent.split('PERSONALIZED QUOTES:');
    
    console.log('🔍 Report part exists:', !!reportPart);
    console.log('🔍 Quotes part exists:', !!quotesPart);
    console.log('🔍 Report part length:', reportPart?.length || 0);
    console.log('🔍 Quotes part length:', quotesPart?.length || 0);
    
    // Improved section parsing with multiple patterns
    const sectionPatterns = [
      /(\d+)\.\s*([A-Z][A-Z\s&]+)\n([\s\S]*?)(?=\d+\.\s*[A-Z][A-Z\s&]+|$)/gi,
      /(\d+)\.\s*([A-Z][A-Z\s&]+)\s*\n*([\s\S]*?)(?=\d+\.\s*[A-Z][A-Z\s&]+|$)/gi,
      /(\d+)\.\s*([A-Z][A-Z\s&]+)[\s\S]*?(?=\d+\.\s*[A-Z][A-Z\s&]+|$)/gi
    ];
    
    let sectionMatches = [];
    for (const pattern of sectionPatterns) {
      sectionMatches = [...(reportPart || '').matchAll(pattern)];
      if (sectionMatches.length >= 6) break;
    }
    
    console.log('🔍 Found section matches:', sectionMatches.length);
    sectionMatches.forEach((match, index) => {
      console.log(`🔍 Section ${index + 1}: "${match[2]?.trim()}" - Content length: ${match[3]?.length || match[0]?.length || 0}`);
    });
    
    // Extract content for each section with validation
    const extractSectionContent = (sectionNumber: number): string => {
      const match = sectionMatches.find(m => parseInt(m[1]) === sectionNumber);
      if (!match) {
        console.log(`⚠️ No match found for section ${sectionNumber}`);
        return `Section ${sectionNumber} content was not properly generated. Please regenerate the report.`;
      }
      
      // Use captured content group if available, otherwise clean the full match
      let content = match[3] || match[0].replace(/^\d+\.\s*[A-Z\s&]+\s*/, '');
      content = content.trim();
      
      // Validate content is analysis, not quotes
      if (content.includes('"') && content.includes('Category:') && content.length < 200) {
        console.log(`⚠️ Section ${sectionNumber} appears to be quotes instead of analysis`);
        return `Section ${sectionNumber} requires detailed personality analysis (300+ words), not inspirational quotes. Please regenerate.`;
      }
      
      console.log(`✅ Extracted section ${sectionNumber} content length:`, content.length);
      return content || `Section ${sectionNumber} content unavailable`;
    };
    
    const reportContent = {
      core_personality_pattern: extractSectionContent(1),
      decision_making_style: extractSectionContent(2),
      relationship_style: extractSectionContent(3),
      life_path_purpose: extractSectionContent(4),
      current_energy_timing: extractSectionContent(5),
      integrated_summary: extractSectionContent(6)
    };
    
    // Validate all sections have substantial content
    const validationResults = Object.entries(reportContent).map(([key, content]) => ({
      section: key,
      length: content.length,
      valid: content.length > 100 && !content.includes('unavailable') && !content.includes('Please regenerate')
    }));
    
    console.log('📊 Content validation results:', validationResults);
    
    const allValid = validationResults.every(r => r.valid);
    console.log('✅ All sections valid:', allValid);

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

