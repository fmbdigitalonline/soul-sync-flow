
import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SoulOrbAvatar } from "@/components/ui/avatar";
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
  const {
    hasBlueprint,
    loading
  } = useOptimizedBlueprintData();
  const isAdmin = isAdminUser(user);
  const { t, language } = useLanguage();

  // Memoize the welcome message logic to prevent re-renders
  const welcomeMessage = useMemo(() => {
    if (!user) return null;
    if (hasBlueprint) {
      return t("index.welcomeBackReady");
    } else {
      return t("index.createToGetStarted");
    }
  }, [user, hasBlueprint, t]);

  // Get dynamic subtitle messages from translations - access the raw translation object
  const subtitleMessages = useMemo(() => {
    const messages = t("index.rotatingMessages");
    // Handle both string and array cases safely
    if (Array.isArray(messages)) {
      return messages;
    }
    // Fallback to a default message if translation fails
    return [t("index.subtitle") || "Discover your authentic path through personalized AI guidance and spiritual growth tools."];
  }, [t, language]);

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
        // User has blueprint - start tutorial mode
        speak(t("index.startingTutorial"));
        // For now, navigate to coach with tutorial mode
        // TODO: Implement proper tutorial mode
        navigate("/coach?tutorial=true");
      } else {
        navigate("/onboarding");
      }
    } else {
      navigate("/auth");
    }
  };
  
  if (showDemo) {
    return <div className="w-full min-h-screen p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <Button variant="ghost" onClick={() => setShowDemo(false)} className="mb-4 text-sm sm:text-base">
          {t("index.backToHome")}
        </Button>
      </div>
      <PersonalityDemo />
    </div>;
  }
  
  return <div className="w-full min-h-[90vh] flex flex-col justify-center p-4 sm:p-6 pb-24 md:pb-6">
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
          <Button size="lg" className="bg-soul-purple hover:bg-soul-purple/90 w-full h-12 text-base" onClick={handleGetStarted}>
            {hasBlueprint ? (
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
          <Button size="lg" className="bg-soul-purple hover:bg-soul-purple/90 w-full h-12 text-base" onClick={handleGetStarted}>
            {t("index.getStarted")}
            <ArrowRight className="ml-2 h-4 w-4" />
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
  </div>;
};

export default Index;
