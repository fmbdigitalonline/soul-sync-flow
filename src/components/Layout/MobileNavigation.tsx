
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Heart, 
  MessageCircle, 
  Sparkles, 
  Star,
  User
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const MobileNavigation: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();

  const navItems = [
    { to: "/", icon: Home, label: t('nav.home') },
    { to: "/blueprint", icon: Star, label: t('nav.blueprint') },
    { to: "/dreams", icon: Heart, label: t('nav.dreams') },
    { to: "/spiritual-growth", icon: Sparkles, label: t('nav.growth') },
    { to: "/companion", icon: MessageCircle, label: t('nav.companion') },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    // Handle legacy /coach route redirect to /companion
    if (path === "/companion" && location.pathname.startsWith("/coach")) return true;
    return false;
  };

  return (
    <div 
      className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg px-2 py-2 shadow-lg safe-area-inset-bottom"
      style={{ 
        zIndex: 9999,
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))'
      }}
    >
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-150 min-w-[60px] min-h-[56px]",
                active
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 transition-all duration-200",
                active ? "scale-110" : ""
              )} />
              <span className={cn(
                "text-xs font-medium transition-all duration-200",
                active ? "text-primary" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNavigation;
