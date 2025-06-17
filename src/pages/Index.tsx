import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SoulOrbAvatar } from "@/components/ui/avatar";
import MainLayout from "@/components/Layout/MainLayout";
import { ArrowRight, LogIn, Heart, Sparkles, Brain, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useSoulOrb } from "@/contexts/SoulOrbContext";
import { useNavigate } from "react-router-dom";
import { CosmicCard } from "@/components/ui/cosmic-card";
import PersonalityDemo from "@/components/personality/PersonalityDemo";
import { useOptimizedBlueprintData } from "@/hooks/use-optimized-blueprint-data";
import { isAdminUser } from "@/utils/isAdminUser";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/ui/language-selector";
import { RotatingText } from "@/components/ui/rotating-text";

const Index = () => {
  const {
    user
  } = useAuth();
  const {
    speak
  } = useSoulOrb();
  const navigate = useNavigate();
  const [showDemo, setShowDemo] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const {
    hasBlueprint,
    loading,
    refetch
  } = useOptimizedBlueprintData();
  const isAdmin = isAdminUser(user);
  const { t, tArray, language } = useLanguage();

  // Refresh blueprint data when user changes or when returning from onboarding
  useEffect(() => {
    if (user && !loading) {
      console.log('🔄 Index: Refreshing blueprint data for user state check');
      refetch();
    }
  }, [user, refetch]);

  // Log current state for debugging
  useEffect(() => {
    console.log('🏠 Index Page State:', {
      hasUser: !!user,
      hasBlueprint,
      loading,
      userId: user?.id
    });
  }, [user, hasBlueprint, loading]);

  // Memoize the welcome message logic to prevent re-renders
  const welcomeMessage = useMemo(() => {
    if (!user) return null;
    if (hasBlueprint) {
      return t("index.welcomeBackReady");
    } else {
      return t("index.createToGetStarted");
    }
  }, [user, hasBlueprint, t]);

  // Get dynamic subtitle messages from translations using tArray for array translations
  const subtitleMessages = useMemo(() => {
    const messages = tArray("index.rotatingMessages");
    // If no array found, fallback to subtitle
    if (messages.length === 0) {
      const fallbackMessage = t("index.subtitle");
      return [fallbackMessage || "Discover your authentic path through personalized AI guidance and spiritual growth tools."];
    }
    return messages;
  }, [t, tArray, language]);

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
  
  const handleGetStarted = async () => {
    if (isNavigating) {
      console.log('🚫 Already navigating, ignoring click');
      return;
    }

    setIsNavigating(true);
    console.log('🎯 Get Started clicked:', { hasUser: !!user, hasBlueprint, loading });

    try {
      if (user) {
        if (hasBlueprint) {
          // User has blueprint - start tutorial mode
          console.log('📚 Starting tutorial mode for existing blueprint user');
          speak(t("index.startingTutorial"));
          navigate("/coach?tutorial=true");
        } else {
          console.log('🚀 Navigating to onboarding for new user');
          navigate("/onboarding");
        }
      } else {
        console.log('🔐 No user, navigating to auth');
        navigate("/auth");
      }
    } catch (error) {
      console.error('❌ Error in handleGetStarted:', error);
    } finally {
      // Reset navigation state after a delay
      setTimeout(() => setIsNavigating(false), 1000);
    }
  };
  
  if (showDemo) {
    return <MainLayout>
      <div className="w-full min-h-screen p-4 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <Button variant="ghost" onClick={() => setShowDemo(false)} className="mb-4 text-sm sm:text-base">
            {t("index.backToHome")}
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
          <SoulOrbAvatar size="lg" />
        </div>
        
        <h1 
          className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-4"
          dangerouslySetInnerHTML={{ __html: t('index.welcome') }}
        />
        
        <RotatingText 
          texts={subtitleMessages}
          className="text-lg sm:text-xl mb-6 sm:mb-8 px-4 text-muted-foreground min-h-[3.5rem] flex items-center justify-center"
          interval={4000}
        />

        {user && <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              <Link to="/dreams" className="block">
                <CosmicCard className="p-3 sm:p-4 hover:scale-105 transition-transform cursor-pointer h-full">
                  <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-soul-purple mx-auto mb-2" />
                  <h3 className="font-semibold mb-1 text-sm sm:text-base">{t("index.dreams")}</h3>
                  <p className="text-xs text-muted-foreground">{t("index.dreamsDesc")}</p>
                </CosmicCard>
              </Link>
              
              <Link to="/spiritual-growth" className="block">
                <CosmicCard className="p-3 sm:p-4 hover:scale-105 transition-transform cursor-pointer h-full">
                  <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1 text-sm sm:text-base">{t("index.growth")}</h3>
                  <p className="text-xs text-muted-foreground">{t("index.growthDesc")}</p>
                </CosmicCard>
              </Link>
              
              <Link to="/coach" className="block">
                <CosmicCard className="p-3 sm:p-4 hover:scale-105 transition-transform cursor-pointer h-full">
                  <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1 text-sm sm:text-base">{t("index.companion")}</h3>
                  <p className="text-xs text-muted-foreground">{t("index.companionDesc")}</p>
                </CosmicCard>
              </Link>
            </div>}

        {/* Show the demo button only for admin */}
        {isAdmin && <div className="mb-4 sm:mb-6 px-4">
          <Button variant="outline" onClick={() => setShowDemo(true)} className="mb-4 w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11">
            <Brain className="mr-2 h-4 w-4" />
            {t("index.demo")}
          </Button>
        </div>}
        
        {/* Language Selector - positioned above the action buttons */}
        <div className="flex justify-center mb-6 px-4">
          <LanguageSelector />
        </div>
        
        <div className="flex flex-col gap-3 sm:gap-4 px-4 max-w-md mx-auto">
          {user ? <>
            <Button 
              size="lg" 
              className="bg-soul-purple hover:bg-soul-purple/90 w-full h-12 text-base" 
              onClick={handleGetStarted}
              disabled={loading || isNavigating}
            >
              {isNavigating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t("index.loading")}
                </div>
              ) : hasBlueprint ? (
                <>
                  <BookOpen className="mr-2 h-4 w-4" />
                  {t("index.takeTour")}
                </>
              ) : (
                <>
                  {t("index.startJourney")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            
            <Link to="/coach" className="block">
              <Button size="lg" variant="outline" className="w-full h-12 text-base">
                {t("index.chatWithCompanion")}
              </Button>
            </Link>
          </> : <>
            <Button 
              size="lg" 
              className="bg-soul-purple hover:bg-soul-purple/90 w-full h-12 text-base" 
              onClick={handleGetStarted}
              disabled={isNavigating}
            >
              {isNavigating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t("index.loading")}
                </div>
              ) : (
                <>
                  {t("index.getStarted")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            
            <Link to="/auth" className="block">
              <Button size="lg" variant="outline" className="w-full h-12 text-base">
                {t("index.signIn")}
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
