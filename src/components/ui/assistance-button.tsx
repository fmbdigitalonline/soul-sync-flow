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
  Clock,
  CheckCircle2
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
    color: 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700',
    description: 'Get step-by-step help to move forward'
  },
  need_details: {
    icon: MessageCircle,
    label: 'Need more details',
    color: 'bg-primary hover:bg-primary/90',
    description: 'Get specific instructions and examples'
  },
  how_to: {
    icon: BookOpen,
    label: 'How do I...?',
    color: 'bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700',
    description: 'Learn the exact process and tools needed'
  },
  examples: {
    icon: Lightbulb,
    label: 'Show examples',
    color: 'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700',
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
      <Button
        onClick={handleRequest}
        disabled={isLoading}
        size="sm"
        className={`${config.color} text-primary-foreground font-inter text-xs px-2 py-1 h-7`}
      >
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
        {hasResponse && <CheckCircle2 className="h-3 w-3 ml-1" />}
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          onClick={handleRequest}
          disabled={isLoading}
          className={`${config.color} text-primary-foreground font-inter text-sm px-3 py-2 h-8 flex-1`}
        >
          <Icon className="h-4 w-4 mr-2" />
          {config.label}
          {isLoading && <Clock className="h-4 w-4 ml-2 animate-spin" />}
          {hasResponse && <CheckCircle2 className="h-4 w-4 ml-2" />}
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
        <div className="p-3 bg-muted/30 rounded-lg border space-y-3">
          <p className="text-xs font-inter text-muted-foreground">{config.description}</p>
          
          <div className="space-y-2">
            <label className="text-xs font-cormorant font-medium text-foreground">
              Tell me more about what you need help with:
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Optional: Describe what specifically you're stuck on..."
              className="w-full font-inter text-xs p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={2}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => setExpanded(false)}
              variant="outline"
              size="sm"
              className="text-xs font-inter px-3 py-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRequest}
              disabled={isLoading}
              className={`${config.color} text-primary-foreground font-inter text-xs px-3 py-1`}
            >
              Get Help
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};