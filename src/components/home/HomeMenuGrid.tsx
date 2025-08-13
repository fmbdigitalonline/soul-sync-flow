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
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-12 max-[360px]:grid-cols-1">
        {items.map(({ key, to, title, description, Icon, image }) => (
          <div key={key} className="rounded-3xl bg-card p-3 shadow-sm ring-1 ring-border/40 transition-shadow hover:shadow-md">
            <Link to={to} className="group block" aria-label={title}>
                <CosmicCard variant="minimal" size="lg" floating className="h-full p-0 overflow-hidden rounded-2xl">
                  <article className="relative w-full aspect-square">
                    <div className="absolute inset-0 flex flex-col gap-3 p-4 sm:p-5">
                      <div className="relative basis-2/3 overflow-hidden rounded-xl">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`${title} background`}
                          className="absolute inset-0 w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <div className="basis-1/3 rounded-xl ring-1 ring-border/30 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40 p-4 flex flex-col justify-center">
                        <div className="flex items-center gap-2 text-foreground/90">
                          <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                          <h3 className="text-lg font-semibold font-cormorant">{title}</h3>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground font-inter line-clamp-2">{description}</p>
                      </div>
                    </div>
                    <div className="absolute inset-0 ring-1 ring-border/30 pointer-events-none rounded-2xl" aria-hidden="true" />
                  </article>
                </CosmicCard>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
