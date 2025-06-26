
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Bell } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileTogglePanelProps {
  chatContent: React.ReactNode;
  remindersContent: React.ReactNode;
  activeRemindersCount?: number;
}

export const MobileTogglePanel: React.FC<MobileTogglePanelProps> = ({
  chatContent,
  remindersContent,
  activeRemindersCount = 0,
}) => {
  const [activePanel, setActivePanel] = useState<'chat' | 'reminders'>('chat');
  const isMobile = useIsMobile();

  if (!isMobile) {
    // Desktop: Show side by side
    return (
      <div className="flex h-[calc(100vh-5rem)] w-full gap-4">
        <div className="flex-1 flex flex-col">
          {chatContent}
        </div>
        <div className="w-80 flex-shrink-0 p-4 bg-gray-50/50 rounded-lg">
          {remindersContent}
        </div>
      </div>
    );
  }

  // Mobile: Toggle between panels
  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] w-full">
      {/* Toggle Header */}
      <div className="flex-shrink-0 p-2 border-b bg-background">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <Button
            variant={activePanel === 'chat' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActivePanel('chat')}
            className="flex-1 h-8"
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Coach
          </Button>
          <Button
            variant={activePanel === 'reminders' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActivePanel('reminders')}
            className="flex-1 h-8 relative"
          >
            <Bell className="h-4 w-4 mr-1" />
            Reminders
            {activeRemindersCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
              >
                {activeRemindersCount > 9 ? '9+' : activeRemindersCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0">
        {activePanel === 'chat' ? (
          <div className="h-full">
            {chatContent}
          </div>
        ) : (
          <div className="h-full p-4 bg-gray-50/50 overflow-y-auto">
            {remindersContent}
          </div>
        )}
      </div>
    </div>
  );
};
