import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SoulOrbAvatar } from "@/components/ui/avatar";
import { Home, Heart, MessageCircle, Sparkles, Settings, LogOut, Menu, X, Star, TestTube, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { LanguageSelector } from "@/components/ui/language-selector";
import { isAdminUser } from "@/utils/isAdminUser";
import MobileNavigation from "./MobileNavigation";
import { FloatingHACSOrb } from "@/components/hacs/FloatingHACSOrb";
import { TopBar } from "./TopBar";
import { useIsMobile } from "@/hooks/use-mobile";
interface MainLayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}
const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  hideNav = false
}) => {
  const {
    user,
    signOut
  } = useAuth();
  const {
    toast
  } = useToast();
  const {
    t
  } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    isMobile
  } = useIsMobile();
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: t('auth.signOutSuccess'),
        description: t('auth.signOutSuccessDescription')
      });
      navigate('/');
    } catch (error) {
      toast({
        title: t('auth.signOutError'),
        description: t('auth.signOutErrorDescription'),
        variant: 'destructive'
      });
    }
  };
  const baseNavItems = [{
    to: "/",
    icon: Home,
    label: t('nav.home')
  }, {
    to: "/blueprint",
    icon: Star,
    label: t('nav.blueprint')
  }, {
    to: "/dreams",
    icon: Heart,
    label: t('nav.dreams')
  }, {
    to: "/spiritual-growth",
    icon: Sparkles,
    label: t('nav.growth')
  }, {
    to: "/companion",
    icon: MessageCircle,
    label: t('nav.companion')
  }];

  // Add profile and 360° profile to navigation items for authenticated users
  const userNavItems = user ? [...baseNavItems, {
    to: "/profile",
    icon: User,
    label: t('nav.profile')
  }, {
    to: "/user-360",
    icon: User,
    label: t('nav.profile360')
  }] : baseNavItems;

  // Add Admin Dashboard and Test Environment for admin users
  const navItems = user && isAdminUser(user) ? [...userNavItems, {
    to: "/admin",
    icon: Settings,
    label: t('nav.adminDashboard')
  }, {
    to: "/test-environment",
    icon: TestTube,
    label: t('nav.testEnvironment')
  }] : userNavItems;
  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    // Handle legacy /coach route redirect to /companion
    if (path === "/companion" && location.pathname.startsWith("/coach")) return true;
    return false;
  };

  // Force desktop navigation to always show for authenticated users unless explicitly hidden
  const shouldShowDesktopNav = user && !hideNav;
  return <div className="min-h-screen bg-background w-full">
      {isMobile ? <>
          {/* Mobile Header */}
          <div className="bg-card/80 backdrop-blur-lg sticky top-0 z-40 w-full shadow-sm">
            <div className="flex items-center justify-between p-4 w-full">
              <Link to="/" className="flex items-center space-x-2">
                <SoulOrbAvatar size="sm" />
                <span className="font-cormorant font-bold text-lg gradient-text brand-text">
                  Soul Guide
                </span>
              </Link>
              {/* Language selector on mobile top right */}
              <div className="flex items-center space-x-2">
                <LanguageSelector />
                {user && <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="rounded-xl">
                    {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </Button>}
              </div>
            </div>
            
            {/* Mobile Menu Dropdown */}
            {isMenuOpen && user && <div className="bg-card/95 backdrop-blur-lg p-4 space-y-2 w-full shadow-sm">
                <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start text-muted-foreground rounded-xl font-inter">
                  <LogOut className="h-5 w-5 mr-3" />
                  {t('nav.signOut')}
                </Button>
              </div>}
          </div>

          {/* Mobile Main Content */}
          <main className="flex-1 pb-20">
            {children}
          </main>

          {/* Mobile Bottom Navigation */}
          {user && <MobileNavigation />}
        </> : <>
          {/* Desktop Global Top Bar */}
          {user && !hideNav && <TopBar />}
          
          <div className="flex flex-1 min-h-0">
            {/* Desktop Sidebar */}
            {shouldShowDesktopNav && <aside className="w-64 min-h-full bg-card/80 backdrop-blur-lg flex-col flex shadow-lg">
                {/* Logo Section */}
                

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                  {navItems.map(item => {
              const Icon = item.icon;
              return <Link key={item.to} to={item.to} className={cn("flex items-center space-x-3 p-3 rounded-2xl transition-all duration-200 font-cormorant font-medium", isActive(item.to) ? "bg-gradient-to-r from-primary/10 to-accent/10 text-primary font-semibold" : "text-muted-foreground hover:bg-accent/50 hover:text-primary")}>
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>;
            })}
                </nav>

                {/* User Actions */}
                <div className="p-4 space-y-2">
                  <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start text-muted-foreground rounded-xl hover:bg-accent/50 font-inter">
                    <LogOut className="h-5 w-5 mr-3" />
                    {t('nav.signOut')}
                  </Button>
                </div>
              </aside>}

            {/* Desktop Main Content */}
            <main className="flex-1 flex flex-col">
              {children}
            </main>
          </div>
        </>}

      {/* HACS Floating Orb - Always visible when authenticated */}
      {user && <FloatingHACSOrb />}
    </div>;
};
export default MainLayout;