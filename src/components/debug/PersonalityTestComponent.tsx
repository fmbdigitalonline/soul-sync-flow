
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';

const PersonalityTestComponent: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Personality Test Placeholder
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          This is a placeholder component for personality testing functionality.
        </p>
        <Button size="sm" disabled>
          Run Personality Tests
        </Button>
      </CardContent>
    </Card>
  );
};

export default PersonalityTestComponent;
