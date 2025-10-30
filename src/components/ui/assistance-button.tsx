import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  HelpCircle,
  MessageCircle,
  Lightbulb,
  BookOpen,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Loader2
} from 'lucide-react';

export interface AssistanceButtonProps {
  type: 'stuck' | 'need_details' | 'how_to' | 'examples';
  onRequest: (type: 'stuck' | 'need_details' | 'how_to' | 'examples', message?: string) => void;
  isLoading?: boolean;
  hasResponse?: boolean;
  compact?: boolean;
}

const assistanceConfig = {
  stuck: {
    icon: HelpCircle,
    label: "I'm stuck",
    iconColor: 'text-orange-500',
    description: 'Get step-by-step help to move forward'
  },
  need_details: {
    icon: MessageCircle,
    label: 'Need more details',
    iconColor: 'text-blue-500',
    description: 'Get specific instructions and examples'
  },
  how_to: {
    icon: BookOpen,
    label: 'How do I...?',
    iconColor: 'text-purple-500',
    description: 'Learn the exact process and tools needed'
  },
  examples: {
    icon: Lightbulb,
    label: 'Show examples',
    iconColor: 'text-green-500',
    description: 'See concrete examples and templates'
  }
};

export const AssistanceButton: React.FC<AssistanceButtonProps> = ({
  type,
  onRequest,
  isLoading = false,
  hasResponse = false,
  compact = false
}) => {
  const [expanded, setExpanded] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  
  const config = assistanceConfig[type];
  const Icon = config.icon;

  const handleRequest = () => {
    if (isLoading) {
      return;
    }

    onRequest(type, customMessage || undefined);
    setCustomMessage('');
    setExpanded(false);
  };

  const handleToggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  if (compact) {
    return (
      <Badge
        variant="outline"
        onClick={handleRequest}
        className={`text-xs cursor-pointer hover:bg-gray-50 transition-colors inline-flex items-center gap-1 px-2 py-1 h-7 ${
          isLoading ? 'pointer-events-none opacity-70' : ''
        }`}
      >
        <Icon className={`h-3 w-3 ${config.iconColor}`} />
        <span className="text-foreground">{config.label}</span>
        {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
        {hasResponse && <CheckCircle2 className="h-3 w-3 text-green-600" />}
      </Badge>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          onClick={handleRequest}
          disabled={isLoading}
          variant="outline"
          className="text-sm px-3 py-2 h-8 flex-1 hover:bg-gray-50"
        >
          <Icon className={`h-4 w-4 mr-2 ${config.iconColor}`} />
          {config.label}
          {isLoading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
          {hasResponse && <CheckCircle2 className="h-4 w-4 ml-2 text-green-600" />}
        </Button>
        
        <Button
          onClick={handleToggleExpanded}
          variant="outline"
          size="sm"
          className="px-2 py-2 h-8"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      {expanded && (
        <div className="p-3 bg-gray-50 rounded-lg border space-y-3">
          <p className="text-xs text-gray-600">{config.description}</p>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">
              Tell me more about what you need help with:
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Optional: Describe what specifically you're stuck on..."
              className="w-full text-xs p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => setExpanded(false)}
              variant="outline"
              size="sm"
              className="text-xs px-3 py-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRequest}
              disabled={isLoading}
              variant="default"
              className="text-xs px-3 py-1"
            >
              Get Help
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};