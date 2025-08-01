import React from 'react';

interface ThinkingDotsProps {
  className?: string;
}

export const ThinkingDots: React.FC<ThinkingDotsProps> = ({ className = "" }) => {
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div 
        className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse"
        style={{
          animationDelay: '0ms',
          animationDuration: '1.5s'
        }}
      />
      <div 
        className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse"
        style={{
          animationDelay: '75ms',
          animationDuration: '1.5s'
        }}
      />
      <div 
        className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse"
        style={{
          animationDelay: '150ms',
          animationDuration: '1.5s'
        }}
      />
    </div>
  );
};