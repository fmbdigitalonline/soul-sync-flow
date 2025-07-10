
import * as React from "react"

import { cn } from "@/lib/utils"

interface CosmicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  floating?: boolean;
  glow?: boolean;
}

const CosmicCard = React.forwardRef<HTMLDivElement, CosmicCardProps>(
  ({ className, floating = false, glow = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-card border border-border rounded-3xl p-6 transition-colors duration-300 hover:bg-accent/5", 
        floating && "animate-float",
        glow && "before:absolute before:inset-0 before:rounded-3xl before:bg-primary/20 before:blur-lg before:opacity-30 before:-z-10",
        className
      )}
      {...props}
    />
  )
)
CosmicCard.displayName = "CosmicCard"

export { CosmicCard }
