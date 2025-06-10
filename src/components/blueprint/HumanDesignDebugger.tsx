
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

export const HumanDesignDebugger: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [birthData, setBirthData] = useState({
    birthDate: '1978-02-12',
    birthTime: '22:00',
    birthLocation: 'Paramaribo, Suriname',
    timezone: 'America/Paramaribo'
  });

  const runHumanDesignTest = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Testing Human Design calculation with known data...');
      
      // Call the edge function directly
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
      
      // Call the test endpoint
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Human Design Calculation Debugger</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
          
          <div className="flex gap-2">
            <Button 
              onClick={runHumanDesignTest} 
              disabled={isLoading}
              className="bg-soul-purple hover:bg-soul-purple/80"
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
          </div>
        </CardContent>
      </Card>

      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
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
                      </ul>
                    </div>
                    <div>
                      <strong>Actual:</strong>
                      <ul className="list-disc list-inside mt-1">
                        <li>Type: {testResults.data.data.humanDesign.type}</li>
                        <li>Profile: {testResults.data.data.humanDesign.profile}</li>
                        <li>Authority: {testResults.data.data.humanDesign.authority}</li>
                        <li>Strategy: {testResults.data.data.humanDesign.strategy}</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <strong className={
                      testResults.data.data.humanDesign.type === 'Projector' ? 'text-green-600' : 'text-red-600'
                    }>
                      Result: {testResults.data.data.humanDesign.type === 'Projector' ? '✅ CORRECT' : '❌ INCORRECT'}
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
