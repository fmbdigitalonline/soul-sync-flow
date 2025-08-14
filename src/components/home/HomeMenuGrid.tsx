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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-12">
        {items.map(({ key, to, title, description, Icon, image }) => (
          <Link key={key} to={to} className="group block" aria-label={title}>
            <article className="bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden h-full">
              {/* Mobile: Horizontal layout, Desktop: Vertical layout */}
              <div className="flex sm:flex-col h-full">
                {/* Image container */}
                <div className="w-20 h-20 sm:w-full sm:aspect-[4/3] relative overflow-hidden flex-shrink-0">
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
                      <Icon className="h-8 w-8 sm:h-12 sm:w-12 text-primary/50" aria-hidden="true" />
                    </div>
                  )}
                </div>
                
                {/* Text container with CTA space */}
                <div className="flex-1 p-3 sm:p-4 bg-card flex flex-col justify-between min-h-[80px] sm:min-h-[120px]">
                  {/* Content section */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 sm:mb-2">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" aria-hidden="true" />
                      <h3 className="text-sm sm:text-base font-semibold text-foreground leading-tight">{title}</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-3">{description}</p>
                  </div>
                  
                  {/* Action area - reserved space for CTA buttons */}
                  <div className="mt-2 sm:mt-3 h-6 sm:h-8 flex items-end">
                    {/* CTA button space - ready for button integration */}
                  </div>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
