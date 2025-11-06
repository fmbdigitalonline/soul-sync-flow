import React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "saas" | "saas-wide" | "content" | "full";
  padding?: "none" | "xs" | "sm" | "md" | "lg";
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
  maxWidth = "saas",
  padding = "md"
}) => {
  const maxWidthClasses = {
    saas: "w-full max-w-none sm:max-w-saas",
    "saas-wide": "w-full max-w-none sm:max-w-saas-wide", 
    content: "w-full max-w-none sm:max-w-content",
    full: "max-w-full"
  };

  const paddingClasses = {
    none: "",
    xs: "px-2 py-1",
    sm: "px-4 py-2 sm:py-6",
    md: "px-4 py-2 sm:px-8 sm:py-section",
    lg: "px-6 py-4 sm:px-12 sm:py-20"
  };

  return (
    <div className={cn(
      "mx-auto w-full",
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
};

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  className
}) => {
  return (
    <div className={cn("mb-8", className)}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-heading font-semibold text-foreground mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-body text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export const PageSection: React.FC<PageSectionProps> = ({
  children,
  className,
  title,
  subtitle
}) => {
  return (
    <section className={cn("mb-12", className)}>
      {title && (
        <div className="mb-6">
          <h2 className="text-subheading font-semibold text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="text-body text-muted-foreground mt-2">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
};

export default PageContainer;