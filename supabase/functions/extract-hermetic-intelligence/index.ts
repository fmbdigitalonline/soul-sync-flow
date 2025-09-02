import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔥 HERMETIC INTELLIGENCE EXTRACTOR: Starting batch processing...');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { userId, forceReprocess = false } = await req.json();
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Initialize Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`📊 HERMETIC INTELLIGENCE EXTRACTOR: Processing for user ${userId}, force reprocess: ${forceReprocess}`);

    // For new hermetic reports, always check if intelligence needs to be extracted from the report content
    // Don't skip extraction if report has structured_intelligence but database doesn't have the extraction record
    const { data: existing, error: existingError } = await supabase
      .from('hermetic_structured_intelligence')
      .select('id, personality_report_id')
      .eq('user_id', userId);

    if (existingError) {
      throw new Error(`Failed to check existing extractions: ${existingError.message}`);
    }

    // Get latest report to check if it needs processing
    const { data: latestReport } = await supabase
      .from('personality_reports')
      .select('id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Skip only if not force reprocessing AND existing extractions include the latest report
    if (!forceReprocess && existing && existing.length > 0) {
      const hasLatestReportExtracted = latestReport ? 
        existing.some(ext => ext.personality_report_id === latestReport.id) : true;
      
      if (hasLatestReportExtracted) {
        console.log('✅ HERMETIC INTELLIGENCE EXTRACTOR: Latest report already extracted, skipping processing');
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Latest report already extracted',
          extracted_count: existing.length 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        console.log('🔄 HERMETIC INTELLIGENCE EXTRACTOR: New report detected, proceeding with extraction');
      }
    }

    // Fetch user's hermetic reports
    const { data: reports, error: reportsError } = await supabase
      .from('personality_reports')
      .select('id, user_id, report_content, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (reportsError) {
      throw new Error(`Failed to fetch reports: ${reportsError.message}`);
    }

    if (!reports || reports.length === 0) {
      console.log('ℹ️ HERMETIC INTELLIGENCE EXTRACTOR: No reports found for user');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No reports found',
        extracted_count: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`📋 HERMETIC INTELLIGENCE EXTRACTOR: Found ${reports.length} reports to process`);

    // Delete existing extractions if force reprocessing
    if (forceReprocess) {
      const { error: deleteError } = await supabase
        .from('hermetic_structured_intelligence')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.warn('⚠️ HERMETIC INTELLIGENCE EXTRACTOR: Failed to delete existing extractions:', deleteError);
      } else {
        console.log('🗑️ HERMETIC INTELLIGENCE EXTRACTOR: Deleted existing extractions for reprocessing');
      }
    }

    let extractedCount = 0;
    const errors: string[] = [];

    // Process each report
    for (const report of reports) {
      try {
        console.log(`🔍 HERMETIC INTELLIGENCE EXTRACTOR: Processing report ${report.id}`);

        // Extract structured intelligence using AI
        const extractedIntelligence = await extractIntelligenceFromReport(report);
        
        if (extractedIntelligence) {
          // Store in database
          const { error: insertError } = await supabase
            .from('hermetic_structured_intelligence')
            .insert({
              user_id: report.user_id,
              personality_report_id: report.id,
              ...extractedIntelligence
            });

          if (insertError) {
            throw new Error(`Failed to save extraction: ${insertError.message}`);
          }

          extractedCount++;
          console.log(`✅ HERMETIC INTELLIGENCE EXTRACTOR: Successfully processed report ${report.id}`);
        }

      } catch (reportError) {
        const errorMsg = `Report ${report.id}: ${reportError instanceof Error ? reportError.message : 'Unknown error'}`;
        console.error('❌ HERMETIC INTELLIGENCE EXTRACTOR: Report processing failed:', errorMsg);
        errors.push(errorMsg);
      }
    }

    console.log(`🎉 HERMETIC INTELLIGENCE EXTRACTOR: Batch processing completed. Extracted: ${extractedCount}/${reports.length}`);

    return new Response(JSON.stringify({ 
      success: true,
      extracted_count: extractedCount,
      total_reports: reports.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully extracted intelligence from ${extractedCount} reports`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ HERMETIC INTELLIGENCE EXTRACTOR: Batch processing failed:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown extraction error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

/**
 * Extract structured intelligence from a single hermetic report using OpenAI
 */
async function extractIntelligenceFromReport(report: any) {
  try {
    console.log(`🧠 HERMETIC INTELLIGENCE EXTRACTOR: Analyzing report content for ${report.id}`);

    const reportContent = report.report_content;
    
    // Check if structured intelligence is already available
    if (reportContent?.structured_intelligence) {
      console.log(`✅ Structured intelligence already available for report ${report.id}`);
      
      // Transform existing intelligence to database format
      const structuredIntelligence = reportContent.structured_intelligence;
      
      return {
        identity_constructs: structuredIntelligence.identity_constructs || {},
        behavioral_triggers: structuredIntelligence.behavioral_triggers || {},
        execution_bias: structuredIntelligence.execution_bias || {},
        internal_conflicts: structuredIntelligence.internal_conflicts || {},
        spiritual_dimension: structuredIntelligence.spiritual_dimension || {},
        adaptive_feedback: structuredIntelligence.adaptive_feedback || {},
        temporal_biology: structuredIntelligence.temporal_biology || {},
        metacognitive_biases: structuredIntelligence.metacognitive_biases || {},
        attachment_style: structuredIntelligence.attachment_style || {},
        goal_archetypes: structuredIntelligence.goal_archetypes || {},
        crisis_handling: structuredIntelligence.crisis_handling || {},
        identity_flexibility: structuredIntelligence.identity_flexibility || {},
        linguistic_fingerprint: structuredIntelligence.linguistic_fingerprint || {},
        extraction_confidence: 0.95,
        extraction_version: '2.0',
        processing_notes: { source: 'hermetic_report_generation', method: 'orchestrator_agents' }
      };
    }

    // Fallback: If no structured intelligence exists, log warning
    console.warn(`⚠️ No structured intelligence found in report ${report.id}. This report may be an older version.`);
    return null;

  } catch (error) {
    console.error(`❌ HERMETIC INTELLIGENCE EXTRACTOR: Failed to extract from report ${report.id}:`, error);
    throw error;
  }
}