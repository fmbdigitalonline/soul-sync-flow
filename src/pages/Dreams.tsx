
import React, { useEffect } from 'react';
import { DreamJourneyMap } from '@/components/dreams/DreamJourneyMap';
import { DreamActivityLog } from '@/components/dreams/DreamActivityLog';
import { DreamCoachInterface } from '@/components/dreams/DreamCoachInterface';
import { useProgramAwareCoach } from '@/hooks/use-program-aware-coach';
import { useAuth } from '@/contexts/AuthContext';

const Dreams = () => {
  const { user } = useAuth();
  
  // Step 1: Session Context Isolation - Initialize coach with 'dreams' page context
  const { 
    initializeConversation,
    currentSessionId,
    messages,
    resetConversation
  } = useProgramAwareCoach('dreams');

  useEffect(() => {
    if (user) {
      console.log('🌙 Initializing Dreams page with context isolation');
      initializeConversation();
    }
  }, [user, initializeConversation]);

  // Clean up when leaving the Dreams page
  useEffect(() => {
    return () => {
      console.log('🌙 Dreams page unmounting, cleaning up context');
      // Context cleanup is handled by the hook automatically
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-night-950 via-night-900 to-dream-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-dream-300 to-dream-100 bg-clip-text text-transparent mb-4">
            Dream Journey
          </h1>
          <p className="text-dream-200 text-lg max-w-2xl mx-auto">
            Transform your dreams into actionable goals with AI-powered coaching and personalized journey mapping.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Journey Map */}
          <div className="lg:col-span-2">
            <DreamJourneyMap />
          </div>
          
          {/* Activity Log */}
          <div className="space-y-6">
            <DreamActivityLog />
          </div>
        </div>

        {/* Dream Coach Interface */}
        <div className="mt-8">
          <DreamCoachInterface />
        </div>
      </div>
    </div>
  );
};

export default Dreams;
