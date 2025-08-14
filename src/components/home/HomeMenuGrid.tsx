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
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-12 max-[360px]:grid-cols-1">
        {items.map(({ key, to, title, description, Icon, image }) => (
          <Link key={key} to={to} className="group block" aria-label={title}>
            <CosmicCard variant="elevated" size="lg" floating className="h-full overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02]">
              <article className="relative w-full min-h-[220px] sm:min-h-[260px] lg:min-h-[300px]">
                <div className="absolute inset-0 flex flex-col gap-3 sm:gap-4 p-3 sm:p-4">
                  <div className="relative flex-1 overflow-hidden rounded-xl bg-muted/50">
                    {image ? (
                      <img
                        src={image}
                        alt={`${title} background`}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <Icon className="h-8 w-8 sm:h-12 sm:w-12 text-primary/40" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 rounded-xl ring-1 ring-border/30 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-3 sm:p-4 min-h-[44px]">
                    <div className="flex items-center gap-2 text-foreground/90 mb-1.5">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" aria-hidden="true" />
                      <h3 className="text-sm sm:text-base font-semibold font-system leading-tight truncate">{title}</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground font-system line-clamp-2 leading-snug">{description}</p>
                  </div>
                </div>
              </article>
            </CosmicCard>
          </Link>
        ))}
      </div>
    </section>
  );
}
