import React from "react";
import type { LucideIcon } from "lucide-react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { cn } from "@/lib/utils";

export type DreamMenuItem = {
  key: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  image?: string;
  onClick: () => void;
};

interface DreamMenuGridProps extends React.HTMLAttributes<HTMLDivElement> {
  items: DreamMenuItem[];
}

export function DreamMenuGrid({ items, className, ...props }: DreamMenuGridProps) {
  return (
    <section aria-label="Dream mode starting hub" className={cn("w-full", className)} {...props}>
      <div className="grid grid-cols-3 gap-6 mb-12">
        {items.map(({ key, title, description, Icon, image, onClick }) => (
          <button key={key} type="button" onClick={onClick} className="group block text-left" aria-label={title}>
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
          </button>
        ))}
      </div>
    </section>
  );
}

export default DreamMenuGrid;
