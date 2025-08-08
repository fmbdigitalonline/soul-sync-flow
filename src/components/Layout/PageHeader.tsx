import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions, className }) => (
  <header className={cn("flex flex-col gap-2 md:flex-row md:items-end md:justify-between mb-4 md:mb-6", className)}>
    <div>
      <h1 className="text-3xl font-bold font-cormorant leading-tight">{title}</h1>
      {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
    </div>
    {actions && <div className="mt-2 md:mt-0">{actions}</div>}
  </header>
);

export { PageHeader };
export default PageHeader;
