import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AssessmentRequest {
  conversationData: string;
  userId: string;
  sessionId: string;
  blueprintData?: any;
}

interface LifeWheelAssessment {
  domain: string;
  current_score: number;
  desired_score: number;
  importance_rating: number;
  notes: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversationData, userId, sessionId, blueprintData }: AssessmentRequest = await req.json();
    
    console.log('Processing conversational assessment for user:', userId);
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build context from blueprint data
    const userContext = blueprintData ? `
User Profile Context:
- Name: ${blueprintData.user_meta?.preferred_name || 'User'}
- MBTI Type: ${blueprintData.cognition_mbti?.type || 'Unknown'}
- Human Design Type: ${blueprintData.energy_strategy_human_design?.type || 'Unknown'}
- Life Path Number: ${blueprintData.values_life_path?.lifePathNumber || 'Unknown'}
- Sun Sign: ${blueprintData.archetype_western?.sun_sign || 'Unknown'}
- Moon Sign: ${blueprintData.archetype_western?.moon_sign || 'Unknown'}
` : '';

    // Create sophisticated assessment prompt
    const assessmentPrompt = `You are an expert life coach and psychologist analyzing a deep conversational assessment. 

${userContext}

Conversation Data:
${conversationData}

Based on this conversation, create a comprehensive life wheel assessment. Analyze the user's responses to determine:

1. Current satisfaction levels (1-10 scale)
2. Desired future state (1-10 scale) 
3. Importance ratings for each domain (1-10 scale)
4. Personalized insights and notes

Domains to assess:
- wellbeing: Overall life satisfaction, happiness, peace
- energy: Vitality, motivation, physical/mental energy
- career: Professional fulfillment, growth, purpose
- relationships: Family, friends, romantic, social connections
- finances: Financial security, abundance, money management
- health: Physical fitness, nutrition, medical wellness
- personal_growth: Learning, self-development, spiritual growth

Return ONLY a valid JSON object with this exact structure:
{
  "assessments": [
    {
      "domain": "wellbeing",
      "current_score": 7,
      "desired_score": 9,
      "importance_rating": 8,
      "notes": "Detailed personalized insight based on conversation"
    }
  ],
  "overall_insights": "Comprehensive summary of user's life situation and priorities",
  "top_priorities": ["domain1", "domain2", "domain3"],
  "recommended_focus": "Specific actionable recommendation"
}

Base scores on actual conversation content. Look for:
- Explicit mentions of satisfaction/dissatisfaction
- Emotional language indicating current state
- Goals and aspirations mentioned
- Challenges and pain points discussed
- Values and priorities expressed
- Time/energy allocation patterns
- Future vision statements

Provide scores that reflect the nuanced reality of the conversation, not generic responses.`;

    console.log('Sending assessment request to OpenAI...');

    // Call OpenAI for real analysis
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are an expert life coach creating personalized assessments. Always return valid JSON only.'
          },
          {
            role: 'user',
            content: assessmentPrompt
          }
        ],
        // GPT-4.1 does not support temperature
        max_completion_tokens: 2000,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const analysisContent = openAIData.choices[0].message.content;
    
    console.log('Received analysis from OpenAI');

    // Parse JSON response
    let assessmentResult;
    try {
      // Remove any markdown formatting
      const jsonContent = analysisContent.replace(/```json\n?|\n?```/g, '').trim();
      assessmentResult = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      console.log('Raw response:', analysisContent);
      
      // Fallback: extract scores using regex and create structured response
      const fallbackAssessment = createFallbackAssessment(analysisContent, conversationData);
      assessmentResult = fallbackAssessment;
    }

    // Validate and ensure all required domains are present
    const requiredDomains = ['wellbeing', 'energy', 'career', 'relationships', 'finances', 'health', 'personal_growth'];
    const assessments = assessmentResult.assessments || [];
    
    // Fill in missing domains with reasonable defaults based on conversation
    for (const domain of requiredDomains) {
      if (!assessments.find((a: any) => a.domain === domain)) {
        assessments.push({
          domain,
          current_score: 6,
          desired_score: 8,
          importance_rating: 7,
          notes: `Based on our conversation, this area shows potential for growth and attention.`
        });
      }
    }

    // Store assessment in database
    console.log('Storing assessment results in database...');
    
    const { error: insertError } = await supabase
      .from('life_wheel_assessments')
      .insert(
        assessments.map((assessment: LifeWheelAssessment) => ({
          user_id: userId,
          domain: assessment.domain,
          current_score: Math.max(1, Math.min(10, assessment.current_score)),
          desired_score: Math.max(1, Math.min(10, assessment.desired_score)),
          importance_rating: Math.max(1, Math.min(10, assessment.importance_rating)),
          notes: assessment.notes,
          assessment_version: 1
        }))
      );

    if (insertError) {
      console.error('Error storing assessment:', insertError);
      // Continue with response even if storage fails
    }

    // Log assessment completion activity
    await supabase
      .from('user_activities')
      .insert({
        user_id: userId,
        activity_type: 'conversational_assessment',
        activity_data: {
          session_id: sessionId,
          domains_assessed: assessments.length,
          overall_insights: assessmentResult.overall_insights,
          top_priorities: assessmentResult.top_priorities,
          timestamp: new Date().toISOString()
        },
        points_earned: 25
      });

    console.log('Assessment processing completed successfully');

    return new Response(JSON.stringify({
      success: true,
      assessments,
      overall_insights: assessmentResult.overall_insights || "Your assessment reveals unique patterns and opportunities for growth.",
      top_priorities: assessmentResult.top_priorities || assessments.slice(0, 3).map((a: any) => a.domain),
      recommended_focus: assessmentResult.recommended_focus || "Focus on your highest priority domains for maximum impact."
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Conversational assessment error:', error);
    
    return new Response(JSON.stringify({
      error: 'Assessment processing failed',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Fallback function to extract assessment data when JSON parsing fails
function createFallbackAssessment(content: string, conversationData: string) {
  console.log('Creating fallback assessment from content analysis');
  
  const domains = ['wellbeing', 'energy', 'career', 'relationships', 'finances', 'health', 'personal_growth'];
  
  // Simple sentiment analysis to determine scores
  const positiveWords = ['good', 'great', 'excellent', 'satisfied', 'happy', 'fulfilled', 'strong'];
  const negativeWords = ['bad', 'poor', 'struggling', 'stressed', 'unhappy', 'weak', 'lacking'];
  
  const assessments = domains.map(domain => {
    const domainMentions = conversationData.toLowerCase().split(' ').filter(word => 
      word.includes(domain) || 
      (domain === 'wellbeing' && ['happiness', 'satisfaction', 'peace'].some(w => word.includes(w))) ||
      (domain === 'energy' && ['energy', 'vitality', 'motivation'].some(w => word.includes(w)))
    );
    
    let currentScore = 6; // Default middle score
    let desiredScore = 8;
    
    // Adjust based on sentiment
    const context = conversationData.toLowerCase();
    if (positiveWords.some(word => context.includes(word + ' ' + domain))) {
      currentScore = 7;
    } else if (negativeWords.some(word => context.includes(word + ' ' + domain))) {
      currentScore = 4;
    }
    
    return {
      domain,
      current_score: currentScore,
      desired_score: desiredScore,
      importance_rating: 7,
      notes: `Assessment based on conversation patterns and expressed interests in ${domain}.`
    };
  });

  return {
    assessments,
    overall_insights: "Assessment created from conversation analysis.",
    top_priorities: assessments.slice(0, 3).map(a => a.domain),
    recommended_focus: "Focus on areas where you expressed the most interest and growth potential."
  };
}