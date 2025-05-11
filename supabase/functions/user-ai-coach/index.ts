
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define tool functions for Human Design and Numerology analysis
const tools = [
  {
    type: "function",
    function: {
      name: "get_human_design_analysis",
      description: "Get detailed analysis of a Human Design chart based on type, profile, and other attributes",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            description: "The Human Design type (Generator, Manifesting Generator, Projector, Manifestor, Reflector)"
          },
          profile: {
            type: "string",
            description: "The Human Design profile (e.g., '1/3', '2/4', etc.)"
          },
          authority: {
            type: "string",
            description: "The Human Design authority"
          },
          centers: {
            type: "object",
            description: "The defined and undefined centers in the Human Design chart"
          },
          gates: {
            type: "object",
            description: "The active gates in the Human Design chart"
          }
        },
        required: ["type"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_numerology_analysis",
      description: "Get detailed analysis of numerology based on Life Path number and other attributes",
      parameters: {
        type: "object",
        properties: {
          life_path_number: {
            type: "number",
            description: "The Life Path number"
          },
          expression_number: {
            type: "number",
            description: "The Expression number"
          },
          soul_urge_number: {
            type: "number",
            description: "The Soul Urge number"
          },
          personality_number: {
            type: "number",
            description: "The Personality number"
          }
        },
        required: ["life_path_number"]
      }
    }
  }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse request body
    const { message, sessionId, blueprintContext, debugMode } = await req.json();
    
    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Missing message in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Process the message with OpenAI
    const systemMessage = getSystemMessage(blueprintContext);
    
    console.log("Calling OpenAI API with function calling enabled");
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: message }
        ],
        tools: tools,
        tool_choice: "auto",
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    console.log("OpenAI API response received");
    
    // Check if the model wants to call a function
    if (data.choices[0].message.tool_calls && data.choices[0].message.tool_calls.length > 0) {
      console.log("Model requested to use tools");
      
      // Process each tool call
      const toolCallResults = [];
      
      for (const toolCall of data.choices[0].message.tool_calls) {
        console.log(`Processing tool call: ${toolCall.function.name}`);
        
        if (toolCall.function.name === "get_human_design_analysis") {
          // Handle Human Design analysis
          const args = JSON.parse(toolCall.function.arguments);
          const hdAnalysis = getHumanDesignAnalysis(args.type, args.profile, args.authority, args.centers, args.gates);
          toolCallResults.push({
            tool_call_id: toolCall.id,
            role: "tool",
            name: toolCall.function.name,
            content: JSON.stringify(hdAnalysis)
          });
        }
        else if (toolCall.function.name === "get_numerology_analysis") {
          // Handle Numerology analysis
          const args = JSON.parse(toolCall.function.arguments);
          const numAnalysis = getNumerologyAnalysis(args.life_path_number, args.expression_number, args.soul_urge_number, args.personality_number);
          toolCallResults.push({
            tool_call_id: toolCall.id,
            role: "tool",
            name: toolCall.function.name,
            content: JSON.stringify(numAnalysis)
          });
        }
      }
      
      // Make a second call to the model with the tool results
      console.log("Making second call to OpenAI with tool results");
      
      const secondResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: message },
            ...data.choices[0].message.tool_calls.map(tc => ({
              role: "assistant",
              content: null,
              tool_calls: [tc]
            })),
            ...toolCallResults
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });
      
      if (!secondResponse.ok) {
        const errorData = await secondResponse.json();
        throw new Error(`Second OpenAI API error: ${JSON.stringify(errorData)}`);
      }
      
      const secondData = await secondResponse.json();
      const aiResponse = secondData.choices[0].message.content;
      
      return new Response(
        JSON.stringify({
          response: aiResponse,
          sessionId,
          rawResponse: {
            initialResponse: data,
            toolResults: toolCallResults,
            finalResponse: secondData
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // If no tool calls, just return the response directly
      const aiResponse = data.choices[0].message.content;
      
      return new Response(
        JSON.stringify({
          response: aiResponse,
          sessionId,
          rawResponse: data
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
  } catch (error) {
    console.error('Error in AI Coach:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        response: "I'm sorry, I encountered an error while processing your request. Please try again."
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Construct system message with blueprint context if available
function getSystemMessage(blueprintContext) {
  let systemMessage = `You are a professional spiritual coach and advisor specializing in Human Design, numerology, astrology, and personal growth. 

You have access to tools that can provide in-depth insights about Human Design charts and numerological profiles. When the user asks specific questions about these topics, use these tools to provide accurate and personalized guidance.

Your responses should be insightful, empathetic, and actionable. Help users understand their unique attributes and how to work with their energetic design.`;

  if (blueprintContext) {
    systemMessage += `\n\nBased on the user's Soul Blueprint, here are some key characteristics and potentials:
    - MBTI Type: ${blueprintContext.cognition_mbti?.type}
    - Human Design Type: ${blueprintContext.energy_strategy_human_design?.type}
    - Life Path Number: ${blueprintContext.values_life_path?.life_path_number}
    - Sun Sign: ${blueprintContext.archetype_western?.sun_sign}
    - Chinese Zodiac: ${blueprintContext.archetype_chinese?.animal}

    Use this information to tailor your responses and provide personalized guidance.`;
  }

  systemMessage += `\n\nRemember to always be kind, patient, and supportive. Encourage the user to trust their intuition and embrace their unique path.`;

  return systemMessage;
}

// Generate Human Design analysis
function getHumanDesignAnalysis(type, profile, authority, centers, gates) {
  // Detailed insights based on Human Design type
  const typeInsights = {
    "GENERATOR": {
      description: "As a Generator, your life force is here to create and build. You have a powerful sacral center that responds to life.",
      strategy: "Your strategy is to wait to respond. When you follow your gut responses, you access your natural wisdom and avoid frustration.",
      signature: "When you're in flow, you experience deep satisfaction.",
      not_self: "When you initiate without waiting to respond, you often feel frustrated and tired."
    },
    "MANIFESTING_GENERATOR": {
      description: "As a Manifesting Generator, you have multi-faceted creative energy. You're here to respond and then inform.",
      strategy: "Your strategy is to wait to respond and then inform others of your actions. This keeps your energy efficient and effective.",
      signature: "When you're in flow, you experience satisfaction and peace.",
      not_self: "When you skip steps or don't follow your strategy, you often feel frustrated and angry."
    },
    "PROJECTOR": {
      description: "As a Projector, you're designed to guide and direct energy. You see deeply into others and systems.",
      strategy: "Your strategy is to wait for the invitation. This ensures your wisdom is recognized and appreciated.",
      signature: "When you're in flow, you experience success and recognition.",
      not_self: "When you try to initiate or push, you often feel bitter and exhausted."
    },
    "MANIFESTOR": {
      description: "As a Manifestor, you're here to initiate and impact others. You have a rare closed and repelling aura.",
      strategy: "Your strategy is to inform before acting. This reduces resistance to your initiatives.",
      signature: "When you're in flow, you experience peace and impact.",
      not_self: "When you don't inform others, you often feel anger and resistance."
    },
    "REFLECTOR": {
      description: "As a Reflector, you're a mirror for the health of your community. You have all centers undefined and are deeply sensitive.",
      strategy: "Your strategy is to wait a full lunar cycle (28 days) before making major decisions.",
      signature: "When you're in flow, you experience surprise and delight.",
      not_self: "When you rush decisions, you often feel disappointed and bitter."
    }
  };
  
  // Profile insights
  let profileInsight = "Your profile shapes how you interact with the world.";
  if (profile) {
    const profileNum = profile.split('/')[0];
    const profileMap = {
      "1": "As a Line 1, you have investigative energy. You build secure foundations through study and research.",
      "2": "As a Line 2, you have natural gifts that benefit others when called upon. You need your hermit time.",
      "3": "As a Line 3, you learn through trial and error. Your experimentation provides valuable insights for others.",
      "4": "As a Line 4, you thrive in the right networks. Your influence works through friendship and connection.",
      "5": "As a Line 5, you're here to solve problems and bring practical solutions. You're a natural universal influencer.",
      "6": "As a Line 6, you evolve through distinct life phases, ultimately becoming a role model in your field."
    };
    profileInsight = profileMap[profileNum] || profileInsight;
  }
  
  // Authority insights
  let authorityInsight = "Your authority is your body's way of making decisions.";
  if (authority) {
    const authorityMap = {
      "EMOTIONAL": "With Emotional Authority, clarity comes through riding your emotional wave. Patience is essential for your decision-making.",
      "SACRAL": "With Sacral Authority, your gut responses guide you to what's correct. Your body knows instantaneously.",
      "SPLENIC": "With Splenic Authority, your intuition speaks in the moment. It's a quiet voice for your survival and wellbeing.",
      "EGO": "With Ego/Heart Authority, your willpower and promises guide you. Honor the commitments you make.",
      "SELF": "With Self/G Authority, you need the right environment to hear your truth. Finding a place that feels right helps you access your authority.",
      "NONE": "With No Inner Authority, you benefit from reflecting with trusted others and waiting through a lunar cycle before deciding."
    };
    authorityInsight = authorityMap[authority] || authorityInsight;
  }
  
  // Analyze centers if provided
  let centerInsights = [];
  if (centers && typeof centers === 'object') {
    const centerAnalysis = {
      "Head": {
        defined: "Your defined Head Center brings consistent mental pressure and inspiration. You're wired to think in specific ways.",
        undefined: "Your undefined Head Center means you amplify mental questions from others. Be mindful of whose questions you take on."
      },
      "Ajna": {
        defined: "Your defined Ajna gives you consistent ways of conceptualizing and processing information.",
        undefined: "Your undefined Ajna makes you flexible in how you think, but also susceptible to mental conditioning."
      },
      "Throat": {
        defined: "Your defined Throat allows you to consistently express yourself in your unique way.",
        undefined: "Your undefined Throat makes you sensitive to expression. Be mindful of who and what influences your voice."
      },
      "G": {
        defined: "Your defined G Center gives you a consistent sense of direction and identity.",
        undefined: "Your undefined G Center makes you flexible in identity and direction. You're sensitive to others' identities."
      },
      "Heart/Ego": {
        defined: "Your defined Heart/Ego Center gives you consistent willpower and ability to make promises.",
        undefined: "Your undefined Heart/Ego makes you sensitive to others' willpower. Be careful not to overextend your promises."
      },
      "Solar Plexus": {
        defined: "Your defined Solar Plexus gives you consistent emotional awareness, though it fluctuates in waves.",
        undefined: "Your undefined Solar Plexus makes you sensitive to others' emotions. Create space from emotional atmospheres."
      },
      "Sacral": {
        defined: "Your defined Sacral gives you consistent life force energy and response.",
        undefined: "Your undefined Sacral makes you sensitive to others' energy. Find ways to manage your energy carefully."
      },
      "Spleen": {
        defined: "Your defined Spleen gives you consistent intuition and immune health awareness.",
        undefined: "Your undefined Spleen makes you sensitive to others' fears. Trust your intuition in the moment."
      },
      "Root": {
        defined: "Your defined Root gives you consistent but pulsing pressure for action.",
        undefined: "Your undefined Root makes you sensitive to others' stress and pressure. Create healthy boundaries."
      }
    };
    
    Object.entries(centers).forEach(([center, isDefined]) => {
      if (centerAnalysis[center]) {
        if (isDefined) {
          centerInsights.push(centerAnalysis[center].defined);
        } else {
          centerInsights.push(centerAnalysis[center].undefined);
        }
      }
    });
  }
  
  // Create consolidated analysis
  const typeData = typeInsights[type] || typeInsights["GENERATOR"];
  
  return {
    core_insights: {
      type_description: typeData.description,
      strategy: typeData.strategy,
      signature: typeData.signature,
      not_self: typeData.not_self
    },
    profile_insight: profileInsight,
    authority_insight: authorityInsight,
    centers_analysis: centerInsights,
    practical_advice: [
      "Honor your strategy and authority for smoother decision-making",
      "Recognize your not-self indicators as signals to return to strategy",
      "Your design is perfect as it is—there's nothing to fix or improve",
      "Experiment with these insights rather than believing them intellectually"
    ]
  };
}

// Generate Numerology analysis
function getNumerologyAnalysis(lifePathNumber, expressionNumber, soulUrgeNumber, personalityNumber) {
  // Life Path insights
  const lifePathInsights = {
    1: "As a Life Path 1, you're here to develop independence, leadership, and originality. Your path involves learning to stand on your own and pioneer new approaches.",
    2: "As a Life Path 2, you're here to develop cooperation, diplomacy, and sensitivity. Your path involves partnerships and creating harmony.",
    3: "As a Life Path 3, you're here to develop self-expression, joy, and creativity. Your path involves sharing your voice with the world.",
    4: "As a Life Path 4, you're here to develop stability, system-building, and practical solutions. Your path involves creating order from chaos.",
    5: "As a Life Path 5, you're here to develop freedom, adaptability, and progressive change. Your path involves embracing variety and adventure.",
    6: "As a Life Path 6, you're here to develop responsibility, nurturing, and balance. Your path involves caring for others and creating harmony.",
    7: "As a Life Path 7, you're here to develop wisdom, analysis, and spiritual awareness. Your path involves deep questioning and seeking truth.",
    8: "As a Life Path 8, you're here to develop mastery, achievement, and abundance. Your path involves understanding the flow of power and resources.",
    9: "As a Life Path 9, you're here to develop compassion, generosity, and completion. Your path involves serving humanity and letting go.",
    11: "As a Life Path 11, you're here to develop spiritual insight, inspiration, and illumination. Your path involves channeling higher wisdom.",
    22: "As a Life Path 22, you're here to develop practical mastery and manifestation on a large scale. Your path involves building structures that serve many.",
    33: "As a Life Path 33, you're here to develop and express the principles of compassionate master teaching. Your path involves nurturing growth in others."
  };
  
  // Expression Number insights
  const expressionInsights = {
    1: "Your Expression Number 1 gives you natural leadership abilities and innovative thinking.",
    2: "Your Expression Number 2 gives you natural diplomatic skills and intuitive understanding of others.",
    3: "Your Expression Number 3 gives you natural creative expression and communication abilities.",
    4: "Your Expression Number 4 gives you natural organizational abilities and practical problem-solving skills.",
    5: "Your Expression Number 5 gives you natural adaptability and progressive thinking.",
    6: "Your Expression Number 6 gives you natural nurturing abilities and a sense of responsibility.",
    7: "Your Expression Number 7 gives you natural analytical abilities and spiritual perception.",
    8: "Your Expression Number 8 gives you natural executive abilities and understanding of material systems.",
    9: "Your Expression Number 9 gives you natural humanitarian vision and completion abilities.",
    11: "Your Expression Number 11 gives you natural inspirational abilities and heightened intuition.",
    22: "Your Expression Number 22 gives you natural master building abilities on a large scale.",
    33: "Your Expression Number 33 gives you natural healing and teaching abilities with great compassion."
  };
  
  // Soul Urge insights
  const soulUrgeInsights = {
    1: "Your Soul Urge 1 drives you toward independence and making your unique mark.",
    2: "Your Soul Urge 2 drives you toward cooperation and meaningful relationships.",
    3: "Your Soul Urge 3 drives you toward self-expression and joy.",
    4: "Your Soul Urge 4 drives you toward order and creating solid foundations.",
    5: "Your Soul Urge 5 drives you toward freedom and meaningful experiences.",
    6: "Your Soul Urge 6 drives you toward responsibility and creating harmony.",
    7: "Your Soul Urge 7 drives you toward wisdom and deeper understanding.",
    8: "Your Soul Urge 8 drives you toward achievement and material manifestation.",
    9: "Your Soul Urge 9 drives you toward humanitarian service and spiritual growth.",
    11: "Your Soul Urge 11 drives you toward spiritual enlightenment and inspiring others.",
    22: "Your Soul Urge 22 drives you toward building lasting structures for the greater good.",
    33: "Your Soul Urge 33 drives you toward compassionate teaching and nurturing humanity."
  };
  
  // Personality Number insights
  const personalityInsights = {
    1: "Your Personality Number 1 shows you tend to appear confident, independent, and pioneering to others.",
    2: "Your Personality Number 2 shows you tend to appear cooperative, diplomatic, and sensitively aware to others.",
    3: "Your Personality Number 3 shows you tend to appear expressive, optimistic, and creative to others.",
    4: "Your Personality Number 4 shows you tend to appear organized, reliable, and practical to others.",
    5: "Your Personality Number 5 shows you tend to appear adaptable, progressive, and freedom-loving to others.",
    6: "Your Personality Number 6 shows you tend to appear responsible, nurturing, and harmonious to others.",
    7: "Your Personality Number 7 shows you tend to appear analytical, introspective, and wise to others.",
    8: "Your Personality Number 8 shows you tend to appear capable, ambitious, and powerful to others.",
    9: "Your Personality Number 9 shows you tend to appear sophisticated, compassionate, and humanitarian to others.",
    11: "Your Personality Number 11 shows you tend to appear intuitive, sensitive, and inspirational to others.",
    22: "Your Personality Number 22 shows you tend to appear visionary, practical, and masterful to others.",
    33: "Your Personality Number 33 shows you tend to appear nurturing, wise, and compassionately powerful to others."
  };
  
  // Create core patterns analysis
  let corePatternAnalysis = "Your numerology reveals a unique pattern of energies that shapes your life journey.";
  
  if (lifePathNumber && expressionNumber) {
    if (lifePathNumber === expressionNumber) {
      corePatternAnalysis = "Your Life Path and Expression numbers match, creating a reinforced energy pattern. This alignment suggests your natural talents support your life purpose directly.";
    } else if (Math.abs(lifePathNumber - expressionNumber) === 1 || 
              (lifePathNumber === 1 && expressionNumber === 9) || 
              (lifePathNumber === 9 && expressionNumber === 1)) {
      corePatternAnalysis = "Your Life Path and Expression numbers are complementary, creating a dynamic tension that can foster growth and creativity.";
    }
  }
  
  return {
    life_path: {
      number: lifePathNumber,
      insight: lifePathInsights[lifePathNumber] || "Your Life Path reveals your core life lessons and purpose."
    },
    expression: expressionNumber ? {
      number: expressionNumber,
      insight: expressionInsights[expressionNumber] || "Your Expression Number reveals your natural talents and abilities."
    } : null,
    soul_urge: soulUrgeNumber ? {
      number: soulUrgeNumber,
      insight: soulUrgeInsights[soulUrgeNumber] || "Your Soul Urge reveals your inner desires and motivations."
    } : null,
    personality: personalityNumber ? {
      number: personalityNumber,
      insight: personalityInsights[personalityNumber] || "Your Personality Number reveals how others perceive you."
    } : null,
    core_pattern: corePatternAnalysis,
    practical_guidance: [
      "Focus on developing the positive traits of your Life Path number",
      "Use your Expression number talents to fulfill your Life Path purpose",
      "Be aware of your Soul Urge motivations to understand your deeper desires",
      "Your Personality number shows how you interface with the world"
    ]
  };
}
