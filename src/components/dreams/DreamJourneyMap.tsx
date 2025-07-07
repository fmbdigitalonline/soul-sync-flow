
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export const DreamJourneyMap = () => {
  const { user } = useAuth();

  return (
    <Card className="bg-night-800/50 border-dream-600/30">
      <CardHeader>
        <CardTitle className="text-dream-200">Dream Journey Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-dream-300">
            Visualize your dreams and track your progress towards achieving them.
          </div>
          {user ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-dream-900/30 rounded-lg border border-dream-600/20">
                <h3 className="font-semibold text-dream-200 mb-2">Current Dreams</h3>
                <p className="text-dream-300 text-sm">Your active dreams and goals will appear here.</p>
              </div>
              <div className="p-4 bg-dream-900/30 rounded-lg border border-dream-600/20">
                <h3 className="font-semibold text-dream-200 mb-2">Progress Milestones</h3>
                <p className="text-dream-300 text-sm">Track your journey towards achieving your dreams.</p>
              </div>
            </div>
          ) : (
            <div className="text-dream-400">Please sign in to view your dream journey.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
