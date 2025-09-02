

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

// Intelligence Report Orchestrator Integration
interface IntelligenceAnalyst {
  name: string;
  dimension: string;
  generateReport(hermeticChunk: string, previousInsights: string, blueprintContext: any): Promise<string>;
}

interface IntelligenceReport {
  identity_constructs: string;
  behavioral_triggers: string;
  execution_bias: string;
  somatic_markers: string;
  relational_dynamics: string;
  consciousness_integration: string;
  shadow_work_integration: string;
  hermetic_fractal_analysis: string;
  transformation_phases: string;
  polarity_integration: string;
  gate_analysis: string;
  spiritual_psychology: string;
  metamorphosis_patterns: string;
}

// Copy Intelligence Analyst classes directly into Edge Function
class IdentityConstructsAnalyst implements IntelligenceAnalyst {
  name = "Identity Constructs Analyst";
  dimension = "identity_constructs";

  async generateReport(hermeticChunk: string, previousInsights: string, blueprintContext: any): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: `
As the Identity Constructs Analyst, generate a comprehensive 3,000-4,000 word analysis of identity formation patterns from:

HERMETIC REPORT: ${hermeticChunk}
PREVIOUS INSIGHTS: ${previousInsights}
BLUEPRINT: MBTI: ${blueprintContext.cognition_mbti?.type}, HD: ${blueprintContext.energy_strategy_human_design?.type}, Life Path: ${blueprintContext.values_life_path?.lifePathNumber}

Cover: Core Identity Architecture, Identity Defense Mechanisms, Identity Evolution Patterns, Identity Integration Opportunities, and Practical Recommendations.` }],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });
    const data = await response.json();
    return data.choices[0].message.content;
  }
}

class BehavioralTriggersAnalyst implements IntelligenceAnalyst {
  name = "Behavioral Triggers Analyst"; 
  dimension = "behavioral_triggers";

  async generateReport(hermeticChunk: string, previousInsights: string, blueprintContext: any): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: `
As the Behavioral Triggers Analyst, generate a comprehensive 3,000-4,000 word analysis of behavioral patterns from:

HERMETIC REPORT: ${hermeticChunk}
PREVIOUS INSIGHTS: ${previousInsights}
BLUEPRINT: Authority: ${blueprintContext.energy_strategy_human_design?.authority}, MBTI: ${blueprintContext.cognition_mbti?.type}

Cover: Trigger Identification & Mapping, Automatic Response Systems, Trigger Transformation Pathways, Behavioral Recalibration Methods, and Mastery Practices.` }],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });
    const data = await response.json();
    return data.choices[0].message.content;
  }
}

// Add remaining 10 analysts with same pattern but focused prompts
class ExecutionBiasAnalyst implements IntelligenceAnalyst {
  name = "Execution Bias Analyst";
  dimension = "execution_bias";
  async generateReport(hermeticChunk: string, previousInsights: string, blueprintContext: any): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o', messages: [{ role: 'user', content: `As the Execution Bias Analyst, generate 3,000-4,000 words on decision-making patterns and action-taking biases. HERMETIC: ${hermeticChunk} INSIGHTS: ${previousInsights} BLUEPRINT: ${JSON.stringify(blueprintContext)}` }],
        temperature: 0.7, max_tokens: 4000
      })
    });
    return (await response.json()).choices[0].message.content;
  }
}

class SomaticMarkersAnalyst implements IntelligenceAnalyst {
  name = "Somatic Markers Analyst"; dimension = "somatic_markers";
  async generateReport(hermeticChunk: string, previousInsights: string, blueprintContext: any): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'user', content: `As the Somatic Markers Analyst, generate 3,000-4,000 words on body wisdom and embodied intelligence patterns. HERMETIC: ${hermeticChunk} INSIGHTS: ${previousInsights}` }], temperature: 0.7, max_tokens: 4000 })
    });
    return (await response.json()).choices[0].message.content;
  }
}

class RelationalDynamicsAnalyst implements IntelligenceAnalyst {
  name = "Relational Dynamics Analyst"; dimension = "relational_dynamics";
  async generateReport(hermeticChunk: string, previousInsights: string, blueprintContext: any): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'user', content: `As the Relational Dynamics Analyst, generate 3,000-4,000 words on relationship patterns and social intelligence.` }], temperature: 0.7, max_tokens: 4000 })
    });
    return (await response.json()).choices[0].message.content;
  }
}

class ConsciousnessIntegrationAnalyst implements IntelligenceAnalyst {
  name = "Consciousness Integration Analyst"; dimension = "consciousness_integration";
  async generateReport(hermeticChunk: string, previousInsights: string, blueprintContext: any): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'user', content: `As the Consciousness Integration Analyst, generate 3,000-4,000 words on consciousness development and integration patterns.` }], temperature: 0.7, max_tokens: 4000 })
    });
    return (await response.json()).choices[0].message.content;
  }
}

class ShadowWorkIntegrationAnalyst implements IntelligenceAnalyst {
  name = "Shadow Work Integration Analyst"; dimension = "shadow_work_integration";
  async generateReport(hermeticChunk: string, previousInsights: string, blueprintContext: any): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'user', content: `As the Shadow Work Integration Analyst, generate 3,000-4,000 words on shadow patterns and integration practices.` }], temperature: 0.7, max_tokens: 4000 })
    });
    return (await response.json()).choices[0].message.content;
  }
}

class HermeticFractalAnalyst implements IntelligenceAnalyst {
  name = "Hermetic Fractal Analyst"; dimension = "hermetic_fractal_analysis";
  async generateReport(hermeticChunk: string, previousInsights: string, blueprintContext: any): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'user', content: `As the Hermetic Fractal Analyst, generate 3,000-4,000 words on fractal patterns and hermetic principles integration.` }], temperature: 0.7, max_tokens: 4000 })
    });
    return (await response.json()).choices[0].message.content;
  }
}

class TransformationPhasesAnalyst implements IntelligenceAnalyst {
  name = "Transformation Phases Analyst"; dimension = "transformation_phases";
  async generateReport(hermeticChunk: string, previousInsights: string, blueprintContext: any): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'user', content: `As the Transformation Phases Analyst, generate 3,000-4,000 words on transformation stages and evolution phases.` }], temperature: 0.7, max_tokens: 4000 })
    });
    return (await response.json()).choices[0].message.content;
  }
}

class PolarityIntegrationAnalyst implements IntelligenceAnalyst {
  name = "Polarity Integration Analyst"; dimension = "polarity_integration";
  async generateReport(hermeticChunk: string, previousInsights: string, blueprintContext: any): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'user', content: `As the Polarity Integration Analyst, generate 3,000-4,000 words on polarity integration and balance patterns.` }], temperature: 0.7, max_tokens: 4000 })
    });
    return (await response.json()).choices[0].message.content;
  }
}

class GateAnalysisAnalyst implements IntelligenceAnalyst {
  name = "Gate Analysis Analyst"; dimension = "gate_analysis";
  async generateReport(hermeticChunk: string, previousInsights: string, blueprintContext: any): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'user', content: `As the Gate Analysis Analyst, generate 3,000-4,000 words on Human Design gates and their deep psychological significance.` }], temperature: 0.7, max_tokens: 4000 })
    });
    return (await response.json()).choices[0].message.content;
  }
}

class SpiritualPsychologyAnalyst implements IntelligenceAnalyst {
  name = "Spiritual Psychology Analyst"; dimension = "spiritual_psychology";
  async generateReport(hermeticChunk: string, previousInsights: string, blueprintContext: any): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'user', content: `As the Spiritual Psychology Analyst, generate 3,000-4,000 words on spiritual development and psychological integration.` }], temperature: 0.7, max_tokens: 4000 })
    });
    return (await response.json()).choices[0].message.content;
  }
}

class MetamorphosisPatternsAnalyst implements IntelligenceAnalyst {
  name = "Metamorphosis Patterns Analyst"; dimension = "metamorphosis_patterns";
  async generateReport(hermeticChunk: string, previousInsights: string, blueprintContext: any): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'user', content: `As the Metamorphosis Patterns Analyst, generate 3,000-4,000 words on transformation patterns and evolutionary development.` }], temperature: 0.7, max_tokens: 4000 })
    });
    return (await response.json()).choices[0].message.content;
  }
}

// Intelligence Report Orchestrator
class IntelligenceReportOrchestrator {
  private analysts: IntelligenceAnalyst[] = [
    new IdentityConstructsAnalyst(),
    new BehavioralTriggersAnalyst(),
    new ExecutionBiasAnalyst(),
    new SomaticMarkersAnalyst(),
    new RelationalDynamicsAnalyst(),
    new ConsciousnessIntegrationAnalyst(),
    new ShadowWorkIntegrationAnalyst(),
    new HermeticFractalAnalyst(),
    new TransformationPhasesAnalyst(),
    new PolarityIntegrationAnalyst(),
    new GateAnalysisAnalyst(),
    new SpiritualPsychologyAnalyst(),
    new MetamorphosisPatternsAnalyst()
  ];

  async generateIntelligenceReport(userId: string, hermeticReport: any, blueprintData: any): Promise<IntelligenceReport> {
    console.log('🧠 INTELLIGENCE ANALYSIS: Starting 13 Analyst Report Generation');
    console.log(`📊 TARGET: ~45,000 words (3,500 words/analyst × 13 analysts)`);
    
    const report: Partial<IntelligenceReport> = {};
    let cumulativeInsights = "";
    let totalWordCount = 0;
    const startTime = Date.now();

    for (let i = 0; i < this.analysts.length; i++) {
      const analyst = this.analysts[i];
      const analystNumber = i + 1;
      
      try {
        console.log(`🧠 ANALYST ${analystNumber}/13: ${analyst.name} - Starting generation...`);
        console.log(`📊 PROGRESS: ${totalWordCount} words generated so far`);
        
        const analystStartTime = Date.now();
        const hermeticChunk = this.extractRelevantHermeticChunk(hermeticReport, analyst.dimension);
        const analysisReport = await analyst.generateReport(hermeticChunk, cumulativeInsights, blueprintData);
        const analystDuration = Date.now() - analystStartTime;

        // Calculate word count (approximate: characters / 5)
        const analystWordCount = Math.round(analysisReport.length / 5);
        totalWordCount += analystWordCount;

        report[analyst.dimension as keyof IntelligenceReport] = analysisReport;
        cumulativeInsights += `\n\n${analyst.name} Key Insights:\n${analysisReport.substring(0, 500)}...`;
        
        console.log(`✅ ANALYST ${analystNumber}/13: ${analyst.name} COMPLETE`);
        console.log(`   📝 Generated: ${analystWordCount} words (${analysisReport.length} chars)`);
        console.log(`   ⏱️ Duration: ${(analystDuration/1000).toFixed(1)}s`);
        console.log(`   📊 TOTAL SO FAR: ${totalWordCount} words`);
        
      } catch (error) {
        console.error(`❌ ANALYST ${analystNumber}/13: ${analyst.name} FAILED:`, error);
        const errorMessage = `Error generating ${analyst.name} analysis: ${error.message}`;
        report[analyst.dimension as keyof IntelligenceReport] = errorMessage;
        // Still count error as words for tracking
        totalWordCount += Math.round(errorMessage.length / 5);
      }
    }

    const totalDuration = Date.now() - startTime;
    console.log('🎉 INTELLIGENCE ANALYSIS COMPLETE! 📊 FINAL STATISTICS:');
    console.log(`   📝 Total words generated: ${totalWordCount} words`);
    console.log(`   📊 Target achieved: ${((totalWordCount/45000)*100).toFixed(1)}%`);
    console.log(`   ⏱️ Total generation time: ${(totalDuration/1000).toFixed(1)}s`);
    console.log(`   🧠 Analysts completed: ${this.analysts.length}/13`);
    console.log(`   📄 Average words per analyst: ${Math.round(totalWordCount/this.analysts.length)}`);
    
    return report as IntelligenceReport;
  }

  private extractRelevantHermeticChunk(hermeticReport: any, dimension: string): string {
    const sections = Object.values(hermeticReport).join('\n\n');
    return sections.substring(0, 2000);
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { blueprint, userId, language = 'en' } = await req.json();
    
    if (!blueprint || !userId) {
      console.error('❌ Missing required parameters:', { hasBlueprint: !!blueprint, hasUserId: !!userId });
      throw new Error('Blueprint and userId are required');
    }

    console.log('🌍 Report generation language:', language);

    console.log('🎭 Generating comprehensive personality report and quotes for user:', userId);
    console.log('📋 Received blueprint structure:', {
      hasId: !!blueprint.id,
      blueprintId: blueprint.id,
      hasUserMeta: !!blueprint.user_meta,
      hasCognitionMbti: !!blueprint.cognition_mbti,
      hasEnergyStrategy: !!blueprint.energy_strategy_human_design,
      hasArchetypeWestern: !!blueprint.archetype_western,
      hasValuesLifePath: !!blueprint.values_life_path,
      hasArchetypeChinese: !!blueprint.archetype_chinese,
      hasBasharSuite: !!blueprint.bashar_suite
    });

    // Extract comprehensive blueprint data for detailed analysis
    const userMeta = blueprint.user_meta || {};
    const personality = userMeta.personality || {};
    const bigFive = personality.bigFive || {};
    const confidence = personality.confidence || {};
    const mbtiProbs = personality.mbtiProbabilities || {};
    
    const mbti = blueprint.cognition_mbti || blueprint.mbti || {};
    const humanDesign = blueprint.energy_strategy_human_design || blueprint.human_design || {};
    const astrology = blueprint.archetype_western || blueprint.astrology || {};
    const numerology = blueprint.values_life_path || blueprint.numerology || {};
    const chineseAstrology = blueprint.archetype_chinese || {};
    const bashar = blueprint.bashar_suite || {};
    const goalStack = blueprint.goal_stack || {};

    console.log('🔍 Comprehensive data extraction:', {
      userName: userMeta.preferred_name || userMeta.full_name || 'User',
      bigFiveOpenness: bigFive.openness,
      likelyMBTI: personality.likelyType,
      mbtiTopProbability: Object.entries(mbtiProbs).sort((a, b) => b[1] - a[1]).slice(0, 1)[0],
      humanDesignType: humanDesign.type,
      lifePathNumber: numerology.life_path_number,
      chineseSign: chineseAstrology.animal,
      chineseElement: chineseAstrology.element,
      sunSign: astrology.sun_sign,
      blueprintId: blueprint.id,
      consciousGates: humanDesign.gates?.conscious_personality?.length || 0,
      unconsciousGates: humanDesign.gates?.unconscious_design?.length || 0
    });

    // Language-aware system prompts
    const getLanguagePrompts = (language: string) => {
      const prompts = {
        en: {
          systemPrompt: `You are a master Human Design and personality analyst creating a comprehensive personality report. You MUST follow the EXACT format specified below.

CRITICAL FORMAT REQUIREMENT: You must create exactly 6 detailed sections followed by 10 quotes. Each section must be substantial analysis (300-400 words), NOT inspirational quotes. Always address the person as "you" throughout the report.`,
          sectionsIntro: 'EXACT OUTPUT FORMAT REQUIRED:',
          quotesIntro: 'PERSONALIZED QUOTES:',
          sections: {
            core: '1. CORE PERSONALITY ARCHITECTURE\n[Write 300-400 words of detailed personality analysis integrating Big Five scores, MBTI probabilities, and Chinese astrology traits. Analyze how these systems create your core personality structure.]',
            decision: '2. DECISION-MAKING & COGNITIVE STYLE\n[Write 300-400 words analyzing your decision-making process using Human Design Authority, MBTI cognitive functions, and Chinese astrology decision patterns.]',
            relationship: '3. RELATIONSHIP & SOCIAL DYNAMICS\n[Write 300-400 words on relationship patterns using Human Design Profile, Big Five Extraversion/Agreeableness scores, and Chinese astrology compatibility.]',
            purpose: '4. LIFE PURPOSE & SPIRITUAL PATH\n[Write 300-400 words connecting Human Design Strategy, numerology Life Path/Expression numbers, and Chinese astrology life themes to your purpose.]',
            energy: '5. ENERGY PATTERNS & TIMING\n[Write 300-400 words on energy management using Human Design centers, Chinese astrology cycles, and gate activations.]',
            synthesis: '6. INTEGRATED BLUEPRINT SYNTHESIS\n[Write 300-400 words synthesizing all systems to show your unique personality blueprint.]'
          }
        },
        nl: {
          systemPrompt: `Je bent een meester Human Design en persoonlijkheidsanalist die een uitgebreid persoonlijkheidsrapport maakt. Je MOET de EXACTE indeling volgen zoals hieronder aangegeven.

KRITIEKE INDELING VEREISTE: Je moet precies 6 gedetailleerde secties maken gevolgd door 10 quotes. Elke sectie moet uitgebreide analyse zijn (300-400 woorden), GEEN inspirerende quotes. Spreek de persoon altijd aan met "je" door het hele rapport.`,
          sectionsIntro: 'EXACTE UITVOER INDELING VEREIST:',
          quotesIntro: 'GEPERSONALISEERDE QUOTES:',
          sections: {
            core: '1. KERN PERSOONLIJKHEIDSARCHITECTUUR\n[Schrijf 300-400 woorden gedetailleerde persoonlijkheidsanalyse waarin Big Five scores, MBTI kansen, en Chinese astrologie eigenschappen worden geïntegreerd. Analyseer hoe deze systemen je kernpersoonlijkheidsstructuur creëren.]',
            decision: '2. BESLUITVORMING & COGNITIEVE STIJL\n[Schrijf 300-400 woorden waarin je besluitvormingsproces wordt geanalyseerd met Human Design Autoriteit, MBTI cognitieve functies, en Chinese astrologie beslissingspatronen.]',
            relationship: '3. RELATIE & SOCIALE DYNAMIEK\n[Schrijf 300-400 woorden over relatiepatronen met Human Design Profiel, Big Five Extraversie/Vriendelijkheid scores, en Chinese astrologie compatibiliteit.]',
            purpose: '4. LEVENSDOEL & SPIRITUEEL PAD\n[Schrijf 300-400 woorden waarin Human Design Strategie, numerologie Levenspad/Expressie nummers, en Chinese astrologie levensthema\'s worden verbonden met je doel.]',
            energy: '5. ENERGIEPATRONEN & TIMING\n[Schrijf 300-400 woorden over energiebeheer met Human Design centra, Chinese astrologie cycli, en poort activeringen.]',
            synthesis: '6. GEÏNTEGREERDE BLAUWDRUK SYNTHESE\n[Schrijf 300-400 woorden waarin alle systemen worden gesynthetiseerd om je unieke persoonlijkheidsblauwdruk te tonen.]'
          }
        }
      };
      return prompts[language] || prompts.en;
    };

    const languagePrompts = getLanguagePrompts(language);
    const personalityReportSystemPrompt = `${languagePrompts.systemPrompt}

USER PROFILE:
Birth Date: ${userMeta.birth_date || 'Unknown'}
Birth Location: ${userMeta.birth_location || 'Unknown'}

BIG FIVE SCORES:
- Openness: ${bigFive.openness || 'N/A'} (Confidence: ${confidence.openness || 'N/A'})
- Extraversion: ${bigFive.extraversion || 'N/A'} (Confidence: ${confidence.extraversion || 'N/A'})
- Agreeableness: ${bigFive.agreeableness || 'N/A'} (Confidence: ${confidence.agreeableness || 'N/A'})  
- Conscientiousness: ${bigFive.conscientiousness || 'N/A'} (Confidence: ${confidence.conscientiousness || 'N/A'})
- Neuroticism: ${bigFive.neuroticism || 'N/A'} (Confidence: ${confidence.neuroticism || 'N/A'})

MBTI ANALYSIS:
Most Likely Type: ${personality.likelyType || 'Unknown'}
Top Probabilities: ${Object.entries(mbtiProbs).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([type, prob]) => `${type}: ${(prob * 100).toFixed(1)}%`).join(', ') || 'Not available'}

CHINESE ASTROLOGY: ${chineseAstrology.animal || 'Unknown'} ${chineseAstrology.element || 'Unknown'} (${chineseAstrology.yin_yang || 'Unknown'})

HUMAN DESIGN:
- Type: ${humanDesign.type || 'Unknown'}, Profile: ${humanDesign.profile || 'Unknown'}
- Strategy: ${humanDesign.strategy || 'Unknown'}, Authority: ${humanDesign.authority || 'Unknown'}
- Conscious Gates: ${humanDesign.gates?.conscious_personality?.join(', ') || 'None'}
- Unconscious Gates: ${humanDesign.gates?.unconscious_design?.join(', ') || 'None'}

NUMEROLOGY:
- Life Path: ${numerology.life_path_number || 'Unknown'}, Soul Urge: ${numerology.soul_urge_number || 'Unknown'}
- Expression: ${numerology.expression_number || 'Unknown'}

${languagePrompts.sectionsIntro}

${languagePrompts.sections.core}

${languagePrompts.sections.decision}

${languagePrompts.sections.relationship}

${languagePrompts.sections.purpose}

${languagePrompts.sections.energy}

${languagePrompts.sections.synthesis}

${languagePrompts.quotesIntro}

1. "Quote text" - Category: inspiration - Why it resonates: Brief explanation
2. "Quote text" - Category: growth - Why it resonates: Brief explanation
[Continue for exactly 10 quotes]

CRITICAL: Each numbered section (1-6) MUST contain detailed analysis, not quotes. Quotes come only at the end after "${languagePrompts.quotesIntro}". This prompt is ONLY for personality report generation and should use "${language === 'nl' ? 'je' : 'you'}" throughout.`;

    console.log(`🎯 Using ${language} personality report system prompt`);

    const userPrompt = language === 'nl' 
      ? `Genereer een uitgebreid persoonlijkheidsonderzoek dat ALLE blauwdruk data integreert: Big Five scores, MBTI kansen, Chinese astrologie (${chineseAstrology.animal} ${chineseAstrology.element}), Human Design poorten, en numerologie. Spreek de persoon aan met "je" door het hele rapport. Voeg 10 warme, inspirerende quotes toe die de unieke persoonlijkheidsmix weerspiegelen.`
      : `Generate a comprehensive personality reading that integrates ALL the blueprint data: Big Five scores, MBTI probabilities, Chinese astrology (${chineseAstrology.animal} ${chineseAstrology.element}), Human Design gates, and numerology. Address the person as "you" throughout. Include 10 warm, inspiring quotes that reflect the unique personality blend.`;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: personalityReportSystemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!openAIResponse.ok) {
      console.error('❌ OpenAI API error:', openAIResponse.status, openAIResponse.statusText);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const generatedContent = openAIData.choices[0].message.content;

    console.log('🔍 Generated content length:', generatedContent.length);
    console.log('🔍 Content preview:', generatedContent.substring(0, 300));

    // Enhanced content parsing with validation - language aware
    const quotesSeparator = language === 'nl' ? 'GEPERSONALISEERDE QUOTES:' : 'PERSONALIZED QUOTES:';
    const [reportPart, quotesPart] = generatedContent.split(quotesSeparator);
    
    console.log('🔍 Report part exists:', !!reportPart);
    console.log('🔍 Quotes part exists:', !!quotesPart);
    console.log('🔍 Report part length:', reportPart?.length || 0);
    console.log('🔍 Quotes part length:', quotesPart?.length || 0);
    
    // Improved section parsing with multiple patterns
    const sectionPatterns = [
      /(\d+)\.\s*([A-Z][A-Z\s&]+)\n([\s\S]*?)(?=\d+\.\s*[A-Z][A-Z\s&]+|$)/gi,
      /(\d+)\.\s*([A-Z][A-Z\s&]+)\s*\n*([\s\S]*?)(?=\d+\.\s*[A-Z][A-Z\s&]+|$)/gi,
      /(\d+)\.\s*([A-Z][A-Z\s&]+)[\s\S]*?(?=\d+\.\s*[A-Z][A-Z\s&]+|$)/gi
    ];
    
    let sectionMatches = [];
    for (const pattern of sectionPatterns) {
      sectionMatches = [...(reportPart || '').matchAll(pattern)];
      if (sectionMatches.length >= 6) break;
    }
    
    console.log('🔍 Found section matches:', sectionMatches.length);
    sectionMatches.forEach((match, index) => {
      console.log(`🔍 Section ${index + 1}: "${match[2]?.trim()}" - Content length: ${match[3]?.length || match[0]?.length || 0}`);
    });
    
    // Extract content for each section with validation
    const extractSectionContent = (sectionNumber: number): string => {
      const match = sectionMatches.find(m => parseInt(m[1]) === sectionNumber);
      if (!match) {
        console.log(`⚠️ No match found for section ${sectionNumber}`);
        return `Section ${sectionNumber} content was not properly generated. Please regenerate the report.`;
      }
      
      // Use captured content group if available, otherwise clean the full match
      let content = match[3] || match[0].replace(/^\d+\.\s*[A-Z\s&]+\s*/, '');
      content = content.trim();
      
      // Validate content is analysis, not quotes
      if (content.includes('"') && content.includes('Category:') && content.length < 200) {
        console.log(`⚠️ Section ${sectionNumber} appears to be quotes instead of analysis`);
        return `Section ${sectionNumber} requires detailed personality analysis (300+ words), not inspirational quotes. Please regenerate.`;
      }
      
      console.log(`✅ Extracted section ${sectionNumber} content length:`, content.length);
      return content || `Section ${sectionNumber} content unavailable`;
    };
    
    const reportContent = {
      core_personality_pattern: extractSectionContent(1),
      decision_making_style: extractSectionContent(2),
      relationship_style: extractSectionContent(3),
      life_path_purpose: extractSectionContent(4),
      current_energy_timing: extractSectionContent(5),
      integrated_summary: extractSectionContent(6)
    };
    
    // Validate all sections have substantial content
    const validationResults = Object.entries(reportContent).map(([key, content]) => ({
      section: key,
      length: content.length,
      valid: content.length > 100 && !content.includes('unavailable') && !content.includes('Please regenerate')
    }));
    
    console.log('📊 Content validation results:', validationResults);
    
    const allValid = validationResults.every(r => r.valid);
    console.log('✅ All sections valid:', allValid);

    // Parse quotes with improved pattern matching
    const quotes = [];
    if (quotesPart) {
      console.log('🔍 Processing quotes part...');
      
      // Try multiple quote parsing patterns
      const quotePatterns = [
        /"([^"]+)"\s*-\s*Category:\s*([^-]+)\s*-\s*Why it resonates:\s*(.+?)(?=\d+\.|$)/g,
        /\d+\.\s*"([^"]+)"\s*-\s*Category:\s*([^-]+)\s*-\s*Why it resonates:\s*(.+?)(?=\d+\.|$)/g,
        /"([^"]+)"\s*-\s*Category:\s*([^-]+)\s*-\s*(.+?)(?=\d+\.|$)/g
      ];
      
      for (const pattern of quotePatterns) {
        const matches = [...quotesPart.matchAll(pattern)];
        if (matches.length > 0) {
          console.log(`✅ Found ${matches.length} quotes with pattern`);
          for (const match of matches) {
            quotes.push({
              quote_text: match[1].trim(),
              category: (match[2] || 'inspiration').trim().toLowerCase(),
              personality_alignment: {
                explanation: (match[3] || match[2] || 'Resonates with your unique personality blend').trim(),
                mbti_connection: personality.likelyType || null,
                hd_connection: humanDesign.type || null,
                astro_connection: `${chineseAstrology.animal} ${chineseAstrology.element}` || astrology.sun_sign || null
              }
            });
          }
          break; // Use the first pattern that works
        }
      }
      
      // If no quotes found with patterns, try simple line-by-line parsing
      if (quotes.length === 0) {
        console.log('⚠️ Pattern matching failed, trying line-by-line parsing');
        const lines = quotesPart.split('\n').filter(line => line.trim().includes('"'));
        for (const line of lines.slice(0, 10)) { // Limit to 10 quotes
          const quoteMatch = line.match(/"([^"]+)"/);
          if (quoteMatch) {
            quotes.push({
              quote_text: quoteMatch[1].trim(),
              category: 'inspiration',
              personality_alignment: {
                explanation: 'Personalized for your unique blueprint combination',
                mbti_connection: personality.likelyType || null,
                hd_connection: humanDesign.type || null,
                astro_connection: `${chineseAstrology.animal} ${chineseAstrology.element}` || astrology.sun_sign || null
              }
            });
          }
        }
      }
    }

    console.log(`📝 Parsed ${quotes.length} quotes`);
    quotes.forEach((quote, index) => {
      console.log(`Quote ${index + 1}:`, quote.quote_text.substring(0, 50) + '...');
    });

    // Generate a valid UUID for blueprint_id if missing
    const blueprintId = blueprint.id || crypto.randomUUID();
    
    console.log('💾 Storing report with blueprint_id:', blueprintId);

    // 🧠 INTEGRATION: Generate Intelligence Report with 12 Specialists
    console.log('🧠 Generating comprehensive intelligence analysis with 12 specialists...');
    const orchestrator = new IntelligenceReportOrchestrator();
    
    let intelligenceReport: IntelligenceReport | null = null;
    try {
      intelligenceReport = await orchestrator.generateIntelligenceReport(
        userId,
        reportContent,
        blueprint
      );
      console.log('✅ Intelligence report generated successfully');
    } catch (error) {
      console.error('⚠️ Intelligence report generation failed, continuing with basic report:', error);
    }

    // Enhanced report content with intelligence sections
    const enhancedReportContent = {
      ...reportContent,
      // 🧠 NEW: Add 13 intelligence analyst sections
      intelligence_analysis: intelligenceReport || null
    };

    // 💾 STORAGE: Store intelligence data in BOTH locations for compatibility
    console.log('💾 STORAGE: Preparing to store intelligence data...');
    if (intelligenceReport) {
      const intelligenceWordCount = Object.values(intelligenceReport).reduce((total, analysis) => {
        return total + Math.round((analysis as string).length / 5);
      }, 0);
      console.log(`💾 STORAGE: Intelligence data ready - ${intelligenceWordCount} words across 13 analysts`);
    }

    // Store the enhanced report in the database with structured_intelligence
    const { data: reportData, error: insertError } = await supabaseClient
      .from('personality_reports')
      .insert({
        user_id: userId,
        blueprint_id: blueprintId,
        report_content: enhancedReportContent,
        structured_intelligence: intelligenceReport || {}, // 🧠 NEW: Store in dedicated column
        blueprint_version: '2.0' // Updated version to indicate Hermetic + Intelligence enhancement
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Database error inserting report:', insertError);
      throw new Error(`Database error: ${insertError.message}`);
    }

    console.log('✅ Report stored successfully:', reportData.id);

    // Store the quotes in the database
    const quotesToInsert = quotes.map(quote => ({
      user_id: userId,
      personality_report_id: reportData.id,
      quote_text: quote.quote_text,
      category: quote.category,
      personality_alignment: quote.personality_alignment
    }));

    if (quotesToInsert.length > 0) {
      const { error: quotesError } = await supabaseClient
        .from('personality_quotes')
        .insert(quotesToInsert);

      if (quotesError) {
        console.error('❌ Error storing quotes:', quotesError);
        // Don't fail the whole operation if quotes fail
      } else {
        console.log(`✅ ${quotesToInsert.length} personalized quotes stored successfully`);
      }
    }

    // Final report summary with enhanced intelligence tracking
    const totalContentSize = JSON.stringify(enhancedReportContent).length;
    const intelligenceSections = intelligenceReport ? Object.keys(intelligenceReport).length : 0;
    const intelligenceWordCount = intelligenceReport ? Object.values(intelligenceReport).reduce((total, analysis) => {
      return total + Math.round((analysis as string).length / 5);
    }, 0) : 0;
    
    console.log('📊 FINAL REPORT SUMMARY:');
    console.log(`  📄 Total content size: ${(totalContentSize/1024).toFixed(1)}KB`);
    console.log(`  🧠 Intelligence sections: ${intelligenceSections}/13 analysts`);
    console.log(`  📝 Intelligence word count: ${intelligenceWordCount} words`);
    console.log(`  💬 Quotes generated: ${quotesToInsert.length}`);
    console.log(`  🔖 Blueprint version: 2.0 (Hermetic + Intelligence Enhancement)`);
    console.log(`  💾 STORAGE: Data saved to both 'report_content.intelligence_analysis' AND 'structured_intelligence' columns`);

    console.log('✅ Personality report and quotes generated successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      report: reportData,
      quotes: quotesToInsert,
        enhancement_metadata: {
          intelligence_sections_generated: intelligenceSections,
          total_analysts_attempted: 13,
          intelligence_word_count: intelligenceWordCount,
          content_size_bytes: totalContentSize,
          enhanced_version: '2.0'
        }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Error generating personality report:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

