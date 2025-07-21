
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
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const MobileNavigation: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  // Only show navigation if user is authenticated
  if (!user) {
    return null;
  }

  const navItems = [
    { to: "/", icon: Home, label: t('nav.home') },
    { to: "/blueprint", icon: Star, label: "Blueprint" },
    { to: "/dreams", icon: Heart, label: "Dreams" },
    { to: "/spiritual-growth", icon: Sparkles, label: t('nav.growth') },
    { to: "/companion", icon: MessageCircle, label: "Companion" },
    { to: "/user-360", icon: User, label: "360° Profile" },
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
      className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border-default px-spacing-2 py-spacing-2 shadow-overlay safe-area-inset-bottom"
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
                "flex flex-col items-center gap-spacing-1 p-spacing-2 rounded-shape-xl transition-all duration-200 min-w-[60px] min-h-[56px]",
                active
                  ? "bg-gradient-to-t from-primary/10 to-secondary/10 text-primary"
                  : "text-text-secondary hover:text-primary"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 transition-all duration-200",
                active ? "scale-110" : ""
              )} />
              <span className={cn(
                "text-caption-xs font-medium transition-all duration-200 font-display",
                active ? "text-primary" : "text-text-secondary"
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
