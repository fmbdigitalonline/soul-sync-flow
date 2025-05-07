
import React from "react";
import { Link } from "react-router-dom";
import { Home, Star, MessageCircle, ListTodo, User } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const path = window.location.pathname;
  
  return (
    <div className="flex flex-col min-h-screen cosmic-bg">
      <main className="flex-1 pb-16">{children}</main>
      
      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center h-16 bg-white bg-opacity-80 backdrop-blur-md border-t border-border">
          <NavItem to="/" icon={Home} label="Home" active={path === "/"} />
          <NavItem to="/blueprint" icon={Star} label="Blueprint" active={path.startsWith("/blueprint")} />
          <NavItem to="/coach" icon={MessageCircle} label="Coach" active={path.startsWith("/coach")} />
          <NavItem to="/tasks" icon={ListTodo} label="Tasks" active={path.startsWith("/tasks")} />
          <NavItem to="/profile" icon={User} label="Profile" active={path.startsWith("/profile")} />
        </nav>
      )}
    </div>
  );
};

export default MainLayout;
