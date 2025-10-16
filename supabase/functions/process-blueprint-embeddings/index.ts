import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

// Version: 2.1.0-semantic-facets-production-deploy-20251016
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define semantic extraction configuration for hermetic reports
interface ChunkMetadata {
  text: string;
  facet: string;
  heading: string;
  tags: string[];
  paragraphIndex: number;
}

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

    console.log('🔄 SEMANTIC EXTRACTION: Starting intelligent blueprint embedding generation', { userId, forceReprocess });

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
        console.log('✅ SEMANTIC EXTRACTION: Embeddings already exist for user', { userId });
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
      .select('id, report_content, blueprint_version')
      .eq('user_id', userId);

    if (reportsError) {
      console.error('❌ Error fetching personality reports:', reportsError);
      throw reportsError;
    }

    if (!reports || reports.length === 0) {
      console.log('⚠️ SEMANTIC EXTRACTION: No personality reports found for user', { userId });
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'No personality reports found for user'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('📊 SEMANTIC EXTRACTION: Found personality reports', { 
      userId, 
      reportCount: reports.length,
      versions: reports.map(r => r.blueprint_version)
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
      console.log('🗑️ SEMANTIC EXTRACTION: Cleared existing embeddings for reprocessing');
    }

    let totalChunksProcessed = 0;
    let totalEmbeddingsCreated = 0;

    // Process each report
    for (const report of reports) {
      console.log('📖 SEMANTIC EXTRACTION: Processing report', { 
        reportId: report.id, 
        version: report.blueprint_version 
      });
      
      // Extract structured sections with semantic metadata
      const sections = extractSemanticSections(report.report_content, report.blueprint_version);
      
      console.log('🧬 SEMANTIC EXTRACTION: Extracted semantic sections', { 
        reportId: report.id,
        sectionCount: sections.length,
        facets: [...new Set(sections.map(s => s.facet))]
      });

      // Process sections in batches to avoid API rate limits
      const batchSize = 5;
      for (let i = 0; i < sections.length; i += batchSize) {
        const batch = sections.slice(i, i + batchSize);
        console.log(`🔄 SEMANTIC EXTRACTION: Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(sections.length/batchSize)}`);

        // Generate embeddings for this batch
        const embeddingPromises = batch.map(async (section, batchIndex) => {
          const chunkIndex = i + batchIndex;
          
          try {
            // Generate embedding for this section
            const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${openAIApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'text-embedding-3-small',
                input: section.text,
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
            const chunkHash = await createHash(section.text);

            return {
              user_id: userId,
              chunk_content: section.text,
              embedding: embedding,
              source_report_id: report.id,
              chunk_index: chunkIndex,
              chunk_hash: chunkHash,
              facet: section.facet,
              heading: section.heading,
              tags: section.tags,
              paragraph_index: section.paragraphIndex
            };
          } catch (error) {
            console.error(`❌ Error processing section ${chunkIndex}:`, error);
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
        console.log(`✅ SEMANTIC EXTRACTION: Inserted batch ${Math.floor(i/batchSize) + 1}, total embeddings: ${totalEmbeddingsCreated}`);

        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      totalChunksProcessed += sections.length;
    }

    console.log('🎉 SEMANTIC EXTRACTION: Blueprint embedding generation complete', {
      userId,
      reportsProcessed: reports.length,
      totalChunksProcessed,
      totalEmbeddingsCreated
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Blueprint embeddings generated successfully with semantic structure',
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

// Extract semantic sections from personality report with proper metadata
function extractSemanticSections(reportContent: any, blueprintVersion: string): ChunkMetadata[] {
  const sections: ChunkMetadata[] = [];
  let paragraphCounter = 0;

  // Helper to safely extract and chunk text content
  const addSection = (
    content: any,
    facet: string,
    heading: string,
    tags: string[],
    targetSize: number = 1000
  ) => {
    const text = extractTextContent(content);
    if (!text || text.length < 50) return;

    // Chunk long sections intelligently
    const chunks = chunkTextIntelligently(text, targetSize);
    chunks.forEach((chunk, idx) => {
      sections.push({
        text: chunk,
        facet,
        heading: chunks.length > 1 ? `${heading} (Part ${idx + 1})` : heading,
        tags,
        paragraphIndex: paragraphCounter++
      });
    });
  };

  // Core personality sections (present in both standard and hermetic reports)
  if (reportContent.core_personality_pattern) {
    addSection(
      reportContent.core_personality_pattern,
      'core_personality',
      'Core Personality Pattern',
      ['personality', 'identity', 'core_self']
    );
  }

  if (reportContent.decision_making_style) {
    addSection(
      reportContent.decision_making_style,
      'decision_making',
      'Decision Making Style',
      ['cognition', 'decision', 'strategy']
    );
  }

  if (reportContent.relationship_style) {
    addSection(
      reportContent.relationship_style,
      'relationships',
      'Relationship Style',
      ['relationships', 'social', 'interaction']
    );
  }

  if (reportContent.life_path_purpose) {
    addSection(
      reportContent.life_path_purpose,
      'life_path',
      'Life Path & Purpose',
      ['purpose', 'life_path', 'meaning']
    );
  }

  // Hermetic-specific sections (v2.0 reports)
  if (blueprintVersion === '2.0') {
    console.log('🔮 SEMANTIC EXTRACTION: Processing Hermetic v2.0 report sections');

    // Hermetic fractal analysis
    if (reportContent.hermetic_fractal_analysis) {
      addSection(
        reportContent.hermetic_fractal_analysis,
        'hermetic_fractal',
        'Hermetic Fractal Analysis',
        ['hermetic', 'fractal', 'consciousness', 'multidimensional']
      );
    }

    // Seven Hermetic Laws integration
    if (reportContent.seven_laws_integration) {
      const lawNames: Record<string, string> = {
        mentalism: 'Law of Mentalism',
        correspondence: 'Law of Correspondence',
        vibration: 'Law of Vibration',
        polarity: 'Law of Polarity',
        rhythm: 'Law of Rhythm',
        cause_and_effect: 'Law of Cause and Effect',
        gender: 'Law of Gender'
      };

      Object.entries(reportContent.seven_laws_integration).forEach(([lawKey, lawContent]) => {
        if (typeof lawContent === 'string' || typeof lawContent === 'object') {
          addSection(
            lawContent,
            'seven_laws',
            lawNames[lawKey] || `Law of ${lawKey}`,
            ['hermetic', 'seven_laws', lawKey, 'universal_principles']
          );
        }
      });
    }

    // Gate analyses (Human Design gates with shadow work)
    if (reportContent.gate_analyses) {
      Object.entries(reportContent.gate_analyses).forEach(([gateNum, gateContent]) => {
        if (typeof gateContent === 'string' || typeof gateContent === 'object') {
          addSection(
            gateContent,
            'gate_analysis',
            `Gate ${gateNum} Analysis`,
            ['human_design', 'gate', `gate_${gateNum}`, 'shadow_work', 'activation']
          );
        }
      });
    }

    // Shadow work integration
    if (reportContent.shadow_work_integration) {
      Object.entries(reportContent.shadow_work_integration).forEach(([key, content]) => {
        if (typeof content === 'string' || typeof content === 'object') {
          const heading = key.split('_')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
          addSection(
            content,
            'shadow_work',
            heading,
            ['shadow', 'integration', 'transformation', 'self_awareness']
          );
        }
      });
    }

    // Consciousness integration map
    if (reportContent.consciousness_integration_map) {
      addSection(
        reportContent.consciousness_integration_map,
        'consciousness_map',
        'Consciousness Integration Map',
        ['consciousness', 'integration', 'awareness', 'evolution']
      );
    }

    // Practical activation framework
    if (reportContent.practical_activation_framework) {
      addSection(
        reportContent.practical_activation_framework,
        'activation_framework',
        'Practical Activation Framework',
        ['activation', 'practical', 'implementation', 'growth']
      );
    }

    // Current energy timing
    if (reportContent.current_energy_timing) {
      addSection(
        reportContent.current_energy_timing,
        'energy_timing',
        'Current Energy & Timing',
        ['timing', 'energy', 'transits', 'cycles']
      );
    }

    // System translations (MBTI-HD-Hermetic connections)
    if (reportContent.system_translations) {
      addSection(
        reportContent.system_translations,
        'system_translations',
        'System Translations & Bridges',
        ['integration', 'synthesis', 'systems', 'connections']
      );
    }

    // Enhanced Intelligence Analysis (19 Dimensions)
    if (reportContent.enhanced_intelligence_analysis) {
      // If it's an object with dimension keys, extract each dimension
      if (typeof reportContent.enhanced_intelligence_analysis === 'object' && 
          !Array.isArray(reportContent.enhanced_intelligence_analysis)) {
        Object.entries(reportContent.enhanced_intelligence_analysis).forEach(([dimKey, dimContent]) => {
          if (typeof dimContent === 'string' || typeof dimContent === 'object') {
            const heading = dimKey.split('_')
              .map(w => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ');
            addSection(
              dimContent,
              'intelligence_dimension',
              `Intelligence Dimension: ${heading}`,
              ['intelligence', 'analysis', 'dimension', dimKey, 'enhanced']
            );
          }
        });
      } else {
        // If it's a single text block, add as one section
        addSection(
          reportContent.enhanced_intelligence_analysis,
          'intelligence_analysis',
          'Enhanced Intelligence Analysis',
          ['intelligence', 'analysis', 'enhanced', 'multidimensional']
        );
      }
    }
  }

  // Comprehensive overview and integrated summary (present in both versions)
  if (reportContent.comprehensive_overview) {
    addSection(
      reportContent.comprehensive_overview,
      'overview',
      'Comprehensive Overview',
      ['overview', 'summary', 'synthesis']
    );
  }

  if (reportContent.integrated_summary) {
    addSection(
      reportContent.integrated_summary,
      'integrated_summary',
      'Integrated Summary',
      ['summary', 'integration', 'key_insights']
    );
  }

  console.log(`✅ SEMANTIC EXTRACTION: Extracted ${sections.length} semantic sections from ${blueprintVersion} report`);
  return sections;
}

// Extract text content from various formats (string, object, array)
function extractTextContent(content: any): string {
  if (typeof content === 'string') {
    return content.trim();
  }
  
  if (typeof content === 'object' && content !== null) {
    // If it's an array, join elements
    if (Array.isArray(content)) {
      return content
        .map(item => extractTextContent(item))
        .filter(text => text.length > 0)
        .join('\n\n');
    }
    
    // If it's an object, extract text from all values
    const texts: string[] = [];
    for (const value of Object.values(content)) {
      const text = extractTextContent(value);
      if (text.length > 0) {
        texts.push(text);
      }
    }
    return texts.join('\n\n');
  }
  
  return '';
}

// Intelligently chunk text while preserving sentence and paragraph boundaries
function chunkTextIntelligently(text: string, targetSize: number): string[] {
  const chunks: string[] = [];
  
  // Split on paragraph boundaries first
  const paragraphs = text.split(/\n\n+/);
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    const trimmedPara = paragraph.trim();
    if (!trimmedPara) continue;
    
    // If adding this paragraph would exceed target size, save current chunk
    if (currentChunk.length > 0 && currentChunk.length + trimmedPara.length > targetSize) {
      chunks.push(currentChunk.trim());
      currentChunk = trimmedPara;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + trimmedPara;
    }
    
    // If current chunk is already large, save it
    if (currentChunk.length > targetSize * 1.5) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }
  }
  
  // Save remaining content
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  // If no paragraph-based chunking worked, fall back to sentence-based
  if (chunks.length === 0 && text.length > 0) {
    return chunkBySentences(text, targetSize);
  }
  
  return chunks.filter(chunk => chunk.length > 50);
}

// Fallback sentence-based chunking
function chunkBySentences(text: string, targetSize: number): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/);
  let currentChunk = '';
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;
    
    if (currentChunk.length + trimmedSentence.length > targetSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim() + '.');
      currentChunk = trimmedSentence;
    } else {
      currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim() + '.');
  }
  
  return chunks.filter(chunk => chunk.length > 50);
}

// Helper function to create a hash for deduplication
async function createHash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
