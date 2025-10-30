import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AssistanceButton } from '@/components/ui/assistance-button';
import { 
  CheckCircle2, 
  Clock, 
  Wrench, 
  Target,
  ChevronDown,
  ChevronUp,
  Copy,
  Lightbulb,
  MessageCircle
} from 'lucide-react';
import { AssistanceResponse } from '@/services/interactive-assistance-service';

interface HelpPanelProps {
  response: AssistanceResponse;
  onCopyStep?: (step: string) => void;
  onAssistanceRequest?: (
    type: 'stuck' | 'need_details' | 'how_to' | 'examples',
    customMessage?: string
  ) => void;
  compact?: boolean;
}

export const HelpPanel: React.FC<HelpPanelProps> = ({
  response,
  onCopyStep,
  onAssistanceRequest,
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
      case 'concrete_steps': return 'bg-green-100 text-green-700 border-green-200';
      case 'examples': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'tools_needed': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'time_breakdown': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const HelpTypeIcon = getHelpTypeIcon(response.helpType);
  const totalSteps = response.actionableSteps.length;
  const progressPercentage = totalSteps > 0
    ? Math.round((completedSteps.size / totalSteps) * 100)
    : 0;

  return (
    <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <HelpTypeIcon className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">Interactive Help</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="outline" className={`text-xs ${getHelpTypeColor(response.helpType)}`}>
                {response.helpType.replace('_', ' ')}
              </Badge>
              {response.isFollowUp && (
                <Badge variant="outline" className="text-xs bg-yellow-50 border-yellow-200 text-yellow-700">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Follow-up help
                  {typeof response.followUpDepth === 'number' && response.followUpDepth > 0 && (
                    <span className="ml-1">#{response.followUpDepth}</span>
                  )}
                </Badge>
              )}
            </div>
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
        <p className="text-sm text-gray-700 leading-relaxed">
          {response.content}
        </p>
      </div>

      {/* Progress Bar */}
      {completedSteps.size > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">Your Progress</span>
            <span className="font-medium text-gray-800">{completedSteps.size}/{response.actionableSteps.length} steps</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Actionable Steps */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm text-gray-800">Step-by-Step Actions</h4>
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
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
              >
                <button
                  onClick={() => toggleStepComplete(index)}
                  className="mt-0.5 flex-shrink-0 transition-colors"
                >
                  <CheckCircle2 className={`h-5 w-5 ${
                    completedSteps.has(index) 
                      ? 'text-green-600' 
                      : 'text-gray-300 hover:text-blue-500'
                  }`} />
                </button>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-relaxed ${
                    completedSteps.has(index) 
                      ? 'line-through text-gray-500' 
                      : 'text-gray-700'
                  }`}>
                    <span className="font-medium text-blue-600 mr-2">
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
            <h4 className="font-medium text-sm text-gray-800 flex items-center gap-2">
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
                <Badge key={index} variant="outline" className="text-xs">
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
            <h4 className="font-medium text-sm text-gray-800 flex items-center gap-2">
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
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{criteria}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Assistance Buttons - Request more specific help */}
      {onAssistanceRequest && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-2">Need more specific help?</p>
          <div className="flex flex-wrap gap-1">
            <AssistanceButton
              type="stuck"
              onRequest={(type, msg) => onAssistanceRequest(type, msg)}
              compact={true}
            />
            <AssistanceButton
              type="need_details"
              onRequest={(type, msg) => onAssistanceRequest(type, msg)}
              compact={true}
            />
            <AssistanceButton
              type="how_to"
              onRequest={(type, msg) => onAssistanceRequest(type, msg)}
              compact={true}
            />
            <AssistanceButton
              type="examples"
              onRequest={(type, msg) => onAssistanceRequest(type, msg)}
              compact={true}
            />
          </div>
        </div>
      )}
    </Card>
  );
};