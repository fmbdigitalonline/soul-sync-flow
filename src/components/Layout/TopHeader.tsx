
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const TopHeader: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign out error",
        description: "There was an error signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="hidden md:flex h-16 bg-background border-b border-border px-4 lg:px-6">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">SG</span>
            </div>
            <span className="font-heading font-bold text-xl text-foreground">
              Soul Guide
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-6">
          <Link
            to="/blueprint"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/blueprint") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Blueprint
          </Link>
          <Link
            to="/dreams"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/dreams") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Dreams
          </Link>
          <Link
            to="/spiritual-growth"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/spiritual-growth") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Growth
          </Link>
          <Link
            to="/companion"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/companion") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Companion
          </Link>
          <Link
            to="/tasks"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/tasks") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Tasks
          </Link>
        </nav>

        {/* Right side - Language selector and user menu */}
        <div className="flex items-center space-x-4">
          <LanguageSelector />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
