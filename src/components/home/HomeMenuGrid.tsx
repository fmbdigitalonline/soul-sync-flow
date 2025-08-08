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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {items.map(({ key, to, title, description, Icon }) => (
          <Link key={key} to={to} className="group" aria-label={title}>
            <CosmicCard variant="interactive" size="lg" floating className="h-full">
              <div className="text-center space-y-4">
                <Icon className="h-12 w-12 text-primary mx-auto group-hover:text-accent transition-colors" aria-hidden="true" />
                <div>
                  <h3 className="text-xl font-semibold font-cormorant text-foreground">{title}</h3>
                  <p className="text-muted-foreground font-inter mt-2">{description}</p>
                </div>
              </div>
            </CosmicCard>
          </Link>
        ))}
      </div>
    </section>
  );
}
