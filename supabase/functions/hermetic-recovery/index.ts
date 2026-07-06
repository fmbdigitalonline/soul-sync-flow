import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

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
    const { job_id: jobId } = await req.json();
    
    if (!jobId) {
      throw new Error('Missing job_id in request body');
    }
    
    console.log(`🔧 HERMETIC RECOVERY: Attempting recovery for job ${jobId}`);
    
    // Get the completed job with all its data
    const { data: job, error: jobError } = await supabase
      .from('hermetic_processing_jobs')
      .select('*')
      .eq('id', jobId)
      .single();
      
    if (jobError || !job) {
      throw new Error(`Job not found: ${jobError?.message}`);
    }

    // ── STALLED-JOB RESUMER ────────────────────────────────────────
    // If the relay chain died mid-flight, hermetic-recovery doubles as
    // the server-side resumer: re-invoke the orchestrator with the same
    // job_id. Guarded so we don't stampede a live hop.
    if (job.status === 'processing' || job.status === 'pending') {
      const heartbeatMs = job.last_heartbeat ? Date.now() - new Date(job.last_heartbeat).getTime() : Infinity;
      const LIVE_WINDOW_MS = 30_000;   // another hop wrote a heartbeat recently → skip
      const STALL_WINDOW_MS = 90_000;  // no heartbeat in 90s → resume
      if (heartbeatMs < LIVE_WINDOW_MS) {
        console.log(`⏭️ HERMETIC RECOVERY: job ${jobId} is live (heartbeat ${Math.round(heartbeatMs/1000)}s ago) — skipping resume`);
        return new Response(JSON.stringify({ success: true, resumed: false, reason: 'live', heartbeatAgeSec: Math.round(heartbeatMs/1000) }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (heartbeatMs < STALL_WINDOW_MS) {
        console.log(`⏸️ HERMETIC RECOVERY: job ${jobId} within stall grace (${Math.round(heartbeatMs/1000)}s) — not yet resuming`);
        return new Response(JSON.stringify({ success: true, resumed: false, reason: 'grace', heartbeatAgeSec: Math.round(heartbeatMs/1000) }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      console.log(`🔁 HERMETIC RECOVERY: resuming stalled job ${jobId} (last heartbeat ${Math.round(heartbeatMs/1000)}s ago, stage=${job.current_stage}, step=${job.current_step})`);
      const { error: invokeErr } = await supabase.functions.invoke('hermetic-background-orchestrator', {
        body: { job_id: jobId }
      });
      if (invokeErr) {
        console.error(`❌ HERMETIC RECOVERY: orchestrator invoke failed for ${jobId}:`, invokeErr);
        return new Response(JSON.stringify({ success: false, resumed: false, error: invokeErr.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ success: true, resumed: true, heartbeatAgeSec: Math.round(heartbeatMs/1000) }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (job.status !== 'completed') {
      throw new Error(`Job is not completed (status: ${job.status})`);
    }
    
    console.log(`📋 HERMETIC RECOVERY: Job details:`, {
      jobId: job.id,
      status: job.status,
      userId: job.user_id,
      progressPercentage: job.progress_percentage,
      hasResultData: !!job.result_data
    });
    
    // Check if report already exists
    const { data: existingReport } = await supabase
      .from('personality_reports')
      .select('id')
      .eq('user_id', job.user_id)
      .eq('blueprint_version', '2.0')
      .maybeSingle();
      
    if (existingReport) {
      console.log(`✅ HERMETIC RECOVERY: Report already exists: ${existingReport.id}`);
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Report already exists", 
        reportId: existingReport.id 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Get sub-jobs data for report reconstruction
    const { data: subJobs, error: subJobError } = await supabase
      .from('hermetic_sub_jobs')
      .select('*')
      .eq('job_id', jobId)
      .eq('status', 'completed');
      
    if (subJobError) {
      throw new Error(`Failed to fetch sub-jobs: ${subJobError.message}`);
    }
    
    console.log(`📊 HERMETIC RECOVERY: Found ${subJobs?.length || 0} completed sub-jobs`);
    
    // Organize sub-jobs by stage
    const systemSections = subJobs?.filter(sj => sj.stage === 'system_translation') || [];
    const hermeticSections = subJobs?.filter(sj => sj.stage === 'hermetic_laws') || [];
    const gateSections = subJobs?.filter(sj => sj.stage === 'gate_analysis') || [];
    const intelligenceSections = subJobs?.filter(sj => sj.stage === 'intelligence_extraction') || [];
    
    const allSections = [...systemSections, ...hermeticSections, ...gateSections, ...intelligenceSections];
    const totalWordCount = allSections.reduce((total, section) => {
      return total + (section.word_count || 0);
    }, 0);
    
    console.log(`🔍 HERMETIC RECOVERY: Content analysis:`, {
      systemSections: systemSections.length,
      hermeticSections: hermeticSections.length,
      gateSections: gateSections.length,
      intelligenceSections: intelligenceSections.length,
      totalWordCount: totalWordCount
    });
    
    if (totalWordCount < 5000) {
      throw new Error(`Insufficient content for recovery: ${totalWordCount} words (minimum 5,000 required)`);
    }
    
    // Build personality report content
    const personalityReportContent = {
      // Standard personality report sections
      core_personality_pattern: combineRelevantSections(allSections, ['mbti_hermetic_translator', 'mentalism_analyst']),
      decision_making_style: combineRelevantSections(allSections, ['human_design_hermetic_translator', 'causation_analyst']),
      relationship_style: combineRelevantSections(allSections, ['astrology_hermetic_translator', 'polarity_analyst']),
      life_path_purpose: combineRelevantSections(allSections, ['numerology_hermetic_translator', 'correspondence_analyst']),
      current_energy_timing: combineRelevantSections(allSections, ['chinese_astrology_hermetic_translator', 'rhythm_analyst']),
      integrated_summary: `Comprehensive hermetic analysis revealing ${totalWordCount.toLocaleString()} words of deep personality insights with shadow work integration. Recovered from completed processing.`,
      
      // Hermetic Blueprint sections
      hermetic_fractal_analysis: combineRelevantSections(allSections, ['correspondence_analyst', 'mentalism_analyst']),
      consciousness_integration_map: combineRelevantSections(allSections, intelligenceSections.map(s => s.agent_name)),
      practical_activation_framework: combineRelevantSections(allSections, ['vibration_analyst', 'gender_analyst']),
      
      // Seven laws integration
      seven_laws_integration: {
        mentalism: hermeticSections.find(s => s.agent_name === 'mentalism_analyst')?.content || '',
        correspondence: hermeticSections.find(s => s.agent_name === 'correspondence_analyst')?.content || '',
        vibration: hermeticSections.find(s => s.agent_name === 'vibration_analyst')?.content || '',
        polarity: hermeticSections.find(s => s.agent_name === 'polarity_analyst')?.content || '',
        rhythm: hermeticSections.find(s => s.agent_name === 'rhythm_analyst')?.content || '',
        causation: hermeticSections.find(s => s.agent_name === 'causation_analyst')?.content || '',
        gender: hermeticSections.find(s => s.agent_name === 'gender_analyst')?.content || ''
      },
      
      // System translations
      system_translations: {
        mbti_hermetic: systemSections.find(s => s.agent_name === 'mbti_hermetic_translator')?.content || '',
        astrology_hermetic: systemSections.find(s => s.agent_name === 'astrology_hermetic_translator')?.content || '',
        numerology_hermetic: systemSections.find(s => s.agent_name === 'numerology_hermetic_translator')?.content || '',
        human_design_hermetic: systemSections.find(s => s.agent_name === 'human_design_hermetic_translator')?.content || '',
        chinese_astrology_hermetic: systemSections.find(s => s.agent_name === 'chinese_astrology_hermetic_translator')?.content || ''
      },
      
      // Gate analyses (assuming gate_hermetic_analyst content contains multiple gates)
      gate_analyses: gateSections.reduce((gates, section) => {
        gates[`gate_analysis`] = section.content;
        return gates;
      }, {} as any),
      
      // Shadow work integration
      shadow_work_integration: {
        shadow_patterns: combineRelevantSections(allSections, ['polarity_analyst', 'internal_conflicts_analyst']),
        integration_practices: combineRelevantSections(allSections, ['vibration_analyst', 'adaptive_feedback_analyst']),
        transformation_roadmap: combineRelevantSections(allSections, ['rhythm_analyst', 'crisis_handling_analyst'])
      },
      
      blueprint_signature: generateBlueprintSignature(job.blueprint_data),
      word_count: totalWordCount,
      generation_metadata: {
        agents_used: allSections.map(s => s.agent_name),
        total_processing_time: Date.now() - new Date(job.created_at).getTime(),
        hermetic_depth_score: Math.min(100, Math.floor(totalWordCount / 500)),
        gates_analyzed: [],
        intelligence_status: 'recovered',
        intelligence_analysts: intelligenceSections.map(s => s.agent_name),
        recovery_timestamp: new Date().toISOString()
      },
      structured_intelligence: buildStructuredIntelligence(intelligenceSections)
    };

    console.log(`💾 HERMETIC RECOVERY: Saving recovered report with ${totalWordCount} words`);

    // Save to personality_reports table
    const { data: savedReport, error: reportError } = await supabase
      .from('personality_reports')
      .insert({
        user_id: job.user_id,
        blueprint_id: job.blueprint_id || null,
        report_content: personalityReportContent,
        generated_at: job.completed_at || new Date().toISOString(),
        blueprint_version: '2.0',
        structured_intelligence: buildStructuredIntelligence(intelligenceSections)
      })
      .select('id')
      .single();

    if (reportError) {
      throw new Error(`Failed to save recovered report: ${reportError.message}`);
    }

    console.log(`✅ HERMETIC RECOVERY: Successfully recovered and saved report ${savedReport.id}`);
    
    // Update job to indicate recovery was performed
    await supabase
      .from('hermetic_processing_jobs')
      .update({
        current_step: `Report recovered and saved! ${totalWordCount} words generated.`,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);
    
    // PHASE 4: Trigger semantic embedding generation (non-blocking background task)
    console.log('🔮 HERMETIC RECOVERY: Triggering semantic embedding generation...');
    console.log('   └─ User ID:', job.user_id);
    console.log('   └─ Function: process-blueprint-embeddings-v3');
    console.log('   └─ Force Reprocess: true');
    
    EdgeRuntime.waitUntil(
      supabase.functions.invoke('process-blueprint-embeddings-v3', {
        body: { 
          userId: job.user_id,
          forceReprocess: true
        }
      }).then(result => {
        console.log('✅ HERMETIC RECOVERY: Semantic embeddings queued successfully');
        console.log('   └─ Result:', result.data);
      }).catch(err => {
        console.warn('⚠️ HERMETIC RECOVERY: Embedding generation failed (non-critical):', err.message);
      })
    );
      
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Report successfully recovered and saved", 
      reportId: savedReport.id,
      wordCount: totalWordCount 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error(`❌ HERMETIC RECOVERY ERROR:`, error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Helper functions
function combineRelevantSections(allSections: any[], relevantAgents: string[]): string {
  const relevantContent = allSections
    .filter(section => relevantAgents.includes(section.agent_name))
    .map(section => section.content)
    .filter(content => content && content.trim().length > 0);
    
  if (relevantContent.length === 0) {
    return "Analysis section recovered - content may be reorganized from original structure.";
  }
  
  return relevantContent.join('\n\n--- \n\n');
}

function generateBlueprintSignature(blueprint: any): string {
  const mbtiType = blueprint?.cognition_mbti?.type || 'Unknown';
  const hdType = blueprint?.energy_strategy_human_design?.type || 'Unknown';
  const sunSign = blueprint?.archetype_western?.sun_sign || 'Unknown';
  return `${mbtiType}-${hdType}-${sunSign}`.replace(/\s+/g, '-');
}

function buildStructuredIntelligence(intelligenceSections: any[]): any {
  const intelligence: any = {};
  
  intelligenceSections.forEach(section => {
    const dimension = section.agent_name?.replace('_analyst', '') || 'unknown';
    try {
      intelligence[dimension] = JSON.parse(section.content);
    } catch {
      intelligence[dimension] = { analysis: section.content };
    }
  });
  
  return intelligence;
}