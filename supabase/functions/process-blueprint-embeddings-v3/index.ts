import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChunkMetadata {
  facet: string;
  heading: string;
  content: string;
  tags: string[];
  paragraph_index?: number;
}

// Deployment fingerprint for tracking
const DEPLOYMENT_VERSION = 'v3.0.1-multi-source-20251017-1400Z';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, forceReprocess } = await req.json();
    
    if (!userId) {
      throw new Error('userId is required');
    }

    console.log(`🚀 DEPLOYMENT: ${DEPLOYMENT_VERSION}`);
    console.log('📥 REQUEST: Blueprint embedding processing initiated', { userId, forceReprocess });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create job record
    const { data: job, error: jobError } = await supabase
      .from('embedding_processing_jobs')
      .insert({
        user_id: userId,
        status: 'pending',
        current_step: 'Job created',
        progress_percentage: 0,
      })
      .select()
      .single();

    if (jobError) throw jobError;

    console.log('✅ JOB CREATED:', job.id);

    // Start background processing
    EdgeRuntime.waitUntil(
      processEmbeddingsInBackground(userId, forceReprocess, job.id, supabase, openaiApiKey)
    );

    return new Response(
      JSON.stringify({ 
        success: true, 
        jobId: job.id,
        message: 'Background processing initiated',
        deployment: DEPLOYMENT_VERSION
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ REQUEST FAILED:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processEmbeddingsInBackground(
  userId: string,
  forceReprocess: boolean,
  jobId: string,
  supabase: any,
  openaiApiKey: string
) {
  try {
    console.log('🔄 BACKGROUND TASK: Starting embedding processing', { userId, forceReprocess, jobId });

    // Update job to processing
    await supabase
      .from('embedding_processing_jobs')
      .update({
        status: 'processing',
        started_at: new Date().toISOString(),
        current_step: 'Fetching personality reports',
        progress_percentage: 5,
      })
      .eq('id', jobId);

    // Check existing embeddings
    const { data: existingEmbeddings, error: checkError } = await supabase
      .from('blueprint_text_embeddings')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (checkError) throw checkError;

    if (existingEmbeddings && existingEmbeddings.length > 0 && !forceReprocess) {
      console.log('⚠️ BACKGROUND TASK: Embeddings already exist, skipping', { count: existingEmbeddings.length });
      
      await supabase
        .from('embedding_processing_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          current_step: 'Skipped - embeddings already exist',
          progress_percentage: 100,
        })
        .eq('id', jobId);

      return;
    }

    // ✅ MULTI-SOURCE EXTRACTION: Fetch from all three sources
    console.log('📊 BACKGROUND TASK: Fetching data from multiple sources');

    // Source 1: Hermetic 2.0 reports (structured_intelligence + report_content)
    const { data: hermeticReports, error: hermeticError } = await supabase
      .from('personality_reports')
      .select('id, structured_intelligence, report_content, blueprint_version')
      .eq('user_id', userId)
      .eq('blueprint_version', '2.0');

    if (hermeticError) {
      console.error('❌ BACKGROUND TASK: Failed to fetch Hermetic 2.0 reports', hermeticError);
    } else {
      console.log(`✅ BACKGROUND TASK: Fetched ${hermeticReports?.length || 0} Hermetic 2.0 reports`);
    }

    // Source 2: Standard 1.0 reports (report_content)
    const { data: standardReports, error: standardError } = await supabase
      .from('personality_reports')
      .select('id, report_content, blueprint_version')
      .eq('user_id', userId)
      .not('report_content', 'is', null);

    if (standardError) {
      console.error('❌ BACKGROUND TASK: Failed to fetch Standard 1.0 reports', standardError);
    } else {
      console.log(`✅ BACKGROUND TASK: Fetched ${standardReports?.length || 0} Standard 1.0 reports`);
    }

    // Source 3: User 360 Profile (profile_data)
    const { data: user360, error: user360Error } = await supabase
      .from('user_360_profiles')
      .select('id, profile_data')
      .eq('user_id', userId)
      .single();

    if (user360Error && user360Error.code !== 'PGRST116') {
      console.error('❌ BACKGROUND TASK: Failed to fetch User 360 Profile', user360Error);
    } else if (user360) {
      console.log('✅ BACKGROUND TASK: Fetched User 360 Profile');
    }

    const allReports = [
      ...(hermeticReports || []).map(r => ({ 
        ...r, 
        source_type: 'hermetic_2.0', 
        data: {
          structured_intelligence: r.structured_intelligence,
          ...r.report_content
        }
      })),
      ...(standardReports || []).map(r => ({ ...r, source_type: 'standard_1.0', data: r.report_content })),
      ...(user360 ? [{ id: user360.id, source_type: 'user_360', data: user360.profile_data }] : [])
    ];

    if (allReports.length === 0) {
      throw new Error('No personality reports or profiles found for user');
    }

    console.log(`📋 BACKGROUND TASK: Total sources to process: ${allReports.length}`);

    // Delete existing embeddings if force reprocessing
    if (forceReprocess) {
      console.log('🗑️ BACKGROUND TASK: Deleting existing embeddings');
      
      const { error: deleteError } = await supabase
        .from('blueprint_text_embeddings')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;
      console.log('✅ BACKGROUND TASK: Existing embeddings deleted');
    }

    // Update progress
    await supabase
      .from('embedding_processing_jobs')
      .update({
        current_step: `Processing ${allReports.length} sources`,
        progress_percentage: 15,
      })
      .eq('id', jobId);

    // Process each report
    let totalChunks = 0;
    let processedChunks = 0;
    const allChunks: Array<{ reportId: string; sourceType: string; metadata: ChunkMetadata }> = [];

    // Extract semantic sections from all sources
    for (const report of allReports) {
      console.log(`📖 BACKGROUND TASK: Extracting sections from ${report.source_type} report ${report.id}`);
      
      const sections = extractSemanticSections(report.data, report.source_type);
      console.log(`✅ BACKGROUND TASK: Extracted ${sections.length} sections from ${report.source_type}`);

      for (const section of sections) {
        allChunks.push({
          reportId: report.id,
          sourceType: report.source_type,
          metadata: section
        });
      }
    }

    totalChunks = allChunks.length;
    console.log(`📊 BACKGROUND TASK: Total chunks to process: ${totalChunks}`);

    await supabase
      .from('embedding_processing_jobs')
      .update({
        total_chunks: totalChunks,
        current_step: `Generating embeddings for ${totalChunks} chunks`,
        progress_percentage: 25,
      })
      .eq('id', jobId);

    // Process chunks in batches
    const BATCH_SIZE = 20;
    const batches = [];
    for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
      batches.push(allChunks.slice(i, i + BATCH_SIZE));
    }

    console.log(`🔄 BACKGROUND TASK: Processing ${batches.length} batches`);

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`⏳ BACKGROUND TASK: Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} chunks)`);

      // Generate embeddings for batch
      const embeddingPromises = batch.map(async (chunk) => {
        // ✅ Validate content before sending to OpenAI
        const content = chunk.metadata.content?.trim();
        if (!content || content.length === 0) {
          console.warn(`⚠️ Skipping empty content for facet: ${chunk.metadata.facet}`);
          return null;
        }

        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: content,
          }),
        });

        if (!embeddingResponse.ok) {
          const errorBody = await embeddingResponse.text();
          console.error(`❌ OpenAI API error for facet ${chunk.metadata.facet}: ${embeddingResponse.statusText}`, errorBody);
          throw new Error(`OpenAI API error: ${embeddingResponse.statusText}`);
        }

        const embeddingData = await embeddingResponse.json();
        const embedding = embeddingData.data[0].embedding;

        return {
          reportId: chunk.reportId,
          sourceType: chunk.sourceType,
          metadata: chunk.metadata,
          embedding,
        };
      });

      const embeddingResults = await Promise.all(embeddingPromises);
      
      // ✅ Filter out null results (skipped chunks with empty content)
      const validResults = embeddingResults.filter(r => r !== null);

      // Insert embeddings into database
      const embeddingRecords = validResults.map((result, index) => {
        const hash = `${result.reportId}-${result.metadata.facet}-${result.metadata.heading}-${index}`;
        
        return {
          user_id: userId,
          source_report_id: result.reportId,
          chunk_content: result.metadata.content,
          chunk_index: processedChunks + index,
          chunk_hash: hash,
          embedding: result.embedding,
          facet: result.metadata.facet,
          heading: result.metadata.heading,
          tags: result.metadata.tags,
          paragraph_index: result.metadata.paragraph_index,
          metadata: {
            source_type: result.sourceType,
            deployment_version: DEPLOYMENT_VERSION,
            processed_at: new Date().toISOString()
          }
        };
      });

      const { error: insertError } = await supabase
        .from('blueprint_text_embeddings')
        .insert(embeddingRecords);

      if (insertError) {
        console.error('❌ BACKGROUND TASK: Failed to insert embeddings', insertError);
        throw insertError;
      }

      processedChunks += batch.length;
      const progressPercentage = 25 + Math.floor((processedChunks / totalChunks) * 70);

      await supabase
        .from('embedding_processing_jobs')
        .update({
          processed_chunks: processedChunks,
          current_step: `Processed ${processedChunks}/${totalChunks} chunks`,
          progress_percentage: progressPercentage,
        })
        .eq('id', jobId);

      console.log(`✅ BACKGROUND TASK: Batch ${batchIndex + 1}/${batches.length} complete (${processedChunks}/${totalChunks} total)`);
    }

    // Mark job as completed
    await supabase
      .from('embedding_processing_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        current_step: 'Processing complete',
        progress_percentage: 100,
      })
      .eq('id', jobId);

    console.log(`🎉 BACKGROUND TASK: Processing complete! Generated ${processedChunks} embeddings from ${allReports.length} sources`);

  } catch (error) {
    console.error('❌ BACKGROUND TASK: Processing failed', error);

    await supabase
      .from('embedding_processing_jobs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: error.message,
        current_step: 'Processing failed',
      })
      .eq('id', jobId);
  }
}

function extractSemanticSections(reportContent: any, sourceType: string): ChunkMetadata[] {
  const sections: ChunkMetadata[] = [];

  console.log(`🔍 Extracting semantic sections from ${sourceType}`);

  if (sourceType === 'hermetic_2.0') {
    // PHASE 1: Extract 19 dimensions from structured_intelligence
    if (reportContent.structured_intelligence) {
      const siDimensionTitles: Record<string, string> = {
        adaptive_feedback: 'Adaptive Learning & Feedback Integration',
        attachment_style: 'Attachment & Relationship Patterns',
        behavioral_triggers: 'Behavioral Activation Points',
        career_vocational: 'Career & Vocational Alignment',
        cognitive_functions: 'Cognitive Processing Style',
        compatibility: 'Relational Compatibility Patterns',
        crisis_handling: 'Crisis Response Mechanisms',
        execution_bias: 'Action & Execution Orientation',
        financial_archetype: 'Financial Behavior Patterns',
        goal_archetypes: 'Goal Formation & Achievement',
        health_wellness: 'Health & Wellness Integration',
        identity_constructs: 'Core Identity Framework',
        identity_flexibility: 'Adaptive Identity Capacity',
        internal_conflicts: 'Internal Tension & Conflict Points',
        karmic_patterns: 'Karmic Themes & Life Cycles',
        linguistic_fingerprint: 'Communication & Language Signature',
        metacognitive_biases: 'Meta-Cognitive Patterns',
        spiritual_dimension: 'Spiritual Philosophy & Practice',
        temporal_biology: 'Time Perception & Biological Rhythm'
      };

      for (const [dimension, content] of Object.entries(reportContent.structured_intelligence)) {
        if (content && typeof content === 'object') {
          // ✅ Direct access to .analysis field for Hermetic 2.0 SI dimensions
          const textContent = (content as any).analysis || extractTextContent(content);
          if (textContent && textContent.length > 50) {
            sections.push({
              facet: `si_${dimension}`,
              heading: siDimensionTitles[dimension] || dimension,
              content: textContent,
              tags: ['hermetic_2.0', 'structured_intelligence', dimension, ...extractKeywords(content)]
            });
          }
        }
      }
    }

    // PHASE 2: Extract 18 top-level sections from report_content
    const topLevelTitles: Record<string, string> = {
      life_path_purpose: 'Life Path & Purpose Analysis',
      integrated_summary: 'Integrated Blueprint Summary',
      relationship_style: 'Relationship Dynamics',
      current_energy_timing: 'Current Energy & Timing',
      decision_making_style: 'Decision-Making Framework',
      comprehensive_overview: 'Comprehensive Overview',
      seven_laws_integration: 'Seven Hermetic Laws Integration',
      shadow_work_integration: 'Shadow Work & Integration',
      core_personality_pattern: 'Core Personality Pattern',
      hermetic_fractal_analysis: 'Hermetic Fractal Analysis',
      consciousness_integration_map: 'Consciousness Integration Map',
      practical_activation_framework: 'Practical Activation Framework',
      gate_analyses: 'Human Design Gate Analyses'
    };

    for (const [section, content] of Object.entries(reportContent)) {
      // Skip structured_intelligence (already processed above)
      // Skip metadata sections
      if (section === 'structured_intelligence' || 
          section === 'word_count' || 
          section === 'blueprint_signature' || 
          section === 'generation_metadata') {
        continue;
      }

      // ✅ SPECIAL HANDLING: gate_analyses contains multiple gates, process each separately
      if (section === 'gate_analyses' && content && typeof content === 'object') {
        console.log('🔍 Processing gate_analyses: Breaking into individual gates');
        
        for (const [gateKey, gateContent] of Object.entries(content)) {
          const gateText = extractTextContent(gateContent);
          if (gateText.length > 50) {
            sections.push({
              facet: 'gate_analysis',
              heading: `Human Design Gate ${gateKey}`,
              content: gateText,
              tags: ['hermetic_2.0', 'gate_analysis', `gate_${gateKey}`]
            });
          }
        }
        continue; // Skip to next section
      }

      // ✅ SPECIAL HANDLING: shadow_work_integration has 3 sub-sections
      if (section === 'shadow_work_integration' && content && typeof content === 'object') {
        console.log('🔍 Processing shadow_work_integration: Breaking into sub-sections');
        
        const shadowTitles: Record<string, string> = {
          shadow_patterns: 'Shadow Patterns Analysis',
          integration_practices: 'Integration Practices',
          transformation_roadmap: 'Transformation Roadmap'
        };
        
        for (const [subKey, subContent] of Object.entries(content)) {
          const subText = extractTextContent(subContent);
          if (subText.length > 50) {
            sections.push({
              facet: 'shadow_work',
              heading: shadowTitles[subKey] || `Shadow Work: ${subKey}`,
              content: subText,
              tags: ['hermetic_2.0', 'shadow_work', subKey]
            });
          }
        }
        continue;
      }

      // ✅ SPECIAL HANDLING: seven_laws_integration has 7 Hermetic Laws
      if (section === 'seven_laws_integration' && content && typeof content === 'object') {
        console.log('🔍 Processing seven_laws_integration: Breaking into individual laws');
        
        const lawTitles: Record<string, string> = {
          mentalism: 'Law of Mentalism',
          correspondence: 'Law of Correspondence',
          vibration: 'Law of Vibration',
          polarity: 'Law of Polarity',
          rhythm: 'Law of Rhythm',
          gender: 'Law of Gender',
          causation: 'Law of Cause & Effect'
        };
        
        for (const [lawKey, lawContent] of Object.entries(content)) {
          const lawText = extractTextContent(lawContent);
          if (lawText.length > 50) {
            sections.push({
              facet: 'hermetic_law',
              heading: lawTitles[lawKey] || `Hermetic Law: ${lawKey}`,
              content: lawText,
              tags: ['hermetic_2.0', 'hermetic_laws', lawKey]
            });
          }
        }
        continue;
      }

      // ✅ SPECIAL HANDLING: system_translations has 5 translation mappings
      if (section === 'system_translations' && content && typeof content === 'object') {
        console.log('🔍 Processing system_translations: Breaking into individual translations');
        
        const translationTitles: Record<string, string> = {
          mbti_hermetic: 'MBTI to Hermetic Translation',
          astrology_hermetic: 'Astrology to Hermetic Translation',
          numerology_hermetic: 'Numerology to Hermetic Translation',
          human_design_hermetic: 'Human Design to Hermetic Translation',
          chinese_astrology_hermetic: 'Chinese Astrology to Hermetic Translation'
        };
        
        for (const [transKey, transContent] of Object.entries(content)) {
          const transText = extractTextContent(transContent);
          if (transText.length > 50) {
            sections.push({
              facet: 'system_translation',
              heading: translationTitles[transKey] || `Translation: ${transKey}`,
              content: transText,
              tags: ['hermetic_2.0', 'translations', transKey]
            });
          }
        }
        continue;
      }

      let textContent = '';
      
      // ✅ Handle both strings and objects for top-level sections
      if (typeof content === 'string') {
        textContent = content.trim();
      } else if (content && typeof content === 'object') {
        textContent = extractTextContent(content);
      }
      
      if (textContent.length > 50) {
        // ✅ Smart chunking for large string sections
        const chunks = chunkTextIntelligently(textContent, 15000);
        
        chunks.forEach((chunk, index) => {
          sections.push({
            facet: section,
            heading: topLevelTitles[section] || section,
            content: chunk,
            tags: ['hermetic_2.0', 'report_content', section, ...extractKeywords(content)],
            paragraph_index: chunks.length > 1 ? index : undefined
          });
        });
      }
    }


  } else if (sourceType === 'standard_1.0') {
    // Standard 1.0: Extract from traditional facets in report_content
    const facetTitles: Record<string, string> = {
      cognition_mbti: 'Cognitive Functions (MBTI)',
      energy_strategy_human_design: 'Energy Strategy (Human Design)',
      archetype_western: 'Western Astrology',
      archetype_chinese: 'Chinese Astrology',
      bashar_suite: 'Bashar Framework',
      values_life_path: 'Life Path & Values',
      timing_overlays: 'Timing & Cycles',
      user_meta: 'User Metadata'
    };

    for (const [facet, content] of Object.entries(reportContent)) {
      if (content && typeof content === 'object') {
        const textContent = extractTextContent(content);
        if (textContent.length > 50) {
          sections.push({
            facet: facet,
            heading: facetTitles[facet] || facet,
            content: textContent,
            tags: extractKeywords(content)
          });
        }
      }
    }

  } else if (sourceType === 'user_360') {
    // User 360 Profile: Extract aggregated profile data
    const textContent = extractTextContent(reportContent);
    if (textContent.length > 50) {
      sections.push({
        facet: 'user_360_aggregated',
        heading: 'Complete Profile Overview',
        content: textContent,
        tags: ['comprehensive', 'user_360', 'aggregated']
      });
    }
  }

  console.log(`✅ Extracted ${sections.length} sections from ${sourceType}`);
  return sections;
}

function chunkTextIntelligently(text: string, targetSize: number = 15000): string[] {
  // If text is under threshold, return as-is
  if (text.length <= targetSize) {
    return [text];
  }

  console.log(`⚠️ Text exceeds ${targetSize} chars (${text.length}), chunking intelligently`);
  
  // Split by double newlines (paragraphs)
  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const para of paragraphs) {
    // If adding this paragraph would exceed target, save current chunk
    if (currentChunk.length + para.length > targetSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = para;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + para;
    }
  }

  // Add final chunk
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  console.log(`✅ Chunked into ${chunks.length} pieces`);
  return chunks;
}

function extractTextContent(content: any): string {
  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map(item => extractTextContent(item))
      .filter(text => text.length > 0)
      .join(' ');
  }

  if (content && typeof content === 'object') {
    const excludeKeys = ['keywords', 'tags', 'metadata'];
    return Object.entries(content)
      .filter(([key]) => !excludeKeys.includes(key))
      .map(([_, value]) => extractTextContent(value))
      .filter(text => text.length > 0)
      .join(' ');
  }

  return '';
}

function extractKeywords(content: any): string[] {
  const keywords: string[] = [];

  if (content && typeof content === 'object') {
    if (content.keywords && Array.isArray(content.keywords)) {
      keywords.push(...content.keywords);
    }
    if (content.tags && Array.isArray(content.tags)) {
      keywords.push(...content.tags);
    }
    if (content.type && typeof content.type === 'string') {
      keywords.push(content.type);
    }
  }

  return [...new Set(keywords)];
}
