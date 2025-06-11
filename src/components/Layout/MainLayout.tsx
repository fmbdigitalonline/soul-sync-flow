
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Home, Star, MessageCircle, ListTodo, User, Heart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useMode } from "@/contexts/ModeContext";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface MainLayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

const NavItem = ({
  to,
  icon: Icon,
  label,
  active,
  allowed,
  onClick,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  allowed: boolean;
  onClick?: () => void;
}) => {
  if (!allowed) {
    return (
      <div
        onClick={onClick}
        className="flex flex-col items-center justify-center p-2 text-xs font-medium text-muted-foreground/50 cursor-not-allowed"
      >
        <Icon className="h-6 w-6 mb-1" />
        <span>{label}</span>
      </div>
    );
  }

  return (
    <Link
      to={to}
      className={cn(
        "flex flex-col items-center justify-center p-2 text-xs font-medium transition-colors",
        active
          ? "text-soul-purple"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="h-6 w-6 mb-1" />
      <span>{label}</span>
    </Link>
  );
};

const MainLayout: React.FC<MainLayoutProps> = ({ children, hideNav = false }) => {
  const location = useLocation();
  const path = location.pathname;
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const { currentMode, modeConfig, isNavItemAllowed } = useMode();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleSignIn = () => {
    navigate('/auth');
  };

  const handleRestrictedNavClick = () => {
    if (modeConfig.restrictedMessage) {
      toast({
        title: "Navigation Restricted",
        description: modeConfig.restrictedMessage,
      });
    }
  };

  // Get mode-specific styling
  const getModeTheme = () => {
    switch (currentMode) {
      case 'productivity':
        return 'bg-green-50/30 border-green-200/20';
      case 'growth':
        return 'bg-purple-50/30 border-purple-200/20';
      case 'companion':
        return 'cosmic-bg border-soul-purple/20';
      default:
        return 'bg-background border-border';
    }
  };
  
  return (
    <div className={cn("flex flex-col min-h-screen", getModeTheme())}>
      {/* Header with Soul Companion always accessible */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex justify-between items-center h-16 px-4">
          <Link to="/" className="text-xl font-bold font-display gradient-text">
            Soul Guide
            {currentMode !== 'neutral' && (
              <span className="text-xs block font-normal text-muted-foreground">
                {modeConfig.name}
              </span>
            )}
          </Link>
          
          <div className="flex items-center gap-2">
            {/* Soul Companion - Always accessible */}
            {user && (
              <Link to="/coach">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">Companion</span>
                </Button>
              </Link>
            )}
            
            <LanguageSelector />
            {user ? (
              <Button variant="ghost" onClick={signOut}>{t('nav.signOut')}</Button>
            ) : (
              <Button onClick={handleSignIn}>{t('nav.signIn')}</Button>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1 pb-16">{children}</main>
      
      {!hideNav && (
        <nav className={cn(
          "fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center h-16 bg-white bg-opacity-80 backdrop-blur-md border-t border-border",
          getModeTheme()
        )}>
          <NavItem 
            to="/" 
            icon={Home} 
            label={t('nav.home')} 
            active={path === "/"} 
            allowed={isNavItemAllowed('/')}
          />
          <NavItem 
            to="/blueprint" 
            icon={Star} 
            label={t('nav.blueprint')} 
            active={path.startsWith("/blueprint")} 
            allowed={isNavItemAllowed('/blueprint')}
            onClick={!isNavItemAllowed('/blueprint') ? handleRestrictedNavClick : undefined}
          />
          <NavItem 
            to="/spiritual-growth" 
            icon={Heart} 
            label="Growth" 
            active={path.startsWith("/spiritual-growth")} 
            allowed={isNavItemAllowed('/spiritual-growth')}
            onClick={!isNavItemAllowed('/spiritual-growth') ? handleRestrictedNavClick : undefined}
          />
          <NavItem 
            to="/tasks" 
            icon={ListTodo} 
            label={t('nav.tasks')} 
            active={path.startsWith("/tasks")} 
            allowed={isNavItemAllowed('/tasks')}
            onClick={!isNavItemAllowed('/tasks') ? handleRestrictedNavClick : undefined}
          />
          <NavItem 
            to="/profile" 
            icon={User} 
            label={t('nav.profile')} 
            active={path.startsWith("/profile")} 
            allowed={isNavItemAllowed('/profile')}
            onClick={!isNavItemAllowed('/profile') ? handleRestrictedNavClick : undefined}
          />
        </nav>
      )}
    </div>
  );
};

export default MainLayout;
