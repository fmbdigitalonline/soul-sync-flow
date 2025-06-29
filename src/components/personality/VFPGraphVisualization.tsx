
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ThumbsUp, ThumbsDown, Zap, Brain } from 'lucide-react';
import { FusionVector, ConflictContext } from '@/services/personality-fusion-service';

interface VFPGraphVisualizationProps {
  fusionVector: FusionVector;
  conflicts?: ConflictContext;
  onFeedback?: (isPositive: boolean) => void;
  onResolveConflict?: (conflictId: number) => void;
}

export const VFPGraphVisualization: React.FC<VFPGraphVisualizationProps> = ({
  fusionVector,
  conflicts,
  onFeedback,
  onResolveConflict
}) => {
  const renderVectorPreview = (vector: number[], label: string, color: string) => {
    const preview = vector.slice(0, 8); // Show first 8 dimensions
    const maxVal = Math.max(...preview.map(Math.abs));
    
    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full bg-${color}-500`} />
          <span className="text-sm font-medium">{label}</span>
          <Badge variant="outline">{vector.length}D</Badge>
        </div>
        <div className="flex space-x-1">
          {preview.map((val, i) => (
            <div
              key={i}
              className={`w-4 h-8 bg-${color}-200 rounded-sm relative overflow-hidden`}
            >
              <div
                className={`absolute bottom-0 w-full bg-${color}-500 transition-all`}
                style={{
                  height: `${Math.abs(val) / maxVal * 100}%`,
                  opacity: val >= 0 ? 1 : 0.5
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderConflictAlert = () => {
    if (!conflicts || conflicts.conflictingDimensions.length === 0) return null;

    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-amber-800">
            <AlertTriangle className="w-5 h-5" />
            <span>Framework Conflicts Detected</span>
            <Badge variant="secondary">{conflicts.conflictingDimensions.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-amber-700">
            Some personality frameworks show conflicting signals. This helps us understand your unique complexity.
          </p>
          
          {conflicts.clarifyingQuestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-amber-800">Clarifying Questions:</h4>
              {conflicts.clarifyingQuestions.slice(0, 3).map((question, i) => (
                <div key={i} className="p-3 bg-white rounded-lg border border-amber-200">
                  <p className="text-sm">{question}</p>
                  {onResolveConflict && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => onResolveConflict(i)}
                    >
                      Answer This
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderFusionMetrics = () => {
    const fusionMagnitude = Math.sqrt(
      fusionVector.fusedVector.reduce((sum, val) => sum + val * val, 0)
    );
    
    const frameworkContributions = {
      mbti: fusionVector.mbtiVector.reduce((sum, val) => sum + Math.abs(val), 0),
      humanDesign: fusionVector.hdVector.reduce((sum, val) => sum + Math.abs(val), 0),
      astrology: fusionVector.astroVector.reduce((sum, val) => sum + Math.abs(val), 0)
    };

    const total = Object.values(frameworkContributions).reduce((sum, val) => sum + val, 0);
    const percentages = Object.fromEntries(
      Object.entries(frameworkContributions).map(([key, val]) => [key, (val / total * 100).toFixed(1)])
    );

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <span>Fusion Metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Vector Magnitude</p>
              <p className="text-2xl font-bold">{fusionMagnitude.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Version</p>
              <p className="text-2xl font-bold">v{fusionVector.version}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Framework Contributions</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">MBTI Cognition</span>
                <Badge variant="outline">{percentages.mbti}%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Human Design Energy</span>
                <Badge variant="outline">{percentages.humanDesign}%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Astrology Patterns</span>
                <Badge variant="outline">{percentages.astrology}%</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Conflict Alert */}
      {renderConflictAlert()}

      {/* Vector Visualizations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Personality Vector Components</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {renderVectorPreview(fusionVector.mbtiVector, 'MBTI', 'blue')}
            {renderVectorPreview(fusionVector.hdVector, 'Human Design', 'green')}
            {renderVectorPreview(fusionVector.astroVector, 'Astrology', 'purple')}
            {renderVectorPreview(fusionVector.fusedVector, 'Unified Fusion', 'orange')}
          </div>
        </CardContent>
      </Card>

      {/* Fusion Metrics */}
      {renderFusionMetrics()}

      {/* Feedback Section */}
      {onFeedback && (
        <Card>
          <CardHeader>
            <CardTitle>Help Improve Your Fusion</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Your feedback helps the system learn your unique patterns and improve future fusions.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFeedback(true)}
                className="flex items-center space-x-2"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>This feels accurate</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFeedback(false)}
                className="flex items-center space-x-2"
              >
                <ThumbsDown className="w-4 h-4" />
                <span>Something feels off</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technical Details */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm">Technical Details</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <p>Fusion ID: {fusionVector.id}</p>
          <p>Created: {new Date(fusionVector.createdAt).toLocaleString()}</p>
          <p>Encoder Checksums: {Object.keys(fusionVector.encoderChecksums).join(', ')}</p>
          <p>Calibration: {fusionVector.calibrationParams.normalization || 'z-score'}</p>
        </CardContent>
      </Card>
    </div>
  );
};
