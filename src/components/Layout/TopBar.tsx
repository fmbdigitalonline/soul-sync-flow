import React from "react";
import { Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SoulOrbAvatar } from "@/components/ui/avatar";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface TopBarProps {
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ className }) => {
  const { user } = useAuth();

  return (
    <header className={cn(
      "h-16 bg-white/80 backdrop-blur-lg border-b border-border flex items-center justify-between px-8 sticky top-0 z-50",
      className
    )}>
      {/* Left: Search */}
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search..."
            className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/50 h-10 rounded-xl"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-4">
        {/* Language Selector */}
        <LanguageSelector />
        
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative rounded-xl h-10 w-10">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full"></span>
        </Button>

        {/* User Profile */}
        {user && (
          <div className="flex items-center space-x-2">
            <SoulOrbAvatar size="sm" />
            <div className="hidden sm:block text-sm">
              <p className="font-medium">{user.email?.split('@')[0]}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};