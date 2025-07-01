
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Brain, Heart, Target, Lightbulb } from 'lucide-react';
import { RootCauseCandidate, DepthAnalysis } from '@/services/growth-intelligence-fusion-service';

interface RootCauseConfirmationProps {
  candidates: RootCauseCandidate[];
  depthAnalysis: DepthAnalysis;
  onConfirm: (confirmedRootCause: RootCauseCandidate) => void;
  onReject: (rejectedId: string) => void;
  onContinueDrilling: () => void;
}

export const RootCauseConfirmation: React.FC<RootCauseConfirmationProps> = ({
  candidates,
  depthAnalysis,
  onConfirm,
  onReject,
  onContinueDrilling
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getDepthIcon = (type: string) => {
    switch (type) {
      case 'emotional': return <Heart className="w-4 h-4" />;
      case 'pattern': return <Brain className="w-4 h-4" />;
      case 'belief': return <Lightbulb className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const formatPercentage = (value: number) => Math.round(value * 100);

  if (!depthAnalysis.readyForProgram) {
    return (
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <span>Depth Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getDepthIcon('emotional')}
                  <span className="text-sm">Emotional Depth</span>
                </div>
                <span className="text-sm font-medium">{formatPercentage(depthAnalysis.emotionalDepth)}%</span>
              </div>
              <Progress value={depthAnalysis.emotionalDepth * 100} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getDepthIcon('pattern')}
                  <span className="text-sm">Pattern Recognition</span>
                </div>
                <span className="text-sm font-medium">{formatPercentage(depthAnalysis.patternDepth)}%</span>
              </div>
              <Progress value={depthAnalysis.patternDepth * 100} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getDepthIcon('belief')}
                  <span className="text-sm">Belief Mapping</span>
                </div>
                <span className="text-sm font-medium">{formatPercentage(depthAnalysis.beliefDepth)}%</span>
              </div>
              <Progress value={depthAnalysis.beliefDepth * 100} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getDepthIcon('overall')}
                  <span className="text-sm">Overall Readiness</span>
                </div>
                <span className="text-sm font-medium">{formatPercentage(depthAnalysis.overallDepth)}%</span>
              </div>
              <Progress value={depthAnalysis.overallDepth * 100} className="h-2" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-medium mb-2">Next Recommended Action:</h4>
            <p className="text-sm text-gray-600">{depthAnalysis.nextRecommendedAction}</p>
          </div>

          <Button 
            onClick={onContinueDrilling}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Continue Deeper Exploration
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Depth Analysis Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span>Ready for Root Cause Identification</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{formatPercentage(depthAnalysis.emotionalDepth)}%</div>
              <div className="text-xs text-gray-600">Emotional</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{formatPercentage(depthAnalysis.patternDepth)}%</div>
              <div className="text-xs text-gray-600">Patterns</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{formatPercentage(depthAnalysis.beliefDepth)}%</div>
              <div className="text-xs text-gray-600">Beliefs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{formatPercentage(depthAnalysis.overallDepth)}%</div>
              <div className="text-xs text-gray-600">Overall</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Root Cause Candidates */}
      <Card>
        <CardHeader>
          <CardTitle>Identified Root Cause Candidates</CardTitle>
          <p className="text-sm text-gray-600">
            Based on our deep conversation analysis, here are the potential root causes. Please confirm which resonates most strongly with you:
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedCandidate === candidate.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedCandidate(candidate.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{candidate.description}</h4>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={getConfidenceColor(candidate.confidence)}>
                      {formatPercentage(candidate.confidence)}% Confidence
                    </Badge>
                    <Badge variant="outline">
                      💚 {formatPercentage(candidate.emotionalResonance)}% Emotional
                    </Badge>
                    <Badge variant="outline">
                      🧠 {formatPercentage(candidate.patternStrength)}% Pattern
                    </Badge>
                  </div>
                </div>
                <div className="ml-4">
                  {selectedCandidate === candidate.id ? (
                    <CheckCircle className="w-6 h-6 text-blue-500" />
                  ) : (
                    <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                  )}
                </div>
              </div>

              {candidate.supportingEvidence.length > 0 && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <h5 className="text-xs font-medium text-gray-700 mb-2">Supporting Evidence:</h5>
                  <ul className="space-y-1">
                    {candidate.supportingEvidence.slice(0, 2).map((evidence, index) => (
                      <li key={index} className="text-xs text-gray-600">
                        "...{evidence.substring(0, 100)}..."
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={onContinueDrilling}
            >
              Need More Exploration
            </Button>
            
            <div className="space-x-2">
              {selectedCandidate && (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedCandidate) {
                      onReject(selectedCandidate);
                      setSelectedCandidate(null);
                    }
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  This Doesn't Resonate
                </Button>
              )}
              
              <Button
                onClick={() => {
                  if (selectedCandidate) {
                    const candidate = candidates.find(c => c.id === selectedCandidate);
                    if (candidate) {
                      onConfirm(candidate);
                    }
                  }
                }}
                disabled={!selectedCandidate}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Yes, This Is The Core Issue
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
