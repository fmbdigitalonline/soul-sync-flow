import React from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { cn } from "@/lib/utils";

export type HomeMenuItem = {
  key: string;
  to: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  image?: string;
};

interface HomeMenuGridProps extends React.HTMLAttributes<HTMLDivElement> {
  items: HomeMenuItem[];
}

export function HomeMenuGrid({ items, className, ...props }: HomeMenuGridProps) {
  return (
    <section
      aria-label="Main navigation tiles"
      className={cn("w-full", className)}
      {...props}
    >
      <div className="grid grid-cols-3 gap-6 mb-12">
        {items.map(({ key, to, title, description, Icon, image }) => (
          <Link key={key} to={to} className="group block" aria-label={title}>
            <CosmicCard variant="interactive" size="lg" floating className="h-full p-0 overflow-hidden">
              <article className="relative w-full aspect-square">
                <img
                  src={image || "/placeholder.svg"}
                  alt={`${title} background`}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/30 to-transparent" aria-hidden="true" />
                <div className="absolute inset-0 ring-1 ring-border/30 pointer-events-none rounded-3xl" aria-hidden="true" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-foreground/90">
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                    <h3 className="text-lg font-semibold font-cormorant">{title}</h3>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground font-inter">{description}</p>
                </div>
              </article>
            </CosmicCard>
          </Link>
        ))}
      </div>
    </section>
  );
}
