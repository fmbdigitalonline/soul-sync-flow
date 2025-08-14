import React from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
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
            <article className="bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden h-full">
              <div className="aspect-[4/3] relative overflow-hidden">
                {image ? (
                  <img
                    src={image}
                    alt={`${title} background`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <Icon className="h-12 w-12 text-primary/50" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="p-4 bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
                  <h3 className="text-base font-semibold text-foreground leading-tight">{title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
