import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Home, Star, MessageCircle, ListTodo, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useLanguage } from "@/contexts/LanguageContext";

interface MainLayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

const NavItem = ({
  to,
  icon: Icon,
  label,
  active,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}) => (
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

const MainLayout: React.FC<MainLayoutProps> = ({ children, hideNav = false }) => {
  const location = useLocation();
  const path = location.pathname;
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const handleSignIn = () => {
    navigate('/auth');
  };
  
  return (
    <div className="flex flex-col min-h-screen cosmic-bg">
      {/* Simple header with auth actions */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex justify-between items-center h-16 px-4">
          <Link to="/" className="text-xl font-bold font-display gradient-text">
            Soul Guide
          </Link>
          
          <div className="flex items-center gap-2">
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
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center h-16 bg-white bg-opacity-80 backdrop-blur-md border-t border-border">
          <NavItem to="/" icon={Home} label={t('nav.home')} active={path === "/"} />
          <NavItem to="/blueprint" icon={Star} label={t('nav.blueprint')} active={path.startsWith("/blueprint")} />
          <NavItem to="/coach" icon={MessageCircle} label={t('nav.coach')} active={path.startsWith("/coach")} />
          <NavItem to="/tasks" icon={ListTodo} label={t('nav.tasks')} active={path.startsWith("/tasks")} />
          <NavItem to="/profile" icon={User} label={t('nav.profile')} active={path.startsWith("/profile")} />
        </nav>
      )}
    </div>
  );
};

export default MainLayout;
