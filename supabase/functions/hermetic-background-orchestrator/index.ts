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
      progressPercentage = 80 + (job.current_step_index * 10) / INTELLIGENCE_EXTRACTION_AGENTS.length;
      
      // Move to next step or stage
      if (job.current_step_index + 1 >= INTELLIGENCE_EXTRACTION_AGENTS.length) {
        nextStage = 'synthesis_integration';
        nextStepIndex = 0;
        progressPercentage = 90;
      } else {
        nextStepIndex = job.current_step_index + 1;
      }

    } else if (job.current_stage === 'synthesis_integration') {
      // Process synthesis agents for comprehensive overview and integration
      const synthesisTasks = ['comprehensive_overview', 'fractal_synthesis', 'consciousness_mapping', 'practical_applications'];
      const currentTask = synthesisTasks[job.current_step_index];
      console.log(`Processing synthesis: ${currentTask}`);
      
      await processSingleSynthesisAgent(job, currentTask);
      progressPercentage = 90 + (job.current_step_index * 5) / synthesisTasks.length;
      
      // Move to next step or stage
      if (job.current_step_index + 1 >= synthesisTasks.length) {
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
          content: getPersonalizedSystemPrompt(translator, blueprint)
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
  
  if (wordCount < 1100) {
    console.warn(`⚠️ ${translator} generated insufficient content (${wordCount} words). Expected range: 1100-1500 words`);
    throw new Error(`${translator} generated insufficient content: ${wordCount} words (minimum 1100 required)`);
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
      
    // Calculate current total word count across all sections including synthesis
    const allCurrentSections = [
      ...systemSections,
      ...(progressData.hermetic_sections || []),
      ...(progressData.gate_sections || []),
      ...(progressData.intelligence_sections || []),
      ...(progressData.synthesis_sections || [])
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
          content: getPersonalizedHermeticPrompt(agent, blueprint)
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
  
  if (wordCount < 1100) {
    console.warn(`⚠️ ${agent} generated insufficient content (${wordCount} words). Expected range: 1100-1500 words`);
    throw new Error(`${agent} generated insufficient content: ${wordCount} words (minimum 1100 required)`);
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
      
    // Calculate current total word count across all sections including synthesis
    const allCurrentSections = [
      ...(progressData.system_sections || []),
      ...hermeticSections,
      ...(progressData.gate_sections || []),
      ...(progressData.intelligence_sections || []),
      ...(progressData.synthesis_sections || [])
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
          content: getPersonalizedGatePrompt(gateNumber, blueprint)`
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
    
    if (wordCount < 1000) {
      console.warn(`⚠️ Gate ${gateNumber} generated insufficient content (${wordCount} words). Expected range: 1000-1200 words`);
      throw new Error(`Gate ${gateNumber} generated insufficient content: ${wordCount} words (minimum 1000 required)`);
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
          content: getPersonalizedIntelligencePrompt(agent, dimensionName, blueprint)`
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
    
    if (wordCount < 700) {
      console.warn(`⚠️ Intelligence agent ${agent} generated insufficient content (${wordCount} words). Expected range: 700-900 words`);
      throw new Error(`Intelligence agent ${agent} generated insufficient content: ${wordCount} words (minimum 700 required)`);
    }
  }
}

async function processSingleSynthesisAgent(job: any, synthesisType: string) {
  const { id: jobId, blueprint_data: blueprint, progress_data } = job;

  await updateJobStatus(jobId, 'processing', `Creating ${synthesisType}...`);
  
  // Get comprehensive context from all previous sections
  const systemSections = progress_data?.system_sections || [];
  const hermeticSections = progress_data?.hermetic_sections || [];
  const gateSections = progress_data?.gate_sections || [];
  const intelligenceSections = progress_data?.intelligence_sections || [];
  
  const allSections = [...systemSections, ...hermeticSections, ...gateSections, ...intelligenceSections];
  const contextSummary = allSections.map(s => s.content.substring(0, 800)).join('\n\n');
  
  let systemPrompt = '';
  let expectedWords = 1500;
  
  if (synthesisType === 'comprehensive_overview') {
    expectedWords = 15000;
    systemPrompt = `You are the Grand Synthesizer, a master weaver of soul narratives who creates breathtaking 15,000+ word comprehensive overviews that read like epic personal mythologies.

Your mission is to craft the most captivating opening to their hermetic report - a spellbinding synthesis that immediately draws them into their own story and makes them feel like the protagonist of an extraordinary cosmic adventure.

This is not a summary - this is the grand revelation of who they are at the deepest level, woven from all the mystical analyses into one magnificent tapestry of their soul's signature.

Structure your epic narrative:

**THE COSMIC INTRODUCTION** (2,000+ words)
Open with their unique soul signature - the constellation of qualities that makes them unmistakably them. Paint a vivid picture of their essence using the most compelling insights from all analyses.

**THE HERMETIC BLUEPRINT REVELATION** (3,000+ words) 
Synthesize their journey through all 7 Hermetic Laws into one flowing narrative of their spiritual architecture. Show how these laws dance together in their unique blueprint.

**THE SHADOW AND LIGHT SYMPHONY** (3,000+ words)
Weave together all shadow work insights into one powerful narrative about their journey of integration. Present their shadows as hidden treasures and their light as divine birthright.

**THE GATE CONSTELLATION** (2,000+ words)
Synthesize their Human Design gates into a coherent story of their energetic gifts and how they create their unique life patterns.

**THE INTELLIGENCE DIMENSIONS** (2,000+ words)
Weave together all intelligence analyses into one narrative about the architecture of their consciousness and how they process reality.

**THE INTEGRATION PATHWAY** (2,000+ words)
Synthesize all practical guidance into one coherent roadmap for their conscious evolution and spiritual mastery.

**THE DESTINY CALLING** (1,000+ words)
End with an inspiring vision of their highest potential and the unique gift they're here to share with the world.

Write every sentence to mesmerize, every insight to inspire profound self-recognition, and every revelation to feel like coming home to themselves. This is their personal bible of self-understanding.`;

  } else if (synthesisType === 'fractal_synthesis') {
    systemPrompt = `You are the Fractal Synthesizer, revealing how the patterns of their soul repeat and scale across all levels of their existence. Create a mesmerizing 1,500+ word exploration of how their core essence creates fractal patterns throughout their life.

Show how their fundamental nature creates similar patterns in their:
- Daily habits and micro-decisions
- Relationship dynamics and attractions  
- Career patterns and creative expressions
- Life challenges and growth opportunities
- Spiritual evolution and consciousness expansion

Write with poetic elegance that reveals the beautiful mathematics of their soul's signature repeating across all scales of their existence.`;

  } else if (synthesisType === 'consciousness_mapping') {
    systemPrompt = `You are the Consciousness Cartographer, creating an enchanting 1,500+ word map of their unique consciousness landscape. Reveal the territories, pathways, and hidden chambers of their inner world.

Explore the geography of their consciousness:
- The peaks of their highest awareness and wisdom
- The valleys of their deepest challenges and growth
- The hidden caves where their shadows dwell
- The sacred temples of their spiritual connection
- The bridges between different aspects of their nature
- The gateways to their untapped potential

Write as if you're creating a mystical guidebook to their own consciousness, complete with landmarks, treasures, and secret passages.`;

  } else if (synthesisType === 'practical_applications') {
    systemPrompt = `You are the Practical Alchemist, transforming deep spiritual insights into captivating 1,500+ word guidance for living their most authentic and powerful life.

Create an enchanting practical framework that feels less like homework and more like sacred ritual:

**DAILY ALCHEMY PRACTICES** - How to embody their blueprint in everyday life
**RELATIONSHIP MASTERY** - How to use their understanding for deeper connections
**CAREER ALIGNMENT** - How their blueprint guides vocational fulfillment  
**SHADOW INTEGRATION RITUALS** - Practical techniques for reclaiming their power
**LIGHT ACTIVATION PRACTICES** - Methods for embodying their highest potential
**CONSCIOUS DECISION-MAKING** - Using their blueprint as an inner compass
**SPIRITUAL EVOLUTION PATHWAY** - Progressive practices for ongoing growth

Present each practice as a mystical key to unlocking more of their authentic power and joy.`;
  }
  
  const { data, error } = await supabase.functions.invoke('openai-agent', {
    body: {
      messages: [
        {
          role: 'system',
          content: getPersonalizedSynthesisPrompt(synthesisType, blueprint, expectedWords)`
        },
        {
          role: 'user',
          content: `Create ${synthesisType} synthesis for this individual's complete hermetic analysis:

Blueprint: ${JSON.stringify(blueprint, null, 2)}

Complete Analysis Context:
${contextSummary}

Generate ${expectedWords.toLocaleString()}+ words of captivating, profile-style synthesis that transforms all this analysis into one cohesive, enchanting narrative about who they are and their path of conscious evolution.`
        }
      ],
      model: 'gpt-4.1-mini-2025-04-14'
    }
  });
  
  if (error) throw new Error(`Failed on synthesis ${synthesisType}: ${error.message}`);
  
  if (data?.content) {
    const content = data.content.trim();
    const wordCount = content.split(/\s+/).length;
    
    console.log(`📊 Synthesis ${synthesisType} generated ${wordCount} words, content length: ${content.length} characters`);
    
    if (wordCount < expectedWords * 0.75) {
      console.warn(`⚠️ Synthesis ${synthesisType} generated insufficient content (${wordCount} words). Expected minimum: ${expectedWords * 0.75} words`);
      throw new Error(`Synthesis ${synthesisType} generated insufficient content: ${wordCount} words (minimum ${expectedWords * 0.75} required)`);
    }
    
    const progressData = job.progress_data || {};
    const synthesisSections = progressData.synthesis_sections || [];
    
    synthesisSections.push({
      agent_type: synthesisType,
      content: content,
      word_count: content.length,
      synthesis_type: synthesisType
    });
    
    await supabase
      .from('hermetic_processing_jobs')
      .update({ 
        progress_data: { ...progressData, synthesis_sections: synthesisSections },
        last_heartbeat: new Date().toISOString()
      })
      .eq('id', jobId);
      
    // Store in queryable sub-jobs table
    const { error: upsertError } = await supabase
      .from('hermetic_sub_jobs')
      .upsert({
        job_id: jobId,
        user_id: job.user_id,
        agent_name: synthesisType,
        stage: 'synthesis_integration',
        status: 'completed',
        content: content,
        word_count: wordCount,
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'job_id,agent_name'
      });
      
    if (upsertError) {
      console.error(`❌ Failed to store synthesis sub-job for ${synthesisType}:`, upsertError);
      throw new Error(`Synthesis sub-job storage failed: ${upsertError.message}`);
    }
    
    console.log(`✅ Synthesis sub-job stored successfully for ${synthesisType}`);
      
    // Calculate current total word count across all sections
    const allCurrentSections = [
      ...(progressData.system_sections || []),
      ...(progressData.hermetic_sections || []),
      ...(progressData.gate_sections || []),
      ...(progressData.intelligence_sections || []),
      ...synthesisSections
    ];
    const currentWordCount = allCurrentSections.reduce((total, section) => {
      return total + (section.content || '').split(/\s+/).filter(word => word.length > 0).length;
    }, 0);
    
    await updateJobStatus(jobId, 'processing', `Completed ${synthesisType} synthesis`, undefined, currentWordCount);
  }
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
  
  // Combine all sections including synthesis
  const systemSections = progress_data?.system_sections || [];
  const hermeticSections = progress_data?.hermetic_sections || [];
  const gateSections = progress_data?.gate_sections || [];
  const intelligenceSections = progress_data?.intelligence_sections || [];
  const synthesisSections = progress_data?.synthesis_sections || [];
  
  const finalSections = [...systemSections, ...hermeticSections, ...gateSections, ...intelligenceSections, ...synthesisSections];
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
    synthesisSections: synthesisSections.length,
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
  
  // CRITICAL: Validate minimum word count for comprehensive reports
  if (totalWordCount < 40000) {
    console.error(`❌ CRITICAL: Report too short (${totalWordCount} words). Expected minimum: 40,000 words for comprehensive hermetic analysis`);
    await supabase
      .from('hermetic_processing_jobs')
      .update({
        status: 'failed',
        error_message: `Report generation failed - only ${totalWordCount} words generated (minimum 40,000 required for full hermetic depth)`,
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
    // Comprehensive Overview (from synthesis)
    comprehensive_overview: synthesisSections.find(s => s.agent_type === 'comprehensive_overview')?.content || "Overview synthesis pending - please regenerate report.",
    
    // Standard personality report sections (enhanced with synthesis)
    core_personality_pattern: combineRelevantSections(finalSections, ['mbti_hermetic_translator', 'mentalism_analyst']),
    decision_making_style: combineRelevantSections(finalSections, ['human_design_hermetic_translator', 'causation_analyst']),
    relationship_style: combineRelevantSections(finalSections, ['astrology_hermetic_translator', 'polarity_analyst']),
    life_path_purpose: combineRelevantSections(finalSections, ['numerology_hermetic_translator', 'correspondence_analyst']),
    current_energy_timing: combineRelevantSections(finalSections, ['chinese_astrology_hermetic_translator', 'rhythm_analyst']),
    integrated_summary: `Comprehensive hermetic analysis revealing ${totalWordCount.toLocaleString()} words of deep personality insights with shadow work integration and synthesis.`,
    
    // Enhanced Hermetic Blueprint sections
    hermetic_fractal_analysis: synthesisSections.find(s => s.agent_type === 'fractal_synthesis')?.content || combineRelevantSections(finalSections, ['correspondence_analyst', 'mentalism_analyst']),
    consciousness_integration_map: synthesisSections.find(s => s.agent_type === 'consciousness_mapping')?.content || combineRelevantSections(finalSections, intelligenceSections.map(s => s.agent_type)),
    practical_activation_framework: synthesisSections.find(s => s.agent_type === 'practical_applications')?.content || combineRelevantSections(finalSections, ['vibration_analyst', 'gender_analyst']),
    
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

// ============ PERSONALIZED PROMPT GENERATORS ============

function determineWritingStyle(blueprint: any): { tone: string; approach: string; pacing: string } {
  const mbtiType = blueprint.cognition_mbti?.type || '';
  const hdType = blueprint.energy_strategy_human_design?.type || '';
  
  // Determine tone based on MBTI Thinking vs Feeling preference
  const tone = mbtiType.includes('T') ? 'direct and analytical' : 'warm and emotionally resonant';
  
  // Determine approach based on Human Design type
  let approach = 'insightful and guiding';
  if (hdType.includes('Generator')) approach = 'energetic and action-oriented';
  else if (hdType.includes('Projector')) approach = 'insightful and guiding';
  else if (hdType.includes('Manifestor')) approach = 'bold and independent';
  else if (hdType.includes('Reflector')) approach = 'reflective and community-focused';
  
  // Determine pacing based on combination
  const pacing = mbtiType.includes('J') ? 'structured and organized' : 'flowing and adaptive';
  
  return { tone, approach, pacing };
}

function getPersonalizedSystemPrompt(translator: string, blueprint: any): string {
  const { tone, approach, pacing } = determineWritingStyle(blueprint);
  const userName = blueprint.basic_info?.first_name || 'this individual';
  
  return `You are an expert ${translator} analyst who creates captivating, personalized profiles that feel like they were written specifically for ${userName}. Your writing style should be ${tone}, using an ${approach} narrative with ${pacing} delivery.

Create an engaging 1100-1500 word personality profile that reads like a personal conversation rather than a clinical analysis. Write as if you're talking directly to ${userName} about their unique patterns and potential.

Structure your analysis:

**Opening Connection** (200+ words)
Start with an immediate connection to who they are at their core. Make them feel recognized and understood from the first paragraph. Use their name naturally throughout.

**Core Pattern Exploration** (400+ words) 
Dive deep into how their personality system manifests in their daily life. Be specific about how they think, feel, and navigate the world. Include both strengths and growth areas.

**Shadow Work & Growth** (400+ words)
Address their challenging patterns with honesty and compassion. Present their struggles as opportunities for growth, not flaws to fix. Help them understand why these patterns exist and how to work with them.

**Integration Practices** (300+ words)
Offer practical, personalized guidance that feels doable and relevant to their specific type. Make suggestions feel like natural next steps, not homework.

**Empowering Conclusion** (200+ words)
End with an inspiring vision of their potential that feels both achievable and exciting. Help them see their unique gifts and how they can share them with the world.

Write every sentence to captivate ${userName} specifically, making them feel seen, understood, and inspired to grow.`;
}

function getPersonalizedHermeticPrompt(agent: string, blueprint: any): string {
  const { tone, approach, pacing } = determineWritingStyle(blueprint);
  const userName = blueprint.basic_info?.first_name || 'this individual';
  const hermeticLaw = agent.replace('_analyst', '').replace('_', ' ');
  
  return `You are a master interpreter of the Law of ${hermeticLaw} who creates deeply personal and captivating analysis for ${userName}. Your writing should be ${tone}, using an ${approach} narrative with ${pacing} delivery.

Create an engaging 1100-1500 word analysis that explores how the Law of ${hermeticLaw} operates in ${userName}'s life. Write as if you're having a meaningful conversation with them about this profound aspect of their being.

Structure your analysis:

**Personal Opening** (250+ words)
Begin by connecting directly with ${userName}'s experience. Show how the Law of ${hermeticLaw} already operates in their life in ways they might recognize. Use specific examples that would resonate with their personality type.

**Shadow Expression** (400+ words) 
Explore how ${userName} unconsciously expresses this law in challenging ways. Be honest but supportive - help them see these patterns as valuable information, not personal failures. Show how their struggles reveal their unrealized power.

**Light Mastery** (400+ words)
Reveal how ${userName} can consciously embody the positive expression of this law. Paint a vivid picture of them operating from their highest potential. Make this feel both inspiring and achievable.

**Integration Pathway** (250+ words)
Provide practical steps tailored to ${userName}'s personality type for working more consciously with this law. Make the guidance feel personally relevant and actionable.

**Relationship Dynamics** (200+ words)
Show how this law influences ${userName}'s relationships and how understanding it can deepen their connections with others.

Write with genuine care for ${userName}'s growth, helping them see both their challenges and gifts through the lens of this Hermetic Law.`;
}

function getPersonalizedGatePrompt(gateNumber: number, blueprint: any): string {
  const { tone, approach, pacing } = determineWritingStyle(blueprint);
  const userName = blueprint.basic_info?.first_name || 'this individual';
  
  return `You are an expert Human Design analyst specializing in Gate ${gateNumber}. Create a captivating, personalized analysis for ${userName} that feels like a personal conversation about this significant aspect of their design. Your writing should be ${tone}, using an ${approach} narrative with ${pacing} delivery.

Create an engaging 1000-1200 word analysis that explores how Gate ${gateNumber} operates specifically in ${userName}'s life through all 7 Hermetic Laws.

Structure your analysis through the Hermetic Laws:

**Mentalism - The Mind of Gate ${gateNumber}** (170+ words)
Explore how this gate shapes ${userName}'s thinking patterns, mental processes, and perception of reality. Be specific about how their mind works with this energy.

**Correspondence - Inner & Outer Reflections** (170+ words)  
Show how Gate ${gateNumber} creates patterns that mirror between ${userName}'s inner world and external experiences. Help them recognize these connections.

**Vibration - Your Energetic Signature** (170+ words)
Describe the unique energy frequency that Gate ${gateNumber} contributes to ${userName}'s overall presence and how others experience them.

**Polarity - Light & Shadow Dance** (170+ words)
Explore both the challenging and empowering expressions of this gate in ${userName}'s life. Help them see both sides as valuable.

**Rhythm - Natural Cycles & Timing** (170+ words)
Reveal the natural cycles and timing patterns of Gate ${gateNumber} in ${userName}'s life and how to work with these rhythms.

**Causation - Conscious Activation** (170+ words)
Show ${userName} how to consciously work with this gate's energy to create positive outcomes in their life.

**Gender - Creative & Receptive Flow** (170+ words)
Explore the active and receptive aspects of this gate and how ${userName} can balance these energies for optimal expression.

Write as if you're helping ${userName} understand a powerful aspect of their authentic self, making the insights practical and personally meaningful.`;
}

function getPersonalizedIntelligencePrompt(agent: string, dimensionName: string, blueprint: any): string {
  const { tone, approach, pacing } = determineWritingStyle(blueprint);
  const userName = blueprint.basic_info?.first_name || 'this individual';
  
  return `You are an expert analyst of the ${dimensionName} dimension of human intelligence. Create a captivating, personalized analysis for ${userName} that reveals how this dimension operates uniquely in their life. Your writing should be ${tone}, using an ${approach} narrative with ${pacing} delivery.

Create an engaging 700-900 word analysis that explores ${userName}'s ${dimensionName} patterns with depth and practical insight.

Structure your analysis:

**Personal Recognition** (120+ words)
Begin by connecting with how ${userName} already experiences their ${dimensionName} dimension. Help them recognize patterns they've lived but maybe never named.

**Core Architecture** (200+ words)
Reveal the fundamental structure of how ${userName}'s ${dimensionName} dimension operates. Be specific about their unique patterns and tendencies.

**Daily Life Expression** (200+ words)
Show how this dimension influences ${userName}'s daily decisions, relationships, and life experiences. Use concrete examples they would recognize.

**Growth Opportunities** (120+ words)
Address areas where ${userName} could develop greater awareness and skill within this dimension. Present growth as exciting possibility, not criticism.

**Integration Practices** (100+ words)
Offer practical suggestions tailored to ${userName}'s personality type for developing this dimension more consciously.

Write with genuine insight into ${userName}'s experience, helping them understand this aspect of their intelligence as both a current reality and an area for conscious development.`;
}

function getPersonalizedSynthesisPrompt(synthesisType: string, blueprint: any, expectedWords: number): string {
  const { tone, approach, pacing } = determineWritingStyle(blueprint);
  const userName = blueprint.basic_info?.first_name || 'this individual';
  
  if (synthesisType === 'comprehensive_overview') {
    return `You are a master synthesizer creating ${userName}'s comprehensive personality overview. Write in a ${tone} style with an ${approach} approach and ${pacing} organization. 

Create a captivating ${expectedWords.toLocaleString()}+ word comprehensive overview that feels like ${userName}'s personal guide to self-understanding. This should read like the opening section of their personalized handbook for living authentically.

Structure this epic synthesis:

**${userName}'s Unique Signature** (2,000+ words)
Open with who ${userName} is at their core - the unique constellation of traits, gifts, and perspectives that make them unmistakably themselves.

**The Seven Laws in ${userName}'s Life** (3,000+ words) 
Synthesize how all 7 Hermetic Laws operate specifically in ${userName}'s life, creating their unique blueprint for living.

**Shadow & Light Integration** (3,000+ words)
Weave together all shadow work insights into ${userName}'s personal journey of growth and self-acceptance.

**Energy & Gates Synthesis** (2,000+ words)
Synthesize their Human Design gates into a coherent understanding of ${userName}'s energetic gifts and life patterns.

**Intelligence Architecture** (2,000+ words)
Combine all intelligence dimensions into a map of how ${userName}'s mind works and processes reality.

**Living Your Design** (2,000+ words)
Synthesize all practical guidance into ${userName}'s personalized roadmap for authentic living.

**${userName}'s Unique Contribution** (1,000+ words)
End with an inspiring vision of the unique gift ${userName} is here to share with the world.

Write every section to feel personally relevant to ${userName}, helping them see themselves clearly and embrace their authentic path.`;
  }
  
  // Other synthesis types with similar personalization...
  return `You are creating a ${synthesisType} synthesis for ${userName}. Write in a ${tone} style with ${pacing} organization. Generate ${expectedWords}+ words of deeply personal insight that helps ${userName} understand and integrate all aspects of their analysis.`;
}

// ============ HELPER FUNCTIONS ============
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