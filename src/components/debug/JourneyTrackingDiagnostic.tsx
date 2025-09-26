/**
 * Journey Tracking Diagnostic Component
 * 
 * SoulSync Engineering Protocol Implementation:
 * ✅ Pillar I: Preserve Core Intelligence - Non-disruptive diagnostic overlay
 * ✅ Pillar II: Ground Truth Only - Real-time session state display
 * ✅ Pillar III: Intentional Craft - Mobile-responsive diagnostic interface
 * 
 * Implements Principles:
 * #4: Do Not Alter Core UI Components - Standalone diagnostic component
 * #7: Build Transparently - Complete session state visibility
 * #9: End-to-End Validation - Provides concrete evidence of journey tracking
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useJourneyTracking as useOnboardingJourneyTracking } from '@/hooks/use-onboarding-journey-tracking';
import { ChevronDown, ChevronUp, Clock, CheckCircle, XCircle, AlertTriangle, BarChart3 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const JourneyTrackingDiagnostic: React.FC = () => {
  const { currentSession, isTracking, currentStepId, getSessionSummary } = useOnboardingJourneyTracking();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showStepDetails, setShowStepDetails] = useState(false);

  if (!isTracking && !currentSession) {
    return (
      <Card className="fixed bottom-4 right-4 w-80 bg-background/95 backdrop-blur-sm border shadow-lg z-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Journey Tracking</CardTitle>
          <CardDescription className="text-xs">No active session</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-gray-400 rounded-full" />
            Inactive
          </div>
        </CardContent>
      </Card>
    );
  }

  const summary = getSessionSummary();
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'funnel': return 'bg-blue-500';
      case 'auth': return 'bg-green-500';
      case 'onboarding': return 'bg-purple-500';
      case 'growth_onboarding': return 'bg-orange-500';
      case 'steward_introduction': return 'bg-teal-500';
      case 'completed': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  const getStepStatusIcon = (step: any) => {
    if (step.completed_at) return <CheckCircle className="h-3 w-3 text-green-500" />;
    if (step.abandoned_at) return <XCircle className="h-3 w-3 text-red-500" />;
    if (step.validation_errors?.length > 0) return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
    return <Clock className="h-3 w-3 text-blue-500" />;
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 bg-background/95 backdrop-blur-sm border shadow-lg z-50">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-2 cursor-pointer hover:bg-accent/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getPhaseColor(currentSession?.current_phase || 'inactive')}`} />
                  Journey Tracking
                </CardTitle>
                <CardDescription className="text-xs">
                  {currentSession?.current_phase.replace('_', ' ').toUpperCase()} • {summary?.totalSteps || 0} steps
                </CardDescription>
              </div>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-3">
            {/* Session Summary */}
            {summary && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Time:</span>
                    <span className="font-mono">{formatTime(summary.totalTimeSeconds)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Completed:</span>
                    <span className="text-green-600 font-medium">{summary.completedSteps}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Steps:</span>
                    <span className="font-medium">{summary.totalSteps}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Abandoned:</span>
                    <span className="text-red-600 font-medium">{summary.abandonedSteps}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Current Step */}
            {currentStepId && (
              <div className="border-t pt-2">
                <div className="text-xs text-muted-foreground mb-1">Current Step:</div>
                <Badge variant="outline" className="text-xs">
                  {currentStepId.split('_').slice(0, -1).join(' ')}
                </Badge>
              </div>
            )}

            {/* Session Details */}
            {currentSession && (
              <div className="border-t pt-2 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Session ID:</span>
                  <span className="font-mono text-[10px]">
                    {currentSession.session_id.slice(-8)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Started:</span>
                  <span>{formatDistanceToNow(new Date(currentSession.started_at))} ago</span>
                </div>
              </div>
            )}

            {/* Step Details Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowStepDetails(!showStepDetails)}
              className="w-full h-6 text-xs"
            >
              <BarChart3 className="h-3 w-3 mr-1" />
              {showStepDetails ? 'Hide' : 'Show'} Step Details
            </Button>

            {/* Step Details */}
            {showStepDetails && currentSession && (
              <div className="border-t pt-2 max-h-40 overflow-y-auto">
                <div className="space-y-2">
                  {currentSession.steps.map((step, index) => (
                    <div key={step.step_id} className="flex items-center gap-2 text-xs">
                      {getStepStatusIcon(step)}
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">
                          {step.step_name}
                        </div>
                        {step.time_spent_seconds !== undefined && (
                          <div className="text-muted-foreground">
                            {formatTime(step.time_spent_seconds)}
                          </div>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-[10px] px-1">
                        {step.step_type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Funnel Data Indicator */}
            {currentSession?.funnel_data && (
              <div className="border-t pt-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-muted-foreground">Funnel data linked</span>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};