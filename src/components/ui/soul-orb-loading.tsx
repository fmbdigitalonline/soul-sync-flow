import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SoulOrbLoadingProps {
  message?: string;
  className?: string;
}

export const SoulOrbLoading: React.FC<SoulOrbLoadingProps> = ({
  message = "Soul Orb is thinking...",
  className
}) => {
  return (
    <div className={cn("flex items-center space-x-3 p-3 bg-muted rounded-lg max-w-[70%]", className)}>
      <div className="relative">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-soul-purple to-soul-teal animate-pulse" />
        <Loader2 className="h-4 w-4 animate-spin absolute top-1 left-1 text-white" />
      </div>
      <span className="text-sm text-muted-foreground font-inter">{message}</span>
    </div>
  );
};