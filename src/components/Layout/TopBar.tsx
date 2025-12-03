import React from "react";
import { Link } from "react-router-dom";
import { Search, Bell, PanelRightClose, PanelRightOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { LanguageSelector } from "@/components/ui/language-selector";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
interface TopBarProps {
  className?: string;
  showToolsToggle?: boolean;
  toolsPanelCollapsed?: boolean;
  onToolsPanelToggle?: () => void;
}
export const TopBar: React.FC<TopBarProps> = ({
  className,
  showToolsToggle,
  toolsPanelCollapsed = false,
  onToolsPanelToggle
}) => {
  const {
    user
  } = useAuth();
  const {
    t
  } = useLanguage();
  return <header className={cn("h-16 bg-card/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm", className)}>
      <div className="px-4 md:px-6 lg:px-8 w-full h-full grid grid-cols-3 items-center">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <span className="font-semibold text-sm sm:text-base">Soul Sync</span>
          </Link>
        </div>

        {/* Center: Search */}
        <div className="justify-self-center w-full max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t('common.search')} className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/50 h-10 rounded-xl" />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end space-x-4">
          <LanguageSelector />

          {showToolsToggle && <Button aria-label={t('contextualTools.toolsAndInsights')} variant="ghost" size="icon" onClick={() => onToolsPanelToggle?.()} className="rounded-xl h-10 w-10">
              {toolsPanelCollapsed ? <PanelRightOpen className="h-5 w-5" /> : <PanelRightClose className="h-5 w-5" />}
            </Button>}

          {/* Notifications */}
          <Button aria-label={t('common.notifications')} variant="ghost" size="icon" className="relative rounded-xl h-10 w-10">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full"></span>
          </Button>

          {/* User Profile */}
          {user && <div className="flex items-center space-x-2">
              
              <div className="hidden sm:block text-sm">
                <p className="font-medium">{user.email?.split('@')[0]}</p>
              </div>
            </div>}
        </div>
      </div>
    </header>;
};