
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

export const HumanDesignDebugger: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [birthData, setBirthData] = useState({
    fullName: 'Feurion Michael Banel',
    birthDate: '1978-02-12',
    birthTime: '22:00',
    birthLocation: 'Paramaribo, Suriname',
    timezone: 'America/Paramaribo'
  });

  const runHumanDesignTest = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Testing Human Design calculation with known data...');
      
      // Call the edge function directly, now including fullName
      const { data, error } = await supabase.functions.invoke('blueprint-calculator', {
        body: birthData
      });
      
      console.log('🧪 Test Results:', { data, error });
      setTestResults({ data, error, timestamp: new Date().toISOString() });
      
    } catch (err) {
      console.error('🧪 Test Error:', err);
      setTestResults({ error: err, timestamp: new Date().toISOString() });
    } finally {
      setIsLoading(false);
    }
  };

  const runHumanDesignOnlyTest = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Testing Human Design function directly...');
      
      // Call the test endpoint (doesn't use fullName, for legacy compatibility)
      const { data, error } = await supabase.functions.invoke('blueprint-calculator/test-human-design');
      
      console.log('🧪 Human Design Test Results:', { data, error });
      setTestResults({ data, error, timestamp: new Date().toISOString(), testType: 'human-design-only' });
      
    } catch (err) {
      console.error('🧪 Human Design Test Error:', err);
      setTestResults({ error: err, timestamp: new Date().toISOString(), testType: 'human-design-only' });
    } finally {
      setIsLoading(false);
    }
  };

  // Manual gate calculation for debugging
  const debugGateCalculation = () => {
    console.log('🔍 DEBUGGING GATE CALCULATIONS');
    
    // Expected data for comparison
    const expectedData = {
      conscious_personality: ["49.6", "4.6", "27.2", "18.4", "17.4", "13.1", "30.6", "62.4", "12.4", "29.4", "1.4", "26.2", "57.2"],
      unconscious_design: ["14.2", "8.2", "55.3", "48.6", "21.6", "20.2", "44.3", "33.1", "52.2", "29.6", "44.6", "5.5", "57.1"]
    };
    
    // HD Gate Wheel (starting at 0° Aries)
    const HD_GATE_WHEEL = [
      41, 19, 13, 49, 30, 55, 37, 63,  // 0°-45° 
      22, 36, 25, 17, 21, 51, 42, 3,   // 45°-90°
      27, 24, 2, 23, 8, 20, 16, 35,    // 90°-135°
      45, 12, 15, 52, 39, 53, 62, 56,  // 135°-180°
      31, 33, 7, 4, 29, 59, 40, 64,    // 180°-225°
      47, 6, 46, 18, 48, 57, 32, 50,   // 225°-270°
      28, 44, 1, 43, 14, 34, 9, 5,     // 270°-315°
      26, 11, 10, 58, 38, 54, 61, 60   // 315°-360°
    ];
    
    // Function to convert longitude to gate/line
    const longitudeToGate = (longitude: number) => {
      const normalized = ((longitude % 360) + 360) % 360;
      const degreesPerGate = 360 / 64;  // 5.625°
      const degreesPerLine = degreesPerGate / 6;  // 0.9375°
      
      const gateIndex = Math.floor(normalized / degreesPerGate);
      const gate = HD_GATE_WHEEL[gateIndex];
      
      const positionInGate = normalized % degreesPerGate;
      const line = Math.floor(positionInGate / degreesPerLine) + 1;
      const correctedLine = Math.min(Math.max(line, 1), 6);
      
      return { gate, line: correctedLine, longitude: normalized, gateIndex };
    };
    
    // Expected planetary positions that would yield the expected gates
    console.log('🎯 REVERSE ENGINEERING EXPECTED PLANETARY POSITIONS:');
    
    // For Gate 49.6 (first expected conscious gate)
    const gate49Line6 = { gate: 49, line: 6 };
    const gate49Index = HD_GATE_WHEEL.indexOf(49); // Should be index 3
    const gate49StartDegree = gate49Index * 5.625;
    const gate49Line6Degree = gate49StartDegree + (5 * 0.9375); // Line 6 = 5 * 0.9375 + start
    
    console.log(`Gate 49.6 should be at approximately ${gate49Line6Degree.toFixed(3)}°`);
    console.log(`Gate 49 wheel index: ${gate49Index}, starts at: ${gate49StartDegree}°`);
    
    // Test current Sun position
    if (testResults?.data?.data?.celestialData?.planets?.sun) {
      const sunLon = testResults.data.data.celestialData.planets.sun.longitude;
      const sunGate = longitudeToGate(sunLon);
      console.log(`🌟 ACTUAL SUN: ${sunLon.toFixed(3)}° → Gate ${sunGate.gate}.${sunGate.line} (index ${sunGate.gateIndex})`);
      console.log(`🎯 EXPECTED SUN: ~${gate49Line6Degree.toFixed(3)}° → Gate 49.6`);
      console.log(`❌ SUN DIFFERENCE: ${Math.abs(sunLon - gate49Line6Degree).toFixed(3)}° off`);
    }
    
    // Check if the issue is the gate wheel order
    console.log('\n🔍 CHECKING GATE WHEEL MAPPING:');
    console.log('Our wheel starts with:', HD_GATE_WHEEL.slice(0, 8));
    console.log('Gate 41 (index 0) covers 0°-5.625°');
    console.log('Gate 19 (index 1) covers 5.625°-11.25°');
    console.log('Gate 13 (index 2) covers 11.25°-16.875°');
    console.log('Gate 49 (index 3) covers 16.875°-22.5°');
    
    // The issue might be we need a different time/date calculation
    console.log('\n🕐 BIRTH TIME ANALYSIS:');
    console.log('Input:', birthData);
    if (testResults?.data?.data?.timezone_info) {
      console.log('Timezone Info:', testResults.data.data.timezone_info);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Human Design Calculation Debugger</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <Input
                value={birthData.fullName}
                onChange={(e) => setBirthData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Enter your full name"
                autoComplete="name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Birth Date</label>
              <Input
                value={birthData.birthDate}
                onChange={(e) => setBirthData(prev => ({ ...prev, birthDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Birth Time</label>
              <Input
                value={birthData.birthTime}
                onChange={(e) => setBirthData(prev => ({ ...prev, birthTime: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Birth Location</label>
              <Input
                value={birthData.birthLocation}
                onChange={(e) => setBirthData(prev => ({ ...prev, birthLocation: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Timezone</label>
              <Input
                value={birthData.timezone}
                onChange={(e) => setBirthData(prev => ({ ...prev, timezone: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={runHumanDesignTest} 
              disabled={isLoading}
              className="bg-primary hover:bg-primary/80"
            >
              {isLoading ? 'Testing...' : 'Test Full Blueprint Calculator'}
            </Button>
            
            <Button 
              onClick={runHumanDesignOnlyTest} 
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? 'Testing...' : 'Test Human Design Only'}
            </Button>
            
            <Button 
              onClick={debugGateCalculation} 
              disabled={!testResults?.data}
              variant="secondary"
            >
              Debug Gate Calculations
            </Button>
          </div>
        </CardContent>
      </Card>

      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results & Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm">Expected Results (Projector):</h4>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
{`Type: Projector
Profile: 6/2 (Role Model / Hermit)  
Authority: Splenic
Strategy: Wait for the invitation
Definition: Split
Conscious Gates: 49.6, 4.6, 27.2, 18.4, 17.4, 13.1, 30.6, 62.4, 12.4, 29.4, 1.4, 26.2, 57.2
Unconscious Gates: 14.2, 8.2, 55.3, 48.6, 21.6, 20.2, 44.3, 33.1, 52.2, 29.6, 44.6, 5.5, 57.1`}
                </pre>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm">Actual Results:</h4>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-96">
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </div>
              
              {testResults.data?.data?.humanDesign && (
                <div>
                  <h4 className="font-semibold text-sm">Human Design Comparison:</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <strong>Expected:</strong>
                      <ul className="list-disc list-inside mt-1">
                        <li>Type: Projector</li>
                        <li>Profile: 6/2</li>
                        <li>Authority: Splenic</li>
                        <li>Strategy: Wait for the invitation</li>
                        <li>Definition: Split</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Actual:</strong>
                      <ul className="list-disc list-inside mt-1">
                        <li>Type: {testResults.data.data.humanDesign.type}</li>
                        <li>Profile: {testResults.data.data.humanDesign.profile}</li>
                        <li>Authority: {testResults.data.data.humanDesign.authority}</li>
                        <li>Strategy: {testResults.data.data.humanDesign.strategy}</li>
                        <li>Definition: {testResults.data.data.humanDesign.definition}</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h5 className="font-semibold text-sm mb-2">Key Planetary Positions Analysis:</h5>
                    {testResults.data?.data?.celestialData?.planets && (
                      <div className="text-xs space-y-1">
                        <div>Sun: {testResults.data.data.celestialData.planets.sun?.longitude?.toFixed(3)}° (Expected: ~16.875°-22.5° for Gate 49)</div>
                        <div>Moon: {testResults.data.data.celestialData.planets.moon?.longitude?.toFixed(3)}°</div>
                        <div>Mercury: {testResults.data.data.celestialData.planets.mercury?.longitude?.toFixed(3)}°</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2">
                    <strong className={
                      testResults.data.data.humanDesign.type === 'Projector' ? 'text-green-600' : 'text-red-600'
                    }>
                      Type Match: {testResults.data.data.humanDesign.type === 'Projector' ? '✅ CORRECT' : '❌ INCORRECT'}
                    </strong>
                    <br />
                    <strong className={
                      testResults.data.data.humanDesign.profile?.includes('6/2') ? 'text-green-600' : 'text-red-600'
                    }>
                      Profile Match: {testResults.data.data.humanDesign.profile?.includes('6/2') ? '✅ CORRECT' : '❌ INCORRECT'}
                    </strong>
                    <br />
                    <strong className={
                      testResults.data.data.humanDesign.authority === 'Splenic' ? 'text-green-600' : 'text-red-600'
                    }>
                      Authority Match: {testResults.data.data.humanDesign.authority === 'Splenic' ? '✅ CORRECT' : '❌ INCORRECT'}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
