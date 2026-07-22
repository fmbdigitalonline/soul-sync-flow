import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileTogglePanelProps {
  chatContent: React.ReactNode;
  remindersContent: React.ReactNode;
  activeRemindersCount?: number;
}

export const MobileTogglePanel: React.FC<MobileTogglePanelProps> = ({
  chatContent,
  remindersContent,
}) => {
  const { isMobile } = useIsMobile();

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

  // Mobile: The chat is the primary surface; the Companion/Reminders toggle is redundant
  // because the user is already on the Companion page via the bottom navigation.
  return (
    <div className="flex flex-col h-[calc(100dvh-12rem)] w-full max-w-full overflow-hidden">
      <div className="flex-1 min-h-0 w-full max-w-full overflow-hidden">
        <div className="h-full w-full max-w-full">
          {chatContent}
        </div>
      </div>
    </div>
  );
};
