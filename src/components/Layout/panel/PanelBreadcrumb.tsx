/**
 * PanelBreadcrumb — Slice J.
 * Renders a tiny back-crumb path inside the Coach panel when the user
 * drills into a milestone or task. Panel-local, never touches the router.
 */

import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface CrumbEntry {
  label: string;
  onClick: () => void;
}

interface PanelBreadcrumbProps {
  crumbs: CrumbEntry[];
  current: string;
}

export const PanelBreadcrumb: React.FC<PanelBreadcrumbProps> = ({ crumbs, current }) => {
  if (crumbs.length === 0) return null;
  const back = crumbs[crumbs.length - 1];
  return (
    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
      <Button
        variant="ghost"
        size="sm"
        onClick={back.onClick}
        className="h-6 px-1 -ml-1 text-[11px] hover:text-foreground"
      >
        <ChevronLeft className="h-3 w-3 mr-0.5" />
        {back.label}
      </Button>
      <span className="opacity-50">/</span>
      <span className="text-foreground truncate">{current}</span>
    </div>
  );
};

export default PanelBreadcrumb;