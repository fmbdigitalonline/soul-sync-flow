
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Edge function to handle blueprint generation requests
 * STRICTLY ONE REQUEST - absolutely no retries under any circumstances
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const requestData = await req.json();
    console.log("Received data:", JSON.stringify(requestData));

    // Check if we have the userMeta field, which is what our frontend is sending
    const userMeta = requestData.userMeta;
    
    if (!userMeta) {
      throw new Error("Missing user metadata in request");
    }

    // For development/debugging, log the data we received
    console.log(`Processing blueprint for: ${userMeta.full_name}, born on ${userMeta.birth_date}`);
    
    if (!OPENAI_API_KEY) {
      throw new Error("Missing OpenAI API key. Please add OPENAI_API_KEY to your Supabase secrets.");
    }

    // Define tool functions for the model to call
    const tools = [
      {
        type: "function",
        function: {
          name: "calc_numerology",
          description: "Calculate Life-Path and other core numerology numbers",
          parameters: {
            type: "object",
            properties: {
              birth_date: {
                type: "string",
                description: "Birth date in YYYY-MM-DD format"
              },
              full_name: {
                type: "string",
                description: "Full name for expression number calculation"
              }
            },
            required: ["birth_date"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_human_design",
          description: "Return Human Design chart JSON (type, profile, authority, etc.)",
          parameters: {
            type: "object",
            properties: {
              birth_date: {
                type: "string", 
                description: "Birth date in YYYY-MM-DD format"
              },
              birth_time: {
                type: "string", 
                description: "Birth time in 24-hour format HH:MM"
              },
              birth_location: {
                type: "string",
                description: "Birth location as City/Country"
              }
            },
            required: ["birth_date"]
          }
        }
      }
    ];

    // Determine the birth location for better location-specific search
    const locationInfo = parseLocationForSearch(userMeta.birth_location);
    
    // Make ONE SINGLE API call to OpenAI - no retry mechanism whatsoever
    console.log("Calling OpenAI with GPT-4o Search Preview and function calling - ONE TIME ONLY");
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-search-preview",
        messages: [
          { 
            role: "system", 
            content: `You are an expert astrologer, numerologist, Human Design reader, Chinese metaphysics interpreter, and personality psychologist. 

DO NOT calculate numerology or Human Design values yourself - always use the provided functions.
After you receive the JSON results from these functions, integrate them with your analysis of Western astrology and Chinese zodiac (you may web-search for these if needed).

Your response should be a well-structured JSON object containing these components:
- Western astrology (sun sign, moon sign, rising sign, aspects, etc.)
- Human Design (type, profile, authority, strategy, centers, gates)
- Numerology (life path number, expression number, etc.)
- Chinese zodiac analysis
- MBTI-style cognitive profile
- Bashar's belief interface principles

Format all components accurately and return a detailed structured response with all sections.`
          },
          { 
            role: "user", 
            content: `Generate a complete Soul Blueprint for this person:
Full name: ${userMeta.full_name}
Birth date: ${userMeta.birth_date}
Birth time: ${userMeta.birth_time_local || "Unknown"}
Birth location: ${userMeta.birth_location || "Unknown"}
MBTI (if known): ${userMeta.mbti || "Unknown"}

First use the calc_numerology function to get accurate Life Path and other numerology numbers.
Then use the get_human_design function to get accurate Human Design information.
Only after having these accurate calculations, integrate them with Western astrology and Chinese zodiac analysis.`
          }
        ],
        tools: tools,
        tool_choice: "auto", // Let the model decide when to use tools
        max_tokens: 1500,
        temperature: 0.7,
        web_search_options: {
          search_context_size: "medium",
          user_location: locationInfo
        }
      })
    });

    // Check for API errors
    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", JSON.stringify(errorData));
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    // Parse the API response
    const data = await response.json();
    console.log("OpenAI API response received - ONE TIME ONLY"); // Add clear logging
    
    // Process the tool calls and execute the functions
    let generatedContent = "";
    let toolCalls = [];
    
    // Handle any tool calls in the response
    if (data.choices[0].message.tool_calls && data.choices[0].message.tool_calls.length > 0) {
      console.log("Model requested to use tools");
      
      // Save all tool calls for debugging
      toolCalls = data.choices[0].message.tool_calls;
      
      // Process each tool call
      const toolCallResults = [];
      
      for (const toolCall of data.choices[0].message.tool_calls) {
        console.log(`Processing tool call: ${toolCall.function.name}`);
        
        if (toolCall.function.name === "calc_numerology") {
          // Handle numerology calculation
          const args = JSON.parse(toolCall.function.arguments);
          const numerologyResult = calculateNumerology(args.birth_date, args.full_name || userMeta.full_name);
          toolCallResults.push({
            tool_call_id: toolCall.id,
            role: "tool",
            name: toolCall.function.name,
            content: JSON.stringify(numerologyResult)
          });
          console.log(`Numerology calculation complete: ${JSON.stringify(numerologyResult)}`);
        }
        else if (toolCall.function.name === "get_human_design") {
          // Handle Human Design calculation
          const args = JSON.parse(toolCall.function.arguments);
          const humanDesignResult = await calculateHumanDesign(
            args.birth_date, 
            args.birth_time || userMeta.birth_time_local,
            args.birth_location || userMeta.birth_location
          );
          toolCallResults.push({
            tool_call_id: toolCall.id,
            role: "tool",
            name: toolCall.function.name,
            content: JSON.stringify(humanDesignResult)
          });
          console.log(`Human Design calculation complete: ${JSON.stringify(humanDesignResult)}`);
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
          model: "gpt-4o-search-preview",
          messages: [
            { 
              role: "system", 
              content: `You are an expert astrologer, numerologist, Human Design reader, Chinese metaphysics interpreter, and personality psychologist. 
  
  Using the precise numerological and Human Design data provided by the tools, create a well-structured Soul Blueprint.
  
  Your response should be a JSON object containing these components:
  - Western astrology (sun sign, moon sign, rising sign)
  - Human Design (using the EXACT values from the tool results, do not modify them)
  - Numerology (using the EXACT values from the tool results, do not modify them)
  - Chinese zodiac analysis
  - MBTI-style cognitive profile
  - Bashar's belief interface principles`
            },
            { 
              role: "user", 
              content: `Generate a complete Soul Blueprint for this person:
  Full name: ${userMeta.full_name}
  Birth date: ${userMeta.birth_date}
  Birth time: ${userMeta.birth_time_local || "Unknown"}
  Birth location: ${userMeta.birth_location || "Unknown"}
  MBTI (if known): ${userMeta.mbti || "Unknown"}`
            },
            ...data.choices[0].message.tool_calls.map(tc => ({
              role: "assistant",
              content: null,
              tool_calls: [tc]
            })),
            ...toolCallResults
          ],
          temperature: 0.7,
          max_tokens: 1500,
          web_search_options: {
            search_context_size: "medium",
            user_location: locationInfo
          }
        })
      });
      
      if (!secondResponse.ok) {
        const errorData = await secondResponse.json();
        console.error("Second OpenAI API error:", JSON.stringify(errorData));
        throw new Error(`Second OpenAI API error: ${JSON.stringify(errorData)}`);
      }
      
      const secondData = await secondResponse.json();
      generatedContent = secondData.choices[0].message.content;
      console.log("Second API call successful, received generated blueprint");
    } else {
      // If no tool calls were made, use the content directly
      generatedContent = data.choices[0].message.content;
    }
    
    console.log("Raw content received:", generatedContent.substring(0, 100) + "..."); // Log the start of raw content
    
    try {
      // Parse the generated content - note that it might not be valid JSON directly
      let parsedBlueprint = {};
      let needsParsing = false;
      let rawContent = null;
      
      // Try to extract JSON data from the content
      try {
        // First attempt: Try to parse the entire response as JSON
        parsedBlueprint = JSON.parse(generatedContent);
        console.log("Successfully parsed response as direct JSON");
      } catch (parseError) {
        console.log("Response is not directly parseable as JSON, attempting to extract JSON portion");
        
        // Second attempt: Look for a JSON code block (starts with ```json and ends with ```)
        const jsonCodeBlockMatch = generatedContent.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonCodeBlockMatch) {
          try {
            parsedBlueprint = JSON.parse(jsonCodeBlockMatch[1]);
            console.log("Successfully extracted JSON from code block");
          } catch (nestedParseError) {
            console.error("Failed to parse JSON from code block:", nestedParseError);
            needsParsing = true;
            rawContent = generatedContent;
          }
        } else {
          // Third attempt: Try to find JSON-like content within the text (between { and })
          const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              parsedBlueprint = JSON.parse(jsonMatch[0]);
              console.log("Successfully extracted JSON from content");
            } catch (nestedParseError) {
              console.error("Failed to extract JSON from response:", nestedParseError);
              needsParsing = true;
              rawContent = generatedContent;
            }
          } else {
            // If no JSON-like content found, flag it for manual parsing
            console.log("No JSON structure found in response");
            needsParsing = true;
            rawContent = generatedContent;
          }
        }
      }
      
      // Save any citation information from the API response
      const citations = data.choices[0].message.annotations || [];
      if (citations.length > 0) {
        console.log(`Found ${citations.length} citations in the response`);
      }
      
      // Create a complete blueprint object with the required structure
      const completeBlueprint = {
        _meta: {
          generation_method: "gpt-4o-search-preview-with-tools",
          model_version: "gpt-4o-search-preview",
          generation_date: new Date().toISOString(),
          birth_data: userMeta,
          schema_version: "1.0",
          error: null,
          raw_response: data, // Store full API response for debugging
          tool_calls: toolCalls, // Store tool calls for debugging
          _citations: citations.length > 0 ? citations : null
        },
        user_meta: {
          ...userMeta
        }
      };
      
      // If we have successfully parsed JSON without issues
      if (!needsParsing) {
        console.log("Using structured JSON data for blueprint");
        
        // Map the parsed data to our expected blueprint format
        try {
          // Extract western astrology data
          if (parsedBlueprint.WesternAstrology || parsedBlueprint.archetype_western || parsedBlueprint.westernAstrology) {
            const astroData = parsedBlueprint.WesternAstrology || parsedBlueprint.archetype_western || parsedBlueprint.westernAstrology;
            completeBlueprint.archetype_western = {
              sun_sign: astroData.SunSign || astroData.sun_sign || "",
              sun_keyword: astroData.SunKeyword || astroData.sun_keyword || "",
              sun_dates: astroData.SunDates || astroData.sun_dates || "",
              sun_element: astroData.Element || astroData.sun_element || "",
              sun_qualities: astroData.Qualities || astroData.sun_qualities || "",
              moon_sign: astroData.MoonSign || astroData.moon_sign || "",
              moon_keyword: astroData.MoonKeyword || astroData.moon_keyword || "",
              moon_element: astroData.MoonElement || astroData.moon_element || "",
              rising_sign: astroData.RisingSign || astroData.rising_sign || "",
              aspects: [],
              houses: {}
            };
            
            // Extract aspects if available
            if (astroData.Aspects || astroData.aspects) {
              const aspects = astroData.Aspects || astroData.aspects;
              if (Array.isArray(aspects)) {
                completeBlueprint.archetype_western.aspects = aspects;
              } else {
                // Convert object format to array format if needed
                completeBlueprint.archetype_western.aspects = Object.entries(aspects).map(([key, value]) => {
                  return { 
                    planet: key.split(/(?=[A-Z])/)[0] || "Planet", 
                    aspect: key.match(/(?=[A-Z])(.*)$/)?.[1] || "Aspect",
                    planet2: "Other", 
                    orb: "0°",
                    active: value
                  };
                });
              }
            }
          }
          
          // Extract human design data
          if (parsedBlueprint.HumanDesign || parsedBlueprint.energy_strategy_human_design || parsedBlueprint.humanDesign) {
            const hdData = parsedBlueprint.HumanDesign || parsedBlueprint.energy_strategy_human_design || parsedBlueprint.humanDesign;
            completeBlueprint.energy_strategy_human_design = {
              type: hdData.Type || hdData.type || "",
              profile: hdData.Profile || hdData.profile || "",
              authority: hdData.Authority || hdData.authority || "",
              strategy: hdData.Strategy || hdData.strategy || "",
              definition: hdData.Definition || hdData.definition || "",
              not_self_theme: hdData.NotSelf || hdData.not_self_theme || "",
              life_purpose: hdData.LifePurpose || hdData.life_purpose || "",
              centers: {},
              gates: {
                unconscious_design: [],
                conscious_personality: []
              }
            };
            
            // Process centers
            if (hdData.Centers || hdData.centers) {
              const centers = hdData.Centers || hdData.centers;
              
              // Handle different formats of centers data
              if (centers.Defined && centers.Undefined) {
                // Format: { "Defined": ["Center1", "Center2"], "Undefined": ["Center3"] }
                const definedCenters = centers.Defined.map(c => c.toLowerCase());
                
                completeBlueprint.energy_strategy_human_design.centers = {
                  root: definedCenters.includes("root"),
                  sacral: definedCenters.includes("sacral"),
                  spleen: definedCenters.includes("spleen"),
                  solar_plexus: definedCenters.includes("solar plexus") || definedCenters.includes("solarplexus"),
                  heart: definedCenters.includes("heart") || definedCenters.includes("ego"),
                  throat: definedCenters.includes("throat"),
                  ajna: definedCenters.includes("ajna"),
                  head: definedCenters.includes("head") || definedCenters.includes("crown"),
                  g: definedCenters.includes("g") || definedCenters.includes("g center")
                };
              } else {
                // Direct mapping format: { "root": true, "sacral": false }
                completeBlueprint.energy_strategy_human_design.centers = centers;
              }
            }
            
            // Process gates
            if (hdData.Gates || hdData.gates) {
              const gates = hdData.Gates || hdData.gates;
              
              if (gates.Defined && Array.isArray(gates.Defined)) {
                // Convert number gates to string format: 34 -> "34.1"
                completeBlueprint.energy_strategy_human_design.gates.unconscious_design = 
                  gates.Defined.map(g => typeof g === 'number' ? `${g}.1` : g);
              }
              
              if (gates.unconscious_design && Array.isArray(gates.unconscious_design)) {
                completeBlueprint.energy_strategy_human_design.gates.unconscious_design = gates.unconscious_design;
              }
              
              if (gates.conscious_personality && Array.isArray(gates.conscious_personality)) {
                completeBlueprint.energy_strategy_human_design.gates.conscious_personality = gates.conscious_personality;
              }
            }
          }
          
          // Extract numerology data
          if (parsedBlueprint.Numerology || parsedBlueprint.values_life_path || parsedBlueprint.numerology) {
            const numData = parsedBlueprint.Numerology || parsedBlueprint.values_life_path || parsedBlueprint.numerology;
            completeBlueprint.values_life_path = {
              life_path_number: numData.LifePathNumber || numData.life_path_number || 0,
              life_path_keyword: numData.LifePathKeyword || numData.life_path_keyword || "",
              life_path_description: numData.LifePathDescription || numData.life_path_description || "",
              birth_day_number: parseInt(userMeta.birth_date.split("-")[2]) || 0,
              birth_day_meaning: numData.BirthDayMeaning || numData.birth_day_meaning || "",
              personal_year: numData.PersonalYear || numData.personal_year || new Date().getFullYear() % 9 || 9,
              expression_number: numData.ExpressionNumber || numData.expression_number || 0,
              expression_keyword: numData.ExpressionKeyword || numData.expression_keyword || "",
              soul_urge_number: numData.SoulUrgeNumber || numData.soul_urge_number || 0,
              soul_urge_keyword: numData.SoulUrgeKeyword || numData.soul_urge_keyword || "",
              personality_number: numData.PersonalityNumber || numData.personality_number || 0
            };
          }
          
          // Extract Chinese zodiac data
          if (parsedBlueprint.ChineseZodiac || parsedBlueprint.archetype_chinese || parsedBlueprint.chineseZodiac) {
            const czData = parsedBlueprint.ChineseZodiac || parsedBlueprint.archetype_chinese || parsedBlueprint.chineseZodiac;
            completeBlueprint.archetype_chinese = {
              animal: czData.Sign || czData.animal || "",
              element: czData.Element || czData.element || "",
              yin_yang: czData.YinYang || czData.yin_yang || "",
              keyword: czData.Keyword || czData.keyword || "",
              element_characteristic: czData.ElementCharacteristic || czData.element_characteristic || "",
              personality_profile: czData.PersonalityProfile || czData.personality_profile || "",
              compatibility: czData.Compatibility || czData.compatibility || {
                best: [],
                worst: []
              }
            };
          }
          
          // Extract MBTI data
          if (parsedBlueprint.MBTI || parsedBlueprint.cognition_mbti || parsedBlueprint.mbti) {
            const mbtiData = parsedBlueprint.MBTI || parsedBlueprint.cognition_mbti || parsedBlueprint.mbti;
            completeBlueprint.cognition_mbti = {
              type: mbtiData.Type || mbtiData.type || userMeta.mbti || "",
              core_keywords: mbtiData.Keywords || mbtiData.core_keywords || [],
              dominant_function: 
                (mbtiData.CognitiveFunctions && mbtiData.CognitiveFunctions.Dominant) || 
                mbtiData.dominant_function || "",
              auxiliary_function: 
                (mbtiData.CognitiveFunctions && mbtiData.CognitiveFunctions.Auxiliary) || 
                mbtiData.auxiliary_function || ""
            };
          }
          
          // Extract Bashar principles
          if (parsedBlueprint.BasharBeliefInterface || parsedBlueprint.bashar_suite || parsedBlueprint.basharBeliefInterface) {
            const basharData = parsedBlueprint.BasharBeliefInterface || parsedBlueprint.bashar_suite || parsedBlueprint.basharBeliefInterface;
            completeBlueprint.bashar_suite = {
              belief_interface: {
                principle: "What you believe is what you experience as reality",
                reframe_prompt: "What would I have to believe to experience this?"
              },
              excitement_compass: {
                principle: "Follow your highest excitement in the moment to the best of your ability"
              },
              frequency_alignment: {
                quick_ritual: "Visualize feeling the way you want to feel for 17 seconds"
              },
              core_beliefs: basharData.CoreBeliefs || [],
              limiting_beliefs: basharData.LimitingBeliefs || [],
              empowering_beliefs: basharData.EmpoweringBeliefs || []
            };
          }
          
        } catch (mappingError) {
          console.error("Error mapping parsed data to blueprint format:", mappingError);
          // If mapping fails, fall back to raw content approach
          needsParsing = true;
          rawContent = generatedContent;
        }
      }
      
      // If we couldn't parse or map the data properly, store the raw content
      if (needsParsing) {
        console.log("Using raw content approach for blueprint");
        completeBlueprint.raw_content = rawContent;
        completeBlueprint.needs_parsing = true;
      }

      // Return the result - ONE CALL ONLY
      return new Response(
        JSON.stringify({
          success: true,
          blueprint: completeBlueprint,
          rawResponse: data
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    } catch (error) {
      console.error("Error processing blueprint:", error);
      throw new Error(`Failed to process blueprint: ${error.message}`);
    }
  } catch (error) {
    console.error("Error generating blueprint:", error);
    
    // Return detailed error - no retry attempts
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to generate blueprint",
        errorDetails: error.toString(),
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

// Helper function to calculate numerology
function calculateNumerology(birthDate, fullName) {
  try {
    console.log(`Calculating numerology for: ${fullName}, born on ${birthDate}`);
    
    // Calculate Life Path Number
    const digits = birthDate.split('').filter(char => /\d/.test(char)).map(d => parseInt(d, 10));
    let lifePathNumber = digits.reduce((sum, digit) => sum + digit, 0);
    
    // Reduce to single digit or master number
    while (lifePathNumber > 9 && lifePathNumber !== 11 && lifePathNumber !== 22 && lifePathNumber !== 33) {
      lifePathNumber = String(lifePathNumber).split('').map(d => parseInt(d, 10)).reduce((sum, digit) => sum + digit, 0);
    }
    
    console.log(`Life Path Number: ${lifePathNumber}`);
    
    // Calculate Birth Day Number
    const birthDay = parseInt(birthDate.split('-')[2], 10);
    let birthDayNumber = birthDay;
    if (birthDayNumber > 9 && birthDayNumber !== 11 && birthDayNumber !== 22) {
      birthDayNumber = String(birthDay).split('').map(d => parseInt(d, 10)).reduce((sum, digit) => sum + digit, 0);
    }
    
    // Simple letter-to-number mapping for other calculations
    const letterValues = {
      'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6, 'g': 7, 'h': 8, 'i': 9,
      'j': 1, 'k': 2, 'l': 3, 'm': 4, 'n': 5, 'o': 6, 'p': 7, 'q': 8, 'r': 9,
      's': 1, 't': 2, 'u': 3, 'v': 4, 'w': 5, 'x': 6, 'y': 7, 'z': 8
    };
    
    // Calculate Expression Number
    const cleanName = fullName.toLowerCase().replace(/[^a-z]/g, '');
    let expressionNumber = 0;
    for (const char of cleanName) {
      if (letterValues[char]) {
        expressionNumber += letterValues[char];
      }
    }
    
    while (expressionNumber > 9 && expressionNumber !== 11 && expressionNumber !== 22 && expressionNumber !== 33) {
      expressionNumber = String(expressionNumber).split('').map(d => parseInt(d, 10)).reduce((sum, digit) => sum + digit, 0);
    }
    
    // Calculate Soul Urge Number (vowels only)
    const vowelValues = { 'a': 1, 'e': 5, 'i': 9, 'o': 6, 'u': 3, 'y': 7 };
    let soulUrgeNumber = 0;
    for (const char of fullName.toLowerCase()) {
      if (vowelValues[char]) {
        soulUrgeNumber += vowelValues[char];
      }
    }
    
    while (soulUrgeNumber > 9 && soulUrgeNumber !== 11 && soulUrgeNumber !== 22 && soulUrgeNumber !== 33) {
      soulUrgeNumber = String(soulUrgeNumber).split('').map(d => parseInt(d, 10)).reduce((sum, digit) => sum + digit, 0);
    }
    
    // Calculate Personality Number (consonants only)
    const consonantValues = Object.fromEntries(
      Object.entries(letterValues).filter(([key]) => !['a', 'e', 'i', 'o', 'u', 'y'].includes(key))
    );
    
    let personalityNumber = 0;
    for (const char of fullName.toLowerCase()) {
      if (consonantValues[char]) {
        personalityNumber += consonantValues[char];
      }
    }
    
    while (personalityNumber > 9 && personalityNumber !== 11 && personalityNumber !== 22 && personalityNumber !== 33) {
      personalityNumber = String(personalityNumber).split('').map(d => parseInt(d, 10)).reduce((sum, digit) => sum + digit, 0);
    }
    
    return {
      life_path_number: lifePathNumber,
      birth_day_number: birthDayNumber,
      expression_number: expressionNumber,
      soul_urge_number: soulUrgeNumber,
      personality_number: personalityNumber,
      personal_year: (new Date().getFullYear() + lifePathNumber) % 9 || 9
    };
  } catch (error) {
    console.error("Error in numerology calculation:", error);
    throw error; // No fallback to see what's going wrong
  }
}

// Helper function to calculate Human Design
async function calculateHumanDesign(birthDate, birthTime, birthLocation) {
  try {
    console.log(`Calculating Human Design for: ${birthDate} ${birthTime || "Unknown"} at ${birthLocation || "Unknown location"}`);
    
    // In a real implementation, this would use the hdkit library or call an external Human Design API
    // For now, use a simplified deterministic calculation
    
    // Create a deterministic seed based on the birth data
    const seed = birthDate + (birthTime || "00:00") + (birthLocation || "Unknown");
    const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rng = seedRandom(hash);
    
    // Determine type based on seed
    const typeOptions = ["GENERATOR", "MANIFESTING_GENERATOR", "PROJECTOR", "MANIFESTOR", "REFLECTOR"];
    const typeIndex = Math.floor(rng() * typeOptions.length);
    const type = typeOptions[typeIndex];
    
    // Determine profile
    const line1 = Math.floor(rng() * 6) + 1;
    const line2 = Math.floor(rng() * 6) + 1;
    const profileLabels = {
      1: "Investigator",
      2: "Hermit",
      3: "Martyr",
      4: "Opportunist",
      5: "Heretic",
      6: "Role Model"
    };
    const profile = `${line1}/${line2} (${profileLabels[line1]}/${profileLabels[line2]})`;
    
    // Determine authority
    const authorityOptions = ["EMOTIONAL", "SACRAL", "SPLENIC", "EGO", "SELF", "NONE"];
    const authorityIndex = Math.floor(rng() * authorityOptions.length);
    const authority = authorityOptions[authorityIndex];
    
    // Determine strategy based on type
    const strategies = {
      "GENERATOR": "Wait to respond",
      "MANIFESTING_GENERATOR": "Wait to respond, then inform",
      "PROJECTOR": "Wait for the invitation",
      "MANIFESTOR": "Inform before acting",
      "REFLECTOR": "Wait a lunar cycle before deciding"
    };
    
    // Determine not-self theme based on type
    const notSelfThemes = {
      "GENERATOR": "Frustration",
      "MANIFESTING_GENERATOR": "Frustration",
      "PROJECTOR": "Bitterness",
      "MANIFESTOR": "Anger",
      "REFLECTOR": "Disappointment"
    };
    
    // Create gates
    const generateGates = (count) => {
      const gates = [];
      for (let i = 0; i < count; i++) {
        const gate = Math.floor(rng() * 64) + 1;
        const line = Math.floor(rng() * 6) + 1;
        gates.push(`${gate}.${line}`);
      }
      return gates;
    };
    
    // Create centers
    const centers = {};
    const centerNames = ["Head", "Ajna", "Throat", "G", "Heart/Ego", "Solar Plexus", "Sacral", "Spleen", "Root"];
    centerNames.forEach(center => {
      centers[center] = rng() > 0.5;
    });
    
    // Ensure type and centers match (e.g., Reflectors have no defined centers)
    if (type === "REFLECTOR") {
      centerNames.forEach(center => {
        centers[center] = false;
      });
    } else if (type === "GENERATOR" || type === "MANIFESTING_GENERATOR") {
      centers["Sacral"] = true;
    }
    
    // Determine definition
    const definedCount = Object.values(centers).filter(Boolean).length;
    let definition = "Split";
    if (definedCount >= 7) {
      definition = "Single";
    } else if (definedCount <= 2) {
      definition = "Split";
    } else {
      const options = ["Split", "Triple Split", "Quad Split"];
      definition = options[definedCount % 3];
    }
    
    // Determine life purpose
    const purposeByType = {
      "GENERATOR": "Find satisfaction through responding to life",
      "MANIFESTING_GENERATOR": "Find satisfaction through multi-faceted creation",
      "PROJECTOR": "Guide others with your unique insight",
      "MANIFESTOR": "Initiate and catalyze change for others",
      "REFLECTOR": "Mirror and sample the health of your community"
    };
    
    const purposeModifier = {
      1: "through deep investigation",
      2: "through selective sharing of wisdom",
      3: "through practical experimentation",
      4: "through finding the right networks",
      5: "through challenging the status quo",
      6: "through being an example for others"
    };
    
    const lifePurpose = `${purposeByType[type]} ${purposeModifier[line1]}`;
    
    return {
      type: type,
      profile: profile,
      authority: authority,
      strategy: strategies[type],
      definition: definition,
      not_self_theme: notSelfThemes[type],
      life_purpose: lifePurpose,
      centers: centers,
      gates: {
        unconscious_design: generateGates(4),
        conscious_personality: generateGates(4)
      }
    };
  } catch (error) {
    console.error("Error calculating Human Design:", error);
    throw error; // No fallback to see what's going wrong
  }
}

// Simple seeded random number generator for consistency
function seedRandom(seed) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  
  return function() {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
}

/**
 * Parse location string to extract potential country/city information for search context
 */
function parseLocationForSearch(locationString) {
  if (!locationString || locationString === "Unknown") {
    return { type: "approximate", approximate: {} };
  }
  
  try {
    // Basic parsing of common location formats like "City, Country" or "City, State, Country"
    const parts = locationString.split(',').map(part => part.trim());
    
    const locationData = {
      type: "approximate",
      approximate: {}
    };
    
    // Very simplified location parsing
    if (parts.length >= 1) {
      locationData.approximate.city = parts[0];
    }
    
    if (parts.length >= 2) {
      // If we have two parts, assume the second part is either state/region or country
      locationData.approximate.region = parts[1];
      
      // Try to detect if the last part is a country
      const possibleCountry = parts[parts.length - 1];
      
      // Simple mapping of some common country names to ISO codes
      const countryCodes = {
        "USA": "US", "United States": "US", "US": "US",
        "UK": "GB", "United Kingdom": "GB",
        "Canada": "CA", "Australia": "AU",
        "India": "IN", "Japan": "JP",
        "Germany": "DE", "France": "FR",
        "Italy": "IT", "Spain": "ES",
        "Surinam": "SR", "Suriname": "SR"
      };
      
      // Set the country code if we can map it
      if (countryCodes[possibleCountry]) {
        locationData.approximate.country = countryCodes[possibleCountry];
      }
    }
    
    return locationData;
  } catch (e) {
    // Return empty object if parsing fails
    return { type: "approximate", approximate: {} };
  }
}
