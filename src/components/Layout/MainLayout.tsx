
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MobileNavigation } from './MobileNavigation';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  hideNav?: boolean;
  children?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ hideNav = false, children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const shouldShowDesktopNav = user && !hideNav;
  const shouldShowMobileNav = user && !hideNav;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const navigationItems = [
    { name: 'Blueprint', href: '/blueprint' },
    { name: 'Coach', href: '/coach' },
    { name: 'Profile', href: '/profile' },
    { name: 'Design Analysis', href: '/design-analysis' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Navigation */}
      {shouldShowDesktopNav && (
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          <div className="flex-1 flex flex-col min-h-0 bg-surface border-r border-border-default">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-heading-lg font-cormorant text-primary">SoulSync</h1>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigationItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'text-text-main hover:bg-surface-elevated hover:text-primary group flex items-center px-2 py-2 text-body-md font-inter rounded-md transition-colors',
                      location.pathname === item.href && 'bg-surface-elevated text-primary border-l-4 border-primary'
                    )}
                  >
                    {item.name}
                  </a>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex bg-surface-elevated padding-md">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-text-main hover:text-primary"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation Header */}
      {shouldShowMobileNav && (
        <div className="md:hidden bg-surface border-b border-border-default">
          <div className="flex items-center justify-between padding-md">
            <h1 className="text-heading-md font-cormorant text-primary">SoulSync</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-text-main hover:text-primary"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                className="text-text-main hover:text-primary"
              >
                {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          {isMobileMenuOpen && (
            <nav className="border-t border-border-default bg-surface-elevated">
              {navigationItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'block px-4 py-3 text-body-md font-inter text-text-main hover:bg-surface-elevated hover:text-primary transition-colors',
                    location.pathname === item.href && 'bg-surface-elevated text-primary border-l-4 border-primary'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </nav>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className={cn(
        'flex flex-col min-h-screen',
        shouldShowDesktopNav ? 'md:pl-64' : '',
        shouldShowMobileNav ? 'pt-16 md:pt-0' : ''
      )}>
        <main className="flex-1">
          {children || <Outlet />}
        </main>
        {shouldShowMobileNav && <MobileNavigation />}
      </div>
    </div>
  );
};

export default MainLayout;
