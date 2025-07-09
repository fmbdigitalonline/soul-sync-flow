
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-base font-medium font-body ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-6 [&_svg]:shrink-0 min-h-[44px] min-w-[44px]", // Standardized: 44px touch targets, 24px icons
  {
    variants: {
      variant: {
        filled: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]", // Renamed from default
        outline: "border-2 border-primary bg-transparent text-primary hover:bg-primary/10 hover:shadow-md",
        gradient: "bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]", // New gradient variant
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-lg",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-md",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-11 px-4 py-2 text-sm [&_svg]:size-4", // 44px minimum
        md: "h-12 px-6 py-3 text-base [&_svg]:size-6", // Default renamed to md
        lg: "h-14 px-8 py-4 text-lg [&_svg]:size-6",
        icon: "h-12 w-12 [&_svg]:size-6",
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
