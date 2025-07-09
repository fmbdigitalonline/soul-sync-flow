
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

    const systemPrompt = `You are a master Human Design and personality analyst. Your specialty is creating deeply detailed, gate-by-gate Human Design analysis integrated with psychological profiling. You MUST focus extensively on the specific gates, channels, and centers in this person's chart.

CRITICAL INSTRUCTION: You must analyze EVERY SINGLE GATE mentioned in the conscious and unconscious lists. Each gate represents a specific psychological pattern that shapes this person's personality.

USER PROFILE:
Name: ${userMeta.preferred_name || userMeta.full_name || 'User'}
Birth Date: ${userMeta.birth_date || 'Unknown'}
Birth Location: ${userMeta.birth_location || 'Unknown'}

==== HUMAN DESIGN BLUEPRINT (PRIMARY FOCUS) ====

BASIC DESIGN:
- Type: ${humanDesign.type || 'Unknown'} 
- Profile: ${humanDesign.profile || 'Unknown'}
- Strategy: ${humanDesign.strategy || 'Unknown'}
- Authority: ${humanDesign.authority || 'Unknown'}
- Definition: ${humanDesign.definition || 'Unknown'}

DEFINED ENERGY CENTERS (Your consistent, reliable traits):
${Object.entries(humanDesign.centers || {}).map(([center, data]) => {
  if (data.defined) {
    return `✓ ${center.toUpperCase()} CENTER - DEFINED
   Gates: ${data.gates.join(', ')}
   Psychology: ${center === 'Spleen' ? 'Instinctual awareness, spontaneous knowing, health wisdom' : 
           center === 'Throat' ? 'Communication hub, manifestation, expression of identity' :
           center === 'G' ? 'Identity, direction, love, leadership, sense of self' :
           center === 'Heart' ? 'Willpower, ego strength, material world mastery' :
           center === 'Solar Plexus' ? 'Emotional intelligence, feeling, clarity over time' :
           center === 'Sacral' ? 'Life force energy, sexuality, creativity, response to life' :
           center === 'Root' ? 'Stress energy, pressure, adrenaline for action' :
           center === 'Ajna' ? 'Mental processing, conceptualization, fixed thinking' :
           center === 'Head' ? 'Mental pressure, inspiration, questions, confusion' : 'Core energy center'}`;
  }
}).filter(Boolean).join('\n\n')}

UNDEFINED/OPEN CENTERS (Areas of wisdom and conditioning):
${Object.entries(humanDesign.centers || {}).map(([center, data]) => {
  if (!data.defined) {
    return `○ ${center.toUpperCase()} CENTER - OPEN/UNDEFINED
   Hanging Gates: ${data.gates.join(', ')}
   Conditioning Theme: Wisdom through experiencing ${center.toLowerCase()} energy from others`;
  }
}).filter(Boolean).join('\n\n')}

ACTIVE CHANNELS (Your core life themes):
${Object.entries(humanDesign.centers || {}).filter(([_, data]) => data.defined && data.channels?.length > 0).map(([center, data]) => 
  data.channels.map(channel => {
    const [gate1, gate2] = channel;
    const channelMeanings = {
      '16-48': 'CHANNEL OF WAVELENGTH (The Talent): You have natural talent that develops through practice and repetition. This channel creates mastery through consistent effort and skill development.',
      '33-13': 'CHANNEL OF THE PRODIGAL (The Fellowship): You are here to share universal stories and experiences with others. This channel creates wisdom through lived experience and storytelling.',
      '1-8': 'CHANNEL OF INSPIRATION (The Creative): Individual creative expression and leadership',
      '14-2': 'CHANNEL OF THE BEAT (The Keeper of Keys): Direction through values and higher purpose',
      '6-59': 'CHANNEL OF MATING (Intimacy): Deep intimacy and reproductive themes',
      '34-57': 'CHANNEL OF POWER (Archetype): Pure power and intuitive insight',
      '20-34': 'CHANNEL OF CHARISMA (Busy): Sustainable energy and charismatic presence'
    };
    return `🔥 CHANNEL ${gate1}-${gate2}: ${channelMeanings[`${gate1}-${gate2}`] || channelMeanings[`${gate2}-${gate1}`] || 'Unique energetic connection creating specific life themes'}`;
  }).join('\n')
).join('\n')}

==== DETAILED GATE ANALYSIS (ANALYZE EACH ONE) ====

CONSCIOUS PERSONALITY GATES (Your self-image and conscious traits):
${humanDesign.gates?.conscious_personality?.map(gate => {
  const gateNum = gate.split('.')[0];
  const gateMeanings = {
    '1': 'Creative Expression - Individual creative power, self-expression, leadership energy',
    '2': 'Higher Knowing - Direction of the self, higher guidance, knowing your path',
    '3': 'Ordering - Innovation through difficulty, new beginnings through struggle',
    '4': 'Mental Solutions - Mental formulas, answers to problems, youthful thinking',
    '5': 'Fixed Rhythms - Natural timing, consistency, waiting for right timing',
    '6': 'Conflict/Friction - Emotional intimacy through friction, peace through conflict resolution',
    '7': 'Role of Self - Leadership through example, direction for collective',
    '8': 'Contribution - Individual contribution to collective, creative expression',
    '9': 'Focus - Power of concentration, ability to focus energy and attention',
    '10': 'Love of Self - Self-love, authentic behavior, being yourself',
    '11': 'Peace/Ideas - Peace through new ideas, conceptual thinking, bringing new perspectives',
    '12': 'Standstill/Caution - Careful consideration, social caution, waiting for clarity',
    '13': 'Fellowship/Listener - Deep listening, sharing universal stories and experiences',
    '14': 'Power Skills - Material success through skills, power through competence',
    '15': 'Extremes - Love of humanity, extremes in behavior, finding middle ground',
    '16': 'Skills/Enthusiasm - Natural talent identification, enthusiasm for mastery',
    '17': 'Opinions - Mental opinions, following and leadership through ideas',
    '18': 'Correction - Pattern recognition, correcting what needs improvement',
    '19': 'Approach/Wanting - Sensitivity to needs, wanting to be needed by others',
    '20': 'Now/Contemplation - Living in the present moment, contemplative awareness',
    '21': 'Control/Hunter - Control through bite, taking charge when necessary',
    '22': 'Grace/Openness - Grace under pressure, openness to experience',
    '23': 'Splitting Apart/Assimilation - Knowing when to speak, splitting apart to rebuild',
    '24': 'Return - Rationalization, returning to natural cycles and patterns',
    '25': 'Innocence - Love of spirit, innocence and higher love',
    '26': 'Taming Power/Egoist - Taming great power, strategic thinking and planning',
    '27': 'Nourishment/Caring - Caring for self and others, nourishment and responsibility',
    '28': 'Game Player - Playing the game of life, taking risks for purpose',
    '29': 'Abyssal/Perseverance - Saying yes to life, commitment and perseverance',
    '30': 'Clinging Fire/Feelings - Intense feelings and emotions, clinging to what matters',
    '31': 'Influence/Leading - Democratic leadership, influence through example',
    '32': 'Duration/Continuity - Endurance and continuity, conservative wisdom',
    '33': 'Retreat/Privacy - Privacy and withdrawal, processing through solitude',
    '34': 'Power/Great Power - Great individual power, but only when correctly timed',
    '35': 'Progress/Change - Progress through experience, embracing change',
    '36': 'Darkening Light/Crisis - Growth through crisis, emotional intensity',
    '37': 'Family/Friendship - Family and tribal connections, friendship bonds',
    '38': 'Opposition/Fighter - Fighting for what matters, opposition to injustice',
    '39': 'Obstruction/Provocation - Provoking growth, challenging status quo',
    '40': 'Deliverance/Aloneness - Restoration through solitude, aloneness as strength',
    '41': 'Decrease/Contraction - Starting new cycles, contraction before expansion',
    '42': 'Increase/Growth - Completion and finishing, growth through completion',
    '43': 'Breakthrough/Insight - Mental breakthrough, individual insights',
    '44': 'Coming to Meet/Pattern - Recognizing patterns, meeting the right people',
    '45': 'Gathering Together/King - Material success, gathering resources and people',
    '46': 'Pushing Upward/Determination - Love of body, determination to succeed',
    '47': 'Oppression/Realization - Mental pressure leading to realization',
    '48': 'The Well/Depth - Depth of talent, wisdom through consistent effort',
    '49': 'Revolution/Principles - Revolutionary principles, changing what no longer serves',
    '50': 'Cauldron/Values - Higher values, responsibility for collective wellbeing',
    '51': 'Arousing/Shock - Shock that initiates, competitive spirit',
    '52': 'Keeping Still/Stillness - Stillness and concentration, mountain-like stability',
    '53': 'Development/Beginnings - Gradual development, starting new cycles',
    '54': 'Marrying Maiden/Ambition - Material ambition, drive for advancement',
    '55': 'Abundance/Spirit - Emotional abundance, spirit and emotional depth',
    '56': 'Wanderer/Stimulation - Storytelling, stimulation through experience',
    '57': 'Gentle/Intuition - Gentle penetration, intuitive clarity',
    '58': 'Joy/Vitality - Joy of life, vitality and improvement',
    '59': 'Dispersion/Sexuality - Breaking down barriers, sexuality and intimacy',
    '60': 'Limitation/Acceptance - Acceptance of limitations, working within constraints',
    '61': 'Inner Truth/Mystery - Inner knowing, mystery and wonder',
    '62': 'Small Details - Attention to detail, precision in small things',
    '63': 'After Completion/Doubt - Logical doubt, suspicion of completion',
    '64': 'Before Completion/Confusion - Mental pressure to complete, confusion before clarity'
  };
  return `🔸 GATE ${gateNum}: ${gateMeanings[gateNum] || 'Unique individual energy activation'}`;
}).join('\n') || 'Not specified'}

UNCONSCIOUS DESIGN GATES (Your body's natural wisdom - often hidden from conscious awareness):
${humanDesign.gates?.unconscious_design?.map(gate => {
  const gateNum = gate.split('.')[0];
  const gateMeanings = {
    '1': 'Creative Expression - Unconscious creative power and leadership themes',
    '2': 'Higher Knowing - Unconscious direction and higher guidance',
    '3': 'Ordering - Unconscious innovation through difficulty',
    '4': 'Mental Solutions - Unconscious mental formulas and problem-solving',
    '5': 'Fixed Rhythms - Unconscious natural timing patterns',
    '6': 'Conflict/Friction - Unconscious emotional intimacy patterns through friction',
    '7': 'Role of Self - Unconscious leadership and direction themes',
    '8': 'Contribution - Unconscious individual contribution patterns',
    '9': 'Focus - Unconscious concentration and focus abilities',
    '10': 'Love of Self - Unconscious self-love and authenticity patterns',
    '11': 'Peace/Ideas - Unconscious peace-making through new ideas',
    '12': 'Standstill/Caution - Unconscious caution and social awareness',
    '13': 'Fellowship/Listener - Unconscious listening and story-sharing gifts',
    '14': 'Power Skills - Unconscious material success patterns',
    '15': 'Extremes - Unconscious love of humanity themes',
    '16': 'Skills/Enthusiasm - Unconscious talent identification patterns',
    '17': 'Opinions - Unconscious opinion formation and leadership',
    '18': 'Correction - Unconscious pattern recognition and correction',
    '19': 'Approach/Wanting - Unconscious sensitivity to others\' needs',
    '20': 'Now/Contemplation - Unconscious present-moment awareness',
    '21': 'Control/Hunter - Unconscious control and taking charge patterns',
    '22': 'Grace/Openness - Unconscious grace and openness to experience',
    '23': 'Splitting Apart/Assimilation - Unconscious knowing when to speak',
    '24': 'Return - Unconscious rationalization and natural cycles',
    '25': 'Innocence - Unconscious spiritual love and innocence',
    '26': 'Taming Power/Egoist - Unconscious strategic power management',
    '27': 'Nourishment/Caring - Unconscious caring and nourishment patterns',
    '28': 'Game Player - Unconscious risk-taking for higher purpose',
    '29': 'Abyssal/Perseverance - Unconscious commitment and perseverance',
    '30': 'Clinging Fire/Feelings - Unconscious intense emotional patterns',
    '31': 'Influence/Leading - Unconscious democratic leadership patterns',
    '32': 'Duration/Continuity - Unconscious endurance and continuity',
    '33': 'Retreat/Privacy - Unconscious need for privacy and processing',
    '34': 'Power/Great Power - Unconscious great individual power themes',
    '35': 'Progress/Change - Unconscious progress through experience',
    '36': 'Darkening Light/Crisis - Unconscious growth through emotional crisis',
    '37': 'Family/Friendship - Unconscious family and friendship bonding',
    '38': 'Opposition/Fighter - Unconscious fighting for principles',
    '39': 'Obstruction/Provocation - Unconscious provocation for growth',
    '40': 'Deliverance/Aloneness - Unconscious restoration through solitude',
    '41': 'Decrease/Contraction - Unconscious new cycle initiation',
    '42': 'Increase/Growth - Unconscious completion and growth patterns',
    '43': 'Breakthrough/Insight - Unconscious mental breakthrough patterns',
    '44': 'Coming to Meet/Pattern - Unconscious pattern recognition in relationships',
    '45': 'Gathering Together/King - Unconscious material success and gathering',
    '46': 'Pushing Upward/Determination - Unconscious body love and determination',
    '47': 'Oppression/Realization - Unconscious mental pressure patterns',
    '48': 'The Well/Depth - Unconscious depth and talent development',
    '49': 'Revolution/Principles - Unconscious revolutionary and principled themes',
    '50': 'Cauldron/Values - Unconscious higher values and responsibility',
    '51': 'Arousing/Shock - Unconscious shock initiation and competitive spirit',
    '52': 'Keeping Still/Stillness - Unconscious stillness and concentration',
    '53': 'Development/Beginnings - Unconscious gradual development patterns',
    '54': 'Marrying Maiden/Ambition - Unconscious material ambition drives',
    '55': 'Abundance/Spirit - Unconscious emotional abundance and spirit',
    '56': 'Wanderer/Stimulation - Unconscious storytelling and experience-seeking',
    '57': 'Gentle/Intuition - Unconscious intuitive clarity patterns',
    '58': 'Joy/Vitality - Unconscious joy and vitality themes',
    '59': 'Dispersion/Sexuality - Unconscious barrier-breaking and intimacy',
    '60': 'Limitation/Acceptance - Unconscious acceptance and constraint-working',
    '61': 'Inner Truth/Mystery - Unconscious inner knowing and mystery',
    '62': 'Small Details - Unconscious attention to detail and precision',
    '63': 'After Completion/Doubt - Unconscious logical doubt patterns',
    '64': 'Before Completion/Confusion - Unconscious mental completion pressure'
  };
  return `🔹 GATE ${gateNum}: ${gateMeanings[gateNum] || 'Unique unconscious energy pattern'}`;
}).join('\n') || 'Not specified'}

==== SUPPORTING PSYCHOLOGICAL DATA ====

Big Five Personality (0-1 scale):
- Openness: ${bigFive.openness || 'N/A'} - Intellectual curiosity and creativity
- Extraversion: ${bigFive.extraversion || 'N/A'} - Social energy and assertiveness  
- Agreeableness: ${bigFive.agreeableness || 'N/A'} - Cooperation and trust
- Conscientiousness: ${bigFive.conscientiousness || 'N/A'} - Organization and discipline
- Neuroticism: ${bigFive.neuroticism || 'N/A'} - Emotional stability

MBTI Analysis:
- Likely Type: ${personality.likelyType || 'Unknown'}
- Top 3 Probabilities: ${Object.entries(mbtiProbs).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([type, prob]) => `${type} (${(prob * 100).toFixed(1)}%)`).join(', ') || 'N/A'}

Numerology Core Numbers:
- Life Path: ${numerology.life_path_number || 'Unknown'} (${numerology.life_path_keyword || ''})
- Soul Urge: ${numerology.soul_urge_number || 'Unknown'} (${numerology.soul_urge_keyword || ''})
- Expression: ${numerology.expression_number || 'Unknown'} (${numerology.expression_keyword || ''})

Astrology:
- Sun: ${astrology.sun_sign || 'Unknown'} - Core identity and ego expression
- Moon: ${astrology.moon_sign || 'Unknown'} - Emotional nature and inner self
- Rising: ${astrology.rising_sign || 'Unknown'} - Public persona and first impressions

==== REQUIRED REPORT STRUCTURE ====

You MUST create exactly these 6 sections with detailed Human Design gate analysis:

1. CORE PERSONALITY ARCHITECTURE (400+ words)
Start with their Human Design type, strategy and authority. Then analyze how their SPECIFIC CONSCIOUS GATES create their personality patterns. Reference each gate number and its psychological meaning. Connect this to their Big Five scores and MBTI type.

2. DECISION-MAKING & COGNITIVE STYLE (350+ words)  
Focus heavily on their Authority (${humanDesign.authority || 'Unknown'}) and how their specific gates influence decision-making. Analyze each defined center's role in cognition. Connect to MBTI cognitive functions.

3. RELATIONSHIP & SOCIAL DYNAMICS (350+ words)
Analyze their Profile (${humanDesign.profile || 'Unknown'}) and how their conscious AND unconscious gates create relationship patterns. Reference specific gate numbers and their social implications.

4. LIFE PURPOSE & SPIRITUAL PATH (400+ words)
Connect their Human Design strategy, their active channels, and specific gates to their Life Path number and Soul Urge. Each gate represents part of their soul's purpose.

5. ENERGY PATTERNS & TIMING (300+ words)
Analyze their defined vs undefined centers and how specific gates create energy patterns. Include their Not-Self theme and how gates can trap them or liberate them.

6. INTEGRATED BLUEPRINT SYNTHESIS (300+ words)
Weave together how their specific gate activations create a unique personality when combined with all other systems.

CRITICAL: In each section, you MUST reference specific gate numbers and their meanings. Don't just mention "your gates" - say "your Gate 16 of Skills" or "your unconscious Gate 13 of Fellowship."

THEN create 10 personalized quotes with specific gate and personality references.

Write in second person with deep gate-specific analysis throughout.`;

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
