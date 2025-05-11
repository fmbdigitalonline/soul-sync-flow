
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

    // Call OpenAI API with a SINGLE attempt, no retry logic
    console.log("Calling OpenAI with GPT-4o Search Preview - ONE TIME ONLY");
    
    // Determine the birth location for better location-specific search
    const locationInfo = parseLocationForSearch(userMeta.birth_location);
    
    // Make exactly one call to OpenAI - no retry mechanism whatsoever
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
Generate a complete Soul Blueprint based on the following birth details.
Your response should be a well-structured JSON object containing these components:
- Western astrology (sun sign, moon sign, rising sign, aspects, etc.)
- Human Design (type, profile, authority, strategy, centers, gates)
- Numerology (life path number, expression number, etc.)
- Chinese zodiac analysis
- MBTI-style cognitive profile
- Bashar's belief interface principles

Format all calculations accurately and return a detailed structured response with all sections.`
          },
          { 
            role: "user", 
            content: `Generate a complete Soul Blueprint for this person:
Full name: ${userMeta.full_name}
Birth date: ${userMeta.birth_date}
Birth time: ${userMeta.birth_time_local || "Unknown"}
Birth location: ${userMeta.birth_location || "Unknown"}
MBTI (if known): ${userMeta.mbti || "Unknown"}

Include these sections in your response:
1. Western astrology with planetary positions
2. Human Design profile with centers and gates
3. Numerology calculations
4. Chinese zodiac sign and element
5. MBTI cognitive functions
6. Bashar spiritual principles`
          }
        ],
        max_tokens: 1500,
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
    
    const generatedContent = data.choices[0].message.content;
    console.log("Raw content received:", generatedContent.substring(0, 100) + "..."); // Log the start of raw content
    
    console.log("Received blueprint from OpenAI");
    
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
          generation_method: "gpt-4o-search-preview",
          model_version: "gpt-4o-search-preview",
          generation_date: new Date().toISOString(),
          birth_data: userMeta,
          schema_version: "1.0",
          error: null,
          raw_response: data, // Store full API response for debugging
          // Store citations internally but don't expose them in the UI
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
        "Italy": "IT", "Spain": "ES"
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
