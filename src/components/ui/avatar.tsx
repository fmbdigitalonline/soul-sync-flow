
import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { SoulOrb } from "@/components/ui/soul-orb"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

// New SoulOrbAvatar component that uses our SoulOrb component
const SoulOrbAvatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    speaking?: boolean;
    size?: "sm" | "md" | "lg";
    stage?: "welcome" | "collecting" | "generating" | "complete";
  }
>(({ className, speaking = false, size = "sm", stage = "welcome", ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative overflow-hidden rounded-full", className)}
    {...props}
  >
    <SoulOrb speaking={speaking} size={size} stage={stage} />
  </div>
))
SoulOrbAvatar.displayName = "SoulOrbAvatar"

export { Avatar, AvatarImage, AvatarFallback, SoulOrbAvatar }
