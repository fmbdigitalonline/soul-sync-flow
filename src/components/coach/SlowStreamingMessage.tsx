
import React, { useState, useEffect } from 'react';
import { TypewriterText } from './TypewriterText';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sparkles } from 'lucide-react';

interface SlowStreamingMessageProps {
  content: string;
  isStreaming: boolean;
  onComplete?: () => void;
  speed?: number;
}

export const SlowStreamingMessage: React.FC<SlowStreamingMessageProps> = ({
  content,
  isStreaming,
  onComplete,
  speed = 80 // Slow, contemplative speed for growth conversations
}) => {
  const [showAvatar, setShowAvatar] = useState(false);

  // Show avatar with slight delay for natural feel
  useEffect(() => {
    const timer = setTimeout(() => setShowAvatar(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-start gap-3 mb-6 animate-fade-in">
      <div className={`transition-opacity duration-500 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
        <Avatar className="h-8 w-8 border border-soul-purple/20">
          <AvatarFallback className="bg-soul-purple/10 text-soul-purple">
            <Sparkles className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </div>
      
      <div className="flex-1 space-y-2">
        <div className="bg-soul-purple/5 rounded-lg p-4 border border-soul-purple/10">
          <TypewriterText
            text={content}
            isStreaming={isStreaming}
            speed={speed}
            onComplete={onComplete}
          />
        </div>
      </div>
    </div>
  );
};
