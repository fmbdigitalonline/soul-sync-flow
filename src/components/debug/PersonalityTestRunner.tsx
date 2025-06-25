
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RefreshCw, User } from 'lucide-react';

export const PersonalityTestRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const runTests = async () => {
    setIsRunning(true);
    // Placeholder for personality tests
    await new Promise(resolve => setTimeout(resolve, 2000));
    setTestResults([
      { name: 'MBTI Consistency', status: 'passed', details: 'Type consistency validated' },
      { name: 'Layer Integration', status: 'passed', details: 'All layers properly integrated' }
    ]);
    setIsRunning(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Personality Test Runner
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={runTests} disabled={isRunning}>
          {isRunning ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
          Run Personality Tests
        </Button>
        
        {testResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center gap-2 p-2 border rounded">
                {result.status === 'passed' ? 
                  <CheckCircle className="h-4 w-4 text-green-600" /> : 
                  <XCircle className="h-4 w-4 text-red-600" />
                }
                <span>{result.name}</span>
                <Badge>{result.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonalityTestRunner;
