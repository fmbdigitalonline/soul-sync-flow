import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SoulOrbAvatar } from "@/components/ui/avatar";
import MainLayout from "@/components/Layout/MainLayout";
import { ArrowRight, LogIn, Heart, Sparkles, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import { useSoulOrb } from "@/contexts/SoulOrbContext";
import { useNavigate } from "react-router-dom";
import { CosmicCard } from "@/components/ui/cosmic-card";
import PersonalityDemo from "@/components/personality/PersonalityDemo";
import { useOptimizedBlueprintData } from "@/hooks/use-optimized-blueprint-data";
import { isAdminUser } from "@/utils/isAdminUser";
const Index = () => {
  const {
    user
  } = useAuth();
  const {
    speak
  } = useSoulOrb();
  const navigate = useNavigate();
  const [showDemo, setShowDemo] = useState(false);
  const {
    hasBlueprint,
    loading
  } = useOptimizedBlueprintData();
  const isAdmin = isAdminUser(user);

  // Memoize the welcome message logic to prevent re-renders
  const welcomeMessage = useMemo(() => {
    if (!user) return null;
    if (hasBlueprint) {
      return "Welcome back! Your Soul Blueprint is ready to explore.";
    } else {
      return "Welcome! Let's create your Soul Blueprint to get started.";
    }
  }, [user, hasBlueprint]);

  // Only speak welcome message once when user and blueprint data are loaded
  useEffect(() => {
    if (user && !loading && welcomeMessage) {
      // Add a small delay to prevent rapid-fire speaking
      const timer = setTimeout(() => {
        speak(welcomeMessage);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, loading, welcomeMessage, speak]);
  const handleGetStarted = () => {
    if (user) {
      if (hasBlueprint) {
        speak("Your Soul Blueprint is ready! Explore the features below.");
      } else {
        navigate("/onboarding");
      }
    } else {
      navigate("/auth");
    }
  };
  if (showDemo) {
    return <MainLayout>
        <div className="w-full min-h-screen p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <Button variant="ghost" onClick={() => setShowDemo(false)} className="mb-4 text-sm sm:text-base">
              ← Back to Home
            </Button>
          </div>
          <PersonalityDemo />
        </div>
      </MainLayout>;
  }
  return <MainLayout hideNav>
      <div className="w-full min-h-[90vh] flex flex-col justify-center p-4 sm:p-6">
        <div className="w-full max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6 sm:mb-8">
            <SoulOrbAvatar size="lg" className="h-20 w-20 sm:h-24 sm:w-24" />
          </div>
          
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-4">
            Welcome to <span className="gradient-text">Soul Sync</span>
          </h1>
          
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 px-4 text-muted-foreground">Live by Design, Understand Yourself and Achieve Through Alignment!</p>

          {user && <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              <Link to="/dreams" className="block">
                <CosmicCard className="p-3 sm:p-4 hover:scale-105 transition-transform cursor-pointer h-full">
                  <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-soul-purple mx-auto mb-2" />
                  <h3 className="font-semibold mb-1 text-sm sm:text-base">Dreams</h3>
                  <p className="text-xs text-muted-foreground">Journey to Success</p>
                </CosmicCard>
              </Link>
              
              <Link to="/spiritual-growth" className="block">
                <CosmicCard className="p-3 sm:p-4 hover:scale-105 transition-transform cursor-pointer h-full">
                  <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1 text-sm sm:text-base">Growth</h3>
                  <p className="text-xs text-muted-foreground">Inner Wisdom</p>
                </CosmicCard>
              </Link>
              
              <Link to="/coach" className="block">
                <CosmicCard className="p-3 sm:p-4 hover:scale-105 transition-transform cursor-pointer h-full">
                  <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1 text-sm sm:text-base">Companion</h3>
                  <p className="text-xs text-muted-foreground">AI Guide</p>
                </CosmicCard>
              </Link>
            </div>}

          {/* Show the demo button only for admin */}
          {isAdmin && <div className="mb-4 sm:mb-6 px-4">
              <Button variant="outline" onClick={() => setShowDemo(true)} className="mb-4 w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11">
                <Brain className="mr-2 h-4 w-4" />
                See How Personalization Works
              </Button>
            </div>}
          
          <div className="flex flex-col gap-3 sm:gap-4 px-4 max-w-md mx-auto">
            {user ? <>
                <Button size="lg" className="bg-soul-purple hover:bg-soul-purple/90 w-full h-12 text-base" onClick={handleGetStarted}>
                  Start Your Journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <Link to="/coach" className="block">
                  <Button size="lg" variant="outline" className="w-full h-12 text-base">
                    Chat with Soul Companion
                  </Button>
                </Link>
              </> : <>
                <Button size="lg" className="bg-soul-purple hover:bg-soul-purple/90 w-full h-12 text-base" onClick={handleGetStarted}>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <Link to="/auth" className="block">
                  <Button size="lg" variant="outline" className="w-full h-12 text-base">
                    Sign In
                    <LogIn className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </>}
          </div>
        </div>
      </div>
    </MainLayout>;
};
export default Index;