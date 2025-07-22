import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HACSErrorDisplayProps {
  error?: Error | string;
  onRetry?: () => void;
  className?: string;
}

export const HACSErrorDisplay: React.FC<HACSErrorDisplayProps> = ({
  error,
  onRetry,
  className
}) => {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <div className={cn("flex items-start space-x-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg max-w-[70%]", className)}>
      <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <p className="text-sm text-destructive font-inter">
          Soul Orb connection interrupted
        </p>
        <p className="text-xs text-muted-foreground font-inter">
          {errorMessage}
        </p>
        {onRetry && (
          <Button
            onClick={onRetry}
            size="sm"
            variant="outline"
            className="h-8 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
};