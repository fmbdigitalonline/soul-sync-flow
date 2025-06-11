import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SoulOrbAvatar } from "@/components/ui/avatar";
import MainLayout from "@/components/Layout/MainLayout";
import { ArrowRight, LogIn, Target, Heart, Sparkles, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import { useSoulOrb } from "@/contexts/SoulOrbContext";
import { blueprintService } from "@/services/blueprint-service";
import { useNavigate } from "react-router-dom";
import { CosmicCard } from "@/components/ui/cosmic-card";
import PersonalityDemo from "@/components/personality/PersonalityDemo";

const Index = () => {
  const { user } = useAuth();
  const { speak } = useSoulOrb();
  const navigate = useNavigate();
  const [showDemo, setShowDemo] = useState(false);
  
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
  
  if (showDemo) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setShowDemo(false)}
              className="mb-4"
            >
              ← Back to Home
            </Button>
          </div>
          <PersonalityDemo />
        </div>
      </MainLayout>
    );
  }
  
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

          {user && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
              <Link to="/tasks">
                <CosmicCard className="p-4 hover:scale-105 transition-transform cursor-pointer">
                  <Target className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Productivity</h3>
                  <p className="text-xs text-muted-foreground">Goals & Tasks</p>
                </CosmicCard>
              </Link>
              
              <Link to="/spiritual-growth">
                <CosmicCard className="p-4 hover:scale-105 transition-transform cursor-pointer">
                  <Heart className="h-8 w-8 text-soul-purple mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Growth</h3>
                  <p className="text-xs text-muted-foreground">Inner Wisdom</p>
                </CosmicCard>
              </Link>
              
              <Link to="/coach">
                <CosmicCard className="p-4 hover:scale-105 transition-transform cursor-pointer">
                  <Sparkles className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Companion</h3>
                  <p className="text-xs text-muted-foreground">Integrated Guide</p>
                </CosmicCard>
              </Link>
            </div>
          )}

          {/* Demo button for seeing how personalization works */}
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setShowDemo(true)}
              className="mb-4"
            >
              <Brain className="mr-2 h-4 w-4" />
              See How Personalization Works
            </Button>
          </div>
          
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
                    Chat with Soul Companion
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
