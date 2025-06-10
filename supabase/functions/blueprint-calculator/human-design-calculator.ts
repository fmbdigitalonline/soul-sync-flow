
// Modified Human Design calculation module - now calls Vercel API
export async function calculateHumanDesign(birthDate: string, birthTime: string, location: string, timezone: string, celestialData: any) {
  try {
    console.log("Calling Vercel API for Human Design calculation...");
    console.log("Birth data:", { birthDate, birthTime, location, timezone });
    
    // Call the Vercel API endpoint for Human Design calculations
    const vercelResponse = await fetch("https://soul-sync-flow.vercel.app/api/human-design", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        birthDate,
        birthTime,
        birthLocation: location,
        timezone,
        celestialData
      })
    });
    
    console.log("Vercel Human Design API response status:", vercelResponse.status);
    
    if (!vercelResponse.ok) {
      const errorText = await vercelResponse.text();
      console.error("Vercel Human Design API error:", errorText);
      throw new Error(`Human Design API failed: ${vercelResponse.status} ${errorText}`);
    }
    
    const apiResponse = await vercelResponse.json();
    console.log("Vercel Human Design API response:", apiResponse);
    
    if (!apiResponse.success) {
      throw new Error(apiResponse.error || 'Human Design calculation failed');
    }
    
    // Check if we got the placeholder response indicating we need a proper library
    if (apiResponse.data?.error === 'NEEDS_PROPER_HD_LIBRARY') {
      console.log("⚠️ Human Design API indicates it needs a proper library implementation");
      console.log("Libraries to research:", apiResponse.data.libraries_to_research);
      
      // For now, return a fallback calculation until we implement the proper library
      return generateFallbackHumanDesign(birthDate, birthTime, location, timezone, celestialData);
    }
    
    return apiResponse.data;
    
  } catch (error) {
    console.error("Error calling Vercel Human Design API:", error);
    
    // Fallback to local calculation if API fails
    console.log("Falling back to local Human Design calculation...");
    return generateFallbackHumanDesign(birthDate, birthTime, location, timezone, celestialData);
  }
}

// Fallback function for when we need a temporary solution
function generateFallbackHumanDesign(birthDate: string, birthTime: string, location: string, timezone: string, celestialData: any) {
  console.log("🔄 Using fallback Human Design calculation (temporary until proper library is integrated)");
  
  // Return a clearly marked fallback result
  return {
    type: "Generator", // Fallback - needs proper calculation
    profile: "1/3 (Investigator/Martyr)", // Fallback - needs proper calculation
    authority: "Sacral", // Fallback - needs proper calculation
    strategy: "Wait to respond",
    definition: "Single Definition",
    not_self_theme: "Frustration",
    life_purpose: "Fallback calculation - proper Human Design library needed",
    centers: {
      "Sacral": { defined: true, gates: [], channels: [] },
      "Throat": { defined: false, gates: [], channels: [] },
      "Head": { defined: false, gates: [], channels: [] },
      "Ajna": { defined: false, gates: [], channels: [] },
      "G": { defined: false, gates: [], channels: [] },
      "Heart": { defined: false, gates: [], channels: [] },
      "Solar Plexus": { defined: false, gates: [], channels: [] },
      "Spleen": { defined: false, gates: [], channels: [] },
      "Root": { defined: false, gates: [], channels: [] }
    },
    gates: {
      unconscious_design: [],
      conscious_personality: []
    },
    metadata: {
      personality_time: new Date(birthDate + "T" + birthTime).toISOString(),
      design_time: new Date(Date.now() - (89.66 * 24 * 60 * 60 * 1000)).toISOString(),
      offset_days: "89.66",
      calculation_method: "FALLBACK_NEEDS_PROPER_LIBRARY",
      notice: "This is a fallback calculation. A proper Human Design library needs to be integrated into the Vercel API."
    }
  };
}
