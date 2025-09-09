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
  'linguistic_fingerprint_analyst'
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

    // --- RELAY RACE STATE MACHINE ---
    if (job.current_stage === 'system_translation') {
      // Process ONE system translator
      const translator = SYSTEM_TRANSLATORS[job.current_step_index];
      console.log(`Processing system translator: ${translator}`);
      
      await processSingleSystemTranslator(job, translator);
      progressPercentage = 5 + (job.current_step_index * 15) / SYSTEM_TRANSLATORS.length;
      
      // Move to next step or stage
      if (job.current_step_index + 1 >= SYSTEM_TRANSLATORS.length) {
        nextStage = 'hermetic_laws';
        nextStepIndex = 0;
        progressPercentage = 20;
      } else {
        nextStepIndex = job.current_step_index + 1;
      }

    } else if (job.current_stage === 'hermetic_laws') {
      // Process ONE hermetic law agent
      const agent = HERMETIC_AGENTS[job.current_step_index];
      console.log(`Processing hermetic agent: ${agent}`);
      
      await processSingleHermeticAgent(job, agent);
      progressPercentage = 20 + (job.current_step_index * 30) / HERMETIC_AGENTS.length;
      
      // Move to next step or stage
      if (job.current_step_index + 1 >= HERMETIC_AGENTS.length) {
        nextStage = 'gate_analysis';
        nextStepIndex = 0;
        progressPercentage = 50;
      } else {
        nextStepIndex = job.current_step_index + 1;
      }

    } else if (job.current_stage === 'gate_analysis') {
      // Process ONE gate
      const gates = extractHumanDesignGates(job.blueprint_data);
      const gateNumber = gates[job.current_step_index];
      console.log(`Processing gate: ${gateNumber}`);
      
      await processSingleGate(job, gateNumber);
      progressPercentage = 50 + (job.current_step_index * 30) / gates.length;
      
      // Move to next step or stage
      if (job.current_step_index + 1 >= gates.length) {
        nextStage = 'intelligence_extraction';
        nextStepIndex = 0;
        progressPercentage = 80;
      } else {
        nextStepIndex = job.current_step_index + 1;
      }

    } else if (job.current_stage === 'intelligence_extraction') {
      // Process ONE intelligence agent
      const agent = INTELLIGENCE_EXTRACTION_AGENTS[job.current_step_index];
      console.log(`Processing intelligence agent: ${agent}`);
      
      await processSingleIntelligenceAgent(job, agent);
      progressPercentage = 80 + (job.current_step_index * 15) / INTELLIGENCE_EXTRACTION_AGENTS.length;
      
      // Move to next step or stage
      if (job.current_step_index + 1 >= INTELLIGENCE_EXTRACTION_AGENTS.length) {
        nextStage = 'final_assembly';
        nextStepIndex = 0;
        progressPercentage = 95;
      } else {
        nextStepIndex = job.current_step_index + 1;
      }
      
    } else if (job.current_stage === 'final_assembly') {
      // This is the final step, do the assembly and complete the job
      console.log(`Finalizing report for job ${jobId}`);
      await finalizeReport(job);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Processing complete." 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
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

    // 4. CRITICAL: Trigger the next step by invoking itself (fire-and-forget)
    supabase.functions.invoke('hermetic-background-orchestrator', {
      body: { job_id: jobId }
    }).catch(error => {
      console.error('Failed to trigger next step:', error);
    });

    console.log(`✅ Step completed, next step queued: ${nextStage}[${nextStepIndex}]`);

  } catch (error) {
    // Get jobId from various sources in case destructuring failed
    let errorJobId: string | undefined;
    try {
      const requestBody = await req.clone().json();
      errorJobId = requestBody?.job_id;
    } catch {
      // Could not parse request body
    }
    
    console.error(`❌ Orchestrator failed for job ${errorJobId || 'unknown'}:`, error);
    
    if (errorJobId) {
      await supabase
        .from('hermetic_processing_jobs')
        .update({ 
          status: 'failed', 
          current_step: `Error: ${error.message}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', errorJobId);
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

async function processSingleSystemTranslator(job: any, translator: string) {
  const { id: jobId, blueprint_data: blueprint } = job;

  await updateJobStatus(jobId, 'processing', `Processing ${translator}...`);
  
  console.log(`📤 Calling OpenAI agent for ${translator}...`);
  
  const { data, error } = await supabase.functions.invoke('openai-agent', {
    body: {
      messages: [
        {
          role: 'system',
          content: `You are the ${translator}. Translate the personality system through all 7 Hermetic Laws with shadow work integration. Generate 500+ words analyzing:
1. How this personality system expresses through each Hermetic Law
2. Shadow patterns and unconscious expressions of this system
3. Light expressions and conscious mastery potential
4. Integration techniques for balancing shadow and light aspects
5. How this system's energies can be consciously directed`
        },
        {
          role: 'user',
          content: `Translate this system through Hermetic Laws:

${JSON.stringify(blueprint, null, 2)}

Focus on your specific system expertise.`
        }
      ],
      model: 'gpt-4.1-mini-2025-04-14'
      // FIXED: Removed temperature parameter for GPT-4.1+ models
    }
  });
  
  console.log(`📥 OpenAI response for ${translator}:`, {
    error: error,
    hasData: !!data,
    hasContent: !!data?.content,
    contentLength: data?.content_length || 0,
    modelUsed: data?.model_used
  });
  
  if (error) {
    console.error(`❌ OpenAI API error for ${translator}:`, error);
    throw new Error(`Failed on translator ${translator}: ${error.message}`);
  }
  
  // CRITICAL: Enhanced error detection for empty content (NEW FORMAT)
  if (!data?.content) {
    console.error(`❌ ${translator} returned NO CONTENT:`, {
      data: data,
      responseType: typeof data,
      hasContent: !!data?.content,
      contentLength: data?.content_length || 0
    });
    throw new Error(`${translator} returned empty content - OpenAI API parameter issue`);
  }
  
  const content = data.content.trim();
  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
  
  console.log(`📊 ${translator} SUCCESS:`, {
    wordCount,
    contentLength: content.length,
    contentPreview: content.substring(0, 150) + '...'
  });
  
  if (content.length < 50) {
    console.error(`❌ ${translator} generated practically empty content:`, {
      contentLength: content.length,
      content: content
    });
    throw new Error(`${translator} generated practically empty content: ${content.length} characters`);
  }
  
  if (wordCount < 300) {
    console.warn(`⚠️ ${translator} generated insufficient content (${wordCount} words). Expected minimum: 300 words`);
    throw new Error(`${translator} generated insufficient content: ${wordCount} words (minimum 300 required)`);
  }
    
    const progressData = job.progress_data || {};
    const systemSections = progressData.system_sections || [];
    
    systemSections.push({
      agent_type: translator,
      content: content,
      word_count: content.length
    });
    
    await supabase
      .from('hermetic_processing_jobs')
      .update({ 
        progress_data: { ...progressData, system_sections: systemSections },
        last_heartbeat: new Date().toISOString()
      })
      .eq('id', jobId);
      
    // CRITICAL: Store in queryable sub-jobs table for immediate access
    const { error: upsertError } = await supabase
      .from('hermetic_sub_jobs')
      .upsert({
        job_id: jobId,
        user_id: job.user_id,
        agent_name: translator, // FIXED: Use agent_name to match schema
        stage: 'system_translation',
        status: 'completed',
        content: content,
        word_count: wordCount,
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'job_id,agent_name' // FIXED: Use agent_name for unique constraint
      });
      
    if (upsertError) {
      console.error(`❌ Failed to store sub-job for ${translator}:`, upsertError);
      throw new Error(`Sub-job storage failed: ${upsertError.message}`);
    }
    
    console.log(`✅ Sub-job stored successfully for ${translator}`);
      
    // Calculate current total word count across all sections
    const allCurrentSections = [
      ...systemSections,
      ...(progressData.hermetic_sections || []),
      ...(progressData.gate_sections || []),
      ...(progressData.intelligence_sections || [])
    ];
    const currentWordCount = allCurrentSections.reduce((total, section) => {
      return total + (section.content || '').split(/\s+/).filter(word => word.length > 0).length;
    }, 0);
    
    await updateJobStatus(jobId, 'processing', `Completed ${translator}`, undefined, currentWordCount);
}

async function processSingleHermeticAgent(job: any, agent: string) {
  const { id: jobId, blueprint_data: blueprint } = job;

  await updateJobStatus(jobId, 'processing', `Processing ${agent}...`);
  
  console.log(`📤 Calling OpenAI agent for ${agent}...`);
  
  const { data, error } = await supabase.functions.invoke('openai-agent', {
    body: {
      messages: [
        {
          role: 'system',
          content: `You are the ${agent}. Generate 1,500+ words analyzing the blueprint through your specific Hermetic Law with comprehensive shadow work integration. Focus on:
1. Light and shadow expressions of this law in the person's blueprint
2. Unconscious patterns and shadow projections related to this law
3. Practical shadow work techniques for integration
4. Conscious activation practices for embodying the light aspect
5. How this law's shadow shows up in relationships and life patterns
6. Transformative practices for mastering both polarities`
        },
        {
          role: 'user',
          content: `Analyze this blueprint through your Hermetic Law expertise:

${JSON.stringify(blueprint, null, 2)}

Generate comprehensive analysis with practical applications.`
        }
      ],
      model: 'gpt-4.1-mini-2025-04-14'
      // FIXED: Removed temperature parameter for GPT-4.1+ models
    }
  });
  
  console.log(`📥 OpenAI response for ${agent}:`, {
    error: error,
    hasData: !!data,
    hasChoices: !!data?.choices,
    hasContent: !!data?.choices?.[0]?.message?.content
  });
  
  if (error) {
    console.error(`❌ OpenAI API error for ${agent}:`, error);
    throw new Error(`Failed on agent ${agent}: ${error.message}`);
  }
  
  // CRITICAL: Enhanced error detection for empty content
  // CRITICAL: Enhanced error detection for empty content (NEW FORMAT)
  if (!data?.content) {
    console.error(`❌ ${agent} returned NO CONTENT:`, {
      data: data,
      responseType: typeof data,
      hasContent: !!data?.content,
      contentLength: data?.content_length || 0
    });
    throw new Error(`${agent} returned empty content - OpenAI API parameter issue`);
  }
  
  const content = data.content.trim();
  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
  
  console.log(`📊 ${agent} SUCCESS:`, {
    wordCount,
    contentLength: content.length,
    contentPreview: content.substring(0, 150) + '...'
  });
  
  if (content.length < 50) {
    console.error(`❌ ${agent} generated practically empty content:`, {
      contentLength: content.length,
      content: content
    });
    throw new Error(`${agent} generated practically empty content: ${content.length} characters`);
  }
  
  if (wordCount < 800) {
    console.warn(`⚠️ ${agent} generated insufficient content (${wordCount} words). Expected minimum: 800 words`);
    throw new Error(`${agent} generated insufficient content: ${wordCount} words (minimum 800 required)`);
  }
    
    const progressData = job.progress_data || {};
    const hermeticSections = progressData.hermetic_sections || [];
    
    hermeticSections.push({
      agent_type: agent,
      content: content,
      word_count: content.length,
      hermetic_law: agent.replace('_analyst', '')
    });
    
    await supabase
      .from('hermetic_processing_jobs')
      .update({ 
        progress_data: { ...progressData, hermetic_sections: hermeticSections },
        last_heartbeat: new Date().toISOString()
      })
      .eq('id', jobId);
      
    // CRITICAL: Store in queryable sub-jobs table for immediate access
    const { error: upsertError } = await supabase
      .from('hermetic_sub_jobs')
      .upsert({
        job_id: jobId,
        user_id: job.user_id,
        agent_name: agent, // FIXED: Use agent_name to match schema
        stage: 'hermetic_laws',
        status: 'completed',
        content: content,
        word_count: wordCount,
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'job_id,agent_name' // FIXED: Use agent_name for unique constraint
      });
      
    if (upsertError) {
      console.error(`❌ Failed to store sub-job for ${agent}:`, upsertError);
      throw new Error(`Sub-job storage failed: ${upsertError.message}`);
    }
    
    console.log(`✅ Sub-job stored successfully for ${agent}`);
      
    // Calculate current total word count across all sections
    const allCurrentSections = [
      ...(progressData.system_sections || []),
      ...hermeticSections,
      ...(progressData.gate_sections || []),
      ...(progressData.intelligence_sections || [])
    ];
    const currentWordCount = allCurrentSections.reduce((total, section) => {
      return total + (section.content || '').split(/\s+/).filter(word => word.length > 0).length;
    }, 0);
    
    await updateJobStatus(jobId, 'processing', `Completed ${agent}`, undefined, currentWordCount);
}

async function processSingleGate(job: any, gateNumber: number) {
  const { id: jobId, blueprint_data: blueprint } = job;

  await updateJobStatus(jobId, 'processing', `Analyzing Gate ${gateNumber}...`);
  
  const { data, error } = await supabase.functions.invoke('openai-agent', {
    body: {
      messages: [
        {
          role: 'system',
          content: `You are the Gate Hermetic Analyst. You specialize in analyzing specific Human Design gates through the lens of the 7 Hermetic Laws with deep shadow work integration.

Your task is to provide a comprehensive 1,200+ word analysis of Gate ${gateNumber} through all 7 Hermetic Laws with shadow integration:

1. MENTALISM - How this gate influences mental patterns, thoughts, and consciousness
2. CORRESPONDENCE - How this gate manifests "as above, so below" - inner and outer reflections  
3. VIBRATION - The energetic frequency and vibrational qualities of this gate
4. POLARITY - The opposing forces and shadow/light aspects of this gate
5. RHYTHM - The natural cycles, timing, and rhythmic patterns of this gate
6. CAUSATION - The cause-and-effect patterns and how conscious choice activates this gate
7. GENDER - The creative/receptive, active/passive energy dynamics of this gate

Generate a comprehensive, flowing analysis that integrates all 7 laws with deep shadow work naturally.`
        },
        {
          role: 'user',
          content: `Analyze Gate ${gateNumber} through all 7 Hermetic Laws for this individual's blueprint:

Blueprint Context: ${JSON.stringify(blueprint, null, 2)}

Focus specifically on Gate ${gateNumber} and how it expresses through each Hermetic Law in this person's unique configuration. Generate 1,200+ words of deep, integrated analysis.`
        }
      ],
      model: 'gpt-4.1-mini-2025-04-14'
      // FIXED: Removed temperature parameter for GPT-4.1+ models
    }
  });
  
  if (error) throw new Error(`Failed on gate ${gateNumber}: ${error.message}`);
  
  if (data?.content) {
    const content = data.content.trim();
    const wordCount = content.split(/\s+/).length;
    
    console.log(`📊 Gate ${gateNumber} analysis generated ${wordCount} words, content length: ${content.length} characters`);
    
    if (wordCount < 600) {
      console.warn(`⚠️ Gate ${gateNumber} generated insufficient content (${wordCount} words). Expected minimum: 600 words`);
      throw new Error(`Gate ${gateNumber} generated insufficient content: ${wordCount} words (minimum 600 required)`);
    }
    
    const progressData = job.progress_data || {};
    const gateSections = progressData.gate_sections || [];
    
    gateSections.push({
      agent_type: 'gate_hermetic_analyst',
      content: content,
      word_count: content.length,
      gate_number: gateNumber
    });
    
    await supabase
      .from('hermetic_processing_jobs')
      .update({ 
        progress_data: { ...progressData, gate_sections: gateSections },
        last_heartbeat: new Date().toISOString()
      })
      .eq('id', jobId);
      
    // CRITICAL: Store in queryable sub-jobs table for immediate access
    const { error: upsertError } = await supabase
      .from('hermetic_sub_jobs')
      .upsert({
        job_id: jobId,
        user_id: job.user_id,
        agent_name: 'gate_hermetic_analyst', // FIXED: Use agent_name to match schema
        stage: 'gate_analysis',
        status: 'completed',
        content: content,
        word_count: wordCount,
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'job_id,agent_name' // FIXED: Use agent_name for unique constraint
      });
      
    if (upsertError) {
      console.error(`❌ Failed to store sub-job for gate ${gateNumber}:`, upsertError);
      throw new Error(`Sub-job storage failed: ${upsertError.message}`);
    }
    
    console.log(`✅ Sub-job stored successfully for gate ${gateNumber}`);
      
    // Calculate current total word count across all sections
    const allCurrentSections = [
      ...(progressData.system_sections || []),
      ...(progressData.hermetic_sections || []),
      ...gateSections,
      ...(progressData.intelligence_sections || [])
    ];
    const currentWordCount = allCurrentSections.reduce((total, section) => {
      return total + (section.content || '').split(/\s+/).filter(word => word.length > 0).length;
    }, 0);
    
    await updateJobStatus(jobId, 'processing', `Completed Gate ${gateNumber} analysis`, undefined, currentWordCount);
  }
}

async function processSingleIntelligenceAgent(job: any, agent: string) {
  const { id: jobId, blueprint_data: blueprint, progress_data } = job;
  const dimensionName = agent.replace('_analyst', '');

  await updateJobStatus(jobId, 'processing', `Processing ${dimensionName}...`);
  
  // Get context from previous sections
  const allSections = [
    ...(progress_data?.system_sections || []),
    ...(progress_data?.hermetic_sections || []),
    ...(progress_data?.gate_sections || [])
  ];
  
  const { data, error } = await supabase.functions.invoke('openai-agent', {
    body: {
      messages: [
        {
          role: 'system',
          content: `You are the ${agent}. Generate a comprehensive 800+ word analysis focused on the ${dimensionName} dimension of this person's psychological and spiritual blueprint.

Your analysis should explore:
1. Core patterns and structures in the ${dimensionName} dimension
2. How this dimension manifests in daily life and decision-making
3. Shadow aspects and unconscious expressions of this dimension
4. Light aspects and conscious mastery potential
5. Integration practices and development opportunities
6. How this dimension interacts with other aspects of their blueprint
7. Practical applications for conscious evolution in this area

Provide deep, actionable insights that help the person understand and consciously work with their ${dimensionName} patterns for growth and transformation.`
        },
        {
          role: 'user',
          content: `Generate comprehensive ${dimensionName} analysis for this blueprint:

${JSON.stringify(blueprint, null, 2)}

Enhanced Context from Analysis:
${allSections.map(s => s.content.substring(0, 500)).join('\n\n')}

Provide 800+ words of deep analysis focused specifically on the ${dimensionName} dimension.`
        }
      ],
      model: 'gpt-4.1-mini-2025-04-14'
      // FIXED: Removed temperature parameter for GPT-4.1+ models
    }
  });
  
  if (error) throw new Error(`Failed on intelligence agent ${agent}: ${error.message}`);
  
  if (data?.content) {
    const content = data.content.trim();
    const wordCount = content.split(/\s+/).length;
    
    console.log(`📊 Intelligence agent ${agent} generated ${wordCount} words, content length: ${content.length} characters`);
    
    if (wordCount < 400) {
      console.warn(`⚠️ Intelligence agent ${agent} generated insufficient content (${wordCount} words). Expected minimum: 400 words`);
      throw new Error(`Intelligence agent ${agent} generated insufficient content: ${wordCount} words (minimum 400 required)`);
    }
    
    const progressData = job.progress_data || {};
    const intelligenceSections = progressData.intelligence_sections || [];
    
    intelligenceSections.push({
      agent_type: agent,
      content: content,
      word_count: content.length,
      intelligence_dimension: dimensionName
    });
    
    await supabase
      .from('hermetic_processing_jobs')
      .update({ 
        progress_data: { ...progressData, intelligence_sections: intelligenceSections },
        last_heartbeat: new Date().toISOString()
      })
      .eq('id', jobId);
      
    // CRITICAL: Store in queryable sub-jobs table for immediate access
    const { error: upsertError } = await supabase
      .from('hermetic_sub_jobs')
      .upsert({
        job_id: jobId,
        user_id: job.user_id,
        agent_name: agent, // FIXED: Use agent_name to match schema
        stage: 'intelligence_extraction',
        status: 'completed',
        content: content,
        word_count: wordCount,
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'job_id,agent_name' // FIXED: Use agent_name for unique constraint
      });
      
    if (upsertError) {
      console.error(`❌ Failed to store sub-job for ${agent}:`, upsertError);
      throw new Error(`Sub-job storage failed: ${upsertError.message}`);
    }
    
    console.log(`✅ Sub-job stored successfully for ${agent}`);
      
    // Calculate current total word count across all sections
    const allCurrentSections = [
      ...(progressData.system_sections || []),
      ...(progressData.hermetic_sections || []),
      ...(progressData.gate_sections || []),
      ...intelligenceSections
    ];
    const currentWordCount = allCurrentSections.reduce((total, section) => {
      return total + (section.content || '').split(/\s+/).filter(word => word.length > 0).length;
    }, 0);
    
    await updateJobStatus(jobId, 'processing', `Completed ${dimensionName} intelligence extraction`, undefined, currentWordCount);
  }
}

async function finalizeReport(job: any) {
  const { id: jobId, blueprint_data: blueprint, progress_data, user_id } = job;
  
  await updateJobStatus(jobId, 'processing', 'Assembling final report...');
  
  // Combine all sections
  const systemSections = progress_data?.system_sections || [];
  const hermeticSections = progress_data?.hermetic_sections || [];
  const gateSections = progress_data?.gate_sections || [];
  const intelligenceSections = progress_data?.intelligence_sections || [];
  
  const finalSections = [...systemSections, ...hermeticSections, ...gateSections, ...intelligenceSections];
  const totalWordCount = finalSections.reduce((total, section) => {
    const actualWordCount = (section.content || '').split(/\s+/).filter(word => word.length > 0).length;
    return total + actualWordCount;
  }, 0);
  
  // CRITICAL: Enhanced logging and validation
  console.log(`🏁 FINAL REPORT ASSEMBLY:`, {
    totalSections: finalSections.length,
    systemSections: systemSections.length,
    hermeticSections: hermeticSections.length,
    gateSections: gateSections.length,
    intelligenceSections: intelligenceSections.length,
    totalWordCount: totalWordCount
  });
  
  // Check each section for content
  const emptySections = finalSections.filter(section => !section.content || section.content.trim().length < 50);
  if (emptySections.length > 0) {
    console.error(`❌ EMPTY SECTIONS DETECTED:`, {
      count: emptySections.length,
      sections: emptySections.map(s => ({ type: s.agent_type, contentLength: s.content?.length || 0 }))
    });
  }
  
  // CRITICAL: Validate minimum word count
  if (totalWordCount < 5000) {
    console.error(`❌ CRITICAL: Report too short (${totalWordCount} words). Expected minimum: 5,000 words`);
    await supabase
      .from('hermetic_processing_jobs')
      .update({
        status: 'failed',
        error_message: `Report generation failed - only ${totalWordCount} words generated (minimum 5,000 required)`,
        current_step: `Failed: Insufficient content generated`,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);
    return;
  }
  
  const finalReport = {
    sections: finalSections,
    synthesis: "Comprehensive hermetic analysis complete with shadow work integration.",
    consciousness_map: "Detailed consciousness mapping across all dimensions generated.",
    practical_applications: "Practical shadow work and conscious activation techniques provided.",
    blueprint_signature: generateBlueprintSignature(blueprint),
    total_word_count: totalWordCount,
    generated_at: new Date().toISOString(),
    structured_intelligence: buildStructuredIntelligence(intelligenceSections)
  };

  // CRITICAL FIX: Build proper personality report structure for database storage
  const personalityReportContent = {
    // Standard personality report sections (assembled from generated content)
    core_personality_pattern: combineRelevantSections(finalSections, ['mbti_hermetic_translator', 'mentalism_analyst']),
    decision_making_style: combineRelevantSections(finalSections, ['human_design_hermetic_translator', 'causation_analyst']),
    relationship_style: combineRelevantSections(finalSections, ['astrology_hermetic_translator', 'polarity_analyst']),
    life_path_purpose: combineRelevantSections(finalSections, ['numerology_hermetic_translator', 'correspondence_analyst']),
    current_energy_timing: combineRelevantSections(finalSections, ['chinese_astrology_hermetic_translator', 'rhythm_analyst']),
    integrated_summary: `Comprehensive hermetic analysis revealing ${totalWordCount.toLocaleString()} words of deep personality insights with shadow work integration.`,
    
    // Hermetic Blueprint sections
    hermetic_fractal_analysis: combineRelevantSections(finalSections, ['correspondence_analyst', 'mentalism_analyst']),
    consciousness_integration_map: combineRelevantSections(finalSections, intelligenceSections.map(s => s.agent_type)),
    practical_activation_framework: combineRelevantSections(finalSections, ['vibration_analyst', 'gender_analyst']),
    
    // Seven laws integration
    seven_laws_integration: {
      mentalism: hermeticSections.find(s => s.agent_type === 'mentalism_analyst')?.content || '',
      correspondence: hermeticSections.find(s => s.agent_type === 'correspondence_analyst')?.content || '',
      vibration: hermeticSections.find(s => s.agent_type === 'vibration_analyst')?.content || '',
      polarity: hermeticSections.find(s => s.agent_type === 'polarity_analyst')?.content || '',
      rhythm: hermeticSections.find(s => s.agent_type === 'rhythm_analyst')?.content || '',
      causation: hermeticSections.find(s => s.agent_type === 'causation_analyst')?.content || '',
      gender: hermeticSections.find(s => s.agent_type === 'gender_analyst')?.content || ''
    },
    
    // System translations
    system_translations: {
      mbti_hermetic: systemSections.find(s => s.agent_type === 'mbti_hermetic_translator')?.content || '',
      astrology_hermetic: systemSections.find(s => s.agent_type === 'astrology_hermetic_translator')?.content || '',
      numerology_hermetic: systemSections.find(s => s.agent_type === 'numerology_hermetic_translator')?.content || '',
      human_design_hermetic: systemSections.find(s => s.agent_type === 'human_design_hermetic_translator')?.content || '',
      chinese_astrology_hermetic: systemSections.find(s => s.agent_type === 'chinese_astrology_hermetic_translator')?.content || ''
    },
    
    // Gate analyses
    gate_analyses: gateSections.reduce((gates, section) => {
      if (section.gate_number) {
        gates[`gate_${section.gate_number}`] = section.content;
      }
      return gates;
    }, {} as any),
    
    // Shadow work integration
    shadow_work_integration: {
      shadow_patterns: combineRelevantSections(finalSections, ['polarity_analyst', 'internal_conflicts_analyst']),
      integration_practices: combineRelevantSections(finalSections, ['vibration_analyst', 'adaptive_feedback_analyst']),
      transformation_roadmap: combineRelevantSections(finalSections, ['rhythm_analyst', 'crisis_handling_analyst'])
    },
    
    blueprint_signature: generateBlueprintSignature(blueprint),
    word_count: totalWordCount,
    generation_metadata: {
      agents_used: finalSections.map(s => s.agent_type),
      total_processing_time: Date.now() - new Date(job.created_at).getTime(),
      hermetic_depth_score: Math.min(100, Math.floor(totalWordCount / 500)),
      gates_analyzed: gateSections.map(s => s.gate_number).filter(Boolean),
      intelligence_status: 'completed',
      intelligence_analysts: intelligenceSections.map(s => s.agent_type)
    },
    structured_intelligence: buildStructuredIntelligence(intelligenceSections)
  };

  console.log(`💾 PERSONALITY REPORT: Saving to database with ${totalWordCount} words`);

  // CRITICAL FIX: Save to personality_reports table (this was the missing step!)
  const { data: savedReport, error: reportError } = await supabase
    .from('personality_reports')
    .insert({
      user_id: user_id,
      blueprint_id: job.blueprint_id || null,
      report_content: personalityReportContent,
      generated_at: new Date().toISOString(),
      blueprint_version: '2.0', // Hermetic reports use version 2.0
      structured_intelligence: buildStructuredIntelligence(intelligenceSections)
    })
    .select('id')
    .single();

  if (reportError) {
    console.error(`❌ CRITICAL: Failed to save personality report:`, reportError);
    await supabase
      .from('hermetic_processing_jobs')
      .update({
        status: 'failed',
        error_message: `Report assembly successful but database save failed: ${reportError.message}`,
        current_step: `Storage Error: ${reportError.message}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);
    return;
  }

  console.log(`✅ PERSONALITY REPORT: Successfully saved report ${savedReport.id} to database`);
  
  // Save completed report to job record for reference
  await supabase
    .from('hermetic_processing_jobs')
    .update({
      status: 'completed',
      result_data: finalReport,
      completed_at: new Date().toISOString(),
      current_step: `Report completed and saved! ${finalReport.total_word_count} words generated.`,
      progress_percentage: 100,
      last_heartbeat: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', jobId);
    
  console.log(`✅ Report completed for job ${jobId} - ${finalReport.total_word_count} words`);
}

// Helper function to combine relevant sections for report structure
function combineRelevantSections(allSections: any[], relevantAgents: string[]): string {
  const relevantContent = allSections
    .filter(section => relevantAgents.includes(section.agent_type))
    .map(section => section.content)
    .filter(content => content && content.trim().length > 0);
    
  if (relevantContent.length === 0) {
    return "Analysis pending - please regenerate report if this section appears empty.";
  }
  
  return relevantContent.join('\n\n--- \n\n');
}

// ============ HELPER FUNCTIONS ============

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

function extractHumanDesignGates(blueprint: any): number[] {
  const gates: number[] = [];
  const hdData = blueprint.energy_strategy_human_design;
  
  if (!hdData) return [];

  // Extract gates from all possible structures
  if (hdData.gates?.conscious_personality) {
    hdData.gates.conscious_personality.forEach((gateData: any) => {
      if (gateData?.gate && typeof gateData.gate === 'number') {
        gates.push(gateData.gate);
      }
    });
  }
  
  if (hdData.gates?.unconscious_personality) {
    hdData.gates.unconscious_personality.forEach((gateData: any) => {
      if (gateData?.gate && typeof gateData.gate === 'number') {
        gates.push(gateData.gate);
      }
    });
  }
  
  if (hdData.gates?.conscious_design) {
    hdData.gates.conscious_design.forEach((gateData: any) => {
      if (gateData?.gate && typeof gateData.gate === 'number') {
        gates.push(gateData.gate);
      }
    });
  }
  
  if (hdData.gates?.unconscious_design) {
    hdData.gates.unconscious_design.forEach((gateData: any) => {
      if (gateData?.gate && typeof gateData.gate === 'number') {
        gates.push(gateData.gate);
      }
    });
  }

  // Remove duplicates and sort
  return [...new Set(gates)].sort((a, b) => a - b);
}

function generateBlueprintSignature(blueprint: any): string {
  const mbtiType = blueprint.cognition_mbti?.type || 'Unknown';
  const hdType = blueprint.energy_strategy_human_design?.type || 'Unknown';
  const sunSign = blueprint.archetype_western?.sun_sign || 'Unknown';
  return `${mbtiType}-${hdType}-${sunSign}`.replace(/\s+/g, '-');
}

function buildStructuredIntelligence(intelligenceSections: any[]): any {
  const intelligence: any = {};
  
  intelligenceSections.forEach(section => {
    const dimension = section.intelligence_dimension;
    try {
      intelligence[dimension] = JSON.parse(section.content);
    } catch {
      intelligence[dimension] = { analysis: section.content };
    }
  });
  
  return intelligence;
}