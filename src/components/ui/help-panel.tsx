import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Clock, 
  Wrench, 
  Target,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Lightbulb
} from 'lucide-react';
import { AssistanceResponse } from '@/services/interactive-assistance-service';

interface HelpPanelProps {
  response: AssistanceResponse;
  onActionClick?: (action: string) => void;
  onCopyStep?: (step: string) => void;
  compact?: boolean;
}

export const HelpPanel: React.FC<HelpPanelProps> = ({
  response,
  onActionClick,
  onCopyStep,
  compact = false
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['steps']));
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const toggleStepComplete = (stepIndex: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepIndex)) {
      newCompleted.delete(stepIndex);
    } else {
      newCompleted.add(stepIndex);
    }
    setCompletedSteps(newCompleted);
  };

  const copyStep = (step: string) => {
    navigator.clipboard.writeText(step);
    onCopyStep?.(step);
  };

  const getHelpTypeIcon = (helpType: string) => {
    switch (helpType) {
      case 'concrete_steps': return CheckCircle2;
      case 'examples': return Lightbulb;
      case 'tools_needed': return Wrench;
      case 'time_breakdown': return Clock;
      default: return Target;
    }
  };

  const getHelpTypeColor = (helpType: string) => {
    switch (helpType) {
      case 'concrete_steps': return 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'examples': return 'bg-blue-100 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'tools_needed': return 'bg-purple-100 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'time_breakdown': return 'bg-orange-100 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const HelpTypeIcon = getHelpTypeIcon(response.helpType);
  const progressPercentage = Math.round((completedSteps.size / response.actionableSteps.length) * 100);

  return (
    <Card className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <HelpTypeIcon className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-cormorant font-semibold text-foreground text-sm">Interactive Help</h3>
            <Badge variant="outline" className={`text-xs ${getHelpTypeColor(response.helpType)}`}>
              {response.helpType.replace('_', ' ')}
            </Badge>
          </div>
        </div>
        
        {response.timeEstimate && (
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {response.timeEstimate}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-sm font-inter text-foreground/80 leading-relaxed">
          {response.content}
        </p>
      </div>

      {/* Progress Bar */}
      {completedSteps.size > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-inter text-muted-foreground">Your Progress</span>
            <span className="font-cormorant font-medium text-foreground">{completedSteps.size}/{response.actionableSteps.length} steps</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Actionable Steps */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-cormorant font-medium text-sm text-foreground">Step-by-Step Actions</h4>
          <Button
            onClick={() => toggleSection('steps')}
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6"
          >
            {expandedSections.has('steps') ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </Button>
        </div>

        {expandedSections.has('steps') && (
          <div className="space-y-2">
            {response.actionableSteps.map((step, index) => (
              <div 
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 ${
                  completedSteps.has(index) 
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' 
                    : 'bg-card border-border hover:border-primary/50'
                }`}
              >
                <button
                  onClick={() => toggleStepComplete(index)}
                  className="mt-0.5 flex-shrink-0 transition-colors"
                >
                  <CheckCircle2 className={`h-5 w-5 ${
                    completedSteps.has(index) 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : 'text-muted-foreground hover:text-primary'
                  }`} />
                </button>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-inter leading-relaxed ${
                    completedSteps.has(index) 
                      ? 'line-through text-muted-foreground' 
                      : 'text-foreground/80'
                  }`}>
                    <span className="font-cormorant font-medium text-primary mr-2">
                      {index + 1}.
                    </span>
                    {step}
                  </p>
                </div>
                
                <Button
                  onClick={() => copyStep(step)}
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tools Needed */}
      {response.toolsNeeded.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-cormorant font-medium text-sm text-foreground flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Tools You'll Need
            </h4>
            <Button
              onClick={() => toggleSection('tools')}
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6"
            >
              {expandedSections.has('tools') ? 
                <ChevronUp className="h-4 w-4" /> : 
                <ChevronDown className="h-4 w-4" />
              }
            </Button>
          </div>

          {expandedSections.has('tools') && (
            <div className="flex flex-wrap gap-2">
              {response.toolsNeeded.map((tool, index) => (
                <Badge key={index} variant="outline" className="text-xs font-inter">
                  {tool}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Success Criteria */}
      {response.successCriteria.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-cormorant font-medium text-sm text-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              How You'll Know You're Done
            </h4>
            <Button
              onClick={() => toggleSection('success')}
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6"
            >
              {expandedSections.has('success') ? 
                <ChevronUp className="h-4 w-4" /> : 
                <ChevronDown className="h-4 w-4" />
              }
            </Button>
          </div>

          {expandedSections.has('success') && (
            <div className="space-y-1">
              {response.successCriteria.map((criteria, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-inter text-foreground/80">{criteria}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      {onActionClick && (
        <div className="mt-4 pt-3 border-t border-border flex gap-2">
          <Button
            onClick={() => onActionClick('need_more_help')}
            variant="outline"
            size="sm"
            className="text-xs font-inter px-3 py-1"
          >
            Still need help?
          </Button>
          <Button
            onClick={() => onActionClick('working_well')}
            variant="outline"
            size="sm"
            className="text-xs font-inter px-3 py-1"
          >
            This is working! ✓
          </Button>
        </div>
      )}
    </Card>
  );
};