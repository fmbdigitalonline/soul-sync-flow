import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GoldenStandardCardProps {
  title: string;
  description: string;
  children?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'sunken';
  showActions?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'outline';
}

/**
 * Golden Standard Card Template
 * 
 * A pre-configured card component that enforces the Golden Standard design system.
 * Use this as a starting point for new card-based components.
 * 
 * Features:
 * - Semantic color tokens (bg-surface, text-main, border-border-default)
 * - Proper typography hierarchy (font-display for titles, font-body for content)
 * - Semantic spacing tokens (space-*, component-*)
 * - Responsive design
 * - Accessibility-ready
 * 
 * @example
 * <GoldenStandardCard
 *   title="Your Blueprint"
 *   description="Discover your cosmic personality profile"
 *   showActions
 *   actionLabel="View Details"
 *   onAction={() => navigate('/blueprint')}
 *   badge="Premium"
 * />
 */
export const GoldenStandardCard: React.FC<GoldenStandardCardProps> = ({
  title,
  description,
  children,
  variant = 'default',
  showActions = false,
  actionLabel = "Learn More",
  onAction,
  badge,
  badgeVariant = 'default'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'elevated':
        return 'bg-surface-elevated shadow-elevated';
      case 'sunken':
        return 'bg-surface-sunken';
      default:
        return 'bg-surface shadow-card';
    }
  };

  return (
    <Card className={`
      ${getVariantClasses()}
      border-border-default 
      transition-all duration-200 
      hover:shadow-elevated 
      mobile-container
    `}>
      <CardHeader className="p-space-lg">
        <div className="flex items-start justify-between gap-space-sm">
          <CardTitle className="
            font-display 
            text-heading-lg 
            text-main 
            leading-tight
          ">
            {title}
          </CardTitle>
          {badge && (
            <Badge 
              variant={badgeVariant}
              className="font-body text-text-sm"
            >
              {badge}
            </Badge>
          )}
        </div>
        
        <p className="
          font-body 
          text-text-base 
          text-secondary 
          leading-relaxed
          mt-space-sm
        ">
          {description}
        </p>
      </CardHeader>

      {children && (
        <CardContent className="p-space-lg pt-0">
          <div className="space-y-space-md">
            {children}
          </div>
        </CardContent>
      )}

      {showActions && (
        <CardContent className="p-space-lg pt-0">
          <Button 
            onClick={onAction}
            className="
              font-display 
              text-heading-sm
              w-full
              sm:w-auto
            "
          >
            {actionLabel}
          </Button>
        </CardContent>
      )}
    </Card>
  );
};