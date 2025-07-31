import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Extract facts from blueprint data
function extractBlueprintFacts(blueprint: any, userId: string): any[] {
  const facts: any[] = []
  
  // Numerology facts
  if (blueprint.values_life_path) {
    const numerology = blueprint.values_life_path
    
    if (numerology.lifePathNumber) {
      facts.push({
        user_id: userId,
        facet: 'numerology',
        key: 'life_path',
        value_json: { value: numerology.lifePathNumber, label: 'Life Path Number' },
        confidence: 1.0
      })
    }
    
    if (numerology.expressionNumber) {
      facts.push({
        user_id: userId,
        facet: 'numerology', 
        key: 'expression',
        value_json: { value: numerology.expressionNumber, label: 'Expression Number' },
        confidence: 1.0
      })
    }
    
    if (numerology.soulUrgeNumber) {
      facts.push({
        user_id: userId,
        facet: 'numerology',
        key: 'soul_urge', 
        value_json: { value: numerology.soulUrgeNumber, label: 'Soul Urge Number' },
        confidence: 1.0
      })
    }
    
    if (numerology.personalityNumber) {
      facts.push({
        user_id: userId,
        facet: 'numerology',
        key: 'personality',
        value_json: { value: numerology.personalityNumber, label: 'Personality Number' },
        confidence: 1.0
      })
    }
  }
  
  // Human Design facts
  if (blueprint.energy_strategy_human_design) {
    const hd = blueprint.energy_strategy_human_design
    
    if (hd.type) {
      facts.push({
        user_id: userId,
        facet: 'human_design',
        key: 'type',
        value_json: { value: hd.type, label: 'Human Design Type' },
        confidence: 1.0
      })
    }
    
    if (hd.authority) {
      facts.push({
        user_id: userId,
        facet: 'human_design',
        key: 'authority',
        value_json: { value: hd.authority, label: 'Authority' },
        confidence: 1.0
      })
    }
    
    if (hd.profile) {
      facts.push({
        user_id: userId,
        facet: 'human_design',
        key: 'profile',
        value_json: { value: hd.profile, label: 'Profile' },
        confidence: 1.0
      })
    }
  }
  
  // MBTI facts
  if (blueprint.cognition_mbti?.type) {
    facts.push({
      user_id: userId,
      facet: 'mbti',
      key: 'type',
      value_json: { value: blueprint.cognition_mbti.type, label: 'MBTI Type' },
      confidence: 1.0
    })
  }
  
  // Also check user_meta.personality for MBTI
  if (blueprint.user_meta?.personality?.likelyType) {
    facts.push({
      user_id: userId,
      facet: 'mbti',
      key: 'type',
      value_json: { value: blueprint.user_meta.personality.likelyType, label: 'MBTI Type' },
      confidence: 0.9
    })
  }
  
  // Astrology facts
  if (blueprint.archetype_western) {
    const astro = blueprint.archetype_western
    
    if (astro.sun_sign) {
      facts.push({
        user_id: userId,
        facet: 'astrology',
        key: 'sun_sign',
        value_json: { value: astro.sun_sign, label: 'Sun Sign' },
        confidence: 1.0
      })
    }
    
    if (astro.moon_sign) {
      facts.push({
        user_id: userId,
        facet: 'astrology',
        key: 'moon_sign',
        value_json: { value: astro.moon_sign, label: 'Moon Sign' },
        confidence: 1.0
      })
    }
    
    if (astro.rising_sign) {
      facts.push({
        user_id: userId,
        facet: 'astrology',
        key: 'rising_sign',
        value_json: { value: astro.rising_sign, label: 'Rising Sign' },
        confidence: 1.0
      })
    }
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