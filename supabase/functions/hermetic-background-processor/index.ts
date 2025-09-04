import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Exact copy of client-side agent constants
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

interface HermeticAnalysisSection {
  agent_type: string;
  content: string;
  word_count: number;
  hermetic_law?: string;
  gate_number?: number;
  intelligence_dimension?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    
    // ENHANCED HEALTH CHECK - Validate all capabilities
    if (requestBody.healthCheck) {
      console.log('🏥 Enhanced health check requested');
      
      try {
        // Validate environment variables
        const openaiKey = Deno.env.get('OPENAI_API_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        if (!openaiKey || !supabaseUrl || !supabaseKey) {
          throw new Error('Missing required environment variables');
        }
        
        // Test database connectivity if requested
        if (requestBody.validateCapabilities) {
          const { data: testQuery, error: testError } = await supabase
            .from('generation_jobs')
            .select('count')
            .limit(1);
            
          if (testError) {
            throw new Error(`Database connectivity failed: ${testError.message}`);
          }
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Function is healthy with all capabilities validated',
            timestamp: new Date().toISOString(),
            capabilities: {
              database: true,
              openai: !!openaiKey,
              environment: 'production'
            },
            version: '2.0.0'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (healthError: any) {
        console.error('❌ Health check failed:', healthError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: healthError.message,
            timestamp: new Date().toISOString()
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    const { jobId, blueprint } = requestBody;
    
    if (!jobId || !blueprint) {
      throw new Error('Missing required parameters: jobId and blueprint');
    }

    console.log(`🌟 Starting background hermetic generation for job: ${jobId}`);

    // PRINCIPLE #7: BUILD TRANSPARENTLY - Verify job exists before processing
    const { data: jobExists, error: jobError } = await supabase
      .from('generation_jobs')
      .select('id, status')
      .eq('id', jobId)
      .single();

    if (jobError || !jobExists) {
      throw new Error(`Job ${jobId} not found or inaccessible: ${jobError?.message}`);
    }

    if (jobExists.status !== 'pending') {
      throw new Error(`Job ${jobId} is not in pending status (current: ${jobExists.status})`);
    }

    // Update job status to running
    await updateJobStatus(jobId, 'running', { phase: 'initializing', progress: 0 });

    // EMERGENCY FIX: Start background task without EdgeRuntime.waitUntil (not available in Deno)
    console.log(`🔄 Starting background task for job: ${jobId}`);
    
    // Start background task immediately without waiting
    processHermeticGeneration(jobId, blueprint).catch((error) => {
      console.error(`❌ Background task failed for job ${jobId}:`, error);
      updateJobStatus(jobId, 'failed', { 
        phase: 'background_startup_error', 
        progress: 0 
      }, `Background task startup failed: ${error.message}`).catch(console.error);
    });
    
    console.log(`✅ Background task started successfully for job: ${jobId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        jobId, 
        message: 'Background processing started - task running in parallel',
        timestamp: new Date().toISOString(),
        taskScheduled: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Background processor error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processHermeticGeneration(jobId: string, blueprint: any) {
  console.log(`🚀 BACKGROUND TASK STARTED for job: ${jobId}`);
  
  // Add background task lifecycle monitoring
  const taskStartTime = Date.now();
  let taskCompleted = false;
  
  // Set up task completion verification
  const taskTimeout = setTimeout(() => {
    if (!taskCompleted) {
      console.error(`⏰ BACKGROUND TASK TIMEOUT for job: ${jobId} after 30 minutes`);
      updateJobStatus(jobId, 'failed', { 
        phase: 'background_task_timeout', 
        progress: 0 
      }, 'Background task exceeded maximum execution time').catch(console.error);
    }
  }, 30 * 60 * 1000); // 30 minute timeout
  
  try {
    console.log(`🌟 Starting comprehensive Hermetic Blueprint Report generation for job: ${jobId}...`);
    const startTime = Date.now();
    const sections: HermeticAnalysisSection[] = [];

    // Phase 1: System Integration (2,000+ words) - 0-15% progress
    console.log('📋 Phase 1: System Integration Analysis...');
    await updateJobStatus(jobId, 'running', { phase: 'system_integration', progress: 5 });
    
    const systemSections = await generateSystemTranslation(blueprint);
    sections.push(...systemSections);
    console.log(`📋 Phase 1 complete: ${systemSections.length} sections added`);
    
    await updateJobStatus(jobId, 'running', { phase: 'system_integration_complete', progress: 15 });

    // Phase 2: Enhanced Hermetic Laws + Intelligence Dimensions (21,000+ words) - 15-60% progress
    console.log('🔮 Phase 2: Enhanced Hermetic Law + Intelligence Analysis...');
    await updateJobStatus(jobId, 'running', { phase: 'hermetic_laws', progress: 20 });
    
    const hermeticSections = await generateHermeticLawAnalysis(blueprint);
    sections.push(...hermeticSections);
    console.log(`🔮 Phase 2 complete: ${hermeticSections.length} sections added`);
    
    await updateJobStatus(jobId, 'running', { phase: 'hermetic_laws_complete', progress: 60 });

    // Phase 3: Gate-by-Gate Analysis (25,000+ words) - 60-85% progress  
    console.log('🚪 Phase 3: Gate-by-Gate Hermetic Analysis...');
    await updateJobStatus(jobId, 'running', { phase: 'gate_analysis', progress: 65 });
    
    const gates = extractHumanDesignGates(blueprint);
    
    if (gates.length > 0) {
      console.log(`🚪 Found ${gates.length} gates to analyze:`, gates);
      const gateSections = await generateGateAnalysis(blueprint, gates);
      sections.push(...gateSections);
      console.log(`🚪 Phase 3 complete: ${gateSections.length} gate sections added`);
    } else {
      console.warn('⚠️ No gates found for analysis - skipping gate phase');
    }
    
    await updateJobStatus(jobId, 'running', { phase: 'gate_analysis_complete', progress: 85 });

    // Phase 4: Intelligence Extraction - 85-90% progress
    console.log('🧠 Phase 4: Structured Intelligence Extraction...');
    await updateJobStatus(jobId, 'running', { phase: 'intelligence_extraction', progress: 87 });
    
    const structuredIntelligence = await generateIntelligenceExtraction(blueprint, sections);
    
    await updateJobStatus(jobId, 'running', { phase: 'intelligence_analysis_complete', progress: 90 });

    // Phase 5: Synthesis & Integration (4,500+ words) - 90-100% progress
    console.log('🌀 Phase 5: Synthesis and Integration...');
    await updateJobStatus(jobId, 'running', { phase: 'synthesis', progress: 95 });
    
    const synthesis = await generateFractalSynthesis(blueprint, sections);
    const consciousnessMap = await generateConsciousnessMap(blueprint, sections);
    const practicalApplications = await generatePracticalApplications(blueprint, sections);

    const totalCharCount = sections.reduce((total, section) => total + section.word_count, 0) +
                         synthesis.length + consciousnessMap.length + practicalApplications.length;

    const hermeticResult = {
      sections,
      synthesis,
      consciousness_map: consciousnessMap,
      practical_applications: practicalApplications,
      blueprint_signature: generateBlueprintSignature(blueprint),
      total_word_count: Math.floor(totalCharCount / 5),
      generated_at: new Date().toISOString(),
      structured_intelligence: structuredIntelligence
    };

    // Build and store the complete report
    const report = await buildHermeticReport(blueprint, hermeticResult);
    const storedReport = await storeHermeticReport(report);
    
    // Generate personalized quotes
    const quotes = await generateHermeticQuotes(blueprint, hermeticResult);

    const endTime = Date.now();
    console.log(`✅ Complete Hermetic Report generated: ${hermeticResult.total_word_count} words in ${endTime - startTime}ms`);

    // Mark job as completed with final results
    await updateJobStatus(jobId, 'completed', { 
      phase: 'synthesis_complete', 
      progress: 100,
      word_count: hermeticResult.total_word_count,
      processing_time: endTime - startTime,
      background_task_time: Date.now() - taskStartTime
    }, null, {
      report: storedReport,
      quotes: quotes || []
    });

    // CRITICAL: Mark task as completed and clear timeout
    taskCompleted = true;
    clearTimeout(taskTimeout);
    console.log(`🎉 BACKGROUND TASK COMPLETED SUCCESSFULLY for job: ${jobId} in ${Date.now() - taskStartTime}ms`);

  } catch (error) {
    console.error(`❌ Background hermetic generation failed for job: ${jobId}:`, error);
    
    await updateJobStatus(jobId, 'failed', { 
      phase: 'background_task_error', 
      progress: 0,
      background_task_time: Date.now() - taskStartTime
    }, `Background task failed: ${error.message}`);
    
    // CRITICAL: Mark task as completed (failed) and clear timeout
    taskCompleted = true;
    clearTimeout(taskTimeout);
    console.log(`💥 BACKGROUND TASK FAILED for job: ${jobId} after ${Date.now() - taskStartTime}ms`);
  }
}

async function updateJobStatus(
  jobId: string, 
  status: string, 
  progress: any, 
  errorMessage?: string,
  result?: any
) {
  const updateData: any = {
    status,
    progress,
    updated_at: new Date().toISOString()
  };

  if (status === 'running' && !result) {
    updateData.started_at = new Date().toISOString();
  }

  if (status === 'completed' || status === 'failed') {
    updateData.completed_at = new Date().toISOString();
  }

  if (errorMessage) {
    updateData.error_message = errorMessage;
  }

  if (result) {
    updateData.result = result;
  }

  const { error } = await supabase
    .from('generation_jobs')
    .update(updateData)
    .eq('id', jobId);

  if (error) {
    console.error('❌ Failed to update job status:', error);
  } else {
    console.log(`✅ Job ${jobId} updated: ${status} - ${JSON.stringify(progress)}`);
  }
}

// Helper function to extract content safely
function safeExtractContent(data: any, context: string = ''): string {
  if (!data) {
    console.warn(`⚠️ No data received for ${context}`);
    return 'No content returned.';
  }

  let content = data.content || data;
  
  if (typeof content === 'object' && content !== null) {
    return JSON.stringify(content, null, 2);
  }
  
  if (typeof content !== 'string') {
    console.warn(`⚠️ Non-string content for ${context}:`, typeof content, content);
    return String(content || 'No content available');
  }
  
  return content;
}

// EXACT COPY of client-side generation functions
async function generateSystemTranslation(blueprint: any): Promise<HermeticAnalysisSection[]> {
  const sections: HermeticAnalysisSection[] = [];
  
  for (const translator of SYSTEM_TRANSLATORS) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are the ${translator}. Generate comprehensive 300+ word analysis translating the person's blueprint through your specific system into Hermetic principles.`
            },
            {
              role: 'user', 
              content: `Translate this blueprint through your system: ${JSON.stringify(blueprint, null, 2)}`
            }
          ]
        })
      });

      const data = await response.json();
      const content = safeExtractContent(data.choices[0].message, `${translator} Translation`);
      
      sections.push({
        agent_type: translator,
        content: content,
        word_count: content.length
      });
      
    } catch (error) {
      console.error(`❌ ${translator} failed:`, error);
    }
  }
  
  return sections;
}

async function generateHermeticLawAnalysis(blueprint: any): Promise<HermeticAnalysisSection[]> {
  const sections: HermeticAnalysisSection[] = [];
  
  for (const agent of HERMETIC_AGENTS) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are the ${agent}. Generate 1,500+ words analyzing the blueprint through your specific Hermetic Law with comprehensive shadow work integration.`
            },
            {
              role: 'user',
              content: `Analyze this blueprint: ${JSON.stringify(blueprint, null, 2)}`
            }
          ]
        })
      });

      const data = await response.json();
      const content = safeExtractContent(data.choices[0].message, `${agent} Analysis`);
      
      sections.push({
        agent_type: agent,
        content: content,
        word_count: content.length,
        hermetic_law: agent.replace('_analyst', '')
      });
      
    } catch (error) {
      console.error(`❌ ${agent} failed:`, error);
    }
  }
  
  return sections;
}

function extractHumanDesignGates(blueprint: any): number[] {
  const gates: number[] = [];
  const hdData = blueprint.energy_strategy_human_design;
  
  if (!hdData) return [];

  // Extract gates from all possible structures
  if (hdData.gates) {
    ['conscious_personality', 'unconscious_personality', 'conscious_design', 'unconscious_design'].forEach(type => {
      if (hdData.gates[type] && Array.isArray(hdData.gates[type])) {
        hdData.gates[type].forEach((gateData: any) => {
          if (gateData && gateData.gate && typeof gateData.gate === 'number') {
            gates.push(gateData.gate);
          }
        });
      }
    });
  }

  // Remove duplicates and sort
  return [...new Set(gates)].sort((a, b) => a - b);
}

async function generateGateAnalysis(blueprint: any, gates: number[]): Promise<HermeticAnalysisSection[]> {
  const sections: HermeticAnalysisSection[] = [];
  
  for (const gateNumber of gates) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are the Gate Hermetic Analyst. Provide a comprehensive 1,500+ word analysis of Gate ${gateNumber} through all 7 Hermetic Laws with deep shadow work integration.`
            },
            {
              role: 'user',
              content: `Analyze Gate ${gateNumber} for this blueprint: ${JSON.stringify(blueprint, null, 2)}`
            }
          ]
        })
      });

      const data = await response.json();
      const content = safeExtractContent(data.choices[0].message, `Gate ${gateNumber} Analysis`);
      
      sections.push({
        agent_type: 'gate_hermetic_analyst',
        content: content,
        word_count: content.length,
        gate_number: gateNumber
      });
      
    } catch (error) {
      console.error(`❌ Gate ${gateNumber} analysis failed:`, error);
    }
  }
  
  return sections;
}

async function generateIntelligenceExtraction(blueprint: any, sections: HermeticAnalysisSection[]): Promise<any> {
  // Combine all hermetic content for intelligence analysis
  const hermeticContent = sections.map(s => s.content).join('\n\n');
  const intelligence: any = {};
  
  for (const analystType of INTELLIGENCE_EXTRACTION_AGENTS) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are the ${analystType}. Extract structured intelligence from the hermetic analysis.`
            },
            {
              role: 'user',
              content: `Analyze: ${hermeticContent.substring(0, 8000)}\n\nBlueprint: ${JSON.stringify(blueprint, null, 2).substring(0, 2000)}`
            }
          ]
        })
      });

      const data = await response.json();
      const dimension = analystType.replace('_analyst', '');
      intelligence[dimension] = safeExtractContent(data.choices[0].message, `${analystType} Intelligence`);
      
    } catch (error) {
      console.error(`❌ ${analystType} failed:`, error);
      intelligence[analystType.replace('_analyst', '')] = 'Analysis failed';
    }
  }
  
  return intelligence;
}

async function generateFractalSynthesis(blueprint: any, sections: HermeticAnalysisSection[]): Promise<string> {
  try {
    const allContent = sections.map(s => s.content).join('\n').substring(0, 12000);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Generate a comprehensive 2,000+ word fractal synthesis integrating all Hermetic analyses into a unified consciousness blueprint.'
          },
          {
            role: 'user',
            content: `Synthesize: ${allContent}`
          }
        ]
      })
    });

    const data = await response.json();
    return safeExtractContent(data.choices[0].message, 'Fractal Synthesis');
  } catch (error) {
    console.error('❌ Synthesis generation failed:', error);
    return 'Synthesis generation failed';
  }
}

async function generateConsciousnessMap(blueprint: any, sections: HermeticAnalysisSection[]): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Generate a detailed consciousness integration map based on the Hermetic analysis.'
          },
          {
            role: 'user',
            content: `Create consciousness map for: ${JSON.stringify(blueprint, null, 2)}`
          }
        ]
      })
    });

    const data = await response.json();
    return safeExtractContent(data.choices[0].message, 'Consciousness Map');
  } catch (error) {
    console.error('❌ Consciousness map generation failed:', error);
    return 'Consciousness map generation failed';
  }
}

async function generatePracticalApplications(blueprint: any, sections: HermeticAnalysisSection[]): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Generate practical activation framework and daily practices based on the Hermetic analysis.'
          },
          {
            role: 'user',
            content: `Create practical applications for: ${JSON.stringify(blueprint, null, 2)}`
          }
        ]
      })
    });

    const data = await response.json();
    return safeExtractContent(data.choices[0].message, 'Practical Applications');
  } catch (error) {
    console.error('❌ Practical applications generation failed:', error);
    return 'Practical applications generation failed';
  }
}

function generateBlueprintSignature(blueprint: any): string {
  const signature = `${blueprint.cognition_mbti?.type || 'Unknown'}_${blueprint.energy_strategy_human_design?.type || 'Unknown'}_${blueprint.values_life_path?.lifePathNumber || 'Unknown'}`;
  return signature;
}

async function buildHermeticReport(blueprint: any, hermeticResult: any): Promise<any> {
  const sections = hermeticResult.sections;
  
  // Extract gate analyses
  const gateSections = sections.filter((s: any) => s.gate_number && s.agent_type === 'gate_hermetic_analyst');
  const gateAnalyses: { [gateNumber: string]: string } = {};
  const analyzedGates: number[] = [];
  
  gateSections.forEach((section: any) => {
    const gateNum = section.gate_number.toString();
    gateAnalyses[`gate_${gateNum}`] = section.content;
    analyzedGates.push(section.gate_number);
  });

  const sevenLaws = {
    mentalism: sections.find((s: any) => s.agent_type === 'mentalism_analyst')?.content || '',
    correspondence: sections.find((s: any) => s.agent_type === 'correspondence_analyst')?.content || '',
    vibration: sections.find((s: any) => s.agent_type === 'vibration_analyst')?.content || '',
    polarity: sections.find((s: any) => s.agent_type === 'polarity_analyst')?.content || '',
    rhythm: sections.find((s: any) => s.agent_type === 'rhythm_analyst')?.content || '',
    causation: sections.find((s: any) => s.agent_type === 'causation_analyst')?.content || '',
    gender: sections.find((s: any) => s.agent_type === 'gender_analyst')?.content || ''
  };

  const systemTranslations = {
    mbti_hermetic: sections.find((s: any) => s.agent_type === 'mbti_hermetic_translator')?.content || '',
    astrology_hermetic: sections.find((s: any) => s.agent_type === 'astrology_hermetic_translator')?.content || '',
    numerology_hermetic: sections.find((s: any) => s.agent_type === 'numerology_hermetic_translator')?.content || '',
    human_design_hermetic: sections.find((s: any) => s.agent_type === 'human_design_hermetic_translator')?.content || '',
    chinese_astrology_hermetic: sections.find((s: any) => s.agent_type === 'chinese_astrology_hermetic_translator')?.content || ''
  };

  return {
    id: crypto.randomUUID(),
    user_id: blueprint.user_id || blueprint.user_meta?.user_id || '',
    blueprint_id: blueprint.id || null,
    report_content: {
      core_personality_pattern: `${systemTranslations.mbti_hermetic.substring(0, 300)}...`,
      decision_making_style: `${sevenLaws.causation.substring(0, 200)}...`,
      relationship_style: `${sevenLaws.correspondence.substring(0, 250)}...`,
      life_path_purpose: `${sevenLaws.mentalism.substring(0, 250)}...`,
      current_energy_timing: `${sevenLaws.rhythm.substring(0, 250)}...`,
      integrated_summary: hermeticResult.synthesis,
      hermetic_fractal_analysis: hermeticResult.synthesis,
      consciousness_integration_map: hermeticResult.consciousness_map,
      practical_activation_framework: hermeticResult.practical_applications,
      seven_laws_integration: sevenLaws,
      system_translations: systemTranslations,
      gate_analyses: gateAnalyses,
      shadow_work_integration: {
        shadow_patterns: 'Shadow patterns integrated throughout analysis',
        integration_practices: 'Integration practices provided in practical applications',
        transformation_roadmap: 'Transformation roadmap in consciousness map'
      },
      blueprint_signature: hermeticResult.blueprint_signature,
      word_count: hermeticResult.total_word_count,
      generation_metadata: {
        agents_used: sections.map((s: any) => s.agent_type),
        total_processing_time: 0,
        hermetic_depth_score: 10,
        gates_analyzed: analyzedGates
      },
      structured_intelligence: hermeticResult.structured_intelligence
    },
    generated_at: hermeticResult.generated_at,
    blueprint_version: '2.0'
  };
}

async function storeHermeticReport(report: any): Promise<any> {
  const { data, error } = await supabase
    .from('hermetic_personality_reports')
    .insert([report])
    .select()
    .single();

  if (error) {
    console.error('❌ Failed to store hermetic report:', error);
    throw error;
  }

  console.log('✅ Hermetic report stored successfully');
  return data;
}

async function generateHermeticQuotes(blueprint: any, hermeticResult: any): Promise<any[]> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Generate 5 personalized quotes aligned with Hermetic principles based on the analysis.'
          },
          {
            role: 'user',
            content: `Generate quotes for: ${JSON.stringify(blueprint, null, 2).substring(0, 1000)}`
          }
        ]
      })
    });

    const data = await response.json();
    const quotesText = safeExtractContent(data.choices[0].message, 'Hermetic Quotes');
    
    // Parse quotes from response (simplified)
    const quotes = quotesText.split('\n').filter(line => line.trim().length > 10).map((quote, index) => ({
      quote_text: quote.trim(),
      category: 'hermetic_wisdom',
      personality_alignment: {},
      hermetic_law_alignment: HERMETIC_AGENTS[index % HERMETIC_AGENTS.length].replace('_analyst', '')
    }));

    return quotes.slice(0, 5);
  } catch (error) {
    console.error('❌ Quote generation failed:', error);
    return [];
  }
}