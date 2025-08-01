import React, { useState, useEffect } from 'react';
import { useStreamingSyncState } from '@/hooks/use-streaming-sync-state';

interface ThinkingDotsProps {
  className?: string;
}

export const ThinkingDots: React.FC<ThinkingDotsProps> = ({ className = "" }) => {
  const { subscribe } = useStreamingSyncState();
  const [streamingTiming, setStreamingTiming] = useState(75);

  useEffect(() => {
    const unsubscribeStreaming = subscribe(setStreamingTiming);
    return unsubscribeStreaming;
  }, [subscribe]);
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div 
        className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse"
        style={{
          animationDelay: '0ms',
          animationDuration: `${streamingTiming * 2}ms`
        }}
      />
      <div 
        className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse"
        style={{
          animationDelay: `${streamingTiming * 0.5}ms`,
          animationDuration: `${streamingTiming * 2}ms`
        }}
      />
      <div 
        className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse"
        style={{
          animationDelay: `${streamingTiming}ms`,
          animationDuration: `${streamingTiming * 2}ms`
        }}
      />
    </div>
  );
};