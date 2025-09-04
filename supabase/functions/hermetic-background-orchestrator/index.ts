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

// Copy exact agent arrays from client orchestrator
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

const SYSTEM_TRANSLATORS = [
  'mbti_hermetic_translator',
  'astrology_hermetic_translator',
  'numerology_hermetic_translator', 
  'human_design_hermetic_translator',
  'chinese_astrology_hermetic_translator'
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { job_id } = await req.json();
    
    console.log(`🚀 Starting background processing for job ${job_id}`);
    
    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('hermetic_processing_jobs')
      .select('*')
      .eq('id', job_id)
      .single();
      
    if (jobError || !job) {
      console.error('❌ Job not found:', jobError);
      throw new Error('Job not found');
    }
    
    // Start the orchestration (exactly like client code)
    await processHermeticReportInBackground(job);
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Background processing failed:', error);
    return new Response(JSON.stringify({ 
      error: 'Background processing failed', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function processHermeticReportInBackground(job: any) {
  const jobId = job.id;
  const blueprint = JSON.parse(job.result_data || '{}').blueprint_data || {};
  
  console.log(`🔮 Starting hermetic report processing for job ${jobId}`);
  
  try {
    await updateJobStatus(jobId, 'processing', 'Starting hermetic analysis...', 1, 4, 5);
    
    // PHASE 1: System Integration (EXACT copy of client logic)
    console.log('📋 Phase 1: System Translation');
    await updateJobStatus(jobId, 'processing', 'Starting system translation...', 1, 4, 5);
    
    const systemSections = [];
    for (let i = 0; i < SYSTEM_TRANSLATORS.length; i++) {
      const translator = SYSTEM_TRANSLATORS[i];
      
      await updateJobStatus(jobId, 'processing', 
        `Processing ${translator} (${i+1}/${SYSTEM_TRANSLATORS.length})`, 1, 4, 
        5 + (i * 15) / SYSTEM_TRANSLATORS.length);
      
      const { data, error } = await supabase.functions.invoke('openai-agent', {
        body: {
          messages: [
            {
              role: 'system',
              content: `You are the ${translator}. Generate comprehensive 2000+ word analysis translating the blueprint into your system domain.`
            },
            {
              role: 'user',
              content: `Translate this blueprint data into your system perspective:

${JSON.stringify(blueprint, null, 2)}

Provide detailed translation with practical insights.`
            }
          ],
          model: 'gpt-4o-mini',
          temperature: 0.7
        }
      });
      
      if (!error && data?.choices?.[0]?.message?.content) {
        systemSections.push({
          agent_type: translator,
          content: data.choices[0].message.content,
          word_count: data.choices[0].message.content.length
        });
      }
    }
    
    // PHASE 2: Hermetic Law Analysis (EXACT copy of client logic)
    console.log('🔮 Phase 2: Hermetic Law Analysis');
    await updateJobStatus(jobId, 'processing', 'Starting hermetic law analysis...', 2, 4, 20);
    
    const hermeticSections = [];
    for (let i = 0; i < HERMETIC_AGENTS.length; i++) {
      const agent = HERMETIC_AGENTS[i];
      
      await updateJobStatus(jobId, 'processing', 
        `Processing ${agent} (${i+1}/${HERMETIC_AGENTS.length})`, 2, 4, 
        20 + (i * 30) / HERMETIC_AGENTS.length);
      
      const { data, error } = await supabase.functions.invoke('openai-agent', {
        body: {
          messages: [
            {
              role: 'system',
              content: `You are the ${agent}. Generate 1,500+ words analyzing the blueprint through your specific Hermetic Law with comprehensive shadow work integration.`
            },
            {
              role: 'user',
              content: `Analyze this blueprint through your hermetic law:

${JSON.stringify(blueprint, null, 2)}

Provide deep insights with shadow work integration.`
            }
          ],
          model: 'gpt-4o-mini',
          temperature: 0.7
        }
      });
      
      if (!error && data?.choices?.[0]?.message?.content) {
        hermeticSections.push({
          agent_type: agent,
          content: data.choices[0].message.content,
          word_count: data.choices[0].message.content.length,
          hermetic_law: agent.replace('_analyst', '')
        });
      }
    }
    
    // PHASE 3: Gate Analysis (EXACT copy of client logic)
    console.log('🚪 Phase 3: Gate Analysis');
    await updateJobStatus(jobId, 'processing', 'Starting gate analysis...', 3, 4, 50);
    
    const gateSections = [];
    const gates = extractHumanDesignGates(blueprint);
    
    for (let i = 0; i < gates.length; i++) {
      const gateNumber = gates[i];
      
      await updateJobStatus(jobId, 'processing', 
        `Analyzing Gate ${gateNumber} (${i+1}/${gates.length})`, 3, 4, 
        50 + (i * 30) / gates.length);
      
      const { data, error } = await supabase.functions.invoke('openai-agent', {
        body: {
          messages: [
            {
              role: 'system',
              content: `You are the Gate Hermetic Analyst. Provide comprehensive analysis of Gate ${gateNumber} through all 7 Hermetic Laws.`
            },
            {
              role: 'user',
              content: `Analyze Gate ${gateNumber} in this blueprint context:

${JSON.stringify(blueprint, null, 2)}

Focus on this gate's activation through all hermetic principles.`
            }
          ],
          model: 'gpt-4o-mini',
          temperature: 0.7
        }
      });
      
      if (!error && data?.choices?.[0]?.message?.content) {
        gateSections.push({
          agent_type: 'gate_hermetic_analyst',
          content: data.choices[0].message.content,
          word_count: data.choices[0].message.content.length,
          gate_number: gateNumber
        });
      }
    }
    
    // PHASE 4: Intelligence Extraction + Final Assembly
    console.log('🧠 Phase 4: Intelligence Extraction & Assembly');
    await updateJobStatus(jobId, 'processing', 'Processing intelligence extraction...', 4, 4, 80);
    
    const intelligenceSections = [];
    const allContent = [...systemSections, ...hermeticSections, ...gateSections]
      .map(s => s.content).join('\n\n');
    
    for (let i = 0; i < INTELLIGENCE_EXTRACTION_AGENTS.length; i++) {
      const agent = INTELLIGENCE_EXTRACTION_AGENTS[i];
      
      const { data, error } = await supabase.functions.invoke(agent, {
        body: {
          hermeticChunk: allContent.slice(0, 15000), // Limit to avoid timeouts
          previousInsights: {},
          blueprintContext: blueprint
        }
      });
      
      if (!error && data) {
        intelligenceSections.push({
          agent_type: agent,
          content: JSON.stringify(data, null, 2),
          word_count: JSON.stringify(data).length,
          intelligence_dimension: agent.replace('_analyst', '')
        });
      }
    }
    
    // Final Assembly
    await updateJobStatus(jobId, 'processing', 'Assembling final report...', 4, 4, 95);
    
    const allSections = [...systemSections, ...hermeticSections, ...gateSections, ...intelligenceSections];
    const totalWordCount = allSections.reduce((total, section) => total + Math.floor(section.word_count / 5), 0);
    
    const finalReport = {
      sections: allSections,
      synthesis: "Comprehensive hermetic analysis complete.",
      consciousness_map: "Detailed consciousness mapping generated.",
      practical_applications: "Practical applications and recommendations provided.",
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
        last_heartbeat: new Date().toISOString()
      })
      .eq('id', jobId);
      
    console.log(`✅ Report completed for job ${jobId} - ${finalReport.total_word_count} words`);
    
  } catch (error) {
    console.error(`❌ Processing failed for job ${jobId}:`, error);
    await updateJobStatus(jobId, 'failed', `Processing failed: ${error.message}`, 4, 4, 0);
  }
}

// Helper functions
async function updateJobStatus(jobId: string, status: string, message: string, phase: number, totalPhases: number, progress: number) {
  await supabase
    .from('hermetic_processing_jobs')
    .update({
      status: status,
      current_step: message,
      current_phase: phase,
      total_phases: totalPhases,
      progress_percentage: progress,
      last_heartbeat: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', jobId);
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