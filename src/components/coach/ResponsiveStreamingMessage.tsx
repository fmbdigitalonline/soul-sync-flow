import React from 'react';
import { FastStreamingMessage } from './FastStreamingMessage';
import { SlowStreamingMessage } from './SlowStreamingMessage';

interface ResponsiveStreamingMessageProps {
  content: string;
  isStreaming: boolean;
  onComplete?: () => void;
  useSlowMode?: boolean; // Allow switching between fast and slow modes
}

export const ResponsiveStreamingMessage: React.FC<ResponsiveStreamingMessageProps> = ({
  content,
  isStreaming,
  onComplete,
  useSlowMode = false // Default to fast mode for better interactivity
}) => {
  // Use fast streaming for task coach interfaces, slow for contemplative contexts
  if (useSlowMode) {
    return (
      <SlowStreamingMessage
        content={content}
        isStreaming={isStreaming}
        onComplete={onComplete}
        speed={30} // Already updated to be faster
      />
    );
  }

  return (
    <FastStreamingMessage
      content={content}
      isStreaming={isStreaming}
      onComplete={onComplete}
    />
  );
};