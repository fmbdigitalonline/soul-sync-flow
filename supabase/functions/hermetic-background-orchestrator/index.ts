import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  buildObservationPrompt,
  buildSynthesisPrompt,
  buildNarrationPrompt,
  buildNarrationPlan,
  lensBriefFor,
  normaliseLensReport,
  parseJsonLoosely,
  setByPath,
  type LensReport,
} from './observation-pipeline.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Agent arrays for each stage
const SYSTEM_TRANSLATORS = [
  'mbti_hermetic_translator',
  'astrology_hermetic_translator',
  'numerology_hermetic_translator', 
  'human_design_hermetic_translator',
  'chinese_astrology_hermetic_translator'
];

const HERMETIC_AGENTS = [
  'mentalism_analyst',
  'correspondence_analyst', 
  'vibration_analyst',
  'polarity_analyst',
  'rhythm_analyst',
  'causation_analyst',
  'gender_analyst'
];

const INTELLIGENCE_EXTRACTION_AGENTS = [
  'identity_constructs_analyst',
  'behavioral_triggers_analyst',
  'execution_bias_analyst',
  'internal_conflicts_analyst',
  'spiritual_dimension_analyst',
  'adaptive_feedback_analyst',
  'temporal_biology_analyst',
  'metacognitive_biases_analyst',
  'attachment_style_analyst',
  'goal_archetypes_analyst',
  'crisis_handling_analyst',
  'identity_flexibility_analyst',
  'linguistic_fingerprint_analyst',
  'cognitive_functions_analyst',
  'career_vocational_analyst',
  'health_wellness_analyst',
  'compatibility_analyst',
  'financial_archetype_analyst',
  'karmic_patterns_analyst'
];

// ============ RELAY RACE ORCHESTRATOR ============
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
    
    console.log(`🚀 Relay orchestrator invoked for job ${jobId}`);
    
    // 1. Get the job's CURRENT state from the database
    const { data: job, error: jobError } = await supabase
      .from('hermetic_processing_jobs')
      .select('*')
      .eq('id', jobId)
      .single();
      
    if (jobError || !job) {
      throw new Error(`Job not found or error fetching: ${jobError?.message}`);
    }
    
    if (job.status === 'completed' || job.status === 'failed') {
      console.log(`Job ${jobId} is already completed or failed. Stopping.`);
      return new Response(JSON.stringify({ message: "Job already finalized." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 2. Determine the next step to perform based on the job's state
    let nextStage = job.current_stage;
    let nextStepIndex = job.current_step_index;
    let progressPercentage = 0;
    
    // CRITICAL: Enhanced zombie detection and recovery
    console.log(`🔍 CURRENT JOB STATE:`, {
      jobId,
      status: job.status,
      currentStage: job.current_stage,
      stepIndex: job.current_step_index,
      lastHeartbeat: job.last_heartbeat,
      progressPercentage: job.progress_percentage
    });
    
    // Check for existing sub-jobs to validate actual progress
    const { data: existingSubJobs, error: subJobError } = await supabase
      .from('hermetic_sub_jobs')
      .select('agent_name, status, word_count')
      .eq('job_id', jobId);
      
    if (subJobError) {
      console.error(`❌ Failed to check existing sub-jobs:`, subJobError);
    } else {
      console.log(`📋 EXISTING SUB-JOBS:`, {
        count: existingSubJobs?.length || 0,
        completed: existingSubJobs?.filter(sj => sj.status === 'completed').length || 0,
        agents: existingSubJobs?.map(sj => sj.agent_name) || []
      });
    }

    // A job that was mid-flight when this function was replaced cannot be
    // resumed: its stored sections are prose with no observations, and one of
    // its stages no longer exists. Left alone it either dies on an unknown
    // stage or reaches a synthesis with nothing to read — both of which look
    // to a waiting user exactly like "stuck".
    //
    // Restarting it is the honest repair. The lens stages are cheap now, the
    // user has already been told a deep blueprint is being woven, and a job
    // that silently produces a worse report is worse than one that takes the
    // long way round.
    const carriesProseSections = [
      ...(job.progress_data?.system_sections || []),
      ...(job.progress_data?.hermetic_sections || []),
      ...(job.progress_data?.gate_sections || []),
      ...(job.progress_data?.intelligence_sections || []),
    ].some((s: any) => typeof s?.content === 'string' && !s?.observations);

    if (job.current_stage === 'synthesis_integration' || carriesProseSections) {
      console.warn(`♻️ MIGRATION: job ${jobId} predates the v3 pipeline (stage=${job.current_stage}, prose=${carriesProseSections}). Restarting it.`);

      await supabase.from('hermetic_sub_jobs').delete().eq('job_id', jobId);
      await supabase
        .from('hermetic_processing_jobs')
        .update({
          current_stage: 'system_translation',
          current_step_index: 0,
          progress_data: {},
          progress_percentage: 0,
          status: 'processing',
          current_step: 'Restarted on the current pipeline',
          error_message: null,
          last_heartbeat: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      await supabase.functions.invoke('hermetic-background-orchestrator', { body: { job_id: jobId } });

      return new Response(JSON.stringify({ success: true, message: 'Job restarted on the current pipeline.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- RELAY RACE STATE MACHINE ---
    //
    // Same relay, different work. The four observation stages are cheap and fast
    // now — a lens reports structure, it does not write an essay — so the
    // progress budget shifts to narration, which is where the words are.
    if (job.current_stage === 'system_translation') {
      const translator = SYSTEM_TRANSLATORS[job.current_step_index];
      await processLensObservation(job, translator, 'system_translation');
      progressPercentage = (job.current_step_index + 1) * 8 / SYSTEM_TRANSLATORS.length;

      if (job.current_step_index + 1 >= SYSTEM_TRANSLATORS.length) {
        nextStage = 'hermetic_laws';
        nextStepIndex = 0;
        progressPercentage = 8;
      } else {
        nextStepIndex = job.current_step_index + 1;
      }

    } else if (job.current_stage === 'hermetic_laws') {
      const agent = HERMETIC_AGENTS[job.current_step_index];
      await processLensObservation(job, agent, 'hermetic_laws');
      progressPercentage = 8 + (job.current_step_index + 1) * 10 / HERMETIC_AGENTS.length;

      if (job.current_step_index + 1 >= HERMETIC_AGENTS.length) {
        nextStage = 'gate_analysis';
        nextStepIndex = 0;
        progressPercentage = 18;
      } else {
        nextStepIndex = job.current_step_index + 1;
      }

    } else if (job.current_stage === 'gate_analysis') {
      const gates = extractGatesFromBlueprint(job.blueprint_data);
      const gateNumber = gates[job.current_step_index];

      if (!gateNumber) {
        console.log(`⚠️ No gate at index ${job.current_step_index}, moving on`);
        nextStage = 'intelligence_extraction';
        nextStepIndex = 0;
        progressPercentage = 35;
      } else {
        await processLensObservation(job, `gate_${gateNumber}`, 'gate_analysis', gateNumber);
        progressPercentage = 18 + (job.current_step_index + 1) * 17 / gates.length;

        if (job.current_step_index + 1 >= gates.length) {
          nextStage = 'intelligence_extraction';
          nextStepIndex = 0;
          progressPercentage = 35;
        } else {
          nextStepIndex = job.current_step_index + 1;
        }
      }

    } else if (job.current_stage === 'intelligence_extraction') {
      const agent = INTELLIGENCE_EXTRACTION_AGENTS[job.current_step_index];
      await processLensObservation(job, agent, 'intelligence_extraction');
      progressPercentage = 35 + (job.current_step_index + 1) * 15 / INTELLIGENCE_EXTRACTION_AGENTS.length;

      if (job.current_step_index + 1 >= INTELLIGENCE_EXTRACTION_AGENTS.length) {
        nextStage = 'cross_framework_synthesis';
        nextStepIndex = 0;
        progressPercentage = 50;
      } else {
        nextStepIndex = job.current_step_index + 1;
      }

    } else if (job.current_stage === 'cross_framework_synthesis') {
      // One step, and the pivot of the whole pipeline: every lens read at once.
      await processCrossFrameworkSynthesis(job);
      nextStage = 'twin_narration';
      nextStepIndex = 0;
      progressPercentage = 55;

    } else if (job.current_stage === 'twin_narration') {
      const plan = buildNarrationPlan(extractGatesFromBlueprint(job.blueprint_data));
      await processNarrationSection(job, job.current_step_index, job.language);
      progressPercentage = 55 + (job.current_step_index + 1) * 42 / plan.length;

      if (job.current_step_index + 1 >= plan.length) {
        nextStage = 'final_assembly';
        nextStepIndex = 0;
        progressPercentage = 97;
      } else {
        nextStepIndex = job.current_step_index + 1;
      }

    } else if (job.current_stage === 'final_assembly') {
      console.log(`Finalizing report for job ${jobId}`);
      await finalizeReport(job);

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Processing complete." 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else {
      throw new Error(`Unknown stage: ${job.current_stage}`);
    }

    // 3. Update the job state for the NEXT step
    await supabase
      .from('hermetic_processing_jobs')
      .update({
        current_stage: nextStage,
        current_step_index: nextStepIndex,
        status: 'processing',
        current_step: `Queued for ${nextStage} - step ${nextStepIndex}`,
        progress_percentage: progressPercentage,
        last_heartbeat: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    // 4. CRITICAL: Trigger the next step by invoking itself (fire-and-forget) with recovery
    console.log(`🔄 Triggering next step: ${nextStage}[${nextStepIndex}] for job ${jobId}`);
    
    // Enhanced recovery mechanism: Try immediate invocation, then delayed fallback
    try {
      await supabase.functions.invoke('hermetic-background-orchestrator', {
        body: { job_id: jobId }
      });
      console.log(`✅ Successfully triggered next step for job ${jobId}`);
    } catch (error) {
      console.error(`❌ Failed to trigger next step for job ${jobId}:`, error);
      
      // Fallback: Set up delayed retry (will be picked up by recovery mechanisms)
      await supabase
        .from('hermetic_processing_jobs')
        .update({
          current_step: `${nextStage}[${nextStepIndex}] - retry pending`,
          error_message: `Self-invocation failed: ${error.message} - retry will be attempted`,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);
        
      console.log(`🔄 Marked job ${jobId} for recovery retry`);
    }

    console.log(`✅ Step completed, next step queued: ${nextStage}[${nextStepIndex}]`);

  } catch (error) {
    // Enhanced error handling with recovery context
    let errorJobId: string | undefined;
    let originalRequestBody: any;
    
    try {
      originalRequestBody = await req.clone().json();
      errorJobId = originalRequestBody?.job_id;
    } catch {
      console.error('❌ Could not parse request body for error handling');
    }
    
    console.error(`❌ Orchestrator failed for job ${errorJobId || 'unknown'}:`, {
      error: error.message,
      stack: error.stack,
      jobId: errorJobId,
      requestBody: originalRequestBody
    });
    
    if (errorJobId) {
      // Enhanced error logging similar to client service
      const errorUpdate = {
        status: 'failed',
        current_step: `Error: ${error.message}`,
        error_message: `Processing failed at step: ${error.message}. Check logs for recovery options.`,
        updated_at: new Date().toISOString()
      };
      
      try {
        await supabase
          .from('hermetic_processing_jobs')
          .update(errorUpdate)
          .eq('id', errorJobId);
          
        console.log(`✅ Error state saved for job ${errorJobId} - job can be recovered`);
      } catch (updateError) {
        console.error(`❌ Failed to update error state for job ${errorJobId}:`, updateError);
      }
    }
  }
  
  // 5. Return SUCCESS response IMMEDIATELY (under 5 seconds)
  return new Response(JSON.stringify({ 
    success: true, 
    message: "Step triggered." 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});

// ============ SINGLE STEP PROCESSORS ============
//
// One processor per ROLE, not one per agent. Every lens runs the same code
// because every lens now has the same job: look through its own framework and
// report what it sees. What differs between them is the brief, and a brief is
// data. The five near-identical prose processors this replaces differed mainly
// in which 1100-1500 word portrait they asked for.

const OBSERVATION_STAGES: Record<string, string> = {
  system_translation: 'system_sections',
  hermetic_laws: 'hermetic_sections',
  gate_analysis: 'gate_sections',
  intelligence_extraction: 'intelligence_sections',
};

async function callAgent(systemPrompt: string, userPrompt: string, label: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('openai-agent', {
    body: {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'gpt-4.1-mini-2025-04-14',
    },
  });

  if (error) throw new Error(`Agent call failed for ${label}: ${error.message}`);
  const content = (data?.content ?? '').trim();
  if (!content) throw new Error(`${label} returned empty content`);
  return content;
}

/** Persists one completed step to both the job's progress_data and sub-jobs. */
async function recordStep(
  job: any,
  sectionsKey: string,
  section: Record<string, any>,
  stage: string,
  agentName: string,
  narrationWords: number,
) {
  const progressData = job.progress_data || {};
  const sections = progressData[sectionsKey] || [];
  sections.push(section);

  const merged = { ...progressData, [sectionsKey]: sections };
  job.progress_data = merged; // keep the in-memory job current for later steps

  await supabase
    .from('hermetic_processing_jobs')
    .update({ progress_data: merged, last_heartbeat: new Date().toISOString() })
    .eq('id', job.id);

  const { error: upsertError } = await supabase
    .from('hermetic_sub_jobs')
    .upsert({
      job_id: job.id,
      user_id: job.user_id,
      agent_name: agentName,
      stage,
      status: 'completed',
      content: JSON.stringify(section),
      word_count: narrationWords,
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'job_id,agent_name' });

  if (upsertError) {
    console.error(`❌ Failed to store sub-job for ${agentName}:`, upsertError);
    throw new Error(`Sub-job storage failed: ${upsertError.message}`);
  }
}

/**
 * One lens, looking through its own framework.
 *
 * A lens that fails to return usable JSON is recorded as failed and the run
 * continues. Losing one instrument out of thirty is survivable — the synthesis
 * reads whatever reported — but it must never be silent, so the failure is
 * logged, stored, and surfaced in the report's generation_metadata.
 */
async function processLensObservation(
  job: any,
  agent: string,
  stage: string,
  gateNumber?: number,
) {
  const { id: jobId, blueprint_data: blueprint } = job;
  const sectionsKey = OBSERVATION_STAGES[stage];
  const label = gateNumber ? `Gate ${gateNumber}` : agent.replace(/_(analyst|hermetic_translator)$/, '').replace(/_/g, ' ');

  await updateJobStatus(jobId, 'processing', `Observing through ${label}...`);

  const brief = gateNumber
    ? `Human Design Gate ${gateNumber} specifically — what this one gate contributes and nothing beyond it`
    : lensBriefFor(agent, label);

  const systemPrompt = buildObservationPrompt(label, brief);
  const userPrompt = `BLUEPRINT:\n${JSON.stringify(blueprint, null, 2)}`;

  let report: LensReport | null = null;
  let lastRaw = '';

  for (let attempt = 1; attempt <= 2 && !report; attempt++) {
    const raw = await callAgent(
      attempt === 1 ? systemPrompt : `${systemPrompt}\n\nYour previous reply was not valid JSON. Return the JSON object only.`,
      userPrompt,
      label,
    );
    lastRaw = raw;
    const parsed = parseJsonLoosely<any>(raw);
    if (parsed) {
      const normalised = normaliseLensReport(parsed, label);
      if (normalised.observations.length > 0) report = normalised;
    }
    if (!report) console.warn(`⚠️ ${label} did not return usable observations (attempt ${attempt})`);
  }

  const failed = !report;
  if (failed) {
    console.error(`❌ ${label} produced no observations after 2 attempts. Raw head: ${lastRaw.slice(0, 300)}`);
  }

  await recordStep(job, sectionsKey, {
    agent_type: agent,
    ...(gateNumber ? { gate_number: gateNumber } : {}),
    observations: report?.observations ?? [],
    tensions: report?.tensions ?? [],
    absences: report?.absences ?? [],
    ...(failed ? { parse_failed: true } : {}),
  }, stage, agent, 0);

  console.log(`✅ ${label}: ${report?.observations.length ?? 0} observations, ${report?.tensions.length ?? 0} tensions, ${report?.absences.length ?? 0} absences`);
}

/**
 * The one step that reads every lens at once. This is where the person stops
 * being a stack of framework readouts and becomes a model.
 */
async function processCrossFrameworkSynthesis(job: any) {
  const { id: jobId, progress_data } = job;

  await updateJobStatus(jobId, 'processing', 'Relating the lenses to each other...');

  const allLenses = [
    ...(progress_data?.system_sections || []),
    ...(progress_data?.hermetic_sections || []),
    ...(progress_data?.gate_sections || []),
    ...(progress_data?.intelligence_sections || []),
  ].filter((s: any) => (s.observations || []).length > 0);

  if (allLenses.length === 0) {
    throw new Error('Synthesis has nothing to read — every lens failed to produce observations');
  }

  // The full observations, not a truncation. The old synthesis read
  // content.substring(0, 800) of each specialist's prose, which is why it could
  // only ever reflect openings back.
  const lensInput = allLenses.map((s: any) => ({
    lens: s.agent_type,
    ...(s.gate_number ? { gate: s.gate_number } : {}),
    observations: s.observations,
    tensions: s.tensions,
    absences: s.absences,
  }));

  const raw = await callAgent(
    buildSynthesisPrompt(),
    `LENS REPORTS:\n${JSON.stringify(lensInput, null, 2)}`,
    'cross-framework synthesis',
  );

  const parsed = parseJsonLoosely<any>(raw);
  if (!parsed || !Array.isArray(parsed.syntheses)) {
    throw new Error('Cross-framework synthesis did not return usable JSON');
  }

  // The anti-repetition guard, enforced rather than requested: anything only
  // one lens saw is a lens observation, not a synthesis, and restating it here
  // is exactly how thirty-one portraits became eighty-five percent identical.
  const accepted = parsed.syntheses.filter((s: any) => Array.isArray(s?.lenses) && s.lenses.length >= 2);
  const dropped = parsed.syntheses.length - accepted.length;
  if (dropped > 0) console.warn(`⚠️ SYNTHESIS: dropped ${dropped} single-lens entries`);

  const byMechanism = accepted.reduce((acc: Record<string, number>, s: any) => {
    acc[s.mechanism || 'unnamed'] = (acc[s.mechanism || 'unnamed'] || 0) + 1;
    return acc;
  }, {});
  console.log('🧩 SYNTHESIS:', {
    lensesRead: allLenses.length,
    accepted: accepted.length,
    dropped,
    byMechanism,
    unresolved: (parsed.unresolved || []).length,
    thinGround: (parsed.thin_ground || []).length,
  });

  const model = {
    syntheses: accepted,
    unresolved: Array.isArray(parsed.unresolved) ? parsed.unresolved : [],
    thin_ground: Array.isArray(parsed.thin_ground) ? parsed.thin_ground : [],
    lenses_read: allLenses.length,
    lenses_failed: [
      ...(progress_data?.system_sections || []),
      ...(progress_data?.hermetic_sections || []),
      ...(progress_data?.gate_sections || []),
      ...(progress_data?.intelligence_sections || []),
    ].filter((s: any) => s.parse_failed).map((s: any) => s.agent_type),
    dropped_single_lens: dropped,
    built_at: new Date().toISOString(),
  };

  const merged = { ...(progress_data || {}), synthesis_model: model };
  job.progress_data = merged;

  await supabase
    .from('hermetic_processing_jobs')
    .update({ progress_data: merged, last_heartbeat: new Date().toISOString() })
    .eq('id', jobId);
}

/** One narrated section. The only place in this pipeline that writes for a reader. */
async function processNarrationSection(job: any, index: number, language: string = 'en') {
  const { id: jobId, blueprint_data: blueprint, progress_data } = job;
  const gates = extractGatesFromBlueprint(blueprint);
  const plan = buildNarrationPlan(gates);
  const section = plan[index];
  if (!section) throw new Error(`No narration section at index ${index}`);

  const model = progress_data?.synthesis_model;
  if (!model) throw new Error('Narration reached before the synthesis model was built');

  await updateJobStatus(jobId, 'processing', `Writing: ${section.title}`);

  const userName = blueprint?.user_meta?.preferred_name || blueprint?.basic_info?.first_name || 'this person';

  // Lens sections additionally receive their own lens's raw observations, so a
  // framework section is genuinely that framework's contribution rather than a
  // slice of the average.
  let lensMaterial = '';
  if (section.lens) {
    const all = [
      ...(progress_data?.system_sections || []),
      ...(progress_data?.hermetic_sections || []),
      ...(progress_data?.gate_sections || []),
    ];
    const own = all.find((s: any) =>
      s.agent_type === section.lens || (section.lens?.startsWith('gate_') && `gate_${s.gate_number}` === section.lens));
    if (own) lensMaterial = `\n\nTHIS LENS'S OWN OBSERVATIONS:\n${JSON.stringify({
      observations: own.observations, tensions: own.tensions, absences: own.absences,
    }, null, 2)}`;
  }

  const content = await callAgent(
    buildNarrationPrompt(section, userName, getLanguageName(language)),
    `THE MODEL:\n${JSON.stringify(model, null, 2)}${lensMaterial}`,
    section.key,
  );

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const narration = { ...(progress_data?.narration || {}), [section.key]: { path: section.path, content, word_count: wordCount } };
  const merged = { ...(progress_data || {}), narration };
  job.progress_data = merged;

  await supabase
    .from('hermetic_processing_jobs')
    .update({ progress_data: merged, last_heartbeat: new Date().toISOString() })
    .eq('id', jobId);

  const totalWords = (Object.values(narration) as Array<{ word_count?: number }>)
    .reduce((n, s) => n + (s.word_count || 0), 0);
  await updateJobStatus(jobId, 'processing', `Wrote: ${section.title}`, undefined, totalWords);

  console.log(`✍️ ${section.key}: ${wordCount} words (target ${section.words}), running total ${totalWords}`);
}
async function finalizeReport(job: any) {
  const { id: jobId, user_id: userId, blueprint_data: blueprint, progress_data } = job;

  console.log(`🏁 FINALIZING v3 report for job ${jobId}`);

  const model = progress_data?.synthesis_model;
  const narration = progress_data?.narration || {};
  if (!model) throw new Error('Cannot finalize: no synthesis model');

  const narratedSections = Object.values(narration) as Array<{ path: string; content: string; word_count: number }>;
  if (narratedSections.length === 0) throw new Error('Cannot finalize: nothing was narrated');

  const totalWordCount = narratedSections.reduce((n, s) => n + (s.word_count || 0), 0);

  // Assemble by path. Every user-facing string in the report came from the
  // Twin; the model underneath it is stored alongside rather than thrown away.
  const reportContent: Record<string, any> = {
    seven_laws_integration: {},
    system_translations: {},
    gate_analyses: {},
    shadow_work_integration: {},
  };
  for (const section of narratedSections) {
    setByPath(reportContent, section.path, section.content);
  }

  // The model is the artifact this pipeline exists to produce. The prose is one
  // rendering of it — the first, and on day one the only one. Storing it whole
  // is what lets a later relationship layer update a person's model instead of
  // regenerating a document.
  reportContent.synthesis_model = model;
  reportContent.blueprint_signature = generateBlueprintSignature(blueprint);
  reportContent.word_count = totalWordCount;
  reportContent.generation_metadata = {
    pipeline: 'v3-observation-synthesis-narration',
    lenses_read: model.lenses_read,
    lenses_failed: model.lenses_failed,
    syntheses: (model.syntheses || []).length,
    dropped_single_lens: model.dropped_single_lens,
    unresolved: (model.unresolved || []).length,
    thin_ground: (model.thin_ground || []).length,
    sections_narrated: narratedSections.length,
    total_processing_time: Date.now() - new Date(job.created_at).getTime(),
    version: '3.0',
  };

  // structured_intelligence keeps its name and its consumers; what changed is
  // that it is no longer recovered by reading prose back. It is the model.
  reportContent.structured_intelligence = {
    syntheses: model.syntheses,
    unresolved: model.unresolved,
    thin_ground: model.thin_ground,
    source: 'cross_framework_synthesis',
  };

  const { error: reportError } = await supabase
    .from('personality_reports')
    .insert({
      user_id: userId,
      blueprint_id: job.blueprint_id ?? null,
      report_content: reportContent,
      generated_at: new Date().toISOString(),
      blueprint_version: '3.0',
      structured_intelligence: reportContent.structured_intelligence,
    });

  if (reportError) {
    console.error('❌ Failed to store v3 personality report:', reportError);
    throw new Error(`Report storage failed: ${reportError.message}`);
  }

  await supabase
    .from('hermetic_processing_jobs')
    .update({
      status: 'completed',
      current_step: `Complete — ${totalWordCount.toLocaleString()} words from a ${(model.syntheses || []).length}-entry model`,
      progress_percentage: 100,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);

  console.log(`✅ v3 report stored:`, {
    words: totalWordCount,
    syntheses: (model.syntheses || []).length,
    sections: narratedSections.length,
    lensesFailed: model.lenses_failed,
  });
}
async function updateJobStatus(jobId: string, status: string, message: string, progressPercentage?: number, currentWordCount?: number) {
  const updateData: any = {
    status: status,
    current_step: message,
    last_heartbeat: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  if (progressPercentage !== undefined) {
    updateData.progress_percentage = progressPercentage;
  }
  
  if (currentWordCount !== undefined) {
    updateData.current_step = `${message} (${currentWordCount.toLocaleString()} words generated)`;
  }
  
  const { error } = await supabase
    .from('hermetic_processing_jobs')
    .update(updateData)
    .eq('id', jobId);
    
  if (error) {
    console.error('❌ Failed to update job status:', error);
  } else {
    console.log(`✅ Job ${jobId} updated: ${status} - ${message}`);
  }
}

// ============ PERSONALIZED PROMPT GENERATORS ============

function extractGatesFromBlueprint(blueprint: any): number[] {
  const gates: number[] = [];
  const hdData = blueprint.energy_strategy_human_design;
  
  if (!hdData) return [];

  // Helper function to extract gate number from various formats
  const extractGateNumber = (gateData: any): number | null => {
    // Handle object format: { gate: 45, line: 2 }
    if (gateData?.gate && typeof gateData.gate === 'number') {
      return gateData.gate;
    }
    
    // Handle number format: 45.2 -> extract 45
    if (typeof gateData === 'number') {
      return Math.floor(gateData);
    }
    
    // Handle string format: "45.2" -> extract 45
    if (typeof gateData === 'string') {
      const parsed = parseFloat(gateData);
      return isNaN(parsed) ? null : Math.floor(parsed);
    }
    
    return null;
  };

  // Extract gates from all possible structures
  const gateArrays = [
    hdData.gates?.conscious_personality,
    hdData.gates?.unconscious_personality, 
    hdData.gates?.conscious_design,
    hdData.gates?.unconscious_design
  ];

  gateArrays.forEach(gateArray => {
    if (Array.isArray(gateArray)) {
      gateArray.forEach(gateData => {
        const gateNumber = extractGateNumber(gateData);
        if (gateNumber !== null && gateNumber > 0 && gateNumber <= 64) {
          gates.push(gateNumber);
        }
      });
    }
  });

  // Remove duplicates and sort
  const uniqueGates = [...new Set(gates)].sort((a, b) => a - b);
  console.log(`🔍 GATE EXTRACTION: Found ${uniqueGates.length} unique gates:`, uniqueGates);
  
  return uniqueGates;
}

function generateBlueprintSignature(blueprint: any): string {
  const mbtiType = blueprint.cognition_mbti?.type || 'Unknown';
  const hdType = blueprint.energy_strategy_human_design?.type || 'Unknown';
  const sunSign = blueprint.archetype_western?.sun_sign || 'Unknown';
  return `${mbtiType}-${hdType}-${sunSign}`.replace(/\s+/g, '-');
}

// Helper function to get language name from language code
function getLanguageName(languageCode: string): string {
  const languageMap: { [key: string]: string } = {
    'nl': 'Dutch',
    'fr': 'French', 
    'de': 'German',
    'es': 'Spanish',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ja': 'Japanese',
    'zh': 'Chinese',
    'ko': 'Korean',
    'ru': 'Russian',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'sv': 'Swedish',
    'da': 'Danish',
    'no': 'Norwegian',
    'fi': 'Finnish',
    'pl': 'Polish',
    'tr': 'Turkish',
    'he': 'Hebrew',
    'th': 'Thai',
    'vi': 'Vietnamese'
  };
  
  return languageMap[languageCode] || languageCode;
}