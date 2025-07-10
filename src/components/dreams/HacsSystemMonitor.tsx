
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Brain, Zap, Eye, Settings, AlertTriangle } from 'lucide-react';
import { hacsMonitorService } from '@/services/hacs-monitor-service';
import { neuroIntentKernel } from '@/services/hermetic-core/neuro-intent-kernel';
import { harmonicFrequencyModulationEngine } from '@/services/hermetic-core/harmonic-frequency-modulation-engine';

interface HacsSystemMonitorProps {
  isVisible: boolean;
  onToggle: () => void;
}

export const HacsSystemMonitor: React.FC<HacsSystemMonitorProps> = ({ isVisible, onToggle }) => {
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [currentIntent, setCurrentIntent] = useState<any>(null);
  const [harmonyStatus, setHarmonyStatus] = useState<any>(null);

  useEffect(() => {
    if (!isVisible) return;

    const updateStatus = () => {
      setSystemHealth(hacsMonitorService.getSystemHealth());
      setCurrentIntent(neuroIntentKernel.getCurrentIntent());
      setHarmonyStatus(harmonicFrequencyModulationEngine.getHarmonyStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 2000);
    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        variant="ghost"
        size="sm"
        className="fixed bottom-4 right-4 z-50 bg-white/90 backdrop-blur-sm border shadow-lg"
      >
        <Settings className="h-4 w-4" />
        <span className="ml-2">HACS Monitor</span>
      </Button>
    );
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getHealthBadgeVariant = (status: string) => {
    switch (status) {
      case 'healthy': return 'default';
      case 'degraded': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-y-auto">
      <Card className="bg-white/95 backdrop-blur-sm border shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-soul-purple" />
              HACS System Monitor
            </CardTitle>
            <Button onClick={onToggle} variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* System Health Overview */}
          {systemHealth && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">System Health</span>
                <Badge variant={getHealthBadgeVariant(systemHealth.overall)}>
                  {systemHealth.overall}
                </Badge>
              </div>
              
              <div className="space-y-2">
                {systemHealth.modules.map((module: any) => (
                  <div key={module.moduleId} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{module.moduleId}</span>
                    <div className="flex items-center gap-2">
                      <Activity className={`h-3 w-3 ${getHealthColor(module.status)}`} />
                      <span className={`text-xs ${getHealthColor(module.status)}`}>
                        {module.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {systemHealth.recommendations && systemHealth.recommendations.length > 0 && (
                <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-yellow-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Recommendations</span>
                  </div>
                  <ul className="mt-1 text-xs text-yellow-700 space-y-1">
                    {systemHealth.recommendations.map((rec: string, idx: number) => (
                      <li key={idx}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Current Intent */}
          {currentIntent && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-soul-gold" />
                <span className="font-medium">Active Intent</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <div className="font-medium text-gray-800 truncate">
                  {currentIntent.primary}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Priority: {currentIntent.priority} | Domain: {currentIntent.domain}
                </div>
                {currentIntent.coherenceScore && (
                  <div className="text-xs text-gray-500">
                    Coherence: {Math.round(currentIntent.coherenceScore * 100)}%
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Harmony Status */}
          {harmonyStatus && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-soul-purple" />
                <span className="font-medium">Harmony Engine</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <div className="flex justify-between items-center">
                  <span>Active Harmonics:</span>
                  <span className="font-medium">{harmonyStatus.activeHarmonics}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Conflicts:</span>
                  <span className={`font-medium ${harmonyStatus.conflicts.length > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {harmonyStatus.conflicts.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Resolution Score:</span>
                  <span className="font-medium">
                    {Math.round(harmonyStatus.resolutionScore * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* HACS Architecture Status */}
          <div className="space-y-2">
            <span className="font-medium">HACS Components</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>NIK</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>CPSR</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>TWS</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>HFME</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>DPEM</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>CNR</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>BPSC</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>ACS</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>PIE</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>VFP</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>TMG</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
