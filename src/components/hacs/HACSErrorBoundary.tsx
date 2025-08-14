import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { handleLoadingError, createErrorHandler } from '@/utils/error-recovery';

interface HACSErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  source: string;
}

const HACSErrorFallback: React.FC<HACSErrorFallbackProps> = ({ 
  error, 
  resetError, 
  source 
}) => {
  const { t } = useLanguage();
  
  const handleRetry = () => {
    console.log(`🔧 HACS Error Recovery: Retrying ${source}`);
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-card/50 backdrop-blur border border-destructive/20 rounded-xl max-w-md mx-auto">
      <AlertTriangle className="w-8 h-8 text-destructive mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {t('errors.hacs_system_error')}
      </h3>
      <p className="text-muted-foreground text-sm text-center mb-4">
        {t('errors.hacs_recovery_message')}
      </p>
      <div className="text-xs text-muted-foreground/70 mb-4 font-mono bg-muted/30 p-2 rounded">
        Source: {source}
        {error && <div>Error: {error.message}</div>}
      </div>
      <Button 
        onClick={handleRetry}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        {t('actions.retry')}
      </Button>
    </div>
  );
};

interface HACSErrorBoundaryProps {
  children: React.ReactNode;
  source: string;
  onError?: (error: Error) => void;
  fallback?: React.ComponentType<HACSErrorFallbackProps>;
}

export class HACSErrorBoundary extends React.Component<
  HACSErrorBoundaryProps,
  { hasError: boolean; error?: Error }
> {
  private errorHandler: (error: Error | unknown, context?: any) => void;

  constructor(props: HACSErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
    
    // Create standardized error handler with cleanup
    this.errorHandler = createErrorHandler(
      props.source, 
      () => this.setState({ hasError: false, error: undefined })
    );
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`❌ HACS Error in ${this.props.source}:`, error, errorInfo);
    
    // Use standardized error recovery
    this.errorHandler(error, { 
      componentStack: errorInfo.componentStack,
      source: this.props.source 
    });
    
    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || HACSErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          source={this.props.source}
        />
      );
    }

    return this.props.children;
  }
}

// Specialized error boundaries for different HACS components
export const HACSChatErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <HACSErrorBoundary source="HACS-Chat">
    {children}
  </HACSErrorBoundary>
);

export const HACSInsightErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <HACSErrorBoundary source="HACS-Insights">
    {children}
  </HACSErrorBoundary>
);

export const HACSLearningErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <HACSErrorBoundary source="HACS-Learning">
    {children}
  </HACSErrorBoundary>
);