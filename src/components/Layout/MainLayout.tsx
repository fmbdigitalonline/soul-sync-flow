
import React from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { FloatingHACSOrb } from "@/components/hacs/FloatingHACSOrb";
import MobileNavigation from "./MobileNavigation";

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, className }) => {
  const { user } = useAuth();

  return (
    <div className={cn("min-h-screen bg-background text-foreground", className)}>
      {children}
      
      {/* Always show floating HACS orb when user is authenticated */}
      {user && (
        <FloatingHACSOrb />
      )}
      
      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
};

export default MainLayout;
