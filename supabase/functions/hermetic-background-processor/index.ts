import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

// Rate limiting and resilience configuration
const API_CALL_DELAY = 2000; // 2 seconds between API calls
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 3000, 5000]; // Exponential backoff delays
const PHASE_TIMEOUT = 300000; // 5 minutes per phase timeout

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const startTime = Date.now();
  const requestId = crypto.randomUUID().substring(0, 8);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { userId, blueprint, language = 'en' } = await req.json();
    console.log(`🌟 [${requestId}] HERMETIC BACKGROUND PROCESSOR: Starting generation for user ${userId}`);
    console.log(`📋 [${requestId}] Request details:`, {
      userId,
      language,
      blueprintId: blueprint?.id,
      blueprintUserMeta: !!blueprint?.user_meta,
      blueprintSystems: {
        mbti: !!blueprint?.cognition_mbti,
        astrology: !!blueprint?.archetype_western,
        numerology: !!blueprint?.values_life_path,
        humanDesign: !!blueprint?.energy_strategy_human_design,
        chinese: !!blueprint?.archetype_chinese
      }
    });

    if (!userId || !blueprint) {
      throw new Error('User ID and blueprint are required');
    }

    const processStartTime = Date.now();
    let phaseMetrics = {};
    let totalApiCalls = 0;
    let totalWordCount = 0;

    // PHASE 1: System Integration (replicate client-side flow)
    console.log(`📋 [${requestId}] Phase 1: System Integration Analysis...`);
    const phase1Start = Date.now();
    let systemSections = [];
    try {
      systemSections = await executePhaseWithTimeout(
        () => generateSystemTranslation(supabase, blueprint, requestId),
        PHASE_TIMEOUT,
        `Phase 1 System Integration`
      );
      const phase1Duration = Date.now() - phase1Start;
      const phase1Words = systemSections.reduce((total, s) => total + (s.word_count || 0), 0);
      phaseMetrics['phase1_system'] = { duration: phase1Duration, sections: systemSections.length, words: phase1Words, success: true };
      totalApiCalls += systemSections.length;
      totalWordCount += phase1Words;
      console.log(`✅ [${requestId}] Phase 1 completed: ${systemSections.length} sections, ${phase1Words} words, ${phase1Duration}ms`);
    } catch (error) {
      const phase1Duration = Date.now() - phase1Start;
      console.error(`❌ [${requestId}] Phase 1 failed after ${phase1Duration}ms:`, error);
      phaseMetrics['phase1_system'] = { duration: phase1Duration, sections: 0, words: 0, success: false, error: error.message };
      // Continue with empty sections to allow partial completion
    }
    
    // PHASE 2: Hermetic Laws Analysis  
    console.log(`🔮 [${requestId}] Phase 2: Hermetic Law Analysis...`);
    const phase2Start = Date.now();
    let hermeticSections = [];
    try {
      hermeticSections = await executePhaseWithTimeout(
        () => generateHermeticLawAnalysis(supabase, blueprint, requestId),
        PHASE_TIMEOUT,
        `Phase 2 Hermetic Laws`
      );
      const phase2Duration = Date.now() - phase2Start;
      const phase2Words = hermeticSections.reduce((total, s) => total + (s.word_count || 0), 0);
      phaseMetrics['phase2_hermetic'] = { duration: phase2Duration, sections: hermeticSections.length, words: phase2Words, success: true };
      totalApiCalls += hermeticSections.length;
      totalWordCount += phase2Words;
      console.log(`✅ [${requestId}] Phase 2 completed: ${hermeticSections.length} sections, ${phase2Words} words, ${phase2Duration}ms`);
    } catch (error) {
      const phase2Duration = Date.now() - phase2Start;
      console.error(`❌ [${requestId}] Phase 2 failed after ${phase2Duration}ms:`, error);
      phaseMetrics['phase2_hermetic'] = { duration: phase2Duration, sections: 0, words: 0, success: false, error: error.message };
      // Continue with empty sections to allow partial completion
    }
    
    // PHASE 3: Gate Analysis
    console.log(`🚪 [${requestId}] Phase 3: Gate-by-Gate Analysis...`);
    const phase3Start = Date.now();
    const gates = extractHumanDesignGates(blueprint);
    console.log(`🚪 [${requestId}] Extracted ${gates.length} gates:`, gates.sort((a, b) => a - b));
    let gateSections = [];
    try {
      gateSections = gates.length > 0 ? await executePhaseWithTimeout(
        () => generateGateAnalysis(supabase, blueprint, gates, requestId),
        PHASE_TIMEOUT,
        `Phase 3 Gate Analysis`
      ) : [];
      const phase3Duration = Date.now() - phase3Start;
      const phase3Words = gateSections.reduce((total, s) => total + (s.word_count || 0), 0);
      phaseMetrics['phase3_gates'] = { duration: phase3Duration, sections: gateSections.length, words: phase3Words, gatesAnalyzed: gates.length, success: true };
      totalApiCalls += gateSections.length;
      totalWordCount += phase3Words;
      console.log(`✅ [${requestId}] Phase 3 completed: ${gates.length} gates analyzed, ${gateSections.length} sections, ${phase3Words} words, ${phase3Duration}ms`);
    } catch (error) {
      const phase3Duration = Date.now() - phase3Start;
      console.error(`❌ [${requestId}] Phase 3 failed after ${phase3Duration}ms:`, error);
      phaseMetrics['phase3_gates'] = { duration: phase3Duration, sections: 0, words: 0, gatesAnalyzed: gates.length, success: false, error: error.message };
      // Continue with empty sections to allow partial completion
    }
    
    // PHASE 4: Intelligence Analysis
    console.log(`🧠 [${requestId}] Phase 4: Intelligence Analysis...`);
    const phase4Start = Date.now();
    const allSections = [...systemSections, ...hermeticSections, ...gateSections];
    console.log(`🧠 [${requestId}] Intelligence analysis input: ${allSections.length} sections, ${totalWordCount} words so far`);
    const intelligenceResult = await generateIntelligenceAnalysis(supabase, blueprint, allSections, requestId);
    const phase4Duration = Date.now() - phase4Start;
    phaseMetrics['phase4_intelligence'] = { duration: phase4Duration, words: intelligenceResult.word_count || 0 };
    totalApiCalls += 1; // Intelligence analysis is one large API call
    totalWordCount += intelligenceResult.word_count || 0;
    console.log(`✅ [${requestId}] Phase 4 completed: Intelligence analysis ${intelligenceResult.word_count || 0} words, ${phase4Duration}ms`);
    
    // PHASE 5: Synthesis
    console.log(`🌀 [${requestId}] Phase 5: Synthesis...`);
    const phase5Start = Date.now();
    const synthesis = await generateSynthesis(supabase, blueprint, allSections, requestId);
    const consciousnessMap = await generateConsciousnessMap(supabase, blueprint, allSections, requestId);
    const practicalApplications = await generatePracticalApplications(supabase, blueprint, allSections, requestId);
    const phase5Duration = Date.now() - phase5Start;
    const synthesisWords = (synthesis || '').split(' ').length + (consciousnessMap || '').split(' ').length + (practicalApplications || '').split(' ').length;
    phaseMetrics['phase5_synthesis'] = { duration: phase5Duration, words: synthesisWords };
    totalApiCalls += 3; // Three synthesis API calls
    totalWordCount += synthesisWords;
    console.log(`✅ [${requestId}] Phase 5 completed: Synthesis ${synthesisWords} words, ${phase5Duration}ms`);
    
    // PHASE 6: Report Building & Storage
    console.log(`💾 [${requestId}] Phase 6: Building and storing report...`);
    const phase6Start = Date.now();
    const report = await buildAndStoreReport(supabase, blueprint, {
      sections: allSections,
      synthesis,
      consciousness_map: consciousnessMap,
      practical_applications: practicalApplications,
      intelligence_result: intelligenceResult,
      gates_analyzed: gates
    }, requestId);
    const phase6Duration = Date.now() - phase6Start;
    phaseMetrics['phase6_storage'] = { duration: phase6Duration };
    console.log(`✅ [${requestId}] Phase 6 completed: Report stored with ID ${report.id}, ${phase6Duration}ms`);

    // PHASE 7: Quote Generation
    console.log(`💬 [${requestId}] Phase 7: Quote generation...`);
    const phase7Start = Date.now();
    const quotes = await generateHermeticQuotes(supabase, blueprint, allSections, requestId);
    const phase7Duration = Date.now() - phase7Start;
    phaseMetrics['phase7_quotes'] = { duration: phase7Duration, quotes: quotes.length };
    totalApiCalls += 1; // Quote generation is one API call
    console.log(`✅ [${requestId}] Phase 7 completed: ${quotes.length} quotes generated, ${phase7Duration}ms`);

    const totalDuration = Date.now() - startTime;
    const processingDuration = Date.now() - processStartTime;

    // Final metrics logging
    console.log(`🎉 [${requestId}] HERMETIC BACKGROUND PROCESSOR: Generation completed successfully`);
    console.log(`📊 [${requestId}] Final metrics:`, {
      totalDuration: `${totalDuration}ms`,
      processingDuration: `${processingDuration}ms`,
      totalApiCalls,
      totalWordCount,
      phaseBreakdown: phaseMetrics,
      reportId: report.id,
      quotesGenerated: quotes.length
    });

    return new Response(JSON.stringify({ 
      success: true, 
      report,
      quotes,
      message: `Hermetic report generated successfully: ${totalWordCount} words in ${totalDuration}ms`,
      metrics: {
        totalDuration,
        processingDuration,
        totalApiCalls,
        totalWordCount,
        phases: phaseMetrics
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorDuration = Date.now() - startTime;
    console.error(`❌ [${requestId}] HERMETIC BACKGROUND PROCESSOR: Generation failed after ${errorDuration}ms:`, error);
    console.error(`❌ [${requestId}] Error details:`, {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 500)
    });

    return new Response(JSON.stringify({ 
      success: false, 
      error: String(error),
      duration: errorDuration
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Replicate the exact client-side functions here for background processing
async function generateSystemTranslation(supabase: any, blueprint: any, requestId: string) {
  console.log(`📋 [${requestId}] Generating system translation...`);
  const sections = [];
  const translators = [
    'mbti_hermetic_translator',
    'astrology_hermetic_translator', 
    'numerology_hermetic_translator',
    'human_design_hermetic_translator',
    'chinese_astrology_hermetic_translator'
  ];

  console.log(`📋 [${requestId}] Starting ${translators.length} system translation calls`);

  for (let i = 0; i < translators.length; i++) {
    const translator = translators[i];
    console.log(`🔄 [${requestId}] API Call ${i + 1}/${translators.length}: ${translator} starting...`);
    
    // Rate limiting: Add delay between API calls to prevent overwhelming systems
    if (i > 0) {
      console.log(`⏱️ [${requestId}] Rate limiting: Waiting ${API_CALL_DELAY}ms before next API call...`);
      await delay(API_CALL_DELAY);
    }
    
    const result = await makeResilientsAPICall(
      () => supabase.functions.invoke('openai-agent', {
        body: {
          messages: [
            {
              role: 'system',
              content: `You are the ${translator}. Generate 1,000+ words translating this blueprint's system through Hermetic principles.`
            },
            {
              role: 'user',
              content: `Translate this blueprint through Hermetic lens: ${JSON.stringify(blueprint)}`
            }
          ],
          model: 'gpt-4o-mini',
          temperature: 0.7
        }
      }),
      translator,
      requestId
    );

    if (result.success && result.data?.content) {
      const wordCount = result.data.content.split(' ').length;
      sections.push({
        agent_type: translator,
        content: result.data.content,
        word_count: wordCount
      });
      console.log(`✅ [${requestId}] ${translator} completed: ${wordCount} words in ${result.duration}ms`);
    } else {
      console.error(`❌ [${requestId}] ${translator} failed after ${MAX_RETRIES} attempts:`, result.error);
      // Continue processing other translators even if one fails
    }
  }

  console.log(`📋 [${requestId}] System translation complete: ${sections.length}/${translators.length} successful`);
  return sections;
}

async function generateHermeticLawAnalysis(supabase: any, blueprint: any, requestId: string) {
  console.log(`🔮 [${requestId}] Generating Hermetic law analysis...`);
  const sections = [];
  const agents = [
    'mentalism_analyst',
    'correspondence_analyst',
    'vibration_analyst',
    'polarity_analyst',
    'rhythm_analyst',
    'causation_analyst',
    'gender_analyst'
  ];

  console.log(`🔮 [${requestId}] Starting ${agents.length} Hermetic Law analysis calls`);

  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i];
    const lawName = agent.replace('_analyst', '');
    console.log(`🔄 [${requestId}] API Call ${i + 1}/${agents.length}: ${agent} (Law of ${lawName.charAt(0).toUpperCase() + lawName.slice(1)}) starting...`);
    
    // Rate limiting: Add delay between API calls
    if (i > 0) {
      console.log(`⏱️ [${requestId}] Rate limiting: Waiting ${API_CALL_DELAY}ms before next API call...`);
      await delay(API_CALL_DELAY);
    }
    
    const result = await makeResilientsAPICall(
      () => supabase.functions.invoke('openai-agent', {
        body: {
          messages: [
            {
              role: 'system',
              content: `You are the ${agent}. Generate 1,500+ words analyzing through your Hermetic Law with shadow work integration.`
            },
            {
              role: 'user',
              content: `Analyze this blueprint: ${JSON.stringify(blueprint)}`
            }
          ],
          model: 'gpt-4o-mini',
          temperature: 0.7
        }
      }),
      agent,
      requestId
    );

    if (result.success && result.data?.content) {
      const wordCount = result.data.content.split(' ').length;
      sections.push({
        agent_type: agent,
        content: result.data.content,
        word_count: wordCount,
        hermetic_law: lawName
      });
      console.log(`✅ [${requestId}] ${agent} (${lawName}) completed: ${wordCount} words in ${result.duration}ms`);
    } else {
      console.error(`❌ [${requestId}] ${agent} failed after ${MAX_RETRIES} attempts:`, result.error);
      // Continue processing other agents even if one fails
    }
  }

  console.log(`🔮 [${requestId}] Hermetic Laws analysis complete: ${sections.length}/${agents.length} successful`);
  return sections;
}

function extractHumanDesignGates(blueprint: any): number[] {
  const gates: number[] = [];
  const hdData = blueprint.energy_strategy_human_design;
  
  if (!hdData) return [];

  // Extract gates from all possible locations
  if (hdData.gates?.conscious_personality) {
    hdData.gates.conscious_personality.forEach((g: any) => {
      if (g?.gate) gates.push(g.gate);
    });
  }
  
  if (hdData.gates?.unconscious_personality) {
    hdData.gates.unconscious_personality.forEach((g: any) => {
      if (g?.gate) gates.push(g.gate);
    });
  }

  if (hdData.gates?.conscious_design) {
    hdData.gates.conscious_design.forEach((g: any) => {
      if (g?.gate) gates.push(g.gate);
    });
  }

  if (hdData.gates?.unconscious_design) {
    hdData.gates.unconscious_design.forEach((g: any) => {
      if (g?.gate) gates.push(g.gate);
    });
  }

  return [...new Set(gates)].sort((a, b) => a - b);
}

async function generateGateAnalysis(supabase: any, blueprint: any, gates: number[], requestId: string) {
  console.log(`🚪 [${requestId}] Generating analysis for ${gates.length} gates...`);
  const sections = [];
  
  if (gates.length === 0) {
    console.log(`🚪 [${requestId}] No gates to analyze`);
    return sections;
  }

  console.log(`🚪 [${requestId}] Starting ${gates.length} gate analysis calls for gates:`, gates.sort((a, b) => a - b));
  
  for (let i = 0; i < gates.length; i++) {
    const gateNumber = gates[i];
    console.log(`🔄 [${requestId}] API Call ${i + 1}/${gates.length}: Gate ${gateNumber} analysis starting...`);
    
    // Rate limiting: Add delay between API calls for gates (they can be numerous)
    if (i > 0) {
      console.log(`⏱️ [${requestId}] Rate limiting: Waiting ${API_CALL_DELAY}ms before next gate analysis...`);
      await delay(API_CALL_DELAY);
    }
    
    const result = await makeResilientsAPICall(
      () => supabase.functions.invoke('openai-agent', {
        body: {
          messages: [
            {
              role: 'system',
              content: `You are the Gate Hermetic Analyst. Analyze Gate ${gateNumber} through all 7 Hermetic Laws with shadow work. Generate 1,200+ words.`
            },
            {
              role: 'user',
              content: `Analyze Gate ${gateNumber} for this blueprint: ${JSON.stringify(blueprint)}`
            }
          ],
          model: 'gpt-4o-mini',
          temperature: 0.7
        }
      }),
      `gate_${gateNumber}`,
      requestId
    );

    if (result.success && result.data?.content) {
      const wordCount = result.data.content.split(' ').length;
      sections.push({
        agent_type: 'gate_hermetic_analyst',
        content: result.data.content,
        word_count: wordCount,
        gate_number: gateNumber
      });
      console.log(`✅ [${requestId}] Gate ${gateNumber} completed: ${wordCount} words in ${result.duration}ms`);
    } else {
      console.error(`❌ [${requestId}] Gate ${gateNumber} analysis failed after ${MAX_RETRIES} attempts:`, result.error);
      // Continue processing other gates even if one fails
    }
  }

  console.log(`🚪 [${requestId}] Gate analysis complete: ${sections.length}/${gates.length} successful gates analyzed`);
  return sections;
}

async function generateIntelligenceAnalysis(supabase: any, blueprint: any, hermeticSections: any[], requestId: string) {
  console.log(`🧠 [${requestId}] Generating intelligence analysis...`);
  
  // Use the existing intelligence orchestrator pattern
  const hermeticContent = hermeticSections.map(s => s.content).join('\n\n');
  const contentPreview = `${hermeticContent.length} chars from ${hermeticSections.length} sections`;
  const inputSize = Math.min(hermeticContent.length, 50000);
  
  console.log(`🧠 [${requestId}] Intelligence input:`, {
    hermeticSections: hermeticSections.length,
    contentLength: hermeticContent.length,
    inputSizeUsed: inputSize,
    preview: hermeticContent.substring(0, 100) + '...'
  });
  
  const callStart = Date.now();
  console.log(`🔄 [${requestId}] Intelligence analysis API call starting...`);
  
  const { data, error } = await supabase.functions.invoke('openai-agent', {
    body: {
      messages: [
        {
          role: 'system',
          content: 'You are the Intelligence Analyst. Extract structured intelligence patterns from hermetic analysis. Generate 15,000+ words across all 13 intelligence dimensions.'
        },
        {
          role: 'user', 
          content: `Extract intelligence from this hermetic analysis: ${hermeticContent.substring(0, 50000)}`
        }
      ],
      model: 'gpt-4o-mini',
      temperature: 0.7
    }
  });

  const callDuration = Date.now() - callStart;
  const wordCount = data?.content ? data.content.split(' ').length : 0;

  if (!error && data?.content) {
    console.log(`✅ [${requestId}] Intelligence analysis completed: ${wordCount} words in ${callDuration}ms`);
  } else {
    console.error(`❌ [${requestId}] Intelligence analysis failed:`, error);
  }

  return {
    content: data?.content || '',
    word_count: wordCount,
    structured_intelligence: {}
  };
}

async function generateSynthesis(supabase: any, blueprint: any, sections: any[], requestId: string) {
  console.log(`🌀 [${requestId}] Generating synthesis...`);
  const callStart = Date.now();
  
  const { data } = await supabase.functions.invoke('openai-agent', {
    body: {
      messages: [
        {
          role: 'system',
          content: 'Generate a comprehensive synthesis of all hermetic analysis. 2,000+ words.'
        },
        {
          role: 'user',
          content: `Synthesize this analysis: ${JSON.stringify(sections.slice(0, 5))}`
        }
      ],
      model: 'gpt-4o-mini'
    }
  });
  
  const callDuration = Date.now() - callStart;
  const wordCount = data?.content ? data.content.split(' ').length : 0;
  console.log(`✅ [${requestId}] Synthesis completed: ${wordCount} words in ${callDuration}ms`);
  
  return data?.content || 'Synthesis content';
}

async function generateConsciousnessMap(supabase: any, blueprint: any, sections: any[], requestId: string) {
  console.log(`🧭 [${requestId}] Generating consciousness map...`);
  const callStart = Date.now();
  
  const { data } = await supabase.functions.invoke('openai-agent', {
    body: {
      messages: [
        {
          role: 'system', 
          content: 'Generate a consciousness integration map. 1,500+ words.'
        },
        {
          role: 'user',
          content: `Create consciousness map from: ${JSON.stringify(sections.slice(0, 3))}`
        }
      ],
      model: 'gpt-4o-mini'
    }
  });
  
  const callDuration = Date.now() - callStart;
  const wordCount = data?.content ? data.content.split(' ').length : 0;
  console.log(`✅ [${requestId}] Consciousness map completed: ${wordCount} words in ${callDuration}ms`);
  
  return data?.content || 'Consciousness map content';
}

async function generatePracticalApplications(supabase: any, blueprint: any, sections: any[], requestId: string) {
  console.log(`⚡ [${requestId}] Generating practical applications...`);
  const callStart = Date.now();
  
  const { data } = await supabase.functions.invoke('openai-agent', {
    body: {
      messages: [
        {
          role: 'system',
          content: 'Generate practical applications and exercises. 1,000+ words.'
        },
        {
          role: 'user', 
          content: `Create practical applications from: ${JSON.stringify(sections.slice(0, 3))}`
        }
      ],
      model: 'gpt-4o-mini'
    }
  });
  
  const callDuration = Date.now() - callStart;
  const wordCount = data?.content ? data.content.split(' ').length : 0;
  console.log(`✅ [${requestId}] Practical applications completed: ${wordCount} words in ${callDuration}ms`);
  
  return data?.content || 'Practical applications content';
}

async function buildAndStoreReport(supabase: any, blueprint: any, results: any, requestId: string) {
  console.log(`💾 [${requestId}] Building report structure...`);
  
  const totalWordCount = results.sections.reduce((total: number, s: any) => total + (s.word_count || 0), 0) +
                        (results.intelligence_result?.word_count || 0);

  console.log(`💾 [${requestId}] Report word count calculation:`, {
    sectionsCount: results.sections.length,
    sectionWords: results.sections.reduce((total: number, s: any) => total + (s.word_count || 0), 0),
    intelligenceWords: results.intelligence_result?.word_count || 0,
    totalWords: totalWordCount
  });

  // Extract gate analyses with detailed logging
  const gateAnalyses: any = {};
  const gateSections = results.sections.filter((s: any) => s.gate_number);
  console.log(`🚪 [${requestId}] Processing ${gateSections.length} gate sections`);
  
  gateSections.forEach((s: any) => {
    gateAnalyses[`gate_${s.gate_number}`] = s.content;
    console.log(`🚪 [${requestId}] Gate ${s.gate_number}: ${s.content?.length || 0} characters`);
  });

  // Extract seven laws with logging
  const sevenLaws = {
    mentalism: results.sections.find((s: any) => s.agent_type === 'mentalism_analyst')?.content || '',
    correspondence: results.sections.find((s: any) => s.agent_type === 'correspondence_analyst')?.content || '',
    vibration: results.sections.find((s: any) => s.agent_type === 'vibration_analyst')?.content || '',
    polarity: results.sections.find((s: any) => s.agent_type === 'polarity_analyst')?.content || '',
    rhythm: results.sections.find((s: any) => s.agent_type === 'rhythm_analyst')?.content || '',
    causation: results.sections.find((s: any) => s.agent_type === 'causation_analyst')?.content || '',
    gender: results.sections.find((s: any) => s.agent_type === 'gender_analyst')?.content || ''
  };

  console.log(`🔮 [${requestId}] Seven Laws content lengths:`, 
    Object.entries(sevenLaws).reduce((acc, [law, content]) => ({
      ...acc, 
      [law]: content.length
    }), {}));

  // Extract system translations with logging
  const systemTranslations = {
    mbti_hermetic: results.sections.find((s: any) => s.agent_type === 'mbti_hermetic_translator')?.content || '',
    astrology_hermetic: results.sections.find((s: any) => s.agent_type === 'astrology_hermetic_translator')?.content || '',
    numerology_hermetic: results.sections.find((s: any) => s.agent_type === 'numerology_hermetic_translator')?.content || '',
    human_design_hermetic: results.sections.find((s: any) => s.agent_type === 'human_design_hermetic_translator')?.content || '',
    chinese_astrology_hermetic: results.sections.find((s: any) => s.agent_type === 'chinese_astrology_hermetic_translator')?.content || ''
  };

  console.log(`📋 [${requestId}] System translations content lengths:`, 
    Object.entries(systemTranslations).reduce((acc, [system, content]) => ({
      ...acc, 
      [system]: content.length
    }), {}));

  const reportId = crypto.randomUUID();
  const blueprintSignature = crypto.randomUUID();

  const report = {
    id: reportId,
    user_id: blueprint.user_id || blueprint.user_meta?.user_id,
    blueprint_id: blueprint.id,
    report_content: {
      core_personality_pattern: systemTranslations.mbti_hermetic.substring(0, 500) + '...',
      decision_making_style: sevenLaws.causation.substring(0, 500) + '...',
      relationship_style: sevenLaws.correspondence.substring(0, 500) + '...',
      life_path_purpose: sevenLaws.mentalism.substring(0, 500) + '...',
      current_energy_timing: sevenLaws.rhythm.substring(0, 500) + '...',
      integrated_summary: results.synthesis,
      hermetic_fractal_analysis: results.synthesis,
      consciousness_integration_map: results.consciousness_map,
      practical_activation_framework: results.practical_applications,
      seven_laws_integration: sevenLaws,
      system_translations: systemTranslations,
      gate_analyses: gateAnalyses,
      shadow_work_integration: {
        shadow_patterns: 'Shadow patterns integrated throughout analysis',
        integration_practices: results.practical_applications.substring(0, 1000),
        transformation_roadmap: results.consciousness_map.substring(0, 1000)
      },
      blueprint_signature: blueprintSignature,
      word_count: totalWordCount,
      generation_metadata: {
        agents_used: results.sections.map((s: any) => s.agent_type),
        total_processing_time: 0,
        hermetic_depth_score: 10,
        gates_analyzed: results.gates_analyzed,
        intelligence_status: 'completed'
      },
      structured_intelligence: results.intelligence_result?.structured_intelligence || {}
    },
    generated_at: new Date().toISOString(),
    blueprint_version: '2.0'
  };

  console.log(`💾 [${requestId}] Storing report in database...`);
  console.log(`💾 [${requestId}] Report structure:`, {
    id: reportId,
    userId: report.user_id,
    blueprintId: report.blueprint_id,
    wordCount: totalWordCount,
    gateCount: Object.keys(gateAnalyses).length,
    sevenLawsComplete: Object.values(sevenLaws).every(law => law.length > 0),
    systemTranslationsComplete: Object.values(systemTranslations).every(trans => trans.length > 0)
  });

  const { data, error } = await supabase
    .from('personality_reports')
    .insert([report])
    .select()
    .single();

  if (error) {
    console.error(`❌ [${requestId}] Database storage failed:`, error);
    throw error;
  }

  console.log(`✅ [${requestId}] Report stored successfully with ID: ${data.id}`);
  return data;
}

async function generateHermeticQuotes(supabase: any, blueprint: any, sections: any[], requestId: string) {
  console.log(`💬 [${requestId}] Generating hermetic quotes...`);
  const callStart = Date.now();
  
  const inputSections = sections.slice(0, 2);
  console.log(`💬 [${requestId}] Quote input: ${inputSections.length} sections`);
  
  const { data } = await supabase.functions.invoke('openai-agent', {
    body: {
      messages: [
        {
          role: 'system',
          content: 'Generate 5 personalized hermetic quotes based on the analysis.'
        },
        {
          role: 'user',
          content: `Generate quotes from: ${JSON.stringify(inputSections)}`
        }
      ],
      model: 'gpt-4o-mini'
    }
  });

  const callDuration = Date.now() - callStart;
  const quotesGenerated = data?.quotes?.length || 0;
  
  console.log(`✅ [${requestId}] Quotes generated: ${quotesGenerated} quotes in ${callDuration}ms`);
  
  return data?.quotes || [];
}

// Utility functions for resilience and rate limiting
async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeResilientsAPICall(
  apiCall: () => Promise<any>,
  callName: string,
  requestId: string
): Promise<{ success: boolean; data?: any; error?: string; duration: number }> {
  const overallStart = Date.now();
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const attemptStart = Date.now();
    
    try {
      console.log(`🔄 [${requestId}] ${callName} attempt ${attempt + 1}/${MAX_RETRIES}...`);
      
      const { data, error } = await apiCall();
      const attemptDuration = Date.now() - attemptStart;
      
      if (!error && data?.content) {
        console.log(`✅ [${requestId}] ${callName} succeeded on attempt ${attempt + 1} in ${attemptDuration}ms`);
        return {
          success: true,
          data,
          duration: Date.now() - overallStart
        };
      } else {
        console.warn(`⚠️ [${requestId}] ${callName} attempt ${attempt + 1} returned error:`, error);
        if (attempt < MAX_RETRIES - 1) {
          const retryDelay = RETRY_DELAYS[attempt] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
          console.log(`⏱️ [${requestId}] ${callName} retrying in ${retryDelay}ms...`);
          await delay(retryDelay);
        }
      }
    } catch (error) {
      const attemptDuration = Date.now() - attemptStart;
      console.error(`❌ [${requestId}] ${callName} attempt ${attempt + 1} threw error after ${attemptDuration}ms:`, error);
      
      if (attempt < MAX_RETRIES - 1) {
        const retryDelay = RETRY_DELAYS[attempt] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
        console.log(`⏱️ [${requestId}] ${callName} retrying in ${retryDelay}ms...`);
        await delay(retryDelay);
      }
    }
  }
  
  const totalDuration = Date.now() - overallStart;
  console.error(`💀 [${requestId}] ${callName} failed after ${MAX_RETRIES} attempts in ${totalDuration}ms`);
  return {
    success: false,
    error: `Failed after ${MAX_RETRIES} attempts`,
    duration: totalDuration
  };
}

async function executePhaseWithTimeout<T>(
  phaseFunction: () => Promise<T>,
  timeoutMs: number,
  phaseName: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`${phaseName} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    
    phaseFunction()
      .then(result => {
        clearTimeout(timeout);
        resolve(result);
      })
      .catch(error => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}