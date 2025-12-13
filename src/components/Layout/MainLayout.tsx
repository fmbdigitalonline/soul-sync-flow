import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SoulOrbAvatar } from "@/components/ui/avatar";
import { Home, Heart, MessageCircle, Sparkles, Settings, LogOut, Menu, X, Star, TestTube, User, PanelRightOpen } from "lucide-react";
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
import { PageContainer } from "./PageContainer";
import { ThreePanelLayout } from "./ThreePanelLayout";
import { ContextualToolsPanel } from "./ContextualToolsPanel";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const TOOLS_PANEL_COLLAPSED_STORAGE_KEY = "threePanelLayout:toolsPanelCollapsed";
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
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isToolsPanelCollapsed, setIsToolsPanelCollapsed] = useState(false);
  const {
    isMobile,
    isTablet
  } = useIsMobile();

  // Feature flag: enable desktop orb pointer follow (enabled by default unless explicitly disabled)
  const enableOrbPointerFollow = useMemo(
    () => import.meta.env.VITE_ENABLE_ORB_POINTER_FOLLOW !== "false",
    []
  );

  // Auto-collapse tools panel on tablets
  useEffect(() => {
    if (isTablet) {
      setIsToolsPanelCollapsed(true);
    }
  }, [isTablet]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedValue = localStorage.getItem(TOOLS_PANEL_COLLAPSED_STORAGE_KEY);
    if (storedValue !== null) {
      setIsToolsPanelCollapsed(storedValue === "true");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOOLS_PANEL_COLLAPSED_STORAGE_KEY, String(isToolsPanelCollapsed));
  }, [isToolsPanelCollapsed]);

  const toggleToolsPanel = useCallback(() => {
    setIsToolsPanelCollapsed(prev => !prev);
  }, []);
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

  // Add profile to navigation items for authenticated users
  const userNavItems = user ? [...baseNavItems, {
    to: "/profile",
    icon: User,
    label: t('nav.profile')
  }] : baseNavItems;

  // Add Admin Dashboard, Test Environment, and 360° Profile for admin users
  const navItems = user && isAdminUser(user) ? [...userNavItems, {
    to: "/admin",
    icon: Settings,
    label: t('nav.adminDashboard')
  }, {
    to: "/test-environment",
    icon: TestTube,
    label: t('nav.testEnvironment')
  }, {
    to: "/user-360",
    icon: User,
    label: t('nav.profile360')
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
                <span className="text-base font-semibold text-primary brand-text">
                  SoulSync
                </span>
              </Link>
              {/* Mobile actions on top right */}
              <div className="flex items-center space-x-2">
                {user && <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="rounded-xl">
                    {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </Button>}
                {user && <Sheet open={isToolsOpen} onOpenChange={setIsToolsOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-xl">
                        <PanelRightOpen className="h-5 w-5" />
                        <span className="sr-only">{t('contextualTools.toolsAndInsights')}</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full max-w-md p-0">
                      <SheetHeader className="px-6 pt-6">
                        <SheetTitle>{t('contextualTools.toolsAndInsights')}</SheetTitle>
                        <SheetDescription>{t('contextualTools.contextAwareAssistance')}</SheetDescription>
                      </SheetHeader>
                      <div className="max-h-[calc(100dvh-8rem)] overflow-y-auto">
                        <ContextualToolsPanel className="pt-2" />
                      </div>
                    </SheetContent>
                  </Sheet>}
                <LanguageSelector />
              </div>
            </div>
            
            {/* Mobile Menu Dropdown */}
            {isMenuOpen && user && <div className="bg-card/95 backdrop-blur-lg p-4 space-y-2 w-full shadow-sm">
                <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start text-muted-foreground rounded-xl text-sm">
                  <LogOut className="h-4 w-4 mr-3" />
                  {t('nav.signOut')}
                </Button>
              </div>}
          </div>

          <main className={cn("flex-1", isMobile ? "pb-4" : "pb-20")}>
            <PageContainer padding={isMobile ? "xs" : "sm"}>
              {children}
            </PageContainer>
          </main>

          {/* Contextual Tools access for mobile */}
          {user && <Sheet open={isToolsOpen} onOpenChange={setIsToolsOpen}>
              <SheetTrigger asChild>
                
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-md p-0">
                <SheetHeader className="px-6 pt-6">
                  <SheetTitle>{t('contextualTools.toolsAndInsights')}</SheetTitle>
                  <SheetDescription>{t('contextualTools.contextAwareAssistance')}</SheetDescription>
                </SheetHeader>
                <div className="max-h-[calc(100dvh-8rem)] overflow-y-auto">
                  <ContextualToolsPanel className="pt-2" />
                </div>
              </SheetContent>
            </Sheet>}

          {/* Mobile Bottom Navigation */}
          {user && <MobileNavigation />}
        </> : <>
          {/* Desktop/Tablet Global Top Bar */}
          {user && !hideNav && <TopBar showToolsToggle toolsPanelCollapsed={isToolsPanelCollapsed} onToolsPanelToggle={isTablet ? () => setIsToolsOpen(true) : toggleToolsPanel} />}
          
          <div className="flex flex-1 min-h-0 w-full">
            {shouldShowDesktopNav ?
        // Three-panel layout for authenticated desktop users (tablets use 2-panel with Sheet)
        <DesktopThreePanelLayout navItems={navItems} isActive={isActive} handleSignOut={handleSignOut} t={t} toolsPanelCollapsed={isTablet ? true : isToolsPanelCollapsed} onToolsPanelToggle={toggleToolsPanel} isTablet={isTablet}>
                {children}
              </DesktopThreePanelLayout> :
        // Fallback for unauthenticated or nav-hidden views
        <main className="flex-1 flex flex-col">
                <PageContainer className="flex-1">
                  {children}
                </PageContainer>
              </main>}
          </div>

          {/* Tools Sheet for Tablets (same as mobile) */}
          {user && isTablet && <Sheet open={isToolsOpen} onOpenChange={setIsToolsOpen}>
              <SheetContent side="right" className="w-full max-w-md p-0">
                <SheetHeader className="px-6 pt-6">
                  <SheetTitle>{t('contextualTools.toolsAndInsights')}</SheetTitle>
                  <SheetDescription>{t('contextualTools.contextAwareAssistance')}</SheetDescription>
                </SheetHeader>
                <div className="max-h-[calc(100dvh-8rem)] overflow-y-auto">
                  <ContextualToolsPanel className="pt-2" />
                </div>
              </SheetContent>
            </Sheet>}
        </>}

      {/* HACS Floating Orb - Always visible when authenticated */}
      {user && <FloatingHACSOrb enablePointerFollow={enableOrbPointerFollow} />}
    </div>;
};
// Desktop three-panel layout wrapper (Principle #8: Only Add)
interface DesktopThreePanelLayoutProps {
  children: React.ReactNode;
  navItems: Array<{
    to: string;
    icon: any;
    label: string;
  }>;
  isActive: (path: string) => boolean;
  handleSignOut: () => void;
  t: (key: string) => string;
  toolsPanelCollapsed: boolean;
  onToolsPanelToggle: () => void;
  isTablet?: boolean;
}
const DesktopThreePanelLayout: React.FC<DesktopThreePanelLayoutProps> = ({
  children,
  navItems,
  isActive,
  handleSignOut,
  t,
  toolsPanelCollapsed,
  onToolsPanelToggle,
  isTablet = false
}) => {
  return <ThreePanelLayout leftPanel={<aside className="h-full bg-card flex flex-col">
          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map(item => {
        const Icon = item.icon;
        return <Link key={item.to} to={item.to} className={cn("flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-150 text-sm font-medium", isActive(item.to) ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground")}>
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>;
      })}
          </nav>

          {/* User Actions */}
          <div className="p-3 border-t border-border/60">
            <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start text-muted-foreground rounded-lg hover:bg-muted/50 text-sm">
              <LogOut className="h-4 w-4 mr-3" />
              {t('nav.signOut')}
            </Button>
          </div>
        </aside>} centerPanel={<main className="h-full overflow-y-auto">
          <PageContainer className="h-full">
            {children}
          </PageContainer>
        </main>} rightPanel={<ContextualToolsPanel />} toolsPanelCollapsed={toolsPanelCollapsed} onToolsPanelToggle={onToolsPanelToggle} showInlineToolsToggle={false} isTablet={isTablet} />;
};
export default MainLayout;