import * as React from "react"
import { cn } from "@/lib/utils"

interface UnifiedCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'> {
  variant?: 'default' | 'shadowed' | 'gradient'
  header?: React.ReactNode
  content?: React.ReactNode
  footer?: React.ReactNode
  padding?: 'default' | 'compact' | 'spacious'
}

const UnifiedCard = React.forwardRef<HTMLDivElement, UnifiedCardProps>(
  ({ className, variant = 'default', header, content, footer, padding = 'default', children, ...props }, ref) => {
    const paddingClasses = {
      compact: 'p-3',
      default: 'p-4', // 16px standardized
      spacious: 'p-6'
    }

    const variantClasses = {
      default: 'bg-card text-card-foreground border border-border',
      shadowed: 'bg-card text-card-foreground border border-border shadow-md',
      gradient: 'bg-gradient-to-br from-primary/10 via-background to-accent/10 border border-border'
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl transition-all duration-300", // Standardized rounded corners
          variantClasses[variant],
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {header && (
          <div className="mb-4">
            {header}
          </div>
        )}
        
        {content && (
          <div className="flex-1">
            {content}
          </div>
        )}
        
        {children}
        
        {footer && (
          <div className="mt-4">
            {footer}
          </div>
        )}
      </div>
    )
  }
)
UnifiedCard.displayName = "UnifiedCard"

const UnifiedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5", className)}
    {...props}
  />
))
UnifiedCardHeader.displayName = "UnifiedCardHeader"

const UnifiedCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-heading font-semibold leading-tight text-foreground", // Standardized
      className
    )}
    {...props}
  />
))
UnifiedCardTitle.displayName = "UnifiedCardTitle"

const UnifiedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground font-body", className)}
    {...props}
  />
))
UnifiedCardDescription.displayName = "UnifiedCardDescription"

const UnifiedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
))
UnifiedCardContent.displayName = "UnifiedCardContent"

const UnifiedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center", className)}
    {...props}
  />
))
UnifiedCardFooter.displayName = "UnifiedCardFooter"

export { 
  UnifiedCard, 
  UnifiedCardHeader, 
  UnifiedCardFooter, 
  UnifiedCardTitle, 
  UnifiedCardDescription, 
  UnifiedCardContent 
}