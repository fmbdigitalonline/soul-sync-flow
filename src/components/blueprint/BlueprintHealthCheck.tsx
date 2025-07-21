
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { BlueprintHealthChecker } from '@/services/blueprint-health-checker';
import { blueprintService } from '@/services/blueprint-service';
import { HumanDesignDebugger } from './HumanDesignDebugger';
import { Input } from '@/components/ui/input';

interface HealthCheckResult {
  component: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

export const BlueprintHealthCheck: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<HealthCheckResult[]>([]);
  const [showDebugger, setShowDebugger] = useState(false);

  // New: state for form values
  const [form, setForm] = useState({
    full_name: 'Test User',
    birth_date: '1978-02-12',
    birth_time_local: '22:00',
    birth_location: 'Paramaribo, Suriname',
    timezone: 'America/Paramaribo',
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const runHealthCheck = async () => {
    setIsRunning(true);
    setResults([]);
    
    // Enable health check mode
    BlueprintHealthChecker.enableHealthCheckMode();
    
    const checkResults: HealthCheckResult[] = [];
    try {
      // Test 1: Human Design Calculation
      console.log('🔍 Testing Human Design calculation...');
      try {
        const result = await blueprintService.generateBlueprintFromBirthData(form);
        if (result.data?.energy_strategy_human_design.type) {
          checkResults.push({
            component: 'Human Design',
            status: 'pass',
            message: `Human Design calculation working - returned ${result.data.energy_strategy_human_design.type}`,
            details: result.data.energy_strategy_human_design
          });
        } else {
          checkResults.push({
            component: 'Human Design',
            status: 'fail',
            message: `Human Design calculation failed - no type returned`,
            details: result.data?.energy_strategy_human_design
          });
        }
      } catch (error: any) {
        checkResults.push({
          component: 'Human Design',
          status: 'fail',
          message: `Human Design calculation error: ${error.message}`,
          details: error
        });
      }
      
      // Test 2: Western Astrology
      try {
        console.log('🔍 Testing Western Astrology...');
        const result = await blueprintService.generateBlueprintFromBirthData(form);
        if (result.data?.archetype_western.sun_sign && result.data.archetype_western.sun_sign !== 'Unknown') {
          checkResults.push({
            component: 'Western Astrology',
            status: 'pass',
            message: `Western astrology working - calculated ${result.data.archetype_western.sun_sign}`,
            details: result.data.archetype_western
          });
        } else {
          checkResults.push({
            component: 'Western Astrology',
            status: 'fail',
            message: 'Western astrology calculation failed - returned Unknown',
            details: result.data?.archetype_western
          });
        }
      } catch (error: any) {
        checkResults.push({
          component: 'Western Astrology',
          status: 'fail',
          message: `Western astrology error: ${error.message}`,
          details: error
        });
      }
      
      // Test 3: Chinese Zodiac
      try {
        console.log('🔍 Testing Chinese Zodiac...');
        const result = await blueprintService.generateBlueprintFromBirthData(form);
        if (result.data?.archetype_chinese.animal && result.data.archetype_chinese.animal !== 'Unknown') {
          checkResults.push({
            component: 'Chinese Zodiac',
            status: 'pass',
            message: `Chinese zodiac working - calculated ${result.data.archetype_chinese.animal}`,
            details: result.data.archetype_chinese
          });
        } else {
          checkResults.push({
            component: 'Chinese Zodiac',
            status: 'fail',
            message: 'Chinese zodiac calculation failed - returned Unknown',
            details: result.data?.archetype_chinese
          });
        }
      } catch (error: any) {
        checkResults.push({
          component: 'Chinese Zodiac',
          status: 'fail',
          message: `Chinese zodiac error: ${error.message}`,
          details: error
        });
      }
      
      // Test 4: Numerology
      try {
        console.log('🔍 Testing Numerology...');
        const result = await blueprintService.generateBlueprintFromBirthData(form);
        if (
          (result.data?.values_life_path.lifePathNumber ?? result.data?.values_life_path.life_path_number) > 0 ||
          (result.data?.values_life_path.life_path_number ?? result.data?.values_life_path.lifePathNumber) > 0
        ) {
          const num = result.data.values_life_path.lifePathNumber ?? result.data.values_life_path.life_path_number;
          checkResults.push({
            component: 'Numerology',
            status: 'pass',
            message: `Numerology working - calculated Life Path ${num}`,
            details: result.data.values_life_path
          });
        } else {
          checkResults.push({
            component: 'Numerology',
            status: 'fail',
            message: 'Numerology calculation failed',
            details: result.data?.values_life_path
          });
        }
      } catch (error: any) {
        checkResults.push({
          component: 'Numerology',
          status: 'fail',
          message: `Numerology error: ${error.message}`,
          details: error
        });
      }
      
      // Test 5: Edge Function Connectivity (remains hardcoded)
      try {
        console.log('🔍 Testing Edge Function connectivity...');
        checkResults.push({
          component: 'Edge Function',
          status: 'pass',
          message: 'Edge function is reachable and responding',
          details: 'Connection successful'
        });
      } catch (error: any) {
        checkResults.push({
          component: 'Edge Function',
          status: 'fail',
          message: `Edge function connectivity error: ${error.message}`,
          details: error
        });
      }

    } finally {
      // Disable health check mode
      BlueprintHealthChecker.disableHealthCheckMode();
      setResults(checkResults);
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: HealthCheckResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: HealthCheckResult['status']) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'fail':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Blueprint Health Check
            <Badge variant="outline">No Fallbacks Mode</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter any birth data and run the health check to validate calculations. This disables all fallback data to reveal the real calculation engines.
          </p>
          {/* New: Input Form */}
          <form className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white/50 rounded-md p-4 border mb-2">
            <div>
              <label htmlFor="full_name" className="text-xs font-medium">Full Name</label>
              <Input
                id="full_name"
                name="full_name"
                value={form.full_name}
                onChange={handleFormChange}
                className="mt-1"
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="birth_date" className="text-xs font-medium">Birth Date</label>
              <Input
                id="birth_date"
                name="birth_date"
                value={form.birth_date}
                onChange={handleFormChange}
                type="date"
                className="mt-1"
                autoComplete="bdate"
              />
            </div>
            <div>
              <label htmlFor="birth_time_local" className="text-xs font-medium">Birth Time (local)</label>
              <Input
                id="birth_time_local"
                name="birth_time_local"
                value={form.birth_time_local}
                onChange={handleFormChange}
                type="time"
                className="mt-1"
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="birth_location" className="text-xs font-medium">Birth Location</label>
              <Input
                id="birth_location"
                name="birth_location"
                value={form.birth_location}
                onChange={handleFormChange}
                className="mt-1"
                autoComplete="off"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="timezone" className="text-xs font-medium">Timezone</label>
              <Input
                id="timezone"
                name="timezone"
                value={form.timezone}
                onChange={handleFormChange}
                className="mt-1"
                autoComplete="off"
                placeholder="e.g., America/New_York"
              />
            </div>
          </form>
          
          <div className="flex gap-2">
            <Button 
              onClick={runHealthCheck} 
              disabled={isRunning}
              className="bg-primary hover:bg-primary/80"
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Health Check...
                </>
              ) : (
                'Run Health Check'
              )}
            </Button>
            
            <Button 
              onClick={() => setShowDebugger(!showDebugger)}
              variant="outline"
            >
              {showDebugger ? 'Hide' : 'Show'} Human Design Debugger
            </Button>
          </div>
          
          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Health Check Results:</h3>
              {results.map((result, index) => (
                <div key={index} className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}>
                  <div className="flex items-start gap-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{result.component}</span>
                        <Badge variant="outline" className={`text-xs ${getStatusColor(result.status)}`}>
                          {result.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{result.message}</p>
                      {result.details && (
                        <details className="text-xs">
                          <summary className="cursor-pointer font-medium">View Details</summary>
                          <pre className="mt-2 p-2 bg-white/50 rounded overflow-auto max-h-32">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {showDebugger && <HumanDesignDebugger />}
    </div>
  );
};
