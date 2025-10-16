import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

// Version: 3.0.0-async-background-processing-20251016
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

declare const EdgeRuntime: any;

interface ChunkMetadata {
  text: string;
  facet: string;
  heading: string;
  tags: string[];
  paragraphIndex: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, forceReprocess = false } = await req.json();
    
    console.log('🔥 ASYNC BOOTSTRAP: Starting blueprint embeddings processing', { userId, forceReprocess });
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create job record
    const { data: job, error: jobError } = await supabase
      .from('embedding_processing_jobs')
      .insert({
        user_id: userId,
        status: 'pending',
        current_step: 'Initializing background processing'
      })
      .select()
      .single();

    if (jobError || !job) {
      console.error('❌ ASYNC BOOTSTRAP: Failed to create job', jobError);
      throw jobError || new Error('Failed to create job');
    }

    console.log(`✅ ASYNC BOOTSTRAP: Job created with ID ${job.id}`);

    // Start background processing
    const processingPromise = processEmbeddingsInBackground(userId, forceReprocess, job.id);
    
    // Use EdgeRuntime.waitUntil to keep function alive
    if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
      EdgeRuntime.waitUntil(processingPromise);
    } else {
      // Fallback: just start the promise without awaiting
      processingPromise.catch(err => console.error('Background processing error:', err));
    }
    
    // Return success immediately (within 1 second)
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Background processing started',
        jobId: job.id,
        userId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('❌ ASYNC BOOTSTRAP: Request handler error', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Background processing function
async function processEmbeddingsInBackground(userId: string, forceReprocess: boolean, jobId: string) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    console.log('🔄 BACKGROUND TASK: Starting semantic extraction for job', jobId);

    // Update job status
    await supabase
      .from('embedding_processing_jobs')
      .update({
        status: 'processing',
        started_at: new Date().toISOString(),
        current_step: 'Checking existing embeddings'
      })
      .eq('id', jobId);

    // Check if embeddings already exist
    if (!forceReprocess) {
      const { count, error: countError } = await supabase
        .from('blueprint_text_embeddings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (countError) {
        console.error('❌ BACKGROUND TASK: Failed to check existing embeddings', countError);
        throw countError;
      }
      
      if (count && count > 0) {
        console.log(`✅ BACKGROUND TASK: User already has ${count} embeddings, skipping processing`);
        await supabase
          .from('embedding_processing_jobs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            current_step: 'Embeddings already exist',
            processed_chunks: count,
            total_chunks: count,
            progress_percentage: 100
          })
          .eq('id', jobId);
        return;
      }
    }

    // Fetch personality reports for this user
    await supabase
      .from('embedding_processing_jobs')
      .update({ current_step: 'Fetching personality reports', progress_percentage: 5 })
      .eq('id', jobId);

    const { data: reports, error: reportsError } = await supabase
      .from('user_360_profiles')
      .select('id, user_id, report_content, blueprint_version')
      .eq('user_id', userId);
    
    if (reportsError) {
      console.error('❌ BACKGROUND TASK: Failed to fetch personality reports', reportsError);
      throw reportsError;
    }
    
    if (!reports || reports.length === 0) {
      console.log('⚠️ BACKGROUND TASK: No personality reports found for user');
      await supabase
        .from('embedding_processing_jobs')
        .update({
          status: 'failed',
          error_message: 'No personality reports found',
          completed_at: new Date().toISOString()
        })
        .eq('id', jobId);
      return;
    }

    console.log(`📊 BACKGROUND TASK: Found ${reports.length} personality reports to process`);

    // If forceReprocess, delete existing embeddings first
    if (forceReprocess) {
      console.log('🗑️ BACKGROUND TASK: Deleting existing embeddings for reprocessing...');
      await supabase
        .from('embedding_processing_jobs')
        .update({ current_step: 'Deleting old embeddings', progress_percentage: 10 })
        .eq('id', jobId);

      const { error: deleteError } = await supabase
        .from('blueprint_text_embeddings')
        .delete()
        .eq('user_id', userId);
      
      if (deleteError) {
        console.error('❌ BACKGROUND TASK: Failed to delete existing embeddings', deleteError);
        throw deleteError;
      }
      console.log('✅ BACKGROUND TASK: Existing embeddings deleted successfully');
    }

    let totalEmbeddings = 0;

    // Process each report
    for (const report of reports) {
      console.log(`📝 BACKGROUND TASK: Processing report ${report.id}`);
      
      const sections = extractSemanticSections(report.report_content, report.blueprint_version);
      console.log(`📝 BACKGROUND TASK: Processing report ${report.id} with ${sections.length} sections`);
      
      // Update total chunks count
      await supabase
        .from('embedding_processing_jobs')
        .update({
          total_chunks: sections.length,
          current_step: `Processing ${sections.length} semantic sections`,
          progress_percentage: 15
        })
        .eq('id', jobId);

      // Process sections in batches of 5 for embedding generation
      const BATCH_SIZE = 5;
      for (let i = 0; i < sections.length; i += BATCH_SIZE) {
        const batch = sections.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(sections.length / BATCH_SIZE);
        const progress = 15 + Math.floor((i / sections.length) * 75); // 15% to 90%
        
        console.log(`🔄 BACKGROUND TASK: Processing batch ${batchNum}/${totalBatches}`);
        
        // Update progress with heartbeat
        await supabase
          .from('embedding_processing_jobs')
          .update({
            processed_chunks: i,
            progress_percentage: progress,
            current_step: `Processing batch ${batchNum}/${totalBatches}`
          })
          .eq('id', jobId);
        
        // Add 20 second delay between batches to avoid rate limits
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 20000));
        }
        
        // Generate embeddings for batch
        const embeddingPromises = batch.map(async (section, batchIndex) => {
          const chunkIndex = i + batchIndex;
          
          try {
            const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${openAIApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'text-embedding-3-small',
                input: section.text,
              }),
            });

            if (!embeddingResponse.ok) {
              const errorText = await embeddingResponse.text();
              console.error('OpenAI API error:', errorText);
              throw new Error(`OpenAI API error: ${embeddingResponse.status}`);
            }

            const embeddingData = await embeddingResponse.json();
            const embedding = embeddingData.data[0].embedding;
            
            const contentHash = await createHash(section.text);
            
            return {
              user_id: userId,
              source_report_id: report.id,
              chunk_index: chunkIndex,
              chunk_content: section.text,
              chunk_hash: contentHash,
              embedding: embedding,
              facet: section.facet,
              heading: section.heading,
              tags: section.tags,
              paragraph_index: section.paragraphIndex,
            };
          } catch (error) {
            console.error(`Error generating embedding for chunk ${chunkIndex}:`, error);
            throw error;
          }
        });

        const embeddings = await Promise.all(embeddingPromises);
        
        const { error: insertError } = await supabase
          .from('blueprint_text_embeddings')
          .insert(embeddings);

        if (insertError) {
          console.error('Error inserting embeddings:', insertError);
          throw insertError;
        }

        totalEmbeddings += embeddings.length;
        console.log(`✅ BACKGROUND TASK: Inserted batch ${batchNum}, total embeddings: ${totalEmbeddings}`);
      }
    }

    console.log(`🎉 BACKGROUND TASK: Successfully processed all reports. Total embeddings: ${totalEmbeddings}`);
    
    // Mark job as completed
    await supabase
      .from('embedding_processing_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        processed_chunks: totalEmbeddings,
        progress_percentage: 100,
        current_step: 'Processing complete'
      })
      .eq('id', jobId);

    console.log(`✅ BACKGROUND TASK: Job ${jobId} completed successfully`);
    
  } catch (error) {
    console.error('❌ BACKGROUND TASK: Processing failed', error);
    
    // Mark job as failed
    await supabase
      .from('embedding_processing_jobs')
      .update({
        status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);
  }
}

function extractSemanticSections(reportContent: any, blueprintVersion: string): ChunkMetadata[] {
  const chunks: ChunkMetadata[] = [];
  
  const addSection = (text: string, facet: string, heading: string, tags: string[], paragraphIndex: number = 0) => {
    if (!text || text.trim().length < 10) return;
    
    const cleaned = text.trim();
    const maxChunkSize = 1000;
    
    if (cleaned.length <= maxChunkSize) {
      chunks.push({
        text: cleaned,
        facet,
        heading,
        tags,
        paragraphIndex
      });
    } else {
      const subChunks = chunkTextIntelligently(cleaned, maxChunkSize);
      subChunks.forEach((subChunk, i) => {
        chunks.push({
          text: subChunk,
          facet,
          heading: i > 0 ? `${heading} (continued ${i+1})` : heading,
          tags,
          paragraphIndex: paragraphIndex + i
        });
      });
    }
  };

  // Core Personality Facet (MBTI/Cognition)
  if (reportContent?.cognition_mbti) {
    const mbti = reportContent.cognition_mbti;
    addSection(
      extractTextContent(mbti),
      'core_personality',
      `MBTI: ${mbti.type || 'Unknown'}`,
      ['cognition', 'mbti', 'personality_type', mbti.type?.toLowerCase() || 'unknown'],
      0
    );
  }

  // Decision Making Facet (Human Design)
  if (reportContent?.energy_strategy_human_design) {
    const hd = reportContent.energy_strategy_human_design;
    addSection(
      extractTextContent(hd),
      'decision_making',
      `Human Design: ${hd.type || 'Unknown'} - ${hd.authority || 'Unknown'}`,
      ['human_design', 'energy_strategy', 'decision_making', hd.type?.toLowerCase() || 'unknown'],
      0
    );
  }

  // Hermetic Laws
  if (reportContent?.bashar_suite?.hermetic_laws) {
    const laws = reportContent.bashar_suite.hermetic_laws;
    Object.entries(laws).forEach(([lawKey, lawData]: [string, any], idx) => {
      addSection(
        extractTextContent(lawData),
        'hermetic_laws',
        `Hermetic Law: ${lawKey}`,
        ['hermetic_laws', 'universal_principles', lawKey],
        idx
      );
    });
  }

  // Western Astrology (Archetype)
  if (reportContent?.archetype_western) {
    const western = reportContent.archetype_western;
    addSection(
      extractTextContent(western),
      'archetype_western',
      'Western Astrology',
      ['astrology', 'western', 'archetype', 'zodiac'],
      0
    );
  }

  // Chinese Astrology (Archetype)
  if (reportContent?.archetype_chinese) {
    const chinese = reportContent.archetype_chinese;
    addSection(
      extractTextContent(chinese),
      'archetype_chinese',
      'Chinese Astrology',
      ['astrology', 'chinese', 'archetype', 'bazi'],
      0
    );
  }

  // Life Path (Values)
  if (reportContent?.values_life_path) {
    const lifePath = reportContent.values_life_path;
    addSection(
      extractTextContent(lifePath),
      'values_life_path',
      'Life Path',
      ['numerology', 'life_path', 'values', 'purpose'],
      0
    );
  }

  // Timing Overlays
  if (reportContent?.timing_overlays) {
    const timing = reportContent.timing_overlays;
    addSection(
      extractTextContent(timing),
      'timing_overlays',
      'Timing Overlays',
      ['timing', 'transits', 'cycles'],
      0
    );
  }

  // Gate Analyses (if present)
  if (reportContent?.bashar_suite?.gate_analyses) {
    const gates = reportContent.bashar_suite.gate_analyses;
    Object.entries(gates).forEach(([gateKey, gateData]: [string, any], idx) => {
      addSection(
        extractTextContent(gateData),
        'gate_analyses',
        `Gate ${gateKey}`,
        ['human_design', 'gates', gateKey, 'gate_analysis'],
        idx
      );
    });
  }

  return chunks;
}

function extractTextContent(content: any): string {
  if (typeof content === 'string') {
    return content;
  }
  
  if (Array.isArray(content)) {
    return content.map(item => extractTextContent(item)).join('\n');
  }
  
  if (content && typeof content === 'object') {
    return Object.entries(content)
      .map(([key, value]) => {
        if (key === 'keywords' || key === 'tags') {
          return '';
        }
        const extracted = extractTextContent(value);
        return extracted ? `${key}: ${extracted}` : '';
      })
      .filter(Boolean)
      .join('\n');
  }
  
  return String(content || '');
}

function chunkTextIntelligently(text: string, targetSize: number): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/);
  
  let currentChunk = '';
  
  for (const para of paragraphs) {
    if (currentChunk.length + para.length + 2 <= targetSize) {
      currentChunk += (currentChunk ? '\n\n' : '') + para;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      
      if (para.length > targetSize) {
        const subChunks = chunkBySentences(para, targetSize);
        chunks.push(...subChunks);
        currentChunk = '';
      } else {
        currentChunk = para;
      }
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

function chunkBySentences(text: string, targetSize: number): string[] {
  const chunks: string[] = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length <= targetSize) {
      currentChunk += sentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      currentChunk = sentence;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

async function createHash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
