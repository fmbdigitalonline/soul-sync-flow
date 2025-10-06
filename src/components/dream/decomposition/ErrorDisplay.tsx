
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ErrorDisplayProps {
  error: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  const { t } = useLanguage();
  
  const isQuotaError = error.includes('capacity') || error.includes('quota');
  const isTimeoutError = error.includes('took too long') || error.includes('timeout');
  const isAuthError = error.includes('Authentication') || error.includes('logging');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold">Dream Creation Error</h2>
          <p className="text-muted-foreground">{error}</p>
          
          {isQuotaError && (
            <div className="bg-muted p-4 rounded-lg text-sm text-left">
              <p className="font-medium mb-2">💡 What to try:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Wait 30-60 seconds and try again</li>
                <li>The AI service may be experiencing high demand</li>
                <li>Your dream data is saved and won't be lost</li>
              </ul>
            </div>
          )}
          
          {isTimeoutError && (
            <div className="bg-muted p-4 rounded-lg text-sm text-left">
              <p className="font-medium mb-2">💡 What to try:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Simplify your dream description (max 500 words)</li>
                <li>Break complex goals into smaller dreams</li>
                <li>Check your internet connection</li>
              </ul>
            </div>
          )}
          
          {isAuthError && (
            <div className="bg-muted p-4 rounded-lg text-sm text-left">
              <p className="font-medium mb-2">💡 What to try:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Log out and log back in</li>
                <li>Clear your browser cache</li>
                <li>Contact support if issue persists</li>
              </ul>
            </div>
          )}
          
          <Button onClick={() => window.location.reload()}>
            {t('decomposition.errors.tryAgain')}
          </Button>
        </div>
      </Card>
    </div>
  );
};
