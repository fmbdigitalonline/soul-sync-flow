
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { UnifiedBlueprintService } from '@/services/unified-blueprint-service';
import { LayeredBlueprint } from '@/types/personality-modules';

interface BlueprintStatusIndicatorProps {
  blueprint: LayeredBlueprint | null;
  showDetails?: boolean;
  className?: string;
}

export const BlueprintStatusIndicator: React.FC<BlueprintStatusIndicatorProps> = ({
  blueprint,
  showDetails = false,
  className = ""
}) => {
  const validation = UnifiedBlueprintService.validateBlueprint(blueprint);
  const summary = blueprint ? UnifiedBlueprintService.extractBlueprintSummary(blueprint) : 'No blueprint data';

  const getStatusColor = () => {
    if (validation.completionPercentage >= 80) return 'text-green-600';
    if (validation.completionPercentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = () => {
    if (validation.completionPercentage >= 80) return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (validation.completionPercentage >= 50) return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  if (!showDetails) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {getStatusIcon()}
        <Badge variant={validation.isComplete ? "default" : "secondary"}>
          {validation.completionPercentage}% Complete
        </Badge>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">Blueprint Status</h3>
          </div>
          <Badge variant={validation.isComplete ? "default" : "secondary"}>
            {validation.completionPercentage}% Complete
          </Badge>
        </div>
        
        <Progress value={validation.completionPercentage} className="mb-3" />
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {validation.isComplete ? 
              "Your blueprint is complete and ready for AI agents" : 
              `Missing ${validation.missingFields.length} key components`
            }
          </p>
          
          {validation.missingFields.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Missing: {validation.missingFields.join(', ')}
            </div>
          )}
          
          <div className="text-xs font-mono bg-muted p-2 rounded">
            {summary}
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`flex items-center gap-1 ${validation.availableData.hasPersonalInfo ? 'text-green-600' : 'text-muted-foreground'}`}>
              {validation.availableData.hasPersonalInfo ? '✓' : '○'} Personal Info
            </div>
            <div className={`flex items-center gap-1 ${validation.availableData.hasCognitive ? 'text-green-600' : 'text-muted-foreground'}`}>
              {validation.availableData.hasCognitive ? '✓' : '○'} MBTI
            </div>
            <div className={`flex items-center gap-1 ${validation.availableData.hasEnergy ? 'text-green-600' : 'text-muted-foreground'}`}>
              {validation.availableData.hasEnergy ? '✓' : '○'} Human Design
            </div>
            <div className={`flex items-center gap-1 ${validation.availableData.hasValues ? 'text-green-600' : 'text-muted-foreground'}`}>
              {validation.availableData.hasValues ? '✓' : '○'} Life Path
            </div>
            <div className={`flex items-center gap-1 ${validation.availableData.hasArchetype ? 'text-green-600' : 'text-muted-foreground'}`}>
              {validation.availableData.hasArchetype ? '✓' : '○'} Astrology
            </div>
            <div className={`flex items-center gap-1 ${validation.availableData.hasGenerational ? 'text-green-600' : 'text-muted-foreground'}`}>
              {validation.availableData.hasGenerational ? '✓' : '○'} Chinese Zodiac
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
