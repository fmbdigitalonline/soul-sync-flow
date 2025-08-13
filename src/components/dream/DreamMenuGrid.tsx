import React from "react";
import type { LucideIcon } from "lucide-react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export type DreamMenuItem = {
  key: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  image?: string;
  to?: string;
  onClick?: () => void;
};

interface DreamMenuGridProps extends React.HTMLAttributes<HTMLDivElement> {
  items: DreamMenuItem[];
}

export function DreamMenuGrid({ items, className, ...props }: DreamMenuGridProps) {
  return (
    <section aria-label="Dream mode starting hub" className={cn("w-full", className)} {...props}>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-12 max-[360px]:grid-cols-1">
        {items.map(({ key, title, description, Icon, image, to, onClick }) => (
          to ? (
            <div key={key} className="rounded-3xl bg-card p-3 shadow-sm ring-1 ring-border/40 transition-shadow hover:shadow-md">
              <Link to={to} className="group block text-left" aria-label={title}>
                <CosmicCard variant="minimal" size="lg" floating className="h-full p-0 overflow-hidden rounded-2xl">
                  <article className="relative w-full aspect-square">
                    <div className="absolute inset-0 flex flex-col gap-2 sm:gap-3 p-3 sm:p-4">
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
                      <div className="flex-shrink-0 rounded-xl ring-1 ring-border/30 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-2 sm:p-3">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-foreground/90 mb-1">
                          <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" aria-hidden="true" />
                           <h3 className="text-sm sm:text-base font-semibold font-system leading-tight truncate">{title}</h3>
                         </div>
                         <p className="text-xs sm:text-sm text-muted-foreground font-system line-clamp-2 leading-snug">{description}</p>
                      </div>
                    </div>
                    <div className="absolute inset-0 ring-1 ring-border/30 pointer-events-none rounded-2xl" aria-hidden="true" />
                  </article>
                </CosmicCard>
              </Link>
            </div>
          ) : (
            <div key={key} className="rounded-3xl bg-card p-3 shadow-sm ring-1 ring-border/40 transition-shadow hover:shadow-md">
              <div
                role="button"
                tabIndex={0}
                onClick={onClick}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick?.();
                  }
                }}
                className="group block text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                aria-label={title}
              >
                <CosmicCard variant="minimal" size="lg" floating className="h-full p-0 overflow-hidden rounded-2xl">
                  <article className="relative w-full aspect-square">
                    <div className="absolute inset-0 flex flex-col gap-2 sm:gap-3 p-3 sm:p-4">
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
                      <div className="flex-shrink-0 rounded-xl ring-1 ring-border/30 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-2 sm:p-3">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-foreground/90 mb-1">
                          <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" aria-hidden="true" />
                           <h3 className="text-sm sm:text-base font-semibold font-system leading-tight truncate">{title}</h3>
                         </div>
                         <p className="text-xs sm:text-sm text-muted-foreground font-system line-clamp-2 leading-snug">{description}</p>
                      </div>
                    </div>
                    <div className="absolute inset-0 ring-1 ring-border/30 pointer-events-none rounded-2xl" aria-hidden="true" />
                  </article>
                </CosmicCard>
              </div>
            </div>
          )
        ))}
      </div>
    </section>
  );
}

export default DreamMenuGrid;
