import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sparkles } from 'lucide-react';

interface FastStreamingMessageProps {
  content: string;
  isStreaming: boolean;
  onComplete?: () => void;
}

export const FastStreamingMessage: React.FC<FastStreamingMessageProps> = ({
  content,
  isStreaming,
  onComplete,
}) => {
  const [displayContent, setDisplayContent] = useState('');
  const [showAvatar, setShowAvatar] = useState(false);

  // Show avatar immediately for better responsiveness
  useEffect(() => {
    setShowAvatar(true);
  }, []);

  // Fast, responsive text display - no character-by-character animation
  useEffect(() => {
    if (content) {
      setDisplayContent(content);
      
      // Call onComplete after content is displayed
      if (!isStreaming && onComplete) {
        const timer = setTimeout(onComplete, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [content, isStreaming, onComplete]);

  return (
    <div className="flex items-start gap-3 mb-6 animate-fade-in">
      <div className={`transition-opacity duration-200 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
        <Avatar className="h-8 w-8 border border-soul-purple/20">
          <AvatarFallback className="bg-soul-purple/10 text-soul-purple">
            <Sparkles className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </div>
      
      <div className="flex-1 space-y-2">
        <div className="bg-soul-purple/5 rounded-lg p-4 border border-soul-purple/10">
          <div className="text-sm leading-relaxed whitespace-pre-wrap text-left">
            {displayContent}
            {isStreaming && (
              <span className="inline-block w-1 h-4 bg-soul-purple/70 ml-1 animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};