
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SoulOrbAvatar } from "@/components/ui/avatar";
import MainLayout from "@/components/Layout/MainLayout";
import { ArrowRight, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const { user, isNewUser } = useAuth();
  
  return (
    <MainLayout hideNav>
      <div className="container mx-auto flex flex-col min-h-[90vh] p-6 justify-center text-center">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center mb-8">
            <SoulOrbAvatar size="lg" className="h-24 w-24" />
          </div>
          
          <h1 className="font-display text-5xl font-bold mb-6">
            Welcome to <span className="gradient-text">Soul Guide</span>
          </h1>
          
          <p className="text-xl mb-8">
            Your personal guide to self-discovery and growth.
          </p>
          
          <div className="flex flex-col md:flex-row justify-center gap-4">
            {user ? (
              <>
                {isNewUser ? (
                  <Link to="/onboarding">
                    <Button size="lg" className="bg-soul-purple hover:bg-soul-purple/90">
                      Start Onboarding
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/blueprint">
                    <Button size="lg" className="bg-soul-purple hover:bg-soul-purple/90">
                      View Your Soul Blueprint
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
                
                <Link to="/coach">
                  <Button size="lg" variant="outline">
                    Chat with Soul Coach
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button size="lg" className="bg-soul-purple hover:bg-soul-purple/90">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                
                <Link to="/auth">
                  <Button size="lg" variant="outline">
                    Sign In
                    <LogIn className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
