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
      error: error.message || 'Failed to extract blueprint facts'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})