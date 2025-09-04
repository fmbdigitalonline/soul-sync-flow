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
    const { job_id } = await req.json();
    
    console.log(`🚀 Relay orchestrator invoked for job ${job_id}`);
    
    // 1. Get the job's CURRENT state from the database
    const { data: job, error: jobError } = await supabase
      .from('hermetic_processing_jobs')
      .select('*')
      .eq('id', job_id)
      .single();
      
    if (jobError || !job) {
      throw new Error(`Job not found or error fetching: ${jobError?.message}`);
    }
    
    if (job.status === 'completed' || job.status === 'failed') {
      console.log(`Job ${job_id} is already completed or failed. Stopping.`);
      return new Response(JSON.stringify({ message: "Job already finalized." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 2. Determine the next step to perform based on the job's state
    let nextStage = job.current_stage;
    let nextStepIndex = job.current_step_index;
    let progressPercentage = 0;

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
      console.log(`Finalizing report for job ${job_id}`);
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
      .eq('id', job_id);

    // 4. CRITICAL: Trigger the next step by invoking itself (fire-and-forget)
    supabase.functions.invoke('hermetic-background-orchestrator', {
      body: { job_id: job.id }
    }).catch(error => {
      console.error('Failed to trigger next step:', error);
    });

    console.log(`✅ Step completed, next step queued: ${nextStage}[${nextStepIndex}]`);

  } catch (error) {
    console.error(`❌ Orchestrator failed for job ${job_id}:`, error);
    await supabase
      .from('hermetic_processing_jobs')
      .update({ 
        status: 'failed', 
        current_step: `Error: ${error.message}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', job_id);
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
      model: 'gpt-4o-mini',
      temperature: 0.6
    }
  });
  
  if (error) throw new Error(`Failed on translator ${translator}: ${error.message}`);
  
  if (data?.choices?.[0]?.message?.content) {
    const progressData = job.progress_data || {};
    const systemSections = progressData.system_sections || [];
    
    systemSections.push({
      agent_type: translator,
      content: data.choices[0].message.content,
      word_count: data.choices[0].message.content.length
    });
    
    await supabase
      .from('hermetic_processing_jobs')
      .update({ 
        progress_data: { ...progressData, system_sections: systemSections },
        last_heartbeat: new Date().toISOString()
      })
      .eq('id', jobId);
  }
}

async function processSingleHermeticAgent(job: any, agent: string) {
  const { id: jobId, blueprint_data: blueprint } = job;

  await updateJobStatus(jobId, 'processing', `Processing ${agent}...`);
  
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
      model: 'gpt-4o-mini',
      temperature: 0.7
    }
  });
  
  if (error) throw new Error(`Failed on agent ${agent}: ${error.message}`);
  
  if (data?.choices?.[0]?.message?.content) {
    const progressData = job.progress_data || {};
    const hermeticSections = progressData.hermetic_sections || [];
    
    hermeticSections.push({
      agent_type: agent,
      content: data.choices[0].message.content,
      word_count: data.choices[0].message.content.length,
      hermetic_law: agent.replace('_analyst', '')
    });
    
    await supabase
      .from('hermetic_processing_jobs')
      .update({ 
        progress_data: { ...progressData, hermetic_sections: hermeticSections },
        last_heartbeat: new Date().toISOString()
      })
      .eq('id', jobId);
  }
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
      model: 'gpt-4o-mini',
      temperature: 0.7
    }
  });
  
  if (error) throw new Error(`Failed on gate ${gateNumber}: ${error.message}`);
  
  if (data?.choices?.[0]?.message?.content) {
    const progressData = job.progress_data || {};
    const gateSections = progressData.gate_sections || [];
    
    gateSections.push({
      agent_type: 'gate_hermetic_analyst',
      content: data.choices[0].message.content,
      word_count: data.choices[0].message.content.length,
      gate_number: gateNumber
    });
    
    await supabase
      .from('hermetic_processing_jobs')
      .update({ 
        progress_data: { ...progressData, gate_sections: gateSections },
        last_heartbeat: new Date().toISOString()
      })
      .eq('id', jobId);
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
      model: 'gpt-4o-mini',
      temperature: 0.7
    }
  });
  
  if (error) throw new Error(`Failed on intelligence agent ${agent}: ${error.message}`);
  
  if (data?.choices?.[0]?.message?.content) {
    const progressData = job.progress_data || {};
    const intelligenceSections = progressData.intelligence_sections || [];
    
    intelligenceSections.push({
      agent_type: agent,
      content: data.choices[0].message.content,
      word_count: data.choices[0].message.content.length,
      intelligence_dimension: dimensionName
    });
    
    await supabase
      .from('hermetic_processing_jobs')
      .update({ 
        progress_data: { ...progressData, intelligence_sections: intelligenceSections },
        last_heartbeat: new Date().toISOString()
      })
      .eq('id', jobId);
  }
}

async function finalizeReport(job: any) {
  const { id: jobId, blueprint_data: blueprint, progress_data } = job;
  
  await updateJobStatus(jobId, 'processing', 'Assembling final report...');
  
  // Combine all sections
  const systemSections = progress_data?.system_sections || [];
  const hermeticSections = progress_data?.hermetic_sections || [];
  const gateSections = progress_data?.gate_sections || [];
  const intelligenceSections = progress_data?.intelligence_sections || [];
  
  const finalSections = [...systemSections, ...hermeticSections, ...gateSections, ...intelligenceSections];
  const totalWordCount = finalSections.reduce((total, section) => total + Math.floor(section.word_count / 5), 0);
  
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
  
  // Save completed report
  await supabase
    .from('hermetic_processing_jobs')
    .update({
      status: 'completed',
      result_data: finalReport,
      completed_at: new Date().toISOString(),
      current_step: `Report completed! ${finalReport.total_word_count} words generated.`,
      progress_percentage: 100,
      last_heartbeat: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', jobId);
    
  console.log(`✅ Report completed for job ${jobId} - ${finalReport.total_word_count} words`);
}

// ============ HELPER FUNCTIONS ============

async function updateJobStatus(jobId: string, status: string, message: string) {
  const { error } = await supabase
    .from('hermetic_processing_jobs')
    .update({
      status: status,
      current_step: message,
      last_heartbeat: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
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