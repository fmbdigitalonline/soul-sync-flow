
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
  CheckCircle,
  Rocket
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
    runIntegrationTests,
    enableFullDeployment
  } = useProductionACS();

  const getStateColor = (state: string) => {
    switch (state) {
      case 'NORMAL': return 'bg-success/10 text-success';
      case 'FRUSTRATION_DETECTED': return 'bg-destructive/10 text-destructive';
      case 'CLARIFICATION_NEEDED': return 'bg-warning/10 text-warning';
      case 'HIGH_ENGAGEMENT': return 'bg-secondary/10 text-secondary';
      default: return 'bg-muted text-muted-foreground';
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
      <div className="flex items-center space-x-2 p-2 bg-muted/50 rounded-lg">
        <Badge variant="outline" className={getStateColor(status.currentState)}>
          {getStateIcon(status.currentState)}
          <span className="ml-1">{status.currentState.replace('_', ' ')}</span>
        </Badge>
        <Switch
          checked={status.isEnabled}
          onCheckedChange={toggleACS}
          className="scale-75"
        />
        <Badge variant="outline" className="text-xs">
          {status.trafficPercentage}% Traffic
        </Badge>
        <span className="text-xs text-muted-foreground font-inter">
          {status.interventionsCount} adaptations
        </span>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 font-cormorant">
          <Brain className="w-5 h-5 text-primary" />
          <span>Adaptive Context System</span>
          <Badge variant={status.isEnabled ? "default" : "secondary"}>
            {status.isEnabled ? "Production" : "Disabled"}
          </Badge>
          {status.deploymentMode === 'full' && (
            <Badge variant="outline" className="bg-success/10 text-success font-inter">
              <Rocket className="w-3 h-3 mr-1" />
              100% Traffic
            </Badge>
          )}
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
            <div className="text-sm text-muted-foreground font-inter">Interventions</div>
            <div className="text-2xl font-bold text-primary font-cormorant">
              {status.interventionsCount}
            </div>
            {status.lastInterventionTime && (
              <div className="text-xs text-muted-foreground font-inter">
                Last: {new Date(status.lastInterventionTime).toLocaleTimeString()}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground font-inter">Fallbacks Used</div>
            <div className="text-2xl font-bold text-warning font-cormorant">
              {status.fallbacksUsed}
            </div>
            <div className="text-xs text-muted-foreground font-inter">
              {status.fallbacksUsed === 0 ? "All systems operational" : "Some issues detected"}
            </div>
          </div>
        </div>

        {/* Deployment Status */}
        <div className="p-3 bg-secondary/10 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-secondary font-cormorant">Production Deployment</div>
              <div className="text-sm text-secondary/80 font-inter">
                {status.deploymentMode === 'full' 
                  ? `Serving ${status.trafficPercentage}% of all users`
                  : 'Not deployed'
                }
              </div>
            </div>
            {status.deploymentMode !== 'full' && (
              <Button 
                size="sm" 
                onClick={enableFullDeployment}
                className="bg-success hover:bg-success/80 font-cormorant"
              >
                <Rocket className="w-4 h-4 mr-1" />
                Deploy Now
              </Button>
            )}
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
            <div className="text-xs text-muted-foreground font-inter">
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
            <div className="text-xs text-muted-foreground font-inter">
              Adapt responses to user personality profile
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
          >
            <TestTube className="w-4 h-4 mr-2" />
            Run System Tests & Deploy
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
          
          <div className="text-xs text-muted-foreground mt-2 font-inter">
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
