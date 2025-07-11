
import React from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { FloatingHACSOrb } from "@/components/hacs/FloatingHACSOrb";
import TopHeader from "./TopHeader";
import MobileNavigation from "./MobileNavigation";

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, className }) => {
  const { user } = useAuth();

  return (
    <div className={cn("min-h-screen bg-background text-foreground", className)}>
      {/* Top Header for Desktop */}
      <TopHeader />
      
      {/* Main Content */}
      <main className="pb-20 md:pb-0">
        {children}
      </main>
      
      {/* Mobile Navigation */}
      <MobileNavigation />
      
      {/* Always show floating HACS orb when user is authenticated */}
      {user && (
        <FloatingHACSOrb />
      )}
    </div>
  );
};

export default MainLayout;
