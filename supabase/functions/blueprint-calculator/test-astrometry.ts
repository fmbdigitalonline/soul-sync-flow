
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getErrorMessage } from '../_shared/error-utils.ts';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export default async function testAstrometry(req: Request): Promise<Response> {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== @OBSERVERLY/ASTROMETRY EVALUATION TEST ===');
    
    let responseMessage = `=== @OBSERVERLY/ASTROMETRY EVALUATION TEST ===\n`;
    let status = 200;

    // Test 1: Import and check available exports
    try {
      console.log('Testing @observerly/astrometry import...');
      
      // Import the main astrometry package
      const astrometry = await import('https://esm.sh/@observerly/astrometry@1.0.0');
      
      const allExports = Object.keys(astrometry).sort();
      responseMessage += `✅ Successfully imported @observerly/astrometry\n`;
      responseMessage += `Total exports found: ${allExports.length}\n`;
      responseMessage += `Available functions: ${allExports.join(', ')}\n\n`;
      
      console.log(`Astrometry exports:`, allExports);
      
      // Test 2: Check for required functions
      const requiredFunctions = [
        'getEclipticLongitude',
        'getEclipticLatitude', 
        'getGeocentricCoordinates',
        'getHeliocentricCoordinates',
        'getLunarNodes',
        'getObliquityOfEcliptic',
        'julianDay',
        'convertToJulianDay'
      ];
      
      responseMessage += `=== REQUIRED FUNCTION AVAILABILITY ===\n`;
      const availableFunctions: Record<string, boolean> = {};
      
      requiredFunctions.forEach(funcName => {
        const isAvailable = typeof astrometry[funcName] === 'function';
        availableFunctions[funcName] = isAvailable;
        responseMessage += `${funcName}: ${isAvailable ? '✅ Available' : '❌ Missing'}\n`;
        console.log(`${funcName}: ${isAvailable ? 'Available' : 'Missing'}`);
      });
      
      // Test 3: Test with problematic dates
      const testDates = [
        { name: 'Problematic Date 1', date: new Date('2024-11-15T06:23:00.000Z') },
        { name: 'Problematic Date 2', date: new Date('1977-11-15T06:23:00.000Z') },
        { name: 'Standard Date 1', date: new Date('1990-06-15T12:00:00.000Z') },
        { name: 'Standard Date 2', date: new Date('2000-01-01T00:00:00.000Z') }
      ];
      
      responseMessage += `\n=== DATE PROCESSING TESTS ===\n`;
      
      for (const testCase of testDates) {
        try {
          responseMessage += `\nTesting ${testCase.name}: ${testCase.date.toISOString()}\n`;
          
          // Test Julian Day conversion
          if (astrometry.julianDay) {
            const jd = astrometry.julianDay(testCase.date);
            responseMessage += `  Julian Day: ${jd}\n`;
          } else if (astrometry.convertToJulianDay) {
            const jd = astrometry.convertToJulianDay(testCase.date);
            responseMessage += `  Julian Day: ${jd}\n`;
          } else {
            responseMessage += `  ❌ No Julian Day function available\n`;
          }
          
          // Test basic coordinate calculations if functions exist
          if (astrometry.getEclipticLongitude) {
            try {
              const sunLon = astrometry.getEclipticLongitude('sun', testCase.date);
              responseMessage += `  Sun Longitude: ${sunLon}°\n`;
            } catch (e: unknown) {
              responseMessage += `  Sun Longitude Error: ${getErrorMessage(e)}\n`;
            }
          }
          
          if (astrometry.getObliquityOfEcliptic) {
            try {
              const obliquity = astrometry.getObliquityOfEcliptic(testCase.date);
              responseMessage += `  Obliquity: ${obliquity}°\n`;
            } catch (e: unknown) {
              responseMessage += `  Obliquity Error: ${getErrorMessage(e)}\n`;
            }
          }
          
        } catch (dateError: unknown) {
          responseMessage += `  ❌ Date processing failed: ${getErrorMessage(dateError)}\n`;
          console.error(`Date test failed for ${testCase.name}:`, dateError);
        }
      }
      
      // Test 4: Alternative import patterns
      responseMessage += `\n=== ALTERNATIVE IMPORT TESTING ===\n`;
      
      try {
        // Try importing specific modules
        const coordinates = await import('https://esm.sh/@observerly/astrometry@1.0.0/coordinates');
        responseMessage += `✅ Coordinates module imported\n`;
        console.log('Coordinates module exports:', Object.keys(coordinates));
      } catch (e: unknown) {
        responseMessage += `❌ Coordinates module import failed: ${getErrorMessage(e)}\n`;
      }
      
      try {
        const epochs = await import('https://esm.sh/@observerly/astrometry@1.0.0/epochs');
        responseMessage += `✅ Epochs module imported\n`;
        console.log('Epochs module exports:', Object.keys(epochs));
      } catch (e: unknown) {
        responseMessage += `❌ Epochs module import failed: ${getErrorMessage(e)}\n`;
      }
      
      try {
        const planets = await import('https://esm.sh/@observerly/astrometry@1.0.0/planets');
        responseMessage += `✅ Planets module imported\n`;
        console.log('Planets module exports:', Object.keys(planets));
      } catch (e: unknown) {
        responseMessage += `❌ Planets module import failed: ${getErrorMessage(e)}\n`;
      }
      
    } catch (importError: unknown) {
      responseMessage += `❌ CRITICAL: Failed to import @observerly/astrometry: ${getErrorMessage(importError)}\n`;
      status = 500;
      console.error('Import error:', importError);
    }
    
    // Test 5: Try alternative versions or related packages
    responseMessage += `\n=== ALTERNATIVE PACKAGE TESTING ===\n`;
    
    const alternativePackages = [
      '@observerly/astrometry@latest',
      'astronomy-bundle',
      'meus',
      'vsop87'
    ];
    
    for (const pkg of alternativePackages) {
      try {
        console.log(`Testing ${pkg}...`);
        const altPackage = await import(`https://esm.sh/${pkg}`);
        responseMessage += `✅ ${pkg}: Successfully imported (${Object.keys(altPackage).length} exports)\n`;
      } catch (e: unknown) {
        responseMessage += `❌ ${pkg}: Import failed - ${getErrorMessage(e)}\n`;
      }
    }
    
    // Environment information
    responseMessage += `\n=== ENVIRONMENT INFO ===\n`;
    responseMessage += `Deno version: ${Deno.version.deno}\n`;
    responseMessage += `V8 version: ${Deno.version.v8}\n`;
    responseMessage += `TypeScript version: ${Deno.version.typescript}\n`;
    responseMessage += `Test completed at: ${new Date().toISOString()}\n`;
    
    return new Response(responseMessage, { 
      status: status, 
      headers: { 
        "Content-Type": "text/plain; charset=utf-8",
        ...corsHeaders 
      } 
    });
    
  } catch (error: unknown) {
    console.error("Unexpected error in astrometry test:", error);
    
    return new Response(
      `Unexpected error in astrometry evaluation: ${getErrorMessage(error)}\nStack: ${error instanceof Error ? error.stack : 'No stack trace'}`,
      { 
        status: 500,
        headers: { 
          "Content-Type": "text/plain; charset=utf-8",
          ...corsHeaders 
        } 
      }
    );
  }
}

// Also support direct serving if this file is run independently
if (import.meta.main) {
  serve(testAstrometry);
}
