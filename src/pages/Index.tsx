
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SoulOrbAvatar } from "@/components/ui/avatar";
import MainLayout from "@/components/Layout/MainLayout";
import { ArrowRight, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { useSoulOrb } from "@/contexts/SoulOrbContext";
import { useEffect } from "react";
import { blueprintService } from "@/services/blueprint-service";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user } = useAuth();
  const { speak } = useSoulOrb();
  const navigate = useNavigate();
  
  // Check if returning user has a blueprint
  useEffect(() => {
    const checkUserBlueprint = async () => {
      if (user) {
        try {
          const { data } = await blueprintService.getActiveBlueprintData();
          
          if (!data) {
            // Only suggest creating a blueprint if they don't have one
            speak("Welcome! Let's create your Soul Blueprint to get started.");
          } else {
            speak("Welcome back! Your Soul Blueprint is ready to explore.");
          }
        } catch (error) {
          console.error("Error checking blueprint:", error);
        }
      }
    };
    
    checkUserBlueprint();
  }, [user, speak]);
  
  const handleGetStarted = () => {
    if (user) {
      blueprintService.getActiveBlueprintData().then(({ data }) => {
        if (data) {
          // If they have a blueprint, go to blueprint page
          navigate("/blueprint");
        } else {
          // If no blueprint, start onboarding
          navigate("/onboarding");
        }
      });
    } else {
      // Not logged in, go to auth
      navigate("/auth");
    }
  };
  
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
                <Button 
                  size="lg" 
                  className="bg-soul-purple hover:bg-soul-purple/90"
                  onClick={handleGetStarted}
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <Link to="/coach">
                  <Button size="lg" variant="outline">
                    Chat with Soul Coach
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Button 
                  size="lg" 
                  className="bg-soul-purple hover:bg-soul-purple/90"
                  onClick={handleGetStarted}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
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
