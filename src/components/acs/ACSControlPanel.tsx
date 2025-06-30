
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Zap, 
  Shield, 
  Settings,
  TestTube,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useProductionACS } from '@/hooks/use-production-acs';

interface ACSControlPanelProps {
  sessionId: string;
  compact?: boolean;
}

const ACSControlPanel: React.FC<ACSControlPanelProps> = ({ 
  sessionId, 
  compact = false 
}) => {
  const { 
    status, 
    toggleACS, 
    updateConfig, 
    runIntegrationTests 
  } = useProductionACS();

  const getStateColor = (state: string) => {
    switch (state) {
      case 'NORMAL': return 'bg-green-100 text-green-800';
      case 'FRUSTRATION_DETECTED': return 'bg-red-100 text-red-800';
      case 'CLARIFICATION_NEEDED': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH_ENGAGEMENT': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'NORMAL': return <CheckCircle className="w-4 h-4" />;
      case 'FRUSTRATION_DETECTED': return <AlertTriangle className="w-4 h-4" />;
      case 'CLARIFICATION_NEEDED': return <Brain className="w-4 h-4" />;
      case 'HIGH_ENGAGEMENT': return <Zap className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
        <Badge variant="outline" className={getStateColor(status.currentState)}>
          {getStateIcon(status.currentState)}
          <span className="ml-1">{status.currentState.replace('_', ' ')}</span>
        </Badge>
        <Switch
          checked={status.isEnabled}
          onCheckedChange={toggleACS}
          className="scale-75"
        />
        <span className="text-xs text-gray-600">
          {status.interventionsCount} adaptations
        </span>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-blue-600" />
          <span>Adaptive Context System</span>
          <Badge variant={status.isEnabled ? "default" : "secondary"}>
            {status.isEnabled ? "Active" : "Disabled"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Current State */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current State</span>
            <Badge className={getStateColor(status.currentState)}>
              {getStateIcon(status.currentState)}
              <span className="ml-1">{status.currentState.replace('_', ' ')}</span>
            </Badge>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-gray-600">Interventions</div>
            <div className="text-2xl font-bold text-blue-600">
              {status.interventionsCount}
            </div>
            {status.lastInterventionTime && (
              <div className="text-xs text-gray-500">
                Last: {new Date(status.lastInterventionTime).toLocaleTimeString()}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-600">Fallbacks Used</div>
            <div className="text-2xl font-bold text-orange-600">
              {status.fallbacksUsed}
            </div>
            <div className="text-xs text-gray-500">
              {status.fallbacksUsed === 0 ? "All systems operational" : "Some issues detected"}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Enable ACS</span>
            <Switch
              checked={status.isEnabled}
              onCheckedChange={toggleACS}
            />
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium">Frustration Sensitivity</span>
            <Slider
              defaultValue={[30]}
              max={100}
              step={10}
              onValueChange={(value) => updateConfig({ 
                frustrationThreshold: value[0] / 100 
              })}
              className="w-full"
            />
            <div className="text-xs text-gray-500">
              Lower = more sensitive to user frustration
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium">Personality Adaptation</span>
            <Switch
              defaultChecked={true}
              onCheckedChange={(checked) => updateConfig({ 
                personalityScaling: checked 
              })}
            />
            <div className="text-xs text-gray-500">
              Adapt responses to your personality profile
            </div>
          </div>
        </div>

        {/* Testing */}
        <div className="pt-4 border-t">
          <Button
            onClick={runIntegrationTests}
            variant="outline"
            size="sm"
            className="w-full"
            disabled={!status.isEnabled}
          >
            <TestTube className="w-4 h-4 mr-2" />
            Run System Tests
          </Button>
        </div>

        {/* System Health */}
        <div className="space-y-2">
          <div className="text-sm font-medium">System Health</div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Reliability</span>
              <span>{Math.max(0, 100 - (status.fallbacksUsed * 10))}%</span>
            </div>
            <Progress 
              value={Math.max(0, 100 - (status.fallbacksUsed * 10))} 
              className="h-2"
            />
          </div>
          
          <div className="text-xs text-gray-500 mt-2">
            {status.fallbacksUsed === 0 
              ? "✅ All systems operating normally" 
              : `⚠️ ${status.fallbacksUsed} fallback${status.fallbacksUsed > 1 ? 's' : ''} used`
            }
          </div>
        </div>

      </CardContent>
    </Card>
  );
};

export default ACSControlPanel;
