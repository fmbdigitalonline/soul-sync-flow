
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
import { useTwinName } from "@/hooks/use-twin-name";
import { cn } from "@/lib/utils";

const MobileNavigation: React.FC = () => {
  const { t } = useLanguage();
  const { twinName } = useTwinName();
  const location = useLocation();

  // Chat-first navigation: companion is home. Dreams & growth are absorbed
  // into the conversation (their legacy routes redirect to /companion).
  const navItems = [
    { to: "/companion", icon: MessageCircle, label: twinName?.name || t('nav.companion') },
    { to: "/blueprint", icon: Star, label: t('nav.blueprint') },
    { to: "/profile", icon: User, label: t('nav.profile') },
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
      className="md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-lg"
      style={{
        zIndex: 9999,
        background: 'color-mix(in srgb, var(--ss-surface) 92%, transparent)',
        borderTop: '1px solid var(--ss-line-2)',
        paddingTop: '10px',
        paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
      }}
    >
      <div className="flex justify-around items-center max-w-md mx-auto px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-1 px-3 py-1 min-w-[64px] transition-colors"
              style={{ color: active ? 'var(--ss-accent)' : 'var(--ss-faint)' }}
            >
              <Icon className="h-[23px] w-[23px]" strokeWidth={active ? 2 : 1.7} />
              <span
                className="text-[11px] font-medium max-w-[76px] truncate"
                style={{ color: active ? 'var(--ss-accent)' : 'var(--ss-faint)' }}
              >
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
