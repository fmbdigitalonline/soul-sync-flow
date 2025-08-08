
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
      default: "bg-card shadow-sm hover:shadow-md hover:bg-accent/5",
      elevated: "bg-card shadow-lg hover:shadow-xl hover:bg-accent/5",
      interactive: "bg-card hover:bg-accent/10 hover:shadow-md cursor-pointer active:scale-[0.98]",
      minimal: "bg-transparent hover:bg-accent/5"
    };

    const sizes = {
      sm: "p-4 rounded-2xl",
      md: "p-6 rounded-3xl", 
      lg: "p-8 rounded-3xl"
    };

    return (
      <div
        ref={ref}
        className={cn(
          "transition-all duration-300",
          variants[variant],
          sizes[size],
          floating && "animate-float",
          glow && "relative before:absolute before:inset-0 before:rounded-3xl before:bg-primary/20 before:blur-lg before:opacity-30 before:-z-10",
          className
        )}
        {...props}
      />
    );
  }
)
CosmicCard.displayName = "CosmicCard"

export { CosmicCard }
