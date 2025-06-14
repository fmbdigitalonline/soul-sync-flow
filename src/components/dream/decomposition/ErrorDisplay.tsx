
import React from 'react';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-soul-purple/10 via-white to-soul-teal/5 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <Brain className="h-8 w-8 text-red-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Creation Failed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-soul-purple to-soul-teal text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
};
