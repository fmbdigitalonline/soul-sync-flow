
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
      humanDesignType: humanDesign.type,
      lifePathNumber: numerology.life_path_number,
      chineseSign: chineseAstrology.animal,
      sunSign: astrology.sun_sign,
      blueprintId: blueprint.id
    });

    const systemPrompt = `You are a master personality analyst who creates deeply personalized, comprehensive readings by synthesizing multiple psychological and spiritual systems. You have access to extraordinarily detailed blueprint data. Create a rich, insightful personality report that demonstrates deep understanding of this person's unique psychological makeup.

USER PROFILE:
Name: ${userMeta.preferred_name || userMeta.full_name || 'User'}
Birth Date: ${userMeta.birth_date || 'Unknown'}
Birth Location: ${userMeta.birth_location || 'Unknown'}

COMPREHENSIVE PERSONALITY DATA:
Big Five Scores (0-1 scale):
- Openness: ${bigFive.openness || 'N/A'} (Confidence: ${confidence.openness || 'N/A'})
- Extraversion: ${bigFive.extraversion || 'N/A'} (Confidence: ${confidence.extraversion || 'N/A'})
- Agreeableness: ${bigFive.agreeableness || 'N/A'} (Confidence: ${confidence.agreeableness || 'N/A'})
- Conscientiousness: ${bigFive.conscientiousness || 'N/A'} (Confidence: ${confidence.conscientiousness || 'N/A'})
- Neuroticism: ${bigFive.neuroticism || 'N/A'} (Confidence: ${confidence.neuroticism || 'N/A'})

MBTI Analysis:
- Most Likely Type: ${personality.likelyType || 'Unknown'} 
- User Confidence: ${personality.userConfidence || 'N/A'}
- Top Probabilities: ${Object.entries(mbtiProbs).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([type, prob]) => `${type} (${(prob * 100).toFixed(1)}%)`).join(', ') || 'N/A'}

DETAILED HUMAN DESIGN ANALYSIS:
- Type: ${humanDesign.type || 'Unknown'}
- Profile: ${humanDesign.profile || 'Unknown'}
- Strategy: ${humanDesign.strategy || 'Unknown'}
- Authority: ${humanDesign.authority || 'Unknown'}
- Definition: ${humanDesign.definition || 'Unknown'}
- Not-Self Theme: ${humanDesign.not_self_theme || 'Unknown'}

DEFINED CENTERS & THEIR PSYCHOLOGICAL IMPACT:
${Object.entries(humanDesign.centers || {}).map(([center, data]) => {
  if (data.defined) {
    return `- ${center} Center: DEFINED (Gates: ${data.gates.join(', ')}) - ${center === 'Spleen' ? 'Instinctual awareness, health consciousness, survival wisdom' : 
           center === 'Throat' ? 'Communication, manifestation, expression of ideas' :
           center === 'G' ? 'Identity, direction, love, leadership' :
           center === 'Heart' ? 'Willpower, ego, material world, promises' :
           center === 'Solar Plexus' ? 'Emotions, emotional intelligence, clarity over time' :
           center === 'Sacral' ? 'Life force energy, creativity, sexuality, response' :
           center === 'Root' ? 'Pressure, adrenaline, stress energy for action' :
           center === 'Ajna' ? 'Mental processing, conceptualization, opinions' :
           center === 'Head' ? 'Mental pressure, inspiration, confusion, questions' : 'Energy center'}`;
  } else {
    return `- ${center} Center: UNDEFINED (Gates: ${data.gates.join(', ')}) - Open to conditioning, wisdom through others`;
  }
}).join('\n')}

ACTIVE CHANNELS & THEIR MEANINGS:
${Object.entries(humanDesign.centers || {}).filter(([_, data]) => data.defined && data.channels?.length > 0).map(([center, data]) => 
  data.channels.map(channel => {
    const [gate1, gate2] = channel;
    const channelMeanings = {
      '16-48': 'Channel of Wavelength - The Talent: Natural talent and skills, mastery through repetition',
      '33-13': 'Channel of the Prodigal - The Fellowship: Sharing universal truths and experiences with others'
    };
    return `- Channel ${gate1}-${gate2}: ${channelMeanings[`${gate1}-${gate2}`] || channelMeanings[`${gate2}-${gate1}`] || 'Unique energy connection'}`;
  }).join('\n')
).join('\n')}

CONSCIOUS PERSONALITY GATES (How you see yourself):
${humanDesign.gates?.conscious_personality?.map(gate => {
  const gateNum = gate.split('.')[0];
  const gateMeanings = {
    '11': 'Peace - Ideas and concepts, bringing new perspectives',
    '12': 'Standstill - Caution, careful consideration before action', 
    '55': 'Abundance - Emotional abundance, spirit, emotional depth',
    '34': 'Power - Great power and strength, but only when correctly timed',
    '58': 'Joy - Vitality, joy of life, improvement and correction',
    '16': 'Skills - Enthusiasm, natural talent, identification of talent',
    '27': 'Nourishment - Caring, responsibility, nourishment of self and others',
    '64': 'Before Completion - Mental pressure to complete, confusion before clarity',
    '48': 'The Well - Depth, wisdom, talent expressed through consistent effort',
    '29': 'The Abysmal - Saying yes, commitment, perseverance through challenges',
    '33': 'Retreat - Privacy, withdrawal to process and reflect',
    '19': 'Approach - Wanting to be needed, sensitivity to others needs'
  };
  return `- Gate ${gateNum}: ${gateMeanings[gateNum] || 'Unique energy activation'}`;
}).join('\n') || 'Not specified'}

UNCONSCIOUS DESIGN GATES (Your body's wisdom):
${humanDesign.gates?.unconscious_design?.map(gate => {
  const gateNum = gate.split('.')[0];
  const gateMeanings = {
    '6': 'Conflict - Friction leading to intimacy, emotional connections',
    '36': 'Darkening of Light - Crisis and emotional intensity for growth',
    '34': 'Power - Great power and strength, but only when correctly timed',
    '7': 'Role of Self - Leadership through example, direction for others',
    '42': 'Increase - Completion, finishing what is started',
    '45': 'Gathering Together - Material success, bringing people together',
    '40': 'Deliverance - Aloneness, rest, restoration of energy',
    '48': 'The Well - Depth, wisdom, talent expressed through consistent effort',
    '29': 'The Abysmal - Saying yes, commitment, perseverance',
    '13': 'Fellowship - Listening, sharing stories and experiences'
  };
  return `- Gate ${gateNum}: ${gateMeanings[gateNum] || 'Unique unconscious energy'}`;
}).join('\n') || 'Not specified'}

PROFILE ANALYSIS (${humanDesign.profile || 'Unknown'}):
${humanDesign.profile?.includes('4/4') ? `4/4 OPPORTUNIST/OPPORTUNIST PROFILE:
- Line 4 Personality: Networking, friendship-based connections, influencing through relationships
- Line 4 Design: External opportunities come through your network and social connections  
- You are here to influence others through your network and personal connections
- Success comes through building genuine friendships and being invited to share your gifts
- You have natural networking abilities and people are drawn to your authentic friendships
- Your authority and wisdom are recognized through your social connections and community` : 
humanDesign.profile?.includes('3/5') ? '3/5 MARTYR/HERETIC PROFILE: Trial and error learning, practical wisdom, universalizing experiences' :
humanDesign.profile?.includes('1/3') ? '1/3 INVESTIGATOR/MARTYR PROFILE: Research and experimentation, building solid foundations through trial and error' :
humanDesign.profile?.includes('2/4') ? '2/4 HERMIT/OPPORTUNIST PROFILE: Natural talent activated through relationships and networking' :
humanDesign.profile?.includes('5/1') ? '5/1 HERETIC/INVESTIGATOR PROFILE: Practical solutions and deep research, teaching and leading others' :
humanDesign.profile?.includes('6/2') ? '6/2 ROLE MODEL/HERMIT PROFILE: Natural talent that becomes an example for others' :
'Unique profile combination with specific life themes and social dynamics'}

ASTROLOGY PROFILE:
- Sun Sign: ${astrology.sun_sign || 'Unknown'} (${astrology.sun_keyword || ''})
- Moon Sign: ${astrology.moon_sign || 'Unknown'} (${astrology.moon_keyword || ''})
- Rising Sign: ${astrology.rising_sign || 'Calculating...'}

NUMEROLOGY INSIGHTS:
- Life Path: ${numerology.life_path_number || 'Unknown'} (${numerology.life_path_keyword || ''})
- Soul Urge: ${numerology.soul_urge_number || 'Unknown'} (${numerology.soul_urge_keyword || ''})
- Expression: ${numerology.expression_number || 'Unknown'} (${numerology.expression_keyword || ''})
- Personality Number: ${numerology.personality_number || 'Unknown'} (${numerology.personality_keyword || ''})

CHINESE ASTROLOGY:
- Animal: ${chineseAstrology.animal || 'Unknown'}
- Element: ${chineseAstrology.element || 'Unknown'}
- Yin/Yang: ${chineseAstrology.yin_yang || 'Unknown'}
- Keyword: ${chineseAstrology.keyword || 'Unknown'}

GOAL ORIENTATION:
- Primary Goal: ${goalStack.primary_goal || 'Unknown'}
- Time Horizon: ${goalStack.time_horizon || 'Unknown'}
- Support Style: ${goalStack.support_style || 'Unknown'}

CONSCIOUSNESS PRINCIPLES:
- Excitement Compass: ${bashar.excitement_compass?.principle || 'Follow your highest excitement'}
- Belief Interface: ${bashar.belief_interface?.principle || 'Beliefs create reality'}
- Frequency Alignment: ${bashar.frequency_alignment?.quick_ritual || 'Take 3 deep breaths and feel gratitude'}

Create a comprehensive 6-section personality report (minimum 1,500 words total):

1. CORE PERSONALITY ARCHITECTURE (300+ words)
Synthesize their Big Five scores, MBTI probabilities, and core traits into a detailed personality profile. Reference specific scores and explain how they interact.

2. DECISION-MAKING & COGNITIVE STYLE (250+ words)
Analyze how their Human Design authority, MBTI cognitive functions, and personality scores influence their decision-making process.

3. RELATIONSHIP & SOCIAL DYNAMICS (250+ words)
Explore how their extraversion levels, agreeableness, Human Design type, and astrological influences shape their relationships.

4. LIFE PURPOSE & SPIRITUAL PATH (300+ words)
Connect their Life Path number, Soul Urge, Expression number, Chinese astrology, and Human Design strategy into a cohesive purpose narrative.

5. ENERGY PATTERNS & TIMING (200+ words)
Discuss their Human Design centers, Chinese astrology elements, and current astrological influences for optimal energy management.

6. INTEGRATED BLUEPRINT SYNTHESIS (200+ words)
Weave all systems together showing how they create a unique, coherent personality profile.

THEN create 10 deeply personalized quotes that reflect their specific numerical scores, astrological placements, and personality metrics:

PERSONALIZED QUOTES:
1. "[Quote text]" - Category: [category] - Why it resonates: [specific connection to their data]
2. "[Quote text]" - Category: [category] - Why it resonates: [specific connection to their data]
...continue for all 10 quotes

Write in second person, reference specific scores and placements, and demonstrate deep knowledge of how these systems interconnect for this unique individual.`;

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
            content: `Generate a comprehensive personality reading AND 10 personalized quotes for ${userMeta.preferred_name || 'this person'} based on their complete blueprint data. Make it feel personal and insightful.` 
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

    // Split content into report sections and quotes
    const [reportPart, quotesPart] = generatedContent.split('PERSONALIZED QUOTES:');
    
    console.log('🔍 Raw report part length:', reportPart.length);
    console.log('🔍 Raw report part preview:', reportPart.substring(0, 500));
    
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

    // Parse quotes
    const quotes = [];
    if (quotesPart) {
      const quoteLines = quotesPart.split(/\d+\.\s*/).slice(1);
      for (const line of quoteLines) {
        const quoteMatch = line.match(/"([^"]+)"\s*-\s*Category:\s*([^-]+)\s*-\s*Why it resonates:\s*(.+)/);
        if (quoteMatch) {
          quotes.push({
            quote_text: quoteMatch[1].trim(),
            category: quoteMatch[2].trim().toLowerCase(),
            personality_alignment: {
              explanation: quoteMatch[3].trim(),
              mbti_connection: mbti.type || null,
              hd_connection: humanDesign.type || null,
              astro_connection: astrology.sun_sign || null
            }
          });
        }
      }
    }

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
