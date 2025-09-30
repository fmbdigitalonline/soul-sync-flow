import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResponseAnalysis {
  comprehensionScore: number;
  learningEvidence: string[];
  intelligenceGrowth: number;
  moduleImprovements: Record<string, number>;
  validatedLearning: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      questionId,
      userResponse,
      questionText,
      questionModule,
      questionType,
      userId,
      sessionId
    } = await req.json();

    console.log('Analyzing response:', { questionId, questionModule, responseLength: userResponse?.length });

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current intelligence data
    const { data: hacsData } = await supabase
      .from('hacs_intelligence')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!hacsData) {
      throw new Error('HACS intelligence data not found');
    }

    // Analyze response using OpenAI
    const analysis = await analyzeResponseComprehension(
      questionText,
      userResponse,
      questionModule,
      questionType,
      hacsData.intelligence_level
    );

    console.log('OpenAI analysis result:', analysis);

    // Only update intelligence if learning is validated
    if (analysis.validatedLearning) {
      // Calculate new intelligence scores
      const currentModuleScores = hacsData.module_scores || {};
      const newModuleScores = { ...currentModuleScores };
      
      // Apply granular improvements (0.5-2% per validated insight)
      Object.entries(analysis.moduleImprovements).forEach(([module, improvement]) => {
        const currentScore = newModuleScores[module] || 0;
        newModuleScores[module] = Math.min(100, currentScore + improvement);
      });

      // Calculate new overall intelligence level
      const moduleValues = Object.values(newModuleScores);
      const newIntelligenceLevel = moduleValues.reduce((sum: number, score: any) => sum + Number(score), 0) / moduleValues.length;

      // Update database
      const { error: updateError } = await supabase
        .from('hacs_intelligence')
        .update({
          intelligence_level: newIntelligenceLevel,
          module_scores: newModuleScores,
          interaction_count: hacsData.interaction_count + 1,
          last_update: new Date().toISOString(),
          pie_score: newModuleScores.PIE || 0,
          vfp_score: newModuleScores.VFP || 0,
          tmg_score: newModuleScores.TMG || 0,
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Update question record with analysis
      await supabase
        .from('hacs_questions')
        .update({
          user_response: userResponse,
          answered_at: new Date().toISOString(),
          response_quality_score: analysis.comprehensionScore,
          learning_value: analysis.intelligenceGrowth
        })
        .eq('id', questionId);

      // Log learning feedback
      await supabase.from('hacs_learning_feedback').insert({
        user_id: userId,
        question_id: questionId,
        feedback_type: 'response_analysis',
        feedback_value: {
          comprehension_score: analysis.comprehensionScore,
          learning_evidence: analysis.learningEvidence,
          validated_learning: analysis.validatedLearning,
          intelligence_growth: analysis.intelligenceGrowth
        },
        intelligence_impact: analysis.intelligenceGrowth,
        module_affected: questionModule
      });

      console.log('Intelligence updated:', { 
        oldLevel: hacsData.intelligence_level, 
        newLevel: newIntelligenceLevel,
        growth: analysis.intelligenceGrowth 
      });

      // PHASE 3.2: Award XP for HACS Intelligence Update
      const cmpXP = Math.min(4, (analysis.comprehensionScore / 100) * 4);
      const quality = analysis.comprehensionScore / 100;
      
      try {
        await supabase.functions.invoke('xp-award-service', {
          body: {
            userId,
            dims: { CMP: cmpXP },
            quality,
            kinds: ['hacs.learning', 'hacs.comprehension', `module.${questionModule}`],
            source: 'hacs-response-analysis'
          }
        });
        console.log('✅ XP awarded for HACS learning:', { cmpXP, quality });
      } catch (xpError) {
        console.error('⚠️ Failed to award XP:', xpError);
      }
    }

    // Log the interaction
    await supabase.from('dream_activity_logs').insert({
      user_id: userId,
      activity_type: 'hacs_response_analysis',
      activity_data: {
        question_id: questionId,
        question_module: questionModule,
        response_length: userResponse.length,
        comprehension_score: analysis.comprehensionScore,
        validated_learning: analysis.validatedLearning,
        intelligence_growth: analysis.intelligenceGrowth
      },
      session_id: sessionId
    });

    return new Response(JSON.stringify({ 
      analysis,
      intelligenceUpdated: analysis.validatedLearning,
      newIntelligenceLevel: analysis.validatedLearning ? 
        Object.values({ ...hacsData.module_scores, ...analysis.moduleImprovements })
          .reduce((sum: number, score: any) => sum + Number(score), 0) / 11 : 
        hacsData.intelligence_level
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in hacs-response-analysis function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      analysis: {
        comprehensionScore: 0,
        learningEvidence: [],
        intelligenceGrowth: 0,
        moduleImprovements: {},
        validatedLearning: false
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeResponseComprehension(
  questionText: string,
  userResponse: string,
  questionModule: string,
  questionType: string,
  currentIntelligenceLevel: number
): Promise<ResponseAnalysis> {
  const systemPrompt = `You are an expert learning analyst for HACS (Holistic Adaptive Cognitive System). Your task is to analyze user responses to determine if genuine learning and comprehension has occurred.

CRITICAL RULES:
1. ONLY award intelligence growth for responses that demonstrate REAL understanding
2. Look for specific evidence of comprehension, not just length or effort
3. Validate that the user actually learned something new or deepened existing knowledge
4. Be strict - superficial responses get 0 growth
5. Growth should be granular: 0.5-2% maximum per genuine insight

QUESTION CONTEXT:
- Module: ${questionModule}
- Type: ${questionType} 
- Current Intelligence: ${currentIntelligenceLevel}%
- Question: "${questionText}"

ANALYSIS CRITERIA:
- Comprehension Score (0-100): How well does the response demonstrate understanding?
- Learning Evidence: Specific examples from the response that show learning
- Intelligence Growth (0-2%): How much should intelligence increase based on demonstrated learning?
- Module Improvements: Which modules should benefit and by how much?
- Validated Learning (true/false): Is this genuine learning or just words?

RESPONSE MUST BE JSON:
{
  "comprehensionScore": number (0-100),
  "learningEvidence": ["specific example 1", "specific example 2"],
  "intelligenceGrowth": number (0-2),
  "moduleImprovements": {"MODULE": number},
  "validatedLearning": boolean
}`;

  const userPrompt = `Analyze this user response for genuine learning and comprehension:

USER RESPONSE: "${userResponse}"

Provide strict analysis - only award growth for real demonstrated understanding.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 500,
        temperature: 0.1, // Low temperature for consistent analysis
      }),
    });

    const data = await response.json();
    const analysisText = data.choices[0]?.message?.content?.trim();
    
    console.log('Raw OpenAI analysis:', analysisText);

    // Parse JSON response
    const analysis = JSON.parse(analysisText);
    
    // Validate and constrain the analysis
    return {
      comprehensionScore: Math.max(0, Math.min(100, analysis.comprehensionScore || 0)),
      learningEvidence: Array.isArray(analysis.learningEvidence) ? analysis.learningEvidence : [],
      intelligenceGrowth: Math.max(0, Math.min(2, analysis.intelligenceGrowth || 0)),
      moduleImprovements: analysis.moduleImprovements || {},
      validatedLearning: Boolean(analysis.validatedLearning)
    };

  } catch (error) {
    console.error('Error in OpenAI analysis:', error);
    // Return zero growth on analysis failure
    return {
      comprehensionScore: 0,
      learningEvidence: ['Analysis failed - no learning validated'],
      intelligenceGrowth: 0,
      moduleImprovements: {},
      validatedLearning: false
    };
  }
}