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

    // Check for existing extractions
    if (!forceReprocess) {
      const { data: existing, error: existingError } = await supabase
        .from('hermetic_structured_intelligence')
        .select('id')
        .eq('user_id', userId);

      if (existingError) {
        throw new Error(`Failed to check existing extractions: ${existingError.message}`);
      }

      if (existing && existing.length > 0) {
        console.log('✅ HERMETIC INTELLIGENCE EXTRACTOR: Existing extractions found, skipping processing');
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Extractions already exist',
          extracted_count: existing.length 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
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
    
    // Extract key sections with proper type safety
    const extractTextSafely = (content: any): string => {
      if (typeof content === 'string') {
        return content;
      } else if (content && typeof content === 'object') {
        return JSON.stringify(content);
      } else if (content !== null && content !== undefined) {
        return String(content);
      }
      return '';
    };

    const sections = [
      extractTextSafely(reportContent?.core_personality_synthesis),
      extractTextSafely(reportContent?.consciousness_integration_map),
      extractTextSafely(reportContent?.shadow_work_integration), 
      extractTextSafely(reportContent?.seven_laws_integration),
      Array.isArray(reportContent?.gate_analyses) ? reportContent.gate_analyses.join(' ') : extractTextSafely(reportContent?.gate_analyses),
      extractTextSafely(reportContent?.fractal_analysis),
      extractTextSafely(reportContent?.transformative_insights)
    ].filter(section => {
      const text = typeof section === 'string' ? section : String(section);
      return text && text.trim().length > 0;
    });

    const combinedText = sections.join('\n\n').substring(0, 12000); // Limit for OpenAI

    if (combinedText.length < 100) {
      console.warn(`⚠️ HERMETIC INTELLIGENCE EXTRACTOR: Insufficient content in report ${report.id}`);
      return null;
    }

    // Use OpenAI to extract structured intelligence
    const extractionPrompt = `
You are a psychological intelligence extraction agent. From the following hermetic personality report, extract structured psychological data in the following JSON format:

{
  "identity_constructs": {
    "core_narratives": ["narrative 1", "narrative 2"],
    "role_archetypes": ["archetype 1", "archetype 2"],
    "impostor_loops": ["loop 1", "loop 2"],
    "heros_journey_stage": "stage description"
  },
  "behavioral_triggers": {
    "energy_dips": ["trigger 1", "trigger 2"],
    "avoidance_patterns": ["pattern 1", "pattern 2"],
    "thought_loops": ["loop 1", "loop 2"],
    "activation_rituals": ["ritual 1", "ritual 2"]
  },
  "execution_bias": {
    "preferred_style": "style description",
    "completion_patterns": "pattern description",
    "momentum_triggers": ["trigger 1", "trigger 2"],
    "risk_tolerance": "tolerance description"
  },
  "internal_conflicts": {
    "belief_contradictions": ["contradiction 1", "contradiction 2"],
    "emotional_double_binds": ["bind 1", "bind 2"],
    "identity_splits": ["split 1", "split 2"]
  },
  "spiritual_dimension": {
    "philosophical_filters": ["filter 1", "filter 2"],
    "life_meaning_themes": ["theme 1", "theme 2"],
    "faith_model": "model description",
    "integration_themes": ["theme 1", "theme 2"]
  },
  "adaptive_feedback": {
    "reflection_style": ["style 1", "style 2"],
    "feedback_receptivity": "receptivity description",
    "change_resistance_profile": "profile description"
  },
  "temporal_biology": {
    "cognitive_peaks": ["peak 1", "peak 2"],
    "vulnerable_times": ["time 1", "time 2"],
    "biological_rhythms": ["rhythm 1", "rhythm 2"]
  },
  "metacognitive_biases": {
    "dominant_biases": ["bias 1", "bias 2"],
    "self_judgment_heuristics": ["heuristic 1", "heuristic 2"],
    "perception_filters": ["filter 1", "filter 2"]
  },
  "attachment_style": {
    "pattern": "pattern description",
    "repair_tendencies": ["tendency 1", "tendency 2"],
    "authority_archetypes": ["archetype 1", "archetype 2"]
  },
  "goal_archetypes": {
    "orientation": ["orientation 1", "orientation 2"],
    "motivation_structure": "structure description",
    "friction_points": ["point 1", "point 2"]
  },
  "crisis_handling": {
    "default_response": "response description",
    "bounce_back_rituals": ["ritual 1", "ritual 2"],
    "threshold_triggers": ["trigger 1", "trigger 2"]
  },
  "identity_flexibility": {
    "narrative_rigidity": "rigidity description",
    "reinvention_patterns": ["pattern 1", "pattern 2"],
    "fragmentation_signs": ["sign 1", "sign 2"]
  },
  "linguistic_fingerprint": {
    "signature_metaphors": ["metaphor 1", "metaphor 2"],
    "motivational_verbs": ["verb 1", "verb 2"],
    "emotional_syntax": ["syntax 1", "syntax 2"]
  }
}

Extract concrete, specific patterns from the text. If information is not available for a field, use empty arrays or empty strings.

Report content:
${combinedText}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a precise psychological intelligence extraction agent. Return only valid JSON.' },
          { role: 'user', content: extractionPrompt }
        ],
        temperature: 0.3,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const extractedContent = data.choices[0]?.message?.content;

    if (!extractedContent) {
      throw new Error('No content extracted from OpenAI');
    }

    // Parse the JSON response
    const extractedIntelligence = JSON.parse(extractedContent);

    // Add extraction metadata
    const result = {
      ...extractedIntelligence,
      extraction_confidence: 0.85, // Default confidence for AI extraction
      extraction_version: '1.0',
      processing_notes: {
        extraction_method: 'openai_gpt4o_mini',
        content_length: combinedText.length,
        sections_processed: sections.length,
        timestamp: new Date().toISOString()
      }
    };

    console.log(`✨ HERMETIC INTELLIGENCE EXTRACTOR: Successfully extracted intelligence from report ${report.id}`);
    return result;

  } catch (error) {
    console.error(`❌ HERMETIC INTELLIGENCE EXTRACTOR: Failed to extract from report ${report.id}:`, error);
    throw error;
  }
}