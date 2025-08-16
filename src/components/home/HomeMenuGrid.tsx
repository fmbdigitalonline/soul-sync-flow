import React from "react";
import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  const navigate = useNavigate();

  return (
    <section
      aria-label="Main navigation tiles"
      className={cn("w-full", className)}
      {...props}
    >
      {/* Constrained width on mobile to match button, grid on larger screens */}
      <div className="flex flex-col gap-4 w-full mb-12 mt-6">
        {items.map(({ key, to, title, description, Icon, image }) => (
          <article key={key} className="bg-card rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">
            {/* Mobile: Compact horizontal layout, Desktop: Vertical layout */}
            <div className="flex sm:flex-col h-full">
              {/* Image container - smaller on mobile */}
              <div className="w-12 h-12 sm:w-full sm:aspect-[4/3] relative overflow-hidden flex-shrink-0 rounded-md sm:rounded-none">
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
                    <Icon className="h-5 w-5 sm:h-12 sm:w-12 text-primary/50" aria-hidden="true" />
                  </div>
                )}
              </div>
              
              {/* Text container - compact on mobile */}
              <div className="flex-1 p-2 sm:p-4 bg-card flex items-center sm:flex-col sm:items-start justify-between sm:justify-start">
                {/* Content section - horizontal on mobile */}
                <div className="flex-1 sm:w-full">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-2">
                    <Icon className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-primary flex-shrink-0" aria-hidden="true" />
                    <h3 className="text-xs sm:text-base font-semibold text-foreground leading-tight">{title}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-tight sm:leading-relaxed line-clamp-1 sm:line-clamp-3">{description}</p>
                </div>
                
                {/* Action button - inline on mobile */}
                <div className="ml-2 sm:ml-0 sm:mt-3 sm:w-full flex justify-end sm:justify-start">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => navigate(to)}
                    aria-label={`Navigate to ${title}`}
                    className="text-xs h-6 px-2 sm:h-8 sm:px-3 text-primary hover:bg-primary/10"
                  >
                    Open
                  </Button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}