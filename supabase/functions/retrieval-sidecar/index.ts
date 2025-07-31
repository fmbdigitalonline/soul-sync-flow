import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Intent classification
function classifyIntent(query: string): 'FACTUAL' | 'INTERPRETIVE' | 'MIXED' {
  const factualPatterns = [
    /what\s+(is|are|were)\s+my/i,
    /\b(numerology|life\s*path|expression|soul\s*urge|personality)\s+(number|score)/i,
    /\b(human\s*design|mbti|astrology)\s+(type|sign)/i,
    /my\s+\d+\s+(numerology\s+)?numbers?/i,
    /\b(sun|moon|rising)\s+sign/i,
    /(authority|profile)\s+(type|number)/i
  ]
  
  const interpretivePatterns = [
    /how\s+(can|should|do)/i,
    /why\s+(am|do|should)/i,
    /what\s+does\s+.+\s+mean/i,
    /help\s+me/i,
    /advice|guidance|suggestion/i,
    /feel|emotion|energy/i
  ]
  
  const factualScore = factualPatterns.reduce((score, pattern) => 
    score + (pattern.test(query) ? 1 : 0), 0)
  const interpretiveScore = interpretivePatterns.reduce((score, pattern) => 
    score + (pattern.test(query) ? 1 : 0), 0)
  
  if (factualScore > interpretiveScore) return 'FACTUAL'
  if (interpretiveScore > factualScore) return 'INTERPRETIVE'
  return 'MIXED'
}

// Fetch structured facts
async function fetchFacts(supabase: any, userId: string, query: string): Promise<any[]> {
  const queryLower = query.toLowerCase()
  
  // Map query terms to fact keys
  const keywordMap: Record<string, string[]> = {
    'numerology': ['life_path', 'expression', 'soul_urge', 'personality'],
    'life path': ['life_path'],
    'expression': ['expression'],
    'soul urge': ['soul_urge'],
    'personality': ['personality'],
    'human design': ['type', 'authority', 'profile'],
    'mbti': ['type'],
    'astrology': ['sun_sign', 'moon_sign', 'rising_sign'],
    'sun sign': ['sun_sign'],
    'moon sign': ['moon_sign'],
    'rising': ['rising_sign']
  }
  
  // Find relevant facets and keys
  const relevantQueries: { facet: string, keys?: string[] }[] = []
  
  for (const [keyword, keys] of Object.entries(keywordMap)) {
    if (queryLower.includes(keyword)) {
      const facet = keyword === 'life path' || keyword === 'expression' || 
                   keyword === 'soul urge' || keyword === 'personality' ? 'numerology' :
                   keyword === 'human design' ? 'human_design' :
                   keyword === 'sun sign' || keyword === 'moon sign' || keyword === 'rising' ? 'astrology' :
                   keyword
      
      const existingQuery = relevantQueries.find(q => q.facet === facet)
      if (existingQuery) {
        existingQuery.keys = [...(existingQuery.keys || []), ...keys]
      } else {
        relevantQueries.push({ facet, keys })
      }
    }
  }
  
  // If no specific matches, check for "numbers" query (common for numerology)
  if (relevantQueries.length === 0 && queryLower.includes('numbers')) {
    relevantQueries.push({ facet: 'numerology' })
  }
  
  console.log('🔍 Fact lookup queries:', relevantQueries)
  
  const facts: any[] = []
  
  for (const { facet, keys } of relevantQueries) {
    let factQuery = supabase
      .from('blueprint_facts')
      .select('*')
      .eq('user_id', userId)
      .eq('facet', facet)
    
    if (keys) {
      factQuery = factQuery.in('key', keys)
    }
    
    const { data: facetFacts, error } = await factQuery
    
    if (error) {
      console.error(`❌ Error fetching ${facet} facts:`, error)
      continue
    }
    
    if (facetFacts) {
      facts.push(...facetFacts)
    }
  }
  
  return facts
}

// Hybrid retrieval: BM25 + Vector search
async function hybridRetrieve(
  supabase: any, 
  userId: string, 
  query: string, 
  config: any
): Promise<any[]> {
  const { ann_thresholds = [0.25, 0.20] } = config
  
  console.log('🔍 Starting hybrid retrieval:', {
    query: query.substring(0, 50),
    thresholds: ann_thresholds
  })
  
  try {
    // Generate embedding for query
    const embeddingResponse = await supabase.functions.invoke('openai-embeddings', {
      body: { query },
      headers: {
        Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      }
    })
    
    if (embeddingResponse.error || !embeddingResponse.data?.embedding) {
      console.error('❌ Embedding generation failed:', embeddingResponse.error)
      return []
    }
    
    const embedding = embeddingResponse.data.embedding
    console.log('✅ Embedding generated:', embedding.length, 'dimensions')
    
    // Try vector search with adaptive thresholds
    let chunks: any[] = []
    
    for (const threshold of ann_thresholds) {
      console.log(`🔍 Trying threshold ${threshold}`)
      
      const { data: matchingChunks, error: searchError } = await supabase.rpc(
        'match_blueprint_chunks',
        {
          query_embedding: embedding,
          query_user_id: userId,
          match_threshold: threshold,
          match_count: 8
        }
      )
      
      if (searchError) {
        console.error(`❌ Vector search failed at threshold ${threshold}:`, searchError)
        continue
      }
      
      if (matchingChunks && matchingChunks.length >= 3) {
        chunks = matchingChunks
        console.log(`✅ Found ${chunks.length} chunks at threshold ${threshold}`)
        break
      }
    }
    
    // If still no results, try basic text search as fallback
    if (chunks.length === 0) {
      console.log('🔍 Vector search failed, trying text fallback')
      
      const keywords = query.toLowerCase().split(' ').filter(w => w.length > 3)
      console.log('🔍 Using keywords:', keywords)
      
      // Simple keyword search in chunk content
      const { data: textChunks, error: textError } = await supabase
        .from('blueprint_text_embeddings')
        .select('id, chunk_content')
        .eq('user_id', userId)
        .limit(50)
      
      if (!textError && textChunks) {
        const scoredChunks = textChunks
          .map(chunk => {
            const content = chunk.chunk_content.toLowerCase()
            const score = keywords.reduce((acc, keyword) => 
              acc + (content.includes(keyword) ? 1 : 0), 0)
            return { ...chunk, similarity: score / keywords.length }
          })
          .filter(chunk => chunk.similarity > 0)
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 5)
        
        chunks = scoredChunks
        console.log(`✅ Text fallback found ${chunks.length} chunks`)
      }
    }
    
    return chunks.map(chunk => ({
      content: chunk.chunk_content,
      relevance: chunk.similarity,
      metadata: {
        chunkId: chunk.id,
        retrievalMethod: chunk.similarity > 1 ? 'vector' : 'text_fallback'
      }
    }))
    
  } catch (error) {
    console.error('❌ Hybrid retrieval error:', error)
    return []
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 Retrieval Sidecar: Processing query')
    
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

    const { userId, query, mode = 'companion' } = await req.json()
    
    if (!userId || !query) {
      throw new Error('userId and query are required')
    }

    console.log('🔍 Query analysis:', {
      userId: userId.substring(0, 8),
      queryLength: query.length,
      mode
    })

    // Get user's retrieval config
    const { data: config } = await supabase
      .from('retrieval_config')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    const retrievalConfig = config || {
      sidecar_enabled: true,
      hybrid_retrieval_enabled: true,
      ann_thresholds: [0.25, 0.20],
      facts_priority: true
    }

    console.log('⚙️ Retrieval config:', retrievalConfig)

    // Classify intent
    const intent = classifyIntent(query)
    console.log('🧠 Intent classification:', intent)

    let facts: any[] = []
    let passages: any[] = []

    // Route based on intent
    if ((intent === 'FACTUAL' || intent === 'MIXED') && retrievalConfig.facts_priority) {
      console.log('📊 Fetching structured facts...')
      facts = await fetchFacts(supabase, userId, query)
      
      // If no facts found and it's factual intent, still try passages
      if (facts.length === 0 && intent === 'FACTUAL') {
        console.log('📄 No facts found, falling back to passages')
        passages = await hybridRetrieve(supabase, userId, query, retrievalConfig)
      }
    }
    
    if (intent === 'INTERPRETIVE' || intent === 'MIXED' || 
        (intent === 'FACTUAL' && facts.length === 0)) {
      console.log('📄 Fetching narrative passages...')
      passages = await hybridRetrieve(supabase, userId, query, retrievalConfig)
      
      // Get related facts for context
      if (passages.length > 0 && retrievalConfig.facts_priority) {
        console.log('📊 Fetching related facts for context...')
        const relatedFacts = await fetchFacts(supabase, userId, query)
        facts.push(...relatedFacts)
      }
    }

    const result = {
      intent,
      facts: facts.slice(0, 8),
      passages: passages.slice(0, 6),
      citations: facts.map(f => `${f.facet}.${f.key}`),
      debug: {
        factsFound: facts.length,
        passagesFound: passages.length,
        retrievalMethod: facts.length > 0 ? 'facts_primary' : 'passages_primary',
        timestamp: new Date().toISOString()
      }
    }

    console.log('✅ Retrieval complete:', {
      intent,
      factsReturned: result.facts.length,
      passagesReturned: result.passages.length,
      retrievalMethod: result.debug.retrievalMethod
    })

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Retrieval Sidecar Error:', error)
    return new Response(JSON.stringify({
      error: error.message || 'Retrieval failed',
      intent: 'INTERPRETIVE',
      facts: [],
      passages: [],
      citations: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})