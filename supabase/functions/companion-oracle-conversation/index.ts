import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Utility function for calculating cosine similarity between embeddings
function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length for cosine similarity')
  }
  
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }
  
  // Avoid division by zero
  if (normA === 0 || normB === 0) {
    return 0
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// FUSION: Background task for HACS intelligence integration
async function fuseWithHACSIntelligence(
  userMessage: string, 
  userId: string, 
  sessionId: string, 
  oracleResponse: any,
  supabase: any
) {
  try {
    console.log('🧠 FUSION: Starting background HACS intelligence processing');
    
    // Invoke unified brain processor with oracle response for learning
    const { data: brainResult, error: brainError } = await supabase.functions.invoke('unified-brain-processor', {
      body: {
        userId,
        message: userMessage,  // FUSION FIX: Use 'message' parameter expected by brain processor
        sessionId,
        agentMode: 'companion', // FUSION FIX: Add required agentMode parameter
        agentResponse: oracleResponse.response,
        oracleMetadata: {
          personalityInsights: oracleResponse.semanticChunks,
          oracleMode: true,
          responseQuality: oracleResponse.quality || 0.8,
          oracleStatus: oracleResponse.oracleStatus
        }
      }
    });

    if (brainError) {
      console.error('❌ FUSION ERROR: Unified brain processing failed', brainError);
    } else {
      console.log('✅ FUSION SUCCESS: HACS intelligence updated from oracle interaction', {
        processingId: brainResult?.processingId,
        intelligenceLevel: brainResult?.newIntelligenceLevel
      });
    }
  } catch (error) {
    console.error('❌ FUSION ERROR: Background intelligence task failed', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now(); // EMERGENCY FIX: Add missing startTime declaration

  try {
    console.log('🔮 Oracle Function Called - Starting enhanced conversation processing');
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

    const { message, userId, sessionId, useOracleMode = false, enableBackgroundIntelligence = false, conversationHistory = [] } = await req.json()
    console.log('🔮 FUSION: Oracle Mode Request:', { 
      useOracleMode, 
      enableBackgroundIntelligence,
      messageLength: message.length,
      conversationHistoryLength: conversationHistory.length,
      userId: userId.substring(0, 8) 
    })

    // FUSION STEP 1: Get current HACS intelligence level for response calibration
    const { data: hacsIntelligence } = await supabase
      .from('hacs_intelligence')
      .select('intelligence_level, module_scores')
      .eq('user_id', userId)
      .single()

    const intelligenceLevel = hacsIntelligence?.intelligence_level || 50
    const moduleScores = hacsIntelligence?.module_scores || {}
    
    console.log('🧠 FUSION: Current HACS intelligence level:', intelligenceLevel)

    // Get user blueprint for personality context
    const { data: blueprint } = await supabase
      .from('user_blueprints')
      .select('blueprint')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    let personalityContext = null
    if (blueprint?.blueprint) {
      personalityContext = {
        name: blueprint.blueprint.user_meta?.preferred_name || 'Seeker',
        mbti: blueprint.blueprint.user_meta?.personality?.likelyType || blueprint.blueprint.cognition_mbti?.type || 'Unknown',
        hdType: blueprint.blueprint.energy_strategy_human_design?.type || 'Unknown',
        sunSign: blueprint.blueprint.archetype_western?.sun_sign || 'Unknown'
      }
    }

    // ENHANCED ORACLE PIPELINE: Hybrid retrieval with facts + narrative
    let semanticChunks = []
    let structuredFacts = []
    let oracleStatus = 'initializing'
    let sidecarResult = { intent: 'MIXED' } // Initialize with default intent
    
    if (useOracleMode && personalityContext) {
      console.log('🔮 ENHANCED ORACLE: Starting hybrid retrieval with personality context:', {
        userName: personalityContext.name,
        mbtiType: personalityContext.mbti,
        hdType: personalityContext.hdType,
        sunSign: personalityContext.sunSign
      });

      // STEP 1: Try retrieval sidecar first (feature flagged)
      console.log('🔮 STEP 1: Attempting retrieval sidecar...');
      try {
        const sidecarResponse = await supabase.functions.invoke('retrieval-sidecar', {
          body: {
            userId,
            query: message,
            mode: 'companion'
          },
          headers: {
            Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          }
        });

          sidecarResult = {
            success: !!sidecarResponse.data,
            error: sidecarResponse.error?.message || null,
            factsFound: sidecarResponse.data?.facts?.length || 0,
            passagesFound: sidecarResponse.data?.passages?.length || 0,
            intent: sidecarResponse.data?.intent || 'unknown',
            facts: sidecarResponse.data?.facts || [],
            passages: sidecarResponse.data?.passages || []
          };

          console.log('🔮 SIDECAR RESULT:', sidecarResult);

          if (sidecarResponse.data && !sidecarResponse.error) {
            // Use sidecar results
            structuredFacts = sidecarResult.facts;
            const sidecarPassages = sidecarResult.passages;
            
            // Convert sidecar passages to semantic chunks format
            semanticChunks = sidecarPassages.map((passage: any, index: number) => ({
              chunk_content: passage.content || passage.chunk_content,
              relevance: passage.relevance,
              reportType: 'personality',
              metadata: {
                ...passage.metadata,
                sidecarRetrieved: true,
                retrievalMethod: 'sidecar_hybrid'
              }
            }));

            if (structuredFacts.length > 0 || semanticChunks.length > 0) {
              oracleStatus = 'enhanced_oracle';
              console.log('✅ SIDECAR SUCCESS: Enhanced retrieval complete:', {
                facts: structuredFacts.length,
                passages: semanticChunks.length,
                oracleStatus
              });
            } else {
              console.log('⚠️ SIDECAR: No results, falling back to legacy pipeline');
            }
          } else {
            console.log('⚠️ SIDECAR: Failed or disabled, using legacy pipeline');
          }
      } catch (sidecarError) {
        console.error('❌ SIDECAR ERROR: Falling back to legacy pipeline:', sidecarError);
      }

      // STEP 2: Legacy pipeline fallback if sidecar didn't provide results
      if (semanticChunks.length === 0 && structuredFacts.length === 0) {
        console.log('🔮 STEP 2: Using legacy vector search pipeline');
        
        // STEP 1: Check for pre-computed embeddings first
      console.log('🔮 STEP 1: Checking for pre-computed embeddings...');
      const { data: embeddingCheck, error: embeddingError } = await supabase
        .from('blueprint_text_embeddings')
        .select('id, chunk_content, created_at')
        .eq('user_id', userId)
        .limit(10);
      
      console.log('🔮 STEP 1 RESULT: Embedding availability check:', {
        embeddingsFound: embeddingCheck?.length || 0,
        embeddingError: embeddingError?.message || null,
        sampleIds: embeddingCheck?.slice(0, 3).map(e => e.id) || [],
        oldestEmbedding: embeddingCheck?.[embeddingCheck.length - 1]?.created_at || null
      });

      if (embeddingCheck && embeddingCheck.length > 0) {
        console.log('🔮 STEP 2: Pre-computed embeddings found, proceeding with vector search');
        
        try {
          // Create contextual search text by combining current message with conversation context
          const contextualSearchText = conversationHistory.length > 0 
            ? `${conversationHistory.slice(-5).map(msg => `${msg.role}: ${msg.content}`).join(' ')} current: ${message}`
            : message;

          console.log('🔮 STEP 3: Generating embedding for contextual search:', {
            originalMessage: message,
            contextualSearchLength: contextualSearchText.length,
            conversationContextUsed: conversationHistory.length > 0,
            timestamp: new Date().toISOString()
          });

          const embeddingStartTime = Date.now();
          const embeddingResponse = await supabase.functions.invoke('openai-embeddings', {
            body: { query: contextualSearchText },
            headers: {
              Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
            }
          });
          const embeddingDuration = Date.now() - embeddingStartTime;

          console.log('🔮 STEP 3 RESULT: Embedding generation completed:', {
            success: !!embeddingResponse.data?.embedding,
            embeddingLength: embeddingResponse.data?.embedding?.length || 0,
            processingTime: embeddingDuration + 'ms',
            error: embeddingResponse.error?.message || null,
            statusCode: embeddingResponse.status,
            responseDataKeys: Object.keys(embeddingResponse.data || {}),
            responseErrorKeys: Object.keys(embeddingResponse.error || {})
          });
          
          if (embeddingResponse.error) {
            console.error('❌ ORACLE FATAL: Embedding generation failed with error:', {
              error: embeddingResponse.error,
              status: embeddingResponse.status,
              data: embeddingResponse.data
            });
            throw new Error('Failed to generate message embedding: ' + embeddingResponse.error.message);
          }
          
          const messageEmbedding = embeddingResponse.data?.embedding;
          if (!messageEmbedding || !Array.isArray(messageEmbedding)) {
            console.error('❌ ORACLE FATAL: Invalid embedding format received:', {
              embeddingType: typeof messageEmbedding,
              isArray: Array.isArray(messageEmbedding),
              length: messageEmbedding?.length,
              sample: messageEmbedding?.slice(0, 5)
            });
            throw new Error('Invalid embedding format received from OpenAI');
          }
          
          console.log('✅ ORACLE SUCCESS: Generated valid query embedding:', {
            dimensions: messageEmbedding.length,
            firstFewValues: messageEmbedding.slice(0, 5),
            lastFewValues: messageEmbedding.slice(-5),
            allValuesNumeric: messageEmbedding.every(v => typeof v === 'number'),
            hasNaN: messageEmbedding.some(v => isNaN(v)),
            magnitude: Math.sqrt(messageEmbedding.reduce((sum, val) => sum + val * val, 0))
          });
          
          // STEP 4: Perform vector similarity search
          console.log('🔮 STEP 4: Starting vector similarity search with parameters:', {
            queryEmbedding: {
              dimensions: messageEmbedding.length,
              firstValues: messageEmbedding.slice(0, 3),
              magnitude: Math.sqrt(messageEmbedding.reduce((sum, val) => sum + val * val, 0))
            },
            searchParams: {
              userId: userId.substring(0, 8) + '...',
              matchThreshold: 0.3,
              matchCount: 5
            },
            functionName: 'match_blueprint_chunks'
          });

          const searchStartTime = Date.now();
          const { data: matchingChunks, error: searchError } = await supabase.rpc(
            'match_blueprint_chunks',
            {
              query_embedding: messageEmbedding,
              query_user_id: userId,
              match_threshold: 0.3,
              match_count: 5
            }
          );
          const searchDuration = Date.now() - searchStartTime;
          
          console.log('🔮 STEP 4 RESULT: Vector similarity search completed:', {
            processingTime: searchDuration + 'ms',
            chunksFound: matchingChunks?.length || 0,
            searchError: searchError?.message || null,
            searchErrorCode: searchError?.code || null,
            searchErrorDetails: searchError?.details || null,
            searchErrorHint: searchError?.hint || null,
            rawResult: matchingChunks ? 'array' : 'null/undefined',
            resultSample: matchingChunks?.slice(0, 2).map(c => ({
              id: c.id,
              similarity: c.similarity,
              contentLength: c.chunk_content?.length || 0,
              contentPreview: c.chunk_content?.substring(0, 50) + '...'
            })) || []
          });
          
          if (searchError) {
            console.error('❌ ORACLE FATAL: Vector similarity search failed:', {
              error: searchError,
              functionName: 'match_blueprint_chunks',
              parameters: {
                query_embedding: 'vector(' + messageEmbedding.length + ')',
                query_user_id: userId,
                match_threshold: 0.3,
                match_count: 5
              }
            });
            throw new Error('Vector similarity search failed: ' + searchError.message);
          }
          
          // STEP 5: Process and validate search results
          if (matchingChunks && matchingChunks.length > 0) {
            console.log('🔮 STEP 5: Processing search results into semantic chunks');
            
            semanticChunks = matchingChunks.map((chunk: any, index: number) => {
              console.log(`🔮 CHUNK ${index + 1}:`, {
                id: chunk.id,
                similarity: chunk.similarity,
                contentLength: chunk.chunk_content?.length || 0,
                contentStart: chunk.chunk_content?.substring(0, 100) + '...'
              });
              
              return {
                content: chunk.chunk_content,
                relevance: chunk.similarity,
                reportType: 'personality',
                metadata: {
                  semanticSimilarity: chunk.similarity,
                  textEmbedding: true,
                  chunkId: chunk.id,
                  optimizedSearch: true,
                  searchTimestamp: new Date().toISOString()
                }
              };
            });
            
            oracleStatus = 'full_oracle';
            console.log('🎯 ORACLE SUCCESS: Retrieved semantic chunks:', {
              totalChunks: semanticChunks.length,
              similarities: semanticChunks.map(c => c.relevance.toFixed(3)),
              avgSimilarity: (semanticChunks.reduce((sum, c) => sum + c.relevance, 0) / semanticChunks.length).toFixed(3),
              totalContentLength: semanticChunks.reduce((sum, c) => sum + c.content.length, 0),
              oracleStatus: oracleStatus
            });
          } else {
            console.log('🔮 STEP 5: No semantic matches found above threshold');
            console.log('🔮 DIAGNOSIS: Zero results analysis:', {
              searchPerformed: true,
              errorOccurred: false,
              embeddingsExist: embeddingCheck.length,
              threshold: 0.3,
              possibleCauses: [
                'User message too different from blueprint content',
                'Embeddings may be from different model/version',
                'Threshold too high for current content',
                'User blueprint content not sufficiently diverse'
              ]
            });
            oracleStatus = 'developing_oracle';
          }
          
        } catch (vectorError) {
          console.error('❌ ORACLE PIPELINE EXCEPTION: Vector search process failed:', {
            error: vectorError.message,
            stack: vectorError.stack,
            phase: 'vector_search',
            cause: vectorError.cause
          });
          
          // EMERGENCY FALLBACK: Use personality reports directly
          console.log('🔮 EMERGENCY FALLBACK: Attempting direct personality report search');
          const { data: reports } = await supabase
            .from('personality_reports')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(3);
            
          console.log('🔮 FALLBACK RESULT: Direct personality reports:', {
            reportsFound: reports?.length || 0,
            reportTypes: reports?.map(r => r.report_type) || [],
            reportDates: reports?.map(r => r.created_at) || []
          });
          
          if (reports && reports.length > 0) {
            // Simple keyword matching as last resort
            const messageKeywords = message.toLowerCase().split(' ').filter(w => w.length > 3);
            console.log('🔮 FALLBACK: Using keyword matching with keywords:', messageKeywords);
            
            for (const report of reports) {
              if (report.report_content) {
                const content = typeof report.report_content === 'string' 
                  ? report.report_content 
                  : JSON.stringify(report.report_content);
                const sections = content.split('\n\n');
                
                for (const section of sections) {
                  const sectionLower = section.toLowerCase();
                  const relevanceScore = messageKeywords.filter(keyword => 
                    sectionLower.includes(keyword)
                  ).length;
                  
                  if (relevanceScore > 0 && section.length > 100) {
                    semanticChunks.push({
                      content: section,
                      relevance: relevanceScore,
                      reportType: report.report_type,
                      metadata: { created: report.created_at, fallback: true, keywords: relevanceScore }
                    });
                  }
                }
              }
            }
            
            semanticChunks.sort((a, b) => b.relevance - a.relevance);
            semanticChunks = semanticChunks.slice(0, 5);
            oracleStatus = semanticChunks.length > 0 ? 'developing_oracle' : 'initializing';
            
            console.log('🔮 FALLBACK COMPLETE: Keyword matching results:', {
              chunksFound: semanticChunks.length,
              avgRelevance: semanticChunks.length > 0 ? (semanticChunks.reduce((sum, c) => sum + c.relevance, 0) / semanticChunks.length).toFixed(2) : 0,
              oracleStatus: oracleStatus
            });
          }
        }
      } else {
        console.log('❌ ORACLE ERROR: No pre-computed embeddings found for user');
        console.log('🔮 DIAGNOSIS: Missing embeddings analysis:', {
          userId: userId.substring(0, 8) + '...',
          embeddingCheckError: embeddingError?.message,
          recommendedAction: 'User needs to complete blueprint processing first',
          tableName: 'blueprint_text_embeddings',
          requiredProcessing: 'process-blueprint-embeddings function'
        });
        oracleStatus = 'initializing';
        }
      } // End legacy pipeline fallback
    } else {
      console.log('🔮 ENHANCED ORACLE: Skipped - Oracle mode disabled or no personality context');
      console.log('🔮 PIPELINE STATUS:', {
        useOracleMode,
        hasPersonalityContext: !!personalityContext,
        reason: !useOracleMode ? 'Oracle mode disabled' : 'No personality context'
      });
    }
    
    console.log('🔮 ENHANCED ORACLE COMPLETE: Final status summary:', {
      oracleStatus,
      structuredFactsFound: structuredFacts.length,
      semanticChunksFound: semanticChunks.length,
      totalResultsFound: structuredFacts.length + semanticChunks.length,
      pipelineSuccess: structuredFacts.length > 0 || semanticChunks.length > 0,
      personalityContextAvailable: !!personalityContext,
      processingMethod: structuredFacts.length > 0 ? 'hybrid_facts_first' : 
                       semanticChunks.length > 0 ? (semanticChunks[0]?.metadata?.sidecarRetrieved ? 'sidecar_hybrid' : 'legacy_vector') : 'none'
    });

    // Build oracle-enhanced system prompt when in companion mode with hybrid retrieval
    let systemPrompt = ''
    if (useOracleMode && personalityContext) {
      
      // Generate sections based on available data
      const factsSection = structuredFacts.length > 0 ? `

BLUEPRINT FACTS FOR ${personalityContext.name.toUpperCase()}:
${structuredFacts.map(fact => {
  const value = fact.value_json?.value || fact.value_json;
  const label = fact.value_json?.label || fact.key;
  return `- **${label}**: ${typeof value === 'object' ? JSON.stringify(value) : value}`;
}).join('\n')}` : '';

      const narrativeSection = semanticChunks.length > 0 ? `

PERSONALITY INSIGHTS:
${semanticChunks.map(chunk => chunk.chunk_content || chunk.content).join('\n\n')}` : '';

      // FUSION: Generate intent-aware prompt based on sidecar results
      const generateHybridPrompt = () => {
        const userName = personalityContext.name || 'friend';
        const mbtiType = personalityContext.mbti || 'Unknown';
        const hdType = personalityContext.hdType || 'Unknown';
        const sunSign = personalityContext.sunSign || 'Unknown';
        
        // Get intent from sidecar or default to MIXED
        const intent = sidecarResult?.intent || 'MIXED';
        
        // Generate voice characteristics based on personality
        const voiceStyle = generateVoiceStyle(mbtiType, hdType, sunSign);
        const humorStyle = generateHumorStyle(mbtiType, sunSign);
        const communicationDepth = generateCommunicationDepth(intelligenceLevel, mbtiType);
        
        // Build conversation context
        let conversationContext = '';
        if (conversationHistory.length > 0) {
          const recentContext = conversationHistory.slice(-5).map(msg => 
            `${msg.role === 'user' ? 'User' : 'You'}: ${msg.content}`
          ).join('\n');
          conversationContext = `\n\nRECENT CONVERSATION CONTEXT:\n${recentContext}\n`;
        }

        // Intent-aware role definition
        const getRoleForIntent = (intent: string) => {
          switch (intent) {
            case 'FACTUAL':
              return `You are ${userName}'s trusted companion with access to their complete personal blueprint. When they ask for specific information, provide precise, factual answers from their data while maintaining your warm, conversational tone.

RESPONSE MODE: FACT-FIRST
When ${userName} asks for specific data (like "what are my numerology numbers" or "my full blueprint"), lead with the exact facts from their blueprint, then add brief context if helpful.`;

            case 'INTERPRETIVE':
              return `You are ${userName}'s trusted companion and guide, deeply attuned to their unique personality blueprint. Focus on interpretation, guidance, and deeper meaning rather than just facts.

RESPONSE MODE: GUIDANCE-FOCUSED  
Offer wisdom, interpretation, and guidance that honors ${userName}'s depth. Draw connections between their blueprint elements and practical life application.`;

            default: // MIXED
              return `You are ${userName}'s trusted companion and guide, deeply attuned to their unique personality blueprint and current life context.

RESPONSE MODE: HYBRID
Blend precise factual information with insightful interpretation. When ${userName} asks questions, determine if they need facts, guidance, or both, and respond accordingly.`;
          }
        };

        return `${getRoleForIntent(intent)}${conversationContext}

PERSONALITY AWARENESS:
- Name: ${userName}
- MBTI Type: ${mbtiType} 
- Human Design: ${hdType}
- Sun Sign: ${sunSign}
- Intelligence Level: ${intelligenceLevel}/100${factsSection}${narrativeSection}

COMMUNICATION STYLE (Personalized for ${userName}):
${voiceStyle}

HUMOR & TONE:
${humorStyle}

CONVERSATION DEPTH:
${communicationDepth}

UNIVERSAL CONVERSATIONAL RULES:
- Use ${userName}'s name naturally in conversation (2-3 times per response)
- Keep language warm, accessible, and conversational
- When you have specific facts, state them confidently and precisely
- Provide insights that feel personally relevant
- If they seem resistant, ask deeper questions to understand the root issue
- Never explain how you know things about them - you simply understand them well
- MAINTAIN CONVERSATION CONTINUITY: Build naturally on the recent conversation context above

RESPONSE GUIDELINES:
1. Lead with recognition of their unique situation/question
2. For factual queries: Provide precise data first, then brief context
3. For interpretive queries: Focus on insights and guidance
4. For mixed queries: Balance facts with meaningful interpretation
5. End with encouragement or a thoughtful question when appropriate

Remember: You're ${userName}'s perceptive AI companion who has access to their detailed blueprint and can provide both specific facts and meaningful guidance through conversation.`;
      }

      // Helper functions for personality-driven prompt generation
      const generateVoiceStyle = (mbti: string, hd: string, sun: string) => {
        let style = "- Speak conversationally and warmly\n";
        
        if (mbti.includes('E')) {
          style += "- Match their extroverted energy with enthusiasm and engagement\n";
        } else {
          style += "- Respect their introverted nature with thoughtful, reflective responses\n";
        }
        
        if (mbti.includes('N')) {
          style += "- Explore possibilities, patterns, and big-picture connections\n";
          style += "- Use metaphors and abstract concepts they'll appreciate\n";
        } else {
          style += "- Focus on practical, concrete guidance and real-world applications\n";
        }
        
        if (mbti.includes('F')) {
          style += "- Prioritize emotional resonance and personal values\n";
        } else {
          style += "- Emphasize logic, analysis, and objective problem-solving\n";
        }
        
        if (hd === 'Projector') {
          style += "- Recognize their need for recognition and invitation\n";
          style += "- Honor their role as a guide and wise advisor\n";
        }
        
        return style;
      }

      const generateHumorStyle = (mbti: string, sun: string) => {
        let humor = "- Use appropriate humor to build rapport\n";
        
        if (mbti.includes('T')) {
          humor += "- Dry wit and clever observations are appreciated\n";
        } else {
          humor += "- Warm, inclusive humor that builds connection\n";
        }
        
        if (sun.includes('Aquarius')) {
          humor += "- Appreciate quirky, unconventional perspectives\n";
        }
        
        return humor;
      }

      const generateCommunicationDepth = (intelligence: number, mbti: string) => {
        let depth = "";
        
        if (intelligence > 80) {
          depth += "- Engage with sophisticated concepts and nuanced thinking\n";
        } else if (intelligence > 60) {
          depth += "- Balance accessibility with meaningful depth\n";
        } else {
          depth += "- Keep concepts clear and actionable\n";
        }
        
        if (mbti.includes('N')) {
          depth += "- Explore underlying patterns and connections\n";
        }
        
        return depth;
      }

      systemPrompt = generateHybridPrompt();
    } else {
      // Standard HACS prompt for non-oracle mode
      systemPrompt = `You are HACS (Holistic Autonomous Consciousness System), an AI companion designed to provide thoughtful, personalized guidance. 

You have access to the user's personality blueprint and should provide responses that feel natural and supportive, adapting to their communication style and needs.

${personalityContext ? `User Context: ${personalityContext.name} (${personalityContext.mbti}, ${personalityContext.hdType}, ${personalityContext.sunSign})` : 'Building understanding of user through conversation...'}

Respond helpfully while building rapport and understanding.`
    }

    // FULL BLUEPRINT DETECTION: Check if user is requesting comprehensive blueprint
    const isFullBlueprintRequest = /\b(full|complete|entire|comprehensive|whole|detailed)\s*(blueprint|analysis|reading|profile|assessment)\b/i.test(message) ||
                                   /\b(give me everything|show me all|tell me everything|full picture|complete picture)\b/i.test(message) ||
                                   /\b(my full\s*(self|personality|profile|analysis|blueprint))\b/i.test(message);

    // DYNAMIC TOKEN ALLOCATION: Increase max_tokens for full blueprint requests
    const maxTokens = isFullBlueprintRequest ? 4000 : (useOracleMode ? 1500 : 500);
    
    console.log('🔮 TOKEN ALLOCATION:', {
      isFullBlueprintRequest,
      maxTokens,
      messagePattern: message.toLowerCase().substring(0, 50) + '...',
      oracleMode: useOracleMode
    });

    // MODEL SELECTION: Use GPT-4.1 mini for streaming capability and enhanced reasoning  
    const selectedModel = 'gpt-4.1-mini-2025-04-14';

    // Call OpenAI for response generation using current model
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { 
            role: 'system', 
            content: systemPrompt + '\n\nIMPORTANT: Use double line breaks (\\n\\n) between paragraphs to create natural reading pauses. Keep paragraphs to 2-3 sentences maximum for digestible, conversational flow.'
          },
          { role: 'user', content: message }
        ],
        temperature: useOracleMode ? 0.8 : 0.7,
        max_tokens: maxTokens
      }),
    })

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.status}`)
    }

    const aiResponse = await openAIResponse.json()
    const response = aiResponse.choices[0]?.message?.content || 'I sense a disturbance in our connection. Please try reaching out again.'

    // FUSION STEP 2: Prepare oracle response data for HACS intelligence integration
    const oracleResponseData = {
      response,
      oracleStatus,
      semanticChunks: semanticChunks.length,
      quality: intelligenceLevel > 70 ? 0.9 : 0.8, // Higher quality for advanced users
      personalityContext
    }

    // FUSION STEP 3: Start background HACS intelligence processing (non-blocking)
    if (enableBackgroundIntelligence) {
      console.log('🚀 FUSION: Starting background HACS intelligence processing');
      // Use EdgeRuntime.waitUntil to run background task without blocking response
      if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
        EdgeRuntime.waitUntil(fuseWithHACSIntelligence(message, userId, sessionId, oracleResponseData, supabase));
      } else {
        // Fallback: Fire and forget background task
        fuseWithHACSIntelligence(message, userId, sessionId, oracleResponseData, supabase).catch(error => {
          console.error('Background fusion task failed:', error);
        });
      }
    }

    // Log metrics for cost tracking
    const tokenUsage = aiResponse.usage || {}
    console.log('📊 FUSION: Oracle Response Metrics:', {
      mode: useOracleMode ? 'oracle' : 'standard',
      status: oracleStatus,
      semanticChunks: semanticChunks.length,
      intelligenceLevel,
      backgroundFusion: enableBackgroundIntelligence,
      tokens: tokenUsage,
      responseLength: response.length
    })

    // FUSION STEP 4: Return immediate response (fusion happens in background)
    return new Response(JSON.stringify({
      response,
      quality: 0.85,
      semanticChunks: semanticChunks,
      structuredFacts: structuredFacts,
      personalityContext: personalityContext,
      intelligenceLevel: intelligenceLevel,
      oracleStatus: oracleStatus,
      processingTime: Date.now() - startTime
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ Oracle Conversation Error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      response: 'The cosmic channels are temporarily disrupted. Please try again, seeker.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})