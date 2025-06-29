
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, MessageCircle, RotateCcw, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ConversationRecoveryData {
  sessionId: string;
  messages: any[];
  domain?: string;
  lastActivity: string;
  recoveryContext: any;
}

interface ConversationRecoveryBannerProps {
  recoveries: ConversationRecoveryData[];
  onRecover: (sessionId: string) => void;
  onDismiss: (sessionId: string) => void;
  onClose: () => void;
}

export const ConversationRecoveryBanner: React.FC<ConversationRecoveryBannerProps> = ({
  recoveries,
  onRecover,
  onDismiss,
  onClose
}) => {
  if (recoveries.length === 0) return null;

  const mostRecent = recoveries[0];
  const messageCount = mostRecent.messages.length;
  const lastActivityTime = formatDistanceToNow(new Date(mostRecent.lastActivity), { addSuffix: true });

  return (
    <Card className="mb-4 border-soul-purple/20 bg-gradient-to-r from-soul-purple/5 to-soul-teal/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-soul-purple/10 rounded-full">
              <RotateCcw className="h-4 w-4 text-soul-purple" />
            </div>
            <div>
              <h3 className="font-medium text-sm">Continue Previous Conversation</h3>
              <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                <div className="flex items-center space-x-1">
                  <MessageCircle className="h-3 w-3" />
                  <span>{messageCount} messages</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{lastActivityTime}</span>
                </div>
                {mostRecent.domain && (
                  <span className="px-2 py-1 bg-soul-purple/10 rounded text-soul-purple capitalize">
                    {mostRecent.domain.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              onClick={() => onRecover(mostRecent.sessionId)}
              className="bg-soul-purple hover:bg-soul-purple/90 text-white"
            >
              Resume
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDismiss(mostRecent.sessionId)}
            >
              Dismiss
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
