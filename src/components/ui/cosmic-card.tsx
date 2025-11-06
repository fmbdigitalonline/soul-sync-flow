
import * as React from "react"

import { cn } from "@/lib/utils"

interface CosmicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  floating?: boolean;
  glow?: boolean;
  variant?: "default" | "elevated" | "interactive" | "minimal";
  size?: "sm" | "md" | "lg";
}

const CosmicCard = React.forwardRef<HTMLDivElement, CosmicCardProps>(
  ({ className, floating = false, glow = false, variant = "default", size = "md", ...props }, ref) => {
    const variants = {
      default: "bg-card border border-border/60 hover:border-border hover:bg-muted/30",
      elevated: "bg-card border border-border shadow-sm hover:shadow-md hover:bg-muted/30",
      interactive: "bg-card border border-border/60 hover:border-primary/30 hover:bg-muted/30 cursor-pointer active:scale-[0.98]",
      minimal: "bg-transparent hover:bg-muted/30"
    };

    const sizes = {
      sm: "p-3 rounded-lg",
      md: "p-4 rounded-lg", 
      lg: "p-6 rounded-lg"
    };

    return (
      <div
        ref={ref}
        className={cn(
          "transition-all duration-150",
          variants[variant],
          sizes[size],
          floating && "animate-float",
          glow && "relative before:absolute before:inset-0 before:rounded-lg before:bg-primary/10 before:blur-md before:opacity-50 before:-z-10",
          className
        )}
        {...props}
      />
    );
  }
)
CosmicCard.displayName = "CosmicCard"

export { CosmicCard }
