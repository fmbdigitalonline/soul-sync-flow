
import React from "react";
import { cn } from "@/lib/utils";

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export const BentoGrid = ({ children, className }: BentoGridProps) => {
  return (
    <div className={cn("bento-grid", className)}>
      {children}
    </div>
  );
};

interface BentoTileProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const BentoTile = ({ 
  children, 
  className,
  title
}: BentoTileProps) => {
  return (
    <div className={cn("bento-tile", className)}>
      {title && (
        <h3 className="font-display text-lg font-medium mb-3">{title}</h3>
      )}
      {children}
    </div>
  );
};
