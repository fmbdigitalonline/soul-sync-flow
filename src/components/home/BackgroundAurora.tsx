import React from "react";
import { cn } from "@/lib/utils";

// Decorative background for the home page
// Uses semantic tokens and subtle gradients
export const BackgroundAurora: React.FC<{ className?: string }>= ({ className }) => {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        "bg-soul-radial bg-200 animate-gradient-shift",
        className
      )}
    >
      <div className="absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full blur-3xl"
           style={{ background: 'radial-gradient(circle at 50% 50%, hsl(var(--primary)/0.20), transparent 60%)' }} />
      <div className="absolute bottom-[-160px] right-[-80px] h-[420px] w-[420px] rounded-full blur-3xl"
           style={{ background: 'radial-gradient(circle at 50% 50%, hsl(var(--accent)/0.20), transparent 60%)' }} />
    </div>
  );
};
