
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UnifiedCoachInterface from '@/components/coach/UnifiedCoachInterface';
import { useAuth } from '@/contexts/AuthContext';

export const DreamCoachInterface = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Card className="bg-night-800/50 border-dream-600/30">
        <CardHeader>
          <CardTitle className="text-dream-200">Dream Coach</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-dream-400">Please sign in to access your Dream Coach.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-night-800/50 border-dream-600/30">
      <CardHeader>
        <CardTitle className="text-dream-200">Dream Coach</CardTitle>
        <p className="text-dream-300">
          Work with your AI coach to transform dreams into actionable goals.
        </p>
      </CardHeader>
      <CardContent>
        <UnifiedCoachInterface 
          sessionId={`dreams_${user.id}_${Date.now()}`}
          agentMode="guide"
          initialMessages={[]}
        />
      </CardContent>
    </Card>
  );
};
