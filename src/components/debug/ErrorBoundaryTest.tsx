
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

const ErrorBoundaryTest: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Error Boundary Test Placeholder
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          This is a placeholder component for error boundary testing functionality.
        </p>
        <Button size="sm" disabled>
          Test Error Boundaries
        </Button>
      </CardContent>
    </Card>
  );
};

export default ErrorBoundaryTest;
