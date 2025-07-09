
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Bell } from 'lucide-react';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';

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
  const { spacing, touchTargetSize, isMobile } = useResponsiveLayout();

  if (!isMobile) {
    // Desktop: Show side by side
    return (
      <div className={`flex h-[calc(100vh-5rem)] w-full ${spacing.gap}`}>
        <div className="flex-1 flex flex-col">
          {chatContent}
        </div>
        <div className={`w-80 flex-shrink-0 ${spacing.container} bg-gray-50/50 rounded-lg`}>
          {remindersContent}
        </div>
      </div>
    );
  }

  // Mobile: Toggle between panels with coordinated spacing for mobile nav
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] w-full max-w-full overflow-hidden">
      {/* Toggle Header */}
      <div className={`flex-shrink-0 ${spacing.container} border-b bg-background`}>
        <div className={`flex ${spacing.gap} bg-gray-100 rounded-lg p-1 max-w-full`}>
          <Button
            variant={activePanel === 'chat' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActivePanel('chat')}
            className={`flex-1 h-8 min-w-0 ${touchTargetSize}`}
          >
            <MessageSquare className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">Companion</span>
          </Button>
          <Button
            variant={activePanel === 'reminders' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActivePanel('reminders')}
            className={`flex-1 h-8 relative min-w-0 ${touchTargetSize}`}
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

      {/* Content Area - No duplicate input areas, BlendInterface handles mobile input */}
      <div className="flex-1 min-h-0 w-full max-w-full overflow-hidden">
        {activePanel === 'chat' ? (
          <div className="h-full w-full max-w-full">
            {chatContent}
          </div>
        ) : (
          <div className={`h-full ${spacing.container} bg-gray-50/50 overflow-y-auto w-full max-w-full mb-20`}>
            {remindersContent}
          </div>
        )}
      </div>
    </div>
  );
};
