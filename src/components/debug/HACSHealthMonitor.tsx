import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { hacsMonitorService } from '@/services/hacs-monitor-service';
import { hacsFallbackService } from '@/services/hacs-fallback-service';
import type { HACSSystemHealth, HACSConfig } from '@/services/hacs-monitor-service';
import { useLanguage } from '@/contexts/LanguageContext';

export const HACSHealthMonitor: React.FC = () => {
  const [health, setHealth] = useState<HACSSystemHealth | null>(null);
  const [config, setConfig] = useState<HACSConfig | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    // Initialize monitoring
    hacsMonitorService.initialize();
    
    // Update health every 5 seconds
    const interval = setInterval(() => {
      setHealth(hacsMonitorService.getSystemHealth());
      setConfig(hacsMonitorService.getConfig());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleHACS = (enabled: boolean) => {
    hacsMonitorService.toggleHACS(enabled);
    setConfig(hacsMonitorService.getConfig());
  };

  const handleToggleFallback = (fallback: boolean) => {
    hacsMonitorService.setFallbackMode(fallback);
    setConfig(hacsMonitorService.getConfig());
  };

  const handleToggleModule = (moduleId: keyof HACSConfig['moduleToggle'], enabled: boolean) => {
    hacsMonitorService.toggleModule(moduleId, enabled);
    setConfig(hacsMonitorService.getConfig());
  };

  const testFallbackChain = async () => {
    setTesting(true);
    try {
      const result = await hacsFallbackService.testFallbackChain();
      setTestResults(result.results);
    } catch (error) {
      setTestResults([`Test failed: ${error}`]);
    }
    setTesting(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (!health || !config) {
    return <div>Loading HACS health monitor...</div>;
  }

  return (
    <div className="space-y-4">
      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t('system.soulSystemDiagnostics')}
            <Badge className={getStatusColor(health.overall)}>
              {health.overall.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">System Enabled</label>
              <Switch
                checked={config.enabled}
                onCheckedChange={handleToggleHACS}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Fallback Mode</label>
              <Switch
                checked={config.fallbackMode}
                onCheckedChange={handleToggleFallback}
              />
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm">Integration Status: <Badge>{health.integrationStatus}</Badge></p>
            <p className="text-sm">Last Check: {health.lastFullCheck.toLocaleTimeString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Module Health */}
      <Card>
        <CardHeader>
          <CardTitle>Module Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {health.modules.map((module) => (
              <div key={module.moduleId} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(module.status)}>
                    {module.moduleId.toUpperCase()}
                  </Badge>
                  <div className="text-sm">
                    <div>Response: {module.responseTime}ms</div>
                    <div>Errors: {module.errorCount}</div>
                  </div>
                </div>
                <Switch
                  checked={config.moduleToggle[module.moduleId as keyof typeof config.moduleToggle]}
                  onCheckedChange={(enabled) => 
                    handleToggleModule(module.moduleId as keyof typeof config.moduleToggle, enabled)
                  }
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {health.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            {health.recommendations.map((rec, index) => (
              <Alert key={index} className="mb-2">
                <AlertDescription>{rec}</AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Fallback Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Fallback Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testFallbackChain} disabled={testing}>
            {testing ? 'Testing...' : 'Test Fallback Chain'}
          </Button>
          
          {testResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm p-2 bg-gray-100 rounded">
                  {result}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};