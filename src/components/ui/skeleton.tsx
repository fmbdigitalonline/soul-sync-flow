import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-2xl bg-surface-elevated border border-border-subtle", className)}
      {...props}
    />
  )
}

export { Skeleton }
