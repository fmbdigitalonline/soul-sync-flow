import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { userId, forceReprocess = false } = await req.json();
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log('🔄 OFFLINE PROCESSING: Starting blueprint embedding generation', { userId, forceReprocess });

    // Initialize Supabase with service role for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if embeddings already exist for this user
    if (!forceReprocess) {
      const { data: existingEmbeddings, error: checkError } = await supabase
        .from('blueprint_text_embeddings')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (checkError) {
        console.error('❌ Error checking existing embeddings:', checkError);
        throw checkError;
      }

      if (existingEmbeddings && existingEmbeddings.length > 0) {
        console.log('✅ OFFLINE PROCESSING: Embeddings already exist for user', { userId });
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Embeddings already exist',
          embedded_chunks: existingEmbeddings.length
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Get user's personality reports
    const { data: reports, error: reportsError } = await supabase
      .from('personality_reports')
      .select('id, report_content')
      .eq('user_id', userId);

    if (reportsError) {
      console.error('❌ Error fetching personality reports:', reportsError);
      throw reportsError;
    }

    if (!reports || reports.length === 0) {
      console.log('⚠️ OFFLINE PROCESSING: No personality reports found for user', { userId });
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'No personality reports found for user'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('📊 OFFLINE PROCESSING: Found personality reports', { 
      userId, 
      reportCount: reports.length,
      totalContentSize: reports.reduce((size, r) => size + JSON.stringify(r.report_content).length, 0)
    });

    // Clear existing embeddings if reprocessing
    if (forceReprocess) {
      const { error: deleteError } = await supabase
        .from('blueprint_text_embeddings')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('❌ Error clearing existing embeddings:', deleteError);
        throw deleteError;
      }
      console.log('🗑️ OFFLINE PROCESSING: Cleared existing embeddings for reprocessing');
    }

    let totalChunksProcessed = 0;
    let totalEmbeddingsCreated = 0;

    // Process each report
    for (const report of reports) {
      console.log('📖 OFFLINE PROCESSING: Processing report', { reportId: report.id });
      
      // Extract meaningful text content from the report
      const reportContent = JSON.stringify(report.report_content);
      
      // Chunk the content into meaningful sections (target ~500-1000 characters per chunk)
      const chunks = chunkText(reportContent, 800);
      console.log('✂️ OFFLINE PROCESSING: Created text chunks', { 
        reportId: report.id, 
        chunkCount: chunks.length 
      });

      // Process chunks in batches to avoid API rate limits
      const batchSize = 5;
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        console.log(`🔄 OFFLINE PROCESSING: Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(chunks.length/batchSize)}`);

        // Generate embeddings for this batch
        const embeddingPromises = batch.map(async (chunk, batchIndex) => {
          const chunkIndex = i + batchIndex;
          
          try {
            // Generate embedding for this chunk
            const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${openAIApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'text-embedding-3-small',
                input: chunk,
                encoding_format: 'float'
              }),
            });

            if (!embeddingResponse.ok) {
              const errorText = await embeddingResponse.text();
              console.error('❌ OpenAI API error:', embeddingResponse.status, errorText);
              throw new Error(`OpenAI API error: ${embeddingResponse.status}`);
            }

            const embeddingData = await embeddingResponse.json();
            const embedding = embeddingData.data[0].embedding;

            // Create hash for deduplication
            const chunkHash = await createHash(chunk);

            return {
              user_id: userId,
              chunk_content: chunk,
              embedding: embedding,
              source_report_id: report.id,
              chunk_index: chunkIndex,
              chunk_hash: chunkHash
            };
          } catch (error) {
            console.error(`❌ Error processing chunk ${chunkIndex}:`, error);
            throw error;
          }
        });

        // Wait for batch to complete
        const batchResults = await Promise.all(embeddingPromises);
        
        // Insert batch into database
        const { error: insertError } = await supabase
          .from('blueprint_text_embeddings')
          .insert(batchResults);

        if (insertError) {
          console.error('❌ Error inserting embeddings batch:', insertError);
          throw insertError;
        }

        totalEmbeddingsCreated += batchResults.length;
        console.log(`✅ OFFLINE PROCESSING: Inserted batch ${Math.floor(i/batchSize) + 1}, total embeddings: ${totalEmbeddingsCreated}`);

        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      totalChunksProcessed += chunks.length;
    }

    console.log('🎉 OFFLINE PROCESSING: Blueprint embedding generation complete', {
      userId,
      reportsProcessed: reports.length,
      totalChunksProcessed,
      totalEmbeddingsCreated
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Blueprint embeddings generated successfully',
      reports_processed: reports.length,
      chunks_processed: totalChunksProcessed,
      embeddings_created: totalEmbeddingsCreated
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in process-blueprint-embeddings function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'Failed to process blueprint embeddings' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to chunk text into meaningful segments
function chunkText(text: string, targetSize: number): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/);
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;
    
    if (currentChunk.length + trimmedSentence.length > targetSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = trimmedSentence;
    } else {
      currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.filter(chunk => chunk.length > 50); // Filter out very short chunks
}

// Helper function to create a hash for deduplication
async function createHash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}