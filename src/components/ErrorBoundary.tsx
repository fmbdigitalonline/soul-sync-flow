
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-secondary-surface flex items-center justify-center p-4">
          <div className="bg-background/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-border text-center max-w-md w-full">
            <div className="w-16 h-16 bg-destructive/10 rounded-full mx-auto mb-6 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-xl font-bold mb-3 text-foreground font-cormorant">
              Something went wrong
            </h1>
            <p className="mb-6 text-muted-foreground text-sm font-inter">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-primary hover:shadow-lg transition-all duration-300 rounded-2xl h-12 font-medium font-cormorant"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
