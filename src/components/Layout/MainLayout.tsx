
import React, { useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SoulOrbAvatar } from "@/components/ui/avatar";
import { 
  Home, 
  Heart, 
  MessageCircle, 
  Sparkles, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Star,
  TestTube,
  User
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { LanguageSelector } from "@/components/ui/language-selector";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { isAdminUser } from "@/utils/isAdminUser";
import MobileNavigation from "./MobileNavigation";
import { FloatingHACSOrb } from "@/components/hacs/FloatingHACSOrb";

interface MainLayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, hideNav = false }) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: t('auth.signOutSuccess'),
        description: t('auth.signOutSuccessDescription'),
      });
      navigate('/');
    } catch (error) {
      toast({
        title: t('auth.signOutError'),
        description: t('auth.signOutErrorDescription'),
        variant: 'destructive',
      });
    }
  };

  const baseNavItems = [
    { to: "/", icon: Home, label: t('nav.home') },
    { to: "/blueprint", icon: Star, label: "Blueprint" },
    { to: "/dreams", icon: Heart, label: "Dreams" },
    { to: "/spiritual-growth", icon: Sparkles, label: t('nav.growth') },
    { to: "/companion", icon: MessageCircle, label: "Companion" },
  ];

  // Add profile and 360° profile to navigation items for authenticated users
  const userNavItems = user 
    ? [
        ...baseNavItems, 
        { to: "/profile", icon: User, label: "Profile" },
        { to: "/user-360", icon: User, label: "360° Profile" }
      ]
    : baseNavItems;

  // Add Admin Dashboard and Test Environment for admin users
  const navItems = user && isAdminUser(user) 
    ? [
        ...userNavItems, 
        { to: "/admin", icon: Settings, label: "Admin Dashboard" },
        { to: "/test-environment", icon: TestTube, label: "Test Environment" }
      ]
    : userNavItems;

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    // Handle legacy /coach route redirect to /companion
    if (path === "/companion" && location.pathname.startsWith("/coach")) return true;
    return false;
  };

  // Only show desktop navigation for authenticated users unless explicitly hidden
  const shouldShowDesktopNav = user && !hideNav;
  // Only show mobile navigation for authenticated users unless explicitly hidden
  const shouldShowMobileNav = user && !hideNav;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header - only show if not hiding nav and user is authenticated */}
      {shouldShowMobileNav && (
        <div className="md:hidden bg-background/80 backdrop-blur-lg border-b border-border sticky top-0 z-40 w-full">
          <div className="flex items-center justify-between p-4 w-full">
            <Link to="/" className="flex items-center space-x-2">
              <SoulOrbAvatar size="sm" />
              <span className="font-cormorant font-bold text-lg gradient-text brand-text">
                Soul Guide
              </span>
            </Link>
            {/* Theme and Language controls on mobile top right */}
            <div className="flex items-center space-x-1">
              <ThemeToggle size="icon" />
              <LanguageSelector />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden rounded-xl"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Menu Dropdown */}
          {isMenuOpen && (
            <div className="border-t border-border bg-card/95 backdrop-blur-lg p-4 space-y-2 w-full">
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full justify-start text-muted-foreground rounded-xl font-inter"
              >
                <LogOut className="h-5 w-5 mr-3" />
                {t('nav.signOut')}
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        {/* Desktop Sidebar - Only show for authenticated users unless hideNav is true */}
        {shouldShowDesktopNav && (
          <div className="hidden md:flex w-64 min-h-full bg-card/80 backdrop-blur-lg border-r border-border flex-col">
            {/* Logo and Language Selector */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-3">
                <SoulOrbAvatar size="md" />
                <span className="font-cormorant font-bold text-xl gradient-text brand-text">
                  Soul Guide
                </span>
              </Link>
              {/* Theme and Language controls on desktop sidebar */}
              <div className="flex items-center space-x-1">
                <ThemeToggle size="icon" />
                <LanguageSelector />
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-2xl transition-all duration-200 font-cormorant font-medium",
                      isActive(item.to)
                        ? "bg-gradient-to-r from-primary/10 to-accent/10 text-primary font-semibold border border-primary/20"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-primary"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Actions */}
            <div className="p-4 border-t border-border space-y-2">
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full justify-start text-muted-foreground rounded-xl hover:bg-accent/50 font-inter"
              >
                <LogOut className="h-5 w-5 mr-3" />
                {t('nav.signOut')}
              </Button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className={cn(
            "flex-1",
            shouldShowMobileNav ? "pb-20 md:pb-0" : "pb-0"
          )}>
            {children}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Only show for authenticated users unless hideNav is true */}
      {shouldShowMobileNav && <MobileNavigation />}

      {/* HACS Floating Orb - Only show for authenticated users */}
      {user && !hideNav && <FloatingHACSOrb />}
    </div>
  );
};

export default MainLayout;
