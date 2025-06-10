
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { BlueprintHealthChecker } from '@/services/blueprint-health-checker';
import { blueprintService } from '@/services/blueprint-service';

export const BlueprintHealthCheck: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{ success: boolean; errors: string[]; message: string } | null>(null);

  const runHealthCheck = async () => {
    setIsRunning(true);
    setResults(null);
    
    // Enable health check mode
    BlueprintHealthChecker.enableHealthCheckMode();
    
    const testUserData = {
      full_name: "Health Check User",
      birth_date: "1990-06-15",
      birth_time_local: "14:30",
      birth_location: "New York, NY, USA",
      timezone: "America/New_York",
      personality: "INFJ"
    };
    
    const errors: string[] = [];
    
    try {
      console.log('🔍 Starting Blueprint Health Check...');
      
      const result = await blueprintService.generateBlueprintFromBirthData(testUserData);
      
      if (result.error) {
        errors.push(result.error);
      }
      
      if (result.data) {
        console.log('✅ Blueprint generated successfully');
        setResults({
          success: true,
          errors: [],
          message: 'All calculations are working properly! Blueprint generated with real calculated data.'
        });
      } else {
        setResults({
          success: false,
          errors,
          message: 'Health check revealed calculation failures.'
        });
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMessage);
      
      setResults({
        success: false,
        errors,
        message: 'Health check revealed calculation failures.'
      });
    } finally {
      // Disable health check mode
      BlueprintHealthChecker.disableHealthCheckMode();
      setIsRunning(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Blueprint Health Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This health check verifies that all blueprint calculations are working properly by disabling fallback data 
          and testing with sample birth information.
        </p>
        
        <Button 
          onClick={runHealthCheck} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? 'Running Health Check...' : 'Run Health Check'}
        </Button>
        
        {results && (
          <div className={`p-4 rounded-lg border ${results.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              {results.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <h3 className="font-semibold">
                {results.success ? 'Health Check Passed' : 'Health Check Failed'}
              </h3>
            </div>
            
            <p className="text-sm mb-2">{results.message}</p>
            
            {results.errors.length > 0 && (
              <div className="space-y-1">
                <h4 className="font-medium text-sm">Issues Found:</h4>
                <ul className="text-sm space-y-1">
                  {results.errors.map((error, index) => (
                    <li key={index} className="text-red-700">• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          <p><strong>What this checks:</strong></p>
          <ul className="mt-1 space-y-1 ml-4">
            <li>• Human Design calculations (not using defaults)</li>
            <li>• Western astrology calculations (real planetary positions)</li>
            <li>• Chinese zodiac calculations (proper lunar calendar)</li>
            <li>• Numerology calculations (name and birth date based)</li>
            <li>• Edge function connectivity and data flow</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
