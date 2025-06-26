
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

  // Mobile: Toggle between panels with proper padding
  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] w-full max-w-full overflow-hidden">
      {/* Toggle Header */}
      <div className="flex-shrink-0 p-3 border-b bg-background">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 max-w-full">
          <Button
            variant={activePanel === 'chat' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActivePanel('chat')}
            className="flex-1 h-8 min-w-0"
          >
            <MessageSquare className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">Coach</span>
          </Button>
          <Button
            variant={activePanel === 'reminders' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActivePanel('reminders')}
            className="flex-1 h-8 relative min-w-0"
          >
            <Bell className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">Reminders</span>
            {activeRemindersCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center min-w-[1.25rem]"
              >
                {activeRemindersCount > 9 ? '9+' : activeRemindersCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Content Area with proper mobile constraints */}
      <div className="flex-1 min-h-0 w-full max-w-full overflow-hidden">
        {activePanel === 'chat' ? (
          <div className="h-full w-full max-w-full">
            {chatContent}
          </div>
        ) : (
          <div className="h-full p-3 bg-gray-50/50 overflow-y-auto w-full max-w-full">
            {remindersContent}
          </div>
        )}
      </div>
    </div>
  );
};
