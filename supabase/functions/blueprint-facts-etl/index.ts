import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Extract facts from blueprint data with deduplication
function extractBlueprintFacts(blueprint: any, userId: string): any[] {
  const facts: any[] = []
  const seenKeys = new Set<string>() // Prevent duplicates
  
  function addFact(facet: string, key: string, value: any, label: string, confidence: number = 1.0) {
    const uniqueKey = `${facet}.${key}`
    if (!seenKeys.has(uniqueKey) && value !== null && value !== undefined && value !== '') {
      facts.push({
        user_id: userId,
        facet,
        key,
        value_json: { value, label },
        confidence
      })
      seenKeys.add(uniqueKey)
      console.log(`✅ Added fact: ${uniqueKey} = ${value}`)
    } else if (seenKeys.has(uniqueKey)) {
      console.log(`⚠️ Skipping duplicate fact: ${uniqueKey}`)
    } else {
      console.log(`⚠️ Skipping invalid fact: ${uniqueKey} (empty value)`)
    }
  }
  
  // Numerology facts - Fixed field mapping to blueprint.numerology with snake_case
  if (blueprint.numerology) {
    const numerology = blueprint.numerology
    console.log('🔢 Processing numerology data:', JSON.stringify(numerology, null, 2))
    
    addFact('numerology', 'life_path', numerology.life_path_number, 'Life Path Number')
    addFact('numerology', 'expression', numerology.expression_number, 'Expression Number') 
    addFact('numerology', 'soul_urge', numerology.soul_urge_number, 'Soul Urge Number')
    addFact('numerology', 'personality', numerology.personality_number, 'Personality Number')
    addFact('numerology', 'birthday', numerology.birthday_number, 'Birthday Number') // Added missing field
  } else {
    console.log('⚠️ No numerology data found in blueprint')
  }
  
  // Human Design facts
  if (blueprint.energy_strategy_human_design) {
    const hd = blueprint.energy_strategy_human_design
    console.log('🔮 Processing Human Design data:', JSON.stringify(hd, null, 2))
    
    addFact('human_design', 'type', hd.type, 'Human Design Type')
    addFact('human_design', 'authority', hd.authority, 'Authority')
    addFact('human_design', 'profile', hd.profile, 'Profile')
  } else {
    console.log('⚠️ No Human Design data found in blueprint')
  }
  
  // MBTI facts - Fixed to prevent "Unknown" values and duplicates
  let mbtiType = null
  let mbtiConfidence = 1.0
  let mbtiSource = 'unknown'
  
  // Prioritize cognition_mbti first, then user_meta.personality, but filter out "Unknown"
  if (blueprint.cognition_mbti?.type && blueprint.cognition_mbti.type !== 'Unknown') {
    mbtiType = blueprint.cognition_mbti.type
    mbtiSource = 'cognition_mbti'
    mbtiConfidence = 1.0
  } else if (blueprint.user_meta?.personality?.likelyType && blueprint.user_meta.personality.likelyType !== 'Unknown') {
    mbtiType = blueprint.user_meta.personality.likelyType
    mbtiSource = 'user_meta_personality'
    mbtiConfidence = 0.9
  }
  
  console.log('🧠 MBTI processing:', { 
    cognition_mbti_type: blueprint.cognition_mbti?.type, 
    user_meta_type: blueprint.user_meta?.personality?.likelyType,
    selected_type: mbtiType,
    source: mbtiSource 
  })
  
  if (mbtiType) {
    addFact('mbti', 'type', mbtiType, 'MBTI Type', mbtiConfidence)
  } else {
    console.log('⚠️ No valid MBTI type found (filtering out "Unknown" values)')
  }
  
  // Astrology facts
  if (blueprint.archetype_western) {
    const astro = blueprint.archetype_western
    console.log('⭐ Processing astrology data:', JSON.stringify(astro, null, 2))
    
    addFact('astrology', 'sun_sign', astro.sun_sign, 'Sun Sign')
    addFact('astrology', 'moon_sign', astro.moon_sign, 'Moon Sign') 
    addFact('astrology', 'rising_sign', astro.rising_sign, 'Rising Sign')
  } else {
    console.log('⚠️ No astrology data found in blueprint')
  }
  
  // Chinese Astrology facts
  if (blueprint.archetype_chinese) {
    const chinese = blueprint.archetype_chinese
    console.log('🐉 Processing Chinese astrology data:', JSON.stringify(chinese, null, 2))
    
    addFact('chinese_astrology', 'animal', chinese.animal, 'Chinese Zodiac Animal')
    addFact('chinese_astrology', 'element', chinese.element, 'Chinese Element')
    addFact('chinese_astrology', 'yin_yang', chinese.yin_yang, 'Yin/Yang Polarity')
    addFact('chinese_astrology', 'keyword', chinese.keyword, 'Chinese Zodiac Keyword')
  } else {
    console.log('⚠️ No Chinese astrology data found in blueprint')
  }
  
  // Big Five Personality Traits
  if (blueprint.user_meta?.personality?.bigFive) {
    const bigFive = blueprint.user_meta.personality.bigFive
    const confidence = blueprint.user_meta.personality.confidence || {}
    console.log('🧠 Processing Big Five personality data:', JSON.stringify(bigFive, null, 2))
    
    addFact('big_five', 'openness', bigFive.openness, 'Openness to Experience', confidence.openness || 0.7)
    addFact('big_five', 'conscientiousness', bigFive.conscientiousness, 'Conscientiousness', confidence.conscientiousness || 0.7)
    addFact('big_five', 'extraversion', bigFive.extraversion, 'Extraversion', confidence.extraversion || 0.7)
    addFact('big_five', 'agreeableness', bigFive.agreeableness, 'Agreeableness', confidence.agreeableness || 0.7)
    addFact('big_five', 'neuroticism', bigFive.neuroticism, 'Neuroticism', confidence.neuroticism || 0.7)
  } else {
    console.log('⚠️ No Big Five personality data found in blueprint')
  }
  
  // Enhanced MBTI with probabilities
  if (blueprint.user_meta?.personality?.mbtiProbabilities) {
    const probabilities = blueprint.user_meta.personality.mbtiProbabilities
    console.log('🧠 Processing MBTI probabilities:', JSON.stringify(probabilities, null, 2))
    
    // Get top 3 most likely types
    const sortedTypes = Object.entries(probabilities)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
    
    sortedTypes.forEach(([type, probability], index) => {
      addFact('mbti_probabilities', `top_${index + 1}_type`, type, `MBTI Top ${index + 1} Type`, probability as number)
      addFact('mbti_probabilities', `top_${index + 1}_probability`, probability, `MBTI Top ${index + 1} Probability`, 0.9)
    })
  }
  
  // User Meta Information
  if (blueprint.user_meta) {
    const userMeta = blueprint.user_meta
    console.log('👤 Processing user meta data:', JSON.stringify(userMeta, null, 2))
    
    addFact('user_info', 'full_name', userMeta.full_name, 'Full Name')
    addFact('user_info', 'preferred_name', userMeta.preferred_name, 'Preferred Name')
    addFact('user_info', 'birth_date', userMeta.birth_date, 'Birth Date')
    addFact('user_info', 'birth_location', userMeta.birth_location, 'Birth Location')
    addFact('user_info', 'timezone', userMeta.timezone, 'Timezone')
    addFact('user_info', 'birth_time_local', userMeta.birth_time_local, 'Birth Time')
  } else {
    console.log('⚠️ No user meta data found in blueprint')
  }
  
  // Enhanced Human Design Gates
  if (blueprint.energy_strategy_human_design?.gates) {
    const gates = blueprint.energy_strategy_human_design.gates
    console.log('🔮 Processing Human Design gates:', JSON.stringify(gates, null, 2))
    
    // Conscious personality gates
    if (gates.conscious_personality && Array.isArray(gates.conscious_personality)) {
      gates.conscious_personality.forEach((gate: string, index: number) => {
        addFact('human_design_gates', `conscious_${index + 1}`, gate, `Conscious Gate ${index + 1}`)
      })
    }
    
    // Unconscious design gates  
    if (gates.unconscious_design && Array.isArray(gates.unconscious_design)) {
      gates.unconscious_design.forEach((gate: string, index: number) => {
        addFact('human_design_gates', `unconscious_${index + 1}`, gate, `Unconscious Gate ${index + 1}`)
      })
    }
  }
  
  // Human Design Centers
  if (blueprint.energy_strategy_human_design?.centers) {
    const centers = blueprint.energy_strategy_human_design.centers
    console.log('🔮 Processing Human Design centers:', JSON.stringify(centers, null, 2))
    
    Object.entries(centers).forEach(([centerName, centerData]: [string, any]) => {
      addFact('human_design_centers', `${centerName.toLowerCase()}_defined`, centerData.defined, `${centerName} Center Defined`)
      if (centerData.gates && Array.isArray(centerData.gates)) {
        addFact('human_design_centers', `${centerName.toLowerCase()}_gates`, centerData.gates.join(', '), `${centerName} Center Gates`)
      }
    })
  }
  
  // Additional Human Design Properties
  if (blueprint.energy_strategy_human_design) {
    const hd = blueprint.energy_strategy_human_design
    addFact('human_design_advanced', 'strategy', hd.strategy, 'Strategy')
    addFact('human_design_advanced', 'definition', hd.definition, 'Definition')
    addFact('human_design_advanced', 'not_self_theme', hd.not_self_theme, 'Not-Self Theme')
  }
  
  return facts
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🔧 Blueprint Facts ETL: Starting extraction process')
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { userId, forceReprocess = false } = await req.json()
    
    if (!userId) {
      throw new Error('userId is required')
    }

    console.log('🔧 Processing blueprint facts for user:', userId.substring(0, 8))

    // Check if facts already exist
    if (!forceReprocess) {
      const { data: existingFacts } = await supabase
        .from('blueprint_facts')
        .select('id')
        .eq('user_id', userId)
        .limit(1)
      
      if (existingFacts && existingFacts.length > 0) {
        console.log('✅ Facts already exist for user, skipping extraction')
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Facts already exist',
          factsCount: existingFacts.length 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Get user blueprint
    const { data: blueprint, error: blueprintError } = await supabase
      .from('user_blueprints')
      .select('blueprint')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (blueprintError || !blueprint?.blueprint) {
      console.error('❌ No blueprint found for user:', blueprintError)
      throw new Error('No active blueprint found for user')
    }

    console.log('📋 Blueprint retrieved, extracting facts...')

    // Extract facts from blueprint
    const facts = extractBlueprintFacts(blueprint.blueprint, userId)
    
    console.log('🔍 Extracted facts:', {
      totalFacts: facts.length,
      facets: [...new Set(facts.map(f => f.facet))],
      keys: facts.map(f => `${f.facet}.${f.key}`)
    })

    if (facts.length === 0) {
      console.log('⚠️ No facts extracted from blueprint')
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No facts to extract',
        factsCount: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Delete existing facts if reprocessing
    if (forceReprocess) {
      const { error: deleteError } = await supabase
        .from('blueprint_facts')
        .delete()
        .eq('user_id', userId)
      
      if (deleteError) {
        console.error('❌ Error deleting existing facts:', deleteError)
      } else {
        console.log('🗑️ Existing facts deleted for reprocessing')
      }
    }

    // Insert facts into database
    const { data: insertedFacts, error: insertError } = await supabase
      .from('blueprint_facts')
      .insert(facts)
      .select()

    if (insertError) {
      console.error('❌ Error inserting facts:', insertError)
      throw new Error(`Failed to insert facts: ${insertError.message}`)
    }

    console.log('✅ Facts successfully inserted:', {
      inserted: insertedFacts?.length || 0,
      userIdSample: userId.substring(0, 8)
    })

    return new Response(JSON.stringify({
      success: true,
      message: 'Blueprint facts extracted successfully',
      factsCount: insertedFacts?.length || 0,
      facts: insertedFacts?.map(f => ({
        facet: f.facet,
        key: f.key,
        value: f.value_json
      }))
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ ETL Error:', error)
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Failed to extract blueprint facts'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})