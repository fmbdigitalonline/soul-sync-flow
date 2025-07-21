
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-2xl border-2 px-3 py-1 text-caption-sm font-body font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 shadow-card",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary-dark hover:shadow-elevated",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary-dark hover:shadow-elevated",
        destructive:
          "border-transparent bg-error text-primary-foreground hover:bg-error/80 hover:shadow-elevated",
        success:
          "border-transparent bg-success text-primary-foreground hover:bg-success/80 hover:shadow-elevated",
        warning:
          "border-transparent bg-warning text-primary-foreground hover:bg-warning/80 hover:shadow-elevated",
        info:
          "border-transparent bg-info text-primary-foreground hover:bg-info/80 hover:shadow-elevated",
        outline: "text-text-main border-border-default bg-surface hover:bg-surface-elevated hover:border-primary/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
