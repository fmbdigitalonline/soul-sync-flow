
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, TrendingUp, MessageCircle, Wrench } from 'lucide-react';

interface GrowthCoachWelcomeProps {
  onStartProgram: () => void;
  onTalkToCoach: () => void;
  onGoToTools: () => void;
}

export const GrowthCoachWelcome: React.FC<GrowthCoachWelcomeProps> = ({
  onStartProgram,
  onTalkToCoach,
  onGoToTools
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6 p-6">
      {/* Growth Coach Avatar */}
      <div className="w-20 h-20 bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center mb-4">
        <Heart className="h-10 w-10 text-white" />
      </div>

      {/* Welcome Message */}
      <div className="text-center space-y-3 max-w-md">
        <h1 className="text-2xl font-bold gradient-text">Welcome to Growth Mode</h1>
        <p className="text-muted-foreground">
          I'm your Growth Coach, here to guide you step by step through your personal development journey. 
          Let's go deep together and unlock what's calling to you.
        </p>
      </div>

      {/* Three Main Options */}
      <div className="grid gap-4 w-full max-w-md">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onStartProgram}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-soul-purple/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-soul-purple" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Start Growth Program</h3>
                <p className="text-sm text-muted-foreground">
                  Let me guide you through discovering your growth area and core motivations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onTalkToCoach}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-soul-teal/10 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-soul-teal" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Talk to Growth Coach</h3>
                <p className="text-sm text-muted-foreground">
                  Have a focused conversation about your growth challenges
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onGoToTools}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-soul-purple to-soul-teal opacity-10 rounded-lg flex items-center justify-center">
                <Wrench className="h-6 w-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Go to Growth Tools</h3>
                <p className="text-sm text-muted-foreground">
                  Access mood tracking, reflection prompts, and insights
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-center text-muted-foreground max-w-sm">
        Growth mode is about going deep, step by step. I'm here to facilitate your journey with focused guidance.
      </p>
    </div>
  );
};
