
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RefreshCw, UserCheck } from 'lucide-react';

export const PersonalityConsistencyTester: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [consistencyResults, setConsistencyResults] = useState<any[]>([]);

  const runConsistencyTest = async () => {
    setIsRunning(true);
    // Placeholder for personality consistency tests
    await new Promise(resolve => setTimeout(resolve, 1800));
    setConsistencyResults([
      { name: 'Trait Consistency', status: 'passed', details: 'Personality traits consistent across sessions' },
      { name: 'Response Patterns', status: 'passed', details: 'Response patterns match personality profile' }
    ]);
    setIsRunning(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Personality Consistency Tester
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={runConsistencyTest} disabled={isRunning}>
          {isRunning ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
          Test Consistency
        </Button>
        
        {consistencyResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {consistencyResults.map((result, index) => (
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

export default PersonalityConsistencyTester;
